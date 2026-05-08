import React, { createContext, useContext, useEffect, useState } from 'react';
import * as SecureStore from 'expo-secure-store';

type ThemeMode = 'light' | 'dark';

const lightColors = {
  background: '#f8f6f6',
  card: '#ffffff',
  cardAlt: '#f8f6f6',
  text: '#0d121b',
  textSecondary: '#64748b',
  textMuted: '#9ca3af',
  border: '#e5e7eb',
  divider: '#f3f4f6',
  primary: '#EA2831',
  primaryBg: 'rgba(234, 40, 49, 0.1)',
  success: '#10b981',
  shimmerBg: '#e5e7eb',
  inputBg: '#ffffff',
  chipBg: '#f1f5f9',
  chipActive: '#ffffff',
  overlay: 'rgba(0, 0, 0, 0.5)',
  modalBg: '#f8f6f6',
  shadow: '#000',
};

const darkColors = {
  background: '#0f1419',
  card: '#1c2530',
  cardAlt: '#1c2530',
  text: '#f1f5f9',
  textSecondary: '#94a3b8',
  textMuted: '#64748b',
  border: '#2d3a4a',
  divider: '#2d3a4a',
  primary: '#EA2831',
  primaryBg: 'rgba(234, 40, 49, 0.15)',
  success: '#10b981',
  shimmerBg: '#2d3a4a',
  inputBg: '#1c2530',
  chipBg: '#1c2530',
  chipActive: '#2d3a4a',
  overlay: 'rgba(0, 0, 0, 0.7)',
  modalBg: '#0f1419',
  shadow: '#000',
};

export type ThemeColors = typeof lightColors;

interface ThemeContextType {
  mode: ThemeMode;
  isDark: boolean;
  toggle: () => void;
  colors: ThemeColors;
}

const ThemeContext = createContext<ThemeContextType>({
  mode: 'light',
  isDark: false,
  toggle: () => {},
  colors: lightColors,
});

export function useTheme() {
  return useContext(ThemeContext);
}

export function ThemeProviderCustom({ children }: { children: React.ReactNode }) {
  const [mode, setMode] = useState<ThemeMode>('light');
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    SecureStore.getItemAsync('app_theme').then(val => {
      if (val === 'dark') setMode('dark');
      setLoaded(true);
    }).catch(() => setLoaded(true));
  }, []);

  const toggle = () => {
    const next = mode === 'light' ? 'dark' : 'light';
    setMode(next);
    SecureStore.setItemAsync('app_theme', next);
  };

  const colors = mode === 'dark' ? darkColors : lightColors;

  if (!loaded) return null;

  return (
    <ThemeContext.Provider value={{ mode, isDark: mode === 'dark', toggle, colors }}>
      {children}
    </ThemeContext.Provider>
  );
}
