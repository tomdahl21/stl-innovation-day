import { z } from "zod";

// Adding a new archetype:
// 1. add the name to `archetypeNames`
// 2. add a Zod schema below
// 3. add an entry to `archetypes` with label + detailRows
// Nothing else in the codebase needs to change.

export const archetypeNames = [
  "eatery",
  "drink",
  "venue",
  "curio",
  "outdoors",
  "shop",
] as const;

export type ArchetypeName = (typeof archetypeNames)[number];

const priceTier = z.enum(["$", "$$", "$$$", "$$$$"]);

const eaterySchema = z
  .object({
    cuisine: z.string().optional(),
    signatureDish: z.string().optional(),
    priceTier: priceTier.optional(),
    reservationNeeded: z.boolean().optional(),
  })
  .passthrough();

const drinkSchema = z
  .object({
    specialty: z.string().optional(),
    vibe: z.string().optional(),
    timeOfDay: z
      .enum(["morning", "afternoon", "evening", "late-night"])
      .optional(),
  })
  .passthrough();

const venueSchema = z
  .object({
    format: z.string().optional(),
    capacityFeel: z.enum(["intimate", "mid", "big"]).optional(),
    seatedOrStanding: z.enum(["seated", "standing", "mixed"]).optional(),
  })
  .passthrough();

const curioSchema = z
  .object({
    storyHook: z.string().optional(),
    timeNeeded: z.string().optional(),
    tickets: z.string().optional(),
  })
  .passthrough();

const outdoorsSchema = z
  .object({
    activity: z.string().optional(),
    distanceOrTrail: z.string().optional(),
    season: z.string().optional(),
    accessibility: z.string().optional(),
  })
  .passthrough();

const shopSchema = z
  .object({
    specialty: z.string().optional(),
    vibe: z.string().optional(),
    priceTier: priceTier.optional(),
  })
  .passthrough();

export const archetypeSchemas = {
  eatery: eaterySchema,
  drink: drinkSchema,
  venue: venueSchema,
  curio: curioSchema,
  outdoors: outdoorsSchema,
  shop: shopSchema,
} as const;

type DetailRow = { label: string; value: string | undefined };

export type ArchetypeField =
  | { name: string; label: string; type: "text"; placeholder?: string }
  | { name: string; label: string; type: "select"; options: readonly string[] }
  | { name: string; label: string; type: "boolean"; trueLabel?: string; falseLabel?: string };

export type ArchetypeMeta = {
  name: ArchetypeName;
  label: string;
  // Order in filter chip row + general UI
  order: number;
  // One-line tagline for the archetype picker.
  tagline: string;
  // Form fields rendered when contributing this archetype.
  fields: readonly ArchetypeField[];
  // Build the structured detail rows shown on the place card.
  detailRows: (data: Record<string, unknown>) => DetailRow[];
};

const fmt = (v: unknown): string | undefined =>
  v === null || v === undefined || v === "" ? undefined : String(v);

const PRICE_OPTIONS = ["$", "$$", "$$$", "$$$$"] as const;
const TIME_OPTIONS = ["morning", "afternoon", "evening", "late-night"] as const;
const CAPACITY_OPTIONS = ["intimate", "mid", "big"] as const;
const SEATING_OPTIONS = ["seated", "standing", "mixed"] as const;

