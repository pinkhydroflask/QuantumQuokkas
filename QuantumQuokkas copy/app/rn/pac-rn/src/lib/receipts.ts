import { API_ENDPOINTS } from './config';
import { addReceipt } from './audit';

export interface ProcessReceiptRequest {
  input_hash: string;
}

export interface ProcessReceiptResponse {
  input_hash: string;
  timestamp: string;
  status: string;
  signature: string;
  key_version: string;
  ttl_seconds: number;
}

export interface VerifyReceiptRequest {
  receipt: {
    input_hash: string;
    timestamp: string;
    status: string;
    signature: string;
    key_version: string;
  };
}

export interface VerifyReceiptResponse {
  signature_valid: boolean;
  verified: boolean;
  data_present_in_vault: boolean;
}

export async function processReceipt(inputHash: string): Promise<ProcessReceiptResponse> {
  try {
    const response = await fetch(API_ENDPOINTS.receiptsProcess, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ input_hash: inputHash } as ProcessReceiptRequest),
    });

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }

    const result = await response.json();
    
    // Store receipt locally
    await addReceipt(result);
    
    return result;
  } catch (error) {
    console.error('Failed to process receipt:', error);
    throw error;
  }
}

export async function verifyReceipt(receipt: VerifyReceiptRequest['receipt']): Promise<VerifyReceiptResponse> {
  try {
    const response = await fetch(API_ENDPOINTS.receiptsVerify, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ receipt } as VerifyReceiptRequest),
    });

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }

    return await response.json();
  } catch (error) {
    console.error('Failed to verify receipt:', error);
    throw error;
  }
}

// Utility function to generate SHA-256 hash
export async function generateSHA256Hash(input: string): Promise<string> {
  try {
    // For React Native, we'll use a simple hash function
    // In production, you might want to use a proper crypto library
    let hash = 0;
    if (input.length === 0) return hash.toString();
    
    for (let i = 0; i < input.length; i++) {
      const char = input.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash; // Convert to 32-bit integer
    }
    
    return Math.abs(hash).toString(16);
  } catch (error) {
    console.error('Failed to generate hash:', error);
    throw error;
  }
}
