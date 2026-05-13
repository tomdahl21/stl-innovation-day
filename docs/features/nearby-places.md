# Feature: User Geolocation & Nearby Places

## Summary

Show the user's current location on the map with a blue dot and let them filter to only see places nearby — all client-side with no backend.

## How it works

- Uses the browser **Geolocation API** (`navigator.geolocation.watchPosition`) to continuously track the user's position.
- Calculates distance to each place using the **Haversine formula** (pure math, no external dependency).
- A **"Nearby" filter chip** appears once location permission is granted. Toggling it hides places beyond the configured radius (default 1 mile).
- The **peek card** shows distance from the user to the selected place (e.g. "0.3 mi").
- A **locate-me button** (crosshair icon) on the map flies the view to the user's position.

## Data model changes

New store fields (session-only, not persisted):

| Field | Type | Default | Purpose |
|-------|------|---------|---------|
| `userLat` | `number \| null` | `null` | User's latitude |
| `userLng` | `number \| null` | `null` | User's longitude |
| `geoStatus` | `"idle" \| "pending" \| "active" \| "denied"` | `"idle"` | Permission/tracking state |
| `nearbyMode` | `boolean` | `false` | Whether nearby filter is active |
| `nearbyRadius` | `number` | `1` | Radius in miles |

## Key files

| File | Role |
|------|------|
| `src/lib/geo.ts` | Haversine distance + formatting |
| `src/lib/hooks/use-geolocation.ts` | Browser geolocation watcher hook |
| `src/lib/data/store.ts` | Zustand state for location + nearby mode |
| `src/components/map/map-screen.tsx` | User marker, locate button, nearby filter |
| `src/components/map/filter-chips.tsx` | "Nearby" chip |
| `src/components/map/peek-card.tsx` | Distance display |

## Open questions

- Should nearby radius be user-configurable (e.g. 0.5 / 1 / 3 / 5 mi)?
- Should we sort visible places by distance when nearby mode is on?
- Privacy notice / permission prompt UX?
