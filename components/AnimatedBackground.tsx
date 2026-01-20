import { Ionicons } from '@expo/vector-icons';
import React, { useEffect, useState } from 'react';
import { Animated, View } from 'react-native';

export default function AnimatedBackground() {
  const [animations] = useState(() => {
    return Array.from({ length: 12 }, () => ({
      translateY: new Animated.Value(180),
      translateX: new Animated.Value(0),
      opacity: new Animated.Value(0.2),
      rotate: new Animated.Value(0),
    }));
  });

  useEffect(() => {
    const animateElements = () => {
      animations.forEach((anim, index) => {
        Animated.loop(
          Animated.sequence([
            Animated.parallel([
              Animated.timing(anim.translateY, {
                toValue: -40 - (index * 8),
                duration: 6000 + (index * 600),
                useNativeDriver: true,
              }),
              Animated.timing(anim.translateX, {
                toValue: (index % 2 === 0 ? 30 : -30),
                duration: 5000 + (index * 400),
                useNativeDriver: true,
              }),
              Animated.timing(anim.opacity, {
                toValue: 0.4,
                duration: 3000,
                useNativeDriver: true,
              }),
              Animated.timing(anim.rotate, {
                toValue: 1,
                duration: 8000 + (index * 500),
                useNativeDriver: true,
              }),
            ]),
            Animated.parallel([
              Animated.timing(anim.translateY, {
                toValue: 180,
                duration: 0,
                useNativeDriver: true,
              }),
              Animated.timing(anim.translateX, {
                toValue: 0,
                duration: 0,
                useNativeDriver: true,
              }),
              Animated.timing(anim.opacity, {
                toValue: 0.2,
                duration: 0,
                useNativeDriver: true,
              }),
              Animated.timing(anim.rotate, {
                toValue: 0,
                duration: 0,
                useNativeDriver: true,
              }),
            ]),
          ])
        ).start();
      });
    };

    animateElements();
  }, []);

  const hour = new Date().getHours();
  let elements = [];
  
  if (hour < 6) {
    elements = [
      { icon: 'moon', color: '#818cf8', size: 40 },
      { icon: 'star', color: '#fbbf24', size: 16 },
      { icon: 'star', color: '#fde68a', size: 12 },
      { icon: 'star-outline', color: '#fef3c7', size: 14 },
      { icon: 'cloud-outline', color: '#94a3b8', size: 32 },
      { icon: 'cloud', color: '#cbd5e1', size: 28 },
      { icon: 'star', color: '#fbbf24', size: 10 },
      { icon: 'ellipse', color: '#818cf8', size: 8 },
      { icon: 'star-outline', color: '#fde68a', size: 16 },
      { icon: 'cloud-outline', color: '#94a3b8', size: 24 },
      { icon: 'star', color: '#fef3c7', size: 12 },
      { icon: 'ellipse', color: '#a5b4fc', size: 6 },
    ];
  } else if (hour < 12) {
    elements = [
      { icon: 'sunny', color: '#fbbf24', size: 44 },
      { icon: 'airplane', color: '#64748b', size: 20 },
      { icon: 'cloud-outline', color: '#fde68a', size: 32 },
      { icon: 'leaf', color: '#10b981', size: 18 },
      { icon: 'cloud', color: '#fef3c7', size: 28 },
      { icon: 'airplane-outline', color: '#94a3b8', size: 16 },
      { icon: 'ellipse', color: '#fbbf24', size: 10 },
      { icon: 'leaf-outline', color: '#34d399', size: 14 },
      { icon: 'cloud-outline', color: '#fde68a', size: 24 },
      { icon: 'ellipse', color: '#fcd34d', size: 8 },
      { icon: 'airplane', color: '#64748b', size: 18 },
      { icon: 'leaf', color: '#10b981', size: 12 },
    ];
  } else if (hour < 17) {
    elements = [
      { icon: 'partly-sunny', color: '#fb923c', size: 42 },
      { icon: 'cloud', color: '#fed7aa', size: 36 },
      { icon: 'sunny-outline', color: '#fdba74', size: 24 },
      { icon: 'cloud-outline', color: '#fef3c7', size: 28 },
      { icon: 'ellipse', color: '#fb923c', size: 12 },
      { icon: 'cloud', color: '#fed7aa', size: 32 },
      { icon: 'ellipse', color: '#fdba74', size: 10 },
      { icon: 'cloud-outline', color: '#fde68a', size: 26 },
      { icon: 'sunny-outline', color: '#fb923c', size: 20 },
      { icon: 'ellipse', color: '#fbbf24', size: 8 },
      { icon: 'cloud', color: '#fed7aa', size: 30 },
      { icon: 'ellipse', color: '#fb923c', size: 6 },
    ];
  } else if (hour < 20) {
    elements = [
      { icon: 'sunset', color: '#f87171', size: 40 },
      { icon: 'airplane', color: '#64748b', size: 18 },
      { icon: 'cloud', color: '#fca5a5', size: 34 },
      { icon: 'ellipse', color: '#fb923c', size: 14 },
      { icon: 'cloud-outline', color: '#fed7aa', size: 28 },
      { icon: 'airplane-outline', color: '#94a3b8', size: 16 },
      { icon: 'ellipse', color: '#f87171', size: 10 },
      { icon: 'cloud', color: '#fca5a5', size: 30 },
      { icon: 'airplane', color: '#64748b', size: 20 },
      { icon: 'ellipse', color: '#fb923c', size: 8 },
      { icon: 'cloud-outline', color: '#fed7aa', size: 26 },
      { icon: 'ellipse', color: '#f87171', size: 6 },
    ];
  } else {
    elements = [
      { icon: 'moon', color: '#818cf8', size: 40 },
      { icon: 'star', color: '#fbbf24', size: 16 },
      { icon: 'star', color: '#fde68a', size: 12 },
      { icon: 'star-outline', color: '#fef3c7', size: 14 },
      { icon: 'cloud-outline', color: '#94a3b8', size: 32 },
      { icon: 'cloud', color: '#cbd5e1', size: 28 },
      { icon: 'star', color: '#fbbf24', size: 10 },
      { icon: 'ellipse', color: '#818cf8', size: 8 },
      { icon: 'star-outline', color: '#fde68a', size: 16 },
      { icon: 'cloud-outline', color: '#94a3b8', size: 24 },
      { icon: 'star', color: '#fef3c7', size: 12 },
      { icon: 'ellipse', color: '#a5b4fc', size: 6 },
    ];
  }

  return (
    <View style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 180, overflow: 'hidden' }}>
      {animations.map((anim, index) => {
        const element = elements[index];
        const isAirplane = element?.icon.includes('airplane');
        const shouldRotate = element?.icon.includes('star') || element?.icon.includes('leaf');
        
        return (
          <Animated.View
            key={index}
            style={{
              position: 'absolute',
              top: 15 + (index * 15),
              left: 10 + (index * 30),
              opacity: anim.opacity,
              transform: [
                { translateY: anim.translateY },
                { translateX: isAirplane ? anim.translateX.interpolate({
                  inputRange: [-30, 0, 30],
                  outputRange: [-100, 0, 100],
                }) : anim.translateX },
                ...(shouldRotate ? [{ rotate: anim.rotate.interpolate({
                  inputRange: [0, 1],
                  outputRange: ['0deg', '360deg'],
                }) }] : []),
              ],
            }}
          >
            <Ionicons 
              name={element?.icon as any} 
              size={element?.size || 20} 
              color={element?.color || '#94a3b8'}
            />
          </Animated.View>
        );
      })}
    </View>
  );
}