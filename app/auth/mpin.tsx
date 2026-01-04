import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Alert, Image } from 'react-native';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import * as LocalAuthentication from 'expo-local-authentication';
import * as SecureStore from 'expo-secure-store';
import * as Haptics from 'expo-haptics';

export default function MPINScreen() {
  const [mpin, setMpin] = useState('');
  const [biometricAvailable, setBiometricAvailable] = useState(false);
  const [biometricType, setBiometricType] = useState<string>('');

  useEffect(() => {
    checkBiometricAvailability();
  }, []);

  const checkBiometricAvailability = async () => {
    const hasHardware = await LocalAuthentication.hasHardwareAsync();
    const isEnrolled = await LocalAuthentication.isEnrolledAsync();
    const supportedTypes = await LocalAuthentication.supportedAuthenticationTypesAsync();
    
    if (hasHardware && isEnrolled) {
      setBiometricAvailable(true);
      if (supportedTypes.includes(LocalAuthentication.AuthenticationType.FACIAL_RECOGNITION)) {
        setBiometricType('face');
      } else if (supportedTypes.includes(LocalAuthentication.AuthenticationType.FINGERPRINT)) {
        setBiometricType('fingerprint');
      }
    }
  };

  const handleNumberPress = (number: string) => {
    if (mpin.length < 4) {
      const newMpin = mpin + number;
      setMpin(newMpin);
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      
      if (newMpin.length === 4) {
        verifyMpin(newMpin);
      }
    }
  };

  const handleBackspace = () => {
    setMpin(mpin.slice(0, -1));
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
  };

  const verifyMpin = async (enteredMpin: string) => {
    const storedMpin = await SecureStore.getItemAsync('user_mpin') || '1234';
    
    if (enteredMpin === storedMpin) {
      router.replace('/dashboard');
    } else {
      Alert.alert('Invalid MPIN', 'Please try again');
      setMpin('');
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
    }
  };

  const handleBiometricAuth = async () => {
    try {
      const result = await LocalAuthentication.authenticateAsync({
        promptMessage: 'Authenticate to access Auto Expense',
        fallbackLabel: 'Use MPIN',
      });

      if (result.success) {
        router.replace('/dashboard');
      }
    } catch (error) {
      Alert.alert('Authentication Error', 'Please try again');
    }
  };

  const renderDots = () => {
    return (
      <View style={styles.dotsContainer}>
        {[0, 1, 2, 3].map((index) => (
          <View
            key={index}
            style={[
              styles.dot,
              index < mpin.length ? styles.dotFilled : styles.dotEmpty
            ]}
          />
        ))}
      </View>
    );
  };

  const renderKeypad = () => {
    const numbers = [
      ['1', '2', '3'],
      ['4', '5', '6'],
      ['7', '8', '9'],
      [biometricType, '0', 'backspace']
    ];

    return (
      <View style={styles.keypad}>
        {numbers.map((row, rowIndex) => (
          <View key={rowIndex} style={styles.keypadRow}>
            {row.map((item, itemIndex) => {
              if (item === 'backspace') {
                return (
                  <TouchableOpacity
                    key={itemIndex}
                    style={styles.keypadButton}
                    onPress={handleBackspace}
                  >
                    <Ionicons name="backspace-outline" size={24} color="#94a3b8" />
                  </TouchableOpacity>
                );
              } else if (item === 'face') {
                return (
                  <TouchableOpacity
                    key={itemIndex}
                    style={styles.keypadButton}
                    onPress={handleBiometricAuth}
                    disabled={!biometricAvailable}
                  >
                    <Ionicons 
                      name="scan" 
                      size={32} 
                      color={biometricAvailable ? "#EA2831" : "#94a3b8"} 
                    />
                  </TouchableOpacity>
                );
              } else if (item === 'fingerprint') {
                return (
                  <TouchableOpacity
                    key={itemIndex}
                    style={styles.keypadButton}
                    onPress={handleBiometricAuth}
                    disabled={!biometricAvailable}
                  >
                    <Ionicons 
                      name="finger-print" 
                      size={32} 
                      color={biometricAvailable ? "#EA2831" : "#94a3b8"} 
                    />
                  </TouchableOpacity>
                );
              } else {
                return (
                  <TouchableOpacity
                    key={itemIndex}
                    style={[styles.keypadButton, styles.numberButton]}
                    onPress={() => handleNumberPress(item)}
                  >
                    <Text style={styles.numberText}>{item}</Text>
                  </TouchableOpacity>
                );
              }
            })}
          </View>
        ))}
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <View style={styles.backgroundBlur1} />
      <View style={styles.backgroundBlur2} />
      
      <View style={styles.content}>
        <View style={styles.header}>
          <Image 
            source={require('../../assets/images/logo.png')} 
            style={{ width: 100, height: 100, marginBottom: 24 }}
            resizeMode="contain"
          />
          <Text style={styles.title}>Auto Expense</Text>
          <Text style={styles.subtitle}>Enter your MPIN to continue</Text>
        </View>

        {renderDots()}
        {renderKeypad()}

        <View style={styles.footer}>
          <TouchableOpacity>
            <Text style={styles.forgotMpin}>Forgot MPIN?</Text>
          </TouchableOpacity>
          <TouchableOpacity>
            <Text style={styles.switchAccount}>Switch Account</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f6f6',
  },
  backgroundBlur1: {
    position: 'absolute',
    top: '-20%',
    right: '-10%',
    width: 300,
    height: 300,
    backgroundColor: 'rgba(234, 40, 49, 0.05)',
    borderRadius: 150,
  },
  backgroundBlur2: {
    position: 'absolute',
    bottom: '-10%',
    left: '-10%',
    width: 250,
    height: 250,
    backgroundColor: 'rgba(148, 163, 184, 0.05)',
    borderRadius: 125,
  },
  content: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 24,
    paddingVertical: 40,
  },
  header: {
    alignItems: 'center',
    marginBottom: 40,
  },
  logoContainer: {
    width: 64,
    height: 64,
    backgroundColor: 'white',
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 8,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#0f172a',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 14,
    color: '#64748b',
    textAlign: 'center',
  },
  dotsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
    marginBottom: 48,
  },
  dot: {
    width: 16,
    height: 16,
    borderRadius: 8,
    borderWidth: 2,
  },
  dotFilled: {
    backgroundColor: '#EA2831',
    borderColor: '#EA2831',
    shadowColor: '#EA2831',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.3,
    shadowRadius: 10,
    elevation: 4,
  },
  dotEmpty: {
    backgroundColor: 'transparent',
    borderColor: '#cbd5e1',
  },
  keypad: {
    width: 320,
    maxWidth: '100%',
  },
  keypadRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 24,
    paddingHorizontal: 32,
  },
  keypadButton: {
    width: 64,
    height: 64,
    borderRadius: 32,
    alignItems: 'center',
    justifyContent: 'center',
  },
  numberButton: {
    backgroundColor: 'white',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  numberText: {
    fontSize: 24,
    fontWeight: '600',
    color: '#374151',
  },
  footer: {
    alignItems: 'center',
    marginTop: 48,
    gap: 20,
  },
  forgotMpin: {
    fontSize: 14,
    fontWeight: '600',
    color: '#EA2831',
  },
  switchAccount: {
    fontSize: 12,
    fontWeight: '500',
    color: '#94a3b8',
  },
});