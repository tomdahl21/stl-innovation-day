# Shared Lists — Feature Spec

**Status:** Draft
**Priority:** Phase 1 enhancement
**Backend required:** None — fully client-side

---

## Summary

Users can create named lists of places (e.g. "Best Date Night Spots", "Weekend with Mom"), share them via URL, and import lists shared by friends — all without any backend, auth, or database. Data lives in localStorage via Zustand; sharing works by encoding list data into a URL fragment that recipients can open and merge into their own local store.

---

## Problem

The logbook (Been / Want / Saved) is personal and flat. Users have no way to:

- Group places into themed collections beyond the three logbook states
- Share a curated set of places with a friend visiting town
- Receive a friend's recommendations and keep them organized
- Collaboratively build a plan ("things to do this weekend") with another person

The PRD already identifies shareable logbook links as a Phase 1 feature. This spec extends that into full list management with a lightweight collaboration loop.

---

## Design principles

1. **Zero backend** — all state in localStorage, all sharing via URL encoding
2. **Import, don't sync** — "collaboration" means share → import → edit → re-share, not real-time co-editing
3. **Additive to logbook** — lists complement Been/Want/Saved, they don't replace it
4. **Frictionless receive** — opening a shared link should show the list immediately, no sign-up required
5. **Small data** — URL fragments stay under ~2KB by encoding only place IDs + metadata, not full place objects

---

## User stories

| # | As a… | I want to… | So that… |
|---|-------|-----------|----------|
| 1 | Resident | create a named list and add places to it | I can organize gems beyond been/want/saved |
| 2 | Resident | share a list as a copyable URL | my friend can see my recommendations without signing up |
| 3 | Visitor | open a shared list link and see it on the map | I can explore a local's recommendations spatially |
| 4 | Visitor | import a shared list into my own lists | I can keep it, edit it, and check things off |
| 5 | Resident | import a friend's list, add places, and re-share | we can build a plan together asynchronously |
| 6 | User | delete or rename my lists | I can keep my lists tidy |
| 7 | User | see which places in a list I've already been to | I know what's left to explore |

---

## Data model

Additions to the existing Zustand store (persisted to localStorage):

```typescript
export type SharedList = {
  id: string;               // nanoid, locally generated
  name: string;             // user-defined title
  description?: string;     // optional blurb
  emoji?: string;           // optional list icon (default: 📍)
  placeIds: string[];       // ordered array of place IDs
  createdAt: string;        // ISO timestamp
  updatedAt: string;        // ISO timestamp
  source?: {                // present if this list was imported
    sharedBy?: string;      // display name of sharer (optional)
    importedAt: string;     // when the user imported it
  };
};
```

Store shape addition:

```typescript
// inside StoreState
lists: SharedList[];

// inside StoreActions
createList: (name: string, emoji?: string) => string;           // returns list ID
deleteList: (listId: string) => void;
renameList: (listId: string, name: string) => void;
updateListDescription: (listId: string, description: string) => void;
addPlaceToList: (listId: string, placeId: string) => void;
removePlaceFromList: (listId: string, placeId: string) => void;
reorderListPlaces: (listId: string, placeIds: string[]) => void;
importList: (data: SharedListPayload) => string;                // returns new list ID
```

---

## URL sharing format

Lists are shared via URL fragment to avoid server roundtrips. The fragment encodes a compact JSON payload, base64url-encoded.

### Payload schema

```typescript
type SharedListPayload = {
  v: 1;                    // schema version for forward compat
  n: string;               // list name
  d?: string;              // description (optional)
  e?: string;              // emoji (optional)
  p: string[];             // place IDs (ordered)
  by?: string;             // sharer display name (optional)
};
```

### URL structure

```
https://trove.app/list#data=<base64url-encoded-json>
```

Example flow:
1. User taps "Share" on their list
2. App serializes the payload, base64url-encodes it, builds the URL
3. User copies URL or uses Web Share API (mobile)
4. Recipient opens URL → app reads fragment → renders list in an import overlay
5. Recipient taps "Import" → list is cloned into their localStorage

### Size budget

- Average list: 10 places × ~8-char IDs + metadata ≈ 200 bytes → ~270 chars base64
- Large list: 50 places ≈ 600 bytes → ~800 chars base64
- Well within URL length limits (~2,000 chars safe across browsers)

---

## UI components

### 1. List manager overlay (`/src/components/overlays/lists.tsx`)

- Accessed from the tab bar (new "Lists" tab) or from the logbook
- Shows all user lists as cards: emoji + name + place count + last updated
- "New List" button at top
- Tap a list → opens list detail view
- Long-press / swipe → rename, delete

