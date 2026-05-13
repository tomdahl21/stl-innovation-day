"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { useAppStore } from "@/lib/data/store";
import { ClusterMark } from "@/components/cluster-mark";
import { cn } from "@/lib/cn";

type Card = {
  eyebrow: string;
  title: string;
  body: string;
  Visual: () => React.JSX.Element;
};

const CARDS: Card[] = [
  {
    eyebrow: "Hyperlocal by design",
    title: "A St. Louis built by St. Louisans.",
    body: "Every pin earned its place from someone who showed up. The map is written by the people who live here — not by a national directory.",
    Visual: ConstellationVisual,
  },
  {
    eyebrow: "Every pin attributed",
    title: "Every gem has an owner.",
    body: "No anonymous additions, ever. Trust is earned and visible — founding members, verified locals, the people who put it on the map.",
    Visual: ContributorVisual,
  },
  {
    eyebrow: "Yours, not the algorithm's",
    title: "Keep your own version of the city.",
    body: "Mark what you've been to, what you want to try, what you'd send a friend to. Your logbook is private by default — and shareable on demand.",
    Visual: LogbookVisual,
  },
  {
    eyebrow: "Share what only locals know",
    title: "Send a friend a corner of the city.",
    body: "Curate a list of your gems, send the link. They open it, browse the pins, save what they like — no account needed.",
    Visual: ShareVisual,
  },
];

export function OnboardingCards() {
  const router = useRouter();
  const markSeen = useAppStore((s) => s.markOnboardingSeen);
  const [active, setActive] = useState(0);
  const scrollerRef = useRef<HTMLDivElement>(null);

  // Track active card on scroll. scroll-snap makes this snap to whole numbers.
  useEffect(() => {
    const el = scrollerRef.current;
    if (!el) return;
    const onScroll = () => {
      const idx = Math.round(el.scrollLeft / el.clientWidth);
      setActive(idx);
    };
    el.addEventListener("scroll", onScroll, { passive: true });
    return () => el.removeEventListener("scroll", onScroll);
  }, []);

  const scrollToCard = (i: number) => {
    const el = scrollerRef.current;
    if (!el) return;
    el.scrollTo({ left: i * el.clientWidth, behavior: "smooth" });
  };

  const finish = () => {
    markSeen();
    router.push("/");
  };

  const isLast = active === CARDS.length - 1;

  return (
    <div className="flex h-full flex-col bg-paper">
      <header className="flex shrink-0 items-center justify-between px-5 py-4">
        <ClusterMark size={32} />
        <button
          onClick={finish}
          className="text-[10px] font-medium uppercase tracking-[0.14em] text-ink-muted hover:text-ink"
        >
          Skip
        </button>
      </header>

      <div
        ref={scrollerRef}
        className="flex flex-1 snap-x snap-mandatory overflow-x-auto overflow-y-hidden [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden"
      >
        {CARDS.map((card, i) => {
          const Visual = card.Visual;
          return (
            <section
              key={i}
              className="flex h-full w-full shrink-0 snap-center flex-col items-center justify-center px-6"
              aria-roledescription="onboarding card"
              aria-label={card.title}
            >
              <div className="flex h-[44%] w-full max-w-md items-center justify-center">
                <Visual />
              </div>
              <div className="mt-6 max-w-sm text-center">
                <div className="eyebrow text-[10px] !text-brick">
                  {card.eyebrow}
                </div>
                <h2 className="serif-display mt-3 text-[34px] text-ink sm:text-[42px]">
                  {card.title}
                </h2>
                <p className="mt-4 font-serif text-[15px] italic leading-relaxed text-ink-soft sm:text-base">
                  {card.body}
                </p>
              </div>
            </section>
          );
        })}
      </div>

      <footer className="flex shrink-0 flex-col items-center gap-5 px-5 pb-8 pt-4">
        <div className="flex gap-1.5" role="tablist" aria-label="Onboarding progress">
          {CARDS.map((_, i) => (
            <button
              key={i}
              onClick={() => scrollToCard(i)}
              role="tab"
              aria-selected={i === active}
              aria-label={`Card ${i + 1} of ${CARDS.length}`}
              className={cn(
                "h-1.5 rounded-full transition-all",
                i === active ? "w-6 bg-brick" : "w-1.5 bg-stone-line hover:bg-ink-muted",
              )}
            />
          ))}
        </div>

        <button
          onClick={isLast ? finish : () => scrollToCard(active + 1)}
          className={cn(
            "w-full max-w-xs rounded-full px-6 py-3 text-sm font-medium transition-colors",
            isLast
              ? "bg-brick text-paper hover:bg-brick-deep"
              : "border border-ink/25 bg-surface text-ink hover:border-ink/50 hover:bg-paper-warm",
          )}
        >
          {isLast ? "Open the map" : "Continue"}
        </button>
      </footer>
    </div>
  );
}

