"use client";
import { MouseEvent, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import type { ProjectItem } from "@/data/projects";

type Preview = { src: string; x: number; y: number } | null;

// Numbered list of projects; on desktop a screenshot follows the cursor over each row.
type Item = ProjectItem & { label: string };

const ProjectIndex = ({ items }: { items: Item[] }) => {
  const [preview, setPreview] = useState<Preview>(null);

  const track = (src: string) => (e: MouseEvent) =>
    setPreview({ src, x: e.clientX, y: e.clientY });

  return (
    <div onMouseLeave={() => setPreview(null)}>
      <ul className="border-t bw-rule">
        {items.map((p, i) => (
          <li key={p.title} className="border-b bw-rule" data-stagger style={{ "--i": i } as React.CSSProperties}>
            <Link
              href={`/projects?filter=all&project=${encodeURIComponent(p.title)}`}
              onMouseMove={track(p.image)}
              className="group grid grid-cols-[2.5rem_1fr_auto] md:grid-cols-[3.5rem_1fr_15rem_5.5rem] items-baseline gap-x-4 py-5 md:py-6 transition-colors bw-row-link"
            >
              <span className="font-mono text-sm bw-muted">{String(i + 1).padStart(2, "0")}</span>
              <span className="text-xl md:text-3xl font-semibold tracking-tight group-hover:translate-x-1 transition-transform">
                {p.label}
              </span>
              <span className="hidden md:block font-mono text-xs bw-muted truncate">
                {p.tech.slice(0, 3).join(" · ")}
              </span>
              <span className="flex items-center justify-end gap-2 font-mono text-xs bw-muted">
                <span className="hidden sm:inline">
                  {p.category === "my" ? "personal" : "work"}
                </span>
                <ArrowUpRight className="w-4 h-4 bw-group-accent" />
              </span>
            </Link>
          </li>
        ))}
      </ul>

      {preview && (
        <div
          className="hidden md:block fixed z-30 pointer-events-none w-80 aspect-[16/10] rounded-md overflow-hidden border bw-rule shadow-2xl"
          style={{ left: preview.x + 24, top: preview.y - 100 }}
        >
          <Image src={preview.src} alt="" fill sizes="320px" className="object-cover object-top" />
        </div>
      )}
    </div>
  );
};

export default ProjectIndex;
