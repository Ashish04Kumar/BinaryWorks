"use client";
import { FormEvent, useEffect, useRef, useState } from "react";
import { ArrowUp, ArrowUpRight, ChevronDown, ExternalLink, FileText, Network } from "lucide-react";
import AgentGraph, { type Scenario, type Step } from "../home/AgentGraph";
import paper from "@/data/scholarlens/batchnorm-meta.json";
import Answer from "./Answer";

type Source = { page: number; text: string };
type Turn =
  | { role: "user"; text: string }
  | { role: "assistant"; text: string; route?: string; sources?: Source[]; status?: string; streaming?: boolean }
  | { role: "error"; text: string };

const SUGGESTIONS = [
  "What problem does batch normalization solve?",
  "How is the normalization computed during inference?",
  "Verify: batch norm is still the standard normalization in transformers.",
  "What's the difference between RLHF and DPO?",
];

// What the visitor sees while each graph step runs
const STATUS: Record<string, string> = {
  router: "Deciding how to answer",
  agent: "Planning a search",
  retrieval: "Searching the paper",
  relevancy: "Checking the passages fit the question",
  rewrite: "Rephrasing the search",
  verify: "Checking the claim",
  generate: "Writing the answer",
};

const ROUTE_LABEL: Record<string, string> = {
  retrieve: "searched the paper",
  verify_claim: "checked the claim",
  direct_answer: "answered without the paper",
};

