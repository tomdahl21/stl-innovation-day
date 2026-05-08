"use client";

import { useAppStore } from "@/lib/data/store";
import { getPersona } from "@/lib/data/personas";
import { useAllPlaces } from "@/lib/data/places";

export function ProfileStub() {
  const overlay = useAppStore((s) => s.overlay);
  const setOverlay = useAppStore((s) => s.setOverlay);
  const activePersonaId = useAppStore((s) => s.activePersonaId);
  const logbook = useAppStore((s) => s.logbook);

  const allPlaces = useAllPlaces();
  if (overlay !== "profile") return null;
  const persona = getPersona(activePersonaId);
  if (!persona) return null;

  const contributions = allPlaces.filter((p) => p.contributorId === persona.id);
  const logbookCount = Object.keys(logbook).length;

  return (
    <div className="absolute inset-0 z-40 flex flex-col bg-surface">
      <div className="flex items-center justify-between border-b border-stone-line px-5 pt-5 pb-3">
        <h2 className="serif-heading text-2xl text-ink">Profile</h2>
        <button
          onClick={() => setOverlay(null)}
          className="text-sm text-ink-muted hover:text-ink"
        >
          Close
        </button>
      </div>

      <div className="flex-1 overflow-y-auto px-5 py-5">
        <div className="flex items-center gap-3">
          <div className="flex h-14 w-14 items-center justify-center rounded-full bg-moss text-base font-medium text-paper">
            {persona.initials}
          </div>
          <div>
            <div className="serif-heading text-xl text-ink">
              {persona.displayName}
            </div>
            <div className="mt-0.5 flex items-center gap-2">
              {persona.tier === "founding" && (
                <span className="rounded-full bg-brick px-2 py-0.5 text-[9px] font-medium uppercase tracking-[0.12em] text-paper">
                  Founding
                </span>
              )}
              {persona.tier === "verified" && (
                <span className="rounded-full bg-moss px-2 py-0.5 text-[9px] font-medium uppercase tracking-[0.12em] text-paper">
                  Verified local
                </span>
              )}
              <span className="text-[10px] uppercase tracking-[0.12em] text-ink-muted">
                Joined {new Date(persona.joinedAt).toLocaleDateString("en-US", { month: "short", year: "numeric" })}
              </span>
            </div>
          </div>
        </div>

        {persona.bio && (
          <p className="mt-4 font-serif text-[14px] italic leading-relaxed text-ink-soft">
            {persona.bio}
          </p>
        )}

        <div className="mt-6 grid grid-cols-2 gap-3">
          <Stat value={contributions.length} label="Gems contributed" />
          <Stat value={logbookCount} label="In your logbook" />
        </div>
      </div>
    </div>
  );
}

function Stat({ value, label }: { value: number; label: string }) {
  return (
    <div className="rounded-lg border border-stone-line bg-paper-warm/40 px-4 py-3">
      <div className="serif-heading text-2xl text-ink">{value}</div>
      <div className="mt-0.5 text-[10px] uppercase tracking-[0.14em] text-ink-muted">
        {label}
      </div>
    </div>
  );
}
