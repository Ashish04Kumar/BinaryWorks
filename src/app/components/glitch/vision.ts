// Glitch's eyes in the browser, ported from glitch/vision/: YOLO11n (people and objects) and MediaPipe's
// gesture recognizer run on the visitor's webcam, on their device. Nothing is uploaded.
// The thresholds (hold frames, cooldowns, swipe and wave rules) are the ones in steady.py and motion.py.

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

// ---------- steady.py: GestureGate ----------
// Frame counts scaled for ~12 checks a second, keeping steady.py's hold times (~0.25 s, ~0.65 s for toggles)
const HOLD_FRAMES = 3, RELEASE_FRAMES = 2, COOLDOWN = 1.5, TOGGLE_HOLD_FRAMES = 8, TOGGLE_COOLDOWN = 3.0;
class GestureGate {
  label: string | null = null;
  count = 0;
  fired: string | null = null;
  absent = 0;
  lastFired = new Map<string, number>();
  constructor(private toggles: Set<string>) {}
  update(t: number, label: string | null): string | null {
    if (label === this.label) this.count += 1;
    else [this.label, this.count] = [label, 1];
    if (label !== this.fired) {
      this.absent += 1;
      if (this.absent >= RELEASE_FRAMES) this.fired = null;
    } else this.absent = 0;
    const toggle = label !== null && this.toggles.has(label);
    const [hold, cooldown] = toggle ? [TOGGLE_HOLD_FRAMES, TOGGLE_COOLDOWN] : [HOLD_FRAMES, COOLDOWN];
    if (label && this.count >= hold && this.fired !== label && t - (this.lastFired.get(label) ?? -1e9) >= cooldown) {
      this.fired = label;
      this.absent = 0;
      this.lastFired.set(label, t);
      return label;
    }
    return null;
  }
}

// ---------- motion.py: swipes and a wave ----------
const SWIPE_DISTANCE = 0.25, SWIPE_TIME = 0.6, SWIPE_STRAIGHTNESS = 2.0, WAVE_TIME = 1.6, WAVE_TURNS = 3, WAVE_STEP = 0.03, MOTION_COOLDOWN = 1.0;
class MotionDetector {
  track: [number, number, number, boolean][] = [];
  quietUntil = 0;
  reset() {
    this.track = [];
  }
  update(t: number, x: number, y: number, openPalm: boolean): string | null {
    this.track.push([t, x, y, openPalm]);
    while (this.track.length && t - this.track[0][0] > WAVE_TIME) this.track.shift();
    if (t < this.quietUntil) return null;
    const found = this.swipe(t) || this.wave();
    if (found) {
      this.quietUntil = t + MOTION_COOLDOWN;
      this.track = [];
    }
    return found;
  }
  private swipe(t: number) {
    const recent = this.track.filter((p) => t - p[0] <= SWIPE_TIME);
    if (recent.length < 3) return null;
    const dx = recent[recent.length - 1][1] - recent[0][1];
    const dy = recent[recent.length - 1][2] - recent[0][2];
    if (Math.abs(dx) >= SWIPE_DISTANCE && Math.abs(dx) >= SWIPE_STRAIGHTNESS * Math.abs(dy)) return dx > 0 ? "swipe_right" : "swipe_left";
    if (Math.abs(dy) >= SWIPE_DISTANCE && Math.abs(dy) >= SWIPE_STRAIGHTNESS * Math.abs(dx)) return dy > 0 ? "swipe_down" : "swipe_up";
    return null;
  }
  private wave() {
    const points = this.track.filter((p) => p[3]);
    if (points.length < 6) return null;
    let turns = 0, direction = 0, anchor = points[0][1];
    for (const [, x] of points.slice(1)) {
      const step = x - anchor;
      if (Math.abs(step) < WAVE_STEP) continue;
      const now = step > 0 ? 1 : -1;
      if (direction && now !== direction) turns += 1;
      direction = now;
      anchor = x;
    }
    return turns >= WAVE_TURNS ? "wave" : null;
  }
}

export type VisionEvents = {
  onFrame: (boxes: Box[], hands: { x: number; y: number; gesture: string | null }[]) => void;
  onGesture: (name: string) => void;
  onStatus: (text: string) => void;
};

export async function startVision(video: HTMLVideoElement, events: VisionEvents, toggles: Set<string>) {
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

  const gate = new GestureGate(toggles);
  const motion = new MotionDetector();

  let boxes: Box[] = [];
  let lastHands: { x: number; y: number; gesture: string | null }[] = [];
  let running = true;
  let yoloBusy = false;
  let lastGestureCheck = 0;
  let raf = 0;
  // About 12 checks a second: plenty for gestures, and it leaves the page room to animate
  const GESTURE_EVERY_MS = 80;

  // a new frame goes to the worker as soon as it has answered the last one
  worker.onmessage = (e) => {
    if (e.data?.type === "boxes") {
      boxes = e.data.boxes as Box[];
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
    if (video.readyState < 2) return;
    const now = performance.now();
    // YOLO runs back to back: the next frame starts as soon as the last one is done
    if (!yoloBusy) sendFrame();
    if (now - lastGestureCheck < GESTURE_EVERY_MS) return;
    lastGestureCheck = now;
    const result = gestures.recognizeForVideo(video, now);
    const t = now / 1000;
    const hands = result.landmarks.map((marks, i) => {
      const top = result.gestures[i]?.[0];
      const name = top && top.categoryName !== "None" && top.score > 0.5 ? GESTURE_NAMES[top.categoryName] ?? null : null;
      const wrist = marks[0];
      return { x: wrist.x, y: wrist.y, gesture: name };
    });
    const main = hands[0];
    const fired = gate.update(t, main?.gesture ?? null);
    if (fired) events.onGesture(fired);
    if (main) {
      // the camera image is not mirrored, so a swipe to the person's right moves left in the picture
      const moved = motion.update(t, 1 - main.x, main.y, main.gesture === "open_palm");
      if (moved) events.onGesture(moved);
    } else motion.reset();
    lastHands = hands;
    events.onFrame(boxes, hands);
  };
  loop();

  return () => {
    running = false;
    cancelAnimationFrame(raf);
    stream.getTracks().forEach((t) => t.stop());
    gestures.close();
    worker.terminate();
    console.error = consoleError;
    video.srcObject = null;
  };
}
