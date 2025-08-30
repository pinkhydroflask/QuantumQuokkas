import Constants from "expo-constants";

// Read runtime config from app.json → expo.extra
type Extra = { EXPO_PUBLIC_API_BASE?: string };
const extra = (Constants.expoConfig?.extra || {}) as Extra;

// Base URL always comes from app.json (or fallback)
export const API_BASE_URL =
  extra.EXPO_PUBLIC_API_BASE ||
  "http://localhost:8000"; // fallback for dev if extra not set

export const API_ENDPOINTS = {
  aiComplete: `${API_BASE_URL}/ai/complete`,
  aiVision: `${API_BASE_URL}/ai/vision`,
  receiptsProcess: `${API_BASE_URL}/receipts/process`,
  receiptsVerify: `${API_BASE_URL}/receipts/verify`,
  auditExport: `${API_BASE_URL}/audit/export`,
  imageBlur: `${API_BASE_URL}/image/blur`,
} as const;

console.log(">>> API_BASE_URL:", API_BASE_URL);
