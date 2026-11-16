import Image from "next/image";
import Link from "next/link";
import ashishImg1 from "../../public/assets/personal-images/image1.jpeg";
import ashishImg2 from "../../public/assets/personal-images/image2.jpeg";
import ashishImg3 from "../../public/assets/personal-images/image3.jpeg";
import { ArrowRight, ArrowUp, ArrowUpRight, Github, Linkedin, Sparkles } from "lucide-react";
import SectionNav from "./components/SectionNav";
import AiLab from "./components/lab/AiLab";
import AskBox from "./components/home/AskBox";
import PhotoStack from "./components/home/PhotoStack";
import ProjectIndex from "./components/home/ProjectIndex";
import Spotlight from "./components/ui/Spotlight";
import AutoVideo from "./components/ui/AutoVideo";
import Highlight from "./components/ui/Highlight";
import Reveal from "./components/ui/Reveal";
import {
  aiWork,
  certifications,
  education,
  experience,
  featuredProjects,
  pillars,
  profile,
  tooling,
} from "@/data/profile";
import { projects } from "@/data/projects";

const sections = [
  { id: "intro", label: "intro" },
  { id: "about", label: "about" },
  { id: "stack", label: "stack" },
  { id: "lab", label: "ai lab" },
  { id: "work", label: "work" },
  { id: "journey", label: "journey" },
  { id: "contact", label: "contact" },
];

const layerNames = { frontend: "Interface", backend: "Services", ai: "Intelligence" };

const featured = featuredProjects.flatMap(({ title, label }) => {
  const project = projects.find((p) => p.title === title);
  return project ? [{ ...project, label }] : [];
});

const container = "max-w-6xl mx-auto px-4 sm:px-6 lg:px-8";
const section = "scroll-mt-24 py-16 md:py-32";

const SectionHeader = ({
  n,
  label,
  children,
  intro,
  action,
}: {
  n: string;
  label: string;
  children: React.ReactNode;
  intro?: React.ReactNode;
  action?: React.ReactNode;
}) => (
  <Reveal className="mb-10 md:mb-16">
    <div className="flex items-end justify-between flex-wrap gap-6">
      <div className="max-w-3xl">
        <p className="bw-kicker mb-5">
          <span className="bw-accent">{n}</span> {label}
        </p>
        <h2 className="text-3xl md:text-6xl font-semibold tracking-[-0.035em] leading-[1.05]">{children}</h2>
        {intro && <p className="mt-4 md:mt-6 text-base md:text-lg bw-muted leading-relaxed max-w-2xl">{intro}</p>}
      </div>
      {action}
    </div>
  </Reveal>
);

const Accent = ({ children }: { children: React.ReactNode }) => (
  <span className="font-serif-accent bw-accent text-[1.08em]">{children}</span>
);

const Term = ({ children, tip }: { children: React.ReactNode; tip: string }) => (
  <span className="bw-term" tabIndex={0}>
    {children}
    <span className="bw-tip font-mono text-xs font-normal not-italic tracking-normal px-2.5 py-1.5 rounded-lg border bw-rule theme-bg-card bw-muted">
      {tip}
    </span>
  </span>
);

