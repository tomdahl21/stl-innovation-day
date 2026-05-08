# Trove — Product Requirements Document

**Version** 0.1 · Foundational
**Status** Draft for review
**Owner** Tom
**Last updated** May 2026

> Working title note: *Trove* is the working brand. Cluster mark, paper-and-brick palette, Fraunces / DM Sans typography. See `trove-brand-mockup.html` for visual reference.

---

## TL;DR

Trove is a map-first web app where St. Louis residents and visitors discover, contribute, and log the city's hidden gems. The product launches with a curated seed of ~100 places contributed by an invited founding-contributor cohort, then opens to community contribution as trust scales. It fits a clear gap between Explore St. Louis (editorial, partner-gated, tourist-only, no map, no personalization) and Atlas Obscura (global, weak app UX, no logbook layer worth using). The architecture is intentionally modular by place archetype so feature workshops and agentic build sprints can extend the product without touching the map or auth core.

---

## Vision

**A personal map of St. Louis, built by the people who actually live here.**

Trove is what the city looks like when locals run the cartography. Every pin on the map earned its place from someone who showed up. Every user builds their own version of the city — where they've been, where they want to go, and what they'd send a friend to.

The wedge sentence we'll use everywhere: *Trove is the only place where the people who live in St. Louis decide what's worth visiting, and you keep your own record of what you've discovered.*

---

## Strategic positioning

Trove sits in a defensible whitespace nobody is currently occupying for St. Louis specifically. The existing landscape splits into three rough buckets: editorial destination-marketing sites (Explore St. Louis, Visit Missouri) that are top-down, partner-gated, and built for inbound tourists; global discovery platforms (Atlas Obscura, Tripadvisor) that lack hyperlocal density and have weak personal layers; and utility map products (Google Maps Lists, Apple Maps Guides) that are generic by design with no curation moat. The closest mechanic worth studying is Beli, the restaurant ranking app — it nails the *find + log* loop but is single-archetype and fully social, where Trove is multi-archetype and logbook-private-by-default.

