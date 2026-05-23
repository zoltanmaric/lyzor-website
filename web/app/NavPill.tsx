"use client";

import { useState, type CSSProperties, type MouseEvent } from "react";

const CALENDAR_ICON_SRC =
  "https://framerusercontent.com/images/KWIQA1fu0j0rgpoUIZjR54Gr7U.svg?width=16&height=16";

type NavLink = { label: string; href: string };

const NAV_LINKS: NavLink[] = [
  { label: "Home", href: "#top" },
  { label: "Story", href: "#story" },
];

const CONTACT_CLOSED_WIDTH = 40;
const CONTACT_OPEN_WIDTH = 119;
const CONTACT_CLOSED_HEIGHT = 40;
const CONTACT_OPEN_HEIGHT = 50;

// Closed-state gradient (mini calendar button) and open-state gradient ("Contact us"
// pill), measured directly from the Framer source.
const CONTACT_CLOSED_GRADIENT =
  "linear-gradient(180deg, rgba(66, 81, 166, 0.92) 0%, rgb(166, 165, 250) 100%)";
const CONTACT_OPEN_GRADIENT =
  "linear-gradient(123deg, rgb(89, 103, 181) -12%, rgb(144, 142, 237) 88.69%)";

const CONTACT_CLOSED_SHADOW =
  "0 0.5px 0.29px -1px rgba(136, 138, 227, 0.53), 0 1.83px 1.1px -2px rgba(136, 138, 227, 0.5), 0 8px 4.8px -3px rgba(136, 138, 227, 0.36), inset 0 0 0 -1.875px rgba(255, 255, 255, 0.23), inset 0 0 0 -3.75px rgba(255, 255, 255, 0.09), inset 0 0 2px 0 rgba(30, 33, 115, 0.3)";
const CONTACT_OPEN_SHADOW =
  "0 0.52px 0.31px -0.75px rgba(136, 138, 227, 0.47), 0 1.57px 0.94px -1.5px rgba(136, 138, 227, 0.46), 0 4.15px 2.49px -2.25px rgba(136, 138, 227, 0.43), 0 13px 7.8px -3px rgba(136, 138, 227, 0.32), inset 0 0 0 -1.875px rgba(255, 255, 255, 0.23), inset 0 0 0 -3.75px rgba(255, 255, 255, 0.09), inset 0 0 2px 0 rgba(30, 33, 115, 0.3)";

