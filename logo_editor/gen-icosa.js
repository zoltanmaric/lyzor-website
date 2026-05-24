// Command-line companion to icosa-tuner.html — emits the same Gouraud-shaded
// SVG the tuner produces, using the configuration baked in at the top of this
// file. Run with `node gen-icosa.js [outpath]`.

const fs = require("fs");
const path = require("path");

// ---- Configuration (matches the tuner's saved defaults) ----
const CONFIG = {
  spin: 1.33,
  roll: -0.18,
  tilt: 0.09,
  apexUp: true,
  light: [-0.6, 0.31, 0.65],
  rim: [0.38, 0.05, -0.45],
  ambient: 0.38,
  rimStrength: 0.25,
  // 0 → flat (each face a single colour at its averaged intensity),
  // 1 → full Gouraud-style gradient between brightest and darkest vertex.
  gradientStrength: 0,
};

const PHI = (1 + Math.sqrt(5)) / 2;

const V = [
  [0, 1, PHI], [0, -1, PHI], [0, 1, -PHI], [0, -1, -PHI],
  [1, PHI, 0], [-1, PHI, 0], [1, -PHI, 0], [-1, -PHI, 0],
  [PHI, 0, 1], [-PHI, 0, 1], [PHI, 0, -1], [-PHI, 0, -1],
];

const F = [
  [0, 1, 8], [0, 8, 4], [0, 4, 5], [0, 5, 9], [0, 9, 1],
  [1, 9, 7], [1, 7, 6], [1, 6, 8], [8, 6, 10], [8, 10, 4],
  [4, 10, 2], [4, 2, 5], [5, 2, 11], [5, 11, 9], [9, 11, 7],
  [7, 11, 3], [7, 3, 6], [6, 3, 10], [10, 3, 2], [11, 2, 3],
];

const sub = (a, b) => [a[0]-b[0], a[1]-b[1], a[2]-b[2]];
const cross = (a, b) => [a[1]*b[2]-a[2]*b[1], a[2]*b[0]-a[0]*b[2], a[0]*b[1]-a[1]*b[0]];
const dot = (a, b) => a[0]*b[0]+a[1]*b[1]+a[2]*b[2];
const norm = (a) => { const n = Math.hypot(a[0], a[1], a[2]); return n ? [a[0]/n, a[1]/n, a[2]/n] : [0,0,0]; };
const rotX = (p, a) => { const c=Math.cos(a), s=Math.sin(a); return [p[0], p[1]*c - p[2]*s, p[1]*s + p[2]*c]; };
const rotY = (p, a) => { const c=Math.cos(a), s=Math.sin(a); return [p[0]*c + p[2]*s, p[1], -p[0]*s + p[2]*c]; };
const rotZ = (p, a) => { const c=Math.cos(a), s=Math.sin(a); return [p[0]*c - p[1]*s, p[0]*s + p[1]*c, p[2]]; };

const STOPS = [
  { t: 0.00, c: [148, 140, 210] },
  { t: 0.35, c: [178, 174, 232] },
  { t: 0.65, c: [206, 208, 246] },
  { t: 0.85, c: [195, 232, 250] },
  { t: 1.00, c: [240, 250, 255] },
];

function rampColor(t) {
  t = Math.max(0, Math.min(1, t));
  for (let i = 1; i < STOPS.length; i++) {
    if (t <= STOPS[i].t) {
      const a = STOPS[i-1], b = STOPS[i];
      const u = (t - a.t) / (b.t - a.t || 1);
      const mix = (k) => Math.round(a.c[k] + (b.c[k] - a.c[k]) * u);
      return `rgb(${mix(0)},${mix(1)},${mix(2)})`;
    }
  }
  return `rgb(${STOPS[STOPS.length-1].c.join(",")})`;
}

function convexHull(pts) {
  const sorted = pts.slice().sort((a, b) => a[0] - b[0] || a[1] - b[1]);
  const ccw = (o, a, b) => (a[0]-o[0])*(b[1]-o[1]) - (a[1]-o[1])*(b[0]-o[0]);
  const lower = [];
  for (const p of sorted) {
    while (lower.length >= 2 && ccw(lower[lower.length-2], lower[lower.length-1], p) <= 0) lower.pop();
    lower.push(p);
  }
  const upper = [];
  for (let i = sorted.length - 1; i >= 0; i--) {
    const p = sorted[i];
    while (upper.length >= 2 && ccw(upper[upper.length-2], upper[upper.length-1], p) <= 0) upper.pop();
    upper.push(p);
  }
  return lower.slice(0, -1).concat(upper.slice(0, -1));
}

