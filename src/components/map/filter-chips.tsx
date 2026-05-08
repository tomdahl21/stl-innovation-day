"use client";

import { archetypeOrder, archetypes, type ArchetypeName } from "@/archetypes";
import { useAppStore } from "@/lib/data/store";
import { cn } from "@/lib/cn";

export function FilterChips() {
  const archetypeFilter = useAppStore((s) => s.archetypeFilter);
  const toggleArchetype = useAppStore((s) => s.toggleArchetype);
  const setArchetypeFilter = useAppStore((s) => s.setArchetypeFilter);

  const isAll = archetypeFilter === null;
  const isActive = (name: ArchetypeName) =>
    !isAll && archetypeFilter!.includes(name);

  return (
    <div
      className="flex gap-1.5 overflow-x-auto px-3 py-2"
      style={{ scrollbarWidth: "none" }}
    >
      <Chip active={isAll} onClick={() => setArchetypeFilter(null)}>
        All
      </Chip>
      {archetypeOrder.map((name) => (
        <Chip
          key={name}
          active={isActive(name)}
          onClick={() => toggleArchetype(name)}
        >
          {archetypes[name].label}
        </Chip>
      ))}
    </div>
  );
}

function Chip({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      onClick={onClick}
      className={cn(
        "shrink-0 whitespace-nowrap rounded-full border px-3 py-1 text-xs font-medium transition-colors",
        active
          ? "bg-ink text-paper border-ink"
          : "bg-paper-warm/90 text-ink-soft border-stone-line hover:border-ink/40",
      )}
    >
      {children}
    </button>
  );
}