### 2. List detail view (`/src/components/overlays/list-detail.tsx`)

- Header: emoji, name, description, share button, edit button
- Place list: ordered cards (reuse peek-card style), each with a remove button
- Logbook state badges inline (show if user has marked a place as been/want/saved)
- "View on Map" button → filters map to only show list's places
- "Share" button → generates URL, opens share sheet / copies to clipboard
- If list was imported: shows "Shared by {name}" attribution

### 3. Add-to-list action

- New quick action on place detail and peek card: "Add to List" (bookmark + list icon)
- Tapping opens a bottom sheet with checkboxes for each list + "New List" option
- A place can belong to multiple lists

### 4. Import overlay (`/src/components/overlays/list-import.tsx`)

- Triggered when app detects `#data=` in the URL fragment on load
- Shows: list name, description, place count, preview of first ~5 places on a mini-map
- Two actions: "Import to My Lists" (primary) and "Just Browse" (secondary — shows places on map without saving)
- After import, clears the URL fragment

### 5. Share sheet

- Uses the Web Share API where available (mobile Safari, Android Chrome)
- Falls back to "Copy Link" with a toast confirmation
- Optional: user can set their display name before first share (stored in localStorage)

---

## Collaboration loop

True real-time collaboration requires a backend. Instead, Trove supports an async collaboration loop:

```
Alice creates "Weekend Plan"
  → adds 5 places
  → shares URL with Bob

Bob opens link
  → imports list (becomes "Weekend Plan" in his store)
  → adds 3 more places
  → shares updated URL back to Alice

Alice opens link
  → sees Bob's version
  → imports as new list OR merges into existing
  → merge = union of place IDs, preserving order (Alice's first, then Bob's additions)
```

### Merge behavior

When importing a list whose name matches an existing list, the user is prompted:

- **"Import as new"** — creates a separate copy (appends "from {name}" to title)
- **"Merge"** — adds any new place IDs to the end of the existing list, skips duplicates

---

## Route handling

Add a new route: `/list` (or handle via the main page with fragment detection).

**Recommended approach** — fragment detection on the main page:

```typescript
// In the root page or a top-level effect
useEffect(() => {
  const hash = window.location.hash;
  if (hash.startsWith('#data=')) {
    const payload = decodeListPayload(hash.slice(6));
    if (payload) {
      store.setOverlay('list-import');
      store.setPendingImport(payload);
    }
    // Clean the URL without reload
    history.replaceState(null, '', window.location.pathname);
  }
}, []);
```

This avoids adding a new Next.js route and keeps the map as the persistent spine per the PRD's architectural commitment.

---

## Implementation plan

### Phase A — Core list CRUD
1. Add `SharedList` type to `types.ts`
2. Add `lists` array + actions to Zustand store (persisted partition)
3. Build list manager overlay
4. Build list detail view
5. Add "Add to List" action to place detail / peek card

### Phase B — Sharing & import
6. Implement `encodeListPayload` / `decodeListPayload` utilities
7. Build share sheet (Web Share API + clipboard fallback)
8. Build import overlay
9. Add fragment detection to root page
10. Add display name prompt for first share

### Phase C — Polish
11. Merge flow for duplicate list names
12. "View on Map" filter mode (temporary archetype filter override)
13. Drag-to-reorder places in list detail
14. Empty states and onboarding hints

---

## Edge cases

| Case | Handling |
|------|----------|
| Shared list contains place IDs not in recipient's seed data | Show "Unknown place" placeholder; these resolve if/when the place is synced in a future backend phase |
| URL fragment exceeds browser limits | Cap lists at 100 places for sharing; show warning if over limit |
| User opens their own shared link | Detect by list ID match; show "This is your list" instead of import flow |
| localStorage is full | Graceful error toast; suggest deleting old lists |
| Multiple imports of the same list | Each import creates a new copy unless user chooses merge |

---

## Future enhancements (requires backend)

These are explicitly out of scope but noted for Phase 2 planning:

- **Real-time sync** — WebSocket or Supabase Realtime for live collaborative editing
- **Permanent short links** — server-generated slugs (e.g. `trove.app/l/abc123`) instead of long fragments
- **List comments** — threaded discussion per list
- **List forking** — public lists that anyone can fork and customize
- **Activity feed** — "Alice added 3 places to Weekend Plan"

---

## Open questions

1. Should lists be accessible from the tab bar (new tab) or nested under Logbook?
2. Max number of lists per user? (Suggest: 20 for localStorage budget)
3. Should "View on Map" be a temporary filter or a full map mode with its own back navigation?
4. Do we want a QR code option alongside URL sharing for in-person handoff?
