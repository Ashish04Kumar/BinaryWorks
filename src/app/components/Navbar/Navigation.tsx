"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Sun, Moon } from "lucide-react";
import { useTheme } from "@/app/providers/theme-provider";

const Navigation = () => {
  const pathname = usePathname();
  const { theme, setTheme } = useTheme();

  const navItems = [
    { path: "/", label: "home" },
    { path: "/projects", label: "projects" },
  ];

  return (
    <div className="sticky top-0 z-50 px-3 sm:px-4 pt-3">
      <nav className="max-w-6xl mx-auto flex items-center justify-between h-14 pl-2 pr-2 sm:pl-3 rounded-full border bw-rule theme-bg-nav backdrop-blur-xl backdrop-saturate-150 shadow-[var(--shadow-float)]">
        <Link href="/" className="flex items-center gap-2.5 font-semibold tracking-tight theme-text-primary">
          <span className="relative grid place-items-center w-9 h-9 rounded-full bw-accent-bg font-mono text-[13px]">
            ak
          </span>
          <span className="hidden sm:flex flex-col leading-tight">
            <span className="text-sm">Ashish Kumar</span>
            <span className="font-mono text-[10px] bw-muted font-normal">full-stack · genai</span>
          </span>
        </Link>

        <div className="flex items-center gap-1 text-sm">
          {navItems.map((item) => {
            const active = pathname === item.path;
            return (
              <Link
                key={item.path}
                href={item.path}
                aria-current={active ? "page" : undefined}
                className={`px-3.5 py-2 rounded-full transition-colors capitalize ${
                  active ? "bw-subtle theme-text-primary font-medium" : "bw-muted hover:text-[var(--text-primary)]"
                }`}
              >
                {item.label}
              </Link>
            );
          })}

          <span className="w-px h-5 mx-1.5 bg-[var(--border-color)]" aria-hidden />

          {/* Light / dark toggle */}
          <button
            onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
            aria-label={`Switch to ${theme === "dark" ? "light" : "dark"} mode`}
            title={`Switch to ${theme === "dark" ? "light" : "dark"} mode`}
            className="grid place-items-center w-9 h-9 rounded-full bw-muted hover:text-[var(--text-primary)] bw-row-link cursor-pointer"
          >
            {theme === "dark" ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
          </button>
        </div>
      </nav>
    </div>
  );
};

export default Navigation;
