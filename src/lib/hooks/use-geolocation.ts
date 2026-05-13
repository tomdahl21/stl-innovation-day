"use client";

import { useEffect, useRef } from "react";
import { useAppStore } from "@/lib/data/store";

/**
 * Starts watching the user's geolocation and writes updates to the store.
 * Call once near the app root (e.g. in MapScreen).
 */
export function useGeolocation() {
  const setUserLocation = useAppStore((s) => s.setUserLocation);
  const setGeoStatus = useAppStore((s) => s.setGeoStatus);
  const watchIdRef = useRef<number | null>(null);

  useEffect(() => {
    if (!navigator.geolocation) {
      setGeoStatus("denied");
      return;
    }

    setGeoStatus("pending");

    watchIdRef.current = navigator.geolocation.watchPosition(
      (pos) => {
        setUserLocation(pos.coords.latitude, pos.coords.longitude);
      },
      (err) => {
        if (err.code === err.PERMISSION_DENIED) {
          setGeoStatus("denied");
        }
        // For POSITION_UNAVAILABLE or TIMEOUT keep status as pending —
        // the browser may retry automatically.
      },
      { enableHighAccuracy: true, maximumAge: 30_000, timeout: 10_000 },
    );

    return () => {
      if (watchIdRef.current !== null) {
        navigator.geolocation.clearWatch(watchIdRef.current);
      }
    };
  }, [setUserLocation, setGeoStatus]);
}
