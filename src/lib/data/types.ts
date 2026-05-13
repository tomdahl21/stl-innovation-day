import type { ArchetypeName } from "@/archetypes";

export type ContributorTier = "founding" | "verified" | "community";

export type Contributor = {
  id: string;
  displayName: string;
  initials: string;
  tier: ContributorTier;
  bio?: string;
  joinedAt: string;
};

export type Place = {
  id: string;
  name: string;
  archetype: ArchetypeName;
  neighborhood: string;
  lat: number;
  lng: number;
  pitch: string;
  contributorId: string;
  archetypeData: Record<string, unknown>;
  saveCount: number;
  createdAt: string;
  tags?: string[];
  photoUrl?: string;
  photoSource?: string;
};

export type LogbookState = "been" | "want" | "saved";

export type LogbookEntry = {
  placeId: string;
  state: LogbookState;
  note?: string;
  visitedAt?: string;
  updatedAt: string;
};

export type SharedList = {
  id: string;
  name: string;
  description?: string;
  emoji: string;
  placeIds: string[];
  createdAt: string;
  updatedAt: string;
  source?: {
    sharedBy?: string;
    importedAt: string;
  };
};

export type SharedListPayload = {
  v: 1;
  n: string;
  d?: string;
  e?: string;
  p: string[];
  by?: string;
};
