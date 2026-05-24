import { buildSvg, buildLogoSvg } from "./icosa.js";

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
  canvasW: document.getElementById('canvasW'), canvasH: document.getElementById('canvasH'),
  textX: document.getElementById('textX'), textY: document.getElementById('textY'), textSize: document.getElementById('textSize'),
};
const layoutLabels = {
  icoX: document.getElementById('icoX-v'), icoY: document.getElementById('icoY-v'), icoSize: document.getElementById('icoSize-v'),
  canvasW: document.getElementById('canvasW-v'), canvasH: document.getElementById('canvasH-v'),
  textX: document.getElementById('textX-v'), textY: document.getElementById('textY-v'), textSize: document.getElementById('textSize-v'),
};
const darkTextColorEl = document.getElementById('darkTextColor');
const lightTextColorEl = document.getElementById('lightTextColor');
const embedFontEl = document.getElementById('embedFont');

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
    canvasW: +layoutInputs.canvasW.value,
    canvasH: +layoutInputs.canvasH.value,
    textX: +layoutInputs.textX.value,
    textY: +layoutInputs.textY.value,
    textSize: +layoutInputs.textSize.value,
    icoX: +layoutInputs.icoX.value,
    icoY: +layoutInputs.icoY.value,
    icoSize: +layoutInputs.icoSize.value,
  };
}

// The light variant uses the same icosa as the dark variant but with ambient
// pinned to zero — the unlit faces darken to the palette floor, giving the
// figure enough contrast against a light background without needing a
// separate color or brightness control.
const LIGHT_VARIANT_AMBIENT = 0;

function render() {
  const opts = readOpts();
  const layout = readLayout();
  for (const k of Object.keys(labels)) labels[k].textContent = (+inputs[k].value).toFixed(2);
  for (const k of Object.keys(layoutLabels)) layoutLabels[k].textContent = String(+layoutInputs[k].value);
  const icosa = buildSvg(opts, "t");
  const logoDark = buildLogoSvg(opts, layout, darkTextColorEl.value, "logo-d");
  const logoLight = buildLogoSvg({ ...opts, ambient: LIGHT_VARIANT_AMBIENT }, layout, lightTextColorEl.value, "logo-l");
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

// Pull @font-face from logo/lyzortx-logo-white.svg so downloads can be
// self-contained. Cached so the SVG fetch only happens once per session.
let cachedFontFaceCss = null;
async function loadFontFaceCss() {
  if (cachedFontFaceCss !== null) return cachedFontFaceCss;
  try {
    const res = await fetch('../logo/lyzortx-logo-white.svg');
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const text = await res.text();
    const match = text.match(/<style>([\s\S]*?)<\/style>/);
    cachedFontFaceCss = match ? match[1].trim() : '';
  } catch (err) {
    console.warn('Could not load font from ../logo/lyzortx-logo-white.svg:', err);
    cachedFontFaceCss = '';
  }
  return cachedFontFaceCss;
}

async function exportedLogoSvg(variant) {
  const fontCss = embedFontEl.checked ? await loadFontFaceCss() : null;
  const isDark = variant === "dark";
  const color = isDark ? darkTextColorEl.value : lightTextColorEl.value;
  const prefix = isDark ? "logo-d" : "logo-l";
  const opts = isDark ? readOpts() : { ...readOpts(), ambient: LIGHT_VARIANT_AMBIENT };
  return buildLogoSvg(opts, readLayout(), color, prefix, fontCss || undefined);
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
