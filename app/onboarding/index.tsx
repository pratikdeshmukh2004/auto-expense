import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import React, { useRef, useEffect, useState } from 'react';
import { Animated, Easing, Text, TextInput, TouchableOpacity, View, KeyboardAvoidingView, Platform, Alert, ScrollView, Image, Linking } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ApiService } from '../../services/ApiService';
import { useTheme } from '../../providers/ThemeProvider';
import SettingsBottomSheet from '../../components/modals/SettingsBottomSheet';

type SheetType = 'about' | 'encryption' | null;

export default function OnboardingScreen() {
  const { colors } = useTheme();
  const [url, setUrl] = useState('');
  const [loading, setLoading] = useState(false);
  const [activeSheet, setActiveSheet] = useState<SheetType>(null);
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(40)).current;
  const iconBounce = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, { toValue: 1, duration: 600, useNativeDriver: true }),
      Animated.timing(slideAnim, { toValue: 0, duration: 600, easing: Easing.out(Easing.back(1.2)), useNativeDriver: true }),
    ]).start();

    Animated.loop(
      Animated.sequence([
        Animated.timing(iconBounce, { toValue: -8, duration: 1000, easing: Easing.inOut(Easing.ease), useNativeDriver: true }),
        Animated.timing(iconBounce, { toValue: 0, duration: 1000, easing: Easing.inOut(Easing.ease), useNativeDriver: true }),
      ])
    ).start();
  }, []);

  const handleContinue = async () => {
    const trimmed = url.trim();
    if (!trimmed) {
      Alert.alert('Required', 'Please enter your API URL to continue.');
      return;
    }
    if (!trimmed.startsWith('http://') && !trimmed.startsWith('https://')) {
      Alert.alert('Invalid URL', 'URL must start with http:// or https://');
      return;
    }

    setLoading(true);
    try {
      const response = await fetch(trimmed);
      const json = await response.json();
      if (!json.data || !Array.isArray(json.data)) {
        Alert.alert('Invalid API', 'Could not fetch transactions from this URL. Please check and try again.');
        return;
      }
      await ApiService.setApiUrl(trimmed);
      router.replace('/dashboard');
    } catch {
      Alert.alert('Invalid URL', 'Unable to connect to this URL. Please verify the endpoint and try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.background }}>
      <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <ScrollView contentContainerStyle={{ flexGrow: 1, justifyContent: 'center', paddingHorizontal: 24, paddingVertical: 32 }} keyboardShouldPersistTaps="handled">
          <Animated.View style={{ opacity: fadeAnim, transform: [{ translateY: slideAnim }] }}>

            {/* Illustration */}
            <Animated.View style={{ alignItems: 'center', marginBottom: 36, transform: [{ translateY: iconBounce }] }}>
              <View style={{
                width: 100, height: 100, borderRadius: 30,
                backgroundColor: 'rgba(234, 40, 49, 0.1)',
                alignItems: 'center', justifyContent: 'center',
              }}>
                <Ionicons name="server-outline" size={48} color="#EA2831" />
              </View>
            </Animated.View>

            {/* Title */}
            <Text style={{ fontSize: 28, fontWeight: '800', color: colors.text, textAlign: 'center', marginBottom: 8 }}>
              Connect Your Backend
            </Text>
            <Text style={{ fontSize: 15, color: colors.textSecondary, textAlign: 'center', lineHeight: 22, marginBottom: 32 }}>
              Enter your Google Apps Script URL or custom API endpoint to sync your expenses.
            </Text>

            {/* Input */}
            <View style={{
              backgroundColor: colors.card,
              borderRadius: 16, paddingHorizontal: 16, paddingVertical: 4,
              flexDirection: 'row', alignItems: 'center',
              borderWidth: 1, borderColor: colors.border,
              shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.05, shadowRadius: 8, elevation: 2,
            }}>
              <Ionicons name="link-outline" size={20} color={colors.textMuted} style={{ marginRight: 10 }} />
              <TextInput
                placeholder="https://your-api-url.com/exec"
                placeholderTextColor={colors.textMuted}
                value={url}
                onChangeText={setUrl}
                autoCapitalize="none"
                autoCorrect={false}
                keyboardType="url"
                style={{ flex: 1, fontSize: 15, color: colors.text, paddingVertical: 14 }}
              />
            </View>

            {/* Info cards */}
            <View style={{ marginTop: 24, gap: 12 }}>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
                <Ionicons name="shield-checkmark-outline" size={18} color="#10b981" />
                <Text style={{ fontSize: 13, color: colors.textSecondary, flex: 1 }}>Stored securely on your device</Text>
              </View>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
                <Ionicons name="cloud-offline-outline" size={18} color="#6366f1" />
                <Text style={{ fontSize: 13, color: colors.textSecondary, flex: 1 }}>No data sent to third parties</Text>
              </View>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
                <Ionicons name="swap-horizontal-outline" size={18} color="#f59e0b" />
                <Text style={{ fontSize: 13, color: colors.textSecondary, flex: 1 }}>You can change this later in Settings</Text>
              </View>
            </View>

            {/* Button */}
            <TouchableOpacity
              onPress={handleContinue}
              disabled={loading}
              style={{
                marginTop: 40, backgroundColor: '#EA2831', borderRadius: 14,
                paddingVertical: 16, alignItems: 'center',
                shadowColor: '#EA2831', shadowOffset: { width: 0, height: 6 }, shadowOpacity: 0.3, shadowRadius: 12, elevation: 6,
                opacity: loading ? 0.7 : 1,
              }}
            >
              <Text style={{ fontSize: 17, fontWeight: '700', color: '#fff' }}>
                {loading ? 'Verifying...' : 'Continue'}
              </Text>
            </TouchableOpacity>

          </Animated.View>

        </ScrollView>

        {/* End-to-End Encrypted link */}
        <TouchableOpacity onPress={() => setActiveSheet('encryption')} style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6, paddingTop: 16 }}>
          <Ionicons name="lock-closed" size={16} color="#EA2831" />
          <Text style={{ fontSize: 13, fontWeight: '600', color: '#EA2831' }}>End-to-End Encrypted</Text>
        </TouchableOpacity>

        {/* About Us link pinned at bottom */}
        <TouchableOpacity onPress={() => setActiveSheet('about')} style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6, paddingVertical: 16 }}>
          <Ionicons name="information-circle-outline" size={16} color={colors.textMuted} />
          <Text style={{ fontSize: 13, fontWeight: '600', color: colors.textMuted }}>About Us</Text>
        </TouchableOpacity>
      </KeyboardAvoidingView>

      {/* End-to-End Encryption Sheet */}
      <SettingsBottomSheet
        visible={activeSheet === 'encryption'}
        onClose={() => setActiveSheet(null)}
        title="Security & Encryption"
      >
        <View>
          <View style={{ alignItems: 'center', marginBottom: 24 }}>
            <View style={{
              width: 80, height: 80, borderRadius: 40,
              backgroundColor: 'rgba(16, 185, 129, 0.1)',
              alignItems: 'center', justifyContent: 'center', marginBottom: 16,
            }}>
              <Ionicons name="shield-checkmark" size={40} color="#10b981" />
            </View>
            <Text style={{ fontSize: 20, fontWeight: 'bold', color: colors.text }}>Your Data is Safe</Text>
            <Text style={{ fontSize: 14, color: colors.textSecondary, marginTop: 4 }}>Encrypted & processed locally</Text>
          </View>

          <Text style={{ fontSize: 16, fontWeight: 'bold', color: colors.text, marginBottom: 16 }}>How It Works</Text>
          <Text style={{ fontSize: 14, color: colors.textSecondary, lineHeight: 20, marginBottom: 20 }}>
            Auto Expense stores all sensitive data (API URL, MPIN, preferences) using Expo SecureStore, which leverages iOS Keychain and Android Keystore for hardware-backed encryption. Your device communicates directly with your own API endpoint over HTTPS — no middleman servers involved.
          </Text>

          <Text style={{ fontSize: 16, fontWeight: 'bold', color: colors.text, marginBottom: 16 }}>Security Features</Text>
          <View style={{ gap: 12, marginBottom: 20 }}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
              <Ionicons name="shield" size={16} color="#10b981" />
              <Text style={{ fontSize: 14, color: colors.textSecondary }}>Hardware-backed encrypted storage</Text>
            </View>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
              <Ionicons name="shield" size={16} color="#10b981" />
              <Text style={{ fontSize: 14, color: colors.textSecondary }}>All parsing happens on-device</Text>
            </View>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
              <Ionicons name="shield" size={16} color="#10b981" />
              <Text style={{ fontSize: 14, color: colors.textSecondary }}>No analytics, tracking, or ads</Text>
            </View>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
              <Ionicons name="shield" size={16} color="#10b981" />
              <Text style={{ fontSize: 14, color: colors.textSecondary }}>No servers or databases on our end</Text>
            </View>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
              <Ionicons name="shield" size={16} color="#10b981" />
              <Text style={{ fontSize: 14, color: colors.textSecondary }}>Biometric lock for app access</Text>
            </View>
          </View>

          <View style={{ padding: 16, backgroundColor: colors.chipBg, borderRadius: 12 }}>
            <Text style={{ fontSize: 12, color: colors.textSecondary, textAlign: 'center' }}>
              We can't see, access, or recover your data.
            </Text>
            <Text style={{ fontSize: 12, color: colors.textSecondary, textAlign: 'center', marginTop: 4 }}>
              You are in full control — always.
            </Text>
          </View>
        </View>
      </SettingsBottomSheet>

      {/* About Us Sheet */}
      <SettingsBottomSheet
        visible={activeSheet === 'about'}
        onClose={() => setActiveSheet(null)}
        title="About Us"
      >
        <View>
          <View style={{ alignItems: 'center', marginBottom: 24 }}>
            <Image
              source={require('../../assets/images/logo.png')}
              style={{ width: 80, height: 80, borderRadius: 40, marginBottom: 16 }}
            />
            <Text style={{ fontSize: 20, fontWeight: 'bold', color: colors.text }}>Auto Expense</Text>
            <Text style={{ fontSize: 14, color: colors.textSecondary }}>Version 1.0.4</Text>
          </View>

          <Text style={{ fontSize: 16, fontWeight: 'bold', color: colors.text, marginBottom: 16 }}>Our Mission</Text>
          <Text style={{ fontSize: 14, color: colors.textSecondary, lineHeight: 20, marginBottom: 20 }}>
            Auto Expense automatically reads your bank notifications, parses transaction details, and categorizes your spending — all without ever sending data to external servers.
          </Text>

          <Text style={{ fontSize: 16, fontWeight: 'bold', color: colors.text, marginBottom: 16 }}>Features</Text>
          <View style={{ gap: 12, marginBottom: 20 }}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
              <Ionicons name="checkmark-circle" size={16} color="#10b981" />
              <Text style={{ fontSize: 14, color: colors.textSecondary }}>Auto-parse SMS & notification transactions</Text>
            </View>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
              <Ionicons name="checkmark-circle" size={16} color="#10b981" />
              <Text style={{ fontSize: 14, color: colors.textSecondary }}>Sync with Google Sheets via your own API</Text>
            </View>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
              <Ionicons name="checkmark-circle" size={16} color="#10b981" />
              <Text style={{ fontSize: 14, color: colors.textSecondary }}>Custom categories & payment methods</Text>
            </View>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
              <Ionicons name="checkmark-circle" size={16} color="#10b981" />
              <Text style={{ fontSize: 14, color: colors.textSecondary }}>Spending trends & category breakdown</Text>
            </View>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
              <Ionicons name="checkmark-circle" size={16} color="#10b981" />
              <Text style={{ fontSize: 14, color: colors.textSecondary }}>Biometric & MPIN security</Text>
            </View>
          </View>

          <Text style={{ fontSize: 16, fontWeight: 'bold', color: colors.text, marginBottom: 16 }}>Developer</Text>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12, marginBottom: 12 }}>
            <Image
              source={{ uri: 'https://avatars.githubusercontent.com/u/44018192?v=4' }}
              style={{ width: 40, height: 40, borderRadius: 20 }}
            />
            <View>
              <Text style={{ fontSize: 14, fontWeight: '600', color: colors.text }}>Pratik Deshmukh</Text>
              <Text style={{ fontSize: 12, color: colors.textSecondary }}>Programmer Analyst</Text>
            </View>
          </View>
          <TouchableOpacity onPress={() => Linking.openURL('mailto:pratikdeshmukhlobhi@gmail.com')} style={{ flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 20 }}>
            <Ionicons name="mail-outline" size={16} color="#EA2831" />
            <Text style={{ fontSize: 13, color: '#EA2831', fontWeight: '500' }}>pratikdeshmukhlobhi@gmail.com</Text>
          </TouchableOpacity>
        </View>
      </SettingsBottomSheet>
    </SafeAreaView>
  );
}
