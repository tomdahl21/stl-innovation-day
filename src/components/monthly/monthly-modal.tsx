"use client";

import { useEffect, useRef, useState, useSyncExternalStore } from "react";
import { useAppStore } from "@/lib/data/store";
import { CURRENT_CAMPAIGN } from "@/lib/monthly-campaign";
import { cn } from "@/lib/cn";

// Subscribe to persist hydration without a setState-in-effect pattern.
// Returns false on the server / before hydration, true once localStorage has rehydrated.
function usePersistHydrated(): boolean {
  return useSyncExternalStore(
    (cb) => useAppStore.persist.onFinishHydration(cb),
    () => useAppStore.persist.hasHydrated(),
    () => false,
  );
}

export function MonthlyModal() {
  // Wait for persist hydration before deciding to render — otherwise users
  // who've already dismissed this campaign would see a flash of the modal
  // before localStorage rehydrates the seen-id.
  const hydrated = usePersistHydrated();
  const [active, setActive] = useState(0);
  const lastSeen = useAppStore((s) => s.lastMonthlyCampaignSeen);
  const markSeen = useAppStore((s) => s.setMonthlyCampaignSeen);
  const scrollerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = scrollerRef.current;
    if (!el) return;
    const onScroll = () => {
      const i = Math.round(el.scrollLeft / el.clientWidth);
      setActive(i);
    };
    el.addEventListener("scroll", onScroll, { passive: true });
    return () => el.removeEventListener("scroll", onScroll);
  }, [hydrated]);

  if (!hydrated || lastSeen === CURRENT_CAMPAIGN.id) return null;

  const close = () => markSeen(CURRENT_CAMPAIGN.id);

  const scrollToImage = (i: number) => {
    const el = scrollerRef.current;
    if (!el) return;
    el.scrollTo({ left: i * el.clientWidth, behavior: "smooth" });
  };

  return (
    <div
      className="absolute inset-0 z-[60] flex items-center justify-center bg-ink/45 px-4 backdrop-blur-[2px]"
      role="dialog"
      aria-modal="true"
      aria-labelledby="monthly-title"
    >
      <div className="relative flex max-h-[92vh] w-full max-w-md flex-col overflow-hidden rounded-2xl bg-surface shadow-[0_28px_60px_-20px_rgba(26,22,18,0.45)] ring-1 ring-stone-line/60">
        <button
          onClick={close}
          aria-label="Close monthly feature"
          className="absolute right-3 top-3 z-10 flex h-9 w-9 items-center justify-center rounded-full bg-paper/95 text-base text-ink shadow-md hover:bg-paper"
        >
          ×
        </button>

        {/* Swipeable image strip */}
        <div
          ref={scrollerRef}
          className="flex aspect-[4/3] shrink-0 snap-x snap-mandatory overflow-x-auto overflow-y-hidden bg-paper-warm [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
        >
          {CURRENT_CAMPAIGN.images.map((img, i) => (
            <div
              key={i}
              role="img"
              aria-label={img.alt}
              className="h-full w-full shrink-0 snap-center bg-cover bg-center"
              style={{ backgroundImage: `url("${img.url}")` }}
            />
          ))}
        </div>

        {/* Dots */}
        <div className="flex shrink-0 justify-center gap-1.5 bg-surface py-2.5">
          {CURRENT_CAMPAIGN.images.map((_, i) => (
            <button
              key={i}
              onClick={() => scrollToImage(i)}
              aria-label={`Photo ${i + 1} of ${CURRENT_CAMPAIGN.images.length}`}
              aria-current={i === active}
              className={cn(
                "h-1.5 rounded-full transition-all",
                i === active ? "w-5 bg-brick" : "w-1.5 bg-stone-line hover:bg-ink-muted",
              )}
            />
          ))}
        </div>

        {/* Copy */}
        <div className="flex-1 overflow-y-auto px-6 pb-4 pt-2">
          <div className="eyebrow text-[10px] !text-brick">
            {CURRENT_CAMPAIGN.eyebrow}
          </div>
          <h2
            id="monthly-title"
            className="serif-display mt-2 text-[26px] leading-[1.05] text-ink"
          >
            {CURRENT_CAMPAIGN.welcome}
          </h2>
          <h3 className="serif-heading mt-2 text-[20px] leading-tight text-ink">
            {CURRENT_CAMPAIGN.title}
          </h3>
          <p className="mt-3 font-serif text-[14px] italic leading-relaxed text-ink-soft">
            {CURRENT_CAMPAIGN.body}
          </p>
        </div>

        {/* Actions */}
        <div className="flex shrink-0 gap-2 border-t border-stone-line bg-surface px-5 py-3">
          <button
            onClick={close}
            className="flex-1 rounded-full border border-ink/25 px-4 py-2.5 text-xs font-medium text-ink hover:bg-paper-warm"
          >
            Not now
          </button>
          <button
            onClick={close}
            className="flex-1 rounded-full bg-brick px-4 py-2.5 text-xs font-medium text-paper hover:bg-brick-deep"
          >
            {CURRENT_CAMPAIGN.ctaLabel}
          </button>
        </div>
      </div>
    </div>
  );
}
