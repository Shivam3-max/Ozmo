"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";

/**
 * Scroll reveal with a belt-and-braces fallback.
 *
 * IntersectionObserver is the primary trigger, but it does not fire in every
 * environment (background tabs, some embedded viewers, programmatic scrolling).
 * Content that never reveals is content nobody can read, so a scroll/resize
 * check backs it up and anything already on screen at mount shows immediately.
 */
export default function Reveal({ children }: { children: ReactNode }) {
  const ref = useRef<HTMLDivElement>(null);
  const [shown, setShown] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      setShown(true);
      return;
    }

    let done = false;
    const reveal = () => {
      if (done) return;
      done = true;
      setShown(true);
      io?.disconnect();
      window.removeEventListener("scroll", check);
      window.removeEventListener("resize", check);
    };

    const check = () => {
      const r = el.getBoundingClientRect();
      if (r.top < window.innerHeight * 0.92 && r.bottom > 0) reveal();
    };

    const io =
      typeof IntersectionObserver !== "undefined"
        ? new IntersectionObserver(
            (entries) => entries.forEach((e) => e.isIntersecting && reveal()),
            { threshold: 0.08, rootMargin: "0px 0px -8% 0px" }
          )
        : null;

    io?.observe(el);
    window.addEventListener("scroll", check, { passive: true });
    window.addEventListener("resize", check, { passive: true });
    check();

    return () => {
      io?.disconnect();
      window.removeEventListener("scroll", check);
      window.removeEventListener("resize", check);
    };
  }, []);

  return (
    <div ref={ref} className={`reveal${shown ? " in" : ""}`}>
      {children}
    </div>
  );
}
