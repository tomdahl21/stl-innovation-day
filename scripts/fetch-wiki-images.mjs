// Fetches up to MAX_PER_PLACE photos per curated landmark from Wikipedia and
// bakes them into seed.json. Run with `node scripts/fetch-wiki-images.mjs`.
//
// Pipeline per article:
//   1. action=query&prop=images           → list every file embedded on the page
//   2. action=query&prop=imageinfo        → resolve URLs + license metadata in
//                                           a single batched call
//   3. Filter to CC/PD-licensed JPG/PNG photos, drop logos, location maps,
//      citation icons; take the first MAX_PER_PLACE.
//
// Allowlist-only because:
//   - Wikipedia opensearch fuzzy-matches catch false positives (Mai Lee → Mai Lee Chang).
//   - Wikipedia rate-limits anonymous bulk requests heavily (429s after a few calls).
//   - Most restaurants/dives/shops aren't on Wikipedia anyway.
// Misses fall through to the archetype gradient on the client side.

import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const SEED_PATH = path.resolve(__dirname, "../src/lib/data/seed.json");
const UA =
  "TroveDemoBuild/0.1 (https://github.com/anthropics; demo@trove.local) wikipedia-galleries";

const MAX_PER_PLACE = 6;
const THUMB_WIDTH = 1600; // CDN-resized; smaller than full originals (some are 20MB+).
const PACE_MS = 1500; // Wikipedia rate-limits anonymous requests aggressively.

// Place name (as in seed.json) → Wikipedia article title. Verified by hand.
const WIKI_TITLES = {
  "Bellefontaine Cemetery": "Bellefontaine Cemetery",
  "Frank Lloyd Wright's Ebsworth Park (Kraus House)": "Russell Kraus House",
  "Cathedral Basilica of Saint Louis": "Cathedral Basilica of Saint Louis",
  "City Museum": "City Museum (St. Louis, Missouri)",
  "Cahokia Mounds": "Cahokia Mounds",
  "Lemp Mansion": "Lemp Mansion",
  "Pulitzer Arts Foundation": "Pulitzer Arts Foundation",
  "Contemporary Art Museum St. Louis": "Contemporary Art Museum St. Louis",
  "Laumeier Sculpture Park": "Laumeier Sculpture Park",
  "Old Cathedral (Basilica of Saint Louis, King of France)":
    "Basilica of St. Louis, King of France",
  "Compton Hill Water Tower": "Compton Hill Reservoir Park",
  "International Bowling Museum & Hall of Fame":
    "International Bowling Museum and Hall of Fame",
  "World Chess Hall of Fame": "World Chess Hall of Fame",
  "Magic House": "The Magic House, St. Louis Children's Museum",
  "Campbell House Museum": "Campbell House Museum",
  "Eugene Field House": "Eugene Field House and St. Louis Toy Museum",
  "Saint Louis Art Museum": "Saint Louis Art Museum",
  "Missouri History Museum": "Missouri History Museum",
  "Mildred Lane Kemper Art Museum": "Mildred Lane Kemper Art Museum",
  "Soulard Farmers Market": "Soulard Farmers Market",
  "Climatron at Missouri Botanical Garden": "Climatron",
  "Jefferson Barracks Park": "Jefferson Barracks Military Post",
  "Castlewood State Park": "Castlewood State Park",
  "Shaw Nature Reserve": "Shaw Nature Reserve",
  "Missouri Botanical Garden": "Missouri Botanical Garden",
  "Tower Grove Park": "Tower Grove Park",
  "Powder Valley Conservation Nature Center":
    "Powder Valley Conservation Nature Center",
  "Forest Park (Kennedy Forest trails)": "Forest Park (St. Louis)",
  "Pere Marquette State Park": "Pere Marquette State Park",
  "Crown Candy Kitchen": "Crown Candy Kitchen",
  "Schlafly Tap Room": "Schlafly",
  "The Pageant": "The Pageant",
  "Blueberry Hill Duck Room": "Blueberry Hill (restaurant)",
  "The Sheldon Concert Hall": "The Sheldon",
  "Vintage Vinyl": "Vintage Vinyl (record store)",
  "Left Bank Books": "Left Bank Books",
};

