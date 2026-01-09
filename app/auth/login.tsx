import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import React, { useState } from 'react';
import { StatusBar, Text, TouchableOpacity, View, Image, ActivityIndicator, Alert, TextInput, Modal } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { GoogleIcon } from '../../components/GoogleIcon';
import { AuthService } from '../../services/AuthService';

export default function LoginScreen() {
  const [isLoading, setIsLoading] = useState(false);
  const [showSkipModal, setShowSkipModal] = useState(false);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');

  const handleLogin = async () => {
    setIsLoading(true);
    try {
      const success = await AuthService.googleSignIn();
      if (success) {
        const hasMpin = await AuthService.getMpin();
        if (hasMpin) {
          router.replace('/auth/mpin');
        } else {
          router.replace('/auth/generate-mpin');
        }
      }
    } catch (error) {
      console.error('Login error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSkip = () => {
    setShowSkipModal(true);
  };

  const handleSkipSubmit = async () => {
    if (name.trim() && email.trim()) {
      const demoUser = {
        id: 'demo_user',
        name: name.trim(),
        email: email.trim(),
      };
      
      await AuthService.login(email.trim(), 'demo');
      await AuthService.setUserInfo(demoUser);
      
      const hasMpin = await AuthService.getMpin();
      if (hasMpin) {
        router.replace('/auth/mpin');
      } else {
        router.replace('/auth/generate-mpin');
      }
      
      setShowSkipModal(false);
      setName('');
      setEmail('');
    }
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#f8f6f6' }}>
      <StatusBar barStyle="dark-content" backgroundColor="#f8f6f6" />
      
      <View style={{
        position: 'absolute',
        top: -80,
        right: -40,
        width: 288,
        height: 288,
        backgroundColor: 'rgba(234, 40, 49, 0.05)',
        borderRadius: 144,
        opacity: 0.2,
      }} />
      <View style={{
        position: 'absolute',
        bottom: -40,
        left: -40,
        width: 240,
        height: 240,
        backgroundColor: 'rgba(148, 163, 184, 0.05)',
        borderRadius: 120,
        opacity: 0.2,
      }} />
      
      <View style={{
        flex: 1,
        justifyContent: 'center',
        paddingHorizontal: 24,
        paddingBottom: 80,
      }}>
        <View style={{
          alignItems: 'center',
          paddingBottom: 48,
          paddingTop: 16,
        }}>
          <Image 
            source={require('../../assets/images/logo.png')} 
            style={{ width: 100, height: 100, marginBottom: 24 }}
            resizeMode="contain"
          />
          <Text style={{
            color: '#0f172a',
            fontSize: 32,
            fontWeight: 'bold',
            textAlign: 'center',
          }}>
            Auto Expense
          </Text>
          <Text style={{
            color: '#64748b',
            fontSize: 16,
            paddingTop: 12,
            textAlign: 'center',
            maxWidth: 280,
          }}>
            Track your spending automatically.
          </Text>
        </View>

        <View style={{
          width: '100%',
          maxWidth: 384,
          alignSelf: 'center',
        }}>
          <TouchableOpacity 
            style={{
              width: '100%',
              height: 56,
              borderRadius: 12,
              backgroundColor: 'white',
              borderWidth: 1,
              borderColor: '#e2e8f0',
              flexDirection: 'row',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 12,
              shadowColor: '#000',
              shadowOffset: { width: 0, height: 1 },
              shadowOpacity: 0.05,
              shadowRadius: 2,
              elevation: 2,
              marginBottom: 32,
            }}
            activeOpacity={0.8}
            onPress={handleLogin}
            disabled={isLoading}
          >
            {isLoading ? (
              <ActivityIndicator size="small" color="#374151" />
            ) : (
              <>
                <GoogleIcon />
                <Text style={{
                  color: '#374151',
                  fontWeight: 'bold',
                  fontSize: 16,
                }}>
                  Continue with Google
                </Text>
              </>
            )}
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={{
              width: '100%',
              height: 48,
              borderRadius: 12,
              backgroundColor: 'transparent',
              alignItems: 'center',
              justifyContent: 'center',
              marginBottom: 16,
            }}
            activeOpacity={0.8}
            onPress={handleSkip}
          >
            <Text style={{
              color: '#64748b',
              fontWeight: '500',
              fontSize: 16,
            }}>
              Skip for now
            </Text>
          </TouchableOpacity>
          
          <Text style={{
            color: '#9ca3af',
            fontSize: 12,
            textAlign: 'center',
            paddingHorizontal: 16,
          }}>
            By continuing, you agree to create an account or sign in to your existing one.
          </Text>
        </View>
      </View>
      
      <Modal
        visible={showSkipModal}
        transparent
        animationType="fade"
      >
        <View style={{
          flex: 1,
          backgroundColor: 'rgba(0,0,0,0.5)',
          justifyContent: 'center',
          paddingHorizontal: 24,
        }}>
          <View style={{
            backgroundColor: 'white',
            borderRadius: 16,
            padding: 24,
          }}>
            <Text style={{
              fontSize: 20,
              fontWeight: 'bold',
              color: '#1f2937',
              marginBottom: 8,
              textAlign: 'center',
            }}>Enter Your Details</Text>
            
            <Text style={{
              fontSize: 14,
              color: '#6b7280',
              marginBottom: 24,
              textAlign: 'center',
            }}>We'll use this to personalize your experience</Text>
            
            <TextInput
              style={{
                borderWidth: 1,
                borderColor: '#d1d5db',
                borderRadius: 8,
                padding: 12,
                fontSize: 16,
                marginBottom: 16,
              }}
              placeholder="Your Name"
              value={name}
              onChangeText={setName}
              autoCapitalize="words"
            />
            
            <TextInput
              style={{
                borderWidth: 1,
                borderColor: '#d1d5db',
                borderRadius: 8,
                padding: 12,
                fontSize: 16,
                marginBottom: 24,
              }}
              placeholder="Your Email"
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              autoCapitalize="none"
            />
            
            <View style={{ flexDirection: 'row', gap: 12 }}>
              <TouchableOpacity
                style={{
                  flex: 1,
                  padding: 12,
                  borderRadius: 8,
                  backgroundColor: '#f3f4f6',
                  alignItems: 'center',
                }}
                onPress={() => {
                  setShowSkipModal(false);
                  setName('');
                  setEmail('');
                }}
              >
                <Text style={{ color: '#6b7280', fontWeight: '500' }}>Cancel</Text>
              </TouchableOpacity>
              
              <TouchableOpacity
                style={{
                  flex: 1,
                  padding: 12,
                  borderRadius: 8,
                  backgroundColor: '#EA2831',
                  alignItems: 'center',
                }}
                onPress={handleSkipSubmit}
                disabled={!name.trim() || !email.trim()}
              >
                <Text style={{ color: 'white', fontWeight: '500' }}>Continue</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}