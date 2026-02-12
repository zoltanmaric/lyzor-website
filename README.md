<p align="center">
  <img src="assets/Hero.png" alt="Lyzor Therapeutics" width="100%">
</p>

Marketing website for **Lyzor Therapeutics** — rapid, personalized therapy for hard-to-treat infections.

## Pages

- **/** — Home
- **/contact** — Contact
- **/journal** — Journal / blog

## How It Works

The site is designed and edited in [Framer](https://www.framer.com/), then exported as static HTML and deployed to **Cloudflare Pages**.

### Editing

All editing happens in Framer. This repo includes a [Framer MCP](https://www.framer.com/developers/mcp) integration (`.mcp.json`) that allows editing the Framer project directly from [Claude Code](https://claude.ai/code).

To use the MCP integration:
1. Open the Framer project
2. Press **Cmd-K**, search "MCP", and open the plugin
3. Run Claude Code from this repo — the MCP tools will be available automatically

### Exporting

After publishing changes in Framer, refresh the local HTML export:

```sh
./raw_site_export.sh
```

This downloads the published pages into `raw_site_export/`. Assets are served from Framer's CDN.

### Deploying

Upload the contents of `raw_site_export/` as a new deployment on Cloudflare Pages.
