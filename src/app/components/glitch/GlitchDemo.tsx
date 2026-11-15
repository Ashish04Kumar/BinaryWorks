"use client";
import { FormEvent, useCallback, useEffect, useRef, useState } from "react";
import { ArrowUp, Camera, CameraOff, Loader2, Mic, MicOff, Volume2, VolumeX } from "lucide-react";
import { createFace } from "./face.js";
import { createGlitchScene, type GestureStep, type GlitchScene } from "./scene";
import type { HomeScene } from "./home";
import { MoodModel, POSE, type Feeling } from "./mood";
import GlitchWorld from "./GlitchWorld";
import { applyActions, dueReminders, EMPTY_WORLD, isIot, loadWorld, nowString, saveWorld, type Action, type World } from "./world";
import { useTheme } from "@/app/providers/theme-provider";
import { startVision, type Box } from "./vision";
import { trackActivity } from "@/lib/track";

type Face = {
  canvas: HTMLCanvasElement;
  feed: (e: Record<string, unknown>) => void;
  start: (s: Record<string, unknown>) => void;
  stop: () => void;
  lookAt: (x: number, y: number) => void;
  setSurface: (s: { transparent?: boolean; deepen?: boolean }) => void;
};
type Msg = { role: "user" | "assistant"; content: string };
type View = "face" | "robot" | "home";

// glitch/motion/gestures.py
const REST: GestureStep[] = [[0, 0, 0]];
const STATES: Record<string, GestureStep[]> = {
  listening: [[0, -3, 0]],
  thinking: [[8, -6, 0]],
  speaking: REST,
  idle: REST,
  error: [[0, 10, 0]],
};
const MOODS: Record<string, GestureStep[]> = {
  happy: [[0, 8, 0.25], [0, -2, 0.25], [0, 6, 0.25], [0, 0, 0]],
  excited: [[0, 8, 0.15], [0, -4, 0.15], [0, 8, 0.15], [0, -4, 0.15], [0, 0, 0]],
  curious: [[10, -6, 1.2], [0, 0, 0]],
  playful: [[-10, 0, 0.2], [10, 0, 0.2], [-6, 0, 0.2], [0, 0, 0]],
  surprised: [[0, -12, 0.8], [0, 0, 0]],
  concerned: [[0, 8, 1.5], [0, 0, 0]],
  sad: [[0, 14, 2.0], [0, 4, 0]],
};

// glitch.toml [gestures]
const GESTURES: { name: string; icon: string; action: string; label: string }[] = [
  { name: "thumb_up", icon: "👍", action: "say:Yes", label: "yes" },
  { name: "thumb_down", icon: "👎", action: "say:No", label: "no" },
  { name: "victory", icon: "✌️", action: "muse", label: "a thought" },
  { name: "i_love_you", icon: "🤟", action: "react:happy", label: "happy" },
  { name: "pointing_up", icon: "☝️", action: "listen", label: "listen" },
  { name: "open_palm", icon: "✋", action: "quiet", label: "quiet" },
  { name: "closed_fist", icon: "✊", action: "lock", label: "follow me" },
];
const ACTION_FOR = Object.fromEntries(GESTURES.map((g) => [g.name, g.action]));
const TOGGLE_GESTURES = new Set(GESTURES.filter((g) => g.action === "quiet" || g.action === "lock").map((g) => g.name));

const MUSE_PROMPT = "(Nobody has said anything for a while. Share one short spontaneous thought, as yourself. Do not mention this instruction.)";

type SpeechRec = { lang: string; interimResults: boolean; start: () => void; stop: () => void; onresult: ((e: { results: { 0: { transcript: string } }[] }) => void) | null; onend: (() => void) | null; onerror: ((e: { error: string }) => void) | null };