export const archetypes: Record<ArchetypeName, ArchetypeMeta> = {
  eatery: {
    name: "eatery",
    label: "Eatery",
    order: 1,
    tagline: "Restaurants, lunch counters, food halls.",
    fields: [
      { name: "cuisine", label: "Cuisine", type: "text", placeholder: "Italian, Bosnian, BBQ…" },
      { name: "signatureDish", label: "Signature dish", type: "text", placeholder: "What to order" },
      { name: "priceTier", label: "Price", type: "select", options: PRICE_OPTIONS },
      { name: "reservationNeeded", label: "Reservation", type: "boolean", trueLabel: "Recommended", falseLabel: "Walk-in OK" },
    ],
    detailRows: (d) => [
      { label: "Cuisine", value: fmt(d.cuisine) },
      { label: "Signature dish", value: fmt(d.signatureDish) },
      { label: "Price", value: fmt(d.priceTier) },
      {
        label: "Reservation",
        value:
          d.reservationNeeded === true
            ? "Recommended"
            : d.reservationNeeded === false
              ? "Walk-in OK"
              : undefined,
      },
    ],
  },
  drink: {
    name: "drink",
    label: "Drink",
    order: 2,
    tagline: "Cocktail bars, dives, breweries, coffee.",
    fields: [
      { name: "specialty", label: "Specialty", type: "text", placeholder: "Natural wine, tiki, whiskey…" },
      { name: "vibe", label: "Vibe", type: "text", placeholder: "Neighborhood, date night, rowdy…" },
      { name: "timeOfDay", label: "Best at", type: "select", options: TIME_OPTIONS },
    ],
    detailRows: (d) => [
      { label: "Specialty", value: fmt(d.specialty) },
      { label: "Vibe", value: fmt(d.vibe) },
      { label: "Best at", value: fmt(d.timeOfDay) },
    ],
  },
  venue: {
    name: "venue",
    label: "Venue",
    order: 3,
    tagline: "Music, comedy, anywhere with a stage.",
    fields: [
      { name: "format", label: "Format", type: "text", placeholder: "Live music, comedy, DIY…" },
      { name: "capacityFeel", label: "Size", type: "select", options: CAPACITY_OPTIONS },
      { name: "seatedOrStanding", label: "Seating", type: "select", options: SEATING_OPTIONS },
    ],
    detailRows: (d) => [
      { label: "Format", value: fmt(d.format) },
      { label: "Size", value: fmt(d.capacityFeel) },
      { label: "Seating", value: fmt(d.seatedOrStanding) },
    ],
  },
  curio: {
    name: "curio",
    label: "Curio",
    order: 4,
    tagline: "Museums, oddities, the weird-and-wonderful.",
    fields: [
      { name: "storyHook", label: "Story hook", type: "text", placeholder: "One sentence on why it's special" },
      { name: "timeNeeded", label: "Time needed", type: "text", placeholder: "30 min, 1 hr, half-day…" },
      { name: "tickets", label: "Admission", type: "text", placeholder: "Free, $15, donation…" },
    ],
    detailRows: (d) => [
      { label: "Time needed", value: fmt(d.timeNeeded) },
      { label: "Admission", value: fmt(d.tickets) },
    ],
  },
  outdoors: {
    name: "outdoors",
    label: "Outdoors",
    order: 5,
    tagline: "Parks, trails, river spots, gardens.",
    fields: [
      { name: "activity", label: "Activity", type: "text", placeholder: "Hiking, birding, river view…" },
      { name: "distanceOrTrail", label: "Distance / trail", type: "text", placeholder: "2.5 mi loop, 14 mi, etc." },
      { name: "season", label: "Best season", type: "text", placeholder: "Year-round, fall, etc." },
      { name: "accessibility", label: "Access", type: "text", placeholder: "Stroller-friendly, rugged…" },
    ],
    detailRows: (d) => [
      { label: "Activity", value: fmt(d.activity) },
      { label: "Distance", value: fmt(d.distanceOrTrail) },
      { label: "Season", value: fmt(d.season) },
      { label: "Access", value: fmt(d.accessibility) },
    ],
  },
  shop: {
    name: "shop",
    label: "Shop",
    order: 6,
    tagline: "Records, vintage, indie books, makers.",
    fields: [
      { name: "specialty", label: "Specialty", type: "text", placeholder: "Vintage records, rare books…" },
      { name: "vibe", label: "Vibe", type: "text", placeholder: "Treasure hunt, curated, etc." },
      { name: "priceTier", label: "Price", type: "select", options: PRICE_OPTIONS },
    ],
    detailRows: (d) => [
      { label: "Specialty", value: fmt(d.specialty) },
      { label: "Vibe", value: fmt(d.vibe) },
      { label: "Price", value: fmt(d.priceTier) },
    ],
  },
};

export const archetypeOrder: ArchetypeName[] = archetypeNames
  .slice()
  .sort((a, b) => archetypes[a].order - archetypes[b].order);
