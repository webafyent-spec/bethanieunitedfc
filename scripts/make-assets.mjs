/**
 * Generates all placeholder image assets (purple/gold, exact dimensions
 * referenced in the HTML) so the build ships with zero 404s.
 * Real crest / photography can replace these files 1:1 later.
 *
 * Usage: node scripts/make-assets.mjs
 */
import sharp from 'sharp';
import { mkdirSync } from 'node:fs';
import { join } from 'node:path';

const PUB = 'public';
const IMG = join(PUB, 'img');
mkdirSync(IMG, { recursive: true });

const PURPLE = '#2a1454';
const DEEP = '#14092e';
const PURPLE_LT = '#3a1f6e';
const GOLD = '#d4a73b';
const GOLD_DK = '#c9a227';
const CREAM = '#f7f2e7';

/** Crocodile-scale pattern defs + fill rect */
function scales(w, h, opacity = 0.08) {
  return `
  <defs>
    <pattern id="sc" width="56" height="34" patternUnits="userSpaceOnUse">
      <path d="M28 0 42 17 28 34 14 17Z" fill="none" stroke="${GOLD}" stroke-opacity="${opacity}" stroke-width="1.5"/>
      <path d="M0 17 14 34 0 51Z M56 17 42 34 56 51Z" fill="none" stroke="${GOLD}" stroke-opacity="${opacity}" stroke-width="1.5"/>
    </pattern>
    <linearGradient id="bg" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0" stop-color="${PURPLE_LT}"/>
      <stop offset="0.55" stop-color="${PURPLE}"/>
      <stop offset="1" stop-color="${DEEP}"/>
    </linearGradient>
  </defs>
  <rect width="${w}" height="${h}" fill="url(#bg)"/>
  <rect width="${w}" height="${h}" fill="url(#sc)"/>`;
}

/** Simple crest shape (shield + ball + croc-eye chevrons) */
function crestShape(cx, cy, s) {
  return `
  <g transform="translate(${cx} ${cy}) scale(${s})">
    <path d="M0 -110 88 -78 88 20 C88 78 44 108 0 126 C-44 108 -88 78 -88 20 L-88 -78Z"
      fill="${PURPLE}" stroke="${GOLD}" stroke-width="10"/>
    <path d="M0 -92 70 -66 70 18 C70 66 36 92 0 108 C-36 92 -70 66 -70 18 L-70 -66Z"
      fill="none" stroke="${GOLD_DK}" stroke-width="3"/>
    <circle cx="0" cy="-10" r="34" fill="${CREAM}"/>
    <path d="M0 -44 10 -30 26 -32 22 -16 34 -6 18 0 16 16 0 8 -16 16 -18 0 -34 -6 -22 -16 -26 -32 -10 -30Z"
      fill="${PURPLE}" transform="translate(0 -10) scale(0.62)"/>
    <path d="M-46 52 -30 44 -14 52 -30 60Z M-10 52 6 44 22 52 6 60Z M26 52 42 44 58 52 42 60Z"
      fill="${GOLD}" transform="scale(0.9) translate(-2 8)"/>
    <path d="M-60 72 0 96 60 72 60 84 0 110 -60 84Z" fill="${GOLD}" transform="scale(0.62) translate(0 40)"/>
  </g>`;
}

const svg = (w, h, inner) =>
  Buffer.from(`<svg xmlns="http://www.w3.org/2000/svg" width="${w}" height="${h}" viewBox="0 0 ${w} ${h}">${inner}</svg>`);

/** Pitch markings (text-free) */
function pitch(w, h) {
  const m = 60;
  return `
  <g fill="none" stroke="${GOLD}" stroke-opacity="0.55" stroke-width="4">
    <rect x="${m}" y="${m}" width="${w - 2 * m}" height="${h - 2 * m}"/>
    <line x1="${w / 2}" y1="${m}" x2="${w / 2}" y2="${h - m}"/>
    <circle cx="${w / 2}" cy="${h / 2}" r="${h / 7}"/>
    <rect x="${m}" y="${h / 2 - h / 5}" width="${w / 9}" height="${(2 * h) / 5}"/>
    <rect x="${w - m - w / 9}" y="${h / 2 - h / 5}" width="${w / 9}" height="${(2 * h) / 5}"/>
  </g>
  <circle cx="${w / 2}" cy="${h / 2}" r="6" fill="${GOLD}"/>`;
}