The competitive differentiation comes from four reinforcing choices: hyperlocal scope (St. Louis metro, not a global directory), contribution-gated supply (residents earn the map, the map earns the visitors), a personal layer that's truly personal (your logbook is yours, not the algorithm's), and modular archetype rendering (a restaurant pin doesn't pretend to be a music venue).

| Axis             | Trove                          | Explore St. Louis                | Atlas Obscura          | Google Maps Lists |
| ---------------- | ------------------------------ | -------------------------------- | ---------------------- | ----------------- |
| Geographic scope | Hyperlocal (STL metro)         | STL metro                        | Global                 | Global            |
| Content source   | Curated seed → community       | Editorial + paid Partners        | Editorial + light UGC  | UGC + commerce    |
| Primary surface  | Map                            | Listicles & pages                | Search + lists         | Search            |
| Personal layer   | Full logbook (been/want/saved) | None                             | Light, buggy           | Lists only        |
| Audience         | Residents + visitors equal     | Inbound visitors / planners      | Curious travelers      | Anyone            |
| Commercial bias  | None at launch                 | Partner-driven                   | Ad-supported           | None              |
| Mobile           | Mobile-first PWA               | Responsive WordPress             | Native (mediocre)      | Native            |

---

## Audience

Two equal-priority segments, served by the same map but with different default behaviors and entry points.

**The Resident Curator** lives in the metro and has lived here long enough to have opinions. They want a place to log the gems they already know, find ones they don't, and quietly out-curate their friends. They're the contribution engine. Discovery is secondary to expression — they're as interested in *being seen as someone who knows this place* as they are in finding new spots. Default state: signed-in, full-density map, contribution CTAs visible.

**The Discerning Visitor** is in town for two to five days. They want the *real* St. Louis (not the Arch, or at least not only the Arch). They trust a local map over a Tripadvisor list. They won't contribute on the first trip but consume signal heavily — what locals have logged, what's saved most, what nearby resident has the most interesting taste. They're the retention engine on return visits. Default state: anonymous, top-tier curated pins, save-and-share CTAs visible, contribution gated behind sign-up.

Both see the same map. The product biases by user state rather than building two products. Contribution is what's gated, not consumption.

---

## Strategic principles

The following commitments are non-negotiable and should be referenced any time a product decision is in dispute.

**Locals first, but never locals-only.** Visitors aren't taxed for being visitors; they just don't get to add to the map until they've earned it.

**Map is the home, not the index.** Every navigation flow starts from spatial context. Other surfaces render as overlay sheets so the map never fully unmounts.

**Every gem has an owner.** Contributions are attributed. Trust is earned and visible. No anonymous additions, ever.

**No paid placement.** The integrity of "hidden" is the entire product. Monetization, when it comes, comes from elsewhere — memberships, premium features, white-label B2B for other metros.

**The logbook is yours.** Private by default, shareable on demand. Never sold, never algorithmically promoted.

**Modular by archetype.** A restaurant doesn't render like a music venue. The system supports archetype-specific cards, fields, and filters by design.

---

## MVP feature set — Phase 1

### Map exploration

The app opens directly to a fullscreen map of the St. Louis metro. Pins cluster at zoom-out and split into individual markers at zoom-in. Persistent filter chips along the top of the map filter by archetype (Eatery, Drink, Venue, Curio, Outdoors, Shop) and by mood (date night, kid-friendly, solo, group, rainy day, free). Tapping a pin opens a peek card at the bottom of the screen; tapping the peek card opens the full place detail. A "near me" FAB recenters on the user's location.

### Place detail

Place detail uses an archetype-specific card layout — see the archetype matrix below. The contributor's "why it's a gem" pitch sits prominently, with full attribution and trust signals (founding-member badge, contribution count, verified-local status if applicable). Three persistent quick-state actions live at the bottom of the screen: **Want to go**, **Saved**, **Been there**. Each can carry a private note. Photo galleries lead with the contributor's photos and fall back to community photos.

### Contribution flow

Founding contributors are invited via email and capped (target ~25 invitees for the seed cohort). Adding a gem follows a four-step flow: drop pin on map → select archetype → fill archetype-specific fields → submit. Founding-contributor submissions auto-publish; community submissions enter a light moderation queue in Phase 1 for trust calibration. Every contributor gets a public profile that shows their pins, contribution count, and trust tier.

### Personal logbook

The logbook is a personal map view filtered to the user's own state — Been / Want / Saved as toggles. List view shows the same data with notes, photos, and date saved or visited. Per-pin private notes are always editable. Logbook lists are shareable as URL-based public links so a resident can send a curated set to a visiting friend without forcing the friend through sign-up.

### Lightweight social

Public contributor profiles are followable. Following someone gives you access to their public logbook view. There's no feed in Phase 1 — just direct map-of-them access. We deliberately delay the feed mechanic until we understand whether contribution density holds up; feeds without supply create cold-start anxiety for new users.

### Explicitly out of scope for Phase 1

Native mobile apps (PWA only — installable, near-native feel, single codebase). Comments and reviews threads. Trip-planning routing between gems. Events and ticketing integration. Monetization and memberships. Multi-city expansion (the architecture supports it; the product doesn't ship it). All of these are deferred to Phase 2+ once the contribution loop is proven.

---

## Place archetypes

The map renders the same way for every pin; the cards do not. Each archetype has its own schema, card layout, and filter affinity. This is the central extension point for the upcoming feature workshop — new archetypes (Stay, Service, Workspace, Ritual) and new affordances within existing archetypes can be added as contained additions without touching the map or auth core.

| Archetype     | Primary fields                                   | Secondary fields                          | Distinct UX                       |
| ------------- | ------------------------------------------------ | ----------------------------------------- | --------------------------------- |
| **Eatery**    | Cuisine, signature dish, price tier, hours       | Reservation needed, who-you-went-with     | "Order this" highlight            |
| **Drink**     | Drink specialty, vibe, time-of-day fit           | Crowd type, food available                | Crowd / time heatmap              |
| **Venue**     | Genre / format, upcoming events, capacity feel   | Bar inside, seated vs. standing           | Live event preview strip          |
| **Curio**     | Story / why-it's-special, time needed, tickets   | Best season, photo-worthiness             | Story-card layout (longer prose)  |
| **Outdoors**  | Activity, distance / trail, season, accessibility| Family-fit, dog-friendly                  | Weather-aware display state       |
| **Shop**      | Specialty, vibe, price tier                      | Hours, owner story                        | Lookbook-style gallery            |

Archetypes are defined as discriminated TypeScript types in a shared schema package and rendered via a registry pattern: one schema entry plus one card component per archetype. Adding a new archetype is a contained addition, not a refactor — exactly the modularity we want for agent-driven feature development.

The feature workshop is the right venue to pressure-test this matrix. Specifically worth asking: is *Stay* (boutique hotels, B&Bs, unique short-term rentals) a Phase 1 addition given the visitor audience, or does it pull us toward partner-gated content too quickly?

---

## Information architecture

Top-level surfaces, mobile-first:

1. **Map** *(default landing)* — fullscreen, persistent filter chips, near-me FAB
2. **Logbook** — your pins, segmented Been / Want / Saved
3. **Contribute** — add a gem, see your contribution status, leaderboard (community phase)
4. **Profile** — public-facing identity, follow state, settings

The architectural commitment: the map view never fully unmounts. Other surfaces render as overlay sheets, similar to how Beli treats the list as a persistent spine. This keeps the user one swipe or tap from spatial context at all times. It also makes for a stronger demo pattern — the map is always the visual anchor.

---

## Technical architecture

### Stack recommendation

| Layer          | Choice                                | Rationale                                                          |
| -------------- | ------------------------------------- | ------------------------------------------------------------------ |
| Frontend       | Next.js 15 (App Router) + React 19    | Standard for the consulting context; pairs well with Vercel        |
| Hosting        | Vercel                                | Already standard practice; consistent with SeatFlex POC            |
| Map rendering  | **Mapbox GL JS** (recommended)        | Best mobile performance, custom styling, vector tiles              |
| Map alt        | MapLibre GL JS                        | Open-source fork, no usage costs — fallback if budget pressures    |
| Database       | Supabase (Postgres + PostGIS)         | Spatial queries native, auth bundled, real-time built-in           |
| Auth           | Supabase Auth                         | Magic-link email for founding contributors, OAuth for general user |
| File storage   | Supabase Storage                      | Photos, contributor avatars; CDN-fronted                           |
| Search         | Postgres full-text → Algolia (later)  | Defer Algolia until search load justifies the cost                 |
| Analytics      | PostHog                               | Product analytics + session replay for Phase 1 learning loops      |
| Styling        | Tailwind 4 + CSS variables            | Aligns with brand token system already documented                  |
| Components     | shadcn/ui as base, custom Trove kit   | Build on top, don't fight the design language                      |
| Type safety    | TypeScript end-to-end, Zod validation | Standard practice; archetype schemas are the central beneficiary   |

### Why Mapbox over alternatives

We'll need three things from the map layer that narrow the field: high-quality vector tiles for smooth zooming, a custom style API to land the paper-warm cartographic look from the brand work, and clustering / spiderfication built in so we don't reinvent the wheel. Mapbox GL JS hits all three cleanly. Google Maps gets ruled out on cost at scale and aesthetic inflexibility. Apple MapKit JS is mobile-restricted and not cross-platform. MapLibre is the open-source backup — same API surface, lose the proprietary styles and hosted tiles. Worth running the cost projection before commitment: Mapbox's free tier is 50K monthly map loads, which covers Phase 1 comfortably but warrants checking against assumed traffic.

### Data model — high level

Six core entities, kept deliberately simple for Phase 1.

**Place** holds the universal fields (id, name, location point, archetype, contributor_id, status, created_at) plus a JSONB `archetype_data` column that holds the archetype-specific schema. This keeps the table flat while letting each archetype evolve independently.

**Contributor** is a public-facing profile (id, display name, avatar, trust tier, bio, joined_at, founding_member boolean). Linked one-to-many with Place.

**LogbookEntry** is the personal layer (id, user_id, place_id, state, note, visited_at, created_at). State is an enum of `been` / `want` / `saved`. Composite unique constraint on user_id + place_id ensures one entry per place per user.

**Photo** is polymorphic — links to Place or LogbookEntry, stores blob_url, contributor_id, created_at, and ordering.

**Follow** is the social edge (follower_id, followee_id, created_at).

**SharedList** captures shareable logbook URLs (id, owner_id, slug, title, place_ids array, expires_at nullable).

### Archetype schema as the central abstraction

All archetype-specific behavior flows from a single TypeScript registry. Each archetype exports a schema (Zod), a card component (React), an editor form (React), and a filter hook. Adding a new archetype means adding one folder and registering it; nothing in the map, auth, or logbook code needs to know it exists. This is also what makes the codebase agent-friendly: a Claude Code session can be scoped to "build the Stay archetype" and it stays in its lane.

### Performance and cost commitments

Time-to-interactive on the map view under 2.5 seconds on mid-tier mobile over 4G. First contentful paint under 1.2 seconds. Map pin density should remain smooth at 500+ pins on screen via clustering. Server costs in Phase 1 should stay under $200/month at expected demo traffic; the gating cost is Mapbox tile loads, not database.

---

## Design system

Reference: `trove-brand-mockup.html` for the canonical implementation. Summary of the system:

The palette is organized in three neutral layers — Surface (#FCFAF5, the white that holds objects), Paper (#F4EDE0, the page background warmth), and Paper-warm (#ECE2CD, recessed insets like chips and inputs) — anchored by Ink (#1A1612) for text and Brick (#B14F2B) as the punctuation accent. Moss (#34503C) handles outdoor/parks contexts and verification states. Brick stays under roughly 10% of visible color real estate at all times.

Typography pairs Fraunces (display, serif, italic at weight 500 for the wordmark and headings) with DM Sans (body, utility, eyebrow text). Optical size 144 for display moments, 96 for medium lockups, 24-32 for small.

The cluster mark is the visual signature — a constellation of pins anchored by a single brick-red dot. It scales from 16px favicon to billboard, recurs as a decorative motif (the divider near the footer), and serves as the app icon in white-on-brick.

The component kit at this stage is intentionally small: buttons (primary ink, brick CTA, secondary outlined), archetype chips, status badges (founding, verified, pending, outline), contributor pill, place action buttons, archetype eyebrow text. Everything else inherits.

---

## Tourism partnership integration

The strategic ask is that Trove eventually connects to a range of existing tourism sites — Explore St. Louis, Visit Missouri, neighborhood-specific sites, and partner DMOs across the region. The architecture should support this from day one even if no integrations ship in Phase 1.

The integration model has three layers worth designing for now and shipping later. The first is an outbound layer — a public read-only API and structured JSON-LD schema markup on every place page so partner sites can ingest Trove pins into their own surfaces. The second is an inbound layer — a partner content adapter that lets vetted DMOs contribute their editorial picks as a distinct content tier (visually flagged, never algorithmically advantaged, and held to the same quality bar as community contributions). The third is an embed layer — a standalone JavaScript embed of the Trove map that partner sites can drop into a page, with their own filter defaults applied (e.g., Explore St. Louis embeds the map filtered to "visitor-friendly" gems on their homepage).

This three-layer model lets Trove sit alongside the existing tourism ecosystem rather than competing with it — a positioning advantage given the incumbents have audience and operating budgets, and Trove has product and editorial credibility. The Phase 1 commitment is just to design the data model and routes such that all three layers can be added without refactoring; actual partner integrations are Phase 2 once the contribution loop has produced enough signal to make the partnerships valuable.

---

## Phasing

**Phase 1 — Demo build (current).** The single-metro, single-codebase app described above. ~100 founding-contributor seeded pins. Logbook, contribution flow, public profiles, follow mechanic. PWA-installable. Goal: prove the contribution and logbook loops work and produce a demoable artifact. Target: 4-6 weeks of focused build.

**Phase 2 — Public launch.** Open registration. Community contribution moderation tooling. Contributor leaderboards and trust-tier progression mechanics. First partner integrations (likely starting with one DMO embed and one inbound content adapter). Search beyond filter-chips. Performance hardening.

**Phase 3 — Beyond St. Louis.** Multi-city architecture activated. White-label DMO offering productized. Native mobile apps if PWA metrics justify it. Memberships or premium features explored.

---

## Success metrics

For Phase 1, success is a function of supply, retention, and shareability. The supply metric is contribution rate among founding cohort — target 80% of invited contributors add at least 3 gems within 30 days. The retention metric is week-2 return rate among users with a logbook entry — target 35%, on the assumption that the personal layer is what brings people back. The shareability metric is shared logbook link click-through — target 25% of generated links produce at least one click, on the assumption that residents want to share their lists with visiting friends.

For Phase 2, success migrates to community contribution velocity, partner integration adoption, and net new user growth.

---

## Open questions and decisions needed

The list below is what we should resolve before or during the feature workshop, ordered roughly by how upstream the decision is.

The first is the founding-cohort selection model — who counts as a founding contributor, how we recruit them, and what their compensation or recognition looks like. This is upstream of everything because the seed quality determines launch credibility. Worth a separate conversation.

The second is the moderation model for community contributions in Phase 2. Light-touch human review is the Phase 1 plan because volume will be low; we need a clearer answer for what scales. Reputation-weighted auto-approval, founding-contributor voting, dedicated paid moderators — each has tradeoffs.

The third is whether *Stay* (boutique hotels, B&Bs, unique short-term rentals) should be a Phase 1 archetype. It's the natural visitor-side request and the workshop will likely ask for it. The risk is that it pulls Trove toward partner-gated content faster than the brand can absorb, given hotels are a heavily commercialized category.

The fourth is the brand naming decision. *Trove* is the working title. Before any partner outreach happens, we should confirm domain availability, trademark headroom, and conduct a brief brand-distinction audit to confirm there's no obvious near-collision in the local-discovery space.

The fifth is the partner-integration sequencing. The architecture supports inbound, outbound, and embed integrations. The strategic question is which one we lead with for the first announced partnership, and whether that partnership is timed to launch or held back six months to let the community-built map mature first.

---

## Appendix

### Competitive reference set

Atlas Obscura, Beli, Vamonde, Let's Roam, Questo, Tripadvisor, Google Maps Lists, Apple Maps Guides. Closest mechanic: Beli. Closest tone: Atlas Obscura. Closest geographic logic: nothing — that's the whitespace.

### Brand reference

`trove-brand-mockup.html` contains the canonical design system, mark variations, palette, typography, mobile UI samples, and component kit. All visual decisions in Phase 1 should reference that artifact.

### Companion deliverables to produce

A workshop facilitation deck for the feature event, scoped around the archetype framework and the Phase 1 / 2 / 3 phasing. A founding-contributor recruiting one-pager. A demo script for the build artifact once Phase 1 ships. A partner-integration prospectus, lighter weight, for the post-Phase-1 conversations.
