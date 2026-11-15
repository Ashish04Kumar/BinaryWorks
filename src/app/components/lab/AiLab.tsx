"use client";
import { useEffect, useState } from "react";
import dynamic from "next/dynamic";
import ScholarLensDemo from "./ScholarLensDemo";
import { scrollToElement } from "@/lib/scroll";

// three.js, the face and the vision models load only when the Glitch tab is opened
const GlitchDemo = dynamic(() => import("../glitch/GlitchDemo"), {
  ssr: false,
  loading: () => <div className="h-[480px] grid place-items-center font-mono text-xs bw-muted border bw-rule rounded-lg">booting Glitch…</div>,
});

const TABS = [
  { key: "glitch", name: "Glitch", note: "talk to my desk robot" },
  { key: "scholarlens", name: "Agentic RAG", note: "ask a research paper" },
] as const;

const AiLab = () => {
  const [tab, setTab] = useState<(typeof TABS)[number]["key"]>("glitch");
  // The second demo is easy to miss next to the default one: a light shimmer passes over it until it has been opened once
  const [seenRag, setSeenRag] = useState(false);
  useEffect(() => {
    if (tab === "scholarlens") setSeenRag(true);
  }, [tab]);

  // Links to #glitch or #scholarlens (also the project names further down) open that demo and scroll to it
  useEffect(() => {
    const open = (smooth: boolean) => {
      const hash = window.location.hash.slice(1);
      if (hash !== "glitch" && hash !== "scholarlens") return;
      setTab(hash);
      // after the tab has rendered
      setTimeout(() => {
        const el = document.getElementById("ai-demos");
        if (!el) return;
        if (smooth) scrollToElement(el, 96);
        else window.scrollTo(0, el.getBoundingClientRect().top + window.scrollY - 96);
      }, 30);
    };
    open(false);
    const onHash = () => open(true);
    window.addEventListener("hashchange", onHash);
    return () => window.removeEventListener("hashchange", onHash);
  }, []);

  return (
    <div id="ai-demos" className="scroll-mt-28">
      <div role="tablist" aria-label="Live demos" className="inline-flex p-1 mb-5 rounded-full border bw-rule bg-[var(--bg-subtle)]">
        {TABS.map((t) => {
          const active = tab === t.key;
          const nudge = t.key === "scholarlens" && !active && !seenRag;
          return (
            <button
              key={t.key}
              role="tab"
              aria-selected={active}
              onClick={() => {
                setTab(t.key);
                history.replaceState(null, "", `#${t.key}`);
              }}
              className={`flex items-baseline gap-2 px-4 sm:px-5 py-2 rounded-full cursor-pointer transition-all ${
                active
                  ? "border-[1.5px] border-transparent bg-[var(--bg-card)] shadow-[var(--shadow-float)] theme-text-primary"
                  : `border-[1.5px] border-transparent bw-muted hover:text-[var(--text-primary)] ${nudge ? "bw-shimmer" : ""}`
              }`}
            >
              <span className="text-sm font-semibold">{t.name}</span>
              <span className="hidden sm:inline font-mono text-[11px] bw-faint">{t.note}</span>
            </button>
          );
        })}
      </div>
      <div role="tabpanel">{tab === "glitch" ? <GlitchDemo /> : <ScholarLensDemo />}</div>
    </div>
  );
};

export default AiLab;
