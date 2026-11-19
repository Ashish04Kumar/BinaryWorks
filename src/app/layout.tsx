import type { Metadata } from "next";
import { Geist, Geist_Mono, Instrument_Serif } from "next/font/google";
import "../styles/main.scss";
import { ThemeProvider } from "./providers/theme-provider";
import Navigation from "./components/Navbar/Navigation";
import VibeBanner from "./components/VibeBanner";
import Footer from "./components/Footer";
import SmoothScroll from "./components/ui/SmoothScroll";
import SiteChrome from "./components/SiteChrome";
import Tracker from "./components/Tracker";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const instrumentSerif = Instrument_Serif({
  variable: "--font-instrument-serif",
  subsets: ["latin"],
  weight: "400",
  style: ["normal", "italic"],
});

// Runs before first paint so the page never flashes the wrong theme
const themeScript = `try{var t=localStorage.getItem("portfolio-theme");document.documentElement.setAttribute("data-theme",t==="dark"||t==="light"?t:"light")}catch(e){document.documentElement.setAttribute("data-theme","light")}`;

export const metadata: Metadata = {
  title: "Ashish Kumar · Frontend, Full-Stack & GenAI Engineer",
  description:
    "Portfolio of Ashish Kumar: SDE-1 engineer working across React, Next.js, Python (FastAPI, Flask) and AI agents with LangChain & LangGraph.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" data-theme="light" suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeScript }} />
      </head>
      {/* browser extensions (e.g. ColorZilla's cz-shortcut-listen) add attributes to <body> before React loads */}
      <body
        className={`${geistSans.variable} ${geistMono.variable} ${instrumentSerif.variable} antialiased`}
        suppressHydrationWarning
      >
        <ThemeProvider>
          <SmoothScroll />
          <Tracker />
          <SiteChrome>
            <VibeBanner />
            <Navigation />
          </SiteChrome>
          {children}
          <SiteChrome>
            <Footer />
          </SiteChrome>
        </ThemeProvider>
      </body>
    </html>
  );
}
