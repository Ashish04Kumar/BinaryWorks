"use client";
// Records how a visit goes: which page, how long each section is on screen, and what gets clicked.
// Nothing is shown to the visitor; events go to /api/track in small batches.
import { useEffect } from "react";
import { usePathname } from "next/navigation";
import { ensureIds, flush, track, trackingOff } from "@/lib/track";

const label = (el: Element) =>
  (el.getAttribute("aria-label") || (el as HTMLElement).innerText || el.getAttribute("title") || "").replace(/\s+/g, " ").trim().slice(0, 80);

const Tracker = () => {
  const pathname = usePathname();

  // once per tab: ids, the session start, clicks anywhere
  useEffect(() => {
    if (trackingOff()) return;
    if (ensureIds()) {
      track("session_start", {
        path: location.pathname + location.hash,
        referrer: document.referrer.slice(0, 200),
        screen: `${screen.width}x${screen.height}`,
        viewport: `${innerWidth}x${innerHeight}`,
        lang: navigator.language,
        tz: Intl.DateTimeFormat().resolvedOptions().timeZone,
        theme: document.documentElement.getAttribute("data-theme") || "",
      });
    }
    const onClick = (e: MouseEvent) => {
      const el = (e.target as Element | null)?.closest("a, button, [role=tab], summary, input[type=checkbox]");
      if (!el) return;
      const href = el instanceof HTMLAnchorElement ? el.getAttribute("href") || "" : "";
      track("click", {
        label: label(el) || href,
        kind: el.tagName.toLowerCase(),
        href: href.slice(0, 200),
        section: el.closest("section[id], [id=intro]")?.id || location.pathname,
      });
    };
    const onHide = () => {
      if (document.visibilityState === "hidden") flush(true);
    };
    document.addEventListener("click", onClick, true);
    document.addEventListener("visibilitychange", onHide);
    window.addEventListener("pagehide", () => flush(true));
    return () => {
      document.removeEventListener("click", onClick, true);
      document.removeEventListener("visibilitychange", onHide);
    };
  }, []);

  // per page: time spent with each section on screen (only while the tab is visible)
  useEffect(() => {
    if (trackingOff()) return;
    track("activity", { name: "page", path: pathname });
    const sections = [...document.querySelectorAll<HTMLElement>("section[id], [id=intro]")];
    const ratio = new Map<string, number>();
    let current = sections.length ? "" : pathname; // pages without sections count as one
    let since = performance.now();

    // spans only run while the tab is visible: they end when it is hidden and restart when it comes back
    let running = document.visibilityState === "visible";
    const commit = () => {
      const ms = performance.now() - since;
      since = performance.now();
      if (running && current && ms >= 500) track("section", { section: current, ms: Math.round(ms), path: pathname });
    };
    const pick = () => {
      let best = "", bestRatio = 0.15; // needs a real share of the screen
      for (const [id, r] of ratio) if (r > bestRatio) [best, bestRatio] = [id, r];
      if (best && best !== current) {
        commit();
        current = best;
      }
    };
    const io = new IntersectionObserver(
      (entries) => {
        // share of the screen each section fills; the biggest one is "where the visitor is"
        for (const e of entries) ratio.set(e.target.id, e.intersectionRect.height / innerHeight);
        pick();
      },
      { threshold: Array.from({ length: 21 }, (_, i) => i / 20) }
    );
    sections.forEach((s) => io.observe(s));

    // hidden tab: close the running span; visible again: start a new one
    const onVis = () => {
      if (document.visibilityState === "hidden") {
        commit();
        running = false;
        flush(true);
      } else {
        running = true;
        since = performance.now();
      }
    };
    document.addEventListener("visibilitychange", onVis);
    // long stays still get reported every 30 s
    const tick = setInterval(commit, 30_000);
    return () => {
      commit();
      io.disconnect();
      clearInterval(tick);
      document.removeEventListener("visibilitychange", onVis);
    };
  }, [pathname]);

  return null;
};

export default Tracker;
