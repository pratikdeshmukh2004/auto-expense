import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import * as SecureStore from 'expo-secure-store';
import React, { useEffect, useRef, useState } from 'react';
import { Animated, StatusBar, StyleSheet, Text, TouchableOpacity, View, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { AnimatedCoins } from '../../components/animations';
import { SelectSheetModal } from '../../components/modals';
import { StorageKeys } from '../../constants/StorageKeys';
import { AuthService } from '../../services/AuthService';
import { GoogleSheetsService } from '../../services/GoogleSheetsService';

export default function StorageSelectionScreen() {
  const [selectedStorage, setSelectedStorage] = useState<'offline' | 'auto' | 'existing'>('offline');
  const [isGuest, setIsGuest] = useState(false);
  const [showSheetModal, setShowSheetModal] = useState(false);
  const [selectedSheetName, setSelectedSheetName] = useState<string>('');
  const [isCreatingSheet, setIsCreatingSheet] = useState(false);
  
  const logoScale = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    checkUserType();
    animateLogo();
  }, []);

  const animateLogo = () => {
    Animated.spring(logoScale, {
      toValue: 1,
      tension: 40,
      friction: 7,
      useNativeDriver: true,
    }).start();
  };

  const checkUserType = async () => {
    const guestStatus = await AuthService.isGuest();
    setIsGuest(guestStatus);
    setSelectedStorage(guestStatus ? 'offline' : 'auto');
  };

  const handleContinue = async () => {
    await SecureStore.setItemAsync(StorageKeys.STORAGE_TYPE, selectedStorage);
    await initializeDefaultData();
    
    if (selectedStorage === 'auto') {
      setIsCreatingSheet(true);
      const result = await GoogleSheetsService.createAutoExpenseSheet();
      setIsCreatingSheet(false);
      
      if (!result) {
        alert('Failed to create Google Sheet. Please try again.');
        return;
      }
    }
    
    router.replace('/dashboard');
  };

  const initializeDefaultData = async () => {
    const defaultCategories = [
      { id: '1', name: 'Food & Dining', icon: 'restaurant', color: '#FF6B6B', description: 'Restaurants, groceries, food delivery' },
      { id: '2', name: 'Transportation', icon: 'car', color: '#4ECDC4', description: 'Fuel, taxi, public transport' },
      { id: '3', name: 'Shopping', icon: 'cart', color: '#95E1D3', description: 'Clothing, electronics, online shopping' },
      { id: '4', name: 'Entertainment', icon: 'game-controller', color: '#F38181', description: 'Movies, games, hobbies' },
      { id: '5', name: 'Bills & Utilities', icon: 'receipt', color: '#AA96DA', description: 'Electricity, water, internet, phone' },
      { id: '6', name: 'Healthcare', icon: 'medical', color: '#FCBAD3', description: 'Doctor, pharmacy, insurance' },
      { id: '7', name: 'Education', icon: 'school', color: '#A8D8EA', description: 'Tuition, books, courses' },
      { id: '8', name: 'Travel', icon: 'airplane', color: '#FFD93D', description: 'Flights, hotels, vacation' },
      { id: '9', name: 'Fitness', icon: 'fitness', color: '#6BCF7F', description: 'Gym, sports, wellness' },
      { id: '10', name: 'Personal Care', icon: 'cut', color: '#FF9CEE', description: 'Salon, spa, grooming' },
      { id: '11', name: 'Home & Garden', icon: 'home', color: '#98D8C8', description: 'Furniture, decor, maintenance' },
      { id: '12', name: 'Gifts & Donations', icon: 'gift', color: '#F7B731', description: 'Presents, charity, contributions' },
      { id: '13', name: 'Insurance', icon: 'shield-checkmark', color: '#5F27CD', description: 'Life, health, vehicle insurance' },
      { id: '14', name: 'Investments', icon: 'trending-up', color: '#00D2D3', description: 'Stocks, mutual funds, savings' },
      { id: '15', name: 'Subscriptions', icon: 'repeat', color: '#FF6348', description: 'Netflix, Spotify, memberships' },
      { id: '16', name: 'Pet Care', icon: 'paw', color: '#FFA502', description: 'Pet food, vet, grooming' },
      { id: '17', name: 'Salary', icon: 'wallet', color: '#26DE81', description: 'Monthly salary, wages, income' },
      { id: '18', name: 'Income', icon: 'cash', color: '#20BF6B', description: 'Freelance, business, other income' },
      { id: '19', name: 'Others', icon: 'ellipsis-horizontal', color: '#C7CEEA', description: 'Miscellaneous expenses' },
    ];

    const defaultPaymentMethods = [
      { id: '1', name: 'Cash', type: 'cash', icon: 'cash', color: '#4CAF50' },
      { id: '2', name: 'Credit Card', type: 'card', icon: 'card', color: '#2196F3', last4: '****' },
      { id: '3', name: 'Debit Card', type: 'card', icon: 'card', color: '#FF9800', last4: '****' },
      { id: '4', name: 'UPI', type: 'upi', icon: 'phone-portrait', color: '#9C27B0' },
    ];

    const defaultKeywords = [
      { id: '1', keyword: 'debited', category: 'expense' },
      { id: '2', keyword: 'credited', category: 'income' },
      { id: '3', keyword: 'paid', category: 'expense' },
      { id: '4', keyword: 'received', category: 'income' },
      { id: '5', keyword: 'spent', category: 'expense' },
      { id: '6', keyword: 'withdrawn', category: 'expense' },
      { id: '7', keyword: 'deposited', category: 'income' },
      { id: '8', keyword: 'transfer', category: 'expense' },
      { id: '9', keyword: 'payment', category: 'expense' },
      { id: '10', keyword: 'purchase', category: 'expense' },
      { id: '11', keyword: 'transaction', category: 'expense' },
      { id: '12', keyword: 'charged', category: 'expense' },
      { id: '13', keyword: 'salary', category: 'income' },
      { id: '14', keyword: 'refund', category: 'income' },
      { id: '15', keyword: 'cashback', category: 'income' },
      { id: '16', keyword: 'reward', category: 'income' },
      { id: '17', keyword: 'upi', category: 'expense' },
      { id: '18', keyword: 'atm', category: 'expense' },
      { id: '19', keyword: 'pos', category: 'expense' },
      { id: '20', keyword: 'online', category: 'expense' },
      { id: '21', keyword: 'hdfc', category: 'expense' },
      { id: '22', keyword: 'icici', category: 'expense' },
      { id: '23', keyword: 'sbi', category: 'expense' },
      { id: '24', keyword: 'axis', category: 'expense' },
      { id: '25', keyword: 'kotak', category: 'expense' },
    ];

    await SecureStore.setItemAsync(StorageKeys.CATEGORIES, JSON.stringify(defaultCategories));
    await SecureStore.setItemAsync(StorageKeys.PAYMENT_METHODS, JSON.stringify(defaultPaymentMethods));
    await SecureStore.setItemAsync(StorageKeys.BANK_KEYWORDS, JSON.stringify(defaultKeywords));
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#F8FAFC" />
      
      <AnimatedCoins />
      
      {/* Hero Section */}
      <View style={styles.heroSection}>
        <Animated.Image
          source={require('../../assets/images/logo.png')}
          style={[
            styles.logo,
            { transform: [{ scale: logoScale }] }
          ]}
          resizeMode="contain"
        />
        <Text style={styles.heroTitle}>Choose Your Storage</Text>
        <Text style={styles.heroSubtitle}>Select how you want to manage your expense data</Text>
      </View>

      {/* Content */}
      <View style={styles.content}>
        {/* Storage Options */}
        <View style={styles.optionsContainer}>
          {/* Offline Storage */}
          <TouchableOpacity
            style={[
              styles.optionCard,
              selectedStorage === 'offline' && styles.optionCardSelected
            ]}
            onPress={() => setSelectedStorage('offline')}
            activeOpacity={0.7}
          >
            <View style={[
              styles.optionIconContainer,
              selectedStorage !== 'offline' && styles.optionIconInactive
            ]}>
              <Ionicons name="save-outline" size={24} color={selectedStorage === 'offline' ? '#EA2831' : '#64748B'} />
            </View>
            
            <View style={styles.optionContent}>
              <Text style={styles.optionTitle}>Offline Storage</Text>
              <Text style={styles.optionDescription}>
                Store your data privately on this device.
              </Text>
            </View>
          </TouchableOpacity>

          {/* Auto-Create Sheet */}
          <TouchableOpacity
            style={[
              styles.optionCard,
              selectedStorage === 'auto' && styles.optionCardSelected,
              isGuest && styles.optionCardDisabled
            ]}
            onPress={() => !isGuest && setSelectedStorage('auto')}
            activeOpacity={isGuest ? 1 : 0.7}
            disabled={isGuest}
          >
            <View style={[
              styles.defaultBadge,
              selectedStorage !== 'auto' && styles.badgeInactive
            ]}>
              <Text style={styles.defaultBadgeText}>RECOMMENDED</Text>
            </View>
            
            <View style={[
              styles.optionIconContainer,
              selectedStorage !== 'auto' && styles.optionIconInactive
            ]}>
              <Ionicons name="add-circle-outline" size={24} color={selectedStorage === 'auto' ? '#EA2831' : '#64748B'} />
            </View>
            
            <View style={styles.optionContent}>
              <Text style={styles.optionTitle}>Auto-Create Sheet</Text>
              <Text style={styles.optionDescription}>
                Automatically sync and backup to a new cloud spreadsheet.
              </Text>
            </View>
          </TouchableOpacity>

          {/* Select Existing Sheet */}
          <TouchableOpacity
            style={[
              styles.optionCard,
              selectedStorage === 'existing' && styles.optionCardSelected,
              isGuest && styles.optionCardDisabled
            ]}
            onPress={() => {
              if (!isGuest) {
                setShowSheetModal(true);
              }
            }}
            activeOpacity={isGuest ? 1 : 0.7}
            disabled={isGuest}
          >
            <View style={[
              styles.optionIconContainer,
              selectedStorage !== 'existing' && styles.optionIconInactive
            ]}>
              <Ionicons name="folder-open-outline" size={24} color={selectedStorage === 'existing' ? '#EA2831' : '#64748B'} />
            </View>
            
            <View style={styles.optionContent}>
              <Text style={styles.optionTitle}>Select Existing Sheet</Text>
              <Text style={styles.optionDescription}>
                {selectedSheetName || 'Choose a recent spreadsheet from your Google account.'}
              </Text>
            </View>
          </TouchableOpacity>
        </View>

        {/* Footer */}
        <View style={styles.footer}>
          <TouchableOpacity
            style={styles.continueButton}
            onPress={handleContinue}
            activeOpacity={0.8}
            disabled={isCreatingSheet}
          >
            {isCreatingSheet ? (
              <ActivityIndicator size="small" color="white" />
            ) : (
              <>
                <Text style={styles.continueButtonText}>Continue</Text>
                <Ionicons name="arrow-forward" size={20} color="white" />
              </>
            )}
          </TouchableOpacity>

          <View style={styles.securityBadge}>
            <Ionicons name="lock-closed" size={12} color="#EA2831" />
            <Text style={styles.securityText}>END-TO-END ENCRYPTED</Text>
          </View>
        </View>
      </View>

      <SelectSheetModal
        visible={showSheetModal}
        onClose={() => setShowSheetModal(false)}
        onConfirm={(sheetId, sheetName) => {
          setSelectedSheetName(sheetName);
          setSelectedStorage('existing');
        }}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  heroSection: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 40,
    paddingHorizontal: 24,
    position: 'relative',
    zIndex: 1,
  },
  logoContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  logo: {
    width: 80,
    height: 80,
  },
  heroTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#0F172A',
    marginBottom: 8,
    marginTop: 8,
  },
  heroSubtitle: {
    fontSize: 14,
    color: '#64748B',
    textAlign: 'center',
  },
  content: {
    flex: 1,
    paddingHorizontal: 24,
    paddingTop: 8,
    paddingBottom: 24,
    maxWidth: 448,
    width: '100%',
    alignSelf: 'center',
  },
  optionsContainer: {
    gap: 16,
    marginBottom: 24,
  },
  optionCard: {
    backgroundColor: 'white',
    padding: 20,
    borderRadius: 24,
    borderWidth: 1,
    borderColor: '#F1F1F1',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.02,
    shadowRadius: 12,
    elevation: 2,
    position: 'relative',
  },
  optionCardSelected: {
    borderWidth: 2,
    borderColor: '#EA2831',
    shadowColor: '#EA2831',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.15,
    shadowRadius: 20,
    elevation: 8,
  },
  defaultBadge: {
    position: 'absolute',
    top: 0,
    right: 0,
    backgroundColor: '#EA2831',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderTopRightRadius: 24,
    borderBottomLeftRadius: 12,
  },
  defaultBadgeText: {
    color: 'white',
    fontSize: 9,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  badgeInactive: {
    backgroundColor: '#94A3B8',
  },
  optionCardDisabled: {
    opacity: 0.4,
  },
  optionIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 12,
    backgroundColor: '#FEF2F2',
    alignItems: 'center',
    justifyContent: 'center',
  },
  optionIconInactive: {
    backgroundColor: '#F8FAFC',
  },
  optionContent: {
    flex: 1,
    paddingRight: 12,
    paddingTop: 4,
  },
  optionTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#121212',
    marginBottom: 4,
  },
  optionDescription: {
    fontSize: 12,
    color: '#64748B',
    lineHeight: 16,
  },
  footer: {
    marginTop: 'auto',
    paddingTop: 24,
  },
  continueButton: {
    width: '100%',
    height: 56,
    borderRadius: 16,
    backgroundColor: '#EA2831',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    shadowColor: '#EA2831',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 12,
    elevation: 4,
    marginBottom: 16,
  },
  continueButtonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: '700',
  },
  securityBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    marginBottom: 10,
  },
  securityText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#94A3B8',
    letterSpacing: 1.2,
  },
});