const GlitchDemo = () => {
  const { theme } = useTheme();
  const stageRef = useRef<HTMLDivElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const overlayRef = useRef<HTMLCanvasElement>(null);
  const logRef = useRef<HTMLDivElement>(null);
  const faceRef = useRef<Face | null>(null);
  const sceneRef = useRef<GlitchScene | null>(null);
  const moodRef = useRef<MoodModel | null>(null);
  const stopVisionRef = useRef<(() => void) | null>(null);
  const recRef = useRef<SpeechRec | null>(null);
  const messagesRef = useRef<Msg[]>([]);
  const lockedRef = useRef(false);
  const followRef = useRef<[number, number] | null>(null);
  const personRef = useRef(false);   // a person is in view on the camera
  const quietRef = useRef(false);
  const voiceRef = useRef(true);
  const stateRef = useRef("idle");
  const worldRef = useRef<World>(EMPTY_WORLD);

  const [messages, setMessages] = useState<Msg[]>([]);
  const [input, setInput] = useState("");
  const [busy, setBusy] = useState(false);
  const [listening, setListening] = useState(false);
  const [voiceOn, setVoiceOn] = useState(true);
  const [quiet, setQuiet] = useState(false);
  const [locked, setLocked] = useState(false);
  const [feeling, setFeeling] = useState<Feeling | null>(null);
  const [hover, setHover] = useState<{ part: string; x: number; y: number } | null>(null);
  const [camOn, setCamOn] = useState(false);
  const [visionStatus, setVisionStatus] = useState("");
  const [seen, setSeen] = useState<string[]>([]);
  const [lastGesture, setLastGesture] = useState<string | null>(null);
  const [error, setError] = useState("");
  const [canListen, setCanListen] = useState(false);
  const [no3d, setNo3d] = useState(false);
  const no3dRef = useRef(false);
  const [world, setWorldState] = useState<World>(EMPTY_WORLD);
  const setWorld = useCallback((w: World) => {
    worldRef.current = w;
    setWorldState(w);
    saveWorld(w);
  }, []);
  const [view, setView] = useState<View>("face");
  const viewRef = useRef<View>("face");
  const faceHostRef = useRef<HTMLDivElement>(null);
  const homeHostRef = useRef<HTMLDivElement>(null);
  const miniFaceRef = useRef<HTMLDivElement>(null);
  const homeRef = useRef<HomeScene | null>(null);
  // phones show one of the lower panels at a time
  const [phonePanel, setPhonePanel] = useState<"saved" | "home" | "camera">("home");
  const [homeState, setHomeState] = useState<"idle" | "loading" | "ready" | "error">("idle");

  // ---------- body: face + 3D + mood ----------
  useEffect(() => {
    const stage = stageRef.current;
    if (!stage) return;
    const face = createFace(null, { size: 768 }) as unknown as Face;
    faceRef.current = face;
    face.start({ state: "idle" });

    const probe = document.createElement("canvas");
    const gl = probe.getContext("webgl2") || probe.getContext("webgl");
    gl?.getExtension("WEBGL_lose_context")?.loseContext();   // the probe only checks support; free it right away

    // Build (or rebuild) the 3D body. If the browser ever drops its WebGL context, build a fresh one.
    let disposed = false;
    const build = () => {
      sceneRef.current?.dispose();
      const scene = createGlitchScene(stage, face.canvas, (part, x, y) => setHover(part ? { part, x, y } : null));
      scene.onContextLost(() => {
        if (!disposed) setTimeout(build, 300);
      });
      const f = moodRef.current?.feeling();
      const pose = (f && POSE[f.name]) || [0, 0];
      scene.setRest(pose[0], pose[1]);
      scene.setPaused(viewRef.current !== "robot");
      sceneRef.current = scene;
    };
    const mood = new MoodModel();
    moodRef.current = mood;
    // Without WebGL (old devices, some sandboxes) Glitch still works in the face-only view
    try {
      if (!gl) throw new Error("no WebGL");
      build();
    } catch {
      no3dRef.current = true;
      setNo3d(true);
      setView("face");
    }

    const refreshFeeling = () => {
      const f = mood.feeling();
      setFeeling(f);
      face.feed({ type: "FeelingChanged", name: f.name });
      const pose = POSE[f.name] || [0, 0];
      sceneRef.current?.setRest(pose[0], pose[1]);
    };
    refreshFeeling();
    const feelingTimer = setInterval(refreshFeeling, 60_000);

    const W = window as unknown as { SpeechRecognition?: unknown; webkitSpeechRecognition?: unknown };
    setCanListen(Boolean(W.SpeechRecognition || W.webkitSpeechRecognition));

    return () => {
      disposed = true;
      clearInterval(feelingTimer);
      stopVisionRef.current?.();
      recRef.current?.stop();
      window.speechSynthesis?.cancel();
      sceneRef.current?.dispose();
      sceneRef.current = null;
      homeRef.current?.dispose();
      homeRef.current = null;
      face.canvas.remove();
      face.stop();
    };
  }, []);

  // Face view: the face canvas moves into the big round display and the 3D body stops drawing
  useEffect(() => {
    if (viewRef.current !== view) trackActivity("glitch view", { view });
    viewRef.current = view;
    const face = faceRef.current, host = faceHostRef.current;
    if (!face || !host) return;
    face.canvas.style.cssText = "width:100%;height:100%;display:block";
    if (view === "face") host.appendChild(face.canvas);
    else if (view === "home") miniFaceRef.current?.appendChild(face.canvas);   // Glitch watches from the corner
    else face.canvas.remove();   // still drawn offscreen as the 3D display's texture
    // face view: no screen, just the face on the page; robot and home views: on its black round display
    face.setSurface({ transparent: view === "face", deepen: view === "face" && theme !== "dark" });
    sceneRef.current?.setPaused(view !== "robot");
    homeRef.current?.setPaused(view !== "home");
  }, [view, theme]);

  // The smart-home room (~15 MB of models) starts loading as soon as the demo opens, whichever view is
  // showing, so it is ready by the time someone switches to Home or asks Glitch to turn something on.
  // It sits paused (not drawing) until the Home view is open.
  useEffect(() => {
    const host = homeHostRef.current;
    if (!host || no3dRef.current) return;
    let cancelled = false;
    // a moment's head start for the face and the chat before the big download begins
    const start = setTimeout(() => {
      setHomeState("loading");
      import("./home")
        .then(({ createHomeScene }) => createHomeScene(host, worldRef.current.devices))
        .then((home) => {
          if (cancelled) return home.dispose();
          homeRef.current = home;
          home.set(worldRef.current.devices);
          home.setPaused(viewRef.current !== "home");
          setHomeState("ready");
        })
        .catch(() => !cancelled && setHomeState("error"));
    }, 600);
    return () => {
      cancelled = true;
      clearTimeout(start);
    };
  }, []);

  useEffect(() => {
    homeRef.current?.set(world.devices);
  }, [world.devices]);

  useEffect(() => {
    logRef.current?.scrollTo({ top: logRef.current.scrollHeight, behavior: "smooth" });
  }, [messages, busy]);

  // Idle: the eyes (and gently the head) follow the visitor's cursor anywhere on the page
  useEffect(() => {
    let frame = 0;
    const onMove = (e: PointerEvent) => {
      if (e.pointerType !== "mouse" || frame) return;
      frame = requestAnimationFrame(() => {
        frame = 0;
        const stage = stageRef.current;
        if (!stage) return;
        const r = stage.getBoundingClientRect();
        const dx = Math.max(-1, Math.min(1, (e.clientX - (r.left + r.width / 2)) / (window.innerWidth / 2)));
        const dy = Math.max(-1, Math.min(1, (e.clientY - (r.top + r.height * 0.35)) / (window.innerHeight / 2)));
        if (personRef.current) return;   // a person on camera gets the gaze, not the mouse
        faceRef.current?.lookAt(dx, dy);
        if (stateRef.current === "idle") sceneRef.current?.lookAt([-dx * 26, dy * 14]);
      });
    };
    window.addEventListener("pointermove", onMove);
    return () => {
      window.removeEventListener("pointermove", onMove);
      cancelAnimationFrame(frame);
    };
  }, []);

  const brainState = useCallback((state: string) => {
    stateRef.current = state;
    if (state !== "idle") sceneRef.current?.lookAt(null);
    faceRef.current?.feed({ type: "BrainState", state });
    sceneRef.current?.play(STATES[state] || REST);
  }, []);

  // ---------- voice out (browser speech synthesis; the robot uses Sarvam / Piper) ----------
  const speak = useCallback(
    (text: string) => {
      const synth = window.speechSynthesis;
      if (!synth || !voiceRef.current || quietRef.current) {
        brainState("idle");
        return;
      }
      synth.cancel();
      const u = new SpeechSynthesisUtterance(text);
      const voices = synth.getVoices();
      u.voice = voices.find((v) => /en-IN/i.test(v.lang)) || voices.find((v) => /^en/i.test(v.lang)) || null;
      u.rate = 1.02;
      u.pitch = 1.15;
      let pulse: ReturnType<typeof setInterval> | null = null;
      u.onstart = () => {
        brainState("speaking");
        // the mouth follows a loudness level: approximate it while the browser talks
        pulse = setInterval(() => faceRef.current?.feed({ type: "VoiceLevel", level: 0.25 + Math.random() * 0.65 }), 90);
      };
      const end = () => {
        if (pulse) clearInterval(pulse);
        faceRef.current?.feed({ type: "VoiceLevel", level: 0 });
        brainState("idle");
      };
      u.onend = end;
      u.onerror = end;
      synth.speak(u);
    },
    [brainState]
  );

  // ---------- brain ----------
  const send = useCallback(
    async (text: string, { hidden = false } = {}) => {
      const content = text.trim();
      if (!content) return;
      setError("");
      const userMsg: Msg = { role: "user", content };
      const history = [...messagesRef.current, userMsg];
      if (!hidden) {
        messagesRef.current = history;
        setMessages(history);
        moodRef.current?.talkedTo();
      }
      setBusy(true);
      brainState("thinking");
      try {
        const res = await fetch("/api/glitch", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ messages: history, feeling: moodRef.current?.feeling().name, now: nowString(), world: worldRef.current }),
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || "Glitch glitched.");
        const actions: Action[] = Array.isArray(data.actions) ? data.actions : [];
        if (actions.length) setWorld(applyActions(worldRef.current, actions));
        // Which view fits this reply: an IoT command shows the room, any other talk brings the face back
        if (isIot(actions)) {
          if (!no3dRef.current) setView("home");
        } else if (viewRef.current === "home") setView("face");
        const reply: Msg = { role: "assistant", content: data.text };
        messagesRef.current = [...messagesRef.current, reply];
        setMessages(messagesRef.current);
        faceRef.current?.feed({ type: "Mood", expression: data.expression });
        sceneRef.current?.play(MOODS[data.expression] || REST);
        moodRef.current?.replied(data.expression);
        const f = moodRef.current?.feeling();
        if (f) {
          setFeeling(f);
          faceRef.current?.feed({ type: "FeelingChanged", name: f.name });
          const pose = POSE[f.name] || [0, 0];
          sceneRef.current?.setRest(pose[0], pose[1]);
        }
        speak(data.text);
      } catch (e) {
        brainState("error");
        setTimeout(() => brainState("idle"), 1500);
        setError(e instanceof Error ? e.message : "Glitch glitched.");
      } finally {
        setBusy(false);
      }
    },
    [brainState, speak, setWorld]
  );

  // Load what Glitch kept last time, and ring reminders when they come due
  useEffect(() => {
    setWorld(loadWorld());
    const timer = setInterval(() => {
      const due = dueReminders(worldRef.current);
      if (!due.length) return;
      setWorld({ ...worldRef.current, reminders: worldRef.current.reminders.map((r) => (due.some((d) => d.id === r.id) ? { ...r, done: true } : r)) });
      for (const r of due) {
        const text = `Reminder: ${r.text}.`;
        messagesRef.current = [...messagesRef.current, { role: "assistant", content: `⏰ ${text}` }];
        setMessages(messagesRef.current);
        faceRef.current?.feed({ type: "Mood", expression: "surprised" });
        sceneRef.current?.play(MOODS.surprised);
        speak(text);
      }
    }, 5000);
    return () => clearInterval(timer);
  }, [setWorld, speak]);

  // ---------- voice in (browser speech recognition; the robot uses Whisper) ----------
  const toggleMic = useCallback(() => {
    if (listening) {
      recRef.current?.stop();
      return;
    }
    if (quietRef.current) return;
    const W = window as unknown as { SpeechRecognition?: new () => SpeechRec; webkitSpeechRecognition?: new () => SpeechRec };
    const Rec = W.SpeechRecognition || W.webkitSpeechRecognition;
    if (!Rec) return;
    window.speechSynthesis?.cancel();
    const rec = new Rec();
    rec.lang = "en-IN";
    rec.interimResults = false;
    rec.onresult = (e) => {
      const said = e.results[0]?.[0]?.transcript;
      if (said) send(said);
    };
    rec.onerror = (e) => {
      if (e.error !== "no-speech" && e.error !== "aborted") setError(`Mic: ${e.error}`);
    };
    rec.onend = () => {
      setListening(false);
      if (!busy) brainState("idle");
    };
    recRef.current = rec;
    rec.start();
    setListening(true);
    brainState("listening");
  }, [listening, send, brainState, busy]);

  // ---------- gestures → Glitch's actions (glitch/vision/actions.py) ----------
  const act = useCallback(
    (gesture: string) => {
      const action = ACTION_FOR[gesture];
      if (!action) return;
      setLastGesture(gesture);
      setTimeout(() => setLastGesture((g) => (g === gesture ? null : g)), 2200);
      const [verb, arg = ""] = action.split(":");
      const whileQuiet = new Set(["quiet", "listen", "lock", "unlock"]);
      if (quietRef.current && !whileQuiet.has(verb)) return;
      if (verb === "say") send(arg);
      else if (verb === "muse") send(MUSE_PROMPT, { hidden: true });
      else if (verb === "react") {
        faceRef.current?.feed({ type: "Mood", expression: arg });
        sceneRef.current?.play(MOODS[arg] || REST);
      } else if (verb === "quiet") {
        quietRef.current = !quietRef.current;
        setQuiet(quietRef.current);
        if (quietRef.current) {
          window.speechSynthesis?.cancel();
          recRef.current?.stop();
        }
      } else if (verb === "listen") {
        quietRef.current = false;
        setQuiet(false);
        if (!listening) toggleMic();
      } else if (verb === "lock") {
        lockedRef.current = !lockedRef.current;
        setLocked(lockedRef.current);
        if (!lockedRef.current) {
          sceneRef.current?.follow(null);
          followRef.current = null;
        }
      }
    },
    [send, listening, toggleMic]
  );

  // ---------- camera ----------
  const drawOverlay = useCallback((boxes: Box[], hands: { x: number; y: number; gesture: string | null }[]) => {
    const canvas = overlayRef.current, video = videoRef.current;
    if (!canvas || !video) return;
    const w = (canvas.width = canvas.clientWidth), h = (canvas.height = canvas.clientHeight);
    const g = canvas.getContext("2d")!;
    g.clearRect(0, 0, w, h);
    g.font = "11px ui-monospace, monospace";
    for (const b of boxes) {
      const x = (1 - b.x - b.w) * w;   // the preview is mirrored
      g.strokeStyle = b.label === "person" ? "#5ce1ff" : "#ffd166";
      g.lineWidth = 2;
      g.strokeRect(x, b.y * h, b.w * w, b.h * h);
      const text = `${b.label} ${(b.score * 100).toFixed(0)}%`;
      g.fillStyle = "rgba(0,0,0,0.6)";
      g.fillRect(x, b.y * h - 15, g.measureText(text).width + 8, 15);
      g.fillStyle = "#fff";
      g.fillText(text, x + 4, b.y * h - 4);
    }
    for (const hand of hands) {
      g.fillStyle = "#7cffb2";
      g.beginPath();
      g.arc((1 - hand.x) * w, hand.y * h, 5, 0, Math.PI * 2);
      g.fill();
      if (hand.gesture) g.fillText(hand.gesture, (1 - hand.x) * w + 8, hand.y * h);
    }
  }, []);

  const toggleCamera = async () => {
    if (camOn) {
      stopVisionRef.current?.();
      stopVisionRef.current = null;
      setCamOn(false);
      setVisionStatus("");
      setSeen([]);
      sceneRef.current?.follow(null);
      followRef.current = null;
      personRef.current = false;
      return;
    }
    const video = videoRef.current;
    if (!video) return;
    setCamOn(true);
    try {
      stopVisionRef.current = await startVision(
        video,
        {
          onStatus: setVisionStatus,
          // only the gestures listed above do something (waves and swipes are ignored)
          onGesture: (g) => {
            if (ACTION_FOR[g]) act(g);
          },
          onFrame: (boxes, hands) => {
            drawOverlay(boxes, hands);
            setSeen((prev) => {
              const next = [...new Set(boxes.map((b) => b.label))].sort();
              return next.join() === prev.join() ? prev : next;
            });
            // With the camera on, Glitch follows a person (and only a person): aim at the biggest one,
            // a little above the middle of the box (glitch.toml aim = 0.2). Nobody in view: back to normal.
            {
              const people = boxes.filter((b) => b.label === "person").sort((a, b) => b.w * b.h - a.w * a.h);
              const p = people[0];
              personRef.current = Boolean(p);
              if (!p && followRef.current) {
                followRef.current = null;
                sceneRef.current?.follow(null);
              }
              if (p) {
                // where you are in the (mirrored) picture, -1..1 from the centre
                const dx = (1 - (p.x + p.w / 2) - 0.5) * 2;
                const dy = (p.y + 0.2 * p.h - 0.5) * 2;
                // light smoothing so box jitter doesn't twitch the head; the servo spring does the rest
                const prev = followRef.current;
                const sx = prev ? prev[0] + (dx - prev[0]) * 0.6 : dx;
                const sy = prev ? prev[1] + (dy - prev[1]) * 0.6 : dy;
                followRef.current = [sx, sy];
                sceneRef.current?.follow([-sx * 31 * 1.3, sy * 24 * 1.3]);   // half the camera's 62° x 48° view
                faceRef.current?.lookAt(sx, sy);
              }
            }
          },
        },
        TOGGLE_GESTURES
      );
    } catch (e) {
      console.error("Glitch vision:", e);
      setCamOn(false);
      setVisionStatus("");
      setError(e instanceof Error && e.name === "NotAllowedError" ? "Camera permission was denied." : "Couldn't start the camera.");
    }
  };

  const onSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (!input.trim() || busy) return;
    send(input);
    setInput("");
  };

  return (
    <div className="bw-panel overflow-hidden">
      <div className="grid grid-cols-[minmax(0,1fr)] lg:grid-cols-[minmax(0,1.2fr)_minmax(0,1fr)]">
        {/* body: full 3D robot, or the face alone */}
        <div className="relative border-b lg:border-b-0 lg:border-r bw-rule bw-grid">
          <div
            ref={stageRef}
            className={`h-[300px] sm:h-[380px] md:h-[480px] w-full ${view !== "robot" ? "invisible" : ""}`}
            aria-label="3D model of Glitch: a round display face on an MG996R pan-tilt bracket"
            role="img"
          />
          {/* face view: the round display on its own, large */}
          <div className={`absolute inset-0 grid place-items-center ${view === "face" ? "" : "hidden"}`}>
            <div ref={faceHostRef} className="w-[min(72%,260px)] sm:w-[min(88%,420px)] md:w-[min(82%,460px)] aspect-square" />
          </div>
          {/* home view: the smart-home room Glitch controls, with Glitch watching from the corner */}
          <div className={`absolute inset-0 ${view === "home" ? "" : "hidden"}`}>
            <div ref={homeHostRef} className="absolute inset-0" aria-label="3D living room with the lights, fan, AC and TV Glitch controls" role="img" />
            {homeState !== "ready" && (
              <div className="absolute inset-0 grid place-items-center">
                {homeState === "error" ? (
                  <p className="font-mono text-xs bw-muted">Couldn&apos;t load the room.</p>
                ) : (
                  <p role="status" className="flex flex-col items-center gap-3 font-mono text-xs bw-muted">
                    <Loader2 className="w-7 h-7 animate-spin bw-accent" />
                    Loading the room…
                  </p>
                )}
              </div>
            )}
            <div ref={miniFaceRef} className="absolute bottom-3 left-3 w-12 h-12 md:w-20 md:h-20 rounded-full overflow-hidden bg-black shadow-lg ring-1 ring-white/10" />
            <p className="absolute bottom-2 right-3 max-w-[70%] font-mono text-[8px] md:text-[10px] text-white/60 text-right leading-tight">
              Models (CC BY): room by dylanheyes, AC by maxsbond.work,
              <br />
              fan by lucaboechat, lamp by fchaolshi · Sketchfab
            </p>
          </div>
          {hover && view === "robot" && (
            <div
              className="pointer-events-none absolute z-10 px-2 py-1 rounded border bw-rule theme-bg-primary font-mono text-[11px] whitespace-nowrap shadow"
              style={{ left: hover.x + 14, top: hover.y + 10 }}
            >
              {hover.part}
            </div>
          )}
          <div className="absolute top-3 left-3 font-mono text-[11px] space-y-1">
            {feeling && (
              <p className="px-2 py-1 rounded theme-bg-primary border bw-rule">
                feels <span className="bw-accent">{feeling.name}</span>
              </p>
            )}
            {quiet && <p className="px-2 py-1 rounded theme-bg-primary border bw-rule text-amber-500">quiet mode</p>}
            {locked && <p className="px-2 py-1 rounded theme-bg-primary border bw-rule bw-accent">following you</p>}
          </div>
          {!no3d && (
            <div role="tablist" aria-label="View" className="absolute top-3 right-3 inline-flex p-0.5 rounded-full border bw-rule theme-bg-card text-xs">
              {(["face", "robot", "home"] as const).map((v) => (
                <button
                  key={v}
                  role="tab"
                  aria-selected={view === v}
                  onClick={() => setView(v)}
                  className={`px-3 py-1 rounded-full capitalize cursor-pointer transition-colors ${
                    view === v ? "bw-accent-bg" : "bw-muted hover:text-[var(--text-primary)]"
                  }`}
                >
                  {v}
                </button>
              ))}
            </div>
          )}
          {/* Hidden for now: live servo readout and the drag hint
          <div className="absolute bottom-3 left-3 right-3 flex flex-wrap justify-between gap-2 font-mono text-[11px] bw-muted pointer-events-none">
            <span className="px-2 py-1 rounded theme-bg-primary border bw-rule">
              PCA9685 · ch0 pan {angles.pan.toFixed(0)}° ({pulse(angles.pan)} µs) · ch1 tilt {angles.tilt.toFixed(0)}° ({pulse(angles.tilt)} µs)
            </span>
            <span className="hidden md:inline px-2 py-1 rounded theme-bg-primary border bw-rule">drag to look around · hover a part</span>
          </div>
          */}
        </div>

        {/* chat */}
        <div className="flex flex-col min-h-[260px] md:min-h-[480px] border-t lg:border-t-0 bw-rule">
          <div ref={logRef} data-lenis-prevent className="flex-1 overflow-y-auto px-4 py-4 space-y-3 max-h-[300px] md:max-h-[420px]" aria-live="polite">
            {messages.length === 0 && (
              <div className="h-full flex flex-col justify-center">
                <p className="text-base md:text-lg font-medium mb-1">Say hi to Glitch.</p>
                <p className="text-[13px] md:text-sm bw-muted mb-3 md:mb-4">
                  Talk or type. It can set reminders, keep lists and notes, and switch the lights, fan, AC and TV in its room.
                </p>
                {/* phones: one swipeable row of suggestions instead of a tall wrapped block */}
                <div data-lenis-prevent className="flex gap-2 overflow-x-auto -mx-4 px-4 pb-1 md:mx-0 md:px-0 md:flex-wrap md:overflow-visible [scrollbar-width:none]">
                  {["Remind me to drink water in 1 minute", "Add milk and eggs to my shopping list", "Turn on the lights and set the AC to 22", "Who made you?"].map((s) => (
                    <button key={s} onClick={() => send(s)} className="shrink-0 text-xs md:text-sm px-3 py-1.5 rounded-full border bw-rule bw-chip cursor-pointer">
                      {s}
                    </button>
                  ))}
                </div>
              </div>
            )}
            {messages.map((m, i) =>
              m.role === "user" ? (
                <div key={i} className="flex justify-end">
                  <p className="max-w-[85%] px-4 py-2 rounded-2xl rounded-br-sm bw-accent-bg text-white text-sm">{m.content}</p>
                </div>
              ) : (
                <p key={i} className="max-w-[90%] text-sm leading-relaxed">
                  <span className="font-mono text-[11px] bw-accent mr-2">glitch</span>
                  {m.content}
                </p>
              )
            )}
            {busy && (
              <p className="font-mono text-xs bw-muted">
                thinking<span className="bw-caret ml-1" />
              </p>
            )}
            {error && <p className="font-mono text-xs text-red-500">{error}</p>}
          </div>
          <form onSubmit={onSubmit} className="flex items-center gap-2 px-3 py-3 border-t bw-rule">
            <button
              type="button"
              onClick={toggleMic}
              disabled={!canListen || quiet}
              aria-label={listening ? "Stop listening" : "Talk to Glitch"}
              title={canListen ? "Talk to Glitch" : "Voice input needs Chrome or Edge"}
              className={`grid place-items-center w-9 h-9 rounded-full border cursor-pointer disabled:opacity-40 ${
                listening ? "bw-accent-bg text-white border-transparent animate-pulse" : "bw-rule bw-chip"
              }`}
            >
              {listening ? <Mic className="w-4 h-4" /> : <MicOff className="w-4 h-4" />}
            </button>
            <input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder={listening ? "listening…" : "Talk to Glitch…"}
              aria-label="Message Glitch"
              maxLength={600}
              className="flex-1 min-w-0 bg-transparent outline-none text-sm px-1 placeholder:opacity-50"
            />
            <button
              type="button"
              onClick={() => {
                voiceRef.current = !voiceRef.current;
                setVoiceOn(voiceRef.current);
                if (!voiceRef.current) window.speechSynthesis?.cancel();
              }}
              aria-label={voiceOn ? "Mute Glitch's voice" : "Unmute Glitch's voice"}
              className="grid place-items-center w-9 h-9 rounded-full border bw-rule bw-chip cursor-pointer"
            >
              {voiceOn ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
            </button>
            <button type="submit" disabled={busy || !input.trim()} aria-label="Send" className="grid place-items-center w-9 h-9 rounded-full bw-accent-bg text-white disabled:opacity-40 cursor-pointer">
              <ArrowUp className="w-4 h-4" />
            </button>
          </form>
        </div>
      </div>

      {/* phones: pick which lower panel to show */}
      <div role="tablist" aria-label="More" className="md:hidden flex gap-1 p-1.5 border-t bw-rule">
        {(
          [
            ["home", "Smart home"],
            ["saved", "Reminders & notes"],
            ["camera", "Camera"],
          ] as const
        ).map(([k, label]) => (
          <button
            key={k}
            role="tab"
            aria-selected={phonePanel === k}
            onClick={() => setPhonePanel(k)}
            className={`flex-1 py-2 rounded-lg text-xs font-medium cursor-pointer transition-colors ${phonePanel === k ? "bw-tint bw-accent" : "bw-muted"}`}
          >
            {label}
          </button>
        ))}
      </div>

      {/* what Glitch keeps for you, and the devices it controls */}
      <GlitchWorld
        phonePanel={phonePanel}
        world={world}
        onChange={(w) => {
          // switching a device by hand also shows it happen in the room
          if (!no3d && JSON.stringify(w.devices) !== JSON.stringify(world.devices)) setView("home");
          setWorld(w);
        }}
      />

      {/* eyes: camera + gestures */}
      <div className={`${phonePanel === "camera" ? "grid" : "hidden"} md:grid md:grid-cols-[17rem_1fr] border-t bw-rule`}>
        <div className="p-3 md:border-r bw-rule">
          <div className="relative aspect-video md:aspect-[4/3] rounded-md overflow-hidden border bw-rule bg-black/80">
            <video ref={videoRef} className={`absolute inset-0 w-full h-full object-cover -scale-x-100 ${camOn ? "" : "hidden"}`} />
            <canvas ref={overlayRef} className="absolute inset-0 w-full h-full" />
            {!camOn && (
              <div className="absolute inset-0 grid place-items-center text-center p-4 font-mono text-[11px] text-white/70">
                The camera stays on your device. Nothing is uploaded.
              </div>
            )}
          </div>
          <div className="flex gap-2 mt-2 font-mono text-xs">
            <button onClick={toggleCamera} className={`flex-1 flex items-center justify-center gap-1.5 px-2.5 py-1.5 rounded-full border cursor-pointer ${camOn ? "bw-accent bw-accent-border bw-tint" : "bw-rule bw-chip"}`}>
              {camOn ? <CameraOff className="w-3.5 h-3.5" /> : <Camera className="w-3.5 h-3.5" />}
              {camOn ? "camera off" : "camera on"}
            </button>
          </div>
          {camOn && (
            <p className="mt-2 font-mono text-[11px] bw-muted min-h-[1rem]">
              {visionStatus === "watching" ? `sees: ${seen.join(", ") || "nothing yet"}` : visionStatus}
            </p>
          )}
        </div>
        <div className="p-3">
          <p className="font-mono text-xs bw-muted mb-2">
            hand gestures {camOn ? "· show one to the camera, or tap" : "· tap one, or turn the camera on"}
          </p>
          <div className="grid grid-cols-4 sm:grid-cols-5 gap-1.5 md:gap-2">
            {GESTURES.map((g) => (
              <button
                key={g.name}
                onClick={() => act(g.name)}
                className={`flex flex-col items-center md:items-start gap-0.5 px-1.5 md:px-2.5 py-2 rounded-md border text-center md:text-left cursor-pointer transition-colors ${
                  lastGesture === g.name ? "bw-accent-border bw-tint" : "bw-rule bw-row-link"
                }`}
              >
                <span className="text-lg leading-none">{g.icon}</span>
                <span className="hidden md:inline font-mono text-[10px] bw-muted">{g.name}</span>
                <span className="text-[11px] md:text-xs">{g.label}</span>
              </button>
            ))}
          </div>
          <p className="mt-3 font-mono text-[11px] bw-muted">
            Same face, moods and gestures as the real robot. Your reminders, lists and notes stay in this browser, and
            the smart-home devices here are demo devices.
          </p>
        </div>
      </div>
    </div>
  );
};

export default GlitchDemo;
