import {
  DarkTheme,
  DefaultTheme,
  ThemeProvider,
} from "@react-navigation/native";
import { router, Stack, usePathname } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { useEffect, useState } from "react";
import "react-native-reanimated";
import BottomNavigation from "../components/BottomNavigation";
import { QueryProvider } from "../providers/QueryProvider";
import { AuthService } from "../services/AuthService";


import { useColorScheme } from "@/hooks/use-color-scheme";

export default function RootLayout() {
  const colorScheme = useColorScheme();
  const pathname = usePathname();
  const [isChecking, setIsChecking] = useState(true);

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    const isLoggedIn = await AuthService.isLoggedIn();
    const hasMpin = await AuthService.getMpin();

    if (
      isLoggedIn &&
      hasMpin &&
      (pathname === "/" || pathname === "/auth/login")
    ) {
      router.replace("/auth/mpin");
    }
    setIsChecking(false);
  };

  // Show bottom navigation only on these pages
  const showBottomNav = ["/dashboard", "/transactions", "/settings"].includes(
    pathname,
  );

  if (isChecking) {
    return null;
  }

  return (
    <QueryProvider>
      <ThemeProvider value={colorScheme === "dark" ? DarkTheme : DefaultTheme}>
        <Stack>
          <Stack.Screen name="index" options={{ headerShown: false }} />
          <Stack.Screen name="auth/login" options={{ headerShown: false }} />
          <Stack.Screen
            name="auth/generate-mpin"
            options={{ headerShown: false }}
          />
          <Stack.Screen name="auth/mpin" options={{ headerShown: false }} />
          <Stack.Screen
            name="auth/storage-selection"
            options={{ headerShown: false }}
          />
          <Stack.Screen name="dashboard/index" options={{ headerShown: false }} />
          <Stack.Screen
            name="transactions/index"
            options={{ headerShown: false }}
          />
          <Stack.Screen
            name="transactions/details"
            options={{ headerShown: false }}
          />
          <Stack.Screen name="settings/index" options={{ headerShown: false }} />
          <Stack.Screen
            name="settings/smart-parsing"
            options={{ headerShown: false }}
          />
          <Stack.Screen
            name="settings/categories"
            options={{ headerShown: false }}
          />
          <Stack.Screen
            name="settings/payment-methods"
            options={{ headerShown: false }}
          />
          <Stack.Screen
            name="settings/storage-management"
            options={{ headerShown: false }}
          />
        </Stack>
        {showBottomNav && <BottomNavigation />}
        <StatusBar style="dark" />
      </ThemeProvider>
    </QueryProvider>
  );
}
