import type { SharedList, SharedListPayload } from "@/lib/data/types";

export function encodeListPayload(
  list: SharedList,
  displayName?: string,
): string {
  const payload: SharedListPayload = {
    v: 1,
    n: list.name,
    ...(list.description ? { d: list.description } : {}),
    ...(list.emoji !== "📍" ? { e: list.emoji } : {}),
    p: list.placeIds,
    ...(displayName ? { by: displayName } : {}),
  };
  const json = JSON.stringify(payload);
  // base64url encode (browser-safe, no padding)
  const b64 = btoa(
    Array.from(new TextEncoder().encode(json), (b) =>
      String.fromCharCode(b),
    ).join(""),
  )
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=+$/, "");
  return b64;
}

export function decodeListPayload(
  encoded: string,
): SharedListPayload | null {
  try {
    // Restore base64 from base64url
    let b64 = encoded.replace(/-/g, "+").replace(/_/g, "/");
    while (b64.length % 4) b64 += "=";
    const binary = atob(b64);
    const bytes = Uint8Array.from(binary, (c) => c.charCodeAt(0));
    const json = new TextDecoder().decode(bytes);
    const parsed = JSON.parse(json);
    if (
      parsed &&
      parsed.v === 1 &&
      typeof parsed.n === "string" &&
      Array.isArray(parsed.p)
    ) {
      return parsed as SharedListPayload;
    }
    return null;
  } catch {
    return null;
  }
}

export function buildShareUrl(list: SharedList, displayName?: string): string {
  const data = encodeListPayload(list, displayName);
  const base =
    typeof window !== "undefined"
      ? `${window.location.origin}${window.location.pathname}`
      : "";
  return `${base}#list=${data}`;
}

export async function shareList(
  list: SharedList,
  displayName?: string,
): Promise<"shared" | "copied" | "failed"> {
  const url = buildShareUrl(list, displayName);

  if (
    typeof navigator !== "undefined" &&
    navigator.share &&
    // navigator.share is only available in secure contexts on mobile
    navigator.canShare?.({ url })
  ) {
    try {
      await navigator.share({
        title: `${list.emoji} ${list.name} — Trove`,
        text: `Check out my list "${list.name}" on Trove`,
        url,
      });
      return "shared";
    } catch {
      // User cancelled or error — fall through to clipboard
    }
  }

  try {
    await navigator.clipboard.writeText(url);
    return "copied";
  } catch {
    return "failed";
  }
}
