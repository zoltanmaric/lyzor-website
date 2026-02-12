# Plan: Create `deploy.py` for Cloudflare Pages deployment

## Context

The site is currently deployed to Cloudflare Pages by manually uploading the contents
of `site/` via the dashboard. This plan adds a `deploy.py` script that automates
deployment using the Wrangler CLI, callable with a single `python deploy.py` command.

## Approach: Wrangler CLI wrapper

Cloudflare Pages does **not** have a documented REST API for direct file uploads.
The officially supported programmatic method is `wrangler pages deploy`. The script
will shell out to `npx wrangler` — keeping the project Python-only (no `package.json`)
while leveraging the fully supported CLI.

**Why not the undocumented REST API?** The internal upload endpoints (reverse-engineered
from Wrangler source) involve a fragile multi-step hash-and-upload dance that could break
at any time. For a 3-page site, the complexity isn't justified.

## Files to create/modify

### 1. Create `deploy.py` (new file, ~80 lines)

```
#!/usr/bin/env python3
"""Deploy site/ to Cloudflare Pages via wrangler."""

Constants: ROOT, SITE_DIR, DEFAULT_PROJECT_NAME ("lyzor")

parse_args()        — argparse with optional --branch flag
get_config()        — reads CLOUDFLARE_API_TOKEN, CLOUDFLARE_ACCOUNT_ID,
                      CLOUDFLARE_PROJECT_NAME (default "lyzor") from env vars;
                      exits with clear error if required vars missing
validate_site_dir() — checks site/ exists and has HTML files;
                      exits with "run build.py first" message if not
find_npx()          — shutil.which("npx"); exits with install hint if missing
deploy()            — builds wrangler command, runs via subprocess.run(),
                      prints deployment URL from stdout
main()              — ties it together
```

Key details:
- Auth passed via subprocess env dict (CLOUDFLARE_API_TOKEN, CLOUDFLARE_ACCOUNT_ID)
- `--project-name` always passed to avoid interactive prompts
- `subprocess.run()` with `check=True`, `text=True`, `capture_output=True`
- On success, scans output for the `.pages.dev` URL and prints it
- On failure, prints wrangler's stderr and exits with its return code
- No new dependencies — uses only stdlib (`argparse`, `subprocess`, `shutil`, `pathlib`)

### 2. Update `README.md`

Replace the "Deploying" section with:

```markdown
### Deploying

Set the required environment variables, then deploy:

    export CLOUDFLARE_API_TOKEN="your-token"
    export CLOUDFLARE_ACCOUNT_ID="your-account-id"
    python deploy.py

For preview deploys: `python deploy.py --branch preview`

Requires Node.js (for `npx wrangler`).
```

### 3. Update `CLAUDE.md`

Add to the "Build Pipeline & Deployment" section:

```markdown
To deploy: `python deploy.py` (requires `CLOUDFLARE_API_TOKEN` and
`CLOUDFLARE_ACCOUNT_ID` env vars, plus Node.js for `npx wrangler`).
For preview deploys: `python deploy.py --branch preview`.
```

## Usage

```sh
# Full pipeline
python build.py && python deploy.py

# Preview deploy
python deploy.py --branch preview

# Custom project name
CLOUDFLARE_PROJECT_NAME=lyzor-staging python deploy.py
```

## Verification

1. Run `python deploy.py` without env vars set — should print clear error about
   missing `CLOUDFLARE_API_TOKEN` and `CLOUDFLARE_ACCOUNT_ID`
2. Run `python deploy.py` without `site/` existing — should print
   "run build.py first" message
3. Run `python deploy.py --help` — should show usage with `--branch` flag
4. With valid credentials and `site/` built: `python deploy.py` should deploy
   and print the `.pages.dev` URL
