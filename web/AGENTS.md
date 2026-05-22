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
