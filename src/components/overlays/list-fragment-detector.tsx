"use client";

import { useEffect } from "react";
import { useAppStore } from "@/lib/data/store";
import { decodeListPayload } from "@/lib/data/list-sharing";

export function ListFragmentDetector() {
  const setOverlay = useAppStore((s) => s.setOverlay);
  const setPendingImport = useAppStore((s) => s.setPendingImport);

  useEffect(() => {
    const hash = window.location.hash;
    if (hash.startsWith("#list=")) {
      const encoded = hash.slice(6);
      const payload = decodeListPayload(encoded);
      if (payload) {
        setPendingImport(payload);
        setOverlay("list-import");
      }
      // Clean the URL without triggering a reload
      history.replaceState(null, "", window.location.pathname);
    }
  }, [setOverlay, setPendingImport]);

  return null;
}
