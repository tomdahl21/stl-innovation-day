"use client";

import { useEffect, useState } from "react";
import { useAppStore } from "@/lib/data/store";
import {
  archetypeOrder,
  archetypes,
  type ArchetypeField,
  type ArchetypeName,
} from "@/archetypes";
import { ClusterMark } from "@/components/cluster-mark";
import { cn } from "@/lib/cn";

export function AddFlow() {
  const overlay = useAppStore((s) => s.overlay);
  const setOverlay = useAppStore((s) => s.setOverlay);
  const draft = useAppStore((s) => s.draft);
  const resetDraft = useAppStore((s) => s.resetDraft);
  const setDraftArchetype = useAppStore((s) => s.setDraftArchetype);
  const patchDraft = useAppStore((s) => s.patchDraft);
  const setDraftField = useAppStore((s) => s.setDraftField);
  const commitDraft = useAppStore((s) => s.commitDraft);
  const selectPlace = useAppStore((s) => s.selectPlace);

  // Reset the draft each time the user opens the Add tab fresh.
  useEffect(() => {
    if (overlay !== "add") {
      // leaving — keep state since user may navigate away briefly
      return;
    }
  }, [overlay]);

  if (overlay !== "add") return null;

  const close = () => {
    resetDraft();
    setOverlay(null);
  };

  // Step routing based on draft state.
  if (draft.archetype === null) {
    return (
      <ArchetypeStep
        onPick={(a) => setDraftArchetype(a)}
        onClose={close}
      />
    );
  }

  if (draft.lat === null || draft.lng === null) {
    return (
      <DropStep
        archetype={draft.archetype}
        onCancel={() => {
          // Back to archetype picker
          patchDraft({ archetype: null, archetypeData: {} });
        }}
        onClose={close}
      />
    );
  }

  return (
    <FormStep
      draft={draft}
      onChangeName={(name) => patchDraft({ name })}
      onChangeNeighborhood={(neighborhood) => patchDraft({ neighborhood })}
      onChangePitch={(pitch) => patchDraft({ pitch })}
      onChangeField={setDraftField}
      onClose={close}
      onResetPin={() => patchDraft({ lat: null, lng: null })}
      onSubmit={() => {
        const place = commitDraft();
        if (place) {
          setOverlay(null);
          selectPlace(place.id);
        }
      }}
    />
  );
}

/* ---------------------- Step 1: pick an archetype ---------------------- */

