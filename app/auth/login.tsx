import { router } from 'expo-router';
import React from 'react';
import { Image, StatusBar, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { GoogleIcon } from '../../components/GoogleIcon';
import { AuthService } from '../../services/AuthService';

export default function LoginScreen() {
  const handleLogin = async () => {
    const success = await AuthService.signInWithGoogle();
    console.log(success, 'success...');
    
    if (success) {
      const hasMpin = await AuthService.getMpin();
      if (hasMpin) {
        router.replace('/auth/mpin');
      } else {
        router.replace('/auth/generate-mpin');
      }
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
          >
            <GoogleIcon />
            <Text style={{
              color: '#374151',
              fontWeight: 'bold',
              fontSize: 16,
            }}>
              Continue with Google
            </Text>
          </TouchableOpacity>

          <TouchableOpacity 
            style={{
              width: '100%',
              height: 56,
              borderRadius: 12,
              backgroundColor: 'transparent',
              borderWidth: 1,
              borderColor: '#e2e8f0',
              flexDirection: 'row',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 12,
              marginBottom: 32,
            }}
            activeOpacity={0.8}
            onPress={async () => {
              const success = await AuthService.loginAsGuest();
              if (success) {
                const hasMpin = await AuthService.getMpin();
                if (hasMpin) {
                  router.replace('/auth/mpin');
                } else {
                  router.replace('/auth/generate-mpin');
                }
              }
            }}
          >
            <Text style={{
              color: '#64748b',
              fontWeight: '600',
              fontSize: 16,
            }}>
              Continue as Guest
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
    </SafeAreaView>
  );
}