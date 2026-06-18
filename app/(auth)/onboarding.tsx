// app/(auth)/onboarding.tsx
import { useState } from 'react';
import {
  View, Text, ScrollView, TouchableOpacity,
  StyleSheet, Alert
} from 'react-native';
import { router } from 'expo-router';
import { supabase } from '../../services/supabase';
import { useAuthStore } from '../../stores/authStore';
import { ALLERGENS, DIETARY_FLAGS } from '../../constants/allergens';
import { AllergenType, DietaryFlag } from '../../types';

export default function OnboardingScreen() {
  const { user, fetchProfile } = useAuthStore();
  const [selectedAllergens, setSelectedAllergens] = useState<AllergenType[]>([]);
  const [selectedFlags, setSelectedFlags] = useState<DietaryFlag[]>([]);
  const [loading, setLoading] = useState(false);

  const toggleAllergen = (id: AllergenType) => {
    setSelectedAllergens((prev) =>
      prev.includes(id) ? prev.filter((a) => a !== id) : [...prev, id]
    );
  };

  const toggleFlag = (id: DietaryFlag) => {
    setSelectedFlags((prev) =>
      prev.includes(id) ? prev.filter((f) => f !== id) : [...prev, id]
    );
  };

  const handleSave = async () => {
    if (!user) return;

    setLoading(true);

    const { error } = await supabase
      .from('profiles')
      .update({
        allergens: selectedAllergens,
        dietary_flags: selectedFlags,
        onboarding_complete: true,
        updated_at: new Date().toISOString(),
      })
      .eq('id', user.id);

    setLoading(false);

    if (error) {
      Alert.alert('Error', 'Failed to save your profile. Please try again.');
    } else {
      await fetchProfile(); // Refresh the store
      router.replace('/(app)/(tabs)/scan');
    }
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>Set Up Your Profile</Text>
      <Text style={styles.subtitle}>Tell us about your dietary needs</Text>

      <Text style={styles.sectionTitle}>Allergens</Text>
      <Text style={styles.sectionSubtitle}>Select everything that applies</Text>

      <View style={styles.grid}>
        {ALLERGENS.map((allergen) => {
          const selected = selectedAllergens.includes(allergen.id);
          return (
            <TouchableOpacity
              key={allergen.id}
              style={[styles.chip, selected && styles.chipSelected]}
              onPress={() => toggleAllergen(allergen.id)}
            >
              <Text style={styles.chipEmoji}>{allergen.emoji}</Text>
              <Text style={[styles.chipLabel, selected && styles.chipLabelSelected]}>
                {allergen.label}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>

      <Text style={styles.sectionTitle}>Dietary Preferences</Text>

      <View style={styles.grid}>
        {DIETARY_FLAGS.map((flag) => {
          const selected = selectedFlags.includes(flag.id);
          return (
            <TouchableOpacity
              key={flag.id}
              style={[styles.chip, selected && styles.chipSelected]}
              onPress={() => toggleFlag(flag.id)}
            >
              <Text style={styles.chipEmoji}>{flag.emoji}</Text>
              <Text style={[styles.chipLabel, selected && styles.chipLabelSelected]}>
                {flag.label}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>

      <TouchableOpacity
        style={styles.button}
        onPress={handleSave}
        disabled={loading}
      >
        <Text style={styles.buttonText}>
          {selectedAllergens.length === 0 && selectedFlags.length === 0
            ? 'Continue Without Restrictions'
            : 'Save My Profile'}
        </Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { padding: 24, paddingBottom: 48 },
  title: { fontSize: 28, fontWeight: '700', marginBottom: 8 },
  subtitle: { fontSize: 16, color: '#666', marginBottom: 32 },
  sectionTitle: { fontSize: 20, fontWeight: '600', marginBottom: 4 },
  sectionSubtitle: { fontSize: 14, color: '#888', marginBottom: 16 },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
    marginBottom: 32,
  },
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 24,
    borderWidth: 1.5,
    borderColor: '#e0e0e0',
    backgroundColor: '#fafafa',
    gap: 6,
  },
  chipSelected: {
    borderColor: '#2E7D32',
    backgroundColor: '#E8F5E9',
  },
  chipEmoji: { fontSize: 16 },
  chipLabel: { fontSize: 14, color: '#333' },
  chipLabelSelected: { color: '#2E7D32', fontWeight: '600' },
  button: {
    backgroundColor: '#2E7D32',
    borderRadius: 12,
    padding: 18,
    alignItems: 'center',
    marginTop: 8,
  },
  buttonText: { color: 'white', fontSize: 16, fontWeight: '600' },
});