"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { Sun, Moon } from "lucide-react";
import { useTheme } from "@/app/providers/theme-provider";
import NavBots from "./NavBots";

const navItems = [
  { path: "/", label: "Home" },
  { path: "/projects", label: "Projects" },
  { path: "/lab", label: "AI lab" },
];

// The site's floating bar. Three things make it its own:
//  - the mark on the left is Glitch's eyes: they follow the cursor and blink now and then,
//  - one soft pill glides between the links as you hover them (the current page has just a small dot),
//  - scrolling tightens the bar and draws the page's progress along its bottom edge.
const Navigation = () => {
  const pathname = usePathname();
  const { theme, setTheme } = useTheme();
  const eyes = useRef<HTMLSpanElement>(null);
  const links = useRef<(HTMLAnchorElement | null)[]>([]);
  const progress = useRef<HTMLSpanElement>(null);
  const [hovered, setHovered] = useState<number | null>(null);
  const [pill, setPill] = useState<{ left: number; width: number } | null>(null);
  const [compact, setCompact] = useState(false);

  // the pill shows only while a link is hovered; the current page is marked by its dot alone
  const target = hovered;

  // the pill glides to the hovered link
  useEffect(() => {
    const place = () => {
      const el = target === null ? null : links.current[target];
      setPill(el ? { left: el.offsetLeft, width: el.offsetWidth } : null);
    };
    place();
    window.addEventListener("resize", place);
    return () => window.removeEventListener("resize", place);
  }, [target, compact]);

  // eyes follow the cursor; the bar tightens and shows progress on scroll
  useEffect(() => {
    let frame = 0;
    const onMove = (e: PointerEvent) => {
      if (frame || e.pointerType !== "mouse") return;
      frame = requestAnimationFrame(() => {
        frame = 0;
        const el = eyes.current;
        if (!el) return;
        const r = el.getBoundingClientRect();
        const dx = e.clientX - (r.left + r.width / 2), dy = e.clientY - (r.top + r.height / 2);
        const d = Math.hypot(dx, dy) || 1;
        const reach = Math.min(1, d / 160);
        el.style.setProperty("--ex", `${((dx / d) * 2.6 * reach).toFixed(2)}px`);
        el.style.setProperty("--ey", `${((dy / d) * 2.2 * reach).toFixed(2)}px`);
      });
    };
    const onScroll = () => {
      const max = document.documentElement.scrollHeight - window.innerHeight;
      setCompact(window.scrollY > 48);
      progress.current?.style.setProperty("--p", max > 0 ? String(Math.min(1, window.scrollY / max)) : "0");
    };
    onScroll();
    window.addEventListener("pointermove", onMove);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener("pointermove", onMove);
      window.removeEventListener("scroll", onScroll);
    };
  }, [pathname]);

  return (
    <div className="sticky top-0 z-50 px-3 sm:px-4 pt-3">
      <nav className={`bw-nav relative mx-auto flex items-center justify-between h-14 pl-2 pr-2 sm:pl-2.5 rounded-full border bw-rule theme-bg-nav backdrop-blur-xl backdrop-saturate-150 shadow-[var(--shadow-float)] ${compact ? "is-compact" : ""}`}>
        <Link href="/" data-nav-left aria-label="Ashish Kumar, home" className="group relative z-10 flex items-center gap-2.5 font-semibold tracking-tight theme-text-primary">
          <span ref={eyes} className="bw-nav-eyes relative grid place-items-center w-10 h-10 rounded-full" aria-hidden>
            <span className="flex gap-[5px]">
              <i />
              <i />
            </span>
          </span>
          <span className="bw-nav-name hidden sm:flex flex-col leading-tight">
            <span className="text-sm">Ashish Kumar</span>
            <span className="bw-nav-sub font-mono text-[10px] bw-muted font-normal">full-stack · genai</span>
          </span>
        </Link>

        <div data-nav-right className="relative z-10 flex items-center gap-1 text-sm">
          <div className="relative flex items-center" onMouseLeave={() => setHovered(null)}>
            {pill && <span className="bw-nav-pill absolute top-0 bottom-0 rounded-full" style={{ left: pill.left, width: pill.width }} aria-hidden />}
            {navItems.map((item, i) => {
              const active = pathname === item.path;
              return (
                <Link
                  key={item.path}
                  href={item.path}
                  ref={(el) => {
                    links.current[i] = el;
                  }}
                  onMouseEnter={() => setHovered(i)}
                  aria-current={active ? "page" : undefined}
                  className={`relative px-3.5 py-2 rounded-full transition-colors whitespace-nowrap ${
                    active ? "theme-text-primary font-medium" : "bw-muted hover:text-[var(--text-primary)]"
                  }`}
                >
                  {item.label}
                  {active && <span className="bw-nav-dot" aria-hidden />}
                </Link>
              );
            })}
          </div>

          <span className="w-px h-5 mx-1.5 bg-[var(--border-color)]" aria-hidden />

          {/* Light / dark toggle */}
          <button
            onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
            aria-label={`Switch to ${theme === "dark" ? "light" : "dark"} mode`}
            title={`Switch to ${theme === "dark" ? "light" : "dark"} mode`}
            className="bw-nav-theme grid place-items-center w-9 h-9 rounded-full bw-muted hover:text-[var(--text-primary)] bw-row-link cursor-pointer"
          >
            <span key={theme} className="bw-nav-theme-icon grid place-items-center">
              {theme === "dark" ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
            </span>
          </button>
        </div>

        {/* tiny robots wandering in the free space between the name and the links */}
        <NavBots />

        {/* how far down the page you are, along the bar's bottom edge */}
        <span className="bw-nav-progress" aria-hidden>
          <span ref={progress} />
        </span>
      </nav>
    </div>
  );
};

export default Navigation;
