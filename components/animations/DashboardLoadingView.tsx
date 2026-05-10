import React, { useEffect, useRef } from 'react';
import { Animated, Easing, View, Text } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../providers/ThemeProvider';

const CARDS = [
  { icon: 'pie-chart-outline', color: '#EA2831', label: 'Categories' },
  { icon: 'trending-up-outline', color: '#6366f1', label: 'Trends' },
  { icon: 'wallet-outline', color: '#10b981', label: 'Balance' },
] as const;

export default function DashboardLoadingView() {
  const { colors } = useTheme();
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const cardAnims = useRef(CARDS.map(() => new Animated.Value(0))).current;
  const spinAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    // Fade in
    Animated.timing(fadeAnim, { toValue: 1, duration: 400, useNativeDriver: true }).start();

    // Staggered card entrance
    Animated.stagger(150, cardAnims.map(anim =>
      Animated.spring(anim, { toValue: 1, tension: 60, friction: 8, useNativeDriver: true })
    )).start();

    // Spinning loader
    Animated.loop(
      Animated.timing(spinAnim, { toValue: 1, duration: 1500, easing: Easing.linear, useNativeDriver: true })
    ).start();
  }, []);

  const spin = spinAnim.interpolate({ inputRange: [0, 1], outputRange: ['0deg', '360deg'] });

  return (
    <Animated.View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', paddingBottom: 100, opacity: fadeAnim }}>
      {/* Spinning ring */}
      <Animated.View style={{
        width: 64,
        height: 64,
        borderRadius: 32,
        borderWidth: 3,
        borderColor: colors.border,
        borderTopColor: '#EA2831',
        transform: [{ rotate: spin }],
        marginBottom: 32,
      }} />

      {/* Animated cards */}
      <View style={{ flexDirection: 'row', gap: 16 }}>
        {CARDS.map((card, i) => {
          const translateY = cardAnims[i].interpolate({ inputRange: [0, 1], outputRange: [30, 0] });
          const opacity = cardAnims[i];
          return (
            <Animated.View key={card.label} style={{
              width: 90,
              height: 90,
              borderRadius: 16,
              backgroundColor: colors.card,
              alignItems: 'center',
              justifyContent: 'center',
              shadowColor: card.color,
              shadowOffset: { width: 0, height: 4 },
              shadowOpacity: 0.15,
              shadowRadius: 8,
              elevation: 3,
              opacity,
              transform: [{ translateY }],
            }}>
              <Ionicons name={card.icon as any} size={28} color={card.color} />
              <Text style={{ fontSize: 10, fontWeight: '600', color: colors.textMuted, marginTop: 8 }}>{card.label}</Text>
            </Animated.View>
          );
        })}
      </View>

      <Text style={{ fontSize: 14, fontWeight: '600', color: colors.textSecondary, marginTop: 28 }}>
        Preparing your dashboard
      </Text>
    </Animated.View>
  );
}
