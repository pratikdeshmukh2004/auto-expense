import { Ionicons } from '@expo/vector-icons';
import { router, usePathname } from 'expo-router';
import React from 'react';
import { Text, TouchableOpacity, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export default function BottomNavigation() {
  const pathname = usePathname();
  const insets = useSafeAreaInsets();

  const tabs = [
    { name: 'Dashboard', icon: 'grid', path: '/dashboard' },
    { name: 'Transactions', icon: 'receipt', path: '/transactions' },
    { name: 'Settings', icon: 'settings', path: '/settings' },
  ];

  return (
    <View style={{
      position: 'absolute',
      bottom: 0,
      left: 0,
      right: 0,
      flexDirection: 'row',
      justifyContent: 'space-around',
      alignItems: 'center',
      height: insets.bottom > 20 ? 64 + insets.bottom : 64,
      backgroundColor: 'rgba(255, 255, 255, 0.95)',
      borderTopWidth: 1,
      borderTopColor: '#e2e8f0',
      paddingHorizontal: 10,
      paddingBottom: insets.bottom > 20 ? insets.bottom : 0,
    }}>
      {tabs.map((tab) => {
        const isActive = pathname === tab.path;
        return (
          <TouchableOpacity
            key={tab.path}
            style={{ alignItems: 'center', justifyContent: 'center', gap: 4, padding: 8 }}
            onPress={() => router.replace(tab.path)}
          >
            <Ionicons 
              name={tab.icon as any} 
              size={20} 
              color={isActive ? '#EA2831' : '#64748b'} 
            />
            <Text style={{ 
              fontSize: 10, 
              fontWeight: isActive ? 'bold' : '500', 
              color: isActive ? '#EA2831' : '#64748b' 
            }}>
              {tab.name}
            </Text>
          </TouchableOpacity>
        );
      })}
    </View>
  );
}