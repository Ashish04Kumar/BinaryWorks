// Single source of truth for the portfolio. Home, About and Resume all render from here.

export type Pillar = {
  key: "frontend" | "backend" | "ai";
  title: string;
  summary: string;
  skills: string[];
};

export type Experience = {
  title: string;
  company: string;
  location: string;
  period: string;
  description: string;
  skills: string[];
};

export const profile = {
  name: "Ashish Kumar",
  role: "SDE-1 · Full-Stack Engineer",
  headline: "Frontend-first full-stack engineer, building with LLMs & AI agents.",
  location: "Ahmedabad, India",
  experienceYears: "3+",
  github: "https://github.com/Ashish04Kumar",
  // TODO: replace with the real profile URL
  linkedin: "https://www.linkedin.com/in/ashish-sinha-5228171b4/",
  // TODO: add a public email to show it in the Contact section
  email: "",
  summary:
    "Software engineer with 3+ years of building web apps. Mostly frontend (React, Next.js, TypeScript), backend in Python (FastAPI, Flask), and AI agents with LangChain and LangGraph.",
};

export const pillars: Pillar[] = [
  {
    key: "frontend",
    title: "Frontend Engineering",
    summary:
      "Dashboards, live-updating screens and fast websites. Most of my work happens here.",
    skills: [
      "React",
      "Next.js (App Router)",
      "TypeScript",
      "Redux Toolkit",
      "Context API",
      "TanStack Table",
      "Recharts / Chart.js",
      "Socket.io client",
    ],
  },
  {
    key: "backend",
    title: "Backend Development",
    summary:
      "APIs in Python with FastAPI and Flask, with databases, logins and deployment to the cloud.",
    skills: [
      "Python",
      "FastAPI",
      "Flask",
      "REST APIs",
      "SSE streaming",
      "PostgreSQL",
      "MySQL",
      "JWT auth",
      "AWS EC2",
    ],
  },
  {
    key: "ai",
    title: "GenAI & Agentic AI",
    summary:
      "AI agents that search documents, use tools, remember and talk, built with LangGraph.",
    skills: [
      "LangGraph",
      "LangChain",
      "RAG",
      "Tool calling",
      "Agent memory",
      "Groq / Gemini / Ollama",
      "DeepEval",
      "Guardrails",
      "LiveKit + Pipecat voice",
      "Whisper / Piper / Sarvam",
      "MediaPipe / YOLO",
    ],
  },
];

export const tooling = ["Git & GitHub", "Vercel", "Netlify", "Postman"];

export const experience: Experience[] = [
  {
    title: "SDE-1 · Full-Stack Developer",
    company: "Bombay Softwares",
    location: "Ahmedabad, India",
    period: "Aug 2023 – Present",
    description:
      "Full-stack work across frontend, backend and GenAI. Worked on a RAG chatbot platform that answers from company documents, in both the Next.js app and the Flask backend, and built enterprise dashboards such as a bilingual fund-management system for a UAE ministry.",
    skills: ["Next.js", "React", "TypeScript", "Python", "Flask", "PostgreSQL", "LangChain", "RAG"],
  },
  {
    title: "Full-Stack Developer",
    company: "Two Dots",
    location: "Pune, India",
    period: "Jun 2023 – Aug 2023",
    description:
      "Built an IoT irrigation service for agriculture: a vanilla JS frontend talking to a Node.js backend that integrated with field devices.",
    skills: ["JavaScript", "HTML/CSS", "Node.js", "MySQL", "IoT integration"],
  },
  {
    title: "Graduate Engineer Trainee · Full-Stack",
    company: "Sterlite Technologies Ltd.",
    location: "Bengaluru, India",
    period: "Oct 2022 – Apr 2023",
    description:
      "Developed frontend and backend modules of a library management system with React and Spring Boot.",
    skills: ["React", "Java", "Spring Boot", "MySQL", "REST APIs"],
  },
  {
    title: "Programmer Analyst Intern",
    company: "Cognizant Technology Solutions",
    location: "Chennai, India",
    period: "Jun 2022 – Sep 2022",
    description:
      "Worked on databases, data warehousing and ETL pipelines using Informatica PowerCenter.",
    skills: ["SQL", "ETL", "Data Warehousing", "Informatica PowerCenter"],
  },
];

export const education = {
  degree: "B.Tech",
  school: "SRM Institute of Science and Technology",
  location: "Chennai, India",
  period: "2018 – 2022",
};

export const certifications = [
  // TODO: add the LangChain / LangGraph course (name, platform, year)
  { name: "Next.js", issuer: "Udemy", year: "2023" },
  { name: "Node.js Backend Development", issuer: "Udemy", year: "2023" },
  { name: "MongoDB for Developers", issuer: "Udemy", year: "2023" },
  { name: "TypeScript Masterclass", issuer: "Udemy", year: "2024" },
  {
    name: "Database Design and Management",
    issuer: "Coursera (University of Michigan)",
    year: "2022",
  },
  {
    name: "Specialisation in IoT",
    issuer: "Coursera (University of Michigan)",
    year: "2022",
  },
];

