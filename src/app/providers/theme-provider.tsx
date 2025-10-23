"use client";

import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import Cookies from "js-cookie";

export type ThemeMode = "light" | "dark" | "retro" | "futuristic";

interface ThemeContextType {
  theme: ThemeMode;
  setTheme: (theme: ThemeMode) => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export const ThemeProvider = ({ children }: { children: ReactNode }) => {
  const [theme, setThemeState] = useState<ThemeMode>("dark");
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [isInitialized, setIsInitialized] = useState(false);

  const setTheme = (newTheme: ThemeMode) => {
    setThemeState(newTheme);
    localStorage.setItem("portfolio-theme", newTheme);
    Cookies.set("portfolio-theme", newTheme, { expires: 365 });
    document.documentElement.setAttribute("data-theme", newTheme);
  };

  useEffect(() => {
    const saved = localStorage.getItem("portfolio-theme") as ThemeMode | null;
    const cookieTheme = Cookies.get("portfolio-theme") as ThemeMode | undefined;
    
    const initialTheme = saved || cookieTheme || "light";
    
    setThemeState(initialTheme);
    document.documentElement.setAttribute("data-theme", initialTheme);
    setIsInitialized(true);
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