// ---- Visuals ----

// Card 1: cluster mark anchored in a constellation of archetype dots, with a
// dashed "metro boundary" ring. Lightly animated via the existing trove-pulse
// keyframe in globals.css.
function ConstellationVisual() {
  const dots = [
    { left: "8%", top: "20%", size: 8, color: "#c47956" }, // eatery
    { left: "20%", top: "62%", size: 10, color: "#34503C" }, // outdoors
    { left: "82%", top: "18%", size: 9, color: "#6f8a96" }, // shop
    { left: "88%", top: "70%", size: 7, color: "#4a3a62" }, // drink
    { left: "62%", top: "85%", size: 8, color: "#8a7042" }, // venue
    { left: "10%", top: "85%", size: 6, color: "#5a3a22" }, // curio
  ];
  return (
    <div className="relative h-56 w-56">
      <div
        className="absolute inset-2 rounded-full border border-dashed border-stone-line/70"
        aria-hidden
      />
      <div
        className="absolute inset-10 rounded-full border border-dashed border-stone-line/40"
        aria-hidden
      />
      {dots.map((d, i) => (
        <div
          key={i}
          aria-hidden
          className="absolute rounded-full shadow-[0_2px_6px_-1px_rgba(26,22,18,0.25)]"
          style={{
            left: d.left,
            top: d.top,
            width: d.size,
            height: d.size,
            background: d.color,
            animation: `trove-pulse 3.6s ease-in-out ${i * 0.4}s infinite`,
          }}
        />
      ))}
      <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2">
        <ClusterMark size={132} />
      </div>
    </div>
  );
}

// Card 2: a stylized place card with a dashed connector to a contributor pill —
// "every gem has an owner." Mildly rotated for a scrapbook feel.
function ContributorVisual() {
  return (
    <div className="relative h-56 w-[280px]">
      {/* place card */}
      <div className="absolute left-0 top-0 w-44 -rotate-[3deg] overflow-hidden rounded-lg bg-surface shadow-[0_14px_28px_-14px_rgba(26,22,18,0.35)] ring-1 ring-stone-line/60">
        <div
          className="h-20"
          style={{
            background:
              "linear-gradient(135deg, #c47956 0%, #8A3920 100%), radial-gradient(circle at 30% 40%, rgba(255,255,255,0.18), transparent 60%)",
          }}
        />
        <div className="px-3 py-2">
          <div className="eyebrow text-[9px] !text-brick">
            Eatery · Old North
          </div>
          <div className="serif-heading mt-0.5 text-[15px] text-ink">
            Crown Candy Kitchen
          </div>
          <div className="mt-1 text-[10px] text-ink-muted">12 saves</div>
        </div>
      </div>
      {/* dashed connector */}
      <svg
        className="absolute left-[156px] top-[60px] h-16 w-28"
        viewBox="0 0 110 70"
        fill="none"
        aria-hidden
      >
        <path
          d="M0 5 Q 50 5 60 35 T 108 65"
          stroke="var(--ink-muted)"
          strokeWidth="1.2"
          strokeDasharray="3 4"
          strokeLinecap="round"
        />
      </svg>
      {/* contributor pill */}
      <div className="absolute bottom-0 right-0 flex rotate-[2deg] items-center gap-2 rounded-full bg-surface px-3 py-1.5 shadow-[0_10px_22px_-10px_rgba(26,22,18,0.35)] ring-1 ring-stone-line/60">
        <span className="flex h-7 w-7 items-center justify-center rounded-full bg-moss text-[11px] font-medium text-paper">
          TM
        </span>
        <span className="flex flex-col">
          <span className="text-[12px] font-medium leading-tight text-ink">
            Tomás Mendez
          </span>
          <span className="text-[8px] font-medium uppercase tracking-[0.12em] text-brick">
            Founding member
          </span>
        </span>
      </div>
    </div>
  );
}

