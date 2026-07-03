// Generates og-card.html — a 1200x630 SVG social card recreating the original
// "Statistik, die Klick macht." design, but with the subtitle in its own left
// column so it never intersects the bell curve.
import { writeFileSync } from 'node:fs';

const W = 1200, H = 630;

// palette (sampled from the original PNG)
const BG = '#FBF8F4';
const DARK = '#2B2724';
const RED = '#E14E36';       // bright — Klick, curve stroke, dot, bullet
const RED2 = '#C23F2A';      // deep — eyebrow, dashed mean line
const GRAY = '#5C544D';      // subtitle
const FILL_OUT = '#FBE0D9';  // area under curve
const FILL_BAND = '#FAC0B4'; // +-1 sigma band

// --- bell curve geometry -------------------------------------------------
// Broad bell like the original; its low tails sit under the (higher) heading,
// and the reflowed short subtitle column stays well clear of the rising slope.
const xM = 900, sigma = 74, yB = 470, A = 322; // peak y = yB - A = 148
const g = (x) => yB - A * Math.exp(-0.5 * ((x - xM) / sigma) ** 2);
const xL = xM - 3.7 * sigma, xR = xM + 3.7 * sigma; // tails

function curvePts(step = 2) {
  const pts = [];
  for (let x = xL; x <= xR; x += step) pts.push([x, g(x)]);
  pts.push([xR, g(xR)]);
  return pts;
}
const pts = curvePts();
const curveD = pts.map(([x, y], i) => `${i ? 'L' : 'M'}${x.toFixed(1)},${y.toFixed(1)}`).join(' ');
// filled area under whole curve
const areaD = `M${xL.toFixed(1)},${yB} ` +
  pts.map(([x, y]) => `L${x.toFixed(1)},${y.toFixed(1)}`).join(' ') +
  ` L${xR.toFixed(1)},${yB} Z`;
// +-1 sigma band
const b1 = xM - sigma, b2 = xM + sigma;
const bandPts = [];
for (let x = b1; x <= b2; x += 1) bandPts.push([x, g(x)]);
const bandD = `M${b1},${yB} ` +
  bandPts.map(([x, y]) => `L${x.toFixed(1)},${y.toFixed(1)}`).join(' ') +
  ` L${b2},${yB} Z`;

// ticks at mean +- k*sigma
const ticks = [-3, -2, -1, 0, 1, 2, 3].map((k) => xM + k * sigma);
const tickLines = ticks
  .map((x) => `<line x1="${x}" y1="${yB}" x2="${x}" y2="${yB + 13}" stroke="${DARK}" stroke-width="2" />`)
  .join('\n    ');

const yMean = g(xM);

const svg = `
<svg width="${W}" height="${H}" viewBox="0 0 ${W} ${H}" xmlns="http://www.w3.org/2000/svg">
  <rect width="${W}" height="${H}" fill="${BG}" />

  <!-- curve graphics -->
  <path d="${areaD}" fill="${FILL_OUT}" />
  <path d="${bandD}" fill="${FILL_BAND}" />
  <line x1="85" y1="${yB}" x2="${xR.toFixed(1)}" y2="${yB}" stroke="${DARK}" stroke-width="2" />
  ${tickLines}
  <line x1="${xM}" y1="${yB}" x2="${xM}" y2="${yMean.toFixed(1)}" stroke="${RED2}" stroke-width="2.5" stroke-dasharray="3 7" stroke-linecap="round" />
  <path d="${curveD}" fill="none" stroke="${RED}" stroke-width="5" stroke-linejoin="round" stroke-linecap="round" />
  <circle cx="${xM}" cy="${yMean.toFixed(1)}" r="9" fill="${RED}" />

  <!-- eyebrow -->
  <text x="85" y="112" font-family="Nunito" font-weight="800" font-size="25" letter-spacing="3.5" fill="${RED2}">DATA SCIENCE 2&#160;&#160;·&#160;&#160;UNIVERSITÄT HAMBURG</text>

  <!-- heading -->
  <text x="83" y="210" font-family="Fraunces" font-weight="600" font-size="94" fill="${DARK}">Statistik, die</text>
  <text x="83" y="306" font-family="Fraunces" font-weight="600" font-size="94"><tspan fill="${RED}">Klick</tspan><tspan fill="${DARK}"> macht.</tspan></text>

  <!-- subtitle (own column, clear of the curve) -->
  <text x="85" y="363" font-family="Nunito" font-weight="500" font-size="29" fill="${GRAY}">Intuition zuerst — 14 interaktive</text>
  <text x="85" y="401" font-family="Nunito" font-weight="500" font-size="29" fill="${GRAY}">Lektionen, Schritt für Schritt,</text>
  <text x="85" y="439" font-family="Nunito" font-weight="500" font-size="29" fill="${GRAY}">ohne Panik.</text>

  <!-- url -->
  <circle cx="97" cy="554" r="9" fill="${RED}" />
  <text x="118" y="565" font-family="Nunito" font-weight="800" font-size="31" fill="${DARK}">beyondsimulations.github.io/statistik-interaktiv</text>
</svg>`;

const html = `<!doctype html>
<html lang="de"><head><meta charset="utf-8" />
<style>
  @import url('https://fonts.googleapis.com/css2?family=Fraunces:opsz,wght@9..144,400..700&family=Nunito:wght@400..800&display=block');
  * { margin: 0; padding: 0; }
  html, body { width: ${W}px; height: ${H}px; overflow: hidden; background: ${BG}; }
  svg { display: block; }
</style></head>
<body>${svg}</body></html>`;

writeFileSync(process.argv[2] || 'og-card.html', html);
console.log('wrote', process.argv[2]);