function goldBand(w, h) {
  return `
  <path d="M0 ${h} L${w * 0.42} ${h} L${w * 0.58} ${h - 90} L0 ${h - 90}Z" fill="${GOLD}" fill-opacity="0.14"/>
  <path d="M0 ${h} L${w * 0.34} ${h} L${w * 0.5} ${h - 60} L0 ${h - 60}Z" fill="${GOLD}" fill-opacity="0.22"/>`;
}

const jobs = [
  // Hero 1600x900 (webp + avif)
  async () => {
    const b = svg(1600, 900, `${scales(1600, 900, 0.1)}${goldBand(1600, 900)}${crestShape(800, 400, 1.6)}`);
    await sharp(b).webp({ quality: 72 }).toFile(join(IMG, 'hero.webp'));
    await sharp(b).avif({ quality: 55 }).toFile(join(IMG, 'hero.avif'));
  },
  // Crest 512x512
  async () => {
    const b = svg(512, 512, `<rect width="512" height="512" fill="none"/>${crestShape(256, 250, 1.7)}`);
    await sharp(b).webp({ quality: 90 }).toFile(join(IMG, 'crest.webp'));
  },
  // Programme images 800x600
  ...['team', 'community', 'talent'].map((name, i) => async () => {
    const marks = [
      `<circle cx="400" cy="300" r="130" fill="none" stroke="${GOLD}" stroke-width="8" stroke-opacity="0.7"/><circle cx="400" cy="300" r="60" fill="${GOLD}" fill-opacity="0.5"/>`,
      `<path d="M400 160 520 380 280 380Z" fill="none" stroke="${GOLD}" stroke-width="8" stroke-opacity="0.7"/><circle cx="400" cy="322" r="46" fill="${GOLD}" fill-opacity="0.5"/>`,
      `<path d="M400 150 428 250 532 250 448 312 476 412 400 350 324 412 352 312 268 250 372 250Z" fill="${GOLD}" fill-opacity="0.6"/>`,
    ][i];
    const b = svg(800, 600, `${scales(800, 600, 0.09)}${goldBand(800, 600)}${marks}`);
    await sharp(b).webp({ quality: 74 }).toFile(join(IMG, `${name}.webp`));
  }),
  // Pitch 1200x675
  async () => {
    const b = svg(1200, 675, `${scales(1200, 675, 0.06)}${pitch(1200, 675)}`);
    await sharp(b).webp({ quality: 74 }).toFile(join(IMG, 'pitch.webp'));
  },
  // OG image 1200x630
  async () => {
    const b = svg(
      1200,
      630,
      `${scales(1200, 630, 0.09)}${goldBand(1200, 630)}${crestShape(210, 260, 1.05)}
      <rect x="380" y="212" width="120" height="8" fill="${GOLD}"/>
      <text x="380" y="300" font-family="Arial Black, Arial, sans-serif" font-weight="900" font-size="76" fill="${GOLD}">BETHANIE UNITED</text>
      <text x="380" y="386" font-family="Arial Black, Arial, sans-serif" font-weight="900" font-size="76" fill="${GOLD}">FC</text>
      <text x="380" y="452" font-family="Arial, sans-serif" font-size="30" fill="${CREAM}">Building Champions On and Off the Field</text>
      <text x="380" y="504" font-family="Arial, sans-serif" font-size="24" fill="${CREAM}" fill-opacity="0.8">Bethanie · Brits · North West Province</text>`
    );
    await sharp(b).flatten({ background: DEEP }).jpeg({ quality: 82 }).toFile(join(PUB, 'og-image.jpg'));
  },
  // Icons
  async () => {
    const icon = (size) =>
      svg(
        size,
        size,
        `<rect width="${size}" height="${size}" rx="${size * 0.18}" fill="${PURPLE}"/>${crestShape(size / 2, size / 2 - size * 0.02, size / 300)}`
      );
    await sharp(icon(180)).png().toFile(join(PUB, 'apple-touch-icon.png'));
    await sharp(icon(192)).png().toFile(join(PUB, 'icon-192.png'));
    await sharp(icon(512)).png().toFile(join(PUB, 'icon-512.png'));
  },
];

for (const job of jobs) await job();
console.log('All image assets generated.');
