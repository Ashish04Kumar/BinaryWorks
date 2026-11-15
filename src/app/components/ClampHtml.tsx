"use client";
import { useEffect, useRef, useState } from "react";

// Long project write-ups on phones: show the first few lines with a fade and a "Read more" button.
// From md up (and for short texts) the whole thing shows.
const ClampHtml = ({ html, className = "" }: { html: string; className?: string }) => {
  const ref = useRef<HTMLDivElement>(null);
  const [open, setOpen] = useState(false);
  const [long, setLong] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const check = () => setLong(window.innerWidth < 768 && el.scrollHeight > 200);
    check();
    window.addEventListener("resize", check);
    return () => window.removeEventListener("resize", check);
  }, []);

  const clamped = long && !open;
  return (
    <div className="mb-5">
      <div
        ref={ref}
        className={`${className} ${clamped ? "max-h-[150px] overflow-hidden [mask-image:linear-gradient(to_bottom,black_55%,transparent)]" : ""}`}
        dangerouslySetInnerHTML={{ __html: html }}
      />
      {long && (
        <button onClick={() => setOpen((o) => !o)} className="mt-2 font-mono text-xs bw-accent cursor-pointer">
          {open ? "Show less ↑" : "Read more ↓"}
        </button>
      )}
    </div>
  );
};

export default ClampHtml;
