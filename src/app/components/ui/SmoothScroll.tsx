"use client";
import { useEffect } from "react";
import Lenis from "lenis";
import "lenis/dist/lenis.css";
import { setLenis } from "@/lib/lenis";

// Smooth, slightly weighted page scrolling (Lenis). Off for people who prefer reduced motion.
// Scrollable boxes inside the page (chat logs, the action log) are marked data-scroll-box. They get the wheel
// only while they can really scroll; otherwise the page keeps scrolling smoothly (no hand-over that stutters).
const SmoothScroll = () => {
  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const lenis = new Lenis({
      lerp: 0.1,
      smoothWheel: true,
      wheelMultiplier: 1,
      prevent: (node) => node.hasAttribute?.("data-scroll-box") && node.scrollHeight > node.clientHeight + 1,
    });
    setLenis(lenis);
    let raf = 0;
    const frame = (t: number) => {
      lenis.raf(t);
      raf = requestAnimationFrame(frame);
    };
    raf = requestAnimationFrame(frame);
    return () => {
      cancelAnimationFrame(raf);
      setLenis(null);
      lenis.destroy();
    };
  }, []);
  return null;
};

export default SmoothScroll;
