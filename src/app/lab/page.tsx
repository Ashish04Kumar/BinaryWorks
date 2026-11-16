import type { Metadata } from "next";
import LabExplorer from "./LabExplorer";
import "./lab.scss";

export const metadata: Metadata = {
  title: "AI Lab · Ashish Kumar",
  description: "Try Ashish Kumar's AI projects live in the browser: Glitch, a voice AI companion with IoT control, and ScholarLens, an agentic RAG app for research papers.",
};

export default function LabPage() {
  return (
    <main className="theme-bg-primary theme-text-primary">
      <LabExplorer />
    </main>
  );
}
