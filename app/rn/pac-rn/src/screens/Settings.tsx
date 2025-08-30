import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Switch, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Card } from '../components/Card';
import { theme } from '../theme';
import useAppStore from '../store';

export default function Settings() {
  const {
    textRules,
    imageRules,
    locationFuzzRadius,
    setTextRules,
    setImageRules,
    setLocationFuzzRadius,
    setError,
  } = useAppStore();

  const [localTextRules, setLocalTextRules] = useState<string[]>(textRules);
  const [localImageRules, setLocalImageRules] = useState<string[]>(imageRules);
  const [localLocationFuzzRadius, setLocalLocationFuzzRadius] = useState(locationFuzzRadius);

  const availableTextRules = ['EMAIL', 'PHONE', 'ADDRESS', 'NAME', 'ID', 'CARD', 'GPS'];
  const availableImageRules = ['FACE', 'PLATE', 'DOCUMENT', 'SIGNATURE', 'QR_CODE'];

  const handleTextRuleToggle = (rule: string) => {
    const newRules = localTextRules.includes(rule)
      ? localTextRules.filter(r => r !== rule)
      : [...localTextRules, rule];
    setLocalTextRules(newRules);
  };

  const handleImageRuleToggle = (rule: string) => {
    const newRules = localImageRules.includes(rule)
      ? localImageRules.filter(r => r !== rule)
      : [...localImageRules, rule];
    setLocalImageRules(newRules);
  };

  const handleSave = () => {
    try {
      setTextRules(localTextRules);
      setImageRules(localImageRules);
      setLocationFuzzRadius(localLocationFuzzRadius);
      setError(null);
      Alert.alert('Success', 'Settings saved successfully!');
    } catch (error) {
      console.error('Failed to save settings:', error);
      setError('Failed to save settings');
      Alert.alert('Error', 'Failed to save settings. Please try again.');
    }
  };

  const handleReset = () => {
    Alert.alert(
      'Reset Settings',
      'Are you sure you want to reset all settings to defaults?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Reset',
          style: 'destructive',
          onPress: () => {
            setLocalTextRules(['EMAIL', 'PHONE', 'ADDRESS', 'NAME', 'ID', 'CARD']);
            setLocalImageRules(['FACE', 'PLATE', 'DOCUMENT']);
            setLocalLocationFuzzRadius(100);
          },
        },
      ]
    );
  };

  const renderRuleToggle = (
    rule: string,
    isEnabled: boolean,
    onToggle: () => void,
    description: string
  ) => (
    <View style={styles.ruleItem}>
      <View style={styles.ruleInfo}>
        <Text style={styles.ruleName}>{rule}</Text>
        <Text style={styles.ruleDescription}>{description}</Text>
      </View>
      <Switch
        value={isEnabled}
        onValueChange={onToggle}
        trackColor={{ false: theme.colors.border, true: theme.colors.primary }}
        thumbColor={isEnabled ? theme.colors.primaryDark : theme.colors.textMuted}
      />
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <Card>
          <Text style={styles.sectionTitle}>Text Processing Rules</Text>
          <Text style={styles.sectionDescription}>
            Select which types of personal information to detect and redact in text content.
          </Text>
          {availableTextRules.map((rule) => {
            const descriptions = {
              EMAIL: 'Email addresses',
              PHONE: 'Phone numbers',
              ADDRESS: 'Street addresses',
              NAME: 'Personal names',
              ID: 'ID numbers (NRIC, SSN)',
              CARD: 'Credit card numbers',
              GPS: 'GPS coordinates',
            };
            return ( 
              <View key={`text-${rule}`}>
                {renderRuleToggle(
                  rule,
                  localTextRules.includes(rule),
                  () => handleTextRuleToggle(rule),
                  descriptions[rule as keyof typeof descriptions] || rule
                )}
              </View>
            );
          })}
        </Card>

        <Card>
          <Text style={styles.sectionTitle}>Image Processing Rules</Text>
          <Text style={styles.sectionDescription}>
            Select which types of sensitive content to detect and blur in images.
          </Text>
          {availableImageRules.map((rule) => {
            const descriptions = {
              FACE: 'Human faces',
              PLATE: 'License plates',
              DOCUMENT: 'Document content',
              SIGNATURE: 'Handwritten signatures',
              QR_CODE: 'QR codes and barcodes',
            };
            return (
              <View key={`image-${rule}`}>
                {renderRuleToggle(
                  rule,
                  localImageRules.includes(rule),
                  () => handleImageRuleToggle(rule),
                  descriptions[rule as keyof typeof descriptions] || rule
                )}
              </View>
            );
          })}
        </Card>

        <Card>
          <Text style={styles.sectionTitle}>Location Privacy</Text>
          <Text style={styles.sectionDescription}>
            Set the radius (in meters) for location fuzzing to protect precise coordinates.
          </Text>
          <View style={styles.sliderContainer}>
            <Text style={styles.sliderValue}>{localLocationFuzzRadius}m</Text>
            <View style={styles.sliderTrack}>
              <View
                style={[
                  styles.sliderFill,
                  { width: `${(localLocationFuzzRadius / 1000) * 100}%` },
                ]}
              />
            </View>
            <View style={styles.sliderLabels}>
              <Text style={styles.sliderLabel}>100m</Text>
              <Text style={styles.sliderLabel}>1km</Text>
            </View>
            <TouchableOpacity
              style={styles.sliderButton}
              onPress={() => setLocalLocationFuzzRadius(Math.max(100, localLocationFuzzRadius - 100))}
            >
              <Text style={styles.sliderButtonText}>-</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.sliderButton}
              onPress={() => setLocalLocationFuzzRadius(Math.min(1000, localLocationFuzzRadius + 100))}
            >
              <Text style={styles.sliderButtonText}>+</Text>
            </TouchableOpacity>
          </View>
        </Card>

        <View style={styles.actionButtons}>
          <TouchableOpacity style={[styles.button, styles.saveButton]} onPress={handleSave}>
            <Text style={styles.buttonText}>Save Settings</Text>
          </TouchableOpacity>
          <TouchableOpacity style={[styles.button, styles.resetButton]} onPress={handleReset}>
            <Text style={styles.buttonText}>Reset to Defaults</Text>
          </TouchableOpacity>
        </View>
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
    marginBottom: theme.spacing.sm,
  },
  sectionDescription: {
    ...theme.typography.bodySmall,
    color: theme.colors.textSecondary,
    marginBottom: theme.spacing.md,
    lineHeight: 20,
  },
  ruleItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: theme.spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
  },
  ruleInfo: {
    flex: 1,
    marginRight: theme.spacing.md,
  },
  ruleName: {
    ...theme.typography.body,
    fontWeight: '600',
    marginBottom: theme.spacing.xs,
  },
  ruleDescription: {
    ...theme.typography.bodySmall,
    color: theme.colors.textMuted,
  },
  sliderContainer: {
    alignItems: 'center',
    marginTop: theme.spacing.md,
  },
  sliderValue: {
    ...theme.typography.h3,
    color: theme.colors.primary,
    marginBottom: theme.spacing.md,
  },
  sliderTrack: {
    width: '100%',
    height: 8,
    backgroundColor: theme.colors.border,
    borderRadius: 4,
    marginBottom: theme.spacing.sm,
  },
  sliderFill: {
    height: '100%',
    backgroundColor: theme.colors.primary,
    borderRadius: 4,
  },
  sliderLabels: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
    marginBottom: theme.spacing.md,
  },
  sliderLabel: {
    ...theme.typography.caption,
    color: theme.colors.textMuted,
  },
  sliderButton: {
    width: 40,
    height: 40,
    backgroundColor: theme.colors.surfaceLight,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    marginHorizontal: theme.spacing.sm,
  },
  sliderButtonText: {
    ...theme.typography.h3,
    color: theme.colors.text,
  },
  actionButtons: {
    marginTop: theme.spacing.xl,
    gap: theme.spacing.md,
  },
  button: {
    paddingVertical: theme.spacing.md,
    paddingHorizontal: theme.spacing.lg,
    borderRadius: theme.borderRadius.md,
    alignItems: 'center',
  },
  saveButton: {
    backgroundColor: theme.colors.success,
  },
  resetButton: {
    backgroundColor: theme.colors.error,
  },
  buttonText: {
    color: theme.colors.text,
    fontSize: 16,
    fontWeight: '600',
  },
});
