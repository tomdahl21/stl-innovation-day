"use client";

import { useState } from "react";
import { ClusterMark } from "@/components/cluster-mark";
import { BRAND } from "@/lib/brand";
import { PersonaSwitcher } from "./persona-switcher";
import { FilterChips } from "@/components/map/filter-chips";
import {
  ActiveAttributeChips,
  AttributeFilterSheet,
} from "@/components/map/attribute-filter";

export function TopBar() {
  const [filterOpen, setFilterOpen] = useState(false);

  return (
    <>
      <header className="absolute inset-x-0 top-0 z-20 flex flex-col gap-1.5 bg-paper/95 pt-[max(env(safe-area-inset-top),0.5rem)] pb-2 backdrop-blur-md">
        <div className="flex items-center justify-between px-3">
          <div className="flex items-center gap-2">
            <ClusterMark size={28} />
            <span className="serif-display text-2xl text-ink">
              {BRAND.name}
            </span>
          </div>
          <PersonaSwitcher />
        </div>
        <div className="px-3">
          <div className="flex items-center gap-2 rounded-full bg-paper-warm/90 px-3 py-1.5 text-xs text-ink-muted ring-1 ring-stone-line/40">
            <SearchIcon />
            Search {BRAND.cityShort}
          </div>
        </div>
        <FilterChips onFilterPress={() => setFilterOpen(true)} />
        <ActiveAttributeChips />
      </header>

      <AttributeFilterSheet
        open={filterOpen}
        onClose={() => setFilterOpen(false)}
      />
    </>
  );
}

function SearchIcon() {
  return (
    <svg width="13" height="13" viewBox="0 0 13 13" fill="none">
      <circle cx="5.5" cy="5.5" r="3.8" stroke="currentColor" strokeWidth="1.2" />
      <path d="M9 9l3 3" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" />
    </svg>
  );
}
