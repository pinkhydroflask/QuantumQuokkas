import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert, Image, Dimensions } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import * as ImagePicker from 'expo-image-picker';
import * as ImageManipulator from 'expo-image-manipulator';
import { Card } from '../components/Card';
import { theme } from '../theme';
import { addAuditEntry } from '../lib/audit';
import { API_ENDPOINTS } from '../lib/config';
import useAppStore from '../store';

const { width: screenWidth } = Dimensions.get('window');
const imageSize = screenWidth - theme.spacing.md * 4;

export default function ImageCapsule() {
  const [originalImage, setOriginalImage] = useState<string | null>(null);
  const [blurredImage, setBlurredImage] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [detectedItems, setDetectedItems] = useState<string[]>([]);
  
  const { imageRules, setLoading, setError } = useAppStore();

  const requestPermissions = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert(
        'Permission Required',
        'Please grant permission to access your photo library to select images.',
        [{ text: 'OK' }]
      );
      return false;
    }
    return true;
  };

  const handlePickImage = async () => {
    try {
      const hasPermission = await requestPermissions();
      if (!hasPermission) return;

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.8,
      });

      if (!result.canceled && result.assets[0]) {
        setOriginalImage(result.assets[0].uri);
        setBlurredImage(null);
        setDetectedItems([]);
        setError(null);
      }
    } catch (error) {
      console.error('Image picker error:', error);
      setError('Failed to pick image');
      Alert.alert('Error', 'Failed to pick image. Please try again.');
    }
  };

  const handleBlurImage = async () => {
    if (!originalImage) {
      Alert.alert('No Image', 'Please select an image first.');
      return;
    }

    setIsProcessing(true);
    setLoading(true);
    
    try {
      // On-device pixelation blur (downscale then upscale)
      const manipResult = await ImageManipulator.manipulateAsync(
        originalImage,
        [
          { resize: { width: 20, height: 20 } }, // Downscale to create pixelation
          { resize: { width: imageSize, height: imageSize } }, // Upscale back
        ],
        { format: ImageManipulator.SaveFormat.JPEG, quality: 0.8 }
      );

      setBlurredImage(manipResult.uri);
      
      // Simulate detection results
      const mockDetections = imageRules.slice(0, Math.floor(Math.random() * 3) + 1);
      setDetectedItems(mockDetections);
      
      // Add audit entry
      addAuditEntry({
        timestamp: new Date().toISOString(),
        type: 'image',
        redactions: mockDetections,
        placeholders: {},
        policySnapshot: { imageRules },
      });
      
      setError(null);
    } catch (error) {
      console.error('Image blur error:', error);
      setError('Failed to blur image');
      Alert.alert('Error', 'Failed to blur image. Please try again.');
    } finally {
      setIsProcessing(false);
      setLoading(false);
    }
  };

  const handleAnalyzeWithAI = async () => {
    if (!blurredImage) {
      Alert.alert('No Blurred Image', 'Please blur an image first.');
      return;
    }

    setIsAnalyzing(true);
    setLoading(true);
    
    try {
      // Create form data for image upload
      const formData = new FormData();
      formData.append('image', {
        uri: blurredImage,
        type: 'image/jpeg',
        name: 'blurred_image.jpg',
      } as any);

      const response = await fetch(API_ENDPOINTS.aiVision, {
        method: 'POST',
        body: formData,
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const result = await response.json();
      Alert.alert('AI Analysis', `Caption: ${result.caption}`);
      setError(null);
    } catch (error) {
      console.error('AI analysis error:', error);
      setError('Failed to analyze image with AI');
      Alert.alert('Error', 'Failed to analyze image with AI. Please check your connection.');
    } finally {
      setIsAnalyzing(false);
      setLoading(false);
    }
  };

  const renderImageSection = (title: string, imageUri: string | null, showActions = false) => {
    if (!imageUri) return null;

    return (
      <Card>
        <Text style={styles.sectionTitle}>{title}</Text>
        <Image source={{ uri: imageUri }} style={styles.image} resizeMode="cover" />
        
        {showActions && (
          <View style={styles.actionButtons}>
            <TouchableOpacity
              style={[styles.button, styles.secondaryButton]}
              onPress={handleAnalyzeWithAI}
              disabled={isAnalyzing}
            >
              <Text style={styles.buttonText}>
                {isAnalyzing ? 'Analyzing...' : 'Analyze with AI'}
              </Text>
            </TouchableOpacity>
          </View>
        )}
      </Card>
    );
  };

  const renderDetectionBadges = () => {
    if (detectedItems.length === 0) return null;

    return (
      <View style={styles.badgesContainer}>
        <Text style={styles.badgesTitle}>Detected Items:</Text>
        <View style={styles.badges}>
          {detectedItems.map((item, index) => (
            <View key={index} style={styles.badge}>
              <Text style={styles.badgeText}>{item}</Text>
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
          <Text style={styles.sectionTitle}>Select Image</Text>
          <TouchableOpacity
            style={[styles.button, styles.primaryButton]}
            onPress={handlePickImage}
          >
            <Text style={styles.buttonText}>Pick Image from Gallery</Text>
          </TouchableOpacity>
        </Card>

        {originalImage && (
          <Card>
            <Text style={styles.sectionTitle}>Original Image</Text>
            <Image source={{ uri: originalImage }} style={styles.image} resizeMode="cover" />
            
            <TouchableOpacity
              style={[styles.button, styles.secondaryButton]}
              onPress={handleBlurImage}
              disabled={isProcessing}
            >
              <Text style={styles.buttonText}>
                {isProcessing ? 'Blurring...' : 'Blur Image'}
              </Text>
            </TouchableOpacity>
          </Card>
        )}

        {blurredImage && (
          <>
            <Card>
              <Text style={styles.sectionTitle}>Blurred Image</Text>
              <Image source={{ uri: blurredImage }} style={styles.image} resizeMode="cover" />
              {renderDetectionBadges()}
            </Card>
            
            <Card>
              <Text style={styles.sectionTitle}>AI Analysis</Text>
              <TouchableOpacity
                style={[styles.button, styles.successButton]}
                onPress={handleAnalyzeWithAI}
                disabled={isAnalyzing}
              >
                <Text style={styles.buttonText}>
                  {isAnalyzing ? 'Analyzing...' : 'Analyze with AI'}
                </Text>
              </TouchableOpacity>
            </Card>
          </>
        )}
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
  image: {
    width: imageSize,
    height: imageSize,
    borderRadius: theme.borderRadius.md,
    alignSelf: 'center',
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
  actionButtons: {
    marginTop: theme.spacing.md,
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
