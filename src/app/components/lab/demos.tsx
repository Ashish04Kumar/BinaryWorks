"use client";
// Every live demo, by the `demo` key used in src/data/profile.ts. Add a new project's component here.
import dynamic from "next/dynamic";
import type { ComponentType } from "react";
import ScholarLensDemo from "./ScholarLensDemo";
import type { AiWork } from "@/data/profile";

// three.js, the face and the vision models load only when Glitch is opened
const GlitchDemo = dynamic(() => import("../glitch/GlitchDemo"), {
  ssr: false,
  loading: () => <div className="h-[480px] grid place-items-center font-mono text-xs bw-muted border bw-rule rounded-lg">booting Glitch…</div>,
});

export const DEMOS: Record<NonNullable<AiWork["demo"]>, ComponentType> = {
  glitch: GlitchDemo,
  scholarlens: ScholarLensDemo,
};
