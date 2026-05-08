import { Ionicons, MaterialIcons } from '@expo/vector-icons';
import { router, useFocusEffect } from 'expo-router';
import * as SecureStore from 'expo-secure-store';
import React, { useEffect, useState } from 'react';
import { Alert, Image, Platform, ScrollView, Switch, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import SettingsBottomSheet from '../../components/modals/SettingsBottomSheet';
import { StorageKeys } from '../../constants/StorageKeys';
import { AuthService } from '../../services/AuthService';
import { useCategories, usePaymentMethods } from '../../hooks/useQueries';
import { useTheme } from '../../providers/ThemeProvider';
import { ApiService } from '../../services/ApiService';

export default function SettingsIndex() {
  const { colors, isDark, toggle } = useTheme();
  const [dailySummary, setDailySummary] = useState(true);
  const [overspendingAlerts, setOverspendingAlerts] = useState(false);
  const [faceIdLock, setFaceIdLock] = useState(false);
  const [showPrivacySheet, setShowPrivacySheet] = useState(false);
  const [showHelpSheet, setShowHelpSheet] = useState(false);
  const [showAboutSheet, setShowAboutSheet] = useState(false);
  const [showApiUrlSheet, setShowApiUrlSheet] = useState(false);
  const [apiUrl, setApiUrl] = useState('');
  const [apiUrlInput, setApiUrlInput] = useState('');
  const [userName, setUserName] = useState<string | null>(null);
  const [userEmail, setUserEmail] = useState<string | null>(null);
  const [userPhoto, setUserPhoto] = useState<string | null>(null);
  const [isGuest, setIsGuest] = useState(false);

  // TanStack Query hooks
  const { data: categories = [], isLoading: categoriesLoading } = useCategories();
  const { data: paymentMethods = [], isLoading: paymentMethodsLoading } = usePaymentMethods();

  useEffect(() => {
    loadBiometricSetting();
    loadUserInfo();
    loadApiUrl();
  }, []);

  useFocusEffect(
    React.useCallback(() => {
      loadUserInfo();
    }, [])
  );

  const loadUserInfo = async () => {
    const guest = await AuthService.isGuest();
    setIsGuest(guest);
    if (!guest) {
      const name = await AuthService.getUserName();
      const email = await AuthService.getUserEmail();
      const photo = await AuthService.getUserPhoto();
      setUserName(name);
      setUserEmail(email);
      setUserPhoto(photo);
    }
  };



  const loadBiometricSetting = async () => {
    const biometricEnabled = await SecureStore.getItemAsync(StorageKeys.BIOMETRIC_ENABLED);
    setFaceIdLock(biometricEnabled === 'true');
  };

  const loadApiUrl = async () => {
    const url = await ApiService.getApiUrl();
    setApiUrl(url);
    setApiUrlInput(url);
  };

  const saveApiUrl = async () => {
    if (apiUrlInput.trim()) {
      await ApiService.setApiUrl(apiUrlInput.trim());
      setApiUrl(apiUrlInput.trim());
      setShowApiUrlSheet(false);
      Alert.alert('Saved', 'API URL updated successfully.');
    }
  };

  const handleBiometricToggle = async (value: boolean) => {
    setFaceIdLock(value);
    await SecureStore.setItemAsync(StorageKeys.BIOMETRIC_ENABLED, value.toString());
  };

  const handleLogout = () => {
    Alert.alert(
      'Log Out',
      'Are you sure you want to log out?',
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Log Out', 
          style: 'default', 
          onPress: async () => {
            await AuthService.logout();
            router.replace('/dashboard');
          }
        }
      ]
    );
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.background }}>
      {/* Header */}
      <View style={{
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        paddingHorizontal: 24,
        paddingVertical: 16,
        backgroundColor: colors.background,
        borderBottomWidth: 1,
        borderBottomColor: colors.border,
      }}>
        <Text style={{ fontSize: 20, fontWeight: 'bold', color: colors.text }}>Settings</Text>
      </View>

      <ScrollView style={{ flex: 1 }} showsVerticalScrollIndicator={false}>
        {/* Finance Management Section */}
        <View style={{ marginBottom: 24, marginTop: 16 }}>
          <Text style={{
            paddingHorizontal: 24,
            paddingVertical: 8,
            fontSize: 12,
            fontWeight: 'bold',
            color: colors.textMuted,
            textTransform: 'uppercase',
            letterSpacing: 1,
          }}>Finance Management</Text>
          
          <View style={{
            backgroundColor: colors.card,
            borderRadius: 16,
            marginHorizontal: 16,
            shadowColor: '#000',
            shadowOffset: { width: 0, height: 1 },
            shadowOpacity: 0.05,
            shadowRadius: 2,
            elevation: 1,
          }}>
            {/* Manage Categories */}
            <TouchableOpacity 
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: 16,
                borderBottomWidth: 1,
                borderBottomColor: colors.divider,
              }}
              onPress={() => router.push('/settings/categories')}
            >
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 16 }}>
                <View style={{
                  width: 40,
                  height: 40,
                  borderRadius: 12,
                  backgroundColor: 'rgba(236, 72, 153, 0.1)',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}>
                  <Ionicons name="apps" size={20} color="#ec4899" />
                </View>
                <View>
                  <Text style={{ fontSize: 16, fontWeight: '500', color: colors.text }}>Manage Categories</Text>
                  <Text style={{ fontSize: 12, color: colors.textSecondary }}>{categoriesLoading ? 'Loading...' : `${categories.length} categories configured`}</Text>
                </View>
              </View>
              <Ionicons name="chevron-forward" size={20} color="#9ca3af" />
            </TouchableOpacity>

            {/* Payment Methods */}
            <TouchableOpacity 
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: 16,
              }}
              onPress={() => router.push('/settings/payment-methods')}
            >
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 16 }}>
                <View style={{
                  width: 40,
                  height: 40,
                  borderRadius: 12,
                  backgroundColor: 'rgba(16, 185, 129, 0.1)',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}>
                  <Ionicons name="card" size={20} color="#10b981" />
                </View>
                <View>
                  <Text style={{ fontSize: 16, fontWeight: '500', color: colors.text }}>Payment Methods</Text>
                  <Text style={{ fontSize: 12, color: colors.textSecondary }}>{paymentMethodsLoading ? 'Loading...' : `${paymentMethods.length} methods configured`}</Text>
                </View>
              </View>
              <Ionicons name="chevron-forward" size={20} color="#9ca3af" />
            </TouchableOpacity>

            {/* API URL */}
            <TouchableOpacity 
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: 16,
              }}
              onPress={() => setShowApiUrlSheet(true)}
            >
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 16 }}>
                <View style={{
                  width: 40,
                  height: 40,
                  borderRadius: 12,
                  backgroundColor: 'rgba(99, 102, 241, 0.1)',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}>
                  <Ionicons name="link" size={20} color="#6366f1" />
                </View>
                <View>
                  <Text style={{ fontSize: 16, fontWeight: '500', color: colors.text }}>API URL</Text>
                  <Text style={{ fontSize: 12, color: colors.textSecondary }} numberOfLines={1}>Configure data source endpoint</Text>
                </View>
              </View>
              <Ionicons name="chevron-forward" size={20} color="#9ca3af" />
            </TouchableOpacity>
          </View>
        </View>

        {/* Appearance Section */}
        <View style={{ marginBottom: 24 }}>
          <Text style={{
            paddingHorizontal: 24,
            paddingVertical: 8,
            fontSize: 12,
            fontWeight: 'bold',
            color: colors.textMuted,
            textTransform: 'uppercase',
            letterSpacing: 1,
          }}>Appearance</Text>
          
          <View style={{
            backgroundColor: colors.card,
            borderRadius: 16,
            marginHorizontal: 16,
            shadowColor: '#000',
            shadowOffset: { width: 0, height: 1 },
            shadowOpacity: 0.05,
            shadowRadius: 2,
            elevation: 1,
          }}>
            {/* Dark Mode Toggle */}
            <View style={{
              flexDirection: 'row',
              alignItems: 'center',
              justifyContent: 'space-between',
              padding: 16,
            }}>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 16, flex: 1 }}>
                <View style={{
                  width: 40,
                  height: 40,
                  borderRadius: 12,
                  backgroundColor: 'rgba(99, 102, 241, 0.1)',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}>
                  <Ionicons name={isDark ? 'moon' : 'sunny'} size={20} color="#6366f1" />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={{ fontSize: 16, fontWeight: '500', color: colors.text }}>Dark Mode</Text>
                  <Text style={{ fontSize: 12, color: colors.textSecondary }}>Switch to {isDark ? 'light' : 'dark'} theme</Text>
                </View>
              </View>
              <Switch
                value={isDark}
                onValueChange={toggle}
                trackColor={{ false: '#d1d5db', true: '#ea2a33' }}
                thumbColor="white"
              />
            </View>
          </View>
        </View>

        {/* Support Section */}
        <View style={{ marginBottom: 32 }}>
          <Text style={{
            paddingHorizontal: 24,
            paddingVertical: 8,
            fontSize: 12,
            fontWeight: 'bold',
            color: colors.textMuted,
            textTransform: 'uppercase',
            letterSpacing: 1,
          }}>Support</Text>
          
          <View style={{
            backgroundColor: colors.card,
            borderRadius: 16,
            marginHorizontal: 16,
            shadowColor: '#000',
            shadowOffset: { width: 0, height: 1 },
            shadowOpacity: 0.05,
            shadowRadius: 2,
            elevation: 1,
          }}>
            {/* Help Center */}
            <TouchableOpacity 
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: 16,
                borderBottomWidth: 1,
                borderBottomColor: colors.divider,
              }}
              onPress={() => setShowHelpSheet(true)}
            >
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 16 }}>
                <View style={{
                  width: 40,
                  height: 40,
                  borderRadius: 12,
                  backgroundColor: 'rgba(20, 184, 166, 0.1)',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}>
                  <Ionicons name="help-circle" size={20} color="#14b8a6" />
                </View>
                <View>
                  <Text style={{ fontSize: 16, fontWeight: '500', color: colors.text }}>Help Center</Text>
                  <Text style={{ fontSize: 12, color: colors.textSecondary }}>FAQs and support</Text>
                </View>
              </View>
              <Ionicons name="chevron-forward" size={20} color="#9ca3af" />
            </TouchableOpacity>

            {/* About Us */}
            <TouchableOpacity 
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: 16,
              }}
              onPress={() => setShowAboutSheet(true)}
            >
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 16 }}>
                <View style={{
                  width: 40,
                  height: 40,
                  borderRadius: 12,
                  backgroundColor: 'rgba(99, 102, 241, 0.1)',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}>
                  <Ionicons name="information-circle" size={20} color="#6366f1" />
                </View>
                <View>
                  <Text style={{ fontSize: 16, fontWeight: '500', color: colors.text }}>About Us</Text>
                  <Text style={{ fontSize: 12, color: colors.textSecondary }}>App info and developer</Text>
                </View>
              </View>
              <Ionicons name="chevron-forward" size={20} color="#9ca3af" />
            </TouchableOpacity>
          </View>
        </View>

        {/* Footer */}
        <View style={{ paddingHorizontal: 24, alignItems: 'center', gap: 24, paddingBottom: 120 }}>
          <View style={{ alignItems: 'center' }}>
            <Text style={{ fontSize: 12, color: colors.textMuted, fontWeight: '500' }}>Expense Tracker v1.0.4</Text>
            <Text style={{ fontSize: 10, color: colors.textMuted, marginTop: 4 }}>Made with ❤️ for iOS</Text>
          </View>
        </View>
      </ScrollView>
      
      {/* Bottom Sheets */}
      <SettingsBottomSheet
        visible={showPrivacySheet}
        onClose={() => setShowPrivacySheet(false)}
        title="Privacy & Permissions"
      >
        <View>
          {/* Privacy Hero */}
          <View style={{ alignItems: 'center', marginBottom: 32, padding: 20, backgroundColor: 'rgba(34, 197, 94, 0.1)', borderRadius: 16 }}>
            <View style={{
              width: 60,
              height: 60,
              borderRadius: 30,
              backgroundColor: '#10b981',
              alignItems: 'center',
              justifyContent: 'center',
              marginBottom: 12,
            }}>
              <Ionicons name="shield-checkmark" size={28} color="white" />
            </View>
            <Text style={{ fontSize: 18, fontWeight: 'bold', color: colors.text, textAlign: 'center' }}>Your Data Stays Private</Text>
            <Text style={{ fontSize: 14, color: colors.textSecondary, textAlign: 'center', marginTop: 8 }}>100% local processing • Zero cloud storage</Text>
          </View>
          
          <Text style={{ fontSize: 16, fontWeight: 'bold', color: colors.text, marginBottom: 16 }}>🔒 Data Privacy Commitment</Text>
          <View style={{ backgroundColor: colors.card, borderRadius: 12, padding: 16, marginBottom: 24 }}>
            <Text style={{ fontSize: 14, color: colors.textSecondary, lineHeight: 22 }}>
              Your financial data never leaves your device. All transaction parsing, categorization, and analysis happens locally. We don't collect, store, or transmit any personal or financial information to external servers.
            </Text>
          </View>
          
          <Text style={{ fontSize: 16, fontWeight: 'bold', color: colors.text, marginBottom: 16 }}>📱 Required Permissions</Text>
          <View style={{ gap: 16, marginBottom: 24 }}>
            <View style={{ backgroundColor: colors.card, borderRadius: 12, padding: 16 }}>
              <View style={{ flexDirection: 'row', alignItems: 'flex-start', gap: 12 }}>
                <View style={{
                  width: 40,
                  height: 40,
                  borderRadius: 20,
                  backgroundColor: 'rgba(234, 40, 49, 0.1)',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}>
                  <Ionicons name="mail" size={20} color="#ea2a33" />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={{ fontSize: 14, fontWeight: '600', color: colors.text, marginBottom: 4 }}>SMS Access</Text>
                  <Text style={{ fontSize: 12, color: colors.textSecondary, lineHeight: 18 }}>Read transaction notifications from banks and payment apps to automatically parse expense details</Text>
                  <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4, marginTop: 8 }}>
                    <Ionicons name="checkmark-circle" size={12} color="#10b981" />
                    <Text style={{ fontSize: 10, color: '#10b981', fontWeight: '500' }}>READ ONLY • NO SENDING</Text>
                  </View>
                </View>
              </View>
            </View>
            
            <View style={{ backgroundColor: colors.card, borderRadius: 12, padding: 16 }}>
              <View style={{ flexDirection: 'row', alignItems: 'flex-start', gap: 12 }}>
                <View style={{
                  width: 40,
                  height: 40,
                  borderRadius: 20,
                  backgroundColor: 'rgba(59, 130, 246, 0.1)',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}>
                  <Ionicons name="mail-open" size={20} color="#3b82f6" />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={{ fontSize: 14, fontWeight: '600', color: colors.text, marginBottom: 4 }}>Email Access</Text>
                  <Text style={{ fontSize: 12, color: colors.textSecondary, lineHeight: 18 }}>Read transaction emails from banks to automatically track online payments and subscriptions</Text>
                  <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4, marginTop: 8 }}>
                    <Ionicons name="checkmark-circle" size={12} color="#10b981" />
                    <Text style={{ fontSize: 10, color: '#10b981', fontWeight: '500' }}>READ ONLY • SECURE</Text>
                  </View>
                </View>
              </View>
            </View>
            
            <View style={{ backgroundColor: colors.card, borderRadius: 12, padding: 16 }}>
              <View style={{ flexDirection: 'row', alignItems: 'flex-start', gap: 12 }}>
                <View style={{
                  width: 40,
                  height: 40,
                  borderRadius: 20,
                  backgroundColor: 'rgba(16, 185, 129, 0.1)',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}>
                  <Ionicons name="document-text" size={20} color="#10b981" />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={{ fontSize: 14, fontWeight: '600', color: colors.text, marginBottom: 4 }}>Google Sheets Access</Text>
                  <Text style={{ fontSize: 12, color: colors.textSecondary, lineHeight: 18 }}>Sync transactions to Google Sheets for backup and advanced analysis</Text>
                  <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4, marginTop: 8 }}>
                    <Ionicons name="cloud-upload" size={12} color="#10b981" />
                    <Text style={{ fontSize: 10, color: '#10b981', fontWeight: '500' }}>OPTIONAL • ENCRYPTED</Text>
                  </View>
                </View>
              </View>
            </View>
            
            <View style={{ backgroundColor: colors.card, borderRadius: 12, padding: 16 }}>
              <View style={{ flexDirection: 'row', alignItems: 'flex-start', gap: 12 }}>
                <View style={{
                  width: 40,
                  height: 40,
                  borderRadius: 20,
                  backgroundColor: 'rgba(147, 51, 234, 0.1)',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}>
                  <Ionicons name="notifications" size={20} color="#9333ea" />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={{ fontSize: 14, fontWeight: '600', color: colors.text, marginBottom: 4 }}>Notifications</Text>
                  <Text style={{ fontSize: 12, color: colors.textSecondary, lineHeight: 18 }}>Send daily spending summaries and budget alerts to help you stay on track</Text>
                  <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4, marginTop: 8 }}>
                    <Ionicons name="time" size={12} color="#9333ea" />
                    <Text style={{ fontSize: 10, color: '#9333ea', fontWeight: '500' }}>DAILY AT 8:00 PM</Text>
                  </View>
                </View>
              </View>
            </View>
            
            <View style={{ backgroundColor: colors.card, borderRadius: 12, padding: 16 }}>
              <View style={{ flexDirection: 'row', alignItems: 'flex-start', gap: 12 }}>
                <View style={{
                  width: 40,
                  height: 40,
                  borderRadius: 20,
                  backgroundColor: 'rgba(34, 197, 94, 0.1)',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}>
                  <Ionicons name="finger-print" size={20} color="#22c55e" />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={{ fontSize: 14, fontWeight: '600', color: colors.text, marginBottom: 4 }}>Biometric Authentication</Text>
                  <Text style={{ fontSize: 12, color: colors.textSecondary, lineHeight: 18 }}>Secure app access with Face ID, Touch ID, or fingerprint for enhanced security</Text>
                  <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4, marginTop: 8 }}>
                    <Ionicons name="lock-closed" size={12} color="#22c55e" />
                    <Text style={{ fontSize: 10, color: '#22c55e', fontWeight: '500' }}>DEVICE SECURE ELEMENT</Text>
                  </View>
                </View>
              </View>
            </View>
          </View>
          
          <Text style={{ fontSize: 16, fontWeight: 'bold', color: colors.text, marginBottom: 16 }}>🛡️ Security Features</Text>
          <View style={{ backgroundColor: colors.card, borderRadius: 12, padding: 16, marginBottom: 24 }}>
            <View style={{ gap: 12 }}>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
                <Ionicons name="phone-portrait" size={16} color="#10b981" />
                <Text style={{ fontSize: 14, color: colors.text }}>Local data storage only</Text>
              </View>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
                <Ionicons name="shield" size={16} color="#10b981" />
                <Text style={{ fontSize: 14, color: colors.text }}>End-to-end encryption</Text>
              </View>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
                <Ionicons name="eye-off" size={16} color="#10b981" />
                <Text style={{ fontSize: 14, color: colors.text }}>No tracking or analytics</Text>
              </View>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
                <Ionicons name="server" size={16} color="#10b981" />
                <Text style={{ fontSize: 14, color: colors.text }}>No external servers</Text>
              </View>
            </View>
          </View>
        </View>
      </SettingsBottomSheet>
      
      <SettingsBottomSheet
        visible={showHelpSheet}
        onClose={() => setShowHelpSheet(false)}
        title="Help Center"
      >
        <View>
          <Text style={{ fontSize: 16, fontWeight: 'bold', color: colors.text, marginBottom: 16 }}>Frequently Asked Questions</Text>
          
          <View style={{ gap: 20 }}>
            <View>
              <Text style={{ fontSize: 14, fontWeight: '600', color: colors.text, marginBottom: 8 }}>How does auto-parsing work?</Text>
              <Text style={{ fontSize: 14, color: colors.textSecondary, lineHeight: 20 }}>The app reads SMS and email notifications from banks and automatically extracts transaction details like amount, merchant, and category.</Text>
            </View>
            
            <View>
              <Text style={{ fontSize: 14, fontWeight: '600', color: colors.text, marginBottom: 8 }}>Is my data secure?</Text>
              <Text style={{ fontSize: 14, color: colors.textSecondary, lineHeight: 20 }}>Yes, all data is processed locally on your device. No transaction information is sent to external servers or stored in the cloud.</Text>
            </View>
            
            <View>
              <Text style={{ fontSize: 14, fontWeight: '600', color: colors.text, marginBottom: 8 }}>How do I add custom categories?</Text>
              <Text style={{ fontSize: 14, color: colors.textSecondary, lineHeight: 20 }}>Go to Settings {'>'} Manage Categories and tap the "+" button to create new expense categories with custom icons and colors.</Text>
            </View>
            
            <View>
              <Text style={{ fontSize: 14, fontWeight: '600', color: colors.text, marginBottom: 8 }}>Can I export my data?</Text>
              <Text style={{ fontSize: 14, color: colors.textSecondary, lineHeight: 20 }}>Data export functionality is coming in a future update. Currently, all data is stored locally on your device.</Text>
            </View>
          </View>
          
          <View style={{ marginTop: 32, padding: 16, backgroundColor: 'rgba(234, 40, 49, 0.1)', borderRadius: 12 }}>
            <Text style={{ fontSize: 14, fontWeight: '600', color: '#ea2a33', marginBottom: 8 }}>Need more help?</Text>
            <Text style={{ fontSize: 12, color: colors.textSecondary }}>Contact us at pratikdeshmukhlobhi@gmail.com for additional support.</Text>
          </View>
        </View>
      </SettingsBottomSheet>
      
      <SettingsBottomSheet
        visible={showAboutSheet}
        onClose={() => setShowAboutSheet(false)}
        title="About Us"
      >
        <View>
          <View style={{ alignItems: 'center', marginBottom: 24 }}>
            <Image
              source={require('../../assets/images/logo.png')}
              style={{
                width: 80,
                height: 80,
                borderRadius: 40,
                marginBottom: 16,
              }}
            />
            <Text style={{ fontSize: 20, fontWeight: 'bold', color: colors.text }}>Auto Expense</Text>
            <Text style={{ fontSize: 14, color: colors.textSecondary }}>Version 1.0.4</Text>
          </View>
          
          <Text style={{ fontSize: 16, fontWeight: 'bold', color: colors.text, marginBottom: 16 }}>Our Mission</Text>
          <Text style={{ fontSize: 14, color: colors.textSecondary, lineHeight: 20, marginBottom: 20 }}>
            We believe managing personal finances should be effortless and secure. Auto Expense automatically tracks your spending while keeping your data completely private.
          </Text>
          
          <Text style={{ fontSize: 16, fontWeight: 'bold', color: colors.text, marginBottom: 16 }}>Features</Text>
          <View style={{ gap: 12, marginBottom: 20 }}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
              <Ionicons name="checkmark-circle" size={16} color="#10b981" />
              <Text style={{ fontSize: 14, color: colors.textSecondary }}>Automatic transaction parsing</Text>
            </View>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
              <Ionicons name="checkmark-circle" size={16} color="#10b981" />
              <Text style={{ fontSize: 14, color: colors.textSecondary }}>Smart expense categorization</Text>
            </View>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
              <Ionicons name="checkmark-circle" size={16} color="#10b981" />
              <Text style={{ fontSize: 14, color: colors.textSecondary }}>Local data processing</Text>
            </View>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
              <Ionicons name="checkmark-circle" size={16} color="#10b981" />
              <Text style={{ fontSize: 14, color: colors.textSecondary }}>Biometric security</Text>
            </View>
          </View>
          
          <Text style={{ fontSize: 16, fontWeight: 'bold', color: colors.text, marginBottom: 16 }}>Developer</Text>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12, marginBottom: 20 }}>
            <Image
              source={{ uri: 'https://avatars.githubusercontent.com/u/44018192?v=4' }}
              style={{ width: 40, height: 40, borderRadius: 20 }}
            />
            <View>
              <Text style={{ fontSize: 14, fontWeight: '600', color: colors.text }}>Pratik Deshmukh</Text>
              <Text style={{ fontSize: 12, color: colors.textSecondary }}>Programmer Analyst</Text>
            </View>
          </View>
          
          <View style={{ padding: 16, backgroundColor: colors.chipBg, borderRadius: 12 }}>
            <Text style={{ fontSize: 12, color: colors.textSecondary, textAlign: 'center' }}>
              Built with React Native & Expo
            </Text>
            <Text style={{ fontSize: 12, color: colors.textSecondary, textAlign: 'center', marginTop: 4 }}>
              Made with ❤️ for privacy-conscious users
            </Text>
          </View>
        </View>
      </SettingsBottomSheet>

      <SettingsBottomSheet
        visible={showApiUrlSheet}
        onClose={() => setShowApiUrlSheet(false)}
        title="API URL"
      >
        <View>
          <Text style={{ fontSize: 14, color: colors.textSecondary, marginBottom: 16, lineHeight: 20 }}>
            Enter the Google Apps Script URL for your transaction data. The app will fetch and save transactions using this endpoint.
          </Text>
          <TextInput
            style={{
              backgroundColor: colors.card,
              borderRadius: 12,
              padding: 16,
              fontSize: 14,
              color: colors.text,
              borderWidth: 1,
              borderColor: colors.border,
              minHeight: 80,
              textAlignVertical: 'top',
            }}
            placeholder="https://script.google.com/macros/s/.../exec"
            placeholderTextColor={colors.textMuted}
            value={apiUrlInput}
            onChangeText={setApiUrlInput}
            multiline
            autoCapitalize="none"
            autoCorrect={false}
          />
          <TouchableOpacity
            style={{
              backgroundColor: '#EA2831',
              paddingVertical: 14,
              borderRadius: 12,
              alignItems: 'center',
              marginTop: 20,
            }}
            onPress={saveApiUrl}
          >
            <Text style={{ fontSize: 16, fontWeight: 'bold', color: 'white' }}>Save</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={{
              paddingVertical: 12,
              alignItems: 'center',
              marginTop: 12,
            }}
            onPress={() => {
              setApiUrlInput('https://script.google.com/macros/s/AKfycbzzAVWc8Yg-BYJoipLHIvJNaQdDr53CLiru6csh9CtQU7eeIO2ywDYW7BkHGpw4Opdx2w/exec');
            }}
          >
            <Text style={{ fontSize: 14, fontWeight: '600', color: colors.textSecondary }}>Reset to Default</Text>
          </TouchableOpacity>
        </View>
      </SettingsBottomSheet>
    </SafeAreaView>
  );
}