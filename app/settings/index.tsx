import { Ionicons } from '@expo/vector-icons';
import { router, useFocusEffect } from 'expo-router';
import React, { useState, useEffect } from 'react';
import { Image, ScrollView, Switch, Text, TouchableOpacity, View, Platform } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import * as SecureStore from 'expo-secure-store';
import { CategoryService } from '../../services/CategoryService';
import { PaymentMethodService } from '../../services/PaymentMethodService';

export default function SettingsIndex() {
  const [autoParsing, setAutoParsing] = useState(true);
  const [dailySummary, setDailySummary] = useState(true);
  const [overspendingAlerts, setOverspendingAlerts] = useState(false);
  const [faceIdLock, setFaceIdLock] = useState(false);
  const [categoriesCount, setCategoriesCount] = useState(0);
  const [paymentMethodsCount, setPaymentMethodsCount] = useState(0);

  useEffect(() => {
    loadBiometricSetting();
    loadCounts();
  }, []);

  useFocusEffect(
    React.useCallback(() => {
      loadCounts();
    }, [])
  );

  const loadCounts = async () => {
    const categories = await CategoryService.getCategories();
    const paymentMethods = await PaymentMethodService.getPaymentMethods();
    setCategoriesCount(categories.length);
    setPaymentMethodsCount(paymentMethods.length);
  };

  const loadBiometricSetting = async () => {
    const biometricEnabled = await SecureStore.getItemAsync('biometric_enabled');
    setFaceIdLock(biometricEnabled === 'true');
  };

  const handleBiometricToggle = async (value: boolean) => {
    setFaceIdLock(value);
    await SecureStore.setItemAsync('biometric_enabled', value.toString());
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
        <View style={{ paddingHorizontal: 16, paddingVertical: 24, flexDirection: 'row', alignItems: 'center', gap: 16 }}>
          <View style={{ position: 'relative' }}>
            <Image
              source={{ uri: 'https://avatars.githubusercontent.com/u/44018192?v=4' }}
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
            <Text style={{ fontSize: 18, fontWeight: 'bold', color: '#1f2937' }}>Pratik Deshmukh</Text>
            <Text style={{ fontSize: 14, color: '#6b7280' }}>pratikdeshmukhlobhi@gmail.com</Text>
          </View>
        </View>

        {/* Data Parsing Section */}
        <View style={{ marginBottom: 24 }}>
          <Text style={{
            paddingHorizontal: 24,
            paddingVertical: 8,
            fontSize: 12,
            fontWeight: 'bold',
            color: '#9ca3af',
            textTransform: 'uppercase',
            letterSpacing: 1,
          }}>Data Parsing</Text>
          
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
                  backgroundColor: 'rgba(234, 42, 51, 0.1)',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}>
                  <Ionicons name="mail" size={20} color="#ea2a33" />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={{ fontSize: 16, fontWeight: '600', color: '#1f2937' }}>Auto-Parsing</Text>
                  <Text style={{ fontSize: 12, color: '#6b7280' }}>Read SMS & Email transactions automatically</Text>
                </View>
              </View>
              <Switch
                value={autoParsing}
                onValueChange={setAutoParsing}
                trackColor={{ false: '#d1d5db', true: '#ea2a33' }}
                thumbColor="white"
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
              onPress={() => router.push('/settings/smart-parsing')}
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
                  <Ionicons name="business" size={20} color="#3b82f6" />
                </View>
                <Text style={{ fontSize: 16, fontWeight: '500', color: '#1f2937' }}>Smart Parsing</Text>
              </View>
              <Ionicons name="chevron-forward" size={20} color="#9ca3af" />
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
          🔒 Your data is processed locally and never leaves your device.
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
                  <Text style={{ fontSize: 12, color: '#6b7280' }}>{categoriesCount} categories configured</Text>
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
                  <Text style={{ fontSize: 12, color: '#6b7280' }}>{paymentMethodsCount} methods configured</Text>
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
                  <Text style={{ fontSize: 12, color: '#6b7280' }}>Receive a digest at 8:00 PM</Text>
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
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 16 }}>
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
                <Text style={{ fontSize: 16, fontWeight: '500', color: '#1f2937' }}>Overspending Alerts</Text>
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
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 16 }}>
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
                <Text style={{ fontSize: 16, fontWeight: '500', color: '#1f2937' }}>
                  {Platform.OS === 'ios' ? 'Face ID Lock' : 'Biometric Lock'}
                </Text>
              </View>
              <Switch
                value={faceIdLock}
                onValueChange={handleBiometricToggle}
                trackColor={{ false: '#d1d5db', true: '#ea2a33' }}
                thumbColor="white"
              />
            </View>

            {/* Privacy & Permissions */}
            <TouchableOpacity style={{
              flexDirection: 'row',
              alignItems: 'center',
              justifyContent: 'space-between',
              padding: 16,
            }}>
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
                <Text style={{ fontSize: 16, fontWeight: '500', color: '#1f2937' }}>Privacy & Permissions</Text>
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
            <TouchableOpacity style={{
              flexDirection: 'row',
              alignItems: 'center',
              justifyContent: 'space-between',
              padding: 16,
              borderBottomWidth: 1,
              borderBottomColor: '#f3f4f6',
            }}>
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
                <Text style={{ fontSize: 16, fontWeight: '500', color: '#1f2937' }}>Help Center</Text>
              </View>
              <Ionicons name="chevron-forward" size={20} color="#9ca3af" />
            </TouchableOpacity>

            {/* About Us */}
            <TouchableOpacity style={{
              flexDirection: 'row',
              alignItems: 'center',
              justifyContent: 'space-between',
              padding: 16,
              borderBottomWidth: 1,
              borderBottomColor: '#f3f4f6',
            }}>
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
                <Text style={{ fontSize: 16, fontWeight: '500', color: '#1f2937' }}>About Us</Text>
              </View>
              <Ionicons name="chevron-forward" size={20} color="#9ca3af" />
            </TouchableOpacity>

            {/* Rate the App */}
            <TouchableOpacity style={{
              flexDirection: 'row',
              alignItems: 'center',
              justifyContent: 'space-between',
              padding: 16,
            }}>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 16 }}>
                <View style={{
                  width: 40,
                  height: 40,
                  borderRadius: 12,
                  backgroundColor: 'rgba(245, 158, 11, 0.1)',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}>
                  <Ionicons name="star" size={20} color="#f59e0b" />
                </View>
                <Text style={{ fontSize: 16, fontWeight: '500', color: '#1f2937' }}>Rate the App</Text>
              </View>
              <Ionicons name="open" size={20} color="#9ca3af" />
            </TouchableOpacity>
          </View>
        </View>

        {/* Footer */}
        <View style={{ paddingHorizontal: 24, alignItems: 'center', gap: 24, paddingBottom: 20 }}>
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
            onPress={() => router.replace('/auth/mpin')}
          >
            <Text style={{ fontSize: 16, fontWeight: 'bold', color: '#ea2a33' }}>Log Out</Text>
          </TouchableOpacity>

          <View style={{ alignItems: 'center' }}>
            <Text style={{ fontSize: 12, color: '#9ca3af', fontWeight: '500' }}>Expense Tracker v1.0.4</Text>
            <Text style={{ fontSize: 10, color: '#d1d5db', marginTop: 4 }}>Made with ❤️ for iOS</Text>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}