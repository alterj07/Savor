import { useEffect, useState, useCallback } from 'react';
import {
  View, Text, FlatList, StyleSheet,
  TouchableOpacity, ActivityIndicator
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { supabase } from '../../../services/supabase';
import { useAuthStore } from '../../../stores/authStore';

const PAGE_SIZE = 20;

interface ScanHistoryItem {
  id: string;
  restaurant_name: string;
  scanned_at: string;
  results_json: any[];
}

export default function HistoryScreen() {
  const { user } = useAuthStore();
  const [scans, setScans] = useState<ScanHistoryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [page, setPage] = useState(0);

  const loadScans = useCallback(async (pageNum: number, append = false) => {
    if (!user) return;

    pageNum === 0 ? setLoading(true) : setLoadingMore(true);

    const from = pageNum * PAGE_SIZE;
    const to = from + PAGE_SIZE - 1;

    const { data, error } = await supabase
      .from('scan_history')
      .select('id, restaurant_name, scanned_at, results_json')
      .eq('user_id', user.id)
      .order('scanned_at', { ascending: false })
      .range(from, to);

    if (!error && data) {
      setScans(prev => append ? [...prev, ...data] : data);
      setHasMore(data.length === PAGE_SIZE);
    }

    setLoading(false);
    setLoadingMore(false);
  }, [user]);

  useEffect(() => {
    loadScans(0);
  }, [loadScans]);

  const loadMore = () => {
    if (!loadingMore && hasMore) {
      const nextPage = page + 1;
      setPage(nextPage);
      loadScans(nextPage, true);
    }
  };

  const getScanSummary = (resultsJson: any[]) => {
    const red = resultsJson.filter(r => r.status === 'red').length;
    const orange = resultsJson.filter(r => r.status === 'orange').length;
    return { red, orange, total: resultsJson.length };
  };

  const renderItem = ({ item }: { item: ScanHistoryItem }) => {
    const summary = getScanSummary(item.results_json);
    const date = new Date(item.scanned_at);

    return (
      <TouchableOpacity
        style={styles.card}
        onPress={() => router.push({
          pathname: '/(app)/history-detail',
          params: { scanId: item.id }
        })}
      >
        <View style={styles.cardLeft}>
          <Text style={styles.restaurant}>{item.restaurant_name}</Text>
          <Text style={styles.date}>
            {date.toLocaleDateString()} · {date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
          </Text>
        </View>
        <View style={styles.badges}>
          {summary.red > 0 && (
            <View style={[styles.badge, { backgroundColor: '#FFEBEE' }]}>
              <Text style={[styles.badgeText, { color: '#C62828' }]}>
                🔴 {summary.red}
              </Text>
            </View>
          )}
          {summary.orange > 0 && (
            <View style={[styles.badge, { backgroundColor: '#FFF3E0' }]}>
              <Text style={[styles.badgeText, { color: '#E65100' }]}>
                🟡 {summary.orange}
              </Text>
            </View>
          )}
        </View>
      </TouchableOpacity>
    );
  };

  if (loading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color="#2E7D32" />
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <Text style={styles.header}>Scan History</Text>
      <FlatList
        data={scans}
        renderItem={renderItem}
        keyExtractor={item => item.id}
        onEndReached={loadMore}
        onEndReachedThreshold={0.5}
        ListFooterComponent={
          loadingMore ? <ActivityIndicator style={{ padding: 16 }} /> : null
        }
        ListEmptyComponent={
          <View style={styles.empty}>
            <Text style={styles.emptyText}>No scans yet</Text>
            <Text style={styles.emptySubtext}>Scan a menu to get started</Text>
          </View>
        }
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f5f5f5' },
  centered: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  header: { fontSize: 28, fontWeight: '700', padding: 20 },
  card: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#fff',
    marginHorizontal: 16,
    marginBottom: 10,
    borderRadius: 12,
    padding: 16,
  },
  cardLeft: { flex: 1 },
  restaurant: { fontSize: 16, fontWeight: '600' },
  date: { fontSize: 13, color: '#888', marginTop: 4 },
  badges: { flexDirection: 'row', gap: 8 },
  badge: { paddingHorizontal: 10, paddingVertical: 6, borderRadius: 20 },
  badgeText: { fontSize: 13, fontWeight: '600' },
  empty: { alignItems: 'center', padding: 48 },
  emptyText: { fontSize: 18, fontWeight: '600', color: '#888' },
  emptySubtext: { fontSize: 14, color: '#aaa', marginTop: 8 },
});