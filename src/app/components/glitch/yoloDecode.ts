// YOLO11n output decoding, shared by the vision worker. Output is [1, 84, 2100]: 4 box values + 80 COCO scores.

const MIN_CONFIDENCE = 0.5;
const IOU = 0.45;

// COCO class names, in YOLO's order
const COCO =
  "person,bicycle,car,motorcycle,airplane,bus,train,truck,boat,traffic light,fire hydrant,stop sign,parking meter,bench,bird,cat,dog,horse,sheep,cow,elephant,bear,zebra,giraffe,backpack,umbrella,handbag,tie,suitcase,frisbee,skis,snowboard,sports ball,kite,baseball bat,baseball glove,skateboard,surfboard,tennis racket,bottle,wine glass,cup,fork,knife,spoon,bowl,banana,apple,sandwich,orange,broccoli,carrot,hot dog,pizza,donut,cake,chair,couch,potted plant,bed,dining table,toilet,tv,laptop,mouse,remote,keyboard,cell phone,microwave,oven,toaster,sink,refrigerator,book,clock,vase,scissors,teddy bear,hair drier,toothbrush".split(
    ","
  );

export type Box = { x: number; y: number; w: number; h: number; label: string; score: number };

// ---------- YOLO11n post-processing: [1, 84, 2100] -> boxes ----------
export function decode(out: Float32Array, n: number, scale: number, padX: number, padY: number, vw: number, vh: number): Box[] {
  const found: Box[] = [];
  for (let i = 0; i < n; i++) {
    let best = 0, cls = 0;
    for (let c = 0; c < 80; c++) {
      const s = out[(4 + c) * n + i];
      if (s > best) [best, cls] = [s, c];
    }
    if (best < MIN_CONFIDENCE) continue;
    const cx = (out[i] - padX) / scale, cy = (out[n + i] - padY) / scale;
    const w = out[2 * n + i] / scale, h = out[3 * n + i] / scale;
    found.push({ x: (cx - w / 2) / vw, y: (cy - h / 2) / vh, w: w / vw, h: h / vh, label: COCO[cls], score: best });
  }
  found.sort((a, b) => b.score - a.score);
  const iou = (a: Box, b: Box) => {
    const x1 = Math.max(a.x, b.x), y1 = Math.max(a.y, b.y);
    const x2 = Math.min(a.x + a.w, b.x + b.w), y2 = Math.min(a.y + a.h, b.y + b.h);
    const inter = Math.max(0, x2 - x1) * Math.max(0, y2 - y1);
    return inter / (a.w * a.h + b.w * b.h - inter);
  };
  const kept: Box[] = [];
  for (const b of found) if (!kept.some((k) => k.label === b.label && iou(k, b) > IOU)) kept.push(b);
  return kept;
}