// Filename patterns that are never the photo we want: logos, citation icons,
// location/locator maps, UI glyphs, coat-of-arms, navigation chrome.
const SKIP_NAME =
  /logo|coat[ _]of[ _]arms|seal[ _]of|location[ _]map|locator|red[ _]pog|^commons[ _-]|^question[ _]book|^wikimedia|^symbol[ _]|^edit[ _-]|^oojs|^map[ _]pin|wiki[ _-]project|^p[ _]vip\.svg|nuvola|^icon[ _]/i;

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

let lastCall = 0;
async function api(params) {
  const elapsed = Date.now() - lastCall;
  if (elapsed < PACE_MS) await sleep(PACE_MS - elapsed);
  lastCall = Date.now();

  const url = new URL("https://en.wikipedia.org/w/api.php");
  for (const [k, v] of Object.entries({ format: "json", ...params })) {
    url.searchParams.set(k, v);
  }
  const res = await fetch(url, { headers: { "User-Agent": UA } });
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  return res.json();
}

async function listArticleFiles(articleTitle) {
  const data = await api({
    action: "query",
    titles: articleTitle,
    prop: "images",
    imlimit: "50",
    redirects: "1",
  });
  const pages = data?.query?.pages ?? {};
  const page = Object.values(pages)[0];
  if (!page || page.missing !== undefined) return [];
  return (page.images ?? []).map((img) => img.title);
}

async function getImageInfo(fileTitles) {
  if (fileTitles.length === 0) return new Map();
  const data = await api({
    action: "query",
    titles: fileTitles.join("|"),
    prop: "imageinfo",
    iiprop: "url|size|mime|extmetadata",
    iiurlwidth: String(THUMB_WIDTH),
  });
  const out = new Map();
  const pages = data?.query?.pages ?? {};
  for (const page of Object.values(pages)) {
    const info = page.imageinfo?.[0];
    if (info) out.set(page.title, info);
  }
  return out;
}

// Permissive on license: anything with "cc" or "public domain" in the
// short-name passes. Fair-use images carry "Fair use" / "Non-free" and are
// excluded — those aren't legally redistributable outside Wikipedia itself.
function isUsablePhoto(info) {
  if (!info) return false;
  if (info.mime !== "image/jpeg" && info.mime !== "image/png") return false;
  if ((info.width ?? 0) < 400 || (info.height ?? 0) < 300) return false;
  const license = (
    info.extmetadata?.LicenseShortName?.value ?? ""
  ).toLowerCase();
  if (!/cc|public domain|pd-/.test(license)) return false;
  return true;
}

async function fetchGallery(articleTitle) {
  const allFiles = await listArticleFiles(articleTitle);
  const candidates = allFiles
    .filter((t) => !SKIP_NAME.test(t.replace(/^File:/, "")))
    .slice(0, 20); // cap the metadata call
  const info = await getImageInfo(candidates);

  const photos = [];
  for (const t of candidates) {
    const i = info.get(t);
    if (!isUsablePhoto(i)) continue;
    photos.push({
      url: i.thumburl ?? i.url,
      source: `Wikipedia: ${articleTitle}`,
    });
    if (photos.length >= MAX_PER_PLACE) break;
  }
  return photos;
}

const seed = JSON.parse(fs.readFileSync(SEED_PATH, "utf8"));
const seedNames = new Set(seed.map((p) => p.name));
for (const name of Object.keys(WIKI_TITLES)) {
  if (!seedNames.has(name)) console.warn(`! allowlist entry not in seed: "${name}"`);
}

// Clear photos only for entries we're going to refetch — leave any
// non-allowlist places untouched.
for (const place of seed) {
  if (WIKI_TITLES[place.name]) place.photos = [];
}

let totalPhotos = 0;
let hits = 0;
const targets = Object.keys(WIKI_TITLES).length;
let i = 0;
for (const place of seed) {
  i++;
  const title = WIKI_TITLES[place.name];
  if (!title) continue;
  try {
    const photos = await fetchGallery(title);
    place.photos = photos;
    if (photos.length > 0) hits++;
    totalPhotos += photos.length;
    console.log(
      `(${i}/${seed.length}) ${photos.length > 0 ? "✓" : "·"} ${place.name} → ${photos.length} photo${photos.length === 1 ? "" : "s"}`,
    );
  } catch (e) {
    console.log(`(${i}/${seed.length}) ✗ ${place.name} → ${e.message}`);
  }
}

fs.writeFileSync(SEED_PATH, JSON.stringify(seed, null, 2) + "\n");
console.log(
  `\nDone. ${totalPhotos} photos across ${hits}/${targets} curated landmarks.`,
);
