import {
  DarkTheme,
  DefaultTheme,
  ThemeProvider,
} from "@react-navigation/native";
import { Stack, usePathname } from "expo-router";
import { StatusBar } from "expo-status-bar";
import "react-native-reanimated";
import { BottomNavigation } from "../components/layout";
import { QueryProvider } from "../providers/QueryProvider";

import { useColorScheme } from "@/hooks/use-color-scheme";

export default function RootLayout() {
  const colorScheme = useColorScheme();
  const pathname = usePathname();

  const showBottomNav = ["/dashboard", "/transactions", "/settings"].includes(
    pathname,
  );

  return (
    <QueryProvider>
      <ThemeProvider value={colorScheme === "dark" ? DarkTheme : DefaultTheme}>
        <Stack>
          <Stack.Screen name="index" options={{ headerShown: false }} />
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
            name="settings/categories"
            options={{ headerShown: false }}
          />
          <Stack.Screen
            name="settings/payment-methods"
            options={{ headerShown: false }}
          />
        </Stack>
        {showBottomNav && <BottomNavigation />}
        <StatusBar style="dark" />
      </ThemeProvider>
    </QueryProvider>
  );
}
