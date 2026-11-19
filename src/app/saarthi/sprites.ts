// Generated from Saarthi's skin.json (frames packed into one strip per state by a build script).
export const SPRITE_SIZE = 192;
export type SpriteState = "idle" | "typing_fast" | "typing_slow" | "scrolling" | "watching" | "afk" | "sleeping" | "waking" | "happy" | "stretch" | "alert" | "poked" | "giggle" | "break" | "breathe" | "walk" | "eat" | "think";
export const SPRITES: Record<SpriteState, { frames: number; fps: number; loop: boolean }> = {
  idle: { frames: 24, fps: 10, loop: true },
  typing_fast: { frames: 12, fps: 12, loop: true },
  typing_slow: { frames: 20, fps: 8, loop: true },
  scrolling: { frames: 16, fps: 8, loop: true },
  watching: { frames: 24, fps: 8, loop: true },
  afk: { frames: 16, fps: 6, loop: true },
  sleeping: { frames: 18, fps: 6, loop: true },
  waking: { frames: 14, fps: 12, loop: false },
  happy: { frames: 16, fps: 12, loop: true },
  stretch: { frames: 24, fps: 8, loop: true },
  alert: { frames: 12, fps: 8, loop: true },
  poked: { frames: 16, fps: 10, loop: false },
  giggle: { frames: 12, fps: 12, loop: true },
  break: { frames: 24, fps: 6, loop: true },
  breathe: { frames: 48, fps: 4, loop: true },
  walk: { frames: 16, fps: 12, loop: true },
  eat: { frames: 24, fps: 8, loop: true },
  think: { frames: 20, fps: 6, loop: true },
};
