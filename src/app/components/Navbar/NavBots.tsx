"use client";
// Tiny robots that wander along the navbar's bottom edge, in the empty space between the name and the links.
// They stroll, pause and turn around. Bring the mouse near and one stops, looks up at it and hops; get too
// close and it scoots away. Decoration only: hidden on small screens and for reduced motion.
import { useEffect, useRef } from "react";

type Bot = { x: number; dir: 1 | -1; speed: number; pause: number; flee: number; hopAt: number };

const COUNT = 3;
const NEAR = 70; // px: notices the cursor
const TOO_NEAR = 26; // px: runs away

const NavBots = () => {
  const layer = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = layer.current;
    const nav = el?.parentElement;
    if (!el || !nav || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const nodes = [...el.children] as HTMLElement[];
    const bots: Bot[] = nodes.map((_, i) => ({ x: -1, dir: i % 2 ? -1 : 1, speed: 9 + i * 4, pause: i * 1.5, flee: 0, hopAt: 0 }));
    let mouse: { x: number; y: number } | null = null;
    let zone = { left: 0, right: 0 };

    // the free stretch between the name (left) and the links (right)
    const measure = () => {
      const n = nav.getBoundingClientRect();
      const a = nav.querySelector("[data-nav-left]")?.getBoundingClientRect();
      const b = nav.querySelector("[data-nav-right]")?.getBoundingClientRect();
      zone = a && b ? { left: a.right - n.left + 14, right: b.left - n.left - 26 } : { left: 0, right: 0 };
    };
    const onMove = (e: PointerEvent) => {
      const n = nav.getBoundingClientRect();
      const inside = e.clientY > n.top - 24 && e.clientY < n.bottom + 30;
      mouse = inside && e.pointerType === "mouse" ? { x: e.clientX - n.left, y: e.clientY - n.top } : null;
    };
    measure();
    const ro = new ResizeObserver(measure);
    ro.observe(nav);
    window.addEventListener("pointermove", onMove);

    let raf = 0;
    let last = performance.now();
    const tick = (now: number) => {
      raf = requestAnimationFrame(tick);
      const dt = Math.min(0.05, (now - last) / 1000);
      last = now;
      const width = zone.right - zone.left;
      el.style.opacity = width > 90 ? "1" : "0";
      if (width <= 90 || document.hidden) return;
      bots.forEach((b, i) => {
        if (b.x < 0 || b.x > width) b.x = (width / (COUNT + 1)) * (i + 1); // (re)place after a resize
        const node = nodes[i];
        const dx = mouse ? mouse.x - (zone.left + b.x + 6) : Infinity;
        const near = Math.abs(dx) < NEAR;
        let walking = false;
        if (Math.abs(dx) < TOO_NEAR) {
          // too close: scoot away for a moment
          b.dir = dx > 0 ? -1 : 1;
          b.flee = 0.5;
        }
        if (b.flee > 0) {
          b.flee -= dt;
          b.x += b.dir * 70 * dt;
          walking = true;
        } else if (near) {
          // noticed: stop, face the cursor, hop once in a while
          b.dir = dx > 0 ? 1 : -1;
          if (now - b.hopAt > 1400) {
            b.hopAt = now;
            node.classList.remove("is-hop");
            void node.offsetWidth;
            node.classList.add("is-hop");
          }
        } else if (b.pause > 0) b.pause -= dt;
        else {
          b.x += b.dir * b.speed * dt;
          walking = true;
          if (Math.random() < dt * 0.12) b.pause = 1 + Math.random() * 2.5; // a breather
          if (Math.random() < dt * 0.05) b.dir = b.dir === 1 ? -1 : 1; // change of mind
        }
        if (b.x <= 0) [b.x, b.dir] = [0, 1];
        if (b.x >= width) [b.x, b.dir] = [width, -1];
        node.style.transform = `translateX(${(zone.left + b.x).toFixed(1)}px) scaleX(${b.dir})`;
        node.classList.toggle("is-walking", walking);
        node.classList.toggle("is-curious", near && b.flee <= 0);
      });
    };
    raf = requestAnimationFrame(tick);
    return () => {
      cancelAnimationFrame(raf);
      ro.disconnect();
      window.removeEventListener("pointermove", onMove);
    };
  }, []);

  return (
    <div ref={layer} className="bw-bots hidden md:block" aria-hidden>
      {Array.from({ length: COUNT }, (_, i) => (
        <span key={i} className="bw-bot">
          <i />
        </span>
      ))}
    </div>
  );
};

export default NavBots;
