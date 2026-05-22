"use client";

import { useEffect, useRef } from "react";

/**
 * Scroll-driven floating 3D objects (ported from the Framer site's "Flying Objects" layer).
 * Each object has its own parallax rate (translateY-per-scrollY) and angular velocity
 * (degrees-per-scrollY) so the layer feels alive without overlapping the foreground content.
 *
 * Behavior is opt-out under `prefers-reduced-motion: reduce` (objects stay at their base
 * position + rotation, no scroll listener attached).
 */

const ICOSAHEDRON =
  "https://framerusercontent.com/images/RI5vfM6AVmTEZrQ7nwnkkMQuFE.png?width=400&height=408";
const SMALL_OBJECT =
  "https://framerusercontent.com/images/VvLBKpLpoUFxU4KdomO8oNqVg.png?width=220&height=230";

type FlyingObject = {
  src: string;
  size: number;
  // Position in viewport units relative to the page. We use vh/vw + percent so they sit
  // near interesting parts of the layout regardless of viewport.
  top: string;
  left?: string;
  right?: string;
  baseRotation: number;
  /** translateY = -scrollY * parallax. ~0 = scrolls with page, 1 = stays fixed. */
  parallax: number;
  /** Additional rotation per pixel scrolled. */
  rotationPerPx: number;
};

const OBJECTS: FlyingObject[] = [
  // Mid-left, just below hero — gentle parallax, slow spin.
  { src: ICOSAHEDRON, size: 180, top: "85vh", left: "4vw", baseRotation: -30, parallax: 0.3, rotationPerPx: 0.04 },
  // Right side, near the hero — small, faster spin.
  { src: SMALL_OBJECT, size: 110, top: "55vh", right: "8vw", baseRotation: -360, parallax: 0.15, rotationPerPx: 0.08 },
  // Left side, around the story section.
  { src: ICOSAHEDRON, size: 220, top: "170vh", left: "-3vw", baseRotation: -170, parallax: 0.5, rotationPerPx: 0.03 },
  // Right side, around the story section.
  { src: ICOSAHEDRON, size: 200, top: "200vh", right: "0vw", baseRotation: 220, parallax: 0.4, rotationPerPx: 0.05 },
];

export function FlyingObjects() {
  const refs = useRef<Array<HTMLDivElement | null>>([]);

  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    let frame = 0;
    const apply = () => {
      const scrollY = window.scrollY;
      for (let i = 0; i < OBJECTS.length; i++) {
        const el = refs.current[i];
        if (!el) continue;
        const o = OBJECTS[i];
        const ty = -scrollY * o.parallax;
        const rot = o.baseRotation + scrollY * o.rotationPerPx;
        el.style.transform = `translateY(${ty}px) rotate(${rot}deg)`;
      }
      frame = 0;
    };
    const onScroll = () => {
      if (frame) return;
      frame = requestAnimationFrame(apply);
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    apply();
    return () => {
      window.removeEventListener("scroll", onScroll);
      if (frame) cancelAnimationFrame(frame);
    };
  }, []);

  return (
    <div
      aria-hidden="true"
      className="pointer-events-none absolute inset-0 -z-[5] overflow-hidden"
    >
      {OBJECTS.map((o, i) => (
        <div
          key={i}
          ref={(el) => {
            refs.current[i] = el;
          }}
          className="absolute will-change-transform"
          style={{
            top: o.top,
            left: o.left,
            right: o.right,
            width: o.size,
            height: o.size,
            transform: `translateY(0px) rotate(${o.baseRotation}deg)`,
          }}
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={o.src}
            alt=""
            className="size-full object-contain"
            loading="lazy"
            decoding="async"
          />
        </div>
      ))}
    </div>
  );
}
