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
import { useAppStore } from "@/lib/data/store";

export function TopBar() {
  const [filterOpen, setFilterOpen] = useState(false);
  const theme = useAppStore((s) => s.theme);
  const toggleTheme = useAppStore((s) => s.toggleTheme);
  const isDark = theme === "dark";

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
          <div className="flex items-center gap-2">
            <button
              onClick={toggleTheme}
              aria-label={isDark ? "Switch to light mode" : "Switch to dark mode"}
              aria-pressed={isDark}
              className="flex h-8 w-8 items-center justify-center rounded-full text-ink-muted transition-colors hover:bg-paper-warm hover:text-ink"
            >
              {isDark ? <SunIcon /> : <MoonIcon />}
            </button>
            <PersonaSwitcher />
          </div>
        </div>
        <div className="px-3">
          <div
            role="search"
            className="flex items-center gap-2 rounded-full bg-paper-warm/90 px-3 py-1.5 text-xs text-ink-muted ring-1 ring-stone-line/40"
          >
            <SearchIcon />
            <span aria-label={`Search ${BRAND.cityShort}`}>
              Search {BRAND.cityShort}
            </span>
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
    <svg width="13" height="13" viewBox="0 0 13 13" fill="none" aria-hidden="true">
      <circle cx="5.5" cy="5.5" r="3.8" stroke="currentColor" strokeWidth="1.2" />
      <path d="M9 9l3 3" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" />
    </svg>
  );
}

function MoonIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M21 12.79A9 9 0 1111.21 3a7 7 0 109.79 9.79z" />
    </svg>
  );
}

function SunIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <circle cx="12" cy="12" r="5" />
      <path d="M12 1v2M12 21v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M1 12h2M21 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42" />
    </svg>
  );
}
