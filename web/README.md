# Lyzor — code-first rebuild

Code-first rebuild of the Lyzor Therapeutics website, replacing the Framer-built `site/` folder
incrementally. Next.js App Router + Tailwind 4 + Manrope. TinaCMS integration is planned but
deferred — content lives in JSX for now.

The original Framer site stays live at `https://strong-motivation-722518.framer.app` until cutover;
this rebuild parallel-runs and can hotlink Framer's CDN for assets during the migration (see
`DESIGN_NOTES.md`).

## Develop

```bash
npm install
npm run dev
```

Open `http://localhost:3000`.

## Conventions

- **Hard rules:** see `AGENTS.md` (reproducible env, no on-the-fly installs, pinned versions).
- **Design tokens & text presets** live in `app/globals.css` as CSS classes mirroring the
  Framer design system (`.text-heading-hero`, `.text-menu-logo`, `.text-body-s`,
  `.gradient-brand`). Don't use arbitrary-value Tailwind utilities (`text-[38px]`, etc.) for
  design-system values — that's CSS spelled awkwardly. See `.claude/skills/port-section/SKILL.md`.
- **Design divergences** from the Framer original are tracked in `DESIGN_NOTES.md`.
- **Porting a section** from the live Framer site: use the `port-section` skill — measure with
  `getComputedStyle` on the live URL, don't eyeball.

## Stack

- Next.js 16 (App Router, Turbopack)
- React 19
- TypeScript
- Tailwind 4 (via `@import "tailwindcss"`)
- Manrope (via `next/font/google`)
