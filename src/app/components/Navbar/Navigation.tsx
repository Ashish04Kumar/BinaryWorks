"use client";
import React, { JSX, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Menu, X, Sun, Moon, Tv, Sparkles } from "lucide-react";
import { ThemeMode, useTheme } from "@/app/providers/theme-provider";

const Navigation = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [showThemeMenu, setShowThemeMenu] = useState(false);
  const pathname = usePathname();
  const { theme, setTheme } = useTheme();

  const navItems = [
    { path: "/about", label: "About" },
    { path: "/resume", label: "Resume" },
    { path: "/projects", label: "Projects" },
    { path: "/blog", label: "Blog" },
    { path: "/contact", label: "Contact" },
  ];

  const themes: { mode: ThemeMode; icon: JSX.Element; label: string }[] = [
    { mode: "light", icon: <Sun className="w-4 h-4" />, label: "Light" },
    { mode: "dark", icon: <Moon className="w-4 h-4" />, label: "Dark" },
    { mode: "retro", icon: <Tv className="w-4 h-4" />, label: "Retro" },
    {
      mode: "futuristic",
      icon: <Sparkles className="w-4 h-4" />,
      label: "Futuristic",
    },
  ];

  const currentTheme = themes.find((t) => t.mode === theme);

  return (
    <nav className="sticky top-0 z-50 backdrop-blur-lg bg-opacity-90 border-b theme-border theme-bg-nav shadow-lg">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <Link
            href="/"
            className="text-2xl font-bold theme-text-primary theme-logo"
          >
            Ashish Kumar
          </Link>

          <div className="hidden md:flex items-center space-x-8">
            {navItems.map((item) => (
              <Link key={item.path} href={item.path}>
                <span
                  className={`theme-text-secondary hover:theme-text-primary transition-all duration-200 relative group ${
                    pathname === item.path
                      ? "theme-text-primary font-semibold"
                      : ""
                  }`}
                >
                  {item.label}
                  <span
                    className={`absolute bottom-0 left-0 w-full h-0.5 theme-bg-accent transform origin-left transition-transform duration-200 ${
                      pathname === item.path
                        ? "scale-x-100"
                        : "scale-x-0 group-hover:scale-x-100"
                    }`}
                  ></span>
                </span>
              </Link>
            ))}

            {/* Theme menu */}
            <div className="relative">
              <button
                onClick={() => setShowThemeMenu(!showThemeMenu)}
                className="flex items-center space-x-2 px-3 py-2 rounded-lg theme-bg-hover theme-text-primary transition-all duration-200"
              >
                {currentTheme?.icon}
                <span className="text-sm">{currentTheme?.label}</span>
              </button>

              {showThemeMenu && (
                <div className="absolute right-0 mt-2 w-40 rounded-lg shadow-xl theme-bg-card border theme-border overflow-hidden">
                  {themes.map((t) => (
                    <button
                      key={t.mode}
                      onClick={() => {
                        setTheme(t.mode);
                        setShowThemeMenu(false);
                      }}
                      className={`w-full flex items-center space-x-2 px-4 py-3 theme-text-secondary hover:theme-bg-hover transition-all duration-200 ${
                        theme === t.mode
                          ? "theme-bg-accent theme-text-primary font-semibold"
                          : ""
                      }`}
                    >
                      {React.cloneElement(t.icon, {
                        className: `${
                          theme === t.mode ? "text-white" : "text-current"
                        } w-4 h-4`,
                      })}
                      <span
                        className={`${theme === t.mode ? "text-white" : ""}`}
                      >
                        {t.label}
                      </span>
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>

          <button
            onClick={() => setIsOpen(!isOpen)}
            className="md:hidden theme-text-primary p-2"
          >
            {isOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </div>

      {isOpen && (
        <div className="md:hidden theme-bg-nav border-t theme-border">
          <div className="px-4 pt-2 pb-4 space-y-2">
            {navItems.map((item) => (
              <Link
                key={item.path}
                href={item.path}
                onClick={() => setIsOpen(false)}
              >
                <span
                  className={`flex items-center space-x-2 px-3 py-2 rounded-lg theme-text-secondary hover:theme-bg-hover transition-all duration-200 ${
                    pathname === item.path
                      ? "theme-bg-accent theme-text-primary font-semibold"
                      : ""
                  }`}
                >
                  {item.label}
                </span>
              </Link>
            ))}

            <div className="pt-2 border-t">
              <p className="px-3 py-2 text-xs theme-text-secondary opacity-70">
                Theme
              </p>
              <div className="grid grid-cols-2 gap-2">
                {themes.map((t) => (
                  <button
                    key={t.mode}
                    onClick={() => {
                      setTheme(t.mode);
                      setIsOpen(false);
                    }}
                    className={`flex items-center space-x-2 px-3 py-2 rounded-lg theme-text-secondary hover:theme-bg-hover transition-all duration-200 ${
                      theme === t.mode
                        ? "theme-bg-accent theme-text-primary font-semibold"
                        : ""
                    }`}
                  >
                    {React.cloneElement(t.icon, {
                      className: `${
                        theme === t.mode ? "text-white" : "text-current"
                      } w-4 h-4`,
                    })}
                    <span className={`${theme === t.mode ? "text-white" : ""}`}>
                      {t.label}
                    </span>
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navigation;
