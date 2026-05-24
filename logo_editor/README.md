# Icosahedron tuner

Interactive playground for the Lyzor Tx vector icosahedron mark. Pulls 12
golden-ratio vertices, 20 triangle faces, projects orthographically, and
shades them with a per-vertex Lambert model (key light + cyan rim light) using
a brand-palette colour ramp. Each visible face is filled with a linear
gradient between its darkest and brightest vertex so adjacent faces meet
seamlessly at shared edges.

## Files

- `icosa-tuner.html` — interactive tuner. Sliders for orientation, key light,
  rim light, ambient, and face-gradient strength. Buttons to copy/download
  the live SVG and its config.
- `gen-icosa.js` — Node script that emits the same SVG headless. Edit the
  `CONFIG` block at the top to change the baked-in orientation/light, then run
  `node gen-icosa.js [outpath]`.
- `icosa-reference.png` — the original Framer-render PNG used as a visual
  reference (shown in the right panel of the tuner).

## Running the tuner

The page only loads the reference PNG via a relative URL, so any static
server in this directory works. From the repo root:

```
python3 -m http.server 5510 --bind 127.0.0.1 --directory logo_editor
```

Then open <http://127.0.0.1:5510/icosa-tuner.html>.

## Generating an SVG headlessly

```
node logo_editor/gen-icosa.js logo_editor/icosa.svg
```

`gen-icosa.js` has no dependencies — Node ≥ 16's stdlib is enough.

## Design notes

- The reference PNG that ships with the Framer "Rescale" template is a baked
  raster, with no upstream vector source. The procedural approach here
  reproduces its look without needing a 3D file.
- An earlier iteration tried geometric edge rounding (subdivide-and-spherify)
  and a Blender-style bevel (inset face + chamfer band per edge + vertex cap).
  Both worked but neither matched the smooth shading of the reference once
  rendered to SVG — the bevel introduced visible chamfer strips, the
  subdivision drifted toward a geodesic ball. The Gouraud-per-vertex gradient
  shading you see here was the most faithful to the source.
