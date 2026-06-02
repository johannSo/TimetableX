export type TrackingConsent = "pending" | "accepted" | "rejected";

export const TRACKING_CONSENT_COOKIE = "timetablex_tracking_consent";
const MAX_AGE_SECONDS = 60 * 60 * 24 * 365;

export function readTrackingConsent(): TrackingConsent {
  if (typeof document === "undefined") return "pending";

  const match = document.cookie
    .split("; ")
    .find((entry) => entry.startsWith(`${TRACKING_CONSENT_COOKIE}=`));

  if (!match) return "pending";

  const value = decodeURIComponent(match.split("=").slice(1).join("="));
  if (value === "accepted" || value === "rejected") return value;
  return "pending";
}

export function writeTrackingConsent(consent: Exclude<TrackingConsent, "pending">) {
  if (typeof document === "undefined") return;

  document.cookie = `${TRACKING_CONSENT_COOKIE}=${encodeURIComponent(consent)}; max-age=${MAX_AGE_SECONDS}; path=/; samesite=lax`;
}
