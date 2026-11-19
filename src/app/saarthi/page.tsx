import type { Metadata } from "next";
import Image from "next/image";
import { ArrowUpRight, Github } from "lucide-react";
import Playroom from "./Playroom";
import "./saarthi.scss";

export const metadata: Metadata = {
  title: "Saarthi · a vibe-coded desktop companion · Ashish Kumar",
  description:
    "Saarthi is an animated desktop companion that reacts to what you do: typing, scrolling, videos, breaks. It keeps reminders and notes, guides breathing and tells you the traffic home. Play with it in the browser.",
};

const GITHUB = "https://github.com/Ashish04Kumar/saarthi";

// Every feature, grouped. Source: the app's README and features guide.
const FEATURES: { title: string; icon: string; items: string[] }[] = [
  {
    title: "Knows what you're doing",
    icon: "👀",
    items: [
      "Fast typing: types furiously and sweats",
      "Slow typing: hand on chin, thought bubble",
      "Scrolling (mouse or touchpad): eyes go up and down",
      "Videos and tutorials (YouTube, Udemy, Coursera…): grabs popcorn, with lines for each site",
      "Music playing: comments on the music now and then",
      "3 min without input: dozes off · 15 min: falls asleep (Zzz) · you come back: jumps up, “Aa gaye!”",
      "Counts how fast you type, never what you type",
    ],
  },
  {
    title: "Alive when you touch it",
    icon: "👆",
    items: [
      "Click the head: “Oye!” and rubs its head",
      "Click the body: giggles (tickled)",
      "Click 4 times in 3 seconds: gets dizzy",
      "Drag it anywhere on the screen",
      "Walking mode: strolls along the bottom of the screen when you're idle",
      "Double-click: opens the panel · right-click: the full menu",
    ],
  },
  {
    title: "Status: Working, Break, Lunch",
    icon: "☕",
    items: [
      "Pick the minutes for a break or lunch (Break 5, Lunch 60 by default)",
      "Break: walks around with chai, countdown in the speech bubble",
      "Keep typing ~45 s on a break and it assumes something important came up: break cancelled, offered again in 15 min",
      "Lunch: eats for 10–15 min, then strolls slowly and stops to think",
      "Change the time left while it runs, or save it as your default",
      "Click the active status again to end it",
    ],
  },
  {
    title: "Wellness",
    icon: "🧘",
    items: [
      "Suggests a break after 50 minutes of work",
      "Guided breathing every 20 minutes: 5 breaths of 4 s in, 2 s hold, 6 s out",
      "Reminds you to stretch and drink water",
      "No-smoking motivation list: one line every 40 min with facts on lungs, heart, hair, skin and brain",
      "Your own quote lists, each with its own gap",
    ],
  },
  {
    title: "Reminders, notes and calendar",
    icon: "⏰",
    items: [
      "Reminders: once, daily, weekdays, weekly, monthly, hourly or every N minutes",
      "At reminder time it holds up a “!” sign with a card: Done / Skipped / 10 min / 1 h",
      "Tracks what you actually did: “Is hafte: N ✓ kiya · N ✗ nahi kiya”, last 7 days and 40 recent entries",
      "Notes that work as a to-do list, with search and pin",
      "Calendar with your own events plus read-only Google / Outlook / Apple sync (iCal links, every 15 min)",
      "Event card 10 minutes before an event",
    ],
  },
  {
    title: "Your day, outside the screen",
    icon: "🌦",
    items: [
      "Morning brief the first time you're active each day: today's events, reminders and weather",
      "Weather for your city (automatic or chosen), updated every 30 min, with a warning before rain",
      "Outfits for the weather: umbrella, beanie and scarf, or shades",
      "Traffic home 15 min before logout on work days: car or two-wheeler, free estimate, TomTom or Google",
    ],
  },
  {
    title: "Characters and looks",
    icon: "🎨",
    items: [
      "18 animations on the 3D Saarthi character",
      "Or pick Bit, a cartoon robot, or your own skins",
      "3D avatar maker for a full-body character of yourself",
      "Panel and full window in dark or light theme",
      "Hinglish or English",
    ],
  },
  {
    title: "Built for real use",
    icon: "🛠",
    items: [
      "Quiet mode for screen sharing: tiny in a corner, no pop-ups; reminders wait for you",
      "“What I see…”: live diagnostics (detectors, keys/sec, idle, media, mood, next break)",
      "“Try features” menu to trigger any feature on demand",
      "Starts with your computer, one instance only, one-command installers",
      "Linux tested (X11 and Wayland); Windows and macOS code complete",
      "Private: notes, reminders and settings stay in your config folder",
    ],
  },
];

const WHEN: [string, string][] = [
  ["App starts", "Welcome tips on first run; a card if typing detection needs permission"],
  ["First activity of the day", "Morning brief: events, reminders and weather"],
  ["Reminder time", "Holds up a “!” sign, plus a card to mark it done or skipped"],
  ["10 min before an event", "Event card (calendars sync every 15 min)"],
  ["50 min of work", "Suggests a break"],
  ["Every 20 min", "Offers guided breathing"],
  ["Every 40 min", "A no-smoking motivation line"],
  ["Every 20–40 min", "A random fun line (skipped if something important is showing)"],
  ["Every 30 min", "Weather update; warns before rain"],
  ["15 min before logout", "Time to get home and the traffic"],
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
            <span className="sr-vibe rounded-full px-3 py-1 text-xs font-semibold tracking-wide">✨ Vibe-coded</span>
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

      {/* every feature */}
      <section className="border-t bw-rule">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12 md:py-16">
          <h2 className="text-2xl md:text-3xl font-semibold tracking-tight mb-8">Everything it does</h2>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {FEATURES.map((g) => (
              <div key={g.title} className="rounded-2xl border bw-rule theme-bg-card p-5">
                <div className="text-2xl">{g.icon}</div>
                <h3 className="font-semibold mt-2 mb-3">{g.title}</h3>
                <ul className="space-y-2 text-[13.5px] bw-muted leading-snug">
                  {g.items.map((it) => (
                    <li key={it} className="flex gap-2"><span className="bw-accent">•</span><span>{it}</span></li>
                  ))}
                </ul>
              </div>
            ))}
          </div>

          <h3 className="text-xl font-semibold tracking-tight mt-12 mb-4">When it does what</h3>
          <div className="rounded-2xl border bw-rule overflow-hidden">
            {WHEN.map(([when, what], i) => (
              <div key={when} className={`grid sm:grid-cols-[240px_1fr] gap-1 sm:gap-6 px-5 py-3 text-sm ${i ? "border-t bw-rule" : ""}`}>
                <span className="font-mono text-[13px] bw-accent">{when}</span>
                <span className="bw-muted">{what}</span>
              </div>
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
