import type { Metadata } from "next";
import Image from "next/image";
import { ArrowUpRight, Github } from "lucide-react";
import Playroom from "./Playroom";
import Sprite from "./Sprite";
import type { SpriteState } from "./sprites";
import "./saarthi.scss";

export const metadata: Metadata = {
  title: "Saarthi · a vibe-coded desktop companion · Ashish Kumar",
  description:
    "Saarthi is an animated desktop companion that reacts to what you do: typing, scrolling, videos, breaks. It keeps reminders and notes, guides breathing and tells you the traffic home. Play with it in the browser.",
};

const GITHUB = "https://github.com/Ashish04Kumar/saarthi";

// The main things it does, each shown with its own animation. The rest are one-line chips.
const TILES: { state: SpriteState; title: string; line: string; tint: string }[] = [
  { state: "typing_fast", title: "Reacts to your work", line: "Sweats when you type fast, ponders when you slow down.", tint: "#fde68a" },
  { state: "watching", title: "Watches with you", line: "Grabs popcorn for YouTube and tutorials.", tint: "#fecaca" },
  { state: "sleeping", title: "Knows you're away", line: "Dozes off, then jumps up when you're back.", tint: "#c7d2fe" },
  { state: "break", title: "Breaks & lunch", line: "Takes chai and lunch with you, on a timer.", tint: "#fed7aa" },
  { state: "breathe", title: "Breathe & stretch", line: "Guided breathing and nudges to move.", tint: "#bbf7d0" },
  { state: "alert", title: "Reminders & to-dos", line: "Holds up a sign, tracks done or skipped.", tint: "#fde047" },
  { state: "giggle", title: "Fun to poke", line: "Poke, tickle, or click it dizzy.", tint: "#fbcfe8" },
  { state: "walk", title: "Walks around", line: "Strolls along your screen when you're idle.", tint: "#a5f3fc" },
];

const CHIPS = [
  "📅 Synced calendar",
  "🌅 Morning brief",
  "🌦 Weather & outfits",
  "🚗 Traffic home",
  "🤫 Quiet mode for calls",
  "🧑 3D avatar maker",
  "🗣 Hinglish / English",
  "🔒 Counts speed, never what you type",
  "🐧 Linux · Windows · macOS",
];

const SHOTS = [
  { src: "/saarthi/panel.webp", alt: "The double-click panel: status, quick actions, reminders, notes and today", w: 420, h: 720 },
  { src: "/saarthi/calendar.webp", alt: "Calendar with synced events", w: 900, h: 600 },
  { src: "/saarthi/avatar-states.webp", alt: "All of Saarthi's animation states", w: 880, h: 1220 },
];

const TECH = ["Python", "PySide6 (Qt)", "State machine (unit-tested)", "evdev · pynput (input)", "D-Bus MPRIS · WinRT (media)", "icalendar", "Weather & routing APIs", "pytest", "ruff"];