const ScholarLensDemo = () => {
  const [turns, setTurns] = useState<Turn[]>([]);
  const [input, setInput] = useState("");
  const [busy, setBusy] = useState(false);
  const [showGraph, setShowGraph] = useState(false);
  const [seenGraph, setSeenGraph] = useState(false);   // the arrow nudges until the first click
  const [live, setLive] = useState<Scenario | undefined>();
  const logRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    logRef.current?.scrollTo({ top: logRef.current.scrollHeight, behavior: "smooth" });
  }, [turns, busy]);

  const ask = async (question: string) => {
    const q = question.trim();
    if (!q || busy) return;
    setInput("");
    setBusy(true);
    setTurns((t) => [...t, { role: "user", text: q }, { role: "assistant", text: "", streaming: true, status: STATUS.router }]);
    // update the answer bubble that is being streamed (always the last turn)
    const patch = (fn: (a: Extract<Turn, { role: "assistant" }>) => Partial<Extract<Turn, { role: "assistant" }>>) =>
      setTurns((t) => {
        const last = t[t.length - 1];
        if (!last || last.role !== "assistant") return t;
        return [...t.slice(0, -1), { ...last, ...fn(last) }];
      });
    const steps: Step[] = [];
    try {
      const res = await fetch("/api/scholarlens", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ question: q }),
      });
      if (!res.ok || !res.body) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error || "Something went wrong.");
      }
      // newline-delimited JSON events: route, step, sources, token, done, error
      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      let buffer = "";
      for (;;) {
        const { done, value } = await reader.read();
        if (done) break;
        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split("\n");
        buffer = lines.pop() ?? "";
        for (const line of lines) {
          if (!line.trim()) continue;
          const ev = JSON.parse(line);
          if (ev.type === "route") patch(() => ({ route: ev.route }));
          else if (ev.type === "step") {
            steps.push(ev.step as Step);
            const status = STATUS[ev.step.node];
            if (status) patch(() => ({ status }));
          } else if (ev.type === "sources") patch(() => ({ sources: ev.sources }));
          else if (ev.type === "token") patch((a) => ({ text: a.text + ev.t }));
          else if (ev.type === "error") throw new Error(ev.error);
        }
      }
      patch(() => ({ streaming: false, status: undefined }));
      setLive({ key: `live-${Date.now()}`, label: "your question", question: q, steps });
    } catch (e) {
      setTurns((t) => [
        ...t.filter((x, i) => !(i === t.length - 1 && x.role === "assistant" && !x.text)),
        { role: "error", text: e instanceof Error ? e.message : "Something went wrong." },
      ]);
      patch(() => ({ streaming: false, status: undefined }));
    } finally {
      setBusy(false);
    }
  };

  const onSubmit = (e: FormEvent) => {
    e.preventDefault();
    ask(input);
  };

  return (
    <div className="bw-panel overflow-hidden">
      {/* paper + controls */}
      <div className="flex flex-wrap items-center justify-between gap-3 px-4 py-3 border-b bw-rule">
        <div className="flex items-center gap-3 min-w-0">
          <FileText className="w-5 h-5 shrink-0 bw-accent" />
          <div className="min-w-0">
            <p className="text-sm font-medium truncate">{paper.title}</p>
          </div>
        </div>
        <div className="flex items-center gap-2 font-mono text-xs">
          <a href={paper.url} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1 px-2.5 py-1 rounded-full border bw-rule bw-chip">
            arXiv <ExternalLink className="w-3 h-3" />
          </a>
          <button
            onClick={() => {
              setShowGraph((s) => !s);
              setSeenGraph(true);
            }}
            aria-expanded={showGraph}
            className={`group flex items-center gap-2 h-9 pl-3.5 pr-3 rounded-full font-sans text-[13px] font-medium cursor-pointer transition-all ${
              showGraph ? "bw-btn-selected" : "bw-glow-border theme-text-primary hover:-translate-y-px"
            }`}
          >
            <Network className={`w-4 h-4 ${showGraph ? "" : "bw-accent"}`} />
            {showGraph ? "Hide steps" : "How it works"}
            <ChevronDown
              className={`w-3.5 h-3.5 transition-transform ${showGraph ? "rotate-180" : seenGraph ? "" : "bw-nudge"}`}
            />
          </button>
        </div>
      </div>

      {/* this is a light demo: point to the real, deployed app */}
      <a
        href="https://scholarlens.duckdns.org/"
        target="_blank"
        rel="noopener noreferrer"
        className="group flex flex-wrap items-center justify-between gap-2 px-4 py-2.5 border-b bw-rule bw-subtle text-sm bw-row-link"
      >
        <span className="bw-muted">
          This is a quick demo with one paper. <span className="theme-text-primary font-medium">Upload your own papers in the full version.</span>
        </span>
        <span className="inline-flex items-center gap-1 font-mono text-xs bw-accent">
          scholarlens.duckdns.org <ArrowUpRight className="w-3.5 h-3.5 transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
        </span>
      </a>

      {showGraph && (
        <div className="p-3 md:p-4 border-b bw-rule bw-grid">
          <AgentGraph live={live} />
        </div>
      )}

      {/* chat */}
      <div ref={logRef} data-scroll-box className="h-[22rem] overflow-y-auto px-4 py-5 space-y-5" aria-live="polite">
        {turns.length === 0 && (
          <div className="h-full flex flex-col justify-center">
            <p className="text-lg font-medium mb-1">Ask the paper anything.</p>
            <p className="bw-muted text-sm mb-5">
              It answers from the paper with page numbers. Open <span className="font-mono">how it works</span> to see
              each step it takes for your question.
            </p>
            <div className="flex flex-wrap gap-2">
              {SUGGESTIONS.map((s) => (
                <button key={s} onClick={() => ask(s)} className="text-left text-sm px-3 py-1.5 rounded-full border bw-rule bw-chip cursor-pointer">
                  {s}
                </button>
              ))}
            </div>
          </div>
        )}

        {turns.map((t, i) =>
          t.role === "user" ? (
            <div key={i} className="flex justify-end">
              <p className="max-w-[85%] px-4 py-2 rounded-2xl rounded-br-sm bw-accent-bg text-white text-sm">{t.text}</p>
            </div>
          ) : t.role === "error" ? (
            <p key={i} className="font-mono text-xs text-red-500">{t.text}</p>
          ) : (
            <div key={i} className="max-w-[92%]">
              {t.route && (
                <p className="font-mono text-[11px] bw-muted mb-1.5">
                  → {ROUTE_LABEL[t.route] || t.route}
                </p>
              )}
              {t.streaming && t.status && (
                <p className="flex items-center gap-2 font-mono text-[11px] bw-accent mb-2">
                  <span className="w-1.5 h-1.5 rounded-full bw-accent-fill animate-pulse" />
                  {t.status}…
                </p>
              )}
              {t.text && <Answer text={t.text} streaming={t.streaming} />}
              {!t.streaming && t.sources && t.sources.length > 0 && (
                <details className="mt-2">
                  <summary className="font-mono text-[11px] bw-muted cursor-pointer">
                    {t.sources.length} sources · pages {[...new Set(t.sources.map((s) => s.page))].join(", ")}
                  </summary>
                  <ul className="mt-2 space-y-2">
                    {t.sources.map((s, j) => (
                      <li key={j} className="text-xs bw-muted border-l-2 bw-accent-border pl-3">
                        <span className="font-mono bw-accent">p. {s.page}</span> {s.text.slice(0, 260)}…
                      </li>
                    ))}
                  </ul>
                </details>
              )}
            </div>
          )
        )}

      </div>

      <form onSubmit={onSubmit} className="flex items-center gap-2 px-3 py-3 border-t bw-rule">
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Ask about the paper, verify a claim, or ask anything…"
          aria-label="Ask ScholarLens"
          maxLength={500}
          className="flex-1 min-w-0 bg-transparent outline-none text-sm px-2 placeholder:opacity-50"
        />
        <button
          type="submit"
          disabled={busy || !input.trim()}
          aria-label="Send"
          className="grid place-items-center w-9 h-9 rounded-full bw-accent-bg text-white disabled:opacity-40 cursor-pointer"
        >
          <ArrowUp className="w-4 h-4" />
        </button>
      </form>
      <p className="px-4 pb-3 font-mono text-[11px] bw-muted">
        Demo version: the same steps and prompts as ScholarLens, with a simpler search.{" "}
        <a href="https://scholarlens.duckdns.org/" target="_blank" rel="noopener noreferrer" className="bw-link bw-accent">
          Try the full app ↗
        </a>
      </p>
    </div>
  );
};

export default ScholarLensDemo;
