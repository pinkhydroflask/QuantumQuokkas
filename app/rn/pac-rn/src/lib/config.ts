import Constants from 'expo-constants';

// Detect if running on device vs simulator/web
const isDevice = Constants.appOwnership === 'standalone' || Constants.appOwnership === 'expo';

// For device: use LAN IP; for simulator/web: use localhost
export const API_BASE_URL = isDevice 
  ? 'http://192.168.1.100:8000'  // Update this to your Mac's LAN IP
  : 'http://localhost:8000';

export const API_ENDPOINTS = {
  aiComplete: `${API_BASE_URL}/ai/complete`,
  aiVision: `${API_BASE_URL}/ai/vision`,
  receiptsProcess: `${API_BASE_URL}/receipts/process`,
  receiptsVerify: `${API_BASE_URL}/receipts/verify`,
  auditExport: `${API_BASE_URL}/audit/export`,
  imageBlur: `${API_BASE_URL}/image/blur`,
} as const;
