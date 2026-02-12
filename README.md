<p align="center">
  <img src="assets/Hero.png" alt="Lyzor Therapeutics" width="100%">
</p>

Marketing website for **Lyzor Therapeutics** — rapid, personalized therapy for hard-to-treat infections.

## Pages

- **/** — Home
- **/contact** — Contact
- **/journal** — Journal / blog

## How It Works

The site is designed and edited in [Framer](https://www.framer.com/), then exported as static HTML and
deployed to **Cloudflare Pages**.

### Editing

All editing happens in Framer. This repo includes a [Framer MCP](https://www.framer.com/developers/mcp)
integration (`.mcp.json`) that allows editing the Framer project directly from
[Claude Code](https://claude.ai/code).

To use the MCP integration:
1. Open the Framer project
2. Press **Cmd-K**, search "MCP", and open the plugin
3. Run Claude Code from this repo — the MCP tools will be available automatically

### Developer Setup

```sh
python3.13 -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
```

### Building

After publishing changes in Framer, activate the venv and run the build pipeline:

```sh
source .venv/bin/activate
python build.py
```

This downloads the published pages, cleans them up (removes Framer branding, extracts styles into CSS
files), and outputs deployment-ready files to `site/`.

### Deploying

Upload the contents of `site/` as a new deployment on Cloudflare Pages.

