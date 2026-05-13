"use client";

import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import type { ArchetypeName } from "@/archetypes";
import { defaultPersonaId } from "./personas";
import type { LogbookEntry, LogbookState, Place } from "./types";

export type OverlayKind = "place" | "logbook" | "profile" | "add" | null;

export type AddDraft = {
  archetype: ArchetypeName | null;
  lat: number | null;
  lng: number | null;
  name: string;
  neighborhood: string;
  pitch: string;
  archetypeData: Record<string, unknown>;
};

const emptyDraft: AddDraft = {
  archetype: null,
  lat: null,
  lng: null,
  name: "",
  neighborhood: "",
  pitch: "",
  archetypeData: {},
};

type StoreState = {
  // ---- session-only ----
  activePersonaId: string;
  // null = "all"; otherwise the set of selected archetypes
  archetypeFilter: ArchetypeName[] | null;
  // empty = no attribute filter; otherwise AND-match all selected tags
  attributeFilter: string[];
  selectedPlaceId: string | null;
  overlay: OverlayKind;
  draft: AddDraft;

  // ---- persisted ----
  logbook: Record<string, LogbookEntry>;
  userPlaces: Place[];
};

type StoreActions = {
  setPersona: (id: string) => void;
  toggleArchetype: (name: ArchetypeName) => void;
  setArchetypeFilter: (names: ArchetypeName[] | null) => void;
  toggleAttributeFilter: (tag: string) => void;
  clearAttributeFilter: () => void;
  selectPlace: (id: string | null) => void;
  setOverlay: (overlay: OverlayKind) => void;
  setLogbookState: (placeId: string, state: LogbookState | null) => void;
  setLogbookNote: (placeId: string, note: string) => void;
  // ---- contribution flow ----
  resetDraft: () => void;
  setDraftArchetype: (archetype: ArchetypeName) => void;
  setDraftLatLng: (lat: number, lng: number) => void;
  patchDraft: (patch: Partial<AddDraft>) => void;
  setDraftField: (field: string, value: unknown) => void;
  commitDraft: () => Place | null;
};

const now = () => new Date().toISOString();

export const useAppStore = create<StoreState & StoreActions>()(
  persist(
    (set, get) => ({
      activePersonaId: defaultPersonaId,
      archetypeFilter: null,
      attributeFilter: [],
      selectedPlaceId: null,
      overlay: null,
      draft: emptyDraft,
      logbook: {},
      userPlaces: [],

      setPersona: (id) => set({ activePersonaId: id }),

      toggleArchetype: (name) => {
        const current = get().archetypeFilter;
        if (current === null) {
          set({ archetypeFilter: [name] });
          return;
        }
        if (current.includes(name)) {
          const next = current.filter((n) => n !== name);
          set({ archetypeFilter: next.length === 0 ? null : next });
        } else {
          set({ archetypeFilter: [...current, name] });
        }
      },

      setArchetypeFilter: (names) => set({ archetypeFilter: names }),

      toggleAttributeFilter: (tag) => {
        const current = get().attributeFilter;
        if (current.includes(tag)) {
          set({ attributeFilter: current.filter((t) => t !== tag) });
        } else {
          set({ attributeFilter: [...current, tag] });
        }
      },

      clearAttributeFilter: () => set({ attributeFilter: [] }),

      selectPlace: (id) => set({ selectedPlaceId: id }),

      setOverlay: (overlay) => set({ overlay }),

      setLogbookState: (placeId, state) => {
        const current = get().logbook;
        if (state === null) {
          const next = { ...current };
          delete next[placeId];
          set({ logbook: next });
          return;
        }
        const existing = current[placeId];
        set({
          logbook: {
            ...current,
            [placeId]: {
              placeId,
              state,
              note: existing?.note,
              visitedAt: state === "been" ? (existing?.visitedAt ?? now()) : existing?.visitedAt,
              updatedAt: now(),
            },
          },
        });
      },

      setLogbookNote: (placeId, note) => {
        const current = get().logbook;
        const existing = current[placeId];
        if (!existing) return;
        set({
          logbook: {
            ...current,
            [placeId]: { ...existing, note, updatedAt: now() },
          },
        });
      },

      resetDraft: () => set({ draft: emptyDraft }),

      setDraftArchetype: (archetype) =>
        set((s) => ({
          draft: { ...s.draft, archetype, archetypeData: {} },
        })),

      setDraftLatLng: (lat, lng) =>
        set((s) => ({ draft: { ...s.draft, lat, lng } })),

      patchDraft: (patch) => set((s) => ({ draft: { ...s.draft, ...patch } })),

      setDraftField: (field, value) =>
        set((s) => ({
          draft: {
            ...s.draft,
            archetypeData: { ...s.draft.archetypeData, [field]: value },
          },
        })),

      commitDraft: () => {
        const { draft, activePersonaId } = get();
        if (
          !draft.archetype ||
          draft.lat === null ||
          draft.lng === null ||
          !draft.name.trim() ||
          !draft.pitch.trim()
        ) {
          return null;
        }
        const place: Place = {
          id: `user-${Date.now().toString(36)}`,
          name: draft.name.trim(),
          archetype: draft.archetype,
          neighborhood: draft.neighborhood.trim() || "St. Louis",
          lat: draft.lat,
          lng: draft.lng,
          pitch: draft.pitch.trim(),
          contributorId: activePersonaId,
          archetypeData: draft.archetypeData,
          saveCount: 0,
          createdAt: now(),
        };
        set((s) => ({
          userPlaces: [...s.userPlaces, place],
          draft: emptyDraft,
        }));
        return place;
      },
    }),
    {
      name: "trove-store-v1",
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        logbook: state.logbook,
        userPlaces: state.userPlaces,
      }),
    },
  ),
);
