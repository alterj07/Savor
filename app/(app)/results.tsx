// app/(app)/results.tsx
import { useEffect, useState } from 'react';
import {
  View, Text, ScrollView, StyleSheet,
  ActivityIndicator, TouchableOpacity, Alert
} from 'react-native';
import { useLocalSearchParams, router } from 'expo-router';
import { useAuthStore } from '../../stores/authStore';
import { analyzeMenu } from '../../services/api';
import { MenuItemResult, RiskStatus } from '../../types';

const STATUS_CONFIG: Record<RiskStatus, { color: string; bg: string; label: string; emoji: string }> = {
  red:      { color: '#C62828', bg: '#FFEBEE', label: 'Contains Allergen', emoji: '🔴' },
  orange:   { color: '#E65100', bg: '#FFF3E0', label: 'Ask Your Waiter',   emoji: '🟡' },
  green:    { color: '#2E7D32', bg: '#E8F5E9', label: 'Likely Safe',       emoji: '🟢' },
  asterisk: { color: '#1565C0', bg: '#E3F2FD', label: 'Note',              emoji: '⭐' },
};

export default function ResultsScreen() {
  const { imageUri } = useLocalSearchParams<{ imageUri: string }>();
  const { profile } = useAuthStore();
  const [loading, setLoading] = useState(true);
  const [results, setResults] = useState<MenuItemResult[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!imageUri || !profile) return;
    runAnalysis();
  }, [imageUri, profile]);

  const runAnalysis = async () => {
    setLoading(true);
    setError(null);

    try {
      const data = await analyzeMenu(imageUri!, profile!);
      setResults(data.results.items);
    } catch (err: any) {
      setError(err.message || 'Analysis failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color="#2E7D32" />
        <Text style={styles.loadingText}>Analyzing menu...</Text>
        <Text style={styles.loadingSubtext}>This usually takes 5–10 seconds</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.centered}>
        <Text style={styles.errorEmoji}>📷</Text>
        <Text style={styles.errorTitle}>Couldn't Analyze Menu</Text>
        <Text style={styles.errorText}>{error}</Text>
        <TouchableOpacity style={styles.retryButton} onPress={runAnalysis}>
          <Text style={styles.retryButtonText}>Try Again</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={() => router.back()}>
          <Text style={styles.backLink}>Take a New Photo</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <Text style={styles.backButton}>← Back</Text>
        </TouchableOpacity>
        <Text style={styles.title}>Menu Analysis</Text>
      </View>

      {/* Disclaimer */}
      <View style={styles.disclaimer}>
        <Text style={styles.disclaimerText}>
          ⚠️ AI analysis may make mistakes. When in doubt, ask your server directly.
        </Text>
      </View>

      <ScrollView>
        {results.map((item, index) => {
          const config = STATUS_CONFIG[item.status];
          return (
            <View key={index} style={[styles.itemCard, { backgroundColor: config.bg }]}>
              <View style={styles.itemHeader}>
                <Text style={styles.itemEmoji}>{config.emoji}</Text>
                <View style={styles.itemTitleGroup}>
                  <Text style={styles.itemName}>{item.item}</Text>
                  <Text style={[styles.itemStatus, { color: config.color }]}>
                    {config.label}
                  </Text>
                </View>
                <Text style={styles.confidence}>
                  {Math.round(item.confidence * 100)}%
                </Text>
              </View>

              {item.reasoning && (
                <Text style={styles.reasoning}>{item.reasoning}</Text>
              )}

              {item.inference_used && (
                <Text style={styles.inferenceNote}>
                  💭 This is an inference — confirm with staff
                </Text>
              )}
            </View>
          );
        })}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f5f5f5' },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    backgroundColor: '#fff',
    gap: 16,
  },
  backButton: { color: '#2E7D32', fontSize: 16 },
  title: { fontSize: 20, fontWeight: '700' },
  disclaimer: {
    backgroundColor: '#FFF8E1',
    padding: 12,
    margin: 12,
    borderRadius: 8,
  },
  disclaimerText: { fontSize: 13, color: '#795548', textAlign: 'center' },
  itemCard: {
    margin: 12,
    marginTop: 0,
    borderRadius: 12,
    padding: 16,
  },
  itemHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
  },
  itemEmoji: { fontSize: 22 },
  itemTitleGroup: { flex: 1 },
  itemName: { fontSize: 16, fontWeight: '600', color: '#212121' },
  itemStatus: { fontSize: 13, fontWeight: '500', marginTop: 2 },
  confidence: { fontSize: 13, color: '#888' },
  reasoning: { marginTop: 8, fontSize: 14, color: '#555', lineHeight: 20 },
  inferenceNote: { marginTop: 8, fontSize: 13, color: '#888', fontStyle: 'italic' },
  loadingText: { fontSize: 18, fontWeight: '600', marginTop: 16 },
  loadingSubtext: { fontSize: 14, color: '#888', marginTop: 8 },
  errorEmoji: { fontSize: 48, marginBottom: 16 },
  errorTitle: { fontSize: 20, fontWeight: '700', marginBottom: 8 },
  errorText: { fontSize: 15, color: '#666', textAlign: 'center', marginBottom: 24 },
  retryButton: {
    backgroundColor: '#2E7D32',
    paddingHorizontal: 32,
    paddingVertical: 14,
    borderRadius: 10,
    marginBottom: 12,
  },
  retryButtonText: { color: '#fff', fontWeight: '600' },
  backLink: { color: '#2E7D32', fontSize: 15 },
});