function ArchetypeStep({
  onPick,
  onClose,
}: {
  onPick: (a: ArchetypeName) => void;
  onClose: () => void;
}) {
  return (
    <div className="absolute inset-0 z-40 flex flex-col bg-surface">
      <div className="flex items-center justify-between border-b border-stone-line px-5 pt-5 pb-3">
        <div className="flex items-center gap-2">
          <ClusterMark size={24} />
          <h2 className="serif-heading text-2xl text-ink">Add a gem</h2>
        </div>
        <button
          onClick={onClose}
          aria-label="Close add gem"
          className="py-2 pl-4 text-sm text-ink-muted hover:text-ink"
        >
          Close
        </button>
      </div>

      <div className="flex-1 overflow-y-auto px-5 py-4">
        <p className="mb-4 font-serif text-[14px] italic leading-relaxed text-ink-soft">
          Pick what kind of place this is. The form changes per archetype so
          we ask the right questions.
        </p>

        <div className="grid grid-cols-2 gap-2.5 pb-6">
          {archetypeOrder.map((name) => (
            <button
              key={name}
              onClick={() => onPick(name)}
              aria-label={`Add ${archetypes[name].label}`}
              className="flex flex-col items-start gap-1.5 rounded-lg border border-stone-line bg-paper-warm/40 px-4 py-3.5 text-left transition-colors hover:border-ink/30 hover:bg-paper-warm/70"
            >
              <span className="eyebrow !text-brick">
                {archetypes[name].label}
              </span>
              <span className="font-serif text-[13px] italic leading-tight text-ink-soft">
                {archetypes[name].tagline}
              </span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

/* ---------------------- Step 2: drop the pin --------------------------- */

function DropStep({
  archetype,
  onCancel,
  onClose,
}: {
  archetype: ArchetypeName;
  onCancel: () => void;
  onClose: () => void;
}) {
  // Bottom sheet that doesn't cover the map — user drops a pin by tapping.
  return (
    <div className="pointer-events-none absolute inset-x-0 bottom-0 z-30 flex flex-col items-stretch">
      <div className="pointer-events-auto mx-3 mb-20 rounded-xl bg-surface p-4 shadow-[0_16px_36px_-14px_rgba(26,22,18,0.4)] ring-1 ring-stone-line/60">
        <div className="flex items-baseline justify-between">
          <div className="eyebrow !text-brick">
            {archetypes[archetype].label}
          </div>
          <button
            onClick={onClose}
            aria-label="Close"
            className="py-1 pl-4 text-xs text-ink-muted hover:text-ink"
          >
            Close
          </button>
        </div>
        <h3 className="serif-heading mt-1 text-xl text-ink">
          Tap the map where it sits
        </h3>
        <p className="mt-1.5 font-serif text-[13px] italic leading-snug text-ink-soft">
          Doesn&rsquo;t need to be exact — close enough is fine.
        </p>
        <button
          onClick={onCancel}
          className="mt-3 text-[11px] uppercase tracking-[0.14em] text-ink-muted hover:text-ink"
        >
          ← Pick a different archetype
        </button>
      </div>
    </div>
  );
}

/* ---------------------- Step 3: fill out the form ---------------------- */

function FormStep({
  draft,
  onChangeName,
  onChangeNeighborhood,
  onChangePitch,
  onChangeField,
  onResetPin,
  onClose,
  onSubmit,
}: {
  draft: ReturnType<typeof useAppStore.getState>["draft"];
  onChangeName: (v: string) => void;
  onChangeNeighborhood: (v: string) => void;
  onChangePitch: (v: string) => void;
  onChangeField: (field: string, value: unknown) => void;
  onResetPin: () => void;
  onClose: () => void;
  onSubmit: () => void;
}) {
  const archetype = draft.archetype as ArchetypeName;
  const meta = archetypes[archetype];
  const [submitted, setSubmitted] = useState(false);

  const canSubmit =
    draft.name.trim().length > 0 && draft.pitch.trim().length > 0;

  return (
    <div className="absolute inset-0 z-40 flex flex-col bg-surface">
      <div className="flex items-center justify-between border-b border-stone-line px-5 pt-5 pb-3">
        <div>
          <div className="eyebrow !text-brick">{meta.label}</div>
          <h2 className="serif-heading mt-0.5 text-2xl text-ink">
            About this gem
          </h2>
        </div>
        <button
          onClick={onClose}
          aria-label="Close form"
          className="py-2 pl-4 text-sm text-ink-muted hover:text-ink"
        >
          Close
        </button>
      </div>

      <div className="flex-1 overflow-y-auto px-5 py-4">
        {/* Pin location */}
        <div className="mb-4 flex items-baseline justify-between rounded-lg border border-stone-line bg-paper-warm/40 px-3 py-2">
          <div>
            <div className="eyebrow">Pin</div>
            <div className="font-mono text-[11px] text-ink-soft">
              {draft.lat?.toFixed(4)}, {draft.lng?.toFixed(4)}
            </div>
          </div>
          <button
            onClick={onResetPin}
            aria-label="Move pin location"
            className="text-[11px] uppercase tracking-[0.14em] text-ink-muted hover:text-brick"
          >
            Move pin
          </button>
        </div>

        <Field label="Name" required>
          <input
            value={draft.name}
            onChange={(e) => onChangeName(e.target.value)}
            placeholder="What's it called?"
            className="w-full rounded-md border border-stone-line bg-surface px-3 py-2 text-[14px] text-ink outline-none focus:border-ink/50"
          />
        </Field>

        <Field label="Neighborhood">
          <input
            value={draft.neighborhood}
            onChange={(e) => onChangeNeighborhood(e.target.value)}
            placeholder="The Hill, Cherokee Street, Soulard…"
            className="w-full rounded-md border border-stone-line bg-surface px-3 py-2 text-[14px] text-ink outline-none focus:border-ink/50"
          />
        </Field>

        <Field label="Why it's a gem" required>
          <textarea
            value={draft.pitch}
            onChange={(e) => onChangePitch(e.target.value)}
            placeholder="One or two sentences. Like you're telling a friend."
            rows={3}
            className="w-full resize-none rounded-md border border-stone-line bg-surface px-3 py-2 font-serif text-[13px] italic leading-relaxed text-ink-soft outline-none focus:border-ink/50"
          />
        </Field>

        {meta.fields.length > 0 && (
          <>
            <div className="eyebrow mt-5 mb-3">
              {meta.label} details
            </div>
            <div className="space-y-3">
              {meta.fields.map((f) => (
                <ArchetypeFieldInput
                  key={f.name}
                  field={f}
                  value={draft.archetypeData[f.name]}
                  onChange={(v) => onChangeField(f.name, v)}
                />
              ))}
            </div>
          </>
        )}
      </div>

      <div className="flex shrink-0 gap-2 border-t border-stone-line bg-surface px-5 py-3">
        <button
          onClick={onClose}
          aria-label="Cancel adding gem"
          className="flex-1 rounded-lg border border-stone-line bg-paper-warm px-3 py-3 text-[12px] font-medium text-ink hover:border-ink/30"
        >
          Cancel
        </button>
        <button
          onClick={() => {
            setSubmitted(true);
            if (canSubmit) onSubmit();
          }}
          disabled={!canSubmit && submitted}
          aria-disabled={!canSubmit && submitted}
          className={cn(
            "flex-[2] rounded-lg px-3 py-3 text-[12px] font-medium transition-colors",
            canSubmit
              ? "bg-brick text-paper hover:bg-brick-deep"
              : "bg-paper-warm text-ink-muted",
          )}
        >
          {canSubmit ? "Add to the map" : "Name + pitch required"}
        </button>
      </div>
    </div>
  );
}

function Field({
  label,
  required,
  children,
}: {
  label: string;
  required?: boolean;
  children: React.ReactNode;
}) {
  return (
    <label className="mb-3 block">
      <span className="eyebrow mb-1 block">
        {label}
        {required && <span className="ml-1 text-brick" aria-hidden="true">·</span>}
        {required && <span className="sr-only"> (required)</span>}
      </span>
      {children}
    </label>
  );
}

function ArchetypeFieldInput({
  field,
  value,
  onChange,
}: {
  field: ArchetypeField;
  value: unknown;
  onChange: (v: unknown) => void;
}) {
  if (field.type === "text") {
    return (
      <Field label={field.label}>
        <input
          value={typeof value === "string" ? value : ""}
          onChange={(e) => onChange(e.target.value)}
          placeholder={field.placeholder}
          className="w-full rounded-md border border-stone-line bg-surface px-3 py-2 text-[14px] text-ink outline-none focus:border-ink/50"
        />
      </Field>
    );
  }
  if (field.type === "select") {
    return (
      <Field label={field.label}>
        <div className="flex flex-wrap gap-1.5">
          {field.options.map((opt) => (
            <button
              key={opt}
              type="button"
              onClick={() => onChange(value === opt ? undefined : opt)}
              className={cn(
                "rounded-full border px-3 py-1 text-[11px] font-medium transition-colors",
                value === opt
                  ? "border-ink bg-ink text-paper"
                  : "border-stone-line bg-paper-warm/60 text-ink-soft hover:border-ink/30",
              )}
            >
              {opt}
            </button>
          ))}
        </div>
      </Field>
    );
  }
  // boolean
  return (
    <Field label={field.label}>
      <div className="flex gap-1.5">
        <button
          type="button"
          onClick={() => onChange(value === true ? undefined : true)}
          className={cn(
            "rounded-full border px-3 py-1 text-[11px] font-medium",
            value === true
              ? "border-ink bg-ink text-paper"
              : "border-stone-line bg-paper-warm/60 text-ink-soft",
          )}
        >
          {field.trueLabel ?? "Yes"}
        </button>
        <button
          type="button"
          onClick={() => onChange(value === false ? undefined : false)}
          className={cn(
            "rounded-full border px-3 py-1 text-[11px] font-medium",
            value === false
              ? "border-ink bg-ink text-paper"
              : "border-stone-line bg-paper-warm/60 text-ink-soft",
          )}
        >
          {field.falseLabel ?? "No"}
        </button>
      </div>
    </Field>
  );
}
