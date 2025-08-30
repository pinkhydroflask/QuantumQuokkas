import { Platform } from "react-native";
import Constants from "expo-constants";

// Runtime config from app.json → expo.extra
type Extra = { EXPO_PUBLIC_API_BASE?: string };
const extra = (Constants.expoConfig?.extra || {}) as Extra;

/**
 * API base resolver:
 * 1. If app.json has EXPO_PUBLIC_API_BASE → use that (Cloudflare tunnel, prod)
 * 2. Otherwise fallback depending on platform:
 *    - iOS simulator → localhost
 *    - Android emulator → 10.0.2.2
 *    - Physical device (LAN dev) → replace with your Mac LAN IP
 */
function resolveApiBase(): string {
  if (extra.EXPO_PUBLIC_API_BASE) {
    return extra.EXPO_PUBLIC_API_BASE;
  }

  if (__DEV__) {
    if (Platform.OS === "android") return "http://10.0.2.2:8000";
    if (Platform.OS === "ios") return "http://localhost:8000";
    // default fallback for real devices in dev (Wi-Fi or hotspot IP of your Mac)
    return "http://172.20.10.6:8000"; 
  }

  // final fallback (should always be overridden in prod)
  return "http://localhost:8000";
}

export const API_BASE_URL = resolveApiBase();

export const API_ENDPOINTS = {
  aiComplete: `${API_BASE_URL}/ai/complete`,
  aiVision: `${API_BASE_URL}/ai/vision`,
  receiptsProcess: `${API_BASE_URL}/receipts/process`,
  receiptsVerify: `${API_BASE_URL}/receipts/verify`,
  auditExport: `${API_BASE_URL}/audit/export`,
  imageBlur: `${API_BASE_URL}/image/blur`,
} as const;

console.log(">>> API_BASE_URL:", API_BASE_URL);