function buildSvg(opts) {
  const { spin, roll, tilt, apexUp, light, rim, ambient, rimStrength, gradientStrength } = opts;
  const RX0 = apexUp ? -Math.atan(PHI) : 0;
  const verts = V.map(p => rotX(rotZ(rotY(rotX(p, RX0), spin), roll), tilt));

  const faceNormals = F.map(([a, b, c]) => norm(cross(sub(verts[b], verts[a]), sub(verts[c], verts[a]))));
  const vertNormals = verts.map(() => [0, 0, 0]);
  F.forEach(([a, b, c], fi) => {
    const n = faceNormals[fi];
    [a, b, c].forEach(vi => { vertNormals[vi][0] += n[0]; vertNormals[vi][1] += n[1]; vertNormals[vi][2] += n[2]; });
  });
  for (let i = 0; i < vertNormals.length; i++) vertNormals[i] = norm(vertNormals[i]);

  const L = norm(light);
  const R = norm(rim);
  const intensities = vertNormals.map(n => {
    const d = Math.max(0, dot(n, L));
    const r = Math.max(0, dot(n, R));
    const rimT = Math.pow(r, 3) * rimStrength;
    const spec = Math.pow(d, 8) * 0.18;
    return Math.min(1, ambient + (1 - ambient) * d + spec + rimT);
  });

  const VIEW = 220, PAD = 16;
  const xs = verts.map(p => p[0]); const ys = verts.map(p => p[1]);
  const maxR = Math.max(...xs.map(Math.abs), ...ys.map(Math.abs));
  const SCALE = (VIEW / 2 - PAD) / maxR;
  const CX = VIEW / 2, CY = VIEW / 2;
  const proj = verts.map(p => [CX + p[0] * SCALE, CY - p[1] * SCALE]);

  const camDir = [0, 0, 1];
  const facesOut = [];
  F.forEach(([a, b, c], fi) => {
    const fn = faceNormals[fi];
    if (dot(fn, camDir) <= 0.001) return;
    const tri = [a, b, c].map(vi => ({ vi, i: intensities[vi], p: proj[vi] }));
    tri.sort((x, y) => x.i - y.i);
    const cz = (verts[a][2] + verts[b][2] + verts[c][2]) / 3;
    const avg = (tri[0].i + tri[1].i + tri[2].i) / 3;
    facesOut.push({ abc: [a, b, c], lo: tri[0], hi: tri[2], avg, depth: cz });
  });
  facesOut.sort((x, y) => x.depth - y.depth);

  // gradientStrength: 0 → flat fill at avg intensity; 1 → full Gouraud-style
  // gradient between brightest and darkest vertex.
  const g = Math.max(0, Math.min(1, gradientStrength));
  let defs = "";
  let polys = "";
  facesOut.forEach((f, idx) => {
    const id = `g${idx}`;
    const pts = f.abc.map(vi => `${proj[vi][0].toFixed(2)},${proj[vi][1].toFixed(2)}`).join(" ");
    if (g <= 0) {
      polys += `<polygon points="${pts}" fill="${rampColor(f.avg)}"/>`;
      return;
    }
    const stopLo = f.avg + (f.lo.i - f.avg) * g;
    const stopHi = f.avg + (f.hi.i - f.avg) * g;
    defs += `<linearGradient id="${id}" gradientUnits="userSpaceOnUse" x1="${f.lo.p[0].toFixed(2)}" y1="${f.lo.p[1].toFixed(2)}" x2="${f.hi.p[0].toFixed(2)}" y2="${f.hi.p[1].toFixed(2)}">`;
    defs += `<stop offset="0%" stop-color="${rampColor(stopLo)}"/><stop offset="100%" stop-color="${rampColor(stopHi)}"/></linearGradient>`;
    polys += `<polygon points="${pts}" fill="url(#${id})"/>`;
  });

  const visibleVerts = new Set();
  facesOut.forEach(f => f.abc.forEach(vi => visibleVerts.add(vi)));
  const hullPts = Array.from(visibleVerts).map(vi => proj[vi]);
  const hull = convexHull(hullPts).map(p => `${p[0].toFixed(2)},${p[1].toFixed(2)}`).join(" ");

  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${VIEW} ${VIEW}" width="${VIEW}" height="${VIEW}" fill="none">
<defs>
<filter id="glow" x="-20%" y="-20%" width="140%" height="140%"><feGaussianBlur stdDeviation="3"/></filter>
${defs}
</defs>
<polygon points="${hull}" fill="#cfd0f6" opacity="0.22" filter="url(#glow)"/>
${polys}
</svg>
`;
}

const out = process.argv[2] || path.join(__dirname, "icosa.svg");
fs.writeFileSync(out, buildSvg(CONFIG));
console.log(`wrote ${out}`);
