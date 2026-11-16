"use client";
// Small generative artworks for /lab: a muted dusk palette (a nod to synthwave), soft shapes and film grain.
// Colours come from CSS variables on .lab-page, so they follow the light / dark theme.
import { useId } from "react";

// Shared defs: the dusk sky, the sun and a grain texture laid over everything
const Defs = ({ id }: { id: string }) => (
  <defs>
    <linearGradient id={`${id}-sky`} x1="0" y1="0" x2="0" y2="1">
      <stop offset="0" stopColor="var(--l2-sky-1)" />
      <stop offset="0.55" stopColor="var(--l2-sky-2)" />
      <stop offset="1" stopColor="var(--l2-sky-3)" />
    </linearGradient>
    <linearGradient id={`${id}-sun`} x1="0" y1="0" x2="0" y2="1">
      <stop offset="0" stopColor="var(--l2-sun-1)" />
      <stop offset="1" stopColor="var(--l2-sun-2)" />
    </linearGradient>
    <filter id={`${id}-grain`} x="0" y="0" width="100%" height="100%">
      <feTurbulence type="fractalNoise" baseFrequency="0.9" numOctaves="2" stitchTiles="stitch" />
      <feColorMatrix type="saturate" values="0" />
      <feComponentTransfer>
        <feFuncA type="table" tableValues="0 0.18" />
      </feComponentTransfer>
      <feBlend in2="SourceGraphic" mode="multiply" />
    </filter>
    {/* the classic striped lower half of the sun, kept thin and quiet */}
    <mask id={`${id}-stripes`}>
      <rect width="400" height="400" fill="#fff" />
      {[0, 1, 2, 3, 4].map((i) => (
        <rect key={i} x="0" y={232 + i * 13} width="400" height={2 + i * 1.2} fill="#000" />
      ))}
    </mask>
  </defs>
);

const Grain = ({ id }: { id: string }) => <rect width="400" height="400" fill="transparent" filter={`url(#${id}-grain)`} />;

// Horizon and a faint perspective grid under it
const Horizon = ({ y = 290 }: { y?: number }) => (
  <g className="l2-art-floor">
    <rect x="0" y={y} width="400" height={400 - y} fill="var(--l2-ground)" />
    <line x1="0" y1={y} x2="400" y2={y} stroke="var(--l2-line)" strokeWidth="1.2" />
    {[-260, -170, -90, -30, 30, 90, 170, 260].map((dx) => (
      <line key={dx} x1={200 + dx * 0.18} y1={y} x2={200 + dx * 1.6} y2="400" stroke="var(--l2-line)" strokeWidth="0.6" opacity="0.55" />
    ))}
    {[0, 1, 2, 3].map((i) => (
      <line key={i} className="l2-art-row" style={{ "--i": i } as React.CSSProperties} x1="0" x2="400" y1={y + 12 + i * i * 9} y2={y + 12 + i * i * 9} stroke="var(--l2-line)" strokeWidth="0.6" opacity="0.45" />
    ))}
  </g>
);

/** The hero's background: abstract on purpose, so it doesn't repeat the project cards below. Soft colour clouds,
 *  a few slow wave lines, a small network of nodes that light up now and then, and a synth grid fading out at the
 *  bottom. No frame: the wrapper (.l2-backdrop) fades its edges into the page. */
export const BackdropArt = () => {
  const id = useId().replace(/:/g, "");
  const horizon = 540;
  // the network: nodes and the links between them
  const nodes: [number, number][] = [
    [690, 170], [790, 110], [880, 190], [985, 130], [1080, 210], [930, 300], [800, 270], [1140, 120],
  ];
  const links: [number, number][] = [[0, 1], [1, 2], [2, 3], [3, 4], [2, 5], [5, 6], [6, 0], [3, 7], [4, 5]];
  const wave = (y: number, a: number, f: number, p: number) =>
    "M 420 " + y + " " + Array.from({ length: 33 }, (_, i) => {
      const x = 420 + i * 25;
      return `L ${x} ${(y + Math.sin(i * f + p) * a).toFixed(1)}`;
    }).join(" ");
  return (
    <svg viewBox="0 0 1200 700" preserveAspectRatio="xMidYMid slice" className="l2-art" aria-hidden>
      <Defs id={id} />
      <defs>
        <filter id={`${id}-cloud`} x="-50%" y="-50%" width="200%" height="200%">
          <feGaussianBlur stdDeviation="60" />
        </filter>
      </defs>

      {/* colour clouds */}
      <g filter={`url(#${id}-cloud)`} className="l2-art-clouds">
        <ellipse cx="900" cy="260" rx="260" ry="170" fill="var(--l2-sun-1)" opacity="0.45" />
        <ellipse cx="1040" cy="380" rx="220" ry="150" fill="var(--l2-sun-2)" opacity="0.35" />
        <ellipse cx="760" cy="400" rx="240" ry="140" fill="var(--l2-sky-3)" opacity="0.55" />
      </g>

      {/* slow wave lines */}
      <g fill="none" stroke="var(--l2-line)" strokeWidth="1.1" opacity="0.75">
        <path className="l2-art-wave" d={wave(400, 18, 0.32, 0)} />
        <path className="l2-art-wave" style={{ animationDelay: "-3s" }} d={wave(428, 14, 0.3, 1.1)} opacity="0.7" />
        <path className="l2-art-wave" style={{ animationDelay: "-6s" }} d={wave(456, 10, 0.28, 2.2)} opacity="0.5" />
      </g>

      {/* the network */}
      <g opacity="0.85">
        {links.map(([a, b]) => (
          <line key={`${a}-${b}`} x1={nodes[a][0]} y1={nodes[a][1]} x2={nodes[b][0]} y2={nodes[b][1]} stroke="var(--l2-line)" strokeWidth="1" />
        ))}
        {nodes.map(([x, y], i) => (
          <circle key={i} className="l2-art-node" style={{ "--i": i } as React.CSSProperties} cx={x} cy={y} r={i % 3 === 0 ? 6.5 : 4.5} fill="var(--l2-paper)" stroke="var(--l2-line)" strokeWidth="1.1" />
        ))}
      </g>

      {/* synth grid, fading out towards the top */}
      <g className="l2-art-floor" opacity="0.6">
        <line x1="440" y1={horizon} x2="1200" y2={horizon} stroke="var(--l2-line)" strokeWidth="1.1" />
        {[-420, -300, -190, -90, 0, 90, 190, 300, 420, 560].map((dx) => (
          <line key={dx} x1={900 + dx * 0.25} y1={horizon} x2={900 + dx * 1.9} y2="700" stroke="var(--l2-line)" strokeWidth="0.8" opacity="0.6" />
        ))}
        {[0, 1, 2, 3].map((i) => (
          <line key={i} className="l2-art-row" style={{ "--i": i } as React.CSSProperties} x1="440" x2="1200" y1={horizon + 14 + i * i * 14} y2={horizon + 14 + i * i * 14} stroke="var(--l2-line)" strokeWidth="0.8" opacity="0.5" />
        ))}
      </g>
    </svg>
  );
};

