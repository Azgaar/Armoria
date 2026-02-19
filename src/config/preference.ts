/**
 * Preference system configuration.
 *
 * The API URL is resolved in this order:
 * 1. Build-time injection via process.env.PREFERENCE_API_URL (Rollup replace plugin)
 * 2. Empty string (same-origin) — the FastAPI server serves both the API and
 *    the static frontend, so no cross-origin requests are needed.
 *
 * To override at build time, set the PREFERENCE_API_URL environment variable
 * before running `npm run dev` or `npm run build`.
 */

declare const process: {env: Record<string, string | undefined>};

function resolveApiUrl(): string {
  try {
    const envValue =
      typeof process !== "undefined" && process.env && process.env.PREFERENCE_API_URL;
    if (envValue) return envValue;
  } catch {
    // process may not exist in browser context
  }

  // Same-origin: API is served from the same host/port as the frontend
  return "";
}

export const PREFERENCE_API_URL: string = resolveApiUrl();