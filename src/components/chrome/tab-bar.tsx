"use client";

import { useAppStore, type OverlayKind } from "@/lib/data/store";
import { cn } from "@/lib/cn";

const TABS: { key: Exclude<OverlayKind, "place" | "list-detail" | "list-import"> | "map"; label: string; icon: React.ReactNode }[] = [
  { key: "map", label: "Map", icon: <MapIcon /> },
  { key: "logbook", label: "Logbook", icon: <BookIcon /> },
  { key: "lists", label: "Lists", icon: <ListIcon /> },
  { key: "add", label: "Add", icon: <PlusIcon /> },
  { key: "profile", label: "Profile", icon: <PersonIcon /> },
];

export function TabBar() {
  const overlay = useAppStore((s) => s.overlay);
  const setOverlay = useAppStore((s) => s.setOverlay);
  const selectPlace = useAppStore((s) => s.selectPlace);

  const activeKey =
    overlay === null || overlay === "place"
      ? "map"
      : overlay === "list-detail" || overlay === "list-import"
        ? "lists"
        : overlay;

  return (
    <nav
      aria-label="Main navigation"
      className="absolute inset-x-0 bottom-0 z-30 flex justify-around border-t border-stone-line bg-surface pt-2 pb-[max(env(safe-area-inset-bottom),0.875rem)]"
    >
      {TABS.map((t) => {
        const active = activeKey === t.key;
        return (
          <button
            key={t.key}
            onClick={() => {
              if (t.key === "map") {
                setOverlay(null);
                selectPlace(null);
              } else {
                setOverlay(t.key as OverlayKind);
              }
            }}
            aria-current={active ? "page" : undefined}
            aria-label={t.label}
            className={cn(
              /* min 44×44px touch target (WCAG 2.5.5) */
              "flex min-h-11 flex-col items-center justify-center gap-0.5 px-4 text-[9px] font-medium uppercase tracking-[0.12em] transition-colors",
              active ? "text-brick" : "text-ink-muted hover:text-ink",
            )}
          >
            {t.icon}
            <span aria-hidden="true">{t.label}</span>
          </button>
        );
      })}
    </nav>
  );
}

function MapIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M9 4v16M15 4v16M3 7l6-3 6 3 6-3v16l-6 3-6-3-6 3z" />
    </svg>
  );
}
function BookIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M4 4h12a4 4 0 014 4v12H8a4 4 0 01-4-4V4z" />
      <path d="M4 16a4 4 0 014-4h12" />
    </svg>
  );
}
function PlusIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <circle cx="12" cy="12" r="9" />
      <path d="M12 8v8M8 12h8" />
    </svg>
  );
}
function ListIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
      <path d="M8 6h13M8 12h13M8 18h13M3 6h.01M3 12h.01M3 18h.01" />
    </svg>
  );
}
function PersonIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <circle cx="12" cy="8" r="4" />
      <path d="M4 21c0-4 4-7 8-7s8 3 8 7" />
    </svg>
  );
}