function prefersReducedMotion() {
  return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

function smoothScrollTo(href: string) {
  const target =
    href === "#top" ? document.body : document.querySelector(href);
  if (!target) return;
  target.scrollIntoView({
    behavior: prefersReducedMotion() ? "auto" : "smooth",
    block: "start",
  });
  // For #top, clear the fragment by writing the bare path; otherwise the hash sticks
  // around after the smooth scroll and feels misleading ("you're at #top").
  const newUrl =
    href === "#top" ? location.pathname + location.search : href;
  history.replaceState(null, "", newUrl);
}

export function NavPill() {
  const [open, setOpen] = useState(false);
  const close = () => setOpen(false);

  const handleAnchor = (e: MouseEvent<HTMLAnchorElement>) => {
    const href = e.currentTarget.getAttribute("href") ?? "";
    if (!href.startsWith("#")) return;
    e.preventDefault();
    close();
    smoothScrollTo(href);
  };

  return (
    <header className="fixed inset-x-0 top-6 z-10 flex justify-center px-4">
      <nav
        className="flex flex-col rounded-[20px] border border-white/70 bg-white/40 p-1.5 pl-4 backdrop-blur-md"
        style={{ boxShadow: "0 8px 7px rgba(117, 132, 214, 0.1)" }}
      >
        <div className="flex items-center gap-2">
          <a
            href="#top"
            onClick={handleAnchor}
            className="text-menu-logo gradient-brand pr-2"
          >
            Lyzor Tx
          </a>

          <button
            type="button"
            aria-label={open ? "Close menu" : "Open menu"}
            aria-expanded={open}
            onClick={() => setOpen((v) => !v)}
            className="grid size-10 shrink-0 cursor-pointer place-items-center rounded-xl"
          >
            <DotsIndicator open={open} />
          </button>

          <a
            href="#contact"
            aria-label={open ? undefined : "Contact"}
            // background-image (gradient) is intentionally omitted from the transition
            // list — CSS can't interpolate between two linear-gradients, so it would
            // snap regardless. Width/height/border-radius/box-shadow all animate.
            className="relative grid shrink-0 place-items-center overflow-hidden transition-[width,height,border-radius,box-shadow] duration-300 ease-out"
            style={{
              width: open ? CONTACT_OPEN_WIDTH : CONTACT_CLOSED_WIDTH,
              height: open ? CONTACT_OPEN_HEIGHT : CONTACT_CLOSED_HEIGHT,
              borderRadius: open ? 24 : 16,
              backgroundImage: open
                ? CONTACT_OPEN_GRADIENT
                : CONTACT_CLOSED_GRADIENT,
              boxShadow: open ? CONTACT_OPEN_SHADOW : CONTACT_CLOSED_SHADOW,
            }}
          >
            {/* Icon is in normal flow → button's place-items-center keeps it centered
                in the 40px closed state. */}
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={CALENDAR_ICON_SRC}
              alt=""
              width={16}
              height={16}
              className={`transition-opacity duration-200 ${
                open ? "opacity-0" : "opacity-100"
              }`}
            />
            {/* Text is an absolute overlay so it never stretches the button width.
                Typography measured from the live Framer button: Manrope 16/400, -0.02em. */}
            <span
              aria-hidden={!open}
              className={`absolute inset-0 grid place-items-center text-[16px] leading-[1.3] font-normal whitespace-nowrap tracking-[-0.02em] text-white transition-opacity duration-200 ${
                open ? "opacity-100 delay-150" : "opacity-0"
              }`}
            >
              Contact us
            </span>
          </a>
        </div>

        <div
          className={`grid transition-[grid-template-rows] duration-300 ease-out ${
            open ? "grid-rows-[1fr]" : "grid-rows-[0fr]"
          }`}
        >
          <ul
            inert={!open}
            aria-hidden={!open}
            className={`overflow-hidden transition-opacity duration-200 ${
              open ? "opacity-100 delay-150" : "opacity-0"
            }`}
          >
            <li className="h-2" aria-hidden="true" />
            {NAV_LINKS.map((link) => (
              <li key={link.href}>
                <a
                  href={link.href}
                  onClick={handleAnchor}
                  className="text-brand-purple text-body-s block rounded-lg px-2 py-2 transition-colors hover:bg-white/40"
                >
                  {link.label}
                </a>
              </li>
            ))}
          </ul>
        </div>
      </nav>
    </header>
  );
}

/**
 * 3×3 grid of 4-px dots in a 24×24 container (matches Framer's source dimensions).
 * Hover deltas measured directly from the live site by engaging Framer's `.hover`
 * variant and reading getBoundingClientRect on each dot: the container scales
 * 24→34, edges (50%-anchored) shift 5px outward, corners (1px-from-corner) shift
 * 2px in each axis. Symmetric on both diagonals — corners end at radial 15.56,
 * edges at 14, which reads as a circle around the stationary center.
 *
 * Per-dot deltas live as inline CSS variables, read by the `.nav-dot` hover rule
 * in globals.css. Cross-fades with a single centered dot when the menu is open.
 */
const DOT_DEFS = [
  { x: 1, y: 1, dx: -2, dy: -2 }, // TL
  { x: 10, y: 1, dx: 0, dy: -5 }, // T
  { x: 19, y: 1, dx: 2, dy: -2 }, // TR
  { x: 1, y: 10, dx: -5, dy: 0 }, // L
  { x: 10, y: 10, dx: 0, dy: 0 }, // C
  { x: 19, y: 10, dx: 5, dy: 0 }, // R
  { x: 1, y: 19, dx: -2, dy: 2 }, // BL
  { x: 10, y: 19, dx: 0, dy: 5 }, // B
  { x: 19, y: 19, dx: 2, dy: 2 }, // BR
];

function DotsIndicator({ open }: { open: boolean }) {
  return (
    <div className="relative size-6">
      <div
        className={`absolute inset-0 transition-opacity duration-200 ${
          open ? "opacity-0" : "opacity-100"
        }`}
        aria-hidden="true"
      >
        {DOT_DEFS.map((d, i) => (
          <span
            key={i}
            className="nav-dot bg-brand-purple absolute size-1 rounded-full"
            style={
              {
                left: `${d.x}px`,
                top: `${d.y}px`,
                "--nav-dot-tx": `${d.dx}px`,
                "--nav-dot-ty": `${d.dy}px`,
              } as CSSProperties
            }
          />
        ))}
      </div>
      <div
        className={`absolute inset-0 grid place-items-center transition-opacity duration-200 ${
          open ? "opacity-100" : "opacity-0"
        }`}
        aria-hidden="true"
      >
        <span className="bg-brand-purple size-1 rounded-full" />
      </div>
    </div>
  );
}
