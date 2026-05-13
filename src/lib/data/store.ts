"use client";

import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import type { ArchetypeName } from "@/archetypes";
import { defaultPersonaId } from "./personas";
import type { LogbookEntry, LogbookState, Place, SharedList, SharedListPayload } from "./types";

export type OverlayKind = "place" | "logbook" | "profile" | "add" | "lists" | "list-detail" | "list-import" | null;

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

export type GeoStatus = "idle" | "pending" | "active" | "denied";

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
  // ---- geolocation ----
  userLat: number | null;
  userLng: number | null;
  geoStatus: GeoStatus;
  nearbyMode: boolean;
  nearbyRadius: number; // miles

  // ---- persisted ----
  logbook: Record<string, LogbookEntry>;
  userPlaces: Place[];
  theme: "light" | "dark";
  lists: SharedList[];
  activeListId: string | null;
  pendingImport: SharedListPayload | null;
  displayName: string;
};

type StoreActions = {
  toggleTheme: () => void;
  setPersona: (id: string) => void;
  toggleArchetype: (name: ArchetypeName) => void;
  setArchetypeFilter: (names: ArchetypeName[] | null) => void;
  toggleAttributeFilter: (tag: string) => void;
  clearAttributeFilter: () => void;
  selectPlace: (id: string | null) => void;
  setOverlay: (overlay: OverlayKind) => void;
  setLogbookState: (placeId: string, state: LogbookState | null) => void;
  setLogbookNote: (placeId: string, note: string) => void;
  // ---- lists ----
  createList: (name: string, emoji?: string) => string;
  deleteList: (listId: string) => void;
  renameList: (listId: string, name: string) => void;
  addPlaceToList: (listId: string, placeId: string) => void;
  removePlaceFromList: (listId: string, placeId: string) => void;
  reorderListPlaces: (listId: string, placeIds: string[]) => void;
  setActiveList: (listId: string | null) => void;
  setPendingImport: (payload: SharedListPayload | null) => void;
  importList: (payload: SharedListPayload) => string;
  mergeIntoList: (listId: string, payload: SharedListPayload) => void;
  setDisplayName: (name: string) => void;
  // ---- geolocation ----
  setUserLocation: (lat: number, lng: number) => void;
  setGeoStatus: (status: GeoStatus) => void;
  toggleNearbyMode: () => void;
  setNearbyRadius: (radius: number) => void;
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
      userLat: null,
      userLng: null,
      geoStatus: "idle",
      nearbyMode: false,
      nearbyRadius: 1,
      logbook: {},
      userPlaces: [],
      theme: "light",

      toggleTheme: () =>
        set((s) => ({ theme: s.theme === "light" ? "dark" : "light" })),
      lists: [],
      activeListId: null,
      pendingImport: null,
      displayName: "",

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

      // ---- lists ----
      createList: (name, emoji) => {
        const id = `list-${Date.now().toString(36)}`;
        const list: SharedList = {
          id,
          name: name.trim(),
          emoji: emoji ?? "📍",
          placeIds: [],
          createdAt: now(),
          updatedAt: now(),
        };
        set((s) => ({ lists: [...s.lists, list] }));
        return id;
      },

      deleteList: (listId) =>
        set((s) => ({ lists: s.lists.filter((l) => l.id !== listId) })),

      renameList: (listId, name) =>
        set((s) => ({
          lists: s.lists.map((l) =>
            l.id === listId ? { ...l, name: name.trim(), updatedAt: now() } : l,
          ),
        })),

      addPlaceToList: (listId, placeId) =>
        set((s) => ({
          lists: s.lists.map((l) =>
            l.id === listId && !l.placeIds.includes(placeId)
              ? { ...l, placeIds: [...l.placeIds, placeId], updatedAt: now() }
              : l,
          ),
        })),

      removePlaceFromList: (listId, placeId) =>
        set((s) => ({
          lists: s.lists.map((l) =>
            l.id === listId
              ? { ...l, placeIds: l.placeIds.filter((id) => id !== placeId), updatedAt: now() }
              : l,
          ),
        })),

      reorderListPlaces: (listId, placeIds) =>
        set((s) => ({
          lists: s.lists.map((l) =>
            l.id === listId ? { ...l, placeIds, updatedAt: now() } : l,
          ),
        })),

      setActiveList: (listId) => set({ activeListId: listId }),

      setPendingImport: (payload) => set({ pendingImport: payload }),

      importList: (payload) => {
        const id = `list-${Date.now().toString(36)}`;
        const list: SharedList = {
          id,
          name: payload.n,
          description: payload.d,
          emoji: payload.e ?? "📍",
          placeIds: payload.p,
          createdAt: now(),
          updatedAt: now(),
          source: {
            sharedBy: payload.by,
            importedAt: now(),
          },
        };
        set((s) => ({ lists: [...s.lists, list], pendingImport: null }));
        return id;
      },

      mergeIntoList: (listId, payload) =>
        set((s) => ({
          lists: s.lists.map((l) => {
            if (l.id !== listId) return l;
            const existing = new Set(l.placeIds);
            const additions = payload.p.filter((id) => !existing.has(id));
            return {
              ...l,
              placeIds: [...l.placeIds, ...additions],
              updatedAt: now(),
            };
          }),
          pendingImport: null,
        })),

      setDisplayName: (name) => set({ displayName: name.trim() }),

      // ---- geolocation ----
      setUserLocation: (lat, lng) => set({ userLat: lat, userLng: lng, geoStatus: "active" }),
      setGeoStatus: (status) => set({ geoStatus: status }),
      toggleNearbyMode: () => set((s) => ({ nearbyMode: !s.nearbyMode })),
      setNearbyRadius: (radius) => set({ nearbyRadius: radius }),

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
          photos: [],
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
        theme: state.theme,
        lists: state.lists,
        displayName: state.displayName,
      }),
    },
  ),
);
