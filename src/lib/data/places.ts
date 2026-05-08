"use client";

import { useMemo } from "react";
import { useAppStore } from "./store";
import { seedPlaces } from "./seed";
import type { Place } from "./types";

// All places visible in the app: the seeded ~100 + anything the user contributes.
export function useAllPlaces(): Place[] {
  const userPlaces = useAppStore((s) => s.userPlaces);
  return useMemo(() => [...seedPlaces, ...userPlaces], [userPlaces]);
}

export function usePlaceById(id: string | null | undefined): Place | undefined {
  const userPlaces = useAppStore((s) => s.userPlaces);
  if (!id) return undefined;
  return (
    seedPlaces.find((p) => p.id === id) ??
    userPlaces.find((p) => p.id === id)
  );
}