export default function SaarthiPage() {
  return (
    <main className="theme-bg-primary theme-text-primary">
      {/* hero */}
      <header className="bw-grid border-b bw-rule">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 pt-14 pb-10 md:pt-20 md:pb-14">
          <p className="font-mono text-xs md:text-sm bw-muted mb-4">
            <span className="bw-accent">~</span> / saarthi
          </p>
          <div className="flex flex-wrap items-center gap-3 mb-4">
            <h1 className="text-4xl md:text-6xl font-semibold tracking-tight">Saarthi</h1>
            <span className="text-2xl md:text-3xl bw-muted">सारथी</span>
            <span className="bw-vibe-tag rounded-full px-3 py-1 text-xs font-bold tracking-wide uppercase">✨ Vibe-coded</span>
          </div>
          <p className="text-base md:text-xl bw-muted max-w-3xl leading-relaxed">
            An animated desktop companion that lives on your screen and reacts to what you do. Type fast and it sweats,
            pause to think and it ponders, watch a tutorial and it grabs popcorn, walk away and it falls asleep. It also
            keeps your reminders and notes, takes breaks and lunch with you, breathes with you, and tells you the traffic home.
          </p>

          <div className="mt-6 max-w-3xl rounded-xl border bw-rule theme-bg-card p-4 text-sm leading-relaxed">
            <b>Why “vibe-coded”?</b> I built Saarthi by directing an AI coding agent. I decided what it should do and how it
            should feel, designed the character and its behaviour, tested it daily on my own machine and reviewed the
            changes; the AI wrote most of the code. It shows how I use AI tools to ship a full desktop app quickly.
          </div>

          <div className="flex flex-wrap items-center gap-3 mt-6">
            <a href="#playroom" className="btn btn-primary !h-10 !px-5">Play with it ↓</a>
            <a href={GITHUB} target="_blank" rel="noopener noreferrer" className="bw-link inline-flex items-center gap-1.5 font-mono text-sm">
              <Github className="w-4 h-4" /> code &amp; install <ArrowUpRight className="w-4 h-4" />
            </a>
          </div>
        </div>
      </header>

      {/* playroom */}
      <section id="playroom" className="scroll-mt-24 max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12 md:py-16">
        <h2 className="text-2xl md:text-3xl font-semibold tracking-tight">Playroom</h2>
        <p className="bw-muted mt-2 mb-6 max-w-2xl">
          The real character and its real rules, running in your browser. Type, scroll, play a video, poke it, send it on a
          break or lunch, breathe with it, or stay still and watch it fall asleep.
        </p>
        <Playroom />
      </section>

      {/* what it does */}
      <section className="border-t bw-rule">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12 md:py-16">
          <h2 className="text-2xl md:text-3xl font-semibold tracking-tight">What it does</h2>
          <p className="bw-muted mt-2 mb-8">A buddy for your workday, in eight moods.</p>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4">
            {TILES.map((t) => (
              <div key={t.state} className="sr-tile rounded-2xl border bw-rule theme-bg-card overflow-hidden">
                <div className="sr-tile-art grid place-items-end justify-center h-[160px] md:h-[180px] overflow-hidden" style={{ ["--tint" as string]: t.tint }}>
                  <Sprite state={t.state} size={190} />
                </div>
                <div className="p-4">
                  <h3 className="font-semibold text-[15px] leading-tight">{t.title}</h3>
                  <p className="text-[13px] bw-muted mt-1 leading-snug">{t.line}</p>
                </div>
              </div>
            ))}
          </div>
          <div className="flex flex-wrap gap-2 mt-6">
            {CHIPS.map((c) => (
              <span key={c} className="rounded-full border bw-rule theme-bg-card px-3 py-1.5 text-[13px]">{c}</span>
            ))}
          </div>
        </div>
      </section>

      {/* screenshots */}
      <section className="border-t bw-rule">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12 md:py-16">
          <h2 className="text-2xl md:text-3xl font-semibold tracking-tight mb-8">From the app</h2>
          <div className="grid md:grid-cols-[0.6fr_1fr_0.75fr] gap-4 items-start">
            {SHOTS.map((s) => (
              <figure key={s.src} className="rounded-2xl border bw-rule theme-bg-card p-3">
                <Image src={s.src} alt={s.alt} width={s.w} height={s.h} className="w-full h-auto rounded-lg" />
                <figcaption className="text-xs bw-muted mt-2 px-1">{s.alt}</figcaption>
              </figure>
            ))}
          </div>
        </div>
      </section>

      {/* tech + install */}
      <section className="border-t bw-rule">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12 md:py-16 grid md:grid-cols-2 gap-10">
          <div>
            <h2 className="text-2xl font-semibold tracking-tight mb-4">How it&apos;s built</h2>
            <p className="bw-muted text-sm leading-relaxed mb-4">
              A Python desktop app on Qt. A small, unit-tested state machine picks the mood from live activity (keys and
              scrolls per second, idle time, media playing), with a short hold so it doesn&apos;t flicker. Input comes from evdev
              on Wayland or pynput on X11, Windows and macOS; media from D-Bus MPRIS or WinRT.
            </p>
            <p className="font-mono text-[12px] leading-6">{TECH.join(" / ")}</p>
          </div>
          <div>
            <h2 className="text-2xl font-semibold tracking-tight mb-4">Install</h2>
            <pre className="rounded-xl border bw-rule theme-bg-card p-4 text-[12.5px] font-mono overflow-x-auto leading-6">{`git clone ${GITHUB}.git
cd saarthi
./install.sh --autostart`}</pre>
            <p className="text-xs bw-muted mt-3">Linux, Windows (install.bat) and macOS. Needs git and Python 3.10+.</p>
          </div>
        </div>
      </section>
    </main>
  );
}
