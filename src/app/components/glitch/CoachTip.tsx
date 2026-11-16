"use client";
// A one-time pointer to a part of Glitch's demo the visitor may not notice: the part stays sharp and glows,
// the rest of the panel softly blurs (the veil in GlitchDemo), and a short note explains it. Shown once per browser.

export type Coach = "gestures" | "saved";

const KEY = (c: Coach) => `glitch-coach-${c}`;

/** True only the first time for this browser (and remembers that it was shown). */
export function firstTime(c: Coach) {
  try {
    if (localStorage.getItem(KEY(c))) return false;
    localStorage.setItem(KEY(c), "1");
    return true;
  } catch {
    return false; // storage blocked: don't nag every visit
  }
}

const CoachTip = ({ title, text, onDone }: { title: string; text: string; onDone: () => void }) => (
  <div className="bw-coach-tip absolute left-2 right-2 bottom-full mb-2.5 md:left-auto md:right-0 md:w-80 z-50" role="dialog" aria-label={title}>
    <p className="text-sm font-semibold mb-0.5">{title}</p>
    <p className="text-[13px] leading-snug opacity-80">{text}</p>
    <button type="button" onClick={onDone} className="mt-2 text-xs font-medium px-2.5 py-1 rounded-full cursor-pointer bw-coach-ok">
      Got it
    </button>
  </div>
);

export default CoachTip;
