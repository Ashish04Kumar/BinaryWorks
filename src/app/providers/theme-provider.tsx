"use client"; // mark as client component

import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import Cookies from "js-cookie";

export type ThemeMode = "light" | "dark" | "retro" | "futuristic";

interface ThemeContextType {
  theme: ThemeMode;
  setTheme: (theme: ThemeMode) => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export const ThemeProvider = ({ children }: { children: ReactNode }) => {
  const [theme, setThemeState] = useState<ThemeMode>("light");

  const setTheme = (newTheme: ThemeMode) => {
    setThemeState(newTheme);
    localStorage.setItem("portfolio-theme", newTheme);
    Cookies.set("portfolio-theme", newTheme, { expires: 365 });
    document.documentElement.setAttribute("data-theme", newTheme);
  };

  useEffect(() => {
    const saved = localStorage.getItem("portfolio-theme") as ThemeMode | null;
    if (saved) {
      setThemeState(saved);
      document.documentElement.setAttribute("data-theme", saved);
    } else {
      const cookieTheme = Cookies.get("portfolio-theme") as ThemeMode | undefined;
      if (cookieTheme) {
        setThemeState(cookieTheme);
        document.documentElement.setAttribute("data-theme", cookieTheme);
      }
    }
  }, []);

  return (
    <ThemeContext.Provider value={{ theme, setTheme }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) throw new Error("useTheme must be used within ThemeProvider");
  return context;
};
