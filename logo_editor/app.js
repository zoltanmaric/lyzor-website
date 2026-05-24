import { buildSvg, buildLogoSvg } from "./logo.js";

const inputs = {
  spin: document.getElementById('spin'), roll: document.getElementById('roll'), tilt: document.getElementById('tilt'),
  apex: document.getElementById('apex'),
  lx: document.getElementById('lx'), ly: document.getElementById('ly'), lz: document.getElementById('lz'), amb: document.getElementById('amb'),
  rx: document.getElementById('rx'), ry: document.getElementById('ry'), rz: document.getElementById('rz'), rims: document.getElementById('rims'),
  grad: document.getElementById('grad'),
};
const labels = {
  spin: document.getElementById('spin-v'), roll: document.getElementById('roll-v'), tilt: document.getElementById('tilt-v'),
  lx: document.getElementById('lx-v'), ly: document.getElementById('ly-v'), lz: document.getElementById('lz-v'), amb: document.getElementById('amb-v'),
  rx: document.getElementById('rx-v'), ry: document.getElementById('ry-v'), rz: document.getElementById('rz-v'), rims: document.getElementById('rims-v'),
  grad: document.getElementById('grad-v'),
};
const layoutInputs = {
  icoX: document.getElementById('icoX'), icoY: document.getElementById('icoY'), icoSize: document.getElementById('icoSize'),
  margin: document.getElementById('margin'),
  textX: document.getElementById('textX'), textY: document.getElementById('textY'), textSize: document.getElementById('textSize'),
};
const layoutLabels = {
  icoX: document.getElementById('icoX-v'), icoY: document.getElementById('icoY-v'), icoSize: document.getElementById('icoSize-v'),
  margin: document.getElementById('margin-v'),
  textX: document.getElementById('textX-v'), textY: document.getElementById('textY-v'), textSize: document.getElementById('textSize-v'),
};
const darkTextColorEl = document.getElementById('darkTextColor');
const lightTextColorEl = document.getElementById('lightTextColor');

function readOpts() {
  return {
    spin: +inputs.spin.value,
    roll: +inputs.roll.value,
    tilt: +inputs.tilt.value,
    apexUp: inputs.apex.checked,
    light: [+inputs.lx.value, +inputs.ly.value, +inputs.lz.value],
    rim: [+inputs.rx.value, +inputs.ry.value, +inputs.rz.value],
    ambient: +inputs.amb.value,
    rimStrength: +inputs.rims.value,
    gradientStrength: +inputs.grad.value,
  };
}

function readLayout() {
  return {
    textX: +layoutInputs.textX.value,
    textY: +layoutInputs.textY.value,
    textSize: +layoutInputs.textSize.value,
    icoX: +layoutInputs.icoX.value,
    icoY: +layoutInputs.icoY.value,
    icoSize: +layoutInputs.icoSize.value,
  };
}

// Tighten the logo composition's outer viewBox to the actual content bbox
// plus a uniform margin on all four sides. The text bbox comes from a brief
// DOM render (getBBox); the icosahedron bounds come from the layout values
// directly — a nested <svg>'s getBBox returns 0 in some browsers, which is
// what made the icosa disappear from the first crop attempt.
function cropLogoSvg(svgString, layout, margin) {
  const { icoX, icoY, icoSize } = layout;
  const tmp = document.createElement('div');
  tmp.style.cssText = 'position:absolute;left:-99999px;top:0;visibility:hidden';
  tmp.innerHTML = svgString;
  document.body.appendChild(tmp);
  let tb;
  try {
    tb = tmp.querySelector('text').getBBox();
  } finally {
    tmp.remove();
  }
  if (!tb || !isFinite(tb.width) || tb.width === 0) return svgString;

  const xMin = Math.min(tb.x, icoX);
  const yMin = Math.min(tb.y, icoY);
  const xMax = Math.max(tb.x + tb.width, icoX + icoSize);
  const yMax = Math.max(tb.y + tb.height, icoY + icoSize);
  const x = xMin - margin;
  const y = yMin - margin;
  const w = (xMax - xMin) + margin * 2;
  const h = (yMax - yMin) + margin * 2;
  const round = (n) => Math.round(n * 100) / 100;
  return svgString.replace(/<svg([^>]*?)>/, (_m, attrs) => {
    const cleaned = attrs
      .replace(/\swidth="[^"]*"/, '')
      .replace(/\sheight="[^"]*"/, '')
      .replace(/\sviewBox="[^"]*"/, '');
    return `<svg${cleaned} width="${round(w)}" height="${round(h)}" viewBox="${round(x)} ${round(y)} ${round(w)} ${round(h)}">`;
  });
}

