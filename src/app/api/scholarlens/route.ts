// ScholarLens, web edition: the same LangGraph flow as backend/rag_graph.py, run step by step,
// over one preloaded paper. Returns the answer plus a trace that the graph on the page replays.
//
// Differences from the real app (said in the UI too): BM25 keyword search instead of Qdrant vectors,
// the agent always searches once instead of deciding with an LLM, and no saved chats.

import paper from "@/data/scholarlens/batchnorm.json";
import { createIndex } from "@/lib/bm25";
import { chat, chatJson, chatStream, LlmUnavailable, llmConfigured, type ChatMessage } from "@/lib/groq";
import { allow, clientIp } from "@/lib/rateLimit";
import { logLlm } from "@/lib/analytics/server";

export const runtime = "nodejs";

const search = createIndex(paper.chunks);
const K = 4;

type Step = { node: string; edge?: string; log: string; state?: Record<string, string> };
type Chunk = { id: number; page: number; text: string };

const PAPER = `"${paper.title}" (${paper.authors}, ${paper.year}, arXiv ${paper.arxiv})`;

const ROUTER_SYSTEM = `You are a routing assistant for a research paper Q&A system. One paper is loaded: ${PAPER}.
Classify the user query into exactly one category:
- retrieve: questions about the content of the loaded paper (methods, results, conclusions, authors, details).
- verify_claim: the user wants to check whether a specific claim or finding is still current or has been superseded by newer research.
- direct_answer: general knowledge or conversational questions that do not need the paper.
Return JSON: {"route": "retrieve" | "verify_claim" | "direct_answer"}`;

const RELEVANCY_SYSTEM = `You are evaluating whether retrieved document chunks are relevant enough to answer a user's question about research papers.
Return is_relevant=true if the chunks contain information that meaningfully addresses the question, even partially. Return is_relevant=false only if the chunks are clearly off-topic or contain no useful information.
Be lenient: if there is any substantive overlap, return true. Broad questions (summarise, key contributions, main results) are answered from the paper as a whole: if the chunks come from the paper the question is about, return true.
Chunks may start mid-sentence; judge the topic, not the formatting.
Return JSON: {"is_relevant": true | false, "reason": "<short>"}`;

const REWRITE_SYSTEM = `You are a query rewriting assistant for a research paper retrieval system. The previous query failed to retrieve relevant document chunks. Rewrite the query using more specific or alternative terminology, domain-specific keywords, or a narrower sub-question.
Return ONLY the rewritten query as plain text. No explanation, no preamble.`;

const ANSWER_SYSTEM = `You are ScholarLens, a research assistant. Answer the user's question about ${PAPER} using only the provided excerpts.
- End every sentence that uses the excerpts with its page, like [p. 3] or [p. 3, 5]. Only cite pages that appear in the excerpts.
- If the excerpts only partly answer the question, say what is missing.
- Be clear and compact: a short paragraph, or a few bullet points when there are several parts.
- Format with Markdown: **bold** for key terms, "-" bullets, and a short "###" heading only if the answer has sections.
- Write maths in LaTeX: inline as $x$ and on its own line as $$\\hat{x} = \\frac{x - \\mu}{\\sigma}$$. Never use \\( \\) or \\[ \\].`;

const CLAIM_SYSTEM = `You are a research fact-checker. Given a claim from a research paper and a set of recent web and arXiv search results, decide whether the claim has been superseded, significantly challenged, or updated by more recent work, and identify up to 3 papers from the results that do so.
Use ONLY titles and URLs that appear verbatim in the results. Prefer arxiv.org links. If the claim still holds, set is_superseded=false with an empty list.
Return JSON: {"is_superseded": bool, "verdict_summary": "<1-2 sentences>", "superseding_papers": [{"title": "", "url": "", "summary": ""}]}`;

const excerpts = (chunks: Chunk[]) => chunks.map((c) => `[p. ${c.page}] ${c.text}`).join("\n\n");

async function tavily(query: string): Promise<{ title: string; url: string; content: string }[]> {
  const key = process.env.TAVILY_API_KEY;
  if (!key) return [];
  const res = await fetch("https://api.tavily.com/search", {
    method: "POST",
    headers: { "Content-Type": "application/json", Authorization: `Bearer ${key}` },
    body: JSON.stringify({ query, max_results: 4 }),
    signal: AbortSignal.timeout(15_000),
  });
  if (!res.ok) return [];
  const data = await res.json();
  return (data.results || []).map((r: { title: string; url: string; content: string }) => ({
    title: r.title,
    url: r.url,
    content: (r.content || "").slice(0, 500),
  }));
}

