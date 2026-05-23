<!-- BEGIN:nextjs-agent-rules -->
# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.
<!-- END:nextjs-agent-rules -->

## Reproducible dev environment at all times

You do not get to install software on the fly. Every dependency, every tool, every version must be
captured in a build manifest (`package.json` + lockfile) that lives in this directory.

- No `npm install <pkg>` without the package and its pinned version landing in `package.json` and the
  lockfile in the same change.
- `npx <pkg>` is permitted as a one-off bootstrap (e.g. `create-next-app`) only if its output (the
  generated `package.json` + lockfile) is committed. The scaffold is the manifest.
- Pin versions exactly — no `^`, no `~`, no `*`. The repo's existing `CLAUDE.md` already says this for
  requirements files; this extends it to `package.json`.
- If you used a tool to do something, it must be re-runnable by anyone who clones the repo. If it
  isn't, you broke the rule.

When you violate this (or notice a violation), fix it in the same turn — pin the version, update the
manifest, regenerate the lockfile. Do not leave the repo in a state where "it worked on my machine"
is the only proof.

## CSS gotchas (Tailwind 4 + Next.js dev server)

### Cascade layers vs. selector specificity

Tailwind 4 puts its utilities in `@layer utilities`. **CSS Cascade Layers override selector
specificity** — a rule in `@layer utilities` beats a more-specific rule in `@layer components`
regardless of the selector. If you write a component-layer rule like `button:hover .my-class
{ width: 26px }` and an element has the Tailwind utility `size-[19px]`, the utility wins, the
hover rule is ignored, and the animation silently doesn't happen.

**Fix:** declare rules that must beat utilities **outside any `@layer` block** (unlayered styles
win over all layered styles). Reserve `@layer components` for visual presets that don't need to
override utilities (text presets, gradient classes, etc.).

### CSS edits not reflecting in the browser

When you change `globals.css` and the browser still shows old styles:

1. First check the **served** CSS, not just the source on disk:
   `curl -s http://localhost:3000/ | grep -oE 'href="[^"]*\.css[^"]*"'` to find the URL, then
   `curl` it and grep for your selector.
2. If the served CSS still has the old rule, the dev server's compiled cache is stale. **Restart
   the dev server fully** (kill the process, then `npm run dev`). A page reload in the browser
   alone is not enough — the bundler keeps the old compiled chunk.

Don't keep debugging logic that's correct on disk. The bug is in the pipeline, not the rule.
