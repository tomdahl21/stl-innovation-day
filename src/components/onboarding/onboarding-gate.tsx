"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAppStore } from "@/lib/data/store";

// First-launch redirect helper. Mounted on the home page; renders nothing.
// Waits for the persist middleware to hydrate before reading the flag so
// returning users don't get a flash-redirect from the default `false`.
export function OnboardingGate() {
  const router = useRouter();

  useEffect(() => {
    const check = () => {
      if (!useAppStore.getState().hasSeenOnboarding) {
        router.replace("/onboarding");
      }
    };

    if (useAppStore.persist.hasHydrated()) {
      check();
      return;
    }
    return useAppStore.persist.onFinishHydration(check);
  }, [router]);

  return null;
}
