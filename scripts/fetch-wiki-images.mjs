// Fetches Wikipedia thumbnails for a curated allowlist of STL landmarks
// and bakes them into seed.json. Run with `node scripts/fetch-wiki-images.mjs`.
//
// Allowlist-only because:
//   1. Wikipedia opensearch fuzzy-matches catch false positives (Mai Lee → Mai Lee Chang).
//   2. Wikipedia rate-limits anonymous bulk requests heavily (429s after a few calls).
//   3. Most restaurants/dives/shops aren't on Wikipedia anyway.
// Misses fall through to the archetype gradient on the client side — no need to
// fudge a photo for places where one doesn't exist.

import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const SEED_PATH = path.resolve(__dirname, "../src/lib/data/seed.json");
const UA =
  "TroveDemoBuild/0.1 (https://github.com/anthropics; demo@trove.local) curl-equivalent";

// Place name (as in seed.json) → Wikipedia article title. Verified by hand.
// Entries with `null` are intentionally skipped.
const WIKI_TITLES = {
  "Bellefontaine Cemetery": "Bellefontaine Cemetery",
  "Frank Lloyd Wright's Ebsworth Park (Kraus House)": "Russell Kraus House",
  "Cathedral Basilica of Saint Louis": "Cathedral Basilica of Saint Louis",
  "City Museum": "City Museum (St. Louis, Missouri)",
  "Cahokia Mounds": "Cahokia Mounds",
  "Lemp Mansion": "Lemp Mansion",
  "Pulitzer Arts Foundation": "Pulitzer Arts Foundation",
  "Contemporary Art Museum St. Louis":
    "Contemporary Art Museum St. Louis",
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

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

async function getThumbnail(title) {
  const url = `https://en.wikipedia.org/api/rest_v1/page/summary/${encodeURIComponent(title)}`;
  const res = await fetch(url, { headers: { "User-Agent": UA } });
  if (!res.ok) {
    return { error: `${res.status}` };
  }
  const data = await res.json();
  if (data?.type === "disambiguation") return { error: "disambiguation" };
  const photoUrl = data?.originalimage?.source || data?.thumbnail?.source;
  return photoUrl ? { photoUrl } : { error: "no-image" };
}

const seed = JSON.parse(fs.readFileSync(SEED_PATH, "utf8"));

// Clear any prior photo data so this run is the source of truth.
for (const place of seed) {
  delete place.photoUrl;
  delete place.photoSource;
}

let hits = 0;
const targets = Object.keys(WIKI_TITLES).length;
const seedNames = new Set(seed.map((p) => p.name));

// Sanity: warn on any allowlist entries that don't exist in seed.
for (const name of Object.keys(WIKI_TITLES)) {
  if (!seedNames.has(name)) {
    console.warn(`! allowlist entry not in seed: "${name}"`);
  }
}

let i = 0;
for (const place of seed) {
  i++;
  const title = WIKI_TITLES[place.name];
  if (!title) continue;

  const result = await getThumbnail(title);
  if (result.photoUrl) {
    place.photoUrl = result.photoUrl;
    place.photoSource = `Wikipedia: ${title}`;
    hits++;
    console.log(`(${i}/${seed.length}) ✓ ${place.name} → ${title}`);
  } else {
    console.log(`(${i}/${seed.length}) ✗ ${place.name} → ${title} [${result.error}]`);
  }
  // Slow pace — Wikipedia rate-limits anonymous requests aggressively.
  await sleep(1500);
}

fs.writeFileSync(SEED_PATH, JSON.stringify(seed, null, 2) + "\n");
console.log(`\nDone. ${hits}/${targets} curated landmarks fetched. ${seed.length - hits} fall back to archetype gradient.`);
