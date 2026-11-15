// Copies the in-browser vision runtimes (ONNX Runtime for YOLO, MediaPipe for gestures) from node_modules
// into public/vendor, so the Glitch demo never depends on a CDN being reachable. Runs on every install.
import { cpSync, mkdirSync, existsSync } from "node:fs";

const files = [
  ["node_modules/onnxruntime-web/dist/ort-wasm-simd-threaded.mjs", "public/vendor/ort/ort-wasm-simd-threaded.mjs"],
  ["node_modules/onnxruntime-web/dist/ort-wasm-simd-threaded.wasm", "public/vendor/ort/ort-wasm-simd-threaded.wasm"],
  ["node_modules/@mediapipe/tasks-vision/wasm/vision_wasm_internal.js", "public/vendor/mediapipe/vision_wasm_internal.js"],
  ["node_modules/@mediapipe/tasks-vision/wasm/vision_wasm_internal.wasm", "public/vendor/mediapipe/vision_wasm_internal.wasm"],
  ["node_modules/@mediapipe/tasks-vision/wasm/vision_wasm_nosimd_internal.js", "public/vendor/mediapipe/vision_wasm_nosimd_internal.js"],
  ["node_modules/@mediapipe/tasks-vision/wasm/vision_wasm_nosimd_internal.wasm", "public/vendor/mediapipe/vision_wasm_nosimd_internal.wasm"],
];

for (const [from, to] of files) {
  if (!existsSync(from)) {
    console.warn(`copy-vision-runtime: missing ${from}`);
    continue;
  }
  mkdirSync(to.slice(0, to.lastIndexOf("/")), { recursive: true });
  cpSync(from, to);
}
console.log("copy-vision-runtime: done");
