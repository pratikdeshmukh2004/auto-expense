import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { Stack, usePathname } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import 'react-native-reanimated';
import BottomNavigation from '../components/BottomNavigation';
import { useEffect, useState } from 'react';
import { AuthService } from '../services/AuthService';
import { NotificationParser } from '../services/NotificationParser';
import { router } from 'expo-router';

import { useColorScheme } from '@/hooks/use-color-scheme';

export default function RootLayout() {
  const colorScheme = useColorScheme();
  const pathname = usePathname();
  const [isChecking, setIsChecking] = useState(true);
  
  useEffect(() => {
    checkAuth();
    initializeNotificationParser();
  }, []);

  const initializeNotificationParser = async () => {
    await NotificationParser.startListening();
  };
  
  const checkAuth = async () => {
    const isLoggedIn = await AuthService.isLoggedIn();
    if (isLoggedIn && pathname === '/') {
      router.replace('/auth/mpin');
    }
    setIsChecking(false);
  };
  
  // Show bottom navigation only on these pages
  const showBottomNav = [
    '/dashboard',
    '/transactions', 
    '/settings'
  ].includes(pathname);

  if (isChecking) {
    return null;
  }

  return (
    <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
      <Stack>
        <Stack.Screen name="index" options={{ headerShown: false }} />
        <Stack.Screen name="auth/login" options={{ headerShown: false }} />
        <Stack.Screen name="auth/generate-mpin" options={{ headerShown: false }} />
        <Stack.Screen name="auth/mpin" options={{ headerShown: false }} />
        <Stack.Screen name="dashboard/index" options={{ headerShown: false }} />
        <Stack.Screen name="transactions/index" options={{ headerShown: false }} />
        <Stack.Screen name="transactions/details" options={{ headerShown: false }} />
        <Stack.Screen name="settings/index" options={{ headerShown: false }} />
        <Stack.Screen name="settings/bank-keywords" options={{ headerShown: false }} />
      </Stack>
      {showBottomNav && <BottomNavigation />}
      <StatusBar style="auto" />
    </ThemeProvider>
  );
}
