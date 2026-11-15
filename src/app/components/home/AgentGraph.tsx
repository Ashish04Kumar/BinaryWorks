"use client";
import { useEffect, useState } from "react";
import { Pause, Play } from "lucide-react";

// ScholarLens's LangGraph StateGraph (backend/rag_graph.py), drawn as it is wired,
// with three example runs stepping through it.

type NodeId =
  | "start"
  | "router"
  | "agent"
  | "retrieval"
  | "relevancy"
  | "rewrite"
  | "verify"
  | "generate"
  | "summarize"
  | "end";

type GraphNode = { x: number; y: number; label: string; sub?: string; kind?: "terminal" | "tool" };

const NODES: Record<NodeId, GraphNode> = {
  start: { x: 40, y: 200, label: "START", kind: "terminal" },
  router: { x: 170, y: 200, label: "router", sub: "LLM · structured route" },
  agent: { x: 370, y: 200, label: "agent_node", sub: "LLM + bound tools" },
  retrieval: { x: 370, y: 320, label: "retrieval", sub: "ToolNode · Qdrant k=4", kind: "tool" },
  verify: { x: 370, y: 430, label: "verify_claim", sub: "Tavily web + arXiv" },
  relevancy: { x: 580, y: 200, label: "relevancy_check", sub: "LLM grader" },
  rewrite: { x: 580, y: 80, label: "query_rewrite", sub: "LLM · max 1" },
  generate: { x: 770, y: 200, label: "generate_answer", sub: "Groq → Gemini fallback" },
  summarize: { x: 960, y: 200, label: "summarize", sub: "rolling memory" },
  end: { x: 960, y: 300, label: "END", kind: "terminal" },
};

const W = 150;
const H = 46;

type EdgeId = string;
type Edge = { d: string; label?: string; lx?: number; ly?: number };

const EDGES: Record<EdgeId, Edge> = {
  "start-router": { d: "M64,200 H95" },
  "router-agent": { d: "M245,200 H295", label: "retrieve", lx: 270, ly: 170 },
  "router-verify": { d: "M170,223 V430 H295", label: "verify_claim", lx: 232, ly: 422 },
  "router-generate": { d: "M170,177 C170,-30 770,-30 770,177", label: "direct_answer", lx: 470, ly: 14 },
  "agent-retrieval": { d: "M355,223 V297", label: "tool_calls", lx: 348, ly: 264 },
  "retrieval-agent": { d: "M385,297 V223", label: "results", lx: 392, ly: 264 },
  "agent-relevancy": { d: "M445,200 H505" },
  "relevancy-rewrite": { d: "M580,177 V103", label: "not relevant · 1st try", lx: 588, ly: 144 },
  "rewrite-agent": { d: "M505,80 H370 V177", label: "new query", lx: 440, ly: 72 },
  "relevancy-generate": { d: "M655,200 H695", label: "relevant", lx: 675, ly: 170 },
  "verify-generate": { d: "M445,430 H770 V223", label: "verdict + papers", lx: 610, ly: 422 },
  "generate-summarize": { d: "M845,200 H885" },
  "summarize-end": { d: "M960,223 V284" },
};

export type Step = { node: NodeId; edge?: EdgeId; log: string; state?: Record<string, string> };
export type Scenario = { key: string; label: string; question: string; steps: Step[] };

