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
      "Full-stack work across frontend, backend and GenAI. Worked on BotStream, a RAG chatbot platform, in both the Next.js app and the Flask backend, and built enterprise dashboards such as a bilingual fund-management system for a UAE ministry.",
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
  { title: "BotStream: Smart RAG Chatbot Platform", label: "BotStream" },
  { title: "Fund Management Dashboard for U.A.E Ministry of Gov.", label: "UAE Fund Management" },
  { title: "Firearms Training & Analytics Dashboard", label: "Firearms Training Analytics" },
  { title: "Cultural Events Platform", label: "Cultural Events Platform" },
  { title: "Team Collaboration Tool", label: "Threadflows" },
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
  // Live demo tab in the AI lab, if there is one
  demo?: "glitch" | "scholarlens";
  // Demo video; `image` becomes its poster
  video?: string;
};

export const aiWork: AiWork[] = [
  {
    name: "Glitch",
    demo: "glitch",
    tagline: "An AI companion that lives on my desk, and runs my day.",
    status: "building",
    summary:
      "Glitch talks with you, but it's more than a talking bot. It remembers what you tell it, keeps your notes, reminders, lists and to-dos, and controls devices around the room. It has a face, a head that turns, and eyes that see gestures and people. Its brain started as a separate project, Umbrella, and now powers Glitch.",
    highlights: [
      "Reminders, notes, lists and to-dos, saved just by asking",
      "Remembers things about you, for a few days or for good",
      "Controls smart-home devices like lights and fans (IoT)",
      "Always listening; you can interrupt it mid-sentence",
      "Moods that show on its face and in how its head moves",
      "Sees hand gestures and people, and turns to follow you",
    ],
    stack: ["Python", "LangGraph", "FastAPI", "PostgreSQL", "LiveKit", "Pipecat", "Whisper", "MediaPipe", "YOLO", "Raspberry Pi", "Next.js"],
    links: [],
  },
  {
    name: "ScholarLens",
    demo: "scholarlens",
    tagline: "An Agentic RAG app: ask a research paper questions and get answers with sources.",
    status: "shipped",
    summary:
      "Upload a paper, or paste a link or an arXiv ID, and ask anything. It finds the right parts of the paper and answers with page numbers, or checks whether a claim still holds against newer research.",
    highlights: [
      "Decides for every question whether to search the paper, check a claim, or just answer",
      "If a search finds nothing useful, it rephrases the question and tries once more",
      "Checks claims against the web and arXiv and links the newer papers",
      "Tested for accuracy with DeepEval, and runs in Docker on AWS",
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
