import seedJson from "./seed.json";
import { archetypeNames, archetypeSchemas, type ArchetypeName } from "@/archetypes";
import { personas } from "./personas";
import type { Place } from "./types";

// Slug from a name. Stable IDs across reloads.
function slugify(s: string): string {
  return s
    .toLowerCase()
    .replace(/['']/g, "")
    .replace(/&/g, "and")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

type RawSeed = {
  name: string;
  archetype: string;
  neighborhood: string;
  lat: number;
  lng: number;
  pitch: string;
  archetypeData: Record<string, unknown>;
  photoUrl?: string;
  photoSource?: string;
};

function isArchetypeName(s: string): s is ArchetypeName {
  return (archetypeNames as readonly string[]).includes(s);
}

function buildPlaces(): Place[] {
  const raw = seedJson as RawSeed[];
  const founders = personas.filter((p) => p.tier === "founding");
  const seenIds = new Set<string>();
  const out: Place[] = [];

  raw.forEach((r, idx) => {
    if (!isArchetypeName(r.archetype)) {
      console.warn(`seed: skipping unknown archetype "${r.archetype}" for ${r.name}`);
      return;
    }

    // Validate archetypeData against the registered Zod schema.
    const parsed = archetypeSchemas[r.archetype].safeParse(r.archetypeData);
    const archetypeData = parsed.success ? parsed.data : r.archetypeData;

    let id = slugify(r.name);
    if (seenIds.has(id)) id = `${id}-${idx}`;
    seenIds.add(id);

    out.push({
      id,
      name: r.name,
      archetype: r.archetype,
      neighborhood: r.neighborhood,
      lat: r.lat,
      lng: r.lng,
      pitch: r.pitch,
      contributorId: founders[idx % founders.length].id,
      archetypeData,
      saveCount: 1 + ((idx * 7) % 22),
      createdAt: "2026-03-01T00:00:00Z",
      photoUrl: r.photoUrl,
      photoSource: r.photoSource,
    });
  });

  return out;
}

export const seedPlaces: Place[] = buildPlaces();
