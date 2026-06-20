import { View, Text, ScrollView, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import { router } from 'expo-router';
import { useAuthStore } from '../../../stores/authStore';
import { ALLERGENS, DIETARY_FLAGS } from '../../../constants/allergens';
import { Disclaimer } from '../../../components/ui/Disclaimer';

export default function SettingsScreen() {
  const { user, profile, signOut } = useAuthStore();

  const selectedAllergens = ALLERGENS.filter((a) =>
    profile?.allergens?.includes(a.id)
  );
  const selectedFlags = DIETARY_FLAGS.filter((f) =>
    profile?.dietary_flags?.includes(f.id)
  );

  const handleEditProfile = () => {
    router.push('/(auth)/onboarding?mode=edit');
  };

  const handleSignOut = () => {
    Alert.alert('Sign Out', 'Are you sure you want to sign out?', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Sign Out', style: 'destructive', onPress: signOut },
    ]);
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Text style={styles.title}>Settings</Text>

      {/* Account section */}
      <View style={styles.section}>
        <Text style={styles.sectionLabel}>Account</Text>
        <View style={styles.card}>
          <Text style={styles.email}>{user?.email}</Text>
        </View>
      </View>

      {/* Dietary profile section */}
      <View style={styles.section}>
        <View style={styles.sectionHeaderRow}>
          <Text style={styles.sectionLabel}>Allergens & Dietary Needs</Text>
          <TouchableOpacity onPress={handleEditProfile}>
            <Text style={styles.editLink}>Edit</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.card}>
          {selectedAllergens.length === 0 && selectedFlags.length === 0 ? (
            <Text style={styles.emptyText}>
              No allergens or dietary preferences set yet.
            </Text>
          ) : (
            <View style={styles.chipRow}>
              {selectedAllergens.map((a) => (
                <View key={a.id} style={styles.chip}>
                  <Text style={styles.chipText}>{a.emoji} {a.label}</Text>
                </View>
              ))}
              {selectedFlags.map((f) => (
                <View key={f.id} style={[styles.chip, styles.chipFlag]}>
                  <Text style={styles.chipText}>{f.emoji} {f.label}</Text>
                </View>
              ))}
            </View>
          )}
        </View>
      </View>

      <View style={styles.section}>
        <Disclaimer variant="banner" />
      </View>

      <TouchableOpacity style={styles.signOutButton} onPress={handleSignOut}>
        <Text style={styles.signOutText}>Sign Out</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f5f5f5' },
  content: { padding: 20, paddingBottom: 48 },
  title: { fontSize: 28, fontWeight: '700', marginBottom: 24 },
  section: { marginBottom: 24 },
  sectionLabel: {
    fontSize: 13,
    fontWeight: '600',
    color: '#888',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 8,
  },
  sectionHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  editLink: { fontSize: 14, fontWeight: '600', color: '#2E7D32' },
  card: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
  },
  email: { fontSize: 16, color: '#212121' },
  emptyText: { fontSize: 14, color: '#888', fontStyle: 'italic' },
  chipRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  chip: {
    backgroundColor: '#FFEBEE',
    borderRadius: 20,
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  chipFlag: { backgroundColor: '#E8F5E9' },
  chipText: { fontSize: 13, color: '#333', fontWeight: '500' },
  signOutButton: {
    marginTop: 8,
    paddingVertical: 16,
    alignItems: 'center',
    borderRadius: 12,
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#FFCDD2',
  },
  signOutText: { color: '#C62828', fontSize: 16, fontWeight: '600' },
});