const SCENARIOS: Scenario[] = [
  {
    key: "retrieve",
    label: "search + rewrite",
    question: "What evaluation method does the paper use?",
    steps: [
      { node: "router", edge: "start-router", log: "router: LLM returns RouterDecision", state: { route: "retrieve" } },
      { node: "agent", edge: "router-agent", log: "agent_node: emits tool_call → retriever" },
      { node: "retrieval", edge: "agent-retrieval", log: "retrieval: Qdrant search in this chat's collection", state: { retrieved_docs: "4 chunks", retrieval_attempts: "1" } },
      { node: "agent", edge: "retrieval-agent", log: "agent_node: search cap reached, no new tool_calls" },
      { node: "relevancy", edge: "agent-relevancy", log: "relevancy_check: chunks don't answer the question", state: { is_relevant: "false" } },
      { node: "rewrite", edge: "relevancy-rewrite", log: "query_rewrite: sharper query, attempts reset", state: { rewrite_count: "1", retrieval_attempts: "0", retrieved_docs: "[]", is_relevant: "None" } },
      { node: "agent", edge: "rewrite-agent", log: "agent_node: tool_call → retriever (new query)" },
      { node: "retrieval", edge: "agent-retrieval", log: "retrieval: second search", state: { retrieved_docs: "4 chunks", retrieval_attempts: "1" } },
      { node: "agent", edge: "retrieval-agent", log: "agent_node: done searching" },
      { node: "relevancy", edge: "agent-relevancy", log: "relevancy_check: relevant", state: { is_relevant: "true" } },
      { node: "generate", edge: "relevancy-generate", log: "generate_answer: grounded answer, streamed with sources", state: { answer: "streaming…" } },
      { node: "summarize", edge: "generate-summarize", log: "summarize: folds older turns into the summary", state: { summary: "updated" } },
      { node: "end", edge: "summarize-end", log: "checkpoint saved (SQLite, thread = this chat)" },
    ],
  },
  {
    key: "verify",
    label: "verify a claim",
    question: "Verify: encoder-decoder models are the best approach for translation.",
    steps: [
      { node: "router", edge: "start-router", log: "router: LLM returns RouterDecision", state: { route: "verify_claim" } },
      { node: "verify", edge: "router-verify", log: "verify_claim: Tavily web search + site:arxiv.org search" },
      { node: "verify", log: "verify_claim: LLM judges the evidence → ClaimVerificationResult", state: { claim_verdict: "superseded?", superseding_papers: "titles + links" } },
      { node: "generate", edge: "verify-generate", log: "generate_answer: verdict with links to newer papers", state: { answer: "streaming…" } },
      { node: "summarize", edge: "generate-summarize", log: "summarize: folds older turns into the summary" },
      { node: "end", edge: "summarize-end", log: "checkpoint saved (SQLite, thread = this chat)" },
    ],
  },
  {
    key: "direct",
    label: "answer directly",
    question: "What's the difference between RLHF and DPO?",
    steps: [
      { node: "router", edge: "start-router", log: "router: general question, no paper needed", state: { route: "direct_answer" } },
      { node: "generate", edge: "router-generate", log: "generate_answer: answers without retrieval", state: { answer: "streaming…" } },
      { node: "summarize", edge: "generate-summarize", log: "summarize: folds older turns into the summary" },
      { node: "end", edge: "summarize-end", log: "checkpoint saved (SQLite, thread = this chat)" },
    ],
  },
];

const EMPTY_STATE: Record<string, string> = {
  route: "None",
  retrieved_docs: "[]",
  retrieval_attempts: "0",
  is_relevant: "None",
  rewrite_count: "0",
  claim_verdict: "None",
  answer: "None",
  summary: "\"\"",
};

const STEP_MS = 1100;
const PAUSE_AFTER_RUN_MS = 2600;

