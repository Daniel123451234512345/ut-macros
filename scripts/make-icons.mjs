// Draws the app icons (original artwork, no UT marks). Run: node scripts/make-icons.mjs
import sharp from "sharp";
import { mkdirSync } from "node:fs";

// A rounded orange tile with a white fork and a rising "progress" bar chart.
const svg = (size, { maskable = false, rounded = true } = {}) => {
  const pad = maskable ? 0.18 : 0.1; // maskable icons need a bigger safe zone
  const s = 512;
  const r = rounded && !maskable ? 112 : 0;
  const inner = s * (1 - pad * 2);
  const o = s * pad;
  const u = inner / 100; // 1% of inner box
  return Buffer.from(`<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 ${s} ${s}">
  <defs><linearGradient id="g" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#cc5f0a"/><stop offset="1" stop-color="#bf5700"/></linearGradient></defs>
  <rect width="${s}" height="${s}" rx="${r}" fill="url(#g)"/>
  <g transform="translate(${o} ${o})" fill="#fff">
    <!-- fork -->
    <rect x="${12 * u}" y="${8 * u}" width="${5 * u}" height="${30 * u}" rx="${2.5 * u}"/>
    <rect x="${21 * u}" y="${8 * u}" width="${5 * u}" height="${30 * u}" rx="${2.5 * u}"/>
    <rect x="${30 * u}" y="${8 * u}" width="${5 * u}" height="${30 * u}" rx="${2.5 * u}"/>
    <path d="M${12 * u} ${34 * u} h${23 * u} v${4 * u} a${11.5 * u} ${11.5 * u} 0 0 1 -${7 * u} ${10.5 * u} v${43 * u} a${4.5 * u} ${4.5 * u} 0 0 1 -${9 * u} 0 v-${43 * u} a${11.5 * u} ${11.5 * u} 0 0 1 -${7 * u} -${10.5 * u}z"/>
    <!-- bars -->
    <rect x="${48 * u}" y="${62 * u}" width="${12 * u}" height="${30 * u}" rx="${3 * u}" opacity=".75"/>
    <rect x="${65 * u}" y="${42 * u}" width="${12 * u}" height="${50 * u}" rx="${3 * u}" opacity=".88"/>
    <rect x="${82 * u}" y="${18 * u}" width="${12 * u}" height="${74 * u}" rx="${3 * u}"/>
  </g>
</svg>`);
};

mkdirSync("public/icons", { recursive: true });
const out = [
  ["public/icons/icon-192.png", 192, {}],
  ["public/icons/icon-512.png", 512, {}],
  ["public/icons/maskable-512.png", 512, { maskable: true }],
  ["app/icon.png", 64, {}],
  ["app/apple-icon.png", 180, { rounded: false }], // iOS rounds the corners itself
];
for (const [file, size, opts] of out) {
  await sharp(svg(size, opts)).png().toFile(file);
  console.log("wrote", file);
}
