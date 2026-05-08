import type { CSSProperties } from "react";
import type { ArchetypeName } from "@/archetypes";
import type { Place } from "./data/types";

// Distinct fallback palettes when a place has no photoUrl.
// Each archetype gets its own hue family — no duplicates across the six.
const ARCHETYPE_GRADIENT_THUMB: Record<ArchetypeName, string> = {
  eatery: "linear-gradient(135deg, #c47956 0%, #8A3920 100%)", // sienna → brick-deep
  drink: "linear-gradient(135deg, #8c7ba6 0%, #4a3a62 100%)", // dusk purple
  venue: "linear-gradient(135deg, #d4be8a 0%, #8a7042 100%)", // amber/bronze
  curio: "linear-gradient(135deg, #b8916a 0%, #5a3a22 100%)", // sepia/rust
  outdoors: "linear-gradient(135deg, #6a8a72 0%, #34503C 100%)", // moss/forest
  shop: "linear-gradient(135deg, #6f8a96 0%, #2d4856 100%)", // slate/teal
};

const ARCHETYPE_GRADIENT_HERO: Record<ArchetypeName, string> = {
  eatery: "radial-gradient(circle at 30% 40%, #c47956 0%, #8A3920 70%)",
  drink: "radial-gradient(circle at 30% 40%, #8c7ba6 0%, #4a3a62 70%)",
  venue: "radial-gradient(circle at 30% 40%, #d4be8a 0%, #8a7042 70%)",
  curio: "radial-gradient(circle at 30% 40%, #b8916a 0%, #5a3a22 70%)",
  outdoors: "radial-gradient(circle at 30% 40%, #6a8a72 0%, #34503C 70%)",
  shop: "radial-gradient(circle at 30% 40%, #6f8a96 0%, #2d4856 70%)",
};

export function thumbStyle(place: Place): CSSProperties {
  if (place.photoUrl) {
    return {
      backgroundImage: `url("${place.photoUrl}")`,
      backgroundSize: "cover",
      backgroundPosition: "center",
    };
  }
  return { background: ARCHETYPE_GRADIENT_THUMB[place.archetype] };
}

export function heroStyle(place: Place): CSSProperties {
  const overlay = "linear-gradient(180deg, transparent 50%, rgba(26,22,18,0.55) 100%)";
  if (place.photoUrl) {
    return {
      backgroundImage: `${overlay}, url("${place.photoUrl}")`,
      backgroundSize: "cover",
      backgroundPosition: "center",
    };
  }
  return {
    backgroundImage: `${overlay}, ${ARCHETYPE_GRADIENT_HERO[place.archetype]}`,
  };
}
