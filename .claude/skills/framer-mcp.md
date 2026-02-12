# Framer MCP Skill

Use this skill when the user wants to interact with the Framer project for Lyzor Therapeutics — editing pages, components, styles, CMS content, or creating code components via the Framer MCP server.

## Prerequisites

The Framer MCP plugin must be running in the user's Framer project. If you get an "Upstream not connected" error, ask the user to:
1. Open Framer
2. Press Cmd-K and search "MCP"
3. Open the MCP plugin
4. Try again

## Available Capabilities

### Project Exploration
- `getProjectXml` — Get full project structure: pages, components, code files, styles, and available node attributes. **Always call this first** to understand the project.
- `getNodeXml(nodeId)` — Get XML for a specific page or component. Components encapsulate layers; call this on each `componentId` to see its implementation.
- `getSelectedNodesXml` — Get XML for whatever the user currently has selected in Framer.
- `zoomIntoView(nodeId)` — Zoom the Framer canvas to center on a node.

### Editing Pages & Components
- `updateXmlForNode(nodeId, xml)` — Create, update, or reorder nodes. Key rules:
  - Nodes **without** a `nodeId` attribute are created as new nodes.
  - Nodes **with** a `nodeId` are updated (text, attributes, position).
  - To insert a component: use `insertUrl` attribute (get it from `getComponentInsertUrlAndTypes`).
  - Add `?detached=true` to `insertUrl` for editable unlinked copies.
  - Call this tool multiple times rather than batching all updates, so changes appear in real-time.
  - Cannot add text to an existing element that doesn't already contain text — wrap it in a new element.
- `deleteNode(nodeId)` — Delete a node and its children. Also works for color/text styles (pass style path) and code files.
- `duplicateNode(nodeId)` — Duplicate a node with all children.

### Components
- `getComponentInsertUrlAndTypes(id)` — Get `insertUrl`, import statement, and prop types for a component or code file. Use this before inserting components into the canvas.

### Styles
- `manageColorStyle(type, stylePath, properties)` — Create or update color styles. Path format: `/Folder/Name`. Reference in XML as `color="/path"`.
- `manageTextStyle(type, stylePath, properties)` — Create or update text styles (font, size, weight, color, alignment, etc.). Reference in XML as `inlineTextStyle="/path"`.
- `searchFonts(query)` — Search available fonts. Returns selectors like `"GF;Inter-600"` for use in XML `font` attributes. Note: `font` and `inlineTextStyle` are mutually exclusive on text nodes.

### Code Components
- **Always read** the MCP resource `mcp://mcp.unframer.co/prompts/how-to-write-framer-code-files.md` before creating or updating code files.
- `createCodeFile(name, content)` — Create a new `.tsx` code component. Returns ID, path, and `insertUrl`.
- `readCodeFile(codeFileId)` — Read an existing code file's content.
- `updateCodeFile(codeFileId, content)` — Replace a code file's content. Auto-linted and type-checked.

### CMS
- `getCMSCollections` — **Call first** before other CMS tools. Returns collections with field definitions (IDs, types, requirements).
- `getCMSItems(collectionId)` — Get items from a collection. Supports text search filtering and pagination (`skip`, `limit`).
- `upsertCMSItem(collectionId, ...)` — Create (provide `slug` + `fieldData`) or update (provide `itemId` + fields) a CMS item.
- `deleteCMSItem(collectionId, itemId)` — Permanently delete a CMS item.
- `createCMSCollection(name, fields)` — Create a new plugin-managed collection with field definitions.

### Publishing
- `getProjectWebsiteUrl` — Get staging and production URLs if the project has been published.

### React Export
- `exportReactComponents` — Export Framer components as React code (`.jsx` + `.css`). Returns a CLI command using the `unframer` package.

## Key Patterns

### Reading a page fully
1. `getProjectXml` to get page IDs
2. `getNodeXml(pageId)` for page XML
3. For each component instance found, call `getNodeXml(componentId)` to see its internals

### Adding a new element
```xml
<!-- Wrap new content with a known parent nodeId -->
<Parent nodeId="existing-id">
  <NewElement layout="stack" direction="vertical" gap="10">
    <Text>Hello world</Text>
  </NewElement>
</Parent>
```

### Inserting an existing component
1. `getComponentInsertUrlAndTypes(componentId)` to get the `insertUrl`
2. `updateXmlForNode(parentNodeId, xml)` with a `<ComponentInstance insertUrl="...">` node

### Code component rules
- Single default export per file, using named `function` syntax
- Only imports allowed: `react`, `react-dom`, `framer`, `framer-motion`
- Every component **must** have `addPropertyControls`
- Use `@framerSupportedLayoutWidth` and `@framerSupportedLayoutHeight` annotations
- Wrap state updates in `startTransition()`
- Guard `window`/`document` access for SSR