/** Glitch: two soft eyes looking out over the horizon; they blink now and then. */
export const GlitchArt = () => {
  const id = useId().replace(/:/g, "");
  return (
    <svg viewBox="0 0 400 400" preserveAspectRatio="xMidYMid slice" className="l2-art" aria-hidden>
      <Defs id={id} />
      <rect width="400" height="400" fill={`url(#${id}-sky)`} />
      <circle cx="200" cy="300" r="150" fill={`url(#${id}-sun)`} opacity="0.55" />
      <Horizon y={300} />
      <g className="l2-art-eyes">
        <rect x="140" y="150" width="48" height="78" rx="20" fill="var(--l2-ink)" />
        <rect x="212" y="150" width="48" height="78" rx="20" fill="var(--l2-ink)" />
        <circle cx="168" cy="172" r="6" fill="var(--l2-sky-1)" opacity="0.8" />
        <circle cx="240" cy="172" r="6" fill="var(--l2-sky-1)" opacity="0.8" />
      </g>
      <path d="M186 254 q14 10 28 0" fill="none" stroke="var(--l2-ink)" strokeWidth="5" strokeLinecap="round" />
      <Grain id={id} />
    </svg>
  );
};

/** ScholarLens: loose paper pages, and a lens that finds the line that matters. */
export const RagArt = () => {
  const id = useId().replace(/:/g, "");
  return (
    <svg viewBox="0 0 400 400" preserveAspectRatio="xMidYMid slice" className="l2-art" aria-hidden>
      <Defs id={id} />
      <rect width="400" height="400" fill={`url(#${id}-sky)`} />
      <g transform="rotate(-8 200 210)">
        <rect x="112" y="98" width="170" height="220" rx="4" fill="var(--l2-paper)" opacity="0.55" />
      </g>
      <g transform="rotate(4 200 210)">
        <rect x="118" y="92" width="170" height="220" rx="4" fill="var(--l2-paper)" />
        {[0, 1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
          <rect key={i} x="138" y={122 + i * 20} width={i % 3 === 2 ? 90 : 128} height="5" rx="2.5" fill="var(--l2-ink)" opacity={i === 4 ? 0.85 : 0.18} />
        ))}
      </g>
      <g className="l2-art-lens">
        <circle cx="236" cy="208" r="44" fill={`url(#${id}-sun)`} opacity="0.42" stroke="var(--l2-ink)" strokeWidth="5" />
        <line x1="268" y1="240" x2="304" y2="276" stroke="var(--l2-ink)" strokeWidth="9" strokeLinecap="round" />
      </g>
      <Grain id={id} />
    </svg>
  );
};

/** Any future project: a calm abstract until it gets its own piece. */
export const DefaultArt = () => {
  const id = useId().replace(/:/g, "");
  return (
    <svg viewBox="0 0 400 400" preserveAspectRatio="xMidYMid slice" className="l2-art" aria-hidden>
      <Defs id={id} />
      <rect width="400" height="400" fill={`url(#${id}-sky)`} />
      <circle cx="160" cy="180" r="90" fill={`url(#${id}-sun)`} opacity="0.8" />
      <circle cx="250" cy="230" r="70" fill="var(--l2-paper)" opacity="0.6" />
      <Horizon y={310} />
      <Grain id={id} />
    </svg>
  );
};

export const ART: Record<string, () => React.JSX.Element> = { glitch: GlitchArt, scholarlens: RagArt };
