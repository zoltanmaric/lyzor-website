# Design Notes

Design decisions specific to the code-first rebuild. The `site/` folder (the Framer-built site) is
the *baseline* reference, not a contract — when the rebuild deliberately diverges, it's recorded
here so the `port-section` skill doesn't try to "fix" it back to Framer's version.

## Runtime assets

### Framer CDN hotlinking is OK during the rebuild

Runtime assets (lava-lamp hero video, icons, images) may be hotlinked from `framerusercontent.com`.
The Framer site is still live in parallel, so its CDN is available. The reproducible-env rule in
`web/AGENTS.md` covers *dev tooling* (pinned manifests), not the runtime origin of media. Don't
proactively offer to download Framer-hosted assets into `web/public/`; only do so when the user
signals Framer decommission or an asset URL breaks.

## Divergences from the Framer original

### Top menu pill

The rebuilt nav pill (`web/app/page.tsx`, `header > nav`) is kept rather than re-ported to match
the Framer original. The user prefers this rebuild's pill over the Framer version. Do not run the
port-section workflow on this element to bring it closer to `https://strong-motivation-722518.framer.app`.

If specific aspects of this divergence need to be locked in (proportions, dot size, padding,
icon, etc.), list them here so future edits don't accidentally drift back.
