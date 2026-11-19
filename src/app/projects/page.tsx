import Image from "next/image";
import Link from "next/link";
import { ArrowUpRight, Github } from "lucide-react";
import ClampHtml from "../components/ClampHtml";
import { projects, type ProjectItem } from "@/data/projects";

const filters = [
  { key: "all", label: "All" },
  { key: "my", label: "Personal" },
  { key: "associated", label: "Work" },
];

const projectLinks = (p: ProjectItem) =>
  [
    { href: p.github, label: "code", icon: true },
    { href: p.githubFrontend, label: "frontend", icon: true },
    { href: p.githubBackend, label: "backend", icon: true },
    { href: p.live, label: "live", icon: false },
    { href: p.liveClient, label: "live client", icon: false },
    { href: p.liveAdmin, label: "live admin", icon: false },
  ].filter((l): l is { href: string; label: string; icon: boolean } => Boolean(l.href));

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const Projects = async ({ searchParams }: any) => {
  const params = await searchParams;
  const filter = params?.filter ?? "all";

  const countFor = (key: string) =>
    key === "all" ? projects.length : projects.filter((p) => p.category === key).length;
  // Only show filters that have projects; skip the row if "all" is the only option left
  const visibleFilters = filters.filter((f) => f.key === "all" || countFor(f.key) > 0);

  const filteredProjects =
    filter === "all" ? projects : projects.filter((p) => p.category === filter);

  return (
    <div className="theme-bg-primary theme-text-primary min-h-screen">
      <header className="bw-grid border-b bw-rule">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 pt-16 pb-10 md:py-20">
          <p className="font-mono text-xs md:text-sm bw-muted mb-4">
            <span className="bw-accent">~</span> / projects
          </p>
          <h1 className="text-3xl md:text-6xl font-semibold tracking-tight mb-4 md:mb-6">
            Things I&apos;ve built.
          </h1>
          <p className="text-base md:text-lg bw-muted max-w-2xl leading-relaxed mb-8 md:mb-10">
            My own AI projects, and the products I build at work: dashboards,
            websites and a document chatbot.
          </p>
          {visibleFilters.length > 2 && (
          <div className="flex gap-2 font-mono text-sm">
            {visibleFilters.map((f) => (
              <Link
                key={f.key}
                href={`?filter=${f.key}`}
                scroll={false}
                className={`px-3 py-1.5 rounded-md border transition-colors ${
                  filter === f.key ? "bw-accent bw-accent-border bw-tint" : "bw-rule bw-muted bw-chip"
                }`}
              >
                {f.label}
                <span className="ml-1.5 opacity-60">{countFor(f.key)}</span>
              </Link>
            ))}
          </div>
          )}
        </div>
      </header>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        {filteredProjects.map((project, index) => {
          const links = projectLinks(project);
          return (
            <article
              key={project.title}
              className="grid md:grid-cols-2 gap-5 md:gap-14 py-10 md:py-20 border-b bw-rule items-center"
            >
              <div className={`relative aspect-[16/10] rounded-md overflow-hidden border bw-rule ${index % 2 ? "md:order-2" : ""}`}>
                <Image
                  src={project.image}
                  alt={project.title}
                  fill
                  sizes="(max-width: 768px) 100vw, 560px"
                  unoptimized={project.image.endsWith(".svg")}
                  className="object-cover object-top transition-transform duration-500 hover:scale-105"
                />
              </div>
              <div>
                <p className="font-mono text-xs bw-muted mb-3">
                  <span className="bw-accent">{String(index + 1).padStart(2, "0")}</span> ·{" "}
                  {project.category === "my" ? "personal" : "work"}
                  {project.vibeCoded && (
                    <Link href="/saarthi" className="bw-vibe-tag ml-2 inline-block rounded-full px-2 py-0.5 text-[10px] font-bold tracking-wide uppercase align-middle">
                      ✨ Vibe-coded
                    </Link>
                  )}
                </p>
                <h2 className="text-xl md:text-3xl font-semibold tracking-tight mb-3 md:mb-4">
                  {project.title}
                </h2>
                <ClampHtml html={project.description} className="bw-prose bw-muted leading-relaxed space-y-3 text-[0.95rem] md:text-base" />
                <p className="font-mono text-[11px] md:text-xs leading-5 md:leading-6 mb-5 md:mb-6">{project.tech.join(" / ")}</p>

                <div className="flex flex-wrap items-center gap-x-6 gap-y-3 font-mono text-sm">
                  {project.demo && (
                    <Link href={project.demo} className="btn btn-primary !h-9 !px-4 !text-[13px]">
                      Try it live ↗
                    </Link>
                  )}
                  {links.map((l) => (
                    <a
                      key={l.label}
                      href={l.href}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="bw-link inline-flex items-center gap-1"
                    >
                      {l.icon && <Github className="w-4 h-4" />}
                      {l.label}
                      {!l.icon && <ArrowUpRight className="w-4 h-4" />}
                    </a>
                  ))}
                </div>
              </div>
            </article>
          );
        })}
      </div>

    </div>
  );
};

export default Projects;
