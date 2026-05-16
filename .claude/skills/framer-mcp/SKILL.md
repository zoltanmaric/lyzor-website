---
name: framer-mcp
description: Edits the Framer-built Lyzor Therapeutics website through the Framer MCP server — reads project XML, modifies
  pages and components, manages color and text styles, edits CMS content, and creates or updates Framer code components.
  Use whenever the user asks to change the live site, add or edit pages/components/sections, tweak design tokens, manage
  CMS items or collections, write Framer code components, or export Framer components as React.
---

# Framer MCP

Edit the Lyzor Therapeutics Framer project through MCP tools prefixed `Framer:`.

## Prerequisite

The Framer MCP plugin must be open in the user's Framer project. On "Upstream not connected", ask the user to open Framer → Cmd-K → search "MCP" → open the plugin → retry.

## Standard workflow

1. **Always start with `Framer:getProjectXml`** — returns pages, components, code files, styles, the full list of supported node attributes, and the currently focused page/component (where new `ComponentInstance` nodes get inserted by default).
2. **Read what you need with `Framer:getNodeXml(nodeId)`** — pages, design pages, components, or any layer found inside them. Component instances on a page reference a `componentId`; call `getNodeXml` on that to see the component's internals.
3. **Or read selection with `Framer:getSelectedNodesXml`** — whatever the user has selected in Framer.
4. **Edit with `Framer:updateXmlForNode(nodeId, xml)`** — see [Editing rules](#editing-rules). Prefer many small calls over one big batch so changes appear live in the canvas.

`Framer:zoomIntoView(nodeId)` centers the canvas on a node (not supported for code files). `updateXmlForNode` accepts `zoomIntoView` (default `true`); mention to the user they can disable it if they want to use Framer while edits run.

## Editing rules

`Framer:updateXmlForNode` handles create, update, reorder, and reparent in one call.

**Two non-negotiable rules** (both come straight from the MCP tool description; violating them corrupts pages):

1. Wrap every edit in a parent element that has a real `nodeId`. The parent's `nodeId` tells Framer where to apply the patch.
2. When creating a new node, also include the immediate sibling **before** and the immediate sibling **after** it (each with their existing `nodeId`) so Framer can position it correctly. If you're appending at the very end, just include the last existing sibling.

Other rules:

- Updating an existing node: include its `nodeId`; supply only the attributes/text to change.
- Creating a new node: omit `nodeId`. Type is inferred from attributes:

  | Attribute | Becomes |
  | --- | --- |
  | `layout="stack"` or `layout="grid"` | Frame |
  | `svg="..."` | SVG |
  | `componentId` or `insertUrl` | ComponentInstance |
  | text content | Text |

- Cannot add text into an element that doesn't already contain text — wrap new text in a new element.
- Reparenting or reordering: same call, reference both the element's `nodeId` and the new parent's `nodeId`. Never use `deleteNode` to move things.

**Worked example — insert a "Testimonials" section above the footer:**

```xml
<Frame nodeId="HOMEPAGE_MAIN_STACK_ID">
  <!-- existing sibling immediately before the insertion point -->
  <ComponentInstance nodeId="FEATURES_SECTION_ID" />

  <!-- new node, no nodeId -->
  <ComponentInstance insertUrl="https://framer.com/m/Testimonials-XXXX.js?detached=true" />

  <!-- existing sibling immediately after -->
  <ComponentInstance nodeId="FOOTER_ID" />
</Frame>
```

Get `insertUrl` first via `Framer:getComponentInsertUrlAndTypes(id)` (accepts a component nodeId or a code-file id). Append `?detached=true` for an editable unlinked copy — after the insert, call `getNodeXml` on the parent again to see the expanded internal structure (Text/Frame/SVG children) you can now edit.

When in doubt, read the parent first with `getNodeXml`, then send back its full child list with your edit applied — that's the safest way to avoid accidentally reordering or losing siblings.

**Edit cadence**: structural inserts go in one call. Then make many small follow-up calls for text/attribute changes inside the new subtree — they appear live in the canvas.

**Other node ops**
- `Framer:duplicateNode(nodeId)` — exact copy (with children), placed at end of the original's parent.
- `Framer:deleteNode(nodeId)` — also accepts a style path (e.g. `/Primary`) or a code-file id.

## Pages

`Framer:createPage(name, type)` creates a page:
- `type="web"` for publishable pages — `name` must start with `/` (e.g. `/about`).
- `type="design"` for canvas/prototype pages — any name.

Then read it with `getNodeXml` and add content with `updateXmlForNode`.

## Styles

- `Framer:manageColorStyle({ type, stylePath, properties })` — path starts with `/`, name comes from the last segment (`/Brand/Primary` → `Primary` in `Brand`). `light` is required on create; `dark` is optional (pass `null` to remove). Reference in XML as `color="/Brand/Primary"`.
- `Framer:manageTextStyle({ type, stylePath, properties })` — supports `font`, `fontSize`, `lineHeight`, `letterSpacing`, `color`, `alignment`, `balance`, `tag`, italic/bold variants, decoration controls, transform, paragraph spacing. Reference in XML as `inlineTextStyle="/path"`. Updating a style updates every node using it — to change just one node, create a new style and re-point that node.
- `Framer:searchFonts(query)` — returns up to 20 selectors like `"GF;Inter-600"`. Use in XML as `font="GF;Inter-600"`. `font` and `inlineTextStyle` are mutually exclusive on a text node — clear one before applying the other.

## Code components and overrides

Before creating or editing a code file, read the MCP resource `mcp://mcp.unframer.co/prompts/how-to-write-framer-code-files.md` for the current rules.

- `Framer:createCodeFile(name, content)` — `.tsx` file exporting a component or override. Returns `id`, `path`, `insertUrl`.
- `Framer:readCodeFile(codeFileId)` — read existing content.
- `Framer:updateCodeFile(codeFileId, content)` — replace content; auto-linted and type-checked.
- `Framer:getComponentInsertUrlAndTypes(codeFileId)` — get the `insertUrl` and prop types to insert the component on a page, or the import statement to use it from another code file.

Standing rules for code components: single default export with named `function` syntax; only `react`, `react-dom`, `framer`, `framer-motion` imports; every component needs `addPropertyControls`; use `@framerSupportedLayoutWidth` and `@framerSupportedLayoutHeight` annotations; wrap state updates in `startTransition`; guard `window`/`document` for SSR.

## CMS

1. **`Framer:getCMSCollections` first** — returns each collection's `id`, name, management status (user-managed vs plugin-managed), and field definitions. Fields have an `id` (use this as the key in `fieldData`), `name`, `type`, and per-type extras (`cases` for enums, `collectionId` for references, `allowedFileTypes` for files). User-managed collections can't have fields added programmatically; ask the user to add them in Framer.
2. `Framer:getCMSItems(collectionId, { filter?, skip?, limit? })` — items with `id`, `slug`, `draft`, and `fieldData`. Default `limit` is 100.
3. `Framer:upsertCMSItem(collectionId, { slug?, itemId?, fieldData?, draft? })` — create with `slug` + `fieldData`; update with `itemId` + partial `fieldData` (only the keys you pass are touched, so the rest of the record is safe). Each entry in `fieldData` is keyed by **field id** (not name) and shaped `{ type, value }`. For `formattedText`, also pass `contentType: "markdown" | "html"`. Examples:

   ```json
   {
     "fieldId_for_title":   { "type": "string", "value": "Chief Scientific Officer" },
     "fieldId_for_bio":     { "type": "formattedText", "contentType": "markdown", "value": "**New** bio." },
     "fieldId_for_photo":   { "type": "image", "value": "https://..." }
   }
   ```
4. `Framer:deleteCMSItem(collectionId, itemId)` — permanent.
5. `Framer:createCMSCollection(name, fields)` — creates a plugin-managed collection. Field types: `string`, `number`, `boolean`, `color`, `date`, `image`, `link`, `formattedText`, `file`, `enum`, `collectionReference`, `multiCollectionReference`.

## Publishing and React export

- `Framer:getProjectWebsiteUrl` — staging and production URLs (if published).
- `Framer:exportReactComponents` — only works on component nodes. Returns a CLI command (using the `unframer` package) that downloads selected components as `.jsx` + `.css`. For a starter app: `npx -y unframer example-app <projectId>`. Surface this option when the user mentions exporting, reusing Framer components in code, or scaffolding a React app from the design.

## Design system (this project)

- **Font**: Manrope
- **Colors**: `/White`, `/Gray 1`–`4`, `/Purple 1`–`2`, `/Blue 1`–`2`, `/Cyan`, `/Pink`
- **Text styles**: `/Heading 1`–`6`, `/Body L`/`M`/`S`/`XS`, `/Button`, `/Section Title`, `/Menu Logo`

Confirm current names with `getProjectXml` before relying on them — the project evolves.
