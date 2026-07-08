/**
 * Post-build verification. Fails (exit 1) on any missed requirement:
 * sitemap present, JSON-LD parses with full @graph, ZA-NW present,
 * title/description length budgets, and zero 404s for every local asset
 * referenced from dist/index.html (and the web manifest).
 *
 * Usage: node scripts/verify-dist.mjs   (after `npm run build`)
 */
import { readFileSync, existsSync, statSync } from 'node:fs';
import { join } from 'node:path';

const DIST = 'dist';
let failures = 0;
const check = (ok, msg) => {
  console.log(`${ok ? 'PASS' : 'FAIL'}  ${msg}`);
  if (!ok) failures++;
};

const html = readFileSync(join(DIST, 'index.html'), 'utf8');

// 1. Sitemap
check(existsSync(join(DIST, 'sitemap-index.xml')), 'dist/sitemap-index.xml exists');

// 2. JSON-LD
const ldMatch = html.match(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/);
check(!!ldMatch, 'JSON-LD <script> present');
let graph = [];
if (ldMatch) {
  try {
    const data = JSON.parse(ldMatch[1]);
    graph = data['@graph'] ?? [];
    check(Array.isArray(graph) && graph.length > 0, 'JSON-LD parses with @graph');
  } catch (e) {
    check(false, `JSON-LD parses: ${e.message}`);
  }
}
const club = graph.find(
  (n) => Array.isArray(n['@type']) && n['@type'].includes('SportsOrganization')
);
check(!!club, 'club node (SportsOrganization + NonprofitOrganization)');
check(
  !!club && JSON.stringify(club).includes('2026/444177/08'),
  'club node carries CIPC reg no. 2026/444177/08'
);
check(
  graph.filter((n) => n['@type'] === 'SportsTeam').length === 6,
  'exactly six SportsTeam nodes'
);
check(graph.some((n) => n['@type'] === 'FAQPage'), 'FAQPage node present');
check(!JSON.stringify(graph).includes('SearchAction'), 'no SearchAction anywhere');
check(graph.some((n) => n['@type'] === 'WebSite'), 'WebSite node present');

// 3. Geo region
check(html.includes('ZA-NW'), 'geo.region ZA-NW present');
const geoPos = html.match(/name="geo\.position" content="([^"]+)"/)?.[1];
const icbm = html.match(/name="ICBM" content="([^"]+)"/)?.[1];
check(
  !!geoPos && !!icbm && geoPos.replace(';', ', ') === icbm,
  `geo.position (${geoPos}) matches ICBM (${icbm})`
);

// 4. Title / description budgets
const title = html.match(/<title>([^<]*)<\/title>/)?.[1] ?? '';
check(title.length > 0 && title.length <= 60, `title ${title.length} chars (≤60): "${title}"`);
const desc = html.match(/<meta name="description" content="([^"]*)"/)?.[1] ?? '';
check(desc.length > 0 && desc.length <= 160, `meta description ${desc.length} chars (≤160)`);

// 5. Zero 404s — every local URL referenced in index.html must exist in dist/
const urls = new Set();
for (const m of html.matchAll(/(?:src|href)="(\/[^"]*)"/g)) urls.add(m[1]);
for (const m of html.matchAll(/srcset="([^"]*)"/g)) {
  for (const part of m[1].split(',')) {
    const u = part.trim().split(/\s+/)[0];
    if (u.startsWith('/')) urls.add(u);
  }
}
for (const m of html.matchAll(/content="(\/[^"]*)"/g)) urls.add(m[1]);
// Absolute self-references (og-image etc.) — map back to local paths
for (const m of html.matchAll(/content="https:\/\/www\.bethanieunitedfc\.co\.za(\/[^"]+)"/g)) {
  urls.add(m[1]);
}
// Manifest icons
const manifest = JSON.parse(readFileSync(join(DIST, 'site.webmanifest'), 'utf8'));
for (const icon of manifest.icons ?? []) urls.add(icon.src);

for (const raw of urls) {
  const clean = raw.split(/[?#]/)[0];
  if (clean === '/') continue;
  const p = join(DIST, ...clean.split('/').filter(Boolean));
  const exists =
    existsSync(p) || (existsSync(`${p}`) === false && existsSync(join(p, 'index.html')));
  check(exists, `asset resolves: ${clean}`);
}

// 6. Total weight budget (<900KB for HTML + all local assets referenced)
let total = statSync(join(DIST, 'index.html')).size;
for (const raw of urls) {
  const clean = raw.split(/[?#]/)[0];
  if (clean === '/') continue;
  const p = join(DIST, ...clean.split('/').filter(Boolean));
  if (existsSync(p) && statSync(p).isFile()) total += statSync(p).size;
}
check(total < 900 * 1024, `total page weight ${(total / 1024).toFixed(0)}KB (<900KB)`);

console.log(failures === 0 ? '\nAll checks passed.' : `\n${failures} check(s) FAILED.`);
process.exit(failures === 0 ? 0 : 1);
