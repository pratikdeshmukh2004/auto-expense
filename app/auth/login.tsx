import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import React, { useState } from 'react';
import { Image, StatusBar, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import AnimatedCoins from '../../components/AnimatedCoins';
import TermsModal from '../../components/drawers/TermsModal';
import { GoogleIcon } from '../../components/GoogleIcon';
import { AuthService } from '../../services/AuthService';

export default function LoginScreen() {
  const [showTermsModal, setShowTermsModal] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    setError('');
    setLoading(true);
    
    try {
      const success = await AuthService.signInWithGoogle();
      
      if (success) {
        const hasMpin = await AuthService.getMpin();
        
        if (!hasMpin) {
          router.replace('/auth/generate-mpin');
        } else {
          router.replace('/auth/mpin');
        }
      } else {
        setError('Google login failed. Please try again.');
      }
    } catch (err: any) {
      setError(err?.message || 'An error occurred during login. Please try again.');
      console.error('Login error:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleGuestLogin = async () => {
    setError('');
    setLoading(true);
    
    try {
      const success = await AuthService.loginAsGuest();
      if (success) {
        const hasMpin = await AuthService.getMpin();
        
        if (!hasMpin) {
          router.replace('/auth/generate-mpin');
        } else {
          router.replace('/auth/mpin');
        }
      } else {
        setError('Guest login failed. Please try again.');
      }
    } catch (err: any) {
      setError(err?.message || 'An error occurred during login. Please try again.');
      console.error('Guest login error:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#F5F5F5" />
      
      <AnimatedCoins />
      
      <View style={styles.content}>
        {/* Logo */}
        <Image
          source={require('../../assets/images/logo.png')}
          style={styles.logo}
          resizeMode="contain"
        />

        {/* Title */}
        <Text style={styles.title}>
          Auto Expense
        </Text>
        
        <Text style={styles.subtitle}>
          Track your spending automatically.
        </Text>

        {/* Error Message */}
        {error ? (
          <View style={styles.errorContainer}>
            <Ionicons name="alert-circle" size={20} color="#EA2831" />
            <Text style={styles.errorText}>{error}</Text>
          </View>
        ) : null}

        {/* Buttons */}
        <View style={styles.buttonsContainer}>
          <TouchableOpacity 
            style={[styles.googleButton, loading && styles.buttonDisabled]} 
            activeOpacity={0.8} 
            onPress={handleLogin}
            disabled={loading}
          >
            <GoogleIcon />
            <Text style={styles.googleButtonText}>
              {loading ? 'Signing in...' : 'Continue with Google'}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity 
            style={[styles.guestButton, loading && styles.buttonDisabled]} 
            activeOpacity={0.8} 
            onPress={handleGuestLogin}
            disabled={loading}
          >
            <Text style={styles.guestButtonText}>
              {loading ? 'Signing in...' : 'Continue as Guest'}
            </Text>
          </TouchableOpacity>
        </View>
        
        <View style={styles.disclaimerContainer}>
          <Text style={styles.disclaimer}>
            By continuing, you agree to create an account and accept our{' '}
            <TouchableOpacity onPress={() => setShowTermsModal(true)} style={{ flexDirection: 'row' }}>
              <Text style={styles.linkText}>Terms and Conditions</Text>
            </TouchableOpacity>.
          </Text>
        </View>
        
        <View style={styles.encryptedBadge}>
          <Ionicons name="lock-closed" size={12} color="#EA2831" />
          <Text style={styles.encryptedText}>
            END-TO-END ENCRYPTED
          </Text>
        </View>
      </View>

      <TermsModal visible={showTermsModal} onClose={() => setShowTermsModal(false)} />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F5F5',
    overflow: 'visible',
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 24,
    position: 'relative',
    zIndex: 1,
    backgroundColor: 'transparent',
  },
  logo: {
    width: 100,
    height: 100,
    marginBottom: 32,
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#1F1F1F',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#757575',
    marginBottom: 64,
  },
  buttonsContainer: {
    width: '100%',
    maxWidth: 400,
  },
  googleButton: {
    width: '100%',
    height: 56,
    borderRadius: 12,
    backgroundColor: 'white',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  googleButtonText: {
    color: '#1F1F1F',
    fontWeight: '600',
    fontSize: 16,
  },
  guestButton: {
    width: '100%',
    height: 56,
    borderRadius: 12,
    backgroundColor: '#FAFAFA',
    alignItems: 'center',
    justifyContent: 'center',
  },
  guestButtonText: {
    color: '#757575',
    fontWeight: '600',
    fontSize: 16,
  },
  disclaimerContainer: {
    paddingHorizontal: 32,
    marginTop: 32,
  },
  disclaimer: {
    color: '#9E9E9E',
    fontSize: 12,
    textAlign: 'center',
  },
  linkText: {
    color: '#EA2831',
    fontWeight: '600',
    textDecorationLine: 'underline',
  },
  encryptedBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    marginTop: 16,
  },
  encryptedText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#94A3B8',
    letterSpacing: 1.2,
  },
  errorContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FEE',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 8,
    marginBottom: 16,
    gap: 8,
    width: '100%',
    maxWidth: 400,
  },
  errorText: {
    color: '#EA2831',
    fontSize: 14,
    flex: 1,
  },
  buttonDisabled: {
    opacity: 0.6,
  },
});