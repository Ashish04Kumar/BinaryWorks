// Glitch's eyes in the browser, ported from glitch/vision/: YOLO11n (people and objects) and MediaPipe's
// gesture recognizer run on the visitor's webcam, on their device. Nothing is uploaded.
// It only reports what it sees (people in view, a gesture that held); Umbrella's rules decide what happens.

import type { GestureRecognizer } from "@mediapipe/tasks-vision";

const ORT_WASM = "/vendor/ort/";
const MP_WASM = "/vendor/mediapipe";
const YOLO_MODEL = "/models/yolo11n-320.onnx";
const GESTURE_MODEL = "/models/gesture_recognizer.task";

const GESTURE_NAMES: Record<string, string> = {
  Open_Palm: "open_palm", Closed_Fist: "closed_fist", Pointing_Up: "pointing_up",
  Thumb_Up: "thumb_up", Thumb_Down: "thumb_down", Victory: "victory", ILoveYou: "i_love_you",
};

export type { Box } from "./yoloDecode";
import type { Box } from "./yoloDecode";

// ---------- steady signals (the same timings as Umbrella's companion/vision/steady.py) ----------
// A pose must hold a moment before it counts, fires once, and fires again only after the hand let go and a
// cooldown. Poses in `repeat` (fan faster/slower, lamp brighter/dimmer) fire again every REPEAT_EVERY seconds
// while held, marked as repeats. About 10 checks a second here, so 3 checks ≈ Umbrella's 5 frames at 15 fps.
const HOLD_FRAMES = 3, RELEASE_FRAMES = 3, COOLDOWN = 1.5, REPEAT_EVERY = 0.8;
class GestureGate {
  label: string | null = null;
  count = 0;
  fired: string | null = null;
  away = 0;
  lastFired = new Map<string, number>();
  constructor(private repeat: Set<string>) {}
  /** The pose on the frame it becomes steady, or again while a repeat pose is held; else null. */
  update(t: number, label: string | null): { name: string; repeat: boolean } | null {
    if (label === this.label) this.count += 1;
    else [this.label, this.count] = [label, 1];
    if (label !== this.fired) {
      this.away += 1;
      if (this.away >= RELEASE_FRAMES) this.fired = null; // the hand let go
    } else this.away = 0;
    if (label && this.count >= HOLD_FRAMES && this.fired !== label && t - (this.lastFired.get(label) ?? -1e9) >= COOLDOWN) {
      [this.fired, this.away] = [label, 0];
      this.lastFired.set(label, t);
      return { name: label, repeat: false };
    }
    if (label && label === this.fired && this.repeat.has(label) && t - (this.lastFired.get(label) ?? -1e9) >= REPEAT_EVERY) {
      this.lastFired.set(label, t); // still held: one more step
      return { name: label, repeat: true };
    }
    return null;
  }
}

// People in view: a new count is reported once it has held for a few checks (and a drop to nobody only after
// 2 s), so one missed frame does not empty the room. The first count is always reported.
const SEEN_CHECKS = 3, GONE_AFTER = 2.0;
class PeopleSteady {
  private reported: number | null = null;
  private candidate = -1;
  private hits = 0;
  private since = 0;
  update(t: number, n: number): number | null {
    if (n === this.reported) {
      this.candidate = -1;
      return null;
    }
    if (n !== this.candidate) [this.candidate, this.hits, this.since] = [n, 1, t];
    else this.hits += 1;
    if (this.hits >= SEEN_CHECKS && (n > 0 || t - this.since >= GONE_AFTER || this.reported === null)) {
      this.reported = n;
      return n;
    }
    return null;
  }
}

export type VisionEvents = {
  onFrame: (boxes: Box[], hands: { x: number; y: number; gesture: string | null }[]) => void;
  /** a pose that held (repeat = still held, one more step) */
  onGesture: (name: string, repeat: boolean) => void;
  /** how many people are in view, reported only when it changes */
  onPeople: (count: number) => void;
  onStatus: (text: string) => void;
};

