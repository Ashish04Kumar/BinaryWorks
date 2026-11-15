import { getLenis } from "./lenis";

// Smooth scroll to an element: through Lenis when it's running, otherwise animated by hand
// (native smooth scrolling is unreliable in some browsers and webviews).
export function scrollToElement(el: HTMLElement, offset = 84, duration = 650) {
  const start = window.scrollY;
  const target = el.getBoundingClientRect().top + start - offset;
  const lenis = getLenis();
  if (lenis) {
    lenis.scrollTo(target, { duration: 1.1 });
    // if the browser isn't producing animation frames, jump instead
    setTimeout(() => {
      if (Math.abs(window.scrollY - start) < 2 && Math.abs(target - start) > 2) lenis.scrollTo(target, { immediate: true });
    }, 150);
    return;
  }
  if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
    window.scrollTo(0, target);
    return;
  }
  const t0 = performance.now();
  let ticked = false;
  // If the browser isn't producing animation frames (throttled tab, some webviews), jump instead
  setTimeout(() => {
    if (!ticked) window.scrollTo(0, target);
  }, 120);
  const step = (now: number) => {
    ticked = true;
    const t = Math.min((now - t0) / duration, 1);
    const eased = t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
    window.scrollTo(0, start + (target - start) * eased);
    if (t < 1) requestAnimationFrame(step);
  };
  requestAnimationFrame(step);
}
