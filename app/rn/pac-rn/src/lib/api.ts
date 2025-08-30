// app/rn/pac-rn/src/lib/api.ts
import { Platform } from "react-native";
import Constants from "expo-constants";

/** Read runtime config from app.json -> expo.extra */
type Extra = { EXPO_PUBLIC_API_BASE?: string };
const extra = (Constants.expoConfig?.extra || {}) as Extra;

/**
 * Resolve a sensible API base across:
 * - Real devices (dev/prod): use EXPO_PUBLIC_API_BASE from app.json (preferred)
 * - iOS simulator: http://localhost:8000
 * - Android emulator: http://10.0.2.2:8000
 * - Final fallback for real devices during dev: your hotspot/LAN IP
 */
function resolveApiBase(): string {
  // 1) Prefer value provided via app.json (expo.extra) or EAS env
  if (extra.EXPO_PUBLIC_API_BASE) return String(extra.EXPO_PUBLIC_API_BASE);

  // 2) Defaults for emulators/simulator during local dev
  if (__DEV__) {
    if (Platform.OS === "android") return "http://10.0.2.2:8000";
    return "http://localhost:8000"; // iOS simulator
  }

  // 3) Fallback for real devices in dev (replace with your Mac IP if needed)
  return "http://172.20.10.6:8000";
}

export const API_BASE = resolveApiBase();
console.log(">>> Using API_BASE:", API_BASE);

/** POST helper with timeout and clearer errors */
export async function postJSON<T>(
  path: string,
  body: unknown,
  timeoutMs = 15000
): Promise<T> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);

  try {
    const res = await fetch(`${API_BASE}${path}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
      signal: controller.signal,
    });

    if (!res.ok) {
      const text = await res.text().catch(() => "");
      throw new Error(`HTTP ${res.status} ${text}`);
    }
    return (await res.json()) as T;
  } finally {
    clearTimeout(timer);
  }
}
