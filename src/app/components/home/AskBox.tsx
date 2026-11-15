"use client";
import { FormEvent, useEffect, useRef, useState } from "react";
import { experience, profile } from "@/data/profile";

type Route = { node: string; keywords: string[]; question: string; answer: string };

// A tiny keyword router over profile data. No LLM, and the UI says so.
const routes: Route[] = [
  {
    node: "projects",
    question: "What do you build?",
    keywords: ["build", "project", "made", "work on", "dashboard", "portfolio"],
    answer:
      "At work: BotStream (a chatbot that answers from a company's documents), a budget system for a UAE ministry, a shooting-range training dashboard and a team chat tool. On my own: AI projects like Glitch and ScholarLens.",
  },
  {
    node: "frontend",
    question: "Strongest skill?",
    keywords: ["front", "react", "next", "ui", "strong", "best", "typescript", "css"],
    answer:
      "Frontend. I build with React, Next.js and TypeScript, especially big dashboards with tables, charts and live updates.",
  },
  {
    node: "backend",
    question: "Backend depth?",
    keywords: ["back", "api", "database", "server", "sql", "python", "fastapi", "flask", "aws"],
    answer:
      "Python, with FastAPI and Flask: APIs, logins and SQL databases, deployed on AWS. I built the backends behind my AI projects.",
  },
  {
    node: "agents",
    question: "AI work?",
    keywords: ["ai", "llm", "agent", "lang", "gen", "chat", "bot", "rag", "glitch", "scholar", "umbrella", "voice", "robot", "reminder", "iot"],
    answer:
      "I build AI agents with LangGraph. Glitch is my desk companion: it talks, remembers, keeps reminders, notes and lists, and controls devices. ScholarLens answers questions about research papers. You can try both in the AI lab below.",
  },
  {
    node: "career",
    question: "Where do you work?",
    keywords: ["where", "job", "company", "experience", "year", "current", "role"],
    answer: `${experience[0].title} at ${experience[0].company}, ${experience[0].location}, since ${experience[0].period.split(" – ")[0]}. ${profile.experienceYears} years in the industry overall.`,
  },
];

const fallback: Route = {
  node: "fallback",
  question: "",
  keywords: [],
  answer: "I only know a few topics so far. Try one of the suggestions below.",
};

const pickRoute = (text: string) => {
  const q = text.toLowerCase();
  return routes.find((r) => r.keywords.some((k) => q.includes(k))) ?? fallback;
};

const AskBox = () => {
  const [input, setInput] = useState("");
  const [asked, setAsked] = useState<string | null>(null);
  const [route, setRoute] = useState<Route | null>(null);
  const [typed, setTyped] = useState("");
  const timer = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    if (!route) return;
    setTyped("");
    let i = 0;
    timer.current = setInterval(() => {
      i += 2;
      setTyped(route.answer.slice(0, i));
      if (i >= route.answer.length && timer.current) clearInterval(timer.current);
    }, 14);
    return () => {
      if (timer.current) clearInterval(timer.current);
    };
  }, [route]);

  const ask = (question: string) => {
    if (!question.trim()) return;
    setAsked(question);
    setRoute(pickRoute(question));
    setInput("");
  };

  const onSubmit = (e: FormEvent) => {
    e.preventDefault();
    ask(input);
  };

  const done = route && typed.length >= route.answer.length;

  return (
    <div className="font-mono text-sm bw-panel overflow-hidden">
      <div className="flex items-center justify-between px-4 py-2 border-b bw-rule bw-muted text-xs">
        <span>ask.ashish</span>
        <span>quick answers from my profile</span>
      </div>

      <div className="px-4 py-4 min-h-[9.5rem]">
        {asked && route ? (
          <div className="space-y-2">
            <p>
              <span className="bw-muted">you › </span>
              {asked}
            </p>
            <p className="bw-muted text-xs">
              → route: <span className="bw-accent">{route.node}</span>
            </p>
            <p className="leading-relaxed">
              {typed}
              {!done && <span className="bw-caret ml-0.5" />}
            </p>
          </div>
        ) : (
          <p className="bw-muted leading-relaxed">
            Ask about my work, my skills or what I&apos;m building with AI.
            <span className="bw-caret ml-1" />
          </p>
        )}
      </div>

      <form onSubmit={onSubmit} className="flex items-center gap-2 px-4 py-3 border-t bw-rule">
        <span className="bw-accent">›</span>
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="type a question…"
          aria-label="Ask a question"
          className="flex-1 min-w-0 bg-transparent outline-none placeholder:opacity-50"
        />
        <button type="submit" className="bw-muted hover:opacity-100 text-xs cursor-pointer">
          enter ↵
        </button>
      </form>

      <div className="flex flex-wrap gap-2 px-4 pb-4">
        {routes.map((r) => (
          <button
            key={r.node}
            onClick={() => ask(r.question)}
            className="text-xs px-2.5 py-1 rounded-full border bw-rule bw-chip transition-colors cursor-pointer"
          >
            {r.question}
          </button>
        ))}
      </div>
    </div>
  );
};

export default AskBox;
