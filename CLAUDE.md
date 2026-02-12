# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Code Style

- Limit line lengths to 120 characters, including in markdown files.
  Lines should use the full width — don't wrap at 80 or 100 when 120 is available.
  Only break earlier when it improves readability (e.g. list items, logical phrases).
- Always ensure files end with a single trailing newline (don't add extra blank lines).
- Always pin versions in requirements files.
- When editing files, present full file rewrites rather than many small sequential edits.

## Project Overview

See `README.md` for the project overview, pages, developer setup, build, and deployment instructions.

This is a Framer website for Lyzor Therapeutics. The primary way to edit is through the **Framer MCP
integration**. A Python build pipeline (`build.py`) downloads the published site, cleans it up, and
outputs deployment-ready files to `site/`.

## Framer MCP

The MCP plugin must be open in the user's Framer project for the connection to work. If you get
"Upstream not connected", ask the user to open Framer → Cmd-K → search "MCP" → open the plugin.

See `.claude/skills/framer-mcp.md` for full MCP capabilities, available tools, and usage patterns.

**Common workflows:**
1. **Explore:** `getProjectXml` → `getNodeXml(pageId)` → `getNodeXml(componentId)` for internals
2. **Edit content:** `getNodeXml` → `updateXmlForNode` with updated text/attributes
3. **Add sections:** Use pre-built section components with `?detached=true`, then customize
4. **Manage styles:** `manageColorStyle` / `manageTextStyle` for design tokens
5. **Code components:** Read the MCP resource
   `mcp://mcp.unframer.co/prompts/how-to-write-framer-code-files.md`
   first, then `createCodeFile` / `updateCodeFile`
6. **CMS:** `getCMSCollections` → `getCMSItems` → `upsertCMSItem`

**Important:** Make multiple small `updateXmlForNode` calls rather than one large batch — changes appear
in real-time in the Framer canvas.

## Build Pipeline Notes

After modifying `build.py`, check `git diff raw_site_export/` and `git diff site/` to verify no
inadvertent changes. The raw dumps should only change when the upstream Framer site changes. The `site/`
output diff should match what you'd expect from your pipeline changes — watch for encoding issues,
content mutations, or unexpected reformatting.

## Design System

**Font:** Manrope (all text styles)

**Colors:** Neutrals (`/White`, `/Gray 1`–`4`), Brand (`/Purple 1`–`2`, `/Blue 1`–`2`, `/Cyan`, `/Pink`)

**Text styles:** `/Heading 1`–`6`, `/Body L`/`M`/`S`/`XS`, `/Button`, `/Section Title`, `/Menu Logo`

Use `getProjectXml` to discover all components, their IDs, and available node attributes. Key
architectural components include the Navigation Bar, Footer, Hero, and various card/bento module
patterns.