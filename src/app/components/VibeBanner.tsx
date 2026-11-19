"use client";
// A thin strip above the navbar: Saarthi is vibe-coded, click to read about it and play with it.
// Hidden on the Saarthi page itself; closing it keeps it closed for this visit.
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { X } from "lucide-react";

const KEY = "bw-vibe-banner";

const VibeBanner = () => {
  const pathname = usePathname();
  const [closed, setClosed] = useState(true); // start closed so the server render and first paint agree
  useEffect(() => setClosed(sessionStorage.getItem(KEY) === "closed"), []);
  if (closed || pathname.startsWith("/saarthi")) return null;
  return (
    <div className="bw-vibe-banner relative z-[51] text-[12.5px] sm:text-[13px]">
      <Link href="/saarthi" className="flex items-center justify-center gap-2 sm:gap-3 px-10 py-2 text-center">
        <span className="bw-vibe-tag shrink-0 rounded-full px-2 py-0.5 text-[10.5px] font-bold tracking-wide uppercase">✨ Vibe-coded</span>
        <span className="truncate">
          <b>Saarthi</b>
          <span className="hidden sm:inline">: my animated desktop companion that reacts to how you work.</span>
          <span className="underline underline-offset-2 ml-1.5 font-medium">Play with it →</span>
        </span>
      </Link>
      <button
        aria-label="Hide this banner"
        onClick={() => { sessionStorage.setItem(KEY, "closed"); setClosed(true); }}
        className="absolute right-2 top-1/2 -translate-y-1/2 grid place-items-center w-7 h-7 rounded-full opacity-70 hover:opacity-100 cursor-pointer"
      >
        <X className="w-3.5 h-3.5" />
      </button>
    </div>
  );
};

export default VibeBanner;
