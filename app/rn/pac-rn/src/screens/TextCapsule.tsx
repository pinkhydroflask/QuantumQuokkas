import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TextInput, TouchableOpacity, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Card } from '../components/Card';
import { theme } from '../theme';
import { buildPlaceholders, reinsertPlaceholders, PlaceholderInfo } from '../lib/placeholders';
import { addAuditEntry } from '../lib/audit';
import { API_ENDPOINTS } from '../lib/config';
import useAppStore from '../store';

export default function TextCapsule() {
  const [inputText, setInputText] = useState('');
  const [sanitizedText, setSanitizedText] = useState('');
  const [placeholders, setPlaceholders] = useState<PlaceholderInfo[]>([]);
  const [aiResponse, setAiResponse] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [isAiLoading, setIsAiLoading] = useState(false);
  
  const { textRules, setLoading, setError } = useAppStore();

  const handleSanitize = () => {
    if (!inputText.trim()) {
      Alert.alert('Input Required', 'Please enter some text to sanitize.');
      return;
    }

    try {
      const result = buildPlaceholders(inputText, textRules);
      setSanitizedText(result.sanitized);
      setPlaceholders(result.placeholders);
      
      // Add audit entry
      addAuditEntry({
        timestamp: new Date().toISOString(),
        type: 'text',
        redactions: result.placeholders.map(p => p.category),
        placeholders: result.placeholders.reduce((acc, p) => {
          acc[p.placeholder] = p.original;
          return acc;
        }, {} as Record<string, string>),
        policySnapshot: { textRules },
      });
      
      setError(null);
    } catch (error) {
      console.error('Sanitization error:', error);
      setError('Failed to sanitize text');
    }
  };

  const handleAskAI = async () => {
    if (!sanitizedText.trim()) {
      Alert.alert('No Sanitized Text', 'Please sanitize some text first.');
      return;
    }

    setIsAiLoading(true);
    setLoading(true);
    
    try {
      const response = await fetch(API_ENDPOINTS.aiComplete, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ prompt: sanitizedText }),
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const result = await response.json();
      setAiResponse(result.completion);
      setError(null);
    } catch (error) {
      console.error('AI request error:', error);
      setError('Failed to get AI response');
      Alert.alert('Error', 'Failed to get AI response. Please check your connection.');
    } finally {
      setIsAiLoading(false);
      setLoading(false);
    }
  };

  const handleReinsert = () => {
    if (!aiResponse.trim()) {
      Alert.alert('No AI Response', 'Please get an AI response first.');
      return;
    }

    try {
      const finalText = reinsertPlaceholders(aiResponse, placeholders);
      setAiResponse(finalText);
      setError(null);
    } catch (error) {
      console.error('Reinsertion error:', error);
      setError('Failed to reinsert placeholders');
    }
  };

  const renderPlaceholderBadges = () => {
    if (placeholders.length === 0) return null;

    return (
      <View style={styles.badgesContainer}>
        <Text style={styles.badgesTitle}>Detected PII:</Text>
        <View style={styles.badges}>
          {placeholders.map((placeholder, index) => (
            <View key={index} style={styles.badge}>
              <Text style={styles.badgeText}>{placeholder.category}</Text>
            </View>
          ))}
        </View>
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <Card>
          <Text style={styles.sectionTitle}>Input Text</Text>
          <TextInput
            style={styles.textInput}
            value={inputText}
            onChangeText={setInputText}
            placeholder="Enter text containing PII (emails, phones, addresses, names)..."
            placeholderTextColor={theme.colors.textMuted}
            multiline
            numberOfLines={4}
            textAlignVertical="top"
          />
          <TouchableOpacity
            style={[styles.button, styles.primaryButton]}
            onPress={handleSanitize}
            disabled={isProcessing}
          >
            <Text style={styles.buttonText}>
              {isProcessing ? 'Sanitizing...' : 'Sanitize Text'}
            </Text>
          </TouchableOpacity>
        </Card>

        {sanitizedText ? (
          <Card>
            <Text style={styles.sectionTitle}>Sanitized Text</Text>
            <Text style={styles.sanitizedText}>{sanitizedText}</Text>
            {renderPlaceholderBadges()}
            
            <TouchableOpacity
              style={[styles.button, styles.secondaryButton]}
              onPress={handleAskAI}
              disabled={isAiLoading}
            >
              <Text style={styles.buttonText}>
                {isAiLoading ? 'Asking AI...' : 'Ask AI (Send Sanitized)'}
              </Text>
            </TouchableOpacity>
          </Card>
        ) : null}

        {aiResponse ? (
          <Card>
            <Text style={styles.sectionTitle}>AI Response</Text>
            <Text style={styles.aiResponse}>{aiResponse}</Text>
            
            <TouchableOpacity
              style={[styles.button, styles.successButton]}
              onPress={handleReinsert}
            >
              <Text style={styles.buttonText}>Reinsert Placeholders</Text>
            </TouchableOpacity>
          </Card>
        ) : null}
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
  textInput: {
    borderWidth: 1,
    borderColor: theme.colors.border,
    borderRadius: theme.borderRadius.md,
    padding: theme.spacing.md,
    color: theme.colors.text,
    backgroundColor: theme.colors.surfaceLight,
    fontSize: 16,
    minHeight: 100,
  },
  button: {
    paddingVertical: theme.spacing.md,
    paddingHorizontal: theme.spacing.lg,
    borderRadius: theme.borderRadius.md,
    alignItems: 'center',
    marginTop: theme.spacing.md,
  },
  primaryButton: {
    backgroundColor: theme.colors.primary,
  },
  secondaryButton: {
    backgroundColor: theme.colors.secondary,
  },
  successButton: {
    backgroundColor: theme.colors.success,
  },
  buttonText: {
    color: theme.colors.text,
    fontSize: 16,
    fontWeight: '600',
  },
  sanitizedText: {
    ...theme.typography.body,
    backgroundColor: theme.colors.surfaceLight,
    padding: theme.spacing.md,
    borderRadius: theme.borderRadius.sm,
    borderWidth: 1,
    borderColor: theme.colors.border,
    fontFamily: 'monospace',
  },
  aiResponse: {
    ...theme.typography.body,
    backgroundColor: theme.colors.surfaceLight,
    padding: theme.spacing.md,
    borderRadius: theme.borderRadius.sm,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  badgesContainer: {
    marginTop: theme.spacing.md,
  },
  badgesTitle: {
    ...theme.typography.bodySmall,
    color: theme.colors.textSecondary,
    marginBottom: theme.spacing.sm,
  },
  badges: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: theme.spacing.sm,
  },
  badge: {
    backgroundColor: theme.colors.primary,
    paddingHorizontal: theme.spacing.sm,
    paddingVertical: theme.spacing.xs,
    borderRadius: theme.borderRadius.sm,
  },
  badgeText: {
    color: theme.colors.text,
    fontSize: 12,
    fontWeight: '600',
  },
});
