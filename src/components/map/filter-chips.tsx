"use client";

import { useAppStore } from "@/lib/data/store";
import { cn } from "@/lib/cn";
import { CategoryFilter } from "./category-filter";

export function FilterChips({ onFilterPress }: { onFilterPress: () => void }) {
  const attributeFilter = useAppStore((s) => s.attributeFilter);
  const nearbyMode = useAppStore((s) => s.nearbyMode);
  const nearbyRadius = useAppStore((s) => s.nearbyRadius);
  const geoStatus = useAppStore((s) => s.geoStatus);
  const toggleNearbyMode = useAppStore((s) => s.toggleNearbyMode);
  const setNearbyRadius = useAppStore((s) => s.setNearbyRadius);

  return (
    <div
      role="group"
      aria-label="Filters"
      className="flex gap-1.5 overflow-x-auto px-3 py-2"
      style={{ scrollbarWidth: "none" }}
    >
      <CategoryFilter />

      {/* Nearby toggle — only visible once location is available */}
      {geoStatus === "active" && (
        <Chip
          active={nearbyMode}
          aria-pressed={nearbyMode}
          onClick={toggleNearbyMode}
        >
          📍 Nearby{nearbyMode && ` ${nearbyRadius} mi`}
        </Chip>
      )}

      {/* Nearby radius slider — shown when nearby mode is on */}
      {geoStatus === "active" && nearbyMode && (
        <div className="shrink-0 flex items-center gap-2 pl-1 pr-2">
          <input
            type="range"
            min={0.5}
            max={5}
            step={0.5}
            value={nearbyRadius}
            onChange={(e) => setNearbyRadius(Number(e.target.value))}
            className="w-20 accent-ink h-1"
            aria-label="Nearby radius in miles"
          />
          <span className="text-[10px] text-ink-muted whitespace-nowrap">{nearbyRadius} mi</span>
        </div>
      )}

      {/* Attribute filter trigger */}
      <button
        onClick={onFilterPress}
        className={cn(
          "shrink-0 flex items-center gap-1.5 whitespace-nowrap rounded-full border px-3 py-1 text-xs font-medium transition-colors",
          attributeFilter.length > 0
            ? "bg-ink/10 text-ink border-ink/30"
            : "bg-paper-warm/90 text-ink-soft border-stone-line hover:border-ink/40",
        )}
      >
        <FilterIcon />
        Filters
        {attributeFilter.length > 0 && (
          <span className="flex items-center justify-center w-4 h-4 rounded-full bg-ink text-paper text-[10px] font-semibold">
            {attributeFilter.length}
          </span>
        )}
      </button>
    </div>
  );
}

function Chip({
  active,
  onClick,
  children,
  "aria-pressed": ariaPressed,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
  "aria-pressed"?: boolean;
}) {
  return (
    <button
      onClick={onClick}
      aria-pressed={ariaPressed}
      /* min 44px height touch target (WCAG 2.5.5) */
      className={cn(
        "shrink-0 min-h-11 whitespace-nowrap rounded-full border px-3 text-xs font-medium transition-colors",
        active
          ? "bg-ink text-paper border-ink"
          : "bg-paper-warm/90 text-ink-soft border-stone-line hover:border-ink/40",
      )}
    >
      {children}
    </button>
  );
}

function FilterIcon() {
  return (
    <svg width="11" height="11" viewBox="0 0 11 11" fill="none" aria-hidden="true">
      <path
        d="M1 2h9M2.5 5.5h6M4 9h3"
        stroke="currentColor"
        strokeWidth="1.3"
        strokeLinecap="round"
      />
    </svg>
  );
}