// `live`: a real run from the ScholarLens demo, shown first and replayed once
const AgentGraph = ({ live }: { live?: Scenario }) => {
  const scenarios = live ? [live, ...SCENARIOS] : SCENARIOS;
  const [scenarioIndex, setScenarioIndex] = useState(0);
  const [stepIndex, setStepIndex] = useState(-1);
  const [playing, setPlaying] = useState(true);

  // A new live run: jump to it and replay from the start
  useEffect(() => {
    setScenarioIndex(0);
    setStepIndex(-1);
    setPlaying(true);
  }, [live]);

  const scenario = scenarios[Math.min(scenarioIndex, scenarios.length - 1)];
  const done = stepIndex >= scenario.steps.length - 1;

  useEffect(() => {
    if (!playing) return;
    const timer = setTimeout(
      () => {
        if (done) {
          if (live && scenarioIndex === 0) {
            setPlaying(false);   // a real run plays once, then stays on screen
            return;
          }
          setScenarioIndex((i) => (i + 1) % scenarios.length);
          setStepIndex(-1);
        } else {
          setStepIndex((i) => i + 1);
        }
      },
      done ? PAUSE_AFTER_RUN_MS : stepIndex === -1 ? 600 : STEP_MS
    );
    return () => clearTimeout(timer);
  }, [playing, done, stepIndex, live, scenarioIndex, scenarios.length]);

  const pick = (i: number) => {
    setScenarioIndex(i);
    setStepIndex(-1);
    setPlaying(true);
  };

  const past = scenario.steps.slice(0, stepIndex + 1);
  const current = past[past.length - 1];
  const visitedNodes = new Set<NodeId>(["start", ...past.map((s) => s.node)]);
  const visitedEdges = new Set(past.map((s) => s.edge).filter(Boolean));
  const state = past.reduce((acc, s) => ({ ...acc, ...s.state }), { ...EMPTY_STATE });
  const changedKeys = new Set(Object.keys(current?.state ?? {}));

  return (
    <div className="bw-panel overflow-hidden">
      {/* controls */}
      <div className="flex flex-wrap items-center justify-between gap-3 px-4 py-3 border-b bw-rule font-mono text-xs">
        <div className="flex flex-wrap items-center gap-2">
          <span className="bw-muted mr-1">run:</span>
          {scenarios.map((s, i) => (
            <button
              key={s.key}
              onClick={() => pick(i)}
              className={`px-2.5 py-1 rounded-full border cursor-pointer transition-colors ${
                i === scenarioIndex ? "bw-accent bw-accent-border bw-tint" : "bw-rule bw-muted bw-chip"
              }`}
            >
              {s.label}
            </button>
          ))}
        </div>
        <button
          onClick={() => setPlaying((p) => !p)}
          aria-label={playing ? "Pause" : "Play"}
          className="flex items-center gap-1.5 px-2.5 py-1 rounded-full border bw-rule bw-chip cursor-pointer"
        >
          {playing ? <Pause className="w-3 h-3" /> : <Play className="w-3 h-3" />}
          {playing ? "pause" : "play"}
        </button>
      </div>

      <p className="px-4 pt-4 font-mono text-xs md:text-sm">
        <span className="bw-muted">query › </span>
        {scenario.question}
      </p>

      {/* graph */}
      <div data-lenis-prevent className="overflow-x-auto">
        <svg
          viewBox="0 -10 1060 490"
          className="font-mono w-full min-w-[720px] h-auto px-2"
          role="img"
          aria-label="ScholarLens LangGraph: router, agent node with a retrieval tool loop, relevancy check with one query rewrite, claim verification, answer generation and summarization"
        >
          <defs>
            <marker id="ag-arrow" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto">
              <path d="M0,0 L10,5 L0,10 z" fill="var(--border-color)" />
            </marker>
            <marker id="ag-arrow-on" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto">
              <path d="M0,0 L10,5 L0,10 z" fill="var(--bw-accent)" />
            </marker>
          </defs>

          {/* checkpointer bus */}
          <line x1="20" y1="472" x2="1040" y2="472" stroke="var(--border-color)" strokeDasharray="3 5" />
          <text x="20" y="466" fontSize="11" fill="var(--text-secondary)" opacity="0.8">
            SqliteSaver checkpointer · state saved after every step · one thread per chat
          </text>

          {/* edges */}
          {Object.entries(EDGES).map(([id, e]) => {
            const active = current?.edge === id;
            const visited = visitedEdges.has(id);
            return (
              <g key={id}>
                <path
                  d={e.d}
                  fill="none"
                  stroke={active || visited ? "var(--bw-accent)" : "var(--border-color)"}
                  strokeOpacity={active ? 1 : visited ? 0.45 : 1}
                  strokeWidth={active ? 2.5 : 1.5}
                  markerEnd={`url(#${active || visited ? "ag-arrow-on" : "ag-arrow"})`}
                  className={active ? "bw-edge-flow" : undefined}
                />
                {e.label && (
                  <text
                    x={e.lx}
                    y={e.ly}
                    fontSize="11"
                    textAnchor={id === "agent-retrieval" ? "end" : id === "relevancy-rewrite" || id === "retrieval-agent" ? "start" : "middle"}
                    fill={active ? "var(--bw-accent)" : "var(--text-secondary)"}
                    opacity={active ? 1 : 0.75}
                  >
                    {e.label}
                  </text>
                )}
              </g>
            );
          })}

          {/* nodes */}
          {(Object.entries(NODES) as [NodeId, GraphNode][]).map(([id, n]) => {
            const active = current?.node === id;
            const visited = visitedNodes.has(id);
            const terminal = n.kind === "terminal";
            const w = terminal ? 52 : W;
            const h = terminal ? 28 : H;
            return (
              <g key={id}>
                {active && (
                  <rect
                    x={n.x - w / 2 - 6}
                    y={n.y - h / 2 - 6}
                    width={w + 12}
                    height={h + 12}
                    rx={terminal ? 20 : 12}
                    fill="var(--bw-accent)"
                    opacity="0.15"
                  />
                )}
                <rect
                  x={n.x - w / 2}
                  y={n.y - h / 2}
                  width={w}
                  height={h}
                  rx={terminal ? 14 : 8}
                  fill="var(--bg-primary)"
                  stroke={active || visited ? "var(--bw-accent)" : "var(--border-color)"}
                  strokeOpacity={active ? 1 : visited ? 0.6 : 1}
                  strokeWidth={active ? 2 : 1.5}
                  strokeDasharray={n.kind === "tool" ? "5 3" : undefined}
                />
                <text
                  x={n.x}
                  y={terminal || !n.sub ? n.y + 4 : n.y - 3}
                  textAnchor="middle"
                  fontSize={terminal ? 10 : 13}
                  fontWeight={600}
                  fill={active ? "var(--bw-accent)" : "var(--text-primary)"}
                >
                  {n.label}
                </text>
                {n.sub && (
                  <text x={n.x} y={n.y + 13} textAnchor="middle" fontSize="9.5" fill="var(--text-secondary)" opacity="0.8">
                    {n.sub}
                  </text>
                )}
              </g>
            );
          })}
        </svg>
      </div>

      {/* trace + state */}
      <div className="grid md:grid-cols-[1.4fr_1fr] border-t bw-rule font-mono text-xs">
        <div className="p-4 md:border-r bw-rule min-h-[13rem]">
          <p className="bw-muted mb-3">trace</p>
          <ol className="space-y-1.5">
            {past.slice(-8).map((s, i, arr) => (
              <li key={`${scenario.key}-${stepIndex - arr.length + 1 + i}`} className={i === arr.length - 1 ? "bw-accent" : "bw-muted"}>
                <span className="opacity-60">{String(stepIndex - arr.length + 2 + i).padStart(2, "0")} </span>
                {s.log}
              </li>
            ))}
          </ol>
        </div>
        <div className="p-4 border-t md:border-t-0 bw-rule">
          <p className="bw-muted mb-3">state (RAGState)</p>
          <dl className="grid grid-cols-[auto_1fr] gap-x-4 gap-y-1.5">
            {Object.entries(state).map(([k, v]) => (
              <div key={k} className="contents">
                <dt className="bw-muted">{k}</dt>
                <dd className={changedKeys.has(k) ? "bw-accent" : ""}>{v}</dd>
              </div>
            ))}
          </dl>
        </div>
      </div>
    </div>
  );
};

export default AgentGraph;
