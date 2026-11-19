"use client";
// A thin strip pinned to the top of every page: Saarthi is vibe-coded, click to read about it and play with it.
// It stays while you scroll; the navbar sits just below it (it reads the banner's height from --banner-h).
// Hidden on the Saarthi page itself; closing it keeps it closed for this visit.
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { X } from "lucide-react";

const KEY = "bw-vibe-banner";

const VibeBanner = () => {
  const pathname = usePathname();
  const bar = useRef<HTMLDivElement>(null);
  const [closed, setClosed] = useState(true); // start closed so the server render and first paint agree
  useEffect(() => setClosed(sessionStorage.getItem(KEY) === "closed"), []);
  const hidden = closed || pathname.startsWith("/saarthi");

  // tell the navbar how tall the banner is, so it sticks just below it
  useEffect(() => {
    const root = document.documentElement;
    const el = bar.current;
    if (hidden || !el) {
      root.style.setProperty("--banner-h", "0px");
      return;
    }
    const set = () => root.style.setProperty("--banner-h", `${el.offsetHeight}px`);
    set();
    const ro = new ResizeObserver(set);
    ro.observe(el);
    return () => ro.disconnect();
  }, [hidden]);

  if (hidden) return null;
  return (
    <div ref={bar} className="bw-vibe-banner sticky top-0 z-[60] text-[12.5px] sm:text-[13px]">
      <Link href="/saarthi" className="relative flex items-center justify-center gap-2 sm:gap-3 pl-3 pr-10 py-2 text-center">
        <span className="bw-vibe-dot shrink-0" aria-hidden />
        <span className="bw-vibe-tag shrink-0 rounded-full px-2 py-0.5 text-[10.5px] font-bold tracking-wide uppercase">✨ Vibe-coded</span>
        <span className="truncate">
          <b>Saarthi</b>
          <span className="hidden sm:inline opacity-90">: my animated desktop companion that reacts to how you work</span>
        </span>
        <span className="bw-vibe-cta shrink-0 rounded-full px-2.5 py-0.5 text-[11.5px] font-semibold">Play with it →</span>
      </Link>
      <button
        aria-label="Hide this banner"
        onClick={() => { sessionStorage.setItem(KEY, "closed"); setClosed(true); }}
        className="absolute right-2 top-1/2 -translate-y-1/2 grid place-items-center w-7 h-7 rounded-full opacity-70 hover:opacity-100 hover:bg-white/10 cursor-pointer"
      >
        <X className="w-3.5 h-3.5" />
      </button>
    </div>
  );
};

export default VibeBanner;
