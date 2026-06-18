// app/(app)/_layout.tsx
import { useEffect } from 'react';
import { Stack, router } from 'expo-router';
import { useAuthStore } from '../../stores/authStore';

export default function AppLayout() {
  const { session, isLoading } = useAuthStore();

  useEffect(() => {
    if (!isLoading && !session) {
      router.replace('/(auth)/login');
    }
  }, [session, isLoading]);

  if (isLoading) {
    return null;
  }

  if (!session) {
    return null;
  }

  return <Stack screenOptions={{ headerShown: false }} />;
}