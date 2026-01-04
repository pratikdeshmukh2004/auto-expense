import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import React, { useState, useEffect } from 'react';
import { StyleSheet, Text, TouchableOpacity, View, Image } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import SplashScreen from '../components/SplashScreen';

export default function LandingPage() {
  const [showSplash, setShowSplash] = useState(true);

  const handleGetStarted = () => {
    router.push('/auth/login');
  };

  if (showSplash) {
    return <SplashScreen onFinish={() => setShowSplash(false)} />;
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        <View style={styles.header}>
          <Image 
            source={require('../assets/images/logo.png')} 
            style={{ width: 100, height: 100, marginBottom: 24 }}
            resizeMode="contain"
          />
          <Text style={styles.title}>Auto Expense</Text>
          <Text style={styles.subtitle}>
            Track your spending automatically with smart expense management
          </Text>
        </View>

        <View style={styles.features}>
          <View style={styles.feature}>
            <Ionicons name="analytics" size={24} color="#EA2831" />
            <Text style={styles.featureText}>Smart Analytics</Text>
          </View>
          <View style={styles.feature}>
            <Ionicons name="card" size={24} color="#EA2831" />
            <Text style={styles.featureText}>Auto Categorization</Text>
          </View>
          <View style={styles.feature}>
            <Ionicons name="notifications" size={24} color="#EA2831" />
            <Text style={styles.featureText}>Budget Alerts</Text>
          </View>
        </View>

        <TouchableOpacity style={styles.button} onPress={handleGetStarted}>
          <Text style={styles.buttonText}>Get Started</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f6f6',
  },
  content: {
    flex: 1,
    paddingHorizontal: 24,
    justifyContent: 'center',
  },
  header: {
    alignItems: 'center',
    marginBottom: 60,
  },
  iconContainer: {
    height: 120,
    width: 120,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 24,
    backgroundColor: '#EA2831',
    marginBottom: 24,
    shadowColor: '#EA2831',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 16,
    elevation: 12,
  },
  title: {
    fontSize: 36,
    fontWeight: 'bold',
    color: '#0f172a',
    marginBottom: 16,
  },
  subtitle: {
    fontSize: 18,
    color: '#64748b',
    textAlign: 'center',
    lineHeight: 26,
    maxWidth: 320,
  },
  features: {
    marginBottom: 60,
  },
  feature: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
    paddingHorizontal: 20,
  },
  featureText: {
    fontSize: 16,
    color: '#374151',
    marginLeft: 16,
    fontWeight: '500',
  },
  button: {
    backgroundColor: '#EA2831',
    height: 56,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#EA2831',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  buttonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
  },
});