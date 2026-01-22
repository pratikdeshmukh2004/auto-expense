import { Ionicons, MaterialIcons } from '@expo/vector-icons';
import { router, useFocusEffect } from 'expo-router';
import * as SecureStore from 'expo-secure-store';
import React, { useEffect, useState } from 'react';
import { Alert, Image, Platform, ScrollView, Switch, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import SettingsBottomSheet from '../../components/modals/SettingsBottomSheet';
import { StorageKeys } from '../../constants/StorageKeys';
import { AuthService } from '../../services/AuthService';
import { useCategories, usePaymentMethods } from '../../hooks/useQueries';

export default function SettingsIndex() {
  const [autoParsing, setAutoParsing] = useState(true);
  const [dailySummary, setDailySummary] = useState(true);
  const [overspendingAlerts, setOverspendingAlerts] = useState(false);
  const [faceIdLock, setFaceIdLock] = useState(false);
  const [showPrivacySheet, setShowPrivacySheet] = useState(false);
  const [showHelpSheet, setShowHelpSheet] = useState(false);
  const [showAboutSheet, setShowAboutSheet] = useState(false);
  const [userName, setUserName] = useState<string | null>(null);
  const [userEmail, setUserEmail] = useState<string | null>(null);
  const [userPhoto, setUserPhoto] = useState<string | null>(null);
  const [isGuest, setIsGuest] = useState(false);

  // TanStack Query hooks
  const { data: categories = [], isLoading: categoriesLoading } = useCategories();
  const { data: paymentMethods = [], isLoading: paymentMethodsLoading } = usePaymentMethods();

  useEffect(() => {
    loadBiometricSetting();
    loadAutoParsingSettings();
    loadUserInfo();
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

  const loadAutoParsingSettings = async () => {
    const autoParsingEnabled = await SecureStore.getItemAsync(StorageKeys.AUTO_PARSING_ENABLED);
    setAutoParsing(autoParsingEnabled !== 'false');
  };

  const handleAutoParsingToggle = async (value: boolean) => {
    setAutoParsing(value);
    await SecureStore.setItemAsync(StorageKeys.AUTO_PARSING_ENABLED, value.toString());
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
          onPress: () => {
            // Just redirect to MPIN, do NOT clear session
            router.replace('/auth/mpin');
          }
        }
      ]
    );
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#f8f6f6' }}>
      {/* Header */}
      <View style={{
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        paddingHorizontal: 24,
        paddingVertical: 16,
        backgroundColor: 'rgba(248, 246, 246, 0.9)',
        borderBottomWidth: 1,
        borderBottomColor: '#e5e7eb',
      }}>
        <Text style={{ fontSize: 20, fontWeight: 'bold', color: '#1f2937' }}>Settings</Text>
      </View>

      <ScrollView style={{ flex: 1 }} showsVerticalScrollIndicator={false}>
        {/* Profile Section */}
        {isGuest ? (
          <View style={{ marginBottom: 24 }}>
            {/* Guest Header */}
            <View style={{ paddingHorizontal: 24, paddingVertical: 24, flexDirection: 'row', alignItems: 'center', gap: 16 }}>
              <View style={{
                width: 64,
                height: 64,
                borderRadius: 32,
                backgroundColor: '#e2e8f0', // slate-200
                alignItems: 'center',
                justifyContent: 'center',
                borderWidth: 2,
                borderColor: 'white',
              }}>
                <Ionicons name="person" size={32} color="#94a3b8" />
              </View>
              <View>
                <Text style={{ fontSize: 18, fontWeight: 'bold', color: '#1f2937' }}>Guest User</Text>
                <Text style={{ fontSize: 14, color: '#6b7280' }}>Local Mode</Text>
              </View>
            </View>

            {/* Security Update Card */}
            <View style={{ marginHorizontal: 16 }}>
              <View style={{
                position: 'relative',
                overflow: 'hidden',
                borderRadius: 24,
                borderWidth: 1,
                borderColor: 'rgba(234, 42, 51, 0.2)',
                padding: 24,
                backgroundColor: 'rgba(234, 42, 51, 0.05)',
              }}>
                <View style={{ position: 'relative', zIndex: 10 }}>
                  <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12, marginBottom: 12 }}>
                    <View style={{
                      backgroundColor: '#ea2a33',
                      padding: 6,
                      borderRadius: 8,
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}>
                      <MaterialIcons name="cloud-sync" size={14} color="white" />
                    </View>
                    <Text style={{
                      fontSize: 12,
                      fontWeight: 'bold',
                      color: '#ea2a33',
                      textTransform: 'uppercase',
                      letterSpacing: 2,
                    }}>
                      Security Update
                    </Text>
                  </View>

                  <Text style={{
                    fontSize: 18,
                    fontWeight: 'bold',
                    color: '#0f172a',
                    marginBottom: 8,
                    lineHeight: 22,
                  }}>
                    Secure your expenses
                  </Text>
                  
                  <Text style={{
                    fontSize: 14,
                    color: '#475569',
                    marginBottom: 20,
                    lineHeight: 20,
                  }}>
                    Your data is currently stored locally. Sign in now to secure it in the cloud and sync across devices.
                  </Text>

                  <TouchableOpacity
                    style={{
                      width: '100%',
                      backgroundColor: '#ea2a33',
                      paddingVertical: 14,
                      paddingHorizontal: 24,
                      borderRadius: 16,
                      alignItems: 'center',
                      shadowColor: '#ea2a33',
                      shadowOffset: { width: 0, height: 8 },
                      shadowOpacity: 0.25,
                      shadowRadius: 12,
                      elevation: 8,
                    }}
                    activeOpacity={0.98}
                    onPress={async () => {
                      await AuthService.logout();
                      router.replace('/auth/login');
                    }}
                  >
                    <Text style={{
                      color: 'white',
                      fontWeight: 'bold',
                      fontSize: 16,
                    }}>
                      Sign In / Create Account
                    </Text>
                  </TouchableOpacity>
                </View>
                
                {/* Decorative circle */}
                <View style={{
                  position: 'absolute',
                  right: -48,
                  top: -48,
                  width: 128,
                  height: 128,
                  backgroundColor: 'rgba(234, 42, 51, 0.05)',
                  borderRadius: 64,
                }} />
              </View>
            </View>
          </View>
        ) : (
          <View style={{ paddingHorizontal: 16, paddingVertical: 24, flexDirection: 'row', alignItems: 'center', gap: 16 }}>
            <View style={{ position: 'relative' }}>
              <Image
                source={{ uri: userPhoto || 'https://avatars.githubusercontent.com/u/44018192?v=4' }}
                style={{
                  width: 64,
                  height: 64,
                  borderRadius: 32,
                  borderWidth: 2,
                  borderColor: 'white',
                }}
              />
              <View style={{
                position: 'absolute',
                bottom: 0,
                right: 0,
                width: 20,
                height: 20,
                backgroundColor: '#10b981',
                borderRadius: 10,
                borderWidth: 2,
                borderColor: '#f8f6f6',
              }} />
            </View>
            <View>
              <Text style={{ fontSize: 18, fontWeight: 'bold', color: '#1f2937' }}>
                {userName}
              </Text>
              <Text style={{ fontSize: 14, color: '#6b7280' }}>
                {userEmail}
              </Text>
            </View>
          </View>
        )}

        {/* Data Parsing Section */}
        <View style={{ marginBottom: 24 }}>
          <Text style={{
            paddingHorizontal: 24,
            paddingVertical: 8,
            fontSize: 12,
            fontWeight: 'bold',
            color: isGuest ? '#d1d5db' : '#9ca3af',
            textTransform: 'uppercase',
            letterSpacing: 1,
          }}>{isGuest ? 'Data Parsing' : 'Data Parsing'}</Text>
          {isGuest && (
            <Text style={{
              paddingHorizontal: 24,
              fontSize: 10,
              color: '#9ca3af',
              textTransform: 'uppercase',
              letterSpacing: 1,
              marginTop: -4,
            }}>RESTRICTED</Text>
          )}
          
          <View style={{
            backgroundColor: 'white',
            borderRadius: 16,
            marginHorizontal: 16,
            shadowColor: '#000',
            shadowOffset: { width: 0, height: 1 },
            shadowOpacity: 0.05,
            shadowRadius: 2,
            elevation: 1,
            opacity: isGuest ? 0.7 : 1,
          }}>
            {/* Auto-Parsing Toggle */}
            <View style={{
              flexDirection: 'row',
              alignItems: 'center',
              justifyContent: 'space-between',
              padding: 16,
              borderBottomWidth: 1,
              borderBottomColor: '#f3f4f6',
            }}>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 16, flex: 1 }}>
                <View style={{
                  width: 40,
                  height: 40,
                  borderRadius: 12,
                  backgroundColor: isGuest ? 'rgba(156, 163, 175, 0.1)' : 'rgba(234, 42, 51, 0.1)',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}>
                  <Ionicons name="mail" size={20} color={isGuest ? '#9ca3af' : '#ea2a33'} />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={{ fontSize: 16, fontWeight: '600', color: isGuest ? '#9ca3af' : '#1f2937' }}>Auto-Parsing</Text>
                  <Text style={{ fontSize: 12, color: isGuest ? '#d1d5db' : '#6b7280' }}>
                    {isGuest ? 'Login to enable SMS tracking' : 'Read SMS & Email transactions automatically'}
                  </Text>
                </View>
              </View>
              <Switch
                value={autoParsing}
                onValueChange={isGuest ? undefined : handleAutoParsingToggle}
                trackColor={{ false: '#d1d5db', true: isGuest ? '#d1d5db' : '#ea2a33' }}
                thumbColor="white"
                disabled={isGuest}
              />
            </View>

            {/* Smart Parsing */}
            <TouchableOpacity 
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: 16,
              }}
              onPress={isGuest ? undefined : () => router.push('/settings/smart-parsing')}
              disabled={isGuest}
            >
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 16 }}>
                <View style={{
                  width: 40,
                  height: 40,
                  borderRadius: 12,
                  backgroundColor: isGuest ? 'rgba(156, 163, 175, 0.1)' : 'rgba(139, 92, 246, 0.1)',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}>
                  <Ionicons name="sparkles" size={20} color={isGuest ? '#9ca3af' : '#8b5cf6'} />
                </View>
                <View>
                  <Text style={{ fontSize: 16, fontWeight: '500', color: isGuest ? '#9ca3af' : '#1f2937' }}>Smart Parsing</Text>
                  <Text style={{ fontSize: 12, color: isGuest ? '#d1d5db' : '#6b7280' }}>Configure keywords & senders</Text>
                </View>
              </View>
              <Ionicons name="chevron-forward" size={20} color={isGuest ? '#d1d5db' : '#9ca3af'} />
            </TouchableOpacity>
          </View>

          <Text style={{
            paddingHorizontal: 24,
            paddingTop: 8,
            fontSize: 11,
            color: '#9ca3af',
            flexDirection: 'row',
            alignItems: 'center',
          }}>
          🔒 {isGuest ? 'Data is stored locally on this device only.' : 'Your data is processed locally and never leaves your device.'}
          </Text>
        </View>

        {/* Finance Management Section */}
        <View style={{ marginBottom: 24 }}>
          <Text style={{
            paddingHorizontal: 24,
            paddingVertical: 8,
            fontSize: 12,
            fontWeight: 'bold',
            color: '#9ca3af',
            textTransform: 'uppercase',
            letterSpacing: 1,
          }}>Finance Management</Text>
          
          <View style={{
            backgroundColor: 'white',
            borderRadius: 16,
            marginHorizontal: 16,
            shadowColor: '#000',
            shadowOffset: { width: 0, height: 1 },
            shadowOpacity: 0.05,
            shadowRadius: 2,
            elevation: 1,
          }}>
            {/* Storage Management */}
            <TouchableOpacity 
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: 16,
                borderBottomWidth: 1,
                borderBottomColor: '#f3f4f6',
              }}
              onPress={() => router.push('/settings/storage-management')}
            >
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 16 }}>
                <View style={{
                  width: 40,
                  height: 40,
                  borderRadius: 12,
                  backgroundColor: 'rgba(59, 130, 246, 0.1)',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}>
                  <Ionicons name="cloud" size={20} color="#3b82f6" />
                </View>
                <View>
                  <Text style={{ fontSize: 16, fontWeight: '500', color: '#1f2937' }}>Storage Management</Text>
                  <Text style={{ fontSize: 12, color: '#6b7280' }}>Offline/Online storage settings</Text>
                </View>
              </View>
              <Ionicons name="chevron-forward" size={20} color="#9ca3af" />
            </TouchableOpacity>

            {/* Manage Categories */}
            <TouchableOpacity 
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: 16,
                borderBottomWidth: 1,
                borderBottomColor: '#f3f4f6',
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
                  <Text style={{ fontSize: 16, fontWeight: '500', color: '#1f2937' }}>Manage Categories</Text>
                  <Text style={{ fontSize: 12, color: '#6b7280' }}>{categoriesLoading ? 'Loading...' : `${categories.length} categories configured`}</Text>
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
                  <Text style={{ fontSize: 16, fontWeight: '500', color: '#1f2937' }}>Payment Methods</Text>
                  <Text style={{ fontSize: 12, color: '#6b7280' }}>{paymentMethodsLoading ? 'Loading...' : `${paymentMethods.length} methods configured`}</Text>
                </View>
              </View>
              <Ionicons name="chevron-forward" size={20} color="#9ca3af" />
            </TouchableOpacity>
          </View>
        </View>

        {/* Preferences Section */}
        <View style={{ marginBottom: 24 }}>
          <Text style={{
            paddingHorizontal: 24,
            paddingVertical: 8,
            fontSize: 12,
            fontWeight: 'bold',
            color: '#9ca3af',
            textTransform: 'uppercase',
            letterSpacing: 1,
          }}>Preferences</Text>
          
          <View style={{
            backgroundColor: 'white',
            borderRadius: 16,
            marginHorizontal: 16,
            shadowColor: '#000',
            shadowOffset: { width: 0, height: 1 },
            shadowOpacity: 0.05,
            shadowRadius: 2,
            elevation: 1,
          }}>
            {/* Daily Summary Toggle */}
            <View style={{
              flexDirection: 'row',
              alignItems: 'center',
              justifyContent: 'space-between',
              padding: 16,
              borderBottomWidth: 1,
              borderBottomColor: '#f3f4f6',
            }}>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 16, flex: 1 }}>
                <View style={{
                  width: 40,
                  height: 40,
                  borderRadius: 12,
                  backgroundColor: 'rgba(147, 51, 234, 0.1)',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}>
                  <Ionicons name="notifications" size={20} color="#9333ea" />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={{ fontSize: 16, fontWeight: '500', color: '#1f2937' }}>Daily Summary</Text>
                  <Text style={{ fontSize: 12, color: '#6b7280' }}>Daily spending digest at 8:00 PM</Text>
                </View>
              </View>
              <Switch
                value={dailySummary}
                onValueChange={setDailySummary}
                trackColor={{ false: '#d1d5db', true: '#ea2a33' }}
                thumbColor="white"
              />
            </View>

            {/* Overspending Alerts Toggle */}
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
                  backgroundColor: 'rgba(239, 68, 68, 0.1)',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}>
                  <Ionicons name="warning" size={20} color="#ef4444" />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={{ fontSize: 16, fontWeight: '500', color: '#1f2937' }}>Overspending Alerts</Text>
                  <Text style={{ fontSize: 12, color: '#6b7280' }}>Get notified when over budget</Text>
                </View>
              </View>
              <Switch
                value={overspendingAlerts}
                onValueChange={setOverspendingAlerts}
                trackColor={{ false: '#d1d5db', true: '#ea2a33' }}
                thumbColor="white"
              />
            </View>
          </View>
        </View>

        {/* Security Section */}
        <View style={{ marginBottom: 24 }}>
          <Text style={{
            paddingHorizontal: 24,
            paddingVertical: 8,
            fontSize: 12,
            fontWeight: 'bold',
            color: '#9ca3af',
            textTransform: 'uppercase',
            letterSpacing: 1,
          }}>Security</Text>
          
          <View style={{
            backgroundColor: 'white',
            borderRadius: 16,
            marginHorizontal: 16,
            shadowColor: '#000',
            shadowOffset: { width: 0, height: 1 },
            shadowOpacity: 0.05,
            shadowRadius: 2,
            elevation: 1,
          }}>
            {/* Biometric Lock Toggle */}
            <View style={{
              flexDirection: 'row',
              alignItems: 'center',
              justifyContent: 'space-between',
              padding: 16,
              borderBottomWidth: 1,
              borderBottomColor: '#f3f4f6',
            }}>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 16, flex: 1 }}>
                <View style={{
                  width: 40,
                  height: 40,
                  borderRadius: 12,
                  backgroundColor: 'rgba(34, 197, 94, 0.1)',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}>
                  <Ionicons name={Platform.OS === 'ios' ? 'scan' : 'finger-print'} size={20} color="#22c55e" />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={{ fontSize: 16, fontWeight: '500', color: '#1f2937' }}>
                    {Platform.OS === 'ios' ? 'Face ID Lock' : 'Biometric Lock'}
                  </Text>
                  <Text style={{ fontSize: 12, color: '#6b7280' }}>Secure app with biometrics</Text>
                </View>
              </View>
              <Switch
                value={faceIdLock}
                onValueChange={handleBiometricToggle}
                trackColor={{ false: '#d1d5db', true: '#ea2a33' }}
                thumbColor="white"
              />
            </View>

            {/* Privacy & Permissions */}
            <TouchableOpacity 
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: 16,
              }}
              onPress={() => setShowPrivacySheet(true)}
            >
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 16 }}>
                <View style={{
                  width: 40,
                  height: 40,
                  borderRadius: 12,
                  backgroundColor: 'rgba(107, 114, 128, 0.1)',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}>
                  <Ionicons name="shield-checkmark" size={20} color="#6b7280" />
                </View>
                <View>
                  <Text style={{ fontSize: 16, fontWeight: '500', color: '#1f2937' }}>Privacy & Permissions</Text>
                  <Text style={{ fontSize: 12, color: '#6b7280' }}>View app permissions</Text>
                </View>
              </View>
              <Ionicons name="chevron-forward" size={20} color="#9ca3af" />
            </TouchableOpacity>
          </View>
        </View>

        {/* Support Section */}
        <View style={{ marginBottom: 32 }}>
          <Text style={{
            paddingHorizontal: 24,
            paddingVertical: 8,
            fontSize: 12,
            fontWeight: 'bold',
            color: '#9ca3af',
            textTransform: 'uppercase',
            letterSpacing: 1,
          }}>Support</Text>
          
          <View style={{
            backgroundColor: 'white',
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
                borderBottomColor: '#f3f4f6',
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
                  <Text style={{ fontSize: 16, fontWeight: '500', color: '#1f2937' }}>Help Center</Text>
                  <Text style={{ fontSize: 12, color: '#6b7280' }}>FAQs and support</Text>
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
                  <Text style={{ fontSize: 16, fontWeight: '500', color: '#1f2937' }}>About Us</Text>
                  <Text style={{ fontSize: 12, color: '#6b7280' }}>App info and developer</Text>
                </View>
              </View>
              <Ionicons name="chevron-forward" size={20} color="#9ca3af" />
            </TouchableOpacity>
          </View>
        </View>

        {/* Footer */}
        <View style={{ paddingHorizontal: 24, alignItems: 'center', gap: 24, paddingBottom: 120 }}>
          <TouchableOpacity 
            style={{
              width: '100%',
              paddingVertical: 16,
              borderRadius: 12,
              backgroundColor: 'white',
              borderWidth: 1,
              borderColor: '#fecaca',
              alignItems: 'center',
              shadowColor: '#000',
              shadowOffset: { width: 0, height: 1 },
              shadowOpacity: 0.05,
              shadowRadius: 2,
              elevation: 1,
            }}
            onPress={handleLogout}
          >
            <Text style={{ fontSize: 16, fontWeight: 'bold', color: '#ea2a33' }}>
              Log Out
            </Text>
          </TouchableOpacity>

            <TouchableOpacity 
              style={{
                width: '100%',
                paddingVertical: 16,
                borderRadius: 12,
                backgroundColor: 'rgba(234, 40, 49, 0.1)',
                borderWidth: 1,
                borderColor: 'transparent',
                alignItems: 'center',
              }}
              onPress={() => {
                 Alert.alert(
                  'Delete Account',
                  'Are you sure? This will remove all your data and settings.',
                  [
                    { text: 'Cancel', style: 'cancel' },
                    { 
                      text: 'Delete', 
                      style: 'destructive', 
                      onPress: async () => {
                        await AuthService.deleteAccount();
                        router.replace('/auth/login');
                      }
                    }
                  ]
                );
              }}
            >
              <Text style={{ fontSize: 16, fontWeight: 'bold', color: '#ea2a33' }}>Delete Account</Text>
            </TouchableOpacity>

          <View style={{ alignItems: 'center' }}>
            <Text style={{ fontSize: 12, color: '#9ca3af', fontWeight: '500' }}>Expense Tracker v1.0.4</Text>
            <Text style={{ fontSize: 10, color: '#d1d5db', marginTop: 4 }}>Made with ❤️ for iOS</Text>
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
            <Text style={{ fontSize: 18, fontWeight: 'bold', color: '#1f2937', textAlign: 'center' }}>Your Data Stays Private</Text>
            <Text style={{ fontSize: 14, color: '#6b7280', textAlign: 'center', marginTop: 8 }}>100% local processing • Zero cloud storage</Text>
          </View>
          
          <Text style={{ fontSize: 16, fontWeight: 'bold', color: '#1f2937', marginBottom: 16 }}>🔒 Data Privacy Commitment</Text>
          <View style={{ backgroundColor: 'white', borderRadius: 12, padding: 16, marginBottom: 24 }}>
            <Text style={{ fontSize: 14, color: '#6b7280', lineHeight: 22 }}>
              Your financial data never leaves your device. All transaction parsing, categorization, and analysis happens locally. We don't collect, store, or transmit any personal or financial information to external servers.
            </Text>
          </View>
          
          <Text style={{ fontSize: 16, fontWeight: 'bold', color: '#1f2937', marginBottom: 16 }}>📱 Required Permissions</Text>
          <View style={{ gap: 16, marginBottom: 24 }}>
            <View style={{ backgroundColor: 'white', borderRadius: 12, padding: 16 }}>
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
                  <Text style={{ fontSize: 14, fontWeight: '600', color: '#1f2937', marginBottom: 4 }}>SMS Access</Text>
                  <Text style={{ fontSize: 12, color: '#6b7280', lineHeight: 18 }}>Read transaction notifications from banks and payment apps to automatically parse expense details</Text>
                  <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4, marginTop: 8 }}>
                    <Ionicons name="checkmark-circle" size={12} color="#10b981" />
                    <Text style={{ fontSize: 10, color: '#10b981', fontWeight: '500' }}>READ ONLY • NO SENDING</Text>
                  </View>
                </View>
              </View>
            </View>
            
            <View style={{ backgroundColor: 'white', borderRadius: 12, padding: 16 }}>
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
                  <Text style={{ fontSize: 14, fontWeight: '600', color: '#1f2937', marginBottom: 4 }}>Email Access</Text>
                  <Text style={{ fontSize: 12, color: '#6b7280', lineHeight: 18 }}>Read transaction emails from banks to automatically track online payments and subscriptions</Text>
                  <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4, marginTop: 8 }}>
                    <Ionicons name="checkmark-circle" size={12} color="#10b981" />
                    <Text style={{ fontSize: 10, color: '#10b981', fontWeight: '500' }}>READ ONLY • SECURE</Text>
                  </View>
                </View>
              </View>
            </View>
            
            <View style={{ backgroundColor: 'white', borderRadius: 12, padding: 16 }}>
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
                  <Text style={{ fontSize: 14, fontWeight: '600', color: '#1f2937', marginBottom: 4 }}>Google Sheets Access</Text>
                  <Text style={{ fontSize: 12, color: '#6b7280', lineHeight: 18 }}>Sync transactions to Google Sheets for backup and advanced analysis</Text>
                  <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4, marginTop: 8 }}>
                    <Ionicons name="cloud-upload" size={12} color="#10b981" />
                    <Text style={{ fontSize: 10, color: '#10b981', fontWeight: '500' }}>OPTIONAL • ENCRYPTED</Text>
                  </View>
                </View>
              </View>
            </View>
            
            <View style={{ backgroundColor: 'white', borderRadius: 12, padding: 16 }}>
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
                  <Text style={{ fontSize: 14, fontWeight: '600', color: '#1f2937', marginBottom: 4 }}>Notifications</Text>
                  <Text style={{ fontSize: 12, color: '#6b7280', lineHeight: 18 }}>Send daily spending summaries and budget alerts to help you stay on track</Text>
                  <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4, marginTop: 8 }}>
                    <Ionicons name="time" size={12} color="#9333ea" />
                    <Text style={{ fontSize: 10, color: '#9333ea', fontWeight: '500' }}>DAILY AT 8:00 PM</Text>
                  </View>
                </View>
              </View>
            </View>
            
            <View style={{ backgroundColor: 'white', borderRadius: 12, padding: 16 }}>
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
                  <Text style={{ fontSize: 14, fontWeight: '600', color: '#1f2937', marginBottom: 4 }}>Biometric Authentication</Text>
                  <Text style={{ fontSize: 12, color: '#6b7280', lineHeight: 18 }}>Secure app access with Face ID, Touch ID, or fingerprint for enhanced security</Text>
                  <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4, marginTop: 8 }}>
                    <Ionicons name="lock-closed" size={12} color="#22c55e" />
                    <Text style={{ fontSize: 10, color: '#22c55e', fontWeight: '500' }}>DEVICE SECURE ELEMENT</Text>
                  </View>
                </View>
              </View>
            </View>
          </View>
          
          <Text style={{ fontSize: 16, fontWeight: 'bold', color: '#1f2937', marginBottom: 16 }}>🛡️ Security Features</Text>
          <View style={{ backgroundColor: 'white', borderRadius: 12, padding: 16, marginBottom: 24 }}>
            <View style={{ gap: 12 }}>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
                <Ionicons name="phone-portrait" size={16} color="#10b981" />
                <Text style={{ fontSize: 14, color: '#1f2937' }}>Local data storage only</Text>
              </View>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
                <Ionicons name="shield" size={16} color="#10b981" />
                <Text style={{ fontSize: 14, color: '#1f2937' }}>End-to-end encryption</Text>
              </View>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
                <Ionicons name="eye-off" size={16} color="#10b981" />
                <Text style={{ fontSize: 14, color: '#1f2937' }}>No tracking or analytics</Text>
              </View>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
                <Ionicons name="server" size={16} color="#10b981" />
                <Text style={{ fontSize: 14, color: '#1f2937' }}>No external servers</Text>
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
          <Text style={{ fontSize: 16, fontWeight: 'bold', color: '#1f2937', marginBottom: 16 }}>Frequently Asked Questions</Text>
          
          <View style={{ gap: 20 }}>
            <View>
              <Text style={{ fontSize: 14, fontWeight: '600', color: '#1f2937', marginBottom: 8 }}>How does auto-parsing work?</Text>
              <Text style={{ fontSize: 14, color: '#6b7280', lineHeight: 20 }}>The app reads SMS and email notifications from banks and automatically extracts transaction details like amount, merchant, and category.</Text>
            </View>
            
            <View>
              <Text style={{ fontSize: 14, fontWeight: '600', color: '#1f2937', marginBottom: 8 }}>Is my data secure?</Text>
              <Text style={{ fontSize: 14, color: '#6b7280', lineHeight: 20 }}>Yes, all data is processed locally on your device. No transaction information is sent to external servers or stored in the cloud.</Text>
            </View>
            
            <View>
              <Text style={{ fontSize: 14, fontWeight: '600', color: '#1f2937', marginBottom: 8 }}>How do I add custom categories?</Text>
              <Text style={{ fontSize: 14, color: '#6b7280', lineHeight: 20 }}>Go to Settings {'>'} Manage Categories and tap the "+" button to create new expense categories with custom icons and colors.</Text>
            </View>
            
            <View>
              <Text style={{ fontSize: 14, fontWeight: '600', color: '#1f2937', marginBottom: 8 }}>Can I export my data?</Text>
              <Text style={{ fontSize: 14, color: '#6b7280', lineHeight: 20 }}>Data export functionality is coming in a future update. Currently, all data is stored locally on your device.</Text>
            </View>
          </View>
          
          <View style={{ marginTop: 32, padding: 16, backgroundColor: 'rgba(234, 40, 49, 0.1)', borderRadius: 12 }}>
            <Text style={{ fontSize: 14, fontWeight: '600', color: '#ea2a33', marginBottom: 8 }}>Need more help?</Text>
            <Text style={{ fontSize: 12, color: '#6b7280' }}>Contact us at pratikdeshmukhlobhi@gmail.com for additional support.</Text>
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
            <Text style={{ fontSize: 20, fontWeight: 'bold', color: '#1f2937' }}>Auto Expense</Text>
            <Text style={{ fontSize: 14, color: '#6b7280' }}>Version 1.0.4</Text>
          </View>
          
          <Text style={{ fontSize: 16, fontWeight: 'bold', color: '#1f2937', marginBottom: 16 }}>Our Mission</Text>
          <Text style={{ fontSize: 14, color: '#6b7280', lineHeight: 20, marginBottom: 20 }}>
            We believe managing personal finances should be effortless and secure. Auto Expense automatically tracks your spending while keeping your data completely private.
          </Text>
          
          <Text style={{ fontSize: 16, fontWeight: 'bold', color: '#1f2937', marginBottom: 16 }}>Features</Text>
          <View style={{ gap: 12, marginBottom: 20 }}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
              <Ionicons name="checkmark-circle" size={16} color="#10b981" />
              <Text style={{ fontSize: 14, color: '#6b7280' }}>Automatic transaction parsing</Text>
            </View>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
              <Ionicons name="checkmark-circle" size={16} color="#10b981" />
              <Text style={{ fontSize: 14, color: '#6b7280' }}>Smart expense categorization</Text>
            </View>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
              <Ionicons name="checkmark-circle" size={16} color="#10b981" />
              <Text style={{ fontSize: 14, color: '#6b7280' }}>Local data processing</Text>
            </View>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
              <Ionicons name="checkmark-circle" size={16} color="#10b981" />
              <Text style={{ fontSize: 14, color: '#6b7280' }}>Biometric security</Text>
            </View>
          </View>
          
          <Text style={{ fontSize: 16, fontWeight: 'bold', color: '#1f2937', marginBottom: 16 }}>Developer</Text>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12, marginBottom: 20 }}>
            <Image
              source={{ uri: 'https://avatars.githubusercontent.com/u/44018192?v=4' }}
              style={{ width: 40, height: 40, borderRadius: 20 }}
            />
            <View>
              <Text style={{ fontSize: 14, fontWeight: '600', color: '#1f2937' }}>Pratik Deshmukh</Text>
              <Text style={{ fontSize: 12, color: '#6b7280' }}>Programmer Analyst</Text>
            </View>
          </View>
          
          <View style={{ padding: 16, backgroundColor: '#f3f4f6', borderRadius: 12 }}>
            <Text style={{ fontSize: 12, color: '#6b7280', textAlign: 'center' }}>
              Built with React Native & Expo
            </Text>
            <Text style={{ fontSize: 12, color: '#6b7280', textAlign: 'center', marginTop: 4 }}>
              Made with ❤️ for privacy-conscious users
            </Text>
          </View>
        </View>
      </SettingsBottomSheet>
    </SafeAreaView>
  );
}