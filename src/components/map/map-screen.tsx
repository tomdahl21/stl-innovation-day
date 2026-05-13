"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import "leaflet/dist/leaflet.css";
import type {
  Map as LeafletMap,
  Marker as LeafletMarker,
  CircleMarker as LeafletCircleMarker,
  DivIcon,
  LeafletMouseEvent,
} from "leaflet";
import { BRAND } from "@/lib/brand";
import { useAppStore } from "@/lib/data/store";
import { useAllPlaces } from "@/lib/data/places";
import { useGeolocation } from "@/lib/hooks/use-geolocation";
import { distanceMi } from "@/lib/geo";

type LeafletNS = typeof import("leaflet");

function buildIcon(L: LeafletNS, featured: boolean): DivIcon {
  const size = featured ? 16 : 12;
  const fill = featured ? "#B14F2B" : "#1A1612";
  return L.divIcon({
    className: "trove-pin",
    html: `<span style="display:block;width:${size}px;height:${size}px;background:${fill};border:2px solid #FCFAF5;border-radius:50%;box-shadow:0 1px 3px rgba(26,22,18,0.45);"></span>`,
    iconSize: [size, size],
    iconAnchor: [size / 2, size / 2],
  });
}

function buildDraftIcon(L: LeafletNS): DivIcon {
  return L.divIcon({
    className: "trove-pin",
    html: `<span style="display:block;width:22px;height:22px;background:#B14F2B;border:3px solid #FCFAF5;border-radius:50%;box-shadow:0 2px 8px rgba(26,22,18,0.45);animation:trove-pulse 1.6s ease-in-out infinite;"></span>`,
    iconSize: [22, 22],
    iconAnchor: [11, 11],
  });
}

