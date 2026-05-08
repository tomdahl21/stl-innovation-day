import type { Contributor } from "./types";

export const personas: Contributor[] = [
  {
    id: "marie-k",
    displayName: "Marie K.",
    initials: "MK",
    tier: "founding",
    bio: "Architecture obsessive, eats lunch on The Hill once a week, knows every Wright building within 200 miles.",
    joinedAt: "2026-02-15",
  },
  {
    id: "oliver-v",
    displayName: "Oliver V.",
    initials: "OV",
    tier: "founding",
    bio: "Cherokee Street regular, bartender for ten years, can tell you which patio gets afternoon shade.",
    joinedAt: "2026-02-15",
  },
  {
    id: "daria-n",
    displayName: "Daria N.",
    initials: "DN",
    tier: "founding",
    bio: "Hikes Castlewood every Sunday, birds with binoculars, lifelong Webster Groves.",
    joinedAt: "2026-02-15",
  },
  {
    id: "sam-t",
    displayName: "Sam T.",
    initials: "ST",
    tier: "founding",
    bio: "Lives on Tower Grove, opinions about provel, spends Saturdays at Off Broadway.",
    joinedAt: "2026-02-15",
  },
];

export const defaultPersonaId = "marie-k";

export function getPersona(id: string): Contributor | undefined {
  return personas.find((p) => p.id === id);
}
