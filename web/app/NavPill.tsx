"use client";

import { useState, type MouseEvent } from "react";

const CALENDAR_ICON_SRC =
  "https://framerusercontent.com/images/KWIQA1fu0j0rgpoUIZjR54Gr7U.svg?width=16&height=16";

type NavLink = { label: string; href: string };

const NAV_LINKS: NavLink[] = [
  { label: "Home", href: "#top" },
  { label: "Story", href: "#story" },
];

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
  history.replaceState(null, "", href === "#top" ? " " : href);
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
            className="grid size-10 shrink-0 cursor-pointer place-items-center rounded-xl transition-colors hover:bg-white/40"
          >
            <DotsIndicator open={open} />
          </button>

          <a
            href="#contact"
            aria-label={open ? undefined : "Contact"}
            className="grid h-10 shrink-0 place-items-center overflow-hidden rounded-[16px] transition-[min-width,padding] duration-300 ease-out"
            style={{
              minWidth: open ? 112 : 40,
              paddingLeft: open ? 16 : 0,
              paddingRight: open ? 16 : 0,
              background:
                "linear-gradient(180deg, rgba(66, 81, 166, 0.92) 0%, rgb(166, 165, 250) 100%)",
              boxShadow:
                "0 0.5px 0.29px -1px rgba(136, 138, 227, 0.53), 0 1.83px 1.1px -2px rgba(136, 138, 227, 0.5), 0 8px 4.8px -3px rgba(136, 138, 227, 0.36), inset 0 0 2px 0 rgba(30, 33, 115, 0.3)",
            }}
          >
            <span className="relative grid place-items-center">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={CALENDAR_ICON_SRC}
                alt=""
                width={16}
                height={16}
                className={`col-start-1 row-start-1 transition-opacity duration-200 ${
                  open ? "opacity-0" : "opacity-100"
                }`}
              />
              <span
                aria-hidden={!open}
                className={`col-start-1 row-start-1 text-sm font-semibold whitespace-nowrap text-white transition-opacity duration-200 ${
                  open ? "opacity-100 delay-150" : "opacity-0"
                }`}
                style={{ gridColumn: 1, gridRow: 1 }}
              >
                Contact us
              </span>
            </span>
          </a>
        </div>

        <div
          className={`grid transition-[grid-template-rows] duration-300 ease-out ${
            open ? "grid-rows-[1fr]" : "grid-rows-[0fr]"
          }`}
        >
          <ul
            // @ts-expect-error — React 19 supports the inert prop, types lag.
            inert={!open ? "" : undefined}
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
                  tabIndex={open ? 0 : -1}
                  className="text-brand-purple block rounded-lg px-2 py-2 text-base font-semibold tracking-[-0.02em] transition-colors hover:bg-white/40"
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
 * 9 dots that:
 *  - Sit in a 3x3 grid (square arrangement) at rest.
 *  - Translate to a circular arrangement on parent button :hover — the 4 corner dots
 *    pull inward to the same radius as the edge dots.
 *  - Cross-fade with a single centered dot when the menu is open.
 *
 * Hover position deltas (px) for each dot relative to its grid position:
 *     corner → inward by ~2px on both axes
 *     edge / center → no change
 */
const DOT_POSITIONS = [
  { x: 0, y: 0, dx: 2, dy: 2 },
  { x: 7, y: 0, dx: 0, dy: 0 },
  { x: 14, y: 0, dx: -2, dy: 2 },
  { x: 0, y: 7, dx: 0, dy: 0 },
  { x: 7, y: 7, dx: 0, dy: 0 },
  { x: 14, y: 7, dx: 0, dy: 0 },
  { x: 0, y: 14, dx: 2, dy: -2 },
  { x: 7, y: 14, dx: 0, dy: 0 },
  { x: 14, y: 14, dx: -2, dy: -2 },
];

function DotsIndicator({ open }: { open: boolean }) {
  return (
    <div className="relative size-[19px]">
      <div
        className={`absolute inset-0 transition-opacity duration-200 ${
          open ? "opacity-0" : "opacity-100"
        }`}
        aria-hidden="true"
      >
        {DOT_POSITIONS.map((p, i) => (
          <span
            key={i}
            className="nav-dot bg-brand-purple absolute size-[5px] rounded-full"
            style={
              {
                left: `${p.x}px`,
                top: `${p.y}px`,
                "--nav-dot-tx": `${p.dx}px`,
                "--nav-dot-ty": `${p.dy}px`,
              } as React.CSSProperties
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
        <span className="bg-brand-purple size-[5px] rounded-full" />
      </div>
    </div>
  );
}
