"use client";
import { useEffect, useState } from "react";
import { scrollToElement } from "@/lib/scroll";

type Section = { id: string; label: string };

// Height of the floating navbar (top gap + h-14) plus breathing room
const NAVBAR_HEIGHT = 84;

// Fixed bottom-right indicator: shows the section in view and scrolls to one on click.
const SectionNav = ({ sections }: { sections: Section[] }) => {
  const [active, setActive] = useState(sections[0]?.id);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) setActive(entry.target.id);
        });
      },
      // A section counts as active while it crosses the middle of the viewport
      { rootMargin: "-45% 0px -50% 0px" }
    );
    sections.forEach(({ id }) => {
      const el = document.getElementById(id);
      if (el) observer.observe(el);
    });
    return () => observer.disconnect();
  }, [sections]);

  const goTo = (id: string) => {
    const el = document.getElementById(id);
    if (el) scrollToElement(el, NAVBAR_HEIGHT);
  };

  const activeIndex = sections.findIndex((s) => s.id === active);

  return (
    <nav
      aria-label="Page sections"
      // Bottom-center pill on smaller screens; vertical trace in the right gutter on xl
      className="fixed z-40 font-mono text-xs bottom-4 left-1/2 -translate-x-1/2 px-4 py-2 rounded-full border bw-rule bg-[var(--bg-nav)] backdrop-blur shadow-lg xl:left-auto xl:translate-x-0 xl:right-6 xl:bottom-6 xl:p-0 xl:border-0 xl:bg-transparent xl:shadow-none xl:backdrop-blur-none"
    >
      <ol className="relative flex flex-row items-center gap-3 xl:flex-col xl:items-end">
        {/* edge connecting the nodes */}
        <span
          aria-hidden
          className="absolute left-1 right-1 top-1/2 h-px xl:left-auto xl:right-[5px] xl:top-1 xl:bottom-1 xl:h-auto xl:w-px"
          style={{ background: "var(--border-color)" }}
        />
        {sections.map(({ id, label }, i) => {
          const isActive = i === activeIndex;
          const visited = i < activeIndex;
          return (
            <li key={id} className="relative">
              <button
                onClick={() => goTo(id)}
                aria-current={isActive ? "true" : undefined}
                aria-label={label}
                className="group flex items-center gap-2 cursor-pointer"
              >
                <span
                  className={`px-1.5 py-0.5 rounded theme-bg-primary whitespace-nowrap transition-opacity duration-200 ${
                    isActive
                      ? "bw-accent"
                      : "hidden xl:inline opacity-0 xl:group-hover:opacity-100 bw-muted"
                  }`}
                >
                  {label}
                </span>
                <span
                  className={`relative block w-[11px] h-[11px] rounded-full border-2 transition-all duration-200 ${
                    isActive || visited ? "bw-accent-border bw-accent-fill" : "bw-rule-strong theme-bg-card"
                  } ${isActive ? "scale-125 ring-4 ring-[color-mix(in_srgb,var(--bw-accent)_25%,transparent)]" : ""}`}
                />
              </button>
            </li>
          );
        })}
      </ol>
    </nav>
  );
};

export default SectionNav;
