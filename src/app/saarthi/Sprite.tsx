"use client";
// One of Saarthi's animations, played from its sprite strip (one strip per state, frames side by side).
import { useEffect, useRef } from "react";
import { SPRITES, type SpriteState } from "./sprites";

export default function Sprite({ state, flip = false, size = 190 }: { state: SpriteState; flip?: boolean; size?: number }) {
  const el = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const s = SPRITES[state];
    const start = performance.now();
    let raf = 0;
    const tick = (t: number) => {
      let f = Math.floor(((t - start) / 1000) * s.fps);
      f = s.loop ? f % s.frames : Math.min(f, s.frames - 1);
      if (el.current) el.current.style.backgroundPosition = `${-f * size}px 0`;
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [state, size]);
  const s = SPRITES[state];
  return (
    <div
      ref={el}
      aria-hidden
      style={{
        width: size,
        height: size,
        backgroundImage: `url(/saarthi/sprites/${state}.webp)`,
        backgroundSize: `${s.frames * size}px ${size}px`,
        backgroundRepeat: "no-repeat",
        transform: flip ? "scaleX(-1)" : undefined,
      }}
    />
  );
}
