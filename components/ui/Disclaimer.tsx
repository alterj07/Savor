import { View, Text, StyleSheet } from 'react-native';

interface DisclaimerProps {
  variant?: 'inline' | 'banner';
}

export function Disclaimer({ variant = 'inline' }: DisclaimerProps) {
  return (
    <View style={[styles.container, variant === 'banner' && styles.banner]}>
      <Text style={styles.icon}>⚠️</Text>
      <Text style={styles.text}>
        This app provides AI-generated estimates, not medical advice.
        False positives and negatives are possible.
        If you have a severe allergy, always confirm with restaurant staff.
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { marginTop: 6 },
  banner: {
    backgroundColor: '#FFF3E0',
    padding: 12,
    borderRadius: 8,
    flexDirection: 'row',
    alignItems: 'center',
  },
  icon: { fontSize: 16, marginRight: 8 },
  text: { fontSize: 13, color: '#E65100', flex: 1 },
});