"use client";
// /lab: the AI lab with a calm dusk palette (a quiet nod to synthwave) and a small generative artwork for each
// project. One demo at a time; the cards, ← / → keys or Previous / Next switch between them. One URL for all of it.
import { useEffect, useState } from "react";
import Link from "next/link";
import { ArrowLeft, ArrowRight, ArrowUpRight } from "lucide-react";
import { aiWork } from "@/data/profile";
import { DEMOS } from "../components/lab/demos";
import { scrollToElement } from "@/lib/scroll";
import { ART, BackdropArt, DefaultArt } from "./Artworks";
import Synth from "./Synth";
import Highlight from "../components/ui/Highlight";

const labs = aiWork.filter((w) => w.demo && w.lab);
type Key = NonNullable<(typeof labs)[number]["demo"]>;

const LabExplorer = () => {
  const [key, setKey] = useState<Key>(labs[0].demo!);
  const index = labs.findIndex((l) => l.demo === key);
  const current = labs[index];
  const prev = labs[index - 1];
  const next = labs[index + 1];
  const Demo = DEMOS[key];

  const select = (k: Key, scroll = false) => {
    setKey(k);
    if (scroll) setTimeout(() => scrollToElement(document.getElementById("l2-view")!, 88), 30);
  };

  // ← / → switch projects, except while typing in a demo
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.target as HTMLElement).closest("input, textarea, [contenteditable=true]") || e.altKey || e.metaKey || e.ctrlKey) return;
      const i = labs.findIndex((l) => l.demo === key);
      const to = e.key === "ArrowRight" ? labs[i + 1] : e.key === "ArrowLeft" ? labs[i - 1] : undefined;
      if (to) setKey(to.demo!);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [key]);

  return (
    <div className="lab-page">
      <div className="l2-wash" aria-hidden />

      {/* intro, with the hero piece beside it */}
      {/* the artwork is the hero's background: no frame, its edges fade into the page */}
      <div className="l2-backdrop" aria-hidden>
        <BackdropArt />
      </div>
      <header className="relative max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 pt-14 md:pt-28 pb-14 md:pb-28">
        <div className="relative max-w-xl">
          <p className="l2-eyebrow mb-5">AI lab</p>
          <h1 className="text-[2.1rem] md:text-[3.6rem] font-semibold tracking-[-0.04em] leading-[1.04] mb-5">
            Things I built with AI, <span className="font-serif-accent l2-accent text-[1.1em] font-normal">running live.</span>
          </h1>
          <p className="text-base md:text-lg bw-muted max-w-xl leading-relaxed mb-7">
            Pick a project and use it right here in your browser. No sign-up.
          </p>
          <div className="flex flex-wrap items-center gap-x-5 gap-y-3 text-sm">
            <a href="#l2-projects" className="btn btn-primary !h-10">
              See the projects <ArrowRight className="w-4 h-4" />
            </a>
            <Synth />
          </div>
        </div>
      </header>

      {/* project cards */}
      <section id="l2-projects" className="relative scroll-mt-24 max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-end justify-between gap-4 mb-5 border-t bw-rule pt-6">
          <h2 className="l2-eyebrow">Projects · {labs.length}</h2>
          <span className="hidden md:inline font-mono text-[11px] bw-faint">← → to switch</span>
        </div>
        <div
          role="tablist"
          aria-label="AI projects"
          className={`flex md:grid gap-4 md:gap-6 overflow-x-auto snap-x snap-mandatory -mx-4 px-4 pb-2 md:mx-0 md:px-0 md:overflow-visible [scrollbar-width:none] ${
            labs.length >= 4 ? "md:grid-cols-4" : labs.length === 3 ? "md:grid-cols-3" : "md:grid-cols-2"
          }`}
        >
          {labs.map((l) => {
            const active = l.demo === key;
            const Art = ART[l.demo!] ?? DefaultArt;
            return (
              <button
                key={l.demo}
                role="tab"
                aria-selected={active}
                aria-controls="l2-view"
                onClick={() => select(l.demo!, true)}
                className={`l2-work group snap-start shrink-0 w-[80%] sm:w-[46%] md:w-auto text-left ${active ? "is-active" : ""}`}
              >
                <span className="l2-art-wrap block">
                  <Art />
                </span>
                <span className="l2-label block">
                  <span className="block text-xl font-semibold tracking-tight">{l.name}</span>
                  <span className="block font-mono text-[11px] l2-accent mt-0.5">{l.lab!.kind}</span>
                  <span className="block text-sm bw-muted leading-relaxed mt-2">{l.lab!.oneLiner}</span>
                </span>
              </button>
            );
          })}
        </div>
      </section>

      {/* the open demo */}
      <section id="l2-view" aria-label={`${current.name} live demo`} className="relative scroll-mt-24 max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 pt-12 md:pt-16">
        <div key={key} className="l2-enter">
          <div className="l2-fade-rule mb-7 md:mb-9" aria-hidden />
          <div className="flex flex-wrap items-end justify-between gap-x-6 gap-y-3 mb-5">
            <div>
              <h2 className="text-2xl md:text-3xl font-semibold tracking-tight">{current.name}</h2>
              <p className="text-sm md:text-base bw-muted mt-1">{current.tagline}</p>
            </div>
            {current.links.length > 0 && (
              <div className="flex gap-2">
                {current.links.map((l) => (
                  <a key={l.href} href={l.href} target="_blank" rel="noopener noreferrer" className="btn btn-secondary !h-9 !px-4 !text-[13px]">
                    {l.label} <ArrowUpRight className="w-3.5 h-3.5 bw-faint" />
                  </a>
                ))}
              </div>
            )}
          </div>

          <div className="l2-frame">
            <Demo />
          </div>

          <div className="mt-8 md:mt-10">
            <ul className="grid sm:grid-cols-2 gap-x-10 gap-y-4 text-sm">
              {current.highlights.map((h, i) => (
                <li key={h} style={{ "--i": i } as React.CSSProperties} className="l2-rise border-t bw-rule pt-3 leading-relaxed bw-muted">
                  <Highlight text={h} />
                </li>
              ))}
            </ul>
            <p className="mt-6 font-mono text-[11px] bw-faint leading-5">built with: {current.stack.join(", ")}</p>
          </div>
        </div>

        <nav aria-label="More demos" className="flex justify-between gap-3 mt-12 md:mt-16 pt-6 border-t bw-rule pb-16 md:pb-24">
          {prev ? (
            <button onClick={() => select(prev.demo!, true)} className="group text-left cursor-pointer">
              <span className="flex items-center gap-1.5 font-mono text-[11px] bw-faint">
                <ArrowLeft className="w-3.5 h-3.5 transition-transform group-hover:-translate-x-1" /> previous
              </span>
              <span className="font-semibold group-hover:text-[var(--l2-accent)] transition-colors">{prev.name}</span>
            </button>
          ) : (
            <Link href="/" className="group text-left">
              <span className="flex items-center gap-1.5 font-mono text-[11px] bw-faint">
                <ArrowLeft className="w-3.5 h-3.5 transition-transform group-hover:-translate-x-1" /> back to
              </span>
              <span className="font-semibold group-hover:text-[var(--l2-accent)] transition-colors">Portfolio</span>
            </Link>
          )}
          {next ? (
            <button onClick={() => select(next.demo!, true)} className="group text-right cursor-pointer">
              <span className="flex items-center justify-end gap-1.5 font-mono text-[11px] bw-faint">
                next <ArrowRight className="w-3.5 h-3.5 transition-transform group-hover:translate-x-1" />
              </span>
              <span className="font-semibold group-hover:text-[var(--l2-accent)] transition-colors">{next.name}</span>
            </button>
          ) : (
            <Link href="/projects" className="group text-right">
              <span className="flex items-center justify-end gap-1.5 font-mono text-[11px] bw-faint">
                see also <ArrowRight className="w-3.5 h-3.5 transition-transform group-hover:translate-x-1" />
              </span>
              <span className="font-semibold group-hover:text-[var(--l2-accent)] transition-colors">All projects</span>
            </Link>
          )}
        </nav>
      </section>
    </div>
  );
};

export default LabExplorer;
