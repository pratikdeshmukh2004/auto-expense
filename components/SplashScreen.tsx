import React, { useEffect, useRef } from 'react';
import { View, Text, Animated, Dimensions, Image } from 'react-native';

const { width, height } = Dimensions.get('window');

export default function SplashScreen({ onFinish }) {
  const progressAnim = useRef(new Animated.Value(0)).current;
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(0.8)).current;

  useEffect(() => {
    Animated.sequence([
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 800,
          useNativeDriver: true,
        }),
        Animated.timing(scaleAnim, {
          toValue: 1,
          duration: 800,
          useNativeDriver: true,
        }),
      ]),
      Animated.timing(progressAnim, {
        toValue: 1,
        duration: 2000,
        useNativeDriver: false,
      }),
    ]).start(() => {
      setTimeout(onFinish, 500);
    });
  }, []);

  return (
    <View style={{
      flex: 1,
      backgroundColor: '#f8f6f6',
      alignItems: 'center',
      justifyContent: 'space-between',
      position: 'relative',
      overflow: 'hidden',
    }}>
      {/* Background Blur Elements */}
      <View style={{
        position: 'absolute',
        top: -80,
        right: -80,
        width: 384,
        height: 384,
        borderRadius: 192,
        backgroundColor: 'rgba(234, 40, 49, 0.1)',
        opacity: 0.6,
      }} />
      
      <View style={{ flex: 1 }} />
      
      {/* Logo and Title */}
      <Animated.View style={{
        alignItems: 'center',
        gap: 32,
        zIndex: 10,
        opacity: fadeAnim,
        transform: [{ scale: scaleAnim }],
      }}>
        {/* Logo Container */}
        <View style={{ position: 'relative', alignItems: 'center', justifyContent: 'center' }}>
          <View style={{
            position: 'absolute',
            width: 160,
            height: 160,
            borderRadius: 80,
            backgroundColor: 'rgba(234, 40, 49, 0.2)',
            transform: [{ scale: 1.25 }],
            opacity: 0.6,
          }} />
          <View style={{
            width: 128,
            height: 128,
            borderRadius: 64,
            backgroundColor: '#EA2831',
            alignItems: 'center',
            justifyContent: 'center',
            shadowColor: '#EA2831',
            shadowOffset: { width: 0, height: 8 },
            shadowOpacity: 0.3,
            shadowRadius: 16,
            elevation: 8,
          }}>
            <Image 
              source={require('../assets/images/logo.png')} 
              style={{ width: 100, height: 100 }}
              resizeMode="contain"
            />
          </View>
        </View>
        
        {/* Title */}
        <View style={{ alignItems: 'center', gap: 8 }}>
          <Text style={{
            fontSize: 36,
            fontWeight: '800',
            color: '#0f172a',
            textAlign: 'center',
            letterSpacing: -0.5,
          }}>Auto Expense</Text>
          <Text style={{
            fontSize: 12,
            fontWeight: '600',
            color: '#4f46e5',
            textTransform: 'uppercase',
            letterSpacing: 2,
          }}>Expense Tracking Automated</Text>
        </View>
      </Animated.View>
      
      <View style={{ flex: 1 }} />
      
      {/* Loading Progress */}
      <Animated.View style={{
        width: 200,
        alignItems: 'center',
        gap: 12,
        paddingBottom: 48,
        zIndex: 10,
        opacity: fadeAnim,
      }}>
        <View style={{
          width: '100%',
          height: 6,
          backgroundColor: '#e0e7ff',
          borderRadius: 3,
          overflow: 'hidden',
        }}>
          <Animated.View style={{
            height: '100%',
            backgroundColor: '#EA2831',
            borderRadius: 3,
            shadowColor: '#4f46e5',
            shadowOffset: { width: 0, height: 0 },
            shadowOpacity: 0.6,
            shadowRadius: 10,
            width: progressAnim.interpolate({
              inputRange: [0, 1],
              outputRange: ['0%', '100%'],
            }),
          }} />
        </View>
        <Text style={{
          fontSize: 10,
          fontWeight: 'bold',
          color: '#6366f1',
          textTransform: 'uppercase',
          letterSpacing: 2,
        }}>Loading...</Text>
      </Animated.View>
      
      {/* Bottom Blur */}
      <View style={{
        position: 'absolute',
        bottom: -80,
        left: -80,
        width: 320,
        height: 320,
        borderRadius: 160,
        backgroundColor: 'rgba(234, 40, 49, 0.1)',
        opacity: 0.4,
      }} />
    </View>
  );
}