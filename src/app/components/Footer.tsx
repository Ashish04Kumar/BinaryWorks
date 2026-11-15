import { profile } from "@/data/profile";

const Footer = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="theme-bg-primary border-t bw-rule">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 pb-24 xl:pb-8 flex flex-col sm:flex-row gap-3 justify-between font-mono text-xs bw-muted">
        <p>
          © {currentYear} {profile.name} · built with Next.js & TypeScript
        </p>
        <div className="flex gap-6">
          <a href={profile.github} target="_blank" rel="noopener noreferrer" className="bw-link">
            github
          </a>
          <a href={profile.linkedin} target="_blank" rel="noopener noreferrer" className="bw-link">
            linkedin
          </a>
          {profile.email && (
            <a href={`mailto:${profile.email}`} className="bw-link">
              email
            </a>
          )}
        </div>
      </div>
    </footer>
  );
};

export default Footer;
