import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Sharing from 'expo-sharing';
import { API_ENDPOINTS } from './config';

export interface AuditEntry {
  id: string;
  timestamp: string;
  type: 'text' | 'image';
  redactions: string[];
  placeholders: Record<string, string>;
  policySnapshot: Record<string, any>;
}

export interface Receipt {
  input_hash: string;
  timestamp: string;
  status: string;
  signature: string;
  key_version: string;
  ttl_seconds: number;
}

// Local audit storage
const AUDIT_STORAGE_KEY = 'pac_audit_entries';
const RECEIPTS_STORAGE_KEY = 'pac_receipts';

export async function addAuditEntry(entry: Omit<AuditEntry, 'id'>): Promise<void> {
  try {
    const existing = await AsyncStorage.getItem(AUDIT_STORAGE_KEY);
    const entries: AuditEntry[] = existing ? JSON.parse(existing) : [];
    
    const newEntry: AuditEntry = {
      ...entry,
      id: `local_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    };
    
    entries.unshift(newEntry);
    await AsyncStorage.setItem(AUDIT_STORAGE_KEY, JSON.stringify(entries));
  } catch (error) {
    console.error('Failed to save audit entry:', error);
  }
}

export async function getAuditEntries(): Promise<AuditEntry[]> {
  try {
    const existing = await AsyncStorage.getItem(AUDIT_STORAGE_KEY);
    return existing ? JSON.parse(existing) : [];
  } catch (error) {
    console.error('Failed to get audit entries:', error);
    return [];
  }
}

export async function addReceipt(receipt: Receipt): Promise<void> {
  try {
    const existing = await AsyncStorage.getItem(RECEIPTS_STORAGE_KEY);
    const receipts: Receipt[] = existing ? JSON.parse(existing) : [];
    receipts.unshift(receipt);
    await AsyncStorage.setItem(RECEIPTS_STORAGE_KEY, JSON.stringify(receipts));
  } catch (error) {
    console.error('Failed to save receipt:', error);
  }
}

export async function getReceipts(): Promise<Receipt[]> {
  try {
    const existing = await AsyncStorage.getItem(RECEIPTS_STORAGE_KEY);
    return existing ? JSON.parse(existing) : [];
  } catch (error) {
    console.error('Failed to get receipts:', error);
    return [];
  }
}

// CSV Export functions
export async function exportLocalAuditCSV(): Promise<void> {
  try {
    const entries = await getAuditEntries();
    const csvContent = generateAuditCSV(entries);
    
    if (await Sharing.isAvailableAsync()) {
      await Sharing.shareAsync(
        createCSVBlob(csvContent),
        { mimeType: 'text/csv', dialogTitle: 'Export Audit Log' }
      );
    }
  } catch (error) {
    console.error('Failed to export local CSV:', error);
    throw error;
  }
}

export async function exportBackendAuditCSV(): Promise<void> {
  try {
    const response = await fetch(API_ENDPOINTS.auditExport);
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }
    
    const csvContent = await response.text();
    
    if (await Sharing.isAvailableAsync()) {
      await Sharing.shareAsync(
        createCSVBlob(csvContent),
        { mimeType: 'text/csv', dialogTitle: 'Export Backend Audit Log' }
      );
    }
  } catch (error) {
    console.error('Failed to export backend CSV:', error);
    throw error;
  }
}

function generateAuditCSV(entries: AuditEntry[]): string {
  const headers = ['ID', 'Timestamp', 'Type', 'Redactions', 'Placeholders', 'Policy'];
  const rows = entries.map(entry => [
    entry.id,
    entry.timestamp,
    entry.type,
    entry.redactions.join('; '),
    JSON.stringify(entry.placeholders),
    JSON.stringify(entry.policySnapshot),
  ]);
  
  return [headers, ...rows]
    .map(row => row.map(cell => `"${String(cell).replace(/"/g, '""')}"`).join(','))
    .join('\n');
}

function createCSVBlob(content: string): string {
  // For React Native, we'll create a temporary file path
  // This is a simplified version - in practice you might want to use expo-file-system
  return `data:text/csv;charset=utf-8,${encodeURIComponent(content)}`;
}
