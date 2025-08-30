import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert, RefreshControl } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Card } from '../components/Card';
import { theme } from '../theme';
import { getAuditEntries, getReceipts, exportLocalAuditCSV, exportBackendAuditCSV, AuditEntry, Receipt } from '../lib/audit';
import { processReceipt, verifyReceipt, generateSHA256Hash } from '../lib/receipts';
import useAppStore from '../store';

export default function Audit() {
  const [auditEntries, setAuditEntries] = useState<AuditEntry[]>([]);
  const [receipts, setReceipts] = useState<Receipt[]>([]);
  const [refreshing, setRefreshing] = useState(false);
  const [processingReceipt, setProcessingReceipt] = useState<string | null>(null);
  const [verifyingReceipt, setVerifyingReceipt] = useState<string | null>(null);
  
  const { setLoading, setError } = useAppStore();

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [entries, receiptsData] = await Promise.all([
        getAuditEntries(),
        getReceipts(),
      ]);
      setAuditEntries(entries);
      setReceipts(receiptsData);
    } catch (error) {
      console.error('Failed to load audit data:', error);
      setError('Failed to load audit data');
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadData();
    setRefreshing(false);
  };

  const handleExportLocalCSV = async () => {
    try {
      setLoading(true);
      await exportLocalAuditCSV();
      setError(null);
    } catch (error) {
      console.error('Export failed:', error);
      setError('Failed to export local CSV');
      Alert.alert('Export Failed', 'Failed to export local audit data.');
    } finally {
      setLoading(false);
    }
  };

  const handleExportBackendCSV = async () => {
    try {
      setLoading(true);
      await exportBackendAuditCSV();
      setError(null);
    } catch (error) {
      console.error('Export failed:', error);
      setError('Failed to export backend CSV');
      Alert.alert('Export Failed', 'Failed to export backend audit data. Please check your connection.');
    } finally {
      setLoading(false);
    }
  };

  const handleProcessReceipt = async (entry: AuditEntry) => {
    try {
      setProcessingReceipt(entry.id);
      setLoading(true);
      
      // Generate hash from entry data
      const entryData = JSON.stringify({
        timestamp: entry.timestamp,
        type: entry.type,
        redactions: entry.redactions,
      });
      const hash = await generateSHA256Hash(entryData);
      
      // Process receipt
      const receipt = await processReceipt(hash);
      Alert.alert('Receipt Created', `Receipt created with TTL: ${receipt.ttl_seconds}s`);
      
      // Reload data
      await loadData();
      setError(null);
    } catch (error) {
      console.error('Receipt processing failed:', error);
      setError('Failed to process receipt');
      Alert.alert('Error', 'Failed to process receipt. Please try again.');
    } finally {
      setProcessingReceipt(null);
      setLoading(false);
    }
  };

  const handleVerifyReceipt = async (receipt: Receipt) => {
    try {
      setVerifyingReceipt(receipt.input_hash);
      setLoading(true);
      
      const result = await verifyReceipt(receipt);
      
      let message = '';
      if (result.signature_valid) {
        message += '✅ Signature valid\n';
      } else {
        message += '❌ Signature invalid\n';
      }
      
      if (result.verified) {
        message += '✅ Receipt verified\n';
      } else {
        message += '❌ Receipt not verified\n';
      }
      
      if (result.data_present_in_vault) {
        message += '⚠️ Data still in vault\n';
      } else {
        message += '✅ Data not in vault\n';
      }
      
      Alert.alert('Receipt Verification', message);
      setError(null);
    } catch (error) {
      console.error('Receipt verification failed:', error);
      setError('Failed to verify receipt');
      Alert.alert('Error', 'Failed to verify receipt. Please try again.');
    } finally {
      setVerifyingReceipt(null);
      setLoading(false);
    }
  };

  const formatTimestamp = (timestamp: string) => {
    return new Date(timestamp).toLocaleString();
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView 
        contentContainerStyle={styles.scrollContent}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        <Card>
          <Text style={styles.sectionTitle}>Export Audit Data</Text>
          <View style={styles.exportButtons}>
            <TouchableOpacity
              style={[styles.button, styles.primaryButton]}
              onPress={handleExportLocalCSV}
            >
              <Text style={styles.buttonText}>Export CSV (Local)</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.button, styles.secondaryButton]}
              onPress={handleExportBackendCSV}
            >
              <Text style={styles.buttonText}>Export CSV (Backend)</Text>
            </TouchableOpacity>
          </View>
        </Card>

        <Card>
          <Text style={styles.sectionTitle}>Audit Entries ({auditEntries.length})</Text>
          {auditEntries.length === 0 ? (
            <Text style={styles.emptyText}>No audit entries found</Text>
          ) : (
            auditEntries.map((entry) => (
              <View key={entry.id} style={styles.entryItem}>
                <View style={styles.entryHeader}>
                  <Text style={styles.entryType}>{entry.type.toUpperCase()}</Text>
                  <Text style={styles.entryTimestamp}>{formatTimestamp(entry.timestamp)}</Text>
                </View>
                <Text style={styles.entryRedactions}>
                  Redactions: {entry.redactions.join(', ')}
                </Text>
                <TouchableOpacity
                  style={[styles.button, styles.smallButton]}
                  onPress={() => handleProcessReceipt(entry)}
                  disabled={processingReceipt === entry.id}
                >
                  <Text style={styles.buttonText}>
                    {processingReceipt === entry.id ? 'Processing...' : 'Process (Create Receipt)'}
                  </Text>
                </TouchableOpacity>
              </View>
            ))
          )}
        </Card>

        <Card>
          <Text style={styles.sectionTitle}>Receipts ({receipts.length})</Text>
          {receipts.length === 0 ? (
            <Text style={styles.emptyText}>No receipts found</Text>
          ) : (
            receipts.map((receipt) => (
              <View key={receipt.input_hash} style={styles.receiptItem}>
                <View style={styles.receiptHeader}>
                  <Text style={styles.receiptHash}>{receipt.input_hash.substring(0, 8)}...</Text>
                  <Text style={styles.receiptTimestamp}>{formatTimestamp(receipt.timestamp)}</Text>
                </View>
                <Text style={styles.receiptStatus}>Status: {receipt.status}</Text>
                <Text style={styles.receiptTTL}>TTL: {receipt.ttl_seconds}s</Text>
                <TouchableOpacity
                  style={[styles.button, styles.smallButton]}
                  onPress={() => handleVerifyReceipt(receipt)}
                  disabled={verifyingReceipt === receipt.input_hash}
                >
                  <Text style={styles.buttonText}>
                    {verifyingReceipt === receipt.input_hash ? 'Verifying...' : 'Verify'}
                  </Text>
                </TouchableOpacity>
              </View>
            ))
          )}
        </Card>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  scrollContent: {
    padding: theme.spacing.md,
  },
  sectionTitle: {
    ...theme.typography.h3,
    marginBottom: theme.spacing.md,
  },
  exportButtons: {
    flexDirection: 'row',
    gap: theme.spacing.md,
  },
  button: {
    paddingVertical: theme.spacing.md,
    paddingHorizontal: theme.spacing.lg,
    borderRadius: theme.borderRadius.md,
    alignItems: 'center',
    flex: 1,
  },
  smallButton: {
    paddingVertical: theme.spacing.sm,
    paddingHorizontal: theme.spacing.md,
    marginTop: theme.spacing.sm,
  },
  primaryButton: {
    backgroundColor: theme.colors.primary,
  },
  secondaryButton: {
    backgroundColor: theme.colors.secondary,
  },
  buttonText: {
    color: theme.colors.text,
    fontSize: 14,
    fontWeight: '600',
    textAlign: 'center',
  },
  emptyText: {
    ...theme.typography.body,
    color: theme.colors.textMuted,
    textAlign: 'center',
    fontStyle: 'italic',
  },
  entryItem: {
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
    paddingVertical: theme.spacing.md,
  },
  entryHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: theme.spacing.sm,
  },
  entryType: {
    ...theme.typography.bodySmall,
    color: theme.colors.primary,
    fontWeight: '600',
  },
  entryTimestamp: {
    ...theme.typography.caption,
    color: theme.colors.textMuted,
  },
  entryRedactions: {
    ...theme.typography.bodySmall,
    color: theme.colors.textSecondary,
    marginBottom: theme.spacing.sm,
  },
  receiptItem: {
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
    paddingVertical: theme.spacing.md,
  },
  receiptHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: theme.spacing.sm,
  },
  receiptHash: {
    ...theme.typography.bodySmall,
    color: theme.colors.secondary,
    fontFamily: 'monospace',
  },
  receiptTimestamp: {
    ...theme.typography.caption,
    color: theme.colors.textMuted,
  },
  receiptStatus: {
    ...theme.typography.bodySmall,
    color: theme.colors.textSecondary,
    marginBottom: theme.spacing.xs,
  },
  receiptTTL: {
    ...theme.typography.caption,
    color: theme.colors.textMuted,
    marginBottom: theme.spacing.sm,
  },
});
