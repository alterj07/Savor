import { View, Text, StyleSheet } from 'react-native';

interface ConfidenceBarProps {
  confidence: number;
  inferenceUsed: boolean;
}

export function ConfidenceBar({ confidence, inferenceUsed }: ConfidenceBarProps) {
  const percentage = Math.round(confidence * 100);
  const color = confidence >= 0.8 ? '#2E7D32' : confidence >= 0.5 ? '#E65100' : '#C62828';

  return (
    <View style={styles.container}>
      <View style={styles.barContainer}>
        <View style={[styles.bar, { width: `${percentage}%`, backgroundColor: color }]} />
      </View>
      <Text style={styles.label}>
        {percentage}% confidence{inferenceUsed ? ' (inferred)' : ''}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { marginTop: 6 },
  barContainer: {
    height: 4,
    backgroundColor: '#e0e0e0',
    borderRadius: 2,
    overflow: 'hidden',
  },
  bar: { height: '100%', borderRadius: 2 },
  label: { fontSize: 11, color: '#888', marginTop: 3 },
});