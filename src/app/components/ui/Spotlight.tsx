"use client";
import { ReactNode, useRef } from "react";

// Hero wrapper: moves the accent glow (.bw-hero::after) to follow the cursor
const Spotlight = ({ children, className = "", id }: { children: ReactNode; className?: string; id?: string }) => {
  const ref = useRef<HTMLElement>(null);
  return (
    <section
      id={id}
      ref={ref}
      className={`bw-hero ${className}`}
      onPointerMove={(e) => {
        const el = ref.current;
        if (!el || e.pointerType !== "mouse") return;
        const r = el.getBoundingClientRect();
        el.style.setProperty("--mx", `${e.clientX - r.left}px`);
        el.style.setProperty("--my", `${e.clientY - r.top}px`);
      }}
    >
      {children}
    </section>
  );
};

export default Spotlight;
