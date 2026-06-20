import { Tabs } from 'expo-router';

export default function TabLayout() {
  return (
    <Tabs screenOptions={{ headerShown: false }}>
      <Tabs.Screen
        name="scan"
        options={{
          title: 'Scan',
          tabBarIcon: () => null,
        }}
      />
      <Tabs.Screen
        name="history"
        options={{ title: 'History' }}
      />
      <Tabs.Screen
        name="settings"
        options={{ title: 'Settings' }}
      />
    </Tabs>
  );
}