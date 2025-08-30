import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Linking } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Card } from '../components/Card';
import { theme } from '../theme';
import { RootStackParamList } from '../../App';

type NavigationProp = NativeStackNavigationProp<RootStackParamList, 'Home'>;

export default function Home() {
  const navigation = useNavigation<NavigationProp>();

  const handleOpenLink = (url: string) => {
    Linking.openURL(url);
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.header}>
          <Text style={styles.title}>Personal AI Privacy Capsule</Text>
          <Text style={styles.subtitle}>
            Secure, user-owned privacy layer for cloud AI interactions
          </Text>
        </View>

        <View style={styles.features}>
          <TouchableOpacity
            onPress={() => navigation.navigate('TextCapsule')}
            style={styles.featureButton}
          >
            <Card variant="elevated" style={styles.featureCard}>
              <Text style={styles.featureTitle}>Text Capsule</Text>
              <Text style={styles.featureDescription}>
                Sanitize text content, detect PII, and process through AI with privacy protection
              </Text>
            </Card>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() => navigation.navigate('ImageCapsule')}
            style={styles.featureButton}
          >
            <Card variant="elevated" style={styles.featureCard}>
              <Text style={styles.featureTitle}>Image Capsule</Text>
              <Text style={styles.featureDescription}>
                Blur sensitive content in images before AI analysis
              </Text>
            </Card>
          </TouchableOpacity>
        </View>

        <View style={styles.footer}>
          <Text style={styles.footerTitle}>Quick Actions</Text>
          <View style={styles.footerLinks}>
            <TouchableOpacity
              onPress={() => navigation.navigate('Audit')}
              style={styles.linkButton}
            >
              <Text style={styles.linkText}>View Audit Log</Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() => navigation.navigate('Settings')}
              style={styles.linkButton}
            >
              <Text style={styles.linkText}>Settings</Text>
            </TouchableOpacity>
          </View>
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
    flexGrow: 1,
    padding: theme.spacing.md,
  },
  header: {
    alignItems: 'center',
    marginBottom: theme.spacing.xxl,
    paddingTop: theme.spacing.lg,
  },
  title: {
    ...theme.typography.h1,
    textAlign: 'center',
    marginBottom: theme.spacing.sm,
  },
  subtitle: {
    ...theme.typography.body,
    textAlign: 'center',
    color: theme.colors.textSecondary,
    paddingHorizontal: theme.spacing.lg,
  },
  features: {
    flex: 1,
    gap: theme.spacing.lg,
  },
  featureButton: {
    flex: 1,
  },
  featureCard: {
    minHeight: 120,
    justifyContent: 'center',
  },
  featureTitle: {
    ...theme.typography.h3,
    marginBottom: theme.spacing.sm,
  },
  featureDescription: {
    ...theme.typography.body,
    color: theme.colors.textSecondary,
    lineHeight: 22,
  },
  footer: {
    marginTop: theme.spacing.xl,
    alignItems: 'center',
  },
  footerTitle: {
    ...theme.typography.h3,
    marginBottom: theme.spacing.md,
  },
  footerLinks: {
    flexDirection: 'row',
    gap: theme.spacing.md,
  },
  linkButton: {
    paddingHorizontal: theme.spacing.lg,
    paddingVertical: theme.spacing.sm,
    backgroundColor: theme.colors.surfaceLight,
    borderRadius: theme.borderRadius.md,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  linkText: {
    ...theme.typography.body,
    color: theme.colors.primary,
  },
});