const Home = () => {
  return (
    <div className="theme-bg-primary theme-text-primary -mt-[4.25rem]">
      <SectionNav sections={sections} />

      {/* Intro */}
      <Spotlight id="intro" className="scroll-mt-24 border-b bw-rule">
        <div className={`${container} pt-36 md:pt-44 pb-20 md:pb-28 grid lg:grid-cols-[1.2fr_1fr] gap-14 lg:gap-16 items-center`}>
          <Reveal>
            <p className="font-mono text-[10px] md:text-[11px] uppercase tracking-[0.16em] bw-muted mb-6 md:mb-9">
              {experience[0].title.split(" · ")[0]} <span className="bw-faint">/</span> {experience[0].company}{" "}
              <span className="bw-faint">/</span> {profile.location.split(",")[0]}
            </p>
            <h1 className="text-[1.95rem] leading-[1.1] sm:text-6xl md:text-[4.4rem] font-semibold tracking-[-0.045em] mb-6 md:mb-8">
              I build the <Term tip="React · Next.js · TypeScript">interfaces</Term>, the{" "}
              <Term tip="Python · FastAPI · Flask">APIs</Term> behind them, and lately,{" "}
              <Term tip="LangChain · LangGraph">
                <Accent>agents</Accent>
              </Term>{" "}
              that run on both.
            </h1>
            <p className="text-base md:text-xl bw-muted max-w-xl mb-8 md:mb-10 leading-relaxed">
              {profile.experienceYears} years building web apps people use every day: dashboards, APIs, live tracking tools
              and RAG pipelines. Now I also build AI agents that remember, use tools and talk.
            </p>
            <div className="flex flex-wrap items-center gap-3">
              <Link href="/projects" className="btn btn-primary">
                View projects <ArrowRight className="w-4 h-4" />
              </Link>
              <a href="#lab" className="btn btn-secondary">
                <Sparkles className="w-4 h-4 bw-accent" /> Try the AI lab
              </a>
              <span className="flex items-center gap-1 ml-1">
                <a href={profile.github} target="_blank" rel="noopener noreferrer" aria-label="GitHub" className="grid place-items-center w-11 h-11 rounded-full bw-muted bw-row-link">
                  <Github className="w-[18px] h-[18px]" />
                </a>
                <a href={profile.linkedin} target="_blank" rel="noopener noreferrer" aria-label="LinkedIn" className="grid place-items-center w-11 h-11 rounded-full bw-muted bw-row-link">
                  <Linkedin className="w-[18px] h-[18px]" />
                </a>
              </span>
            </div>
          </Reveal>
          <Reveal delay={150}>
            <AskBox />
          </Reveal>
        </div>
      </Spotlight>

      {/* About */}
      <section id="about" className={`${section} tone-paper`}>
        <div className={`${container} grid md:grid-cols-[1fr_1.25fr] gap-14 md:gap-24 items-center`}>
          <Reveal>
            <PhotoStack photos={[ashishImg1, ashishImg2, ashishImg3]} />
          </Reveal>
          <Reveal delay={100}>
            <p className="bw-kicker mb-5">
              <span className="bw-accent">01</span> about
            </p>
            <h2 className="text-3xl md:text-5xl font-semibold tracking-[-0.035em] leading-[1.05] mb-6 md:mb-8">
              Hi, I&apos;m <Accent>Ashish.</Accent>
            </h2>
            <div className="space-y-4 md:space-y-5 text-base md:text-lg bw-muted leading-relaxed mb-8 md:mb-10">
              <p>
                Most of my professional work has been on the frontend: building enterprise web apps in React and Next.js,
                from complex dashboards to large multilingual sites.
              </p>
              <p>On the backend I work in Python, building APIs with FastAPI and Flask, and I keep going deeper there.</p>
              <p>
                Lately I&apos;ve been building with LLMs: a research-paper assistant, a companion agent with memory and
                voice, and a small robot that runs on it.
              </p>
            </div>
            <dl className="border-t bw-rule text-sm">
              {[
                ["Location", profile.location],
                ["Currently", `${experience[0].title.split(" · ")[0]} at ${experience[0].company}`],
                ["Studied", `${education.degree}, ${education.school}`],
                ["Off-screen", "Coffee shops, cooking and music"],
              ].map(([k, v]) => (
                <div key={k} className="grid grid-cols-[8rem_1fr] gap-4 py-3 border-b bw-rule">
                  <dt className="font-mono text-xs uppercase tracking-wider bw-faint pt-0.5">{k}</dt>
                  <dd>{v}</dd>
                </div>
              ))}
            </dl>
          </Reveal>
        </div>
      </section>

      {/* Stack */}
      <section id="stack" className={`${section} border-t bw-rule`}>
        <div className={container}>
          <SectionHeader n="02" label="stack" intro="What I build with: the screens people use, the systems behind them, and the AI on top.">
            Three layers, <Accent>one person.</Accent>
          </SectionHeader>
          <div className="grid md:grid-cols-3 border-t bw-rule md:divide-x divide-[var(--border-color)] bw-beam-x bw-beam-cols">
            {pillars.map((p, i) => (
              <Reveal key={p.key} delay={i * 90} className="py-8 md:py-12 md:px-8 first:md:pl-0 last:md:pr-0 border-b md:border-b-0 bw-rule">
                <p className="font-mono text-[11px] uppercase tracking-[0.14em] bw-faint mb-5 md:mb-8">
                  <span className="bw-accent">L{i + 1}</span> · {layerNames[p.key]}
                </p>
                <h3 className="text-xl md:text-[1.7rem] font-semibold tracking-[-0.02em] mb-3">{p.title}</h3>
                <p className="text-[0.95rem] md:text-base bw-muted leading-relaxed mb-6 md:mb-8">{p.summary}</p>
                {/* phones: two columns, so the three lists don't run for screens */}
                <ul className="grid grid-cols-2 md:grid-cols-1 gap-x-4 gap-y-2 text-sm md:text-[15px]">
                  {p.skills.map((s) => (
                    <li key={s} className="flex items-center gap-2.5 md:gap-3 min-w-0">
                      <span className="w-1 h-1 rounded-full bw-accent-fill shrink-0" />
                      {s}
                    </li>
                  ))}
                </ul>
              </Reveal>
            ))}
          </div>
          <p className="mt-8 pt-6 border-t bw-rule font-mono text-xs bw-muted">+ tooling: {tooling.join(" · ")}</p>
        </div>
      </section>

      {/* AI lab */}
      <section id="lab" className={`${section} tone-ink`}>
        <div className={container}>
          <SectionHeader
            n="03"
            label="ai lab"
            intro="Two of my projects you can try right here. Talk to Glitch, my desk robot, or ask ScholarLens about a research paper and watch how it finds the answer."
            action={
              <Link href="/lab" className="btn btn-secondary">
                Open the AI lab <ArrowRight className="w-4 h-4" />
              </Link>
            }
          >
            What I&apos;m building <Accent>with LLMs.</Accent>
          </SectionHeader>

          <Reveal className="mb-14 md:mb-24">
            <AiLab />
          </Reveal>

          <p className="bw-kicker mb-2">the projects</p>
          <div className="border-b bw-rule">
            {aiWork.map((w, i) => (
              <Reveal key={w.name}>
                <article className="py-8 md:py-20 border-t bw-rule">
                  <div className="grid md:grid-cols-[1fr_1.25fr] gap-8 md:gap-14">
                    <div>
                      <p className="font-mono text-xs bw-faint mb-5">{String(i + 1).padStart(2, "0")}</p>
                      <h3 className="text-3xl md:text-6xl font-semibold tracking-[-0.04em] mb-3 md:mb-4">
                        {w.demo ? (
                          <a href={`#${w.demo}`} className="group inline-flex items-baseline gap-3 hover:text-[var(--bw-accent)] transition-colors">
                            {w.name}
                            <ArrowUp className="w-6 h-6 md:w-8 md:h-8 bw-faint group-hover:text-[var(--bw-accent)] transition-transform group-hover:-translate-y-1" />
                          </a>
                        ) : (
                          w.name
                        )}
                      </h3>
                      <p className="text-base md:text-lg mb-3 md:mb-4">
                        {w.tagline.split(/(Agentic RAG)/).map((part, k) => (part === "Agentic RAG" ? <strong key={k} className="font-semibold theme-text-primary">{part}</strong> : part))}
                      </p>
                      <p className="text-[0.95rem] md:text-base bw-muted leading-relaxed mb-6 md:mb-7">{w.summary}</p>
                      {(w.links.length > 0 || w.demo) && (
                        <div className="flex flex-wrap gap-2">
                          {w.demo && (
                            <a href={`#${w.demo}`} className="btn btn-primary !h-9 !px-4 !text-[13px]">
                              Try it live <ArrowUp className="w-3.5 h-3.5" />
                            </a>
                          )}
                          {w.links.map((l) => (
                            <a key={l.href} href={l.href} target="_blank" rel="noopener noreferrer" className="btn btn-secondary !h-9 !px-4 !text-[13px]">
                              {l.href.includes("github.com") && <Github className="w-3.5 h-3.5" />} {l.label} <ArrowUpRight className="w-3.5 h-3.5 bw-faint" />
                            </a>
                          ))}
                        </div>
                      )}
                    </div>
                    <div>
                      <ul className="space-y-2.5 md:space-y-3.5 mb-6 md:mb-7">
                        {w.highlights.map((h) => (
                          <li key={h} className="grid grid-cols-[1.25rem_1fr] leading-relaxed text-sm md:text-[15px]">
                            <span className="mt-[0.6rem] w-1.5 h-1.5 rounded-full bw-accent-fill" />
                            <span className="bw-muted">
                              <Highlight text={h} />
                            </span>
                          </li>
                        ))}
                      </ul>
                      <p className="pt-5 border-t bw-rule font-mono text-xs bw-muted leading-6">{w.stack.join("  ·  ")}</p>
                    </div>
                  </div>
                  {w.video ? (
                    <figure className="mt-10">
                      <AutoVideo
                        src={w.video}
                        poster={w.image?.src}
                        controls
                        preload="metadata"
                        className="w-full aspect-[16/9] rounded-xl border bw-rule bg-black"
                        aria-label={`${w.name} product demo`}
                      />
                      <figcaption className="mt-3 font-mono text-xs bw-muted">▶ product demo · 3 min</figcaption>
                    </figure>
                  ) : (
                    w.image && (
                      <div className="relative mt-10 aspect-[16/9] rounded-xl overflow-hidden border bw-rule">
                        <Image src={w.image.src} alt={w.image.alt} fill sizes="(max-width: 1152px) 100vw, 1152px" className="object-cover" />
                      </div>
                    )
                  )}
                </article>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* Work */}
      <section id="work" className={`${section} tone-paper`}>
        <div className={container}>
          <SectionHeader
            n="04"
            label="work"
            action={
              <Link href="/projects" className="btn btn-secondary">
                All {projects.length} projects <ArrowRight className="w-4 h-4" />
              </Link>
            }
          >
            Selected <Accent>projects.</Accent>
          </SectionHeader>
          <Reveal className="bw-stagger">
            <ProjectIndex items={featured} />
          </Reveal>
        </div>
      </section>

      {/* Journey */}
      <section id="journey" className={`${section} tone-base`}>
        <div className={container}>
          <SectionHeader n="05" label="journey">
            Where I&apos;ve <Accent>been.</Accent>
          </SectionHeader>
          <Reveal className="bw-stagger">
            <div className="border-t bw-rule">
              {experience.map((job, i) => (
                <details key={job.company} className="bw-row group border-b bw-rule" open={i === 0} data-stagger style={{ "--i": i } as React.CSSProperties}>
                  <summary className="grid grid-cols-[1fr_auto] md:grid-cols-[12rem_1fr_auto] gap-x-6 gap-y-1 py-7 cursor-pointer items-center bw-row-link md:px-5 md:-mx-5 rounded-xl">
                    <span className="font-mono text-xs bw-muted order-2 md:order-none col-span-2 md:col-span-1">{job.period}</span>
                    <span className="text-base md:text-xl font-semibold tracking-tight">
                      {job.title} <span className="bw-muted font-normal">· {job.company}</span>
                    </span>
                    <span className="bw-chevron grid place-items-center w-8 h-8 rounded-full border bw-rule text-lg bw-muted transition-transform duration-200">+</span>
                  </summary>
                  <div className="md:pl-[13.5rem] pb-8 pr-8">
                    <p className="bw-muted leading-relaxed mb-4 max-w-3xl">{job.description}</p>
                    <p className="font-mono text-xs bw-muted">{job.skills.join("  ·  ")}</p>
                  </div>
                </details>
              ))}
              <div className="grid md:grid-cols-[12rem_1fr] gap-x-6 gap-y-1 py-7 border-b bw-rule items-center">
                <span className="font-mono text-xs bw-muted">{education.period}</span>
                <span className="text-base md:text-xl font-semibold tracking-tight">
                  {education.degree} <span className="bw-muted font-normal">· {education.school}</span>
                </span>
              </div>
            </div>
          </Reveal>
          <div className="mt-12 grid md:grid-cols-[12rem_1fr] gap-x-6 gap-y-3">
            <p className="font-mono text-[11px] uppercase tracking-[0.14em] bw-faint pt-1">Certifications</p>
            <ul className="grid sm:grid-cols-2 gap-x-10 gap-y-2 text-sm">
              {certifications.map((c) => (
                <li key={c.name} className="flex justify-between gap-4 py-1.5 border-b bw-rule">
                  <span>{c.name}</span>
                  <span className="bw-faint font-mono text-xs whitespace-nowrap">{c.issuer.split(" ")[0]} {c.year}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      {/* Contact */}
      <section id="contact" className={`${section} tone-ink`}>
        <div className={`${container} text-center`}>
          <Reveal>
            <p className="bw-kicker mb-6 justify-center">
              <span className="bw-accent">06</span> contact
            </p>
            <h2 className="text-5xl md:text-[8.5rem] font-semibold tracking-[-0.06em] leading-[0.95] mb-8 md:mb-12">
              Say <Accent>hello.</Accent>
            </h2>
            <div className="flex flex-wrap justify-center gap-3">
              <a href={profile.github} target="_blank" rel="noopener noreferrer" className="btn btn-primary">
                <Github className="w-4 h-4" /> GitHub
              </a>
              <a href={profile.linkedin} target="_blank" rel="noopener noreferrer" className="btn btn-secondary">
                <Linkedin className="w-4 h-4" /> LinkedIn
              </a>
              {profile.email && (
                <a href={`mailto:${profile.email}`} className="btn btn-secondary">
                  {profile.email} <ArrowUpRight className="w-4 h-4" />
                </a>
              )}
            </div>
          </Reveal>
        </div>
      </section>
    </div>
  );
};

export default Home;