type Emit = (event: Record<string, unknown>) => void;

// Runs the graph, sending each step as it happens and the final answer token by token
async function run(question: string, emit: Emit) {
  const add = (step: Step) => emit({ type: "step", step });
  const streamAnswer = async (messages: ChatMessage[], maxTokens: number) => {
    let text = "";
    for await (const piece of chatStream(messages, { maxTokens })) {
      text += piece;
      emit({ type: "token", t: piece });
    }
    return text;
  };

  // router
  const { route } = await chatJson<{ route: string }>(
    [
      { role: "system", content: ROUTER_SYSTEM },
      { role: "user", content: question },
    ],
    { route: "retrieve" }
  );
  const picked = ["retrieve", "verify_claim", "direct_answer"].includes(route) ? route : "retrieve";
  emit({ type: "route", route: picked });
  add({ node: "router", edge: "start-router", log: `router: LLM returns RouterDecision → ${picked}`, state: { route: picked } });

  let sources: Chunk[] = [];
  let answer = "";

  if (picked === "retrieve") {
    let query = question;
    for (let attempt = 0; attempt < 2; attempt++) {
      add({
        node: "agent",
        edge: attempt === 0 ? "router-agent" : "rewrite-agent",
        log: `agent_node: tool_call → retriever("${query.slice(0, 60)}")`,
      });
      const found = search(query, K);
      add({
        node: "retrieval",
        edge: "agent-retrieval",
        log: `retrieval: ${found.length} chunks (pages ${[...new Set(found.map((c) => c.page))].join(", ") || "none"})`,
        state: { retrieved_docs: `${found.length} chunks`, retrieval_attempts: "1" },
      });
      add({ node: "agent", edge: "retrieval-agent", log: "agent_node: search cap reached, no new tool_calls" });

      const grade = found.length
        ? await chatJson<{ is_relevant: boolean; reason: string }>(
            [
              { role: "system", content: RELEVANCY_SYSTEM },
              { role: "user", content: `Question: ${question}\n\nChunks:\n${excerpts(found)}` },
            ],
            { is_relevant: true, reason: "" }
          )
        : { is_relevant: false, reason: "nothing matched" };
      add({
        node: "relevancy",
        edge: "agent-relevancy",
        log: `relevancy_check: ${grade.is_relevant ? "relevant" : "not relevant"}${grade.reason ? ` (${grade.reason.slice(0, 70)})` : ""}`,
        state: { is_relevant: String(Boolean(grade.is_relevant)) },
      });
      sources = found;
      if (grade.is_relevant || attempt === 1) break;

      query = await chat(
        [
          { role: "system", content: REWRITE_SYSTEM },
          { role: "user", content: `Original query: ${question}\n\nWrite an improved search query.` },
        ],
        { maxTokens: 200 }
      );
      add({
        node: "rewrite",
        edge: "relevancy-rewrite",
        log: `query_rewrite: "${query.slice(0, 70)}"`,
        state: { rewrite_count: "1", retrieval_attempts: "0", retrieved_docs: "[]", is_relevant: "None" },
      });
    }

    emit({ type: "sources", sources: sources.map(({ page, text }) => ({ page, text })) });
    add({ node: "generate", edge: "relevancy-generate", log: "generate_answer: grounded answer with page citations" });
    answer = await streamAnswer(
      [
        { role: "system", content: ANSWER_SYSTEM },
        { role: "user", content: `Excerpts:\n${excerpts(sources)}\n\nQuestion: ${question}` },
      ],
      900
    );
  } else if (picked === "verify_claim") {
    const results = [...(await tavily(question)), ...(await tavily(`${question} site:arxiv.org`))];
    if (!results.length) {
      add({ node: "verify", edge: "router-verify", log: "verify_claim: web search is off in this demo, checking the paper only" });
      sources = search(question, K);
      emit({ type: "sources", sources: sources.map(({ page, text }) => ({ page, text })) });
      add({ node: "verify", log: "verify_claim: verdict from the paper only", state: { claim_verdict: "paper only" } });
      add({ node: "generate", edge: "verify-generate", log: "generate_answer: what the paper claims" });
      answer = await streamAnswer(
        [
          { role: "system", content: ANSWER_SYSTEM },
          {
            role: "user",
            content: `Excerpts:\n${excerpts(sources)}\n\nThe user wants to verify this claim: ${question}\nSay what the paper itself claims, and note plainly that checking newer research needs web search, which is turned off in this web demo.`,
          },
        ],
        700
      );
    } else {
      add({ node: "verify", edge: "router-verify", log: `verify_claim: Tavily web + site:arxiv.org → ${results.length} results` });
      const verdict = await chatJson<{ is_superseded: boolean; verdict_summary: string; superseding_papers: { title: string; url: string; summary: string }[] }>(
        [
          { role: "system", content: CLAIM_SYSTEM },
          {
            role: "user",
            content: `Claim: ${question}\n\nResults:\n${results.map((r) => `- ${r.title} (${r.url}): ${r.content}`).join("\n")}`,
          },
        ],
        { is_superseded: false, verdict_summary: "", superseding_papers: [] }
      );
      add({
        node: "verify",
        log: "verify_claim: LLM judges the evidence → ClaimVerificationResult",
        state: { claim_verdict: verdict.is_superseded ? "superseded" : "still holds", superseding_papers: `${verdict.superseding_papers.length} links` },
      });
      add({ node: "generate", edge: "verify-generate", log: "generate_answer: verdict for the user" });
      answer = [
        `**Verdict:** ${verdict.is_superseded ? "superseded or updated" : "still holds"}. ${verdict.verdict_summary}`,
        ...verdict.superseding_papers.map((p) => `- [${p.title}](${p.url}): ${p.summary}`),
      ].join("\n");
      emit({ type: "token", t: answer });
    }
  } else {
    add({ node: "generate", edge: "router-generate", log: "generate_answer: answers without retrieval" });
    answer = await streamAnswer(
      [
        { role: "system", content: "You are ScholarLens, a research assistant. Answer this general question briefly and clearly. Format with Markdown and write maths as $...$ or $$...$$." },
        { role: "user", content: question },
      ],
      600
    );
  }

  add({ node: "summarize", edge: "generate-summarize", log: "summarize: skipped here (the web demo keeps no chat history)", state: { answer: `${answer.length} chars` } });
  add({ node: "end", edge: "summarize-end", log: "done (the real app saves a SQLite checkpoint here)" });
}