export async function startVision(video: HTMLVideoElement, events: VisionEvents, repeat: Set<string>) {
  events.onStatus("starting camera…");
  const stream = await navigator.mediaDevices.getUserMedia({ video: { width: 640, height: 480, facingMode: "user" }, audio: false });
  video.srcObject = stream;
  video.muted = true;
  video.playsInline = true;
  await video.play();

  events.onStatus("loading YOLO11n and the gesture model…");
  // YOLO runs in a worker (off the main thread); the gesture model stays on the page
  const worker = new Worker(new URL("./yolo.worker.ts", import.meta.url), { type: "module" });
  const workerReady = new Promise<void>((resolve, reject) => {
    worker.onmessage = (e) => (e.data?.type === "ready" ? resolve() : e.data?.type === "error" ? reject(new Error(e.data.message)) : undefined);
  });
  worker.postMessage({ type: "init", wasmPaths: new URL(ORT_WASM, location.href).href, model: new URL(YOLO_MODEL, location.href).href });
  // MediaPipe prints routine info ("INFO: Created TensorFlow Lite XNNPACK delegate") through console.error;
  // drop just those lines while the camera runs so they don't read as errors
  const consoleError = console.error;
  console.error = (...args: unknown[]) => {
    if (typeof args[0] === "string" && /^INFO:|XNNPACK/.test(args[0])) return;
    consoleError(...args);
  };
  const mp = await import("@mediapipe/tasks-vision");
  const makeGestures = async (delegate: "GPU" | "CPU") =>
    mp.GestureRecognizer.createFromOptions(await mp.FilesetResolver.forVisionTasks(MP_WASM), {
      baseOptions: { modelAssetPath: GESTURE_MODEL, delegate },
      runningMode: "VIDEO",
      numHands: 2,
      minHandDetectionConfidence: 0.6,
      minHandPresenceConfidence: 0.5,
      minTrackingConfidence: 0.5,
    });
  // CPU on purpose: this model has CPU-only ops (MediaPipe falls back to XNNPACK anyway), and a GPU
  // delegate would only add WebGL contexts that compete with the 3D robot and its face
  const [gestures]: [GestureRecognizer, void] = await Promise.all([makeGestures("CPU"), workerReady]);
  events.onStatus("watching");

  const gate = new GestureGate(repeat);
  const people = new PeopleSteady();

  let boxes: Box[] = [];
  let lastHands: { x: number; y: number; gesture: string | null }[] = [];
  let running = true;
  let yoloBusy = false;
  let lastGestureCheck = 0;
  let lastYolo = 0;
  let lastSomeone = -1e9; // when a person or a hand was last seen (hands are checked often only then)
  let raf = 0;
  // Kept light so the page stays smooth: people ~6 checks a second (Umbrella's camera uses 5), hands ~10 a
  // second while someone is in view and ~3 a second when nobody is (enough to notice a hand coming up)
  const YOLO_EVERY_MS = 160;
  const GESTURE_EVERY_MS = 100;
  const GESTURE_IDLE_MS = 330;
  // Nothing runs while the preview is off screen or the tab is hidden
  let inView = true;
  const seen = new IntersectionObserver(([e]) => (inView = e.isIntersecting));
  seen.observe(video);

  // a new frame goes to the worker as soon as it has answered the last one
  worker.onmessage = (e) => {
    if (e.data?.type === "boxes") {
      boxes = e.data.boxes as Box[];
      if (boxes.some((b) => b.label === "person")) lastSomeone = performance.now();
      const seen = people.update(performance.now() / 1000, boxes.filter((b) => b.label === "person").length);
      if (seen !== null) events.onPeople(seen);
      events.onFrame(boxes, lastHands);
    } else if (e.data?.type === "error") console.error("yolo worker:", e.data.message);
    yoloBusy = false;
  };
  const sendFrame = () => {
    yoloBusy = true;
    createImageBitmap(video)
      .then((bitmap) => worker.postMessage({ type: "frame", bitmap }, [bitmap]))
      .catch(() => (yoloBusy = false));
  };

  const loop = () => {
    if (!running) return;
    raf = requestAnimationFrame(loop);
    if (video.readyState < 2 || !inView || document.hidden) return;
    const now = performance.now();
    if (!yoloBusy && now - lastYolo >= YOLO_EVERY_MS) {
      lastYolo = now;
      sendFrame();
    }
    const someone = now - lastSomeone < 2000;
    if (now - lastGestureCheck < (someone ? GESTURE_EVERY_MS : GESTURE_IDLE_MS)) return;
    lastGestureCheck = now;
    const result = gestures.recognizeForVideo(video, now);
    const t = now / 1000;
    const hands = result.landmarks.map((marks, i) => {
      const top = result.gestures[i]?.[0];
      const name = top && top.categoryName !== "None" && top.score > 0.5 ? GESTURE_NAMES[top.categoryName] ?? null : null;
      const wrist = marks[0];
      return { x: wrist.x, y: wrist.y, gesture: name };
    });
    if (hands.length) lastSomeone = now;
    const fired = gate.update(t, hands[0]?.gesture ?? null);
    if (fired) events.onGesture(fired.name, fired.repeat);
    lastHands = hands;
    events.onFrame(boxes, hands);
  };
  loop();

  return () => {
    running = false;
    cancelAnimationFrame(raf);
    seen.disconnect();
    stream.getTracks().forEach((t) => t.stop());
    gestures.close();
    worker.terminate();
    console.error = consoleError;
    video.srcObject = null;
  };
}