// Card 3: three stacked logbook rows with Been/Want/Saved chips.
function LogbookVisual() {
  const rows = [
    {
      name: "City Museum",
      note: "weekend favorite",
      chip: "Been there",
      chipCls: "bg-ink text-paper",
      thumb: "linear-gradient(135deg, #6f8a96, #2d4856)",
      rotate: "-2deg",
    },
    {
      name: "Tower Grove Park",
      note: "spring picnic",
      chip: "Want to go",
      chipCls: "bg-brick text-paper",
      thumb: "linear-gradient(135deg, #6a8a72, #34503C)",
      rotate: "1deg",
    },
    {
      name: "Crown Candy Kitchen",
      note: "BLT and a malt",
      chip: "Saved",
      chipCls: "bg-paper-shade text-ink",
      thumb: "linear-gradient(135deg, #c47956, #8A3920)",
      rotate: "-1deg",
    },
  ];
  return (
    <div className="flex flex-col items-stretch gap-2.5">
      {rows.map((r, i) => (
        <div
          key={i}
          className="flex w-[280px] items-center gap-3 rounded-lg bg-surface p-2 shadow-[0_10px_22px_-12px_rgba(26,22,18,0.3)] ring-1 ring-stone-line/60"
          style={{ transform: `rotate(${r.rotate})` }}
        >
          <div
            className="h-10 w-10 shrink-0 rounded"
            style={{ background: r.thumb }}
            aria-hidden
          />
          <div className="min-w-0 flex-1">
            <div className="truncate text-[12px] font-medium text-ink">
              {r.name}
            </div>
            <div className="truncate font-serif text-[11px] italic text-ink-muted">
              {r.note}
            </div>
          </div>
          <span
            className={cn(
              "shrink-0 rounded-full px-2 py-0.5 text-[9px] font-medium uppercase tracking-[0.1em]",
              r.chipCls,
            )}
          >
            {r.chip}
          </span>
        </div>
      ))}
    </div>
  );
}

// Card 4: a list card transforms into a shareable URL pill via an arrow.
function ShareVisual() {
  return (
    <div className="flex items-center gap-4">
      <div className="w-[148px] -rotate-[2deg] rounded-lg bg-surface p-3 shadow-[0_12px_24px_-12px_rgba(26,22,18,0.3)] ring-1 ring-stone-line/60">
        <div className="text-xl">🥖</div>
        <div className="serif-heading mt-1.5 text-[14px] leading-tight text-ink">
          A weekend in the Hill
        </div>
        <div className="mt-1.5 text-[10px] uppercase tracking-[0.12em] text-ink-muted">
          7 places · curated
        </div>
        <div className="mt-2 flex gap-1">
          {["#c47956", "#8a7042", "#34503C", "#6f8a96"].map((c, i) => (
            <span
              key={i}
              className="h-1.5 w-5 rounded-full"
              style={{ background: c }}
              aria-hidden
            />
          ))}
        </div>
      </div>
      <svg
        width="34"
        height="20"
        viewBox="0 0 34 20"
        className="shrink-0 text-ink-muted"
        aria-hidden
      >
        <path
          d="M2 10 L 26 10 M 20 4 L 26 10 L 20 16"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
      <div className="flex rotate-[1.5deg] items-center gap-2 rounded-full bg-paper-warm px-3 py-2 ring-1 ring-stone-line/60">
        <svg
          width="13"
          height="13"
          viewBox="0 0 13 13"
          className="shrink-0 text-brick"
          aria-hidden
        >
          <path
            d="M5.5 7.5 L 7.5 5.5 M 5.5 3.5 L 4.5 3.5 A 3 3 0 0 0 4.5 9.5 L 5.5 9.5 M 7.5 9.5 L 8.5 9.5 A 3 3 0 0 0 8.5 3.5 L 7.5 3.5"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.4"
            strokeLinecap="round"
          />
        </svg>
        <span className="font-mono text-[10px] text-ink-soft">
          trove.app/l/wknd-hill
        </span>
      </div>
    </div>
  );
}