export async function POST(req: Request) {
  if (!llmConfigured()) {
    return Response.json({ error: "The live demo is offline right now (no LLM key configured)." }, { status: 503 });
  }
  const limit = allow(clientIp(req));
  if (!limit.ok) return Response.json({ error: limit.reason }, { status: 429 });

  const body = await req.json().catch(() => ({}));
  const question = String(body?.question || "").trim().slice(0, 500);
  if (!question) return Response.json({ error: "Ask a question about the paper." }, { status: 400 });

  // Newline-delimited JSON: {type:"route"|"step"|"sources"|"token"|"done"|"error", ...}
  const encoder = new TextEncoder();
  const stream = new ReadableStream({
    async start(controller) {
      // also keep what was streamed, for the visitor log
      const started = Date.now();
      let answer = "";
      let route = "";
      let ok = true;
      const emit: Emit = (event) => {
        if (event.type === "token") answer += String(event.t ?? "");
        if (event.type === "route") route = String(event.route ?? "");
        controller.enqueue(encoder.encode(JSON.stringify(event) + "\n"));
      };
      try {
        await run(question, emit);
        emit({ type: "done" });
      } catch (e) {
        ok = false;
        answer = answer || String(e);
        const offline = e instanceof LlmUnavailable;
        console.error("scholarlens demo:", e);
        emit({ type: "error", error: offline ? "The live demo is offline right now." : "Something went wrong while answering. Please try again." });
      } finally {
        controller.close();
        await logLlm(req, { endpoint: "scholarlens", input: question, output: answer, ms: Date.now() - started, ok, extra: { route } });
      }
    },
  });
  return new Response(stream, { headers: { "Content-Type": "application/x-ndjson; charset=utf-8", "Cache-Control": "no-store" } });
}
