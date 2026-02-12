# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is a **Framer website** for **Lyzor Therapeutics** — a marketing website for a therapeutics company focused on "rapid, personalized therapy for hard-to-treat infections."

The primary way to edit this project is through the **Framer MCP integration**, which allows live editing of the Framer project directly from Claude Code. There is no build system, test suite, or linter — all editing happens via the Framer MCP tools.

## How to Work in This Project

### Framer MCP (primary editing method)

The MCP plugin must be open in the user's Framer project for the connection to work. If you get "Upstream not connected", ask the user to open Framer → Cmd-K → search "MCP" → open the plugin.

See `.claude/skills/framer-mcp.md` for full MCP capabilities, available tools, and usage patterns.

**Common workflows:**
1. **Explore:** `getProjectXml` → `getNodeXml(pageId)` → `getNodeXml(componentId)` for internals
2. **Edit content:** `getNodeXml` → `updateXmlForNode` with updated text/attributes
3. **Add sections:** Use pre-built section components with `?detached=true`, then customize
4. **Manage styles:** `manageColorStyle` / `manageTextStyle` for design tokens
5. **Code components:** Read the MCP resource `mcp://mcp.unframer.co/prompts/how-to-write-framer-code-files.md` first, then `createCodeFile` / `updateCodeFile`
6. **CMS:** `getCMSCollections` → `getCMSItems` → `upsertCMSItem`

**Important:** Make multiple small `updateXmlForNode` calls rather than one large batch — changes appear in real-time in the Framer canvas.

### Static Export (read-only reference)

A static HTML export exists in `raw_site_export/` for reference/preview only. The HTML is machine-generated and minified — always prefer editing via Framer MCP.

- Preview: open `raw_site_export/index.html` in a browser
- Assets: `raw_site_export/index_files/` (images in `.avif`/`.webp`, videos in `.mp4`, SVGs, CSS)

## Site Structure

### Pages
- `/` — Home (main landing page)
- `/contact` — Contact page
- `/journal` — Journal/blog listing
- `/journal/:slug` — Individual journal entries (dynamic, CMS-driven)
- `/404` — Error page

### Design System

**Font:** Manrope (all text styles)

**Colors:** Neutrals (`/White`, `/Gray 1`–`4`), Brand (`/Purple 1`–`2`, `/Blue 1`–`2`, `/Cyan`, `/Pink`)

**Text styles:** `/Heading 1`–`6`, `/Body L`/`M`/`S`/`XS`, `/Button`, `/Section Title`, `/Menu Logo`

Use `getProjectXml` to discover all components, their IDs, and available node attributes. Key architectural components include the Navigation Bar, Footer, Hero, and various card/bento module patterns.
