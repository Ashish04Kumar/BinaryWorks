"use client";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import remarkMath from "remark-math";
import rehypeKatex from "rehype-katex";
import "katex/dist/katex.min.css";

// Model output -> what remark-math understands: \[..\] and \(..\) become $$..$$ and $..$,
// and [p. 4] / 【p. 4】 page citations become links that render as small chips.
function normalise(text: string) {
  return text
    .replace(/\\\[([\s\S]*?)\\\]/g, (_, m) => `\n$$\n${m.trim()}\n$$\n`)
    .replace(/\\\(([\s\S]*?)\\\)/g, (_, m) => `$${m.trim()}$`)
    .replace(/[\[【]p\.\s?(\d+(?:\s?[,–-]\s?\d+)*)[\]】]/g, (_, p) => `[p. ${p}](#cite)`);
}

// Markdown + maths for LLM answers. Raw HTML in the model's text is never rendered.
const Answer = ({ text, streaming = false }: { text: string; streaming?: boolean }) => (
  <div className={`bw-answer ${streaming ? "is-streaming" : ""}`}>
    <ReactMarkdown
      remarkPlugins={[remarkGfm, remarkMath]}
      rehypePlugins={[rehypeKatex]}
      components={{
        a: ({ href, children }) =>
          href === "#cite" ? (
            <span className="font-mono text-[11px] px-1.5 py-0.5 rounded bw-tint bw-accent whitespace-nowrap">{children}</span>
          ) : (
            <a href={href} target="_blank" rel="noopener noreferrer" className="bw-accent underline underline-offset-2">
              {children}
            </a>
          ),
      }}
    >
      {normalise(text)}
    </ReactMarkdown>
  </div>
);

export default Answer;
