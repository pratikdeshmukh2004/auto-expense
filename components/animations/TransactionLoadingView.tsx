import React, { useEffect, useRef } from 'react';
import { Animated, Easing, View, Text } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../providers/ThemeProvider';

const ICONS = [
  { name: 'wallet-outline', color: '#EA2831', delay: 0 },
  { name: 'card-outline', color: '#6366f1', delay: 200 },
  { name: 'receipt-outline', color: '#10b981', delay: 400 },
] as const;

export default function TransactionLoadingView() {
  const { colors } = useTheme();
  const pulseAnim = useRef(new Animated.Value(0)).current;
  const iconAnims = useRef(ICONS.map(() => new Animated.Value(0))).current;
  const dotAnims = useRef([0, 1, 2].map(() => new Animated.Value(0))).current;

  useEffect(() => {
    // Pulse ring animation
    Animated.loop(
      Animated.timing(pulseAnim, {
        toValue: 1,
        duration: 2000,
        easing: Easing.out(Easing.ease),
        useNativeDriver: true,
      })
    ).start();

    // Floating icons animation
    iconAnims.forEach((anim, i) => {
      Animated.loop(
        Animated.sequence([
          Animated.delay(ICONS[i].delay),
          Animated.timing(anim, { toValue: 1, duration: 1200, easing: Easing.inOut(Easing.ease), useNativeDriver: true }),
          Animated.timing(anim, { toValue: 0, duration: 1200, easing: Easing.inOut(Easing.ease), useNativeDriver: true }),
        ])
      ).start();
    });

    // Dots animation
    dotAnims.forEach((anim, i) => {
      Animated.loop(
        Animated.sequence([
          Animated.delay(i * 300),
          Animated.timing(anim, { toValue: 1, duration: 400, useNativeDriver: true }),
          Animated.timing(anim, { toValue: 0, duration: 400, useNativeDriver: true }),
        ])
      ).start();
    });
  }, []);

  const pulseScale = pulseAnim.interpolate({ inputRange: [0, 1], outputRange: [1, 1.8] });
  const pulseOpacity = pulseAnim.interpolate({ inputRange: [0, 1], outputRange: [0.4, 0] });

  return (
    <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', paddingBottom: 80 }}>
      {/* Pulse ring */}
      <Animated.View style={{
        position: 'absolute',
        width: 120,
        height: 120,
        borderRadius: 60,
        borderWidth: 2,
        borderColor: '#EA2831',
        opacity: pulseOpacity,
        transform: [{ scale: pulseScale }],
      }} />

      {/* Floating icons */}
      <View style={{ width: 160, height: 160, alignItems: 'center', justifyContent: 'center' }}>
        {ICONS.map((icon, i) => {
          const translateY = iconAnims[i].interpolate({ inputRange: [0, 1], outputRange: [0, -12] });
          const angle = (i * 120 - 90) * (Math.PI / 180);
          const radius = 52;
          const left = 80 + Math.cos(angle) * radius - 24;
          const top = 80 + Math.sin(angle) * radius - 24;

          return (
            <Animated.View key={icon.name} style={{
              position: 'absolute',
              left,
              top,
              width: 48,
              height: 48,
              borderRadius: 14,
              backgroundColor: colors.card,
              alignItems: 'center',
              justifyContent: 'center',
              shadowColor: icon.color,
              shadowOffset: { width: 0, height: 4 },
              shadowOpacity: 0.2,
              shadowRadius: 8,
              elevation: 4,
              transform: [{ translateY }],
            }}>
              <Ionicons name={icon.name as any} size={24} color={icon.color} />
            </Animated.View>
          );
        })}
      </View>

      {/* Loading text with animated dots */}
      <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: 32 }}>
        <Text style={{ fontSize: 15, fontWeight: '600', color: colors.textSecondary }}>
          Loading transactions
        </Text>
        {dotAnims.map((anim, i) => (
          <Animated.Text key={i} style={{
            fontSize: 15,
            fontWeight: '600',
            color: colors.textSecondary,
            opacity: anim.interpolate({ inputRange: [0, 1], outputRange: [0.3, 1] }),
          }}>.</Animated.Text>
        ))}
      </View>
    </View>
  );
}
