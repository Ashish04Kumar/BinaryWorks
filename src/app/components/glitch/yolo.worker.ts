/// <reference lib="webworker" />
// YOLO11n in a background thread, so inference never blocks the page (the face, the chat, the 3D body).
// The page sends a camera frame as an ImageBitmap; this worker letterboxes it, runs the model and returns boxes.

import * as ort from "onnxruntime-web/wasm";
import { decode } from "./yoloDecode";

const SIZE = 320;
let session: ort.InferenceSession | null = null;
const canvas = new OffscreenCanvas(SIZE, SIZE);
const ctx = canvas.getContext("2d", { willReadFrequently: true })!;
const input = new Float32Array(3 * SIZE * SIZE);

type InitMsg = { type: "init"; wasmPaths: string; model: string };
type FrameMsg = { type: "frame"; bitmap: ImageBitmap };

self.onmessage = async (e: MessageEvent<InitMsg | FrameMsg>) => {
  const msg = e.data;
  try {
    if (msg.type === "init") {
      ort.env.wasm.wasmPaths = msg.wasmPaths;
      ort.env.wasm.numThreads = 1;
      session = await ort.InferenceSession.create(msg.model, { executionProviders: ["wasm"], graphOptimizationLevel: "all" });
      self.postMessage({ type: "ready" });
      return;
    }
    if (msg.type === "frame") {
      const { bitmap } = msg;
      if (!session) {
        bitmap.close();
        return self.postMessage({ type: "boxes", boxes: [] });
      }
      const vw = bitmap.width, vh = bitmap.height;
      const scale = Math.min(SIZE / vw, SIZE / vh);
      const dw = vw * scale, dh = vh * scale, padX = (SIZE - dw) / 2, padY = (SIZE - dh) / 2;
      ctx.fillStyle = "rgb(114,114,114)"; // letterbox grey, as Ultralytics does
      ctx.fillRect(0, 0, SIZE, SIZE);
      ctx.drawImage(bitmap, padX, padY, dw, dh);
      bitmap.close();
      const px = ctx.getImageData(0, 0, SIZE, SIZE).data;
      const plane = SIZE * SIZE;
      for (let i = 0; i < plane; i++) {
        input[i] = px[i * 4] / 255;
        input[plane + i] = px[i * 4 + 1] / 255;
        input[2 * plane + i] = px[i * 4 + 2] / 255;
      }
      const result = await session.run({ [session.inputNames[0]]: new ort.Tensor("float32", input, [1, 3, SIZE, SIZE]) });
      const out = result[session.outputNames[0]];
      self.postMessage({ type: "boxes", boxes: decode(out.data as Float32Array, out.dims[2], scale, padX, padY, vw, vh) });
    }
  } catch (err) {
    self.postMessage({ type: "error", message: String(err) });
  }
};