export function MapScreen() {
  const containerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<LeafletMap | null>(null);
  const leafletRef = useRef<LeafletNS | null>(null);
  const markersRef = useRef<Map<string, LeafletMarker>>(new Map());
  const draftMarkerRef = useRef<LeafletMarker | null>(null);
  const userMarkerRef = useRef<LeafletCircleMarker | null>(null);
  const [mapReady, setMapReady] = useState(false);

  useGeolocation();

  const allPlaces = useAllPlaces();
  const archetypeFilter = useAppStore((s) => s.archetypeFilter);
  const attributeFilter = useAppStore((s) => s.attributeFilter);
  const overlay = useAppStore((s) => s.overlay);
  const draftArchetype = useAppStore((s) => s.draft.archetype);
  const draftLat = useAppStore((s) => s.draft.lat);
  const draftLng = useAppStore((s) => s.draft.lng);
  const userLat = useAppStore((s) => s.userLat);
  const userLng = useAppStore((s) => s.userLng);
  const geoStatus = useAppStore((s) => s.geoStatus);
  const nearbyMode = useAppStore((s) => s.nearbyMode);
  const nearbyRadius = useAppStore((s) => s.nearbyRadius);

  const featuredIds = useMemo(() => {
    const sorted = [...allPlaces].sort((a, b) => b.saveCount - a.saveCount);
    const cutoff = sorted[Math.floor(allPlaces.length * 0.12)]?.saveCount ?? 0;
    const set = new Set<string>();
    for (const p of allPlaces) if (p.saveCount >= cutoff) set.add(p.id);
    return set;
  }, [allPlaces]);

  const isDropMode =
    overlay === "add" && draftArchetype !== null && draftLat === null;

  // Initialize map once.
  useEffect(() => {
    if (!containerRef.current || mapRef.current) return;
    let cancelled = false;

    (async () => {
      const L = await import("leaflet");
      if (cancelled || !containerRef.current) return;

      const map = L.map(containerRef.current, {
        center: [BRAND.cityCenter.lat, BRAND.cityCenter.lng],
        zoom: BRAND.cityZoom,
        zoomControl: false,
        attributionControl: true,
      });
      mapRef.current = map;
      leafletRef.current = L;

      L.tileLayer(
        "https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}.png",
        {
          attribution:
            '© <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> · © <a href="https://carto.com/attributions">CARTO</a>',
          maxZoom: 19,
          subdomains: "abcd",
        },
      ).addTo(map);

      // Map-level click for drop-mode. Reads live state on each click.
      map.on("click", (e: LeafletMouseEvent) => {
        const s = useAppStore.getState();
        if (
          s.overlay === "add" &&
          s.draft.archetype !== null &&
          s.draft.lat === null
        ) {
          s.setDraftLatLng(e.latlng.lat, e.latlng.lng);
        }
      });

      setMapReady(true);
    })();

    const markers = markersRef.current;
    return () => {
      cancelled = true;
      setMapReady(false);
      if (mapRef.current) {
        mapRef.current.remove();
        mapRef.current = null;
      }
      leafletRef.current = null;
      markers.clear();
      draftMarkerRef.current = null;
    };
  }, []);

  // Sync place markers with allPlaces (adds, removes, restyles).
  useEffect(() => {
    if (!mapReady) return;
    const map = mapRef.current;
    const L = leafletRef.current;
    if (!map || !L) return;

    const seenIds = new Set<string>();
    for (const p of allPlaces) {
      seenIds.add(p.id);
      const featured = featuredIds.has(p.id);
      const existing = markersRef.current.get(p.id);
      if (existing) {
        existing.setIcon(buildIcon(L, featured));
        continue;
      }
      const marker = L.marker([p.lat, p.lng], {
        icon: buildIcon(L, featured),
      });
      marker.on("click", (e) => {
        const s = useAppStore.getState();
        const dropMode =
          s.overlay === "add" &&
          s.draft.archetype !== null &&
          s.draft.lat === null;
        if (dropMode) {
          // In drop mode, treat marker clicks as drop-pin.
          L.DomEvent.stopPropagation(e);
          s.setDraftLatLng(p.lat, p.lng);
          return;
        }
        s.selectPlace(p.id);
      });
      marker.addTo(map);
      markersRef.current.set(p.id, marker);
    }

    // Remove markers for places that no longer exist (rare — user delete).
    for (const [id, marker] of markersRef.current.entries()) {
      if (!seenIds.has(id)) {
        map.removeLayer(marker);
        markersRef.current.delete(id);
      }
    }
  }, [mapReady, allPlaces, featuredIds]);

  // Toggle visibility based on archetype + attribute + nearby filters.
  useEffect(() => {
    if (!mapReady) return;
    const map = mapRef.current;
    if (!map) return;

    for (const p of allPlaces) {
      const marker = markersRef.current.get(p.id);
      if (!marker) continue;
      const matchesArchetype =
        archetypeFilter === null || archetypeFilter.includes(p.archetype);
      const matchesAttributes =
        attributeFilter.length === 0 ||
        attributeFilter.every((t) => p.tags?.includes(t));
      const matchesNearby =
        !nearbyMode ||
        (userLat !== null &&
          userLng !== null &&
          distanceMi(userLat, userLng, p.lat, p.lng) <= nearbyRadius);
      const visible = matchesArchetype && matchesAttributes && matchesNearby;
      if (visible) {
        if (!map.hasLayer(marker)) marker.addTo(map);
      } else {
        if (map.hasLayer(marker)) map.removeLayer(marker);
      }
    }
  }, [mapReady, archetypeFilter, attributeFilter, nearbyMode, nearbyRadius, userLat, userLng, allPlaces]);

  // Draft pin marker (during add flow).
  useEffect(() => {
    if (!mapReady) return;
    const map = mapRef.current;
    const L = leafletRef.current;
    if (!map || !L) return;

    if (draftLat !== null && draftLng !== null) {
      if (!draftMarkerRef.current) {
        draftMarkerRef.current = L.marker([draftLat, draftLng], {
          icon: buildDraftIcon(L),
          interactive: false,
          keyboard: false,
        }).addTo(map);
      } else {
        draftMarkerRef.current.setLatLng([draftLat, draftLng]);
      }
    } else if (draftMarkerRef.current) {
      map.removeLayer(draftMarkerRef.current);
      draftMarkerRef.current = null;
    }
  }, [mapReady, draftLat, draftLng]);

  // User location marker (blue pulsing dot).
  useEffect(() => {
    if (!mapReady) return;
    const map = mapRef.current;
    const L = leafletRef.current;
    if (!map || !L) return;

    if (userLat !== null && userLng !== null) {
      if (!userMarkerRef.current) {
        userMarkerRef.current = L.circleMarker([userLat, userLng], {
          radius: 8,
          fillColor: "#4A90D9",
          fillOpacity: 1,
          color: "#fff",
          weight: 3,
          interactive: false,
        }).addTo(map);
      } else {
        userMarkerRef.current.setLatLng([userLat, userLng]);
      }
    } else if (userMarkerRef.current) {
      map.removeLayer(userMarkerRef.current);
      userMarkerRef.current = null;
    }
  }, [mapReady, userLat, userLng]);

  const handleLocateMe = () => {
    if (mapRef.current && userLat !== null && userLng !== null) {
      mapRef.current.flyTo([userLat, userLng], 14, { duration: 0.8 });
    }
  };

  // Crosshair cursor in drop mode.
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;
    if (isDropMode) {
      container.style.cursor = "crosshair";
    } else {
      container.style.cursor = "";
    }
  }, [isDropMode]);

  return (
    <>
      <div
        ref={containerRef}
        className="absolute inset-0 z-0"
        aria-label={`Map of ${BRAND.city}`}
      />
      {geoStatus === "active" && userLat !== null && (
        <button
          onClick={handleLocateMe}
          aria-label="Center on my location"
          className="absolute bottom-24 right-3 z-10 flex h-10 w-10 items-center justify-center rounded-full bg-surface shadow-md ring-1 ring-stone-line/60 transition-colors hover:bg-paper-warm"
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="12" r="4" />
            <line x1="12" y1="2" x2="12" y2="6" />
            <line x1="12" y1="18" x2="12" y2="22" />
            <line x1="2" y1="12" x2="6" y2="12" />
            <line x1="18" y1="12" x2="22" y2="12" />
          </svg>
        </button>
      )}
    </>
  );
}
