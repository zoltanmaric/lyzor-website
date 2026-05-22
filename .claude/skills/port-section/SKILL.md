---
name: port-section
description: Ports a section from the live Framer-built Lyzor site to the code-first Next.js rebuild in
  `web/`, matching typography and layout by measuring the source rather than eyeballing it. Use whenever
  the user asks to rebuild, port, recreate, or "make code-first" any page, section, or component from
  the Framer site — or asks why a rebuilt section doesn't look right.
---

# Port Section

Rebuild a Framer section in the Next.js `web/` project with measured fidelity, not eyeballed
approximations. The dominant failure mode is picking Tailwind defaults that *look close* and
shipping a 20%-off port.

## When to use

Trigger on requests like:

- "port the X section / page / component"
- "rebuild X in web/"
- "match the live site's X"
- "why doesn't my X look right?"
- "make this look the same as the Framer one"

Do **not** use this for greenfield design work — only when there's a live Framer reference at
`https://strong-motivation-722518.framer.app` to measure against.

## Prerequisites

- The Next.js rebuild lives in `web/` (App Router, Tailwind 4, Manrope).
- The Framer source lives in `site/` (deployed at the URL above) and is the authority for visuals
  until cutover.
- Hotlinking `framerusercontent.com` for runtime assets is OK ([[project-framer-cdn-ok]]).
- Computed values are queried via Chrome MCP `javascript_tool` running `getComputedStyle` on the live
  URL.

## Protocol

Execute these steps in order.

### 1. Identify the target

Name the section concretely. "The hero", "the top nav", "the team cards". If the user said
"port X", grep `site/index.html` for the section's text or `data-framer-name` to find the
markup and confirm scope.

### 2. Measure the source

Open the live URL in a Chrome tab and use `mcp__claude-in-chrome__javascript_tool` to dump
`getComputedStyle` for every element whose styling matters (text, buttons, container). Always
read at least: `font-family`, `font-size`, `font-weight`, `letter-spacing`, `line-height`,
`color`, `background-image`, plus any layout values you suspect (padding, border-radius,
box-shadow).

```js
(() => {
  const pick = (el, props) => {
    if (!el) return null;
    const cs = getComputedStyle(el);
    return Object.fromEntries(props.map(p => [p, cs.getPropertyValue(p)]));
  };
  const props = ['font-family','font-size','font-weight','letter-spacing','line-height','color','background-image'];
  // ...select elements by text or data-framer-name, then return JSON.stringify({...})
})()
```

Element selection: prefer `document.querySelectorAll('h1.framer-text')` + filter by
`textContent`, or `[data-framer-name="..."]`. Filter out hidden SSR variants with
`el.offsetParent !== null` so you read the visible-at-this-viewport variant.

Run the measurement at **the viewport you intend to ship**. Framer renders SSR variants for each
breakpoint (Desktop ≥1200px, Tablet 810–1199px, Mobile ≤809px); the visible one changes with
window width. If you need multiple breakpoints, either query at multiple widths or read
`site/css/styles.css` to extract the variant-specific values directly.

### 3. Cross-check authoring intent (optional but recommended)

Use Framer MCP (`Framer:getNodeXml`) to read the section's authoring tokens — preset names like
`URmgwAUh2` (style preset) and design-token IDs. These are stable across breakpoints and tell
you "this is the `/Heading 1` preset" rather than "this happens to be 48px right now". Higher
signal for naming things in the rebuild.

### 4. Map values to CSS, not arbitrary Tailwind

Design-system values (font sizes, weights, letter-spacing, line-heights, brand colors, gradients)
live in **`web/app/globals.css`** as named CSS classes under `@layer components`, mirroring the
Framer text presets:

```css
@layer components {
  .text-heading-hero { font-size: 48px; font-weight: 500; letter-spacing: -0.05em; line-height: 1em; }
  .text-menu-logo    { font-size: 38px; font-weight: 800; letter-spacing: -0.05em; line-height: 0.9em; }
  .text-body-s       { font-size: 15px; font-weight: 400; letter-spacing: -0.02em; line-height: 1.4em; }

  @media (min-width: 1200px) {
    .text-heading-hero { font-size: 7rem; }
    .text-menu-logo    { font-size: 45px; }
    .text-body-s       { font-size: 20px; }
  }
}
```

Color tokens go in `@theme inline { --color-<name>: ... }` so they generate Tailwind utilities
(`bg-brand-purple`, `text-body-text`).

**Anti-patterns** — do not do these:

- `text-[38px]`, `tracking-[-0.05em]`, `leading-[0.9]` in JSX — this is CSS spelled awkwardly and
  loses the design-system name.
- Inline `style={{ fontSize: 38 }}` — same problem, worse.
- Tailwind defaults like `text-2xl font-extrabold tracking-tight` for typography that's part of
  the design system — they'll be close but never right, and the eyeball-the-screenshot loop will
  keep losing.

Layout one-offs (a single button's box-shadow, a single section's grid) may stay inline; only
hoist to CSS classes when the values repeat or carry design-system meaning.

### 5. Apply in JSX

The JSX should read as design-system names:

```tsx
<h1 className="text-heading-hero gradient-brand">Lyzor Therapeutics</h1>
<p  className="text-body-s text-body-text mt-6">AI-guided bacteriophage matching</p>
```

Not:

```tsx
<h1 className="text-5xl font-medium tracking-[-0.05em] leading-none lg:text-[7rem]" style={{...}}>
```

### 6. Verify visually

Take a screenshot of `http://localhost:3000` via Chrome MCP. Eyeball it against the live site at
the same viewport. If anything's still off, go back to step 2 — don't guess.

## Common failure modes

- **Eyeballing from a screenshot.** The screenshot is the test, not the source. Measure with
  `getComputedStyle`.
- **Trusting Tailwind defaults.** Tailwind's `tracking-tight` is -0.025em; Framer's is -0.05em.
  They're not the same. Defaults are guesses; measured values are facts.
- **Forgetting breakpoints.** Framer ships separate SSR variants per breakpoint. Reading values
  at one viewport and applying them globally will be wrong at every other viewport.
- **Inline arbitrary-value Tailwind for design tokens.** `text-[38px]` is the smell that you
  skipped step 4. Move it to CSS.
- **Skipping authoring intent.** The Framer preset name (`/Heading 1`, `/Menu Logo`) is how the
  design system thinks about the element. Naming it accordingly in the rebuild keeps the systems
  aligned; naming it `.hero-text-big` loses that connection.
- **`background-clip: text` on a block heading clips descenders.** Framer puts the gradient on an
  inner `<span data-text-fill="true">`, not on the `<h1>`. Mirror that — gradient class goes on an
  inline span, not the heading. If descenders still clip at very tight line-heights, give the
  gradient class `display: inline-block; padding-bottom: 0.15em` so the background box extends
  past the baseline.