// Projects shown on the home page, in order. `title` must match src/data/projects.ts.
export const featuredProjects = [
  { title: "Saarthi: Animated Desktop Companion", label: "Saarthi (vibe-coded)" },
  { title: "Smart RAG Chatbot Platform", label: "RAG Chatbot Platform" },
  { title: "Hilux Booking Portal for Toyota GB", label: "Toyota GB Hilux Booking Portal" },
  { title: "Fund Management Dashboard for UAE Ministry", label: "UAE Ministry Fund Management" },
  { title: "Live Range Training & Shot Analytics", label: "Live Range Training & Shot Analytics" },
  { title: "Cultural Events Platform", label: "Cultural Events Platform" },
  { title: "Team Collaboration Tool", label: "Team Collaboration Tool" },
  { title: "Global Travel Planner", label: "Global Travel Planner" },
];

export type AiWork = {
  name: string;
  tagline: string;
  status: "shipped" | "building";
  summary: string;
  highlights: string[];
  stack: string[];
  links: { label: string; href: string }[];
  image?: { src: string; alt: string };
  // Live demo in the AI lab, if there is one. Its component is registered in components/lab/demos.tsx.
  // To add a project to /lab: give it a demo key and a `lab` card, then register the component.
  demo?: "glitch" | "scholarlens";
  // How it appears on the /lab page: what kind of project it is, and one plain sentence on what you can do
  lab?: { kind: string; oneLiner: string };
  // Demo video; `image` becomes its poster
  video?: string;
};

export const aiWork: AiWork[] = [
  {
    name: "Glitch",
    demo: "glitch",
    lab: {
      kind: "Voice AI companion · IoT",
      oneLiner: "Chat with my desk robot. It sets reminders, keeps notes and switches the lights, fan, AC and TV in a 3D room.",
    },
    tagline: "An AI companion that lives on my desk, and runs my day.",
    status: "building",
    summary:
      "Glitch talks with you, but it's more than a talking bot. It remembers what you tell it, keeps your notes, reminders, lists and to-dos, and controls devices around the room. It has a face, a head that turns, and eyes that see gestures and people. Its brain started as a separate project, Umbrella, and now powers Glitch.",
    // "Heading: detail" (the heading is shown in bold)
    highlights: [
      "Talks like a person: a live voice conversation that you can interrupt mid-sentence, and it answers in your language, Hinglish included.",
      "Remembers you: short-term memory for the conversation and long-term memory for facts like names, birthdays and what you like, so it picks up where you left off.",
      "Organises your day: reminders that ring on time, lists, notes and to-dos, all set just by asking.",
      "Runs the room (IoT): lights, fan, AC and TV by voice, by hand gestures or by who is in the room. Nobody around for two minutes, and everything switches off.",
      "Sees you: YOLO spots people and MediaPipe reads hand gestures, so it turns its head to follow you and a held thumbs-up dims or brightens the lamp step by step.",
      "Has moods: its face and head movements show how it feels, and the mood drifts with the conversation and the time of day.",
      "Brain and body: the brain is Umbrella, a LangGraph agent with tools and memory; the body is a round display on two MG996R servos driven by a PCA9685, moving to a Raspberry Pi next.",
    ],
    stack: ["Python", "LangGraph", "FastAPI", "PostgreSQL", "LiveKit", "Pipecat", "Whisper", "MediaPipe", "YOLO", "Raspberry Pi", "Next.js"],
    links: [],
  },
  {
    name: "ScholarLens",
    demo: "scholarlens",
    lab: {
      kind: "Agentic RAG",
      oneLiner: "Ask a research paper anything. It decides how to answer, searches the paper and cites the pages.",
    },
    tagline: "An Agentic RAG app: ask a research paper questions and get answers with sources.",
    status: "shipped",
    summary:
      "Upload a paper, or paste a link or an arXiv ID, and ask anything. It finds the right parts of the paper and answers with page numbers, or checks whether a claim still holds against newer research.",
    // "Heading: detail" (the heading is shown in bold)
    highlights: [
      "Agentic routing: for every question a LangGraph agent decides whether to search the paper, check a claim against newer research, or simply answer.",
      "Retrieval that recovers: it grades what it found, and when the chunks aren't relevant it rewrites the question and searches again.",
      "Answers you can check: every answer cites the pages it came from, and streams in as it is written.",
      "Claim checking: verifies a paper's claim against the web and arXiv (Tavily) and links the newer papers that challenge or update it.",
      "Any paper in: upload a PDF, paste a link or an arXiv ID; scanned pages are read with OCR, then chunked, embedded (Cohere) and indexed in Qdrant.",
      "Conversations that stay: several chats side by side, each restored from its own saved state.",
      "Measured and deployed: answers tested with DeepEval (faithfulness, relevancy, contextual precision and recall); runs in Docker on AWS, on Groq with Gemini as the fallback.",
    ],
    stack: ["LangGraph", "LangChain", "Qdrant", "Cohere", "Groq", "Gemini", "Tavily", "DeepEval", "Streamlit", "Docker", "AWS"],
    links: [
      { label: "full version", href: "https://scholarlens.duckdns.org/" },
    ],
    image: {
      src: "/assets/projects/ai/scholarlens-architecture.png",
      alt: "ScholarLens system architecture: interface, ingestion, reasoning, quality and ops",
    },
    video: "/assets/projects/ai/scholarlens-demo.mp4",
  },
];