function render() {
  const opts = readOpts();
  const layout = readLayout();
  const margin = +layoutInputs.margin.value;
  for (const k of Object.keys(labels)) labels[k].textContent = (+inputs[k].value).toFixed(2);
  for (const k of Object.keys(layoutLabels)) layoutLabels[k].textContent = String(+layoutInputs[k].value);
  const icosa = buildSvg(opts, "t");
  const logoDark = cropLogoSvg(buildLogoSvg(opts, layout, darkTextColorEl.value, "logo-d"), layout, margin);
  const logoLight = cropLogoSvg(buildLogoSvg(opts, layout, lightTextColorEl.value, "logo-l"), layout, margin);
  document.getElementById('render').innerHTML = icosa;
  document.getElementById('logo-stage-dark').innerHTML = logoDark;
  document.getElementById('logo-stage-light').innerHTML = logoLight;
  document.getElementById('dump').textContent = JSON.stringify(opts, null, 2);
  window.__lastSvg = icosa;
  window.__lastOpts = opts;
  window.__lastLayout = layout;
}

for (const el of Object.values(inputs)) el.addEventListener('input', render);
for (const el of Object.values(layoutInputs)) el.addEventListener('input', render);
darkTextColorEl.addEventListener('input', render);
lightTextColorEl.addEventListener('input', render);

// Fetch Manrope 800 from the @fontsource package on jsDelivr (a canonical,
// CORS-friendly mirror of the upstream Google Fonts woff2). The font is then
// base64-encoded into a data: URL so the downloaded SVG renders standalone
// without any network dependency. Cached so we only hit the CDN once per
// session.
const FONT_URL = "https://cdn.jsdelivr.net/npm/@fontsource/manrope/files/manrope-latin-800-normal.woff2";

let cachedFontFaceCss = null;
async function loadFontFaceCss() {
  if (cachedFontFaceCss !== null) return cachedFontFaceCss;
  try {
    const res = await fetch(FONT_URL);
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const bytes = new Uint8Array(await res.arrayBuffer());
    // Chunked binary-string build avoids call-stack overflow that
    // String.fromCharCode(...bytes) would hit on a large array.
    let binary = '';
    const chunk = 0x8000;
    for (let i = 0; i < bytes.length; i += chunk) {
      binary += String.fromCharCode.apply(null, bytes.subarray(i, i + chunk));
    }
    const b64 = btoa(binary);
    cachedFontFaceCss = `@font-face{font-family:"LyzorManrope";font-style:normal;font-weight:800;font-display:swap;src:url(data:font/woff2;base64,${b64}) format("woff2");}`;
  } catch (err) {
    console.warn(`Could not fetch Manrope from ${FONT_URL}:`, err);
    cachedFontFaceCss = '';
  }
  return cachedFontFaceCss;
}

async function exportedLogoSvg(variant) {
  const fontCss = await loadFontFaceCss();
  const isDark = variant === "dark";
  const color = isDark ? darkTextColorEl.value : lightTextColorEl.value;
  const prefix = isDark ? "logo-d" : "logo-l";
  const layout = readLayout();
  const raw = buildLogoSvg(readOpts(), layout, color, prefix, fontCss || undefined);
  return cropLogoSvg(raw, layout, +layoutInputs.margin.value);
}

document.getElementById('copy-svg').addEventListener('click', () => navigator.clipboard.writeText(window.__lastSvg));
document.getElementById('copy-vals').addEventListener('click', () => navigator.clipboard.writeText(JSON.stringify(window.__lastOpts, null, 2)));
document.getElementById('save-svg').addEventListener('click', () => {
  const blob = new Blob([window.__lastSvg], { type: 'image/svg+xml' });
  const a = document.createElement('a');
  a.href = URL.createObjectURL(blob); a.download = 'icosa.svg'; a.click();
  setTimeout(() => URL.revokeObjectURL(a.href), 1000);
});

async function downloadLogoSvg(variant) {
  const svg = await exportedLogoSvg(variant);
  const blob = new Blob([svg], { type: 'image/svg+xml' });
  const a = document.createElement('a');
  a.href = URL.createObjectURL(blob);
  a.download = `lyzortx-logo-${variant}.svg`;
  a.click();
  setTimeout(() => URL.revokeObjectURL(a.href), 1000);
}

document.getElementById('copy-logo-svg-dark').addEventListener('click', async () => {
  await navigator.clipboard.writeText(await exportedLogoSvg("dark"));
});
document.getElementById('save-logo-svg-dark').addEventListener('click', () => downloadLogoSvg("dark"));
document.getElementById('copy-logo-svg-light').addEventListener('click', async () => {
  await navigator.clipboard.writeText(await exportedLogoSvg("light"));
});
document.getElementById('save-logo-svg-light').addEventListener('click', () => downloadLogoSvg("light"));

document.getElementById('ref').src = 'icosa-reference.png';
render();
// First render uses whatever font is loaded at script-start; refresh once
// Manrope is ready so the text bbox measurement is accurate.
if (document.fonts && document.fonts.ready) document.fonts.ready.then(render);
