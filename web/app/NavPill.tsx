"use client";

import { useState } from "react";

const CALENDAR_ICON_SRC =
  "https://framerusercontent.com/images/KWIQA1fu0j0rgpoUIZjR54Gr7U.svg?width=16&height=16";

type NavLink = { label: string; href: string };

const NAV_LINKS: NavLink[] = [
  { label: "Home", href: "#top" },
  { label: "Story", href: "#story" },
];

export function NavPill() {
  const [open, setOpen] = useState(false);
  const close = () => setOpen(false);

  return (
    <header className="fixed inset-x-0 top-6 z-10 flex justify-center px-4">
      <nav
        className="flex flex-col rounded-[20px] border border-white/70 bg-white/40 p-1.5 pl-4 backdrop-blur-md"
        style={{ boxShadow: "0 8px 7px rgba(117, 132, 214, 0.1)" }}
      >
        <div className="flex items-center gap-2">
          <a
            href="#top"
            onClick={close}
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
            {open ? <CloseIcon /> : <DotGrid />}
          </button>

          <a
            href="#contact"
            aria-label="Contact"
            className="grid size-10 shrink-0 place-items-center rounded-2xl"
            style={{
              background:
                "linear-gradient(180deg, rgba(66, 81, 166, 0.92) 0%, rgb(166, 165, 250) 100%)",
              boxShadow:
                "0 0.5px 0.29px -1px rgba(136, 138, 227, 0.53), 0 1.83px 1.1px -2px rgba(136, 138, 227, 0.5), 0 8px 4.8px -3px rgba(136, 138, 227, 0.36), inset 0 0 2px 0 rgba(30, 33, 115, 0.3)",
            }}
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={CALENDAR_ICON_SRC} alt="" width={16} height={16} />
          </a>
        </div>

        {/* Expanding links panel: grid-template-rows 0fr → 1fr animates content height
            cleanly without measuring the inner element. */}
        <div
          className={`grid transition-[grid-template-rows] duration-300 ease-out ${
            open ? "grid-rows-[1fr]" : "grid-rows-[0fr]"
          }`}
        >
          <ul
            className={`overflow-hidden transition-opacity duration-200 ${
              open ? "opacity-100 delay-150" : "opacity-0"
            }`}
          >
            <li className="h-2" aria-hidden="true" />
            {NAV_LINKS.map((link) => (
              <li key={link.href}>
                <a
                  href={link.href}
                  onClick={close}
                  className="text-brand-purple block rounded-lg px-2 py-2 text-lg font-semibold tracking-[-0.02em] transition-colors hover:bg-white/40"
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

function DotGrid() {
  return (
    <div className="grid grid-cols-3 gap-[3px]">
      {Array.from({ length: 9 }).map((_, i) => (
        <span
          key={i}
          className="size-[5px] rounded-full bg-brand-purple"
        />
      ))}
    </div>
  );
}

function CloseIcon() {
  return (
    <svg
      width="18"
      height="18"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
      className="text-brand-purple"
    >
      <path d="M6 6l12 12M18 6L6 18" />
    </svg>
  );
}
