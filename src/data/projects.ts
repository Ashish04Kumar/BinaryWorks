// All portfolio projects. "associated" = built at work, "my" = personal.

export type ProjectItem = {
  title: string;
  description: string;
  tech: string[];
  image: string;
  category: "associated" | "my" | string;
  github?: string;
  githubFrontend?: string;
  githubBackend?: string;
  live?: string;
  liveAdmin?: string;
  liveClient?: string;
  // Link to a live demo on this site (e.g. "/#glitch")
  demo?: string;
  // Built mostly by directing an AI coding agent; shown with a "Vibe-coded" badge
  vibeCoded?: boolean;
};

export const projects: ProjectItem[] = [
  {
    title: "Glitch: Voice Companion Robot",
    description:
      "<p>An AI companion that lives on my desk. It talks with you, and it also remembers what you tell it, keeps your notes, reminders, lists and to-dos, and controls devices around the room (IoT). It has a round face that shows its moods, a head that turns on two servos, and a camera that sees hand gestures and people.</p><p>Its brain started as a separate project, <strong>Umbrella</strong> (memory, tools and live voice), and now powers Glitch. It runs on my laptop today and moves to a Raspberry Pi next.</p>",
    tech: ["Python", "LangGraph", "FastAPI", "PostgreSQL", "LiveKit", "MediaPipe", "YOLO", "Raspberry Pi", "PCA9685"],
    image: "/assets/projects/personal/glitch/cover.webp",
    category: "my",
    demo: "/#glitch",
  },
  {
    title: "ScholarLens: Research Paper Assistant",
    description:
      "<p>An <strong>Agentic RAG</strong> app: ask questions about research papers and get answers with page numbers. Upload a PDF, or paste a link or an arXiv ID. For each question it decides whether to search the paper, check a claim against newer research, or just answer, and tries a better search if the first one misses.</p><p>Tested for accuracy with DeepEval and deployed with Docker on AWS.</p>",
    tech: ["LangGraph", "LangChain", "Qdrant", "Cohere", "Groq", "Gemini", "Tavily", "DeepEval", "Streamlit", "Docker", "AWS"],
    image: "/assets/projects/personal/scholarlens/graph.svg",
    category: "my",
    live: "https://scholarlens.duckdns.org/",
    demo: "/#scholarlens",
  },
  {
    title: "Saarthi: Animated Desktop Companion",
    description: `<p>A desktop companion that lives on your screen and reacts to what you do: it sweats when you type fast, ponders when you slow down, grabs popcorn for tutorials and falls asleep when you walk away.</p>
<ul>
<li><strong>Knows your activity:</strong> typing speed, scrolling, videos and music, away and asleep, from a small unit-tested state machine. Counts how fast you type, never what.</li>
<li><strong>Looks after you:</strong> break and lunch modes, guided breathing, stretch and water nudges, reminders with done/skipped tracking, notes and a synced calendar.</li>
<li><strong>Your day:</strong> morning brief, weather with outfits and rain warnings, and the traffic home before logout.</li>
<li><strong>Vibe-coded:</strong> I directed an AI coding agent, designed the character and behaviour, and tested it daily; the AI wrote most of the code.</li>
</ul>`,
    tech: ["Python", "PySide6 (Qt)", "evdev / pynput", "D-Bus MPRIS / WinRT", "iCalendar", "pytest", "Claude Code"],
    image: "/assets/projects/personal/saarthi/cover.webp",
    category: "my",
    github: "https://github.com/Ashish04Kumar/saarthi",
    demo: "/saarthi",
    vibeCoded: true,
  },
  {
    title: "Smart RAG Chatbot Platform",
    description: `<p>A platform that turns a company's PDFs, documents and web pages into a chatbot that answers with sources, so every answer can be checked.</p>
<ul>
<li><strong>Hybrid search:</strong> searches by meaning and by keywords at once (FAISS + BM25) and merges the results.</li>
<li><strong>Fast and cheap:</strong> repeat questions come from a cache; follow-ups are rewritten to stand on their own.</li>
<li><strong>Reliable:</strong> whole documents can go to Gemini, with Claude as a fallback; new files are processed in the background.</li>
<li><strong>My part:</strong> most of the web app (chat with sources that jump to the exact PDF page, bot builder, voice in and out) plus Flask features: feedback emails, embed security and an admin role.</li>
</ul>`,
    tech: [
      "Next.js",
      "Flask",
      "LangChain",
      "TypeScript",
      "Redux Toolkit",
      "react-pdf",
      "PostgreSQL",
      "Redis + RQ",
      "FAISS + BM25",
      "OpenAI embeddings",
      "Gemini",
      "Claude",
    ],
    image: "/assets/projects/work/rag-chatbot/cover.webp",
    category: "associated",
  },
  {
    title: "Hilux Booking Portal for Toyota GB",
    description: `<p>The booking system behind Toyota GB's Hilux programme: dealers book slots at Toyota centres for each vehicle by its VIN.</p>
<ul>
<li><strong>End-to-end frontend:</strong> I built the whole frontend on Next.js 16 and React 19.</li>
<li><strong>Enterprise sign-in:</strong> Toyota single sign-on with MFA, and roles and permissions for every screen.</li>
<li><strong>Real operations:</strong> calendar and table views, weekly slot capacity, blocked weeks, bulk VIN uploads and reports.</li>
<li><strong>At a glance:</strong> a live dashboard of bookings, cancellations, VINs used and how full each week is.</li>
</ul>`,
    tech: [
      "Next.js 16",
      "React 19",
      "TypeScript",
      "TanStack Query",
      "TanStack Table",
      "NextAuth (SSO)",
      "AWS Amplify",
      "React Hook Form",
      "React Bootstrap",
      "dnd-kit",
    ],
    image: "/assets/projects/work/booking-portal/cover.webp",
    category: "associated",
  },
  {
    title: "Company Website Platform",
    description:
      "<p>A multi-page company website managed entirely from a CMS. I built the pages, designed the content structure in Strapi, wired it to the frontend and made the site faster.</p>",
    tech: ["Next.js", "TypeScript", "Strapi CMS"],
    image: "/assets/projects/work/company-site/cover.webp",
    category: "associated",
  },
  {
    title: "Fund Management Dashboard for UAE Ministry",
    description: `<p>A system for a UAE government ministry to plan, approve and track its budgets across programmes, projects and contracts.</p>
<ul>
<li><strong>Bilingual:</strong> full Arabic and English, right-to-left included.</li>
<li><strong>Live approvals:</strong> every approval step and fund movement updates in real time over Socket.io, with an audit trail.</li>
<li><strong>Data-heavy UI:</strong> nested, editable tables with comments and attachments, and clickable charts for drill-down.</li>
<li><strong>Reporting:</strong> one-click exports to PDF and Excel.</li>
</ul>`,
    tech: [
      "Next.js",
      "TypeScript",
      "Redux Toolkit",
      "TanStack Table",
      "Socket.io",
      "Recharts / Chart.js",
      "i18n (RTL)",
    ],
    image: "/assets/projects/work/fund-management/cover.webp",
    category: "associated",
  },
  {
    title: "Live Range Training & Shot Analytics",
    description: `<p>A live system for shooting-range training. A camera watches each target, every shot is detected and measured the moment it lands, and instructors see the score on screen while the session is still running.</p>
<ul>
<li><strong>Live camera streams:</strong> each lane's camera streams to the dashboard, with connection status, latency and automatic reconnects when a feed drops.</li>
<li><strong>Automatic shot detection:</strong> hits are found on the camera image, measured in cm from the centre, placed in their scoring ring and added to the score with no manual counting.</li>
<li><strong>Shot-by-shot view:</strong> every hit marked on the target with its distance, the group size, and a live table and leaderboard for all lanes.</li>
<li><strong>Full session flow:</strong> set up range, weapon, position, firing type and trainees per lane; start, run and end sessions; review history and accuracy trends, and export reports.</li>
</ul>`,
    tech: [
      "Next.js",
      "TypeScript",
      "Redux Toolkit",
      "TanStack Table",
      "Recharts / Chart.js",
      "CSV Parsing",
    ],
    image: "/assets/projects/work/training-analytics/cover.webp",
    category: "associated",
  },
  {
    title: "Global Travel Planner",
    description:
      "<p>A travel site where people explore destinations on an interactive map, find deals and build their own trip packages. Built to load fast and rank well in search.</p>",
    tech: [
      "Next.js",
      "TypeScript",
      "React Simple Maps",
      "Context Api",
      "CMS-Strapi",
    ],
    image: "/assets/projects/work/travel-planner/cover.webp",
    category: "associated",
  },
  {
    title: "Cultural Events Platform",
    description:
      "<p>A full-stack website for a cultural centre to run its events, classes and archives. I built both sides: Next.js on the front, Node.js and MongoDB with JWT sign-in on the back, and a layout that works on every screen size.</p>",
    tech: ["Next.js", "TypeScript", "Node.js", "MongoDB", "Mongoose", "JWT"],
    image: "/assets/projects/work/cultural-events/cover.webp",
    category: "associated",
  },
  {
    title: "Corporate Website Platform",
    description:
      "<p>A company website for a UAE branch in both Arabic and English, built to be fast, search-friendly and responsive.</p>",
    tech: ["Next.js", "TypeScript", "Redux Toolkit"],
    image: "/assets/projects/work/corporate-site/cover.webp",
    category: "associated",
  },
  {
    title: "Team Collaboration Tool",
    description:
      "<p>A Slack-style team chat. I added a full rich-text editor (Quill), threaded replies, redesigned the interface and fixed the performance issues that slowed it down.</p>",
    tech: [
      "Vanilla JS",
      "Socket.io",
      "Quill rich-text editor",
      "Django",
      "Python",
      "Postgres SQL",
    ],
    image: "/assets/projects/work/team-chat/cover.webp",
    category: "associated",
  },
];
