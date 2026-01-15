import { router } from 'expo-router';
import React, { useState } from 'react';
import { Alert, Image, Modal, ScrollView, StatusBar, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { GoogleIcon } from '../../components/GoogleIcon';
import { AuthService } from '../../services/AuthService';

export default function LoginScreen() {
  const [termsAccepted, setTermsAccepted] = useState(false);
  const [showTermsModal, setShowTermsModal] = useState(false);

  const handleLogin = async () => {
    if (!termsAccepted) {
      Alert.alert(
        'Terms & Conditions Required',
        'Please agree to the Terms & Conditions and Privacy Policy to continue.',
        [{ text: 'OK' }]
      );
      return;
    }

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

  const handleGuestLogin = async () => {
    if (!termsAccepted) {
      Alert.alert(
        'Terms & Conditions Required',
        'Please agree to the Terms & Conditions and Privacy Policy to continue.',
        [{ text: 'OK' }]
      );
      return;
    }

    const success = await AuthService.loginAsGuest();
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
    <SafeAreaView style={{ flex: 1, backgroundColor: '#F8FAFC' }}>
      <StatusBar barStyle="dark-content" backgroundColor="#F8FAFC" />
      
      <ScrollView contentContainerStyle={{ flexGrow: 1 }}>
        {/* Hero Section with Icons */}
        <View style={{
          position: 'relative',
          width: '100%',
          height: 256,
          overflow: 'hidden',
          alignItems: 'center',
          justifyContent: 'center',
          paddingTop: 32,
        }}>
          <View style={{
            position: 'absolute',
            top: -50,
            right: -50,
            width: 256,
            height: 256,
            backgroundColor: 'rgba(255, 0, 46, 0.05)',
            borderRadius: 128,
          }} />
          <View style={{
            position: 'absolute',
            bottom: 0,
            left: -20,
            width: 192,
            height: 192,
            backgroundColor: 'rgba(59, 130, 246, 0.05)',
            borderRadius: 96,
          }} />
          
          <View style={{
            width: 192,
            height: 192,
            alignItems: 'center',
            justifyContent: 'center',
            position: 'relative',
          }}>
            <View style={{
              position: 'absolute',
              width: 192,
              height: 192,
              backgroundColor: 'rgba(255, 0, 46, 0.1)',
              borderRadius: 96,
            }} />
            
            <View style={{
              width: 80,
              height: 80,
              backgroundColor: '#FF002E',
              borderRadius: 16,
              alignItems: 'center',
              justifyContent: 'center',
              transform: [{ rotate: '3deg' }],
              shadowColor: '#000',
              shadowOffset: { width: 0, height: 8 },
              shadowOpacity: 0.3,
              shadowRadius: 16,
              elevation: 8,
            }}>
              <Ionicons name="trending-up" size={36} color="white" />
            </View>
            
            <View style={{
              position: 'absolute',
              top: 16,
              right: 16,
              width: 48,
              height: 48,
              backgroundColor: '#3B82F6',
              borderRadius: 12,
              alignItems: 'center',
              justifyContent: 'center',
              transform: [{ rotate: '-12deg' }],
              shadowColor: '#000',
              shadowOffset: { width: 0, height: 4 },
              shadowOpacity: 0.2,
              shadowRadius: 8,
              elevation: 4,
            }}>
              <Ionicons name="mail" size={24} color="white" />
            </View>
            
            <View style={{
              position: 'absolute',
              bottom: 16,
              left: 16,
              width: 56,
              height: 56,
              backgroundColor: '#10B981',
              borderRadius: 12,
              alignItems: 'center',
              justifyContent: 'center',
              transform: [{ rotate: '6deg' }],
              shadowColor: '#000',
              shadowOffset: { width: 0, height: 4 },
              shadowOpacity: 0.2,
              shadowRadius: 8,
              elevation: 4,
            }}>
              <Ionicons name="grid" size={24} color="white" />
            </View>
          </View>
        </View>

        {/* Content */}
        <View style={{
          flex: 1,
          paddingHorizontal: 24,
          paddingBottom: 48,
          maxWidth: 448,
          width: '100%',
          alignSelf: 'center',
        }}>
          {/* Title */}
          <View style={{ alignItems: 'center', marginBottom: 32 }}>
            <Text style={{
              fontSize: 30,
              fontWeight: 'bold',
              color: '#0F172A',
              marginBottom: 8,
            }}>
              Auto Expense
            </Text>
            <Text style={{
              fontSize: 16,
              color: '#64748B',
            }}>
              Track your spending automatically.
            </Text>
          </View>

          {/* Permissions Card */}
          <View style={{
            backgroundColor: 'white',
            padding: 24,
            borderRadius: 24,
            marginBottom: 32,
            shadowColor: '#000',
            shadowOffset: { width: 0, height: 4 },
            shadowOpacity: 0.05,
            shadowRadius: 20,
            elevation: 2,
            borderWidth: 1,
            borderColor: '#F1F5F9',
          }}>
            <Text style={{
              fontSize: 12,
              fontWeight: '600',
              textTransform: 'uppercase',
              letterSpacing: 0.5,
              color: '#94A3B8',
              marginBottom: 16,
            }}>
              Permissions Required
            </Text>
            
            <View style={{ gap: 16 }}>
              <View style={{ flexDirection: 'row', gap: 16 }}>
                <View style={{
                  backgroundColor: '#DBEAFE',
                  padding: 8,
                  borderRadius: 8,
                  width: 36,
                  height: 36,
                  alignItems: 'center',
                  justifyContent: 'center',
                }}>
                  <Ionicons name="mail" size={20} color="#2563EB" />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={{
                    fontSize: 14,
                    fontWeight: '600',
                    color: '#1E293B',
                    marginBottom: 2,
                  }}>
                    Read Emails
                  </Text>
                  <Text style={{
                    fontSize: 12,
                    color: '#64748B',
                    lineHeight: 16,
                  }}>
                    Needed to automatically parse transaction details from your receipts.
                  </Text>
                </View>
              </View>

              <View style={{ flexDirection: 'row', gap: 16 }}>
                <View style={{
                  backgroundColor: '#D1FAE5',
                  padding: 8,
                  borderRadius: 8,
                  width: 36,
                  height: 36,
                  alignItems: 'center',
                  justifyContent: 'center',
                }}>
                  <Ionicons name="server" size={20} color="#059669" />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={{
                    fontSize: 14,
                    fontWeight: '600',
                    color: '#1E293B',
                    marginBottom: 2,
                  }}>
                    Google Drive & Sheets
                  </Text>
                  <Text style={{
                    fontSize: 12,
                    color: '#64748B',
                    lineHeight: 16,
                  }}>
                    Securely store and organize your expense data in your own cloud account.
                  </Text>
                </View>
              </View>

              <View style={{
                paddingTop: 8,
                marginTop: 8,
                borderTopWidth: 1,
                borderTopColor: '#F8FAFC',
              }}>
                <Text style={{
                  fontSize: 12,
                  color: '#94A3B8',
                  fontStyle: 'italic',
                }}>
                  Note: Guest mode does not require these permissions, but auto-parsing will be disabled.
                </Text>
              </View>
            </View>
          </View>

          {/* Terms Checkbox */}
          <TouchableOpacity 
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              gap: 12,
              marginBottom: 32,
              paddingHorizontal: 8,
            }}
            activeOpacity={0.7}
            onPress={() => setTermsAccepted(!termsAccepted)}
          >
            <View style={{
              width: 20,
              height: 20,
              borderRadius: 4,
              borderWidth: 2,
              borderColor: termsAccepted ? '#FF002E' : '#CBD5E1',
              backgroundColor: termsAccepted ? '#FF002E' : 'white',
              alignItems: 'center',
              justifyContent: 'center',
            }}>
              {termsAccepted && (
                <Ionicons name="checkmark" size={14} color="white" />
              )}
            </View>
            <Text style={{
              fontSize: 14,
              color: '#64748B',
              flex: 1,
              lineHeight: 20,
            }}>
              I agree to the <Text 
                style={{ color: '#FF002E', fontWeight: '500' }}
                onPress={(e) => {
                  e.stopPropagation();
                  setShowTermsModal(true);
                }}
              >Terms & Conditions</Text> and <Text 
                style={{ color: '#FF002E', fontWeight: '500' }}
                onPress={(e) => {
                  e.stopPropagation();
                  setShowTermsModal(true);
                }}
              >Privacy Policy</Text>.
            </Text>
          </TouchableOpacity>

          {/* Buttons */}
          <View style={{ gap: 12, marginTop: 'auto' }}>
            <TouchableOpacity 
              style={{
                width: '100%',
                height: 56,
                borderRadius: 16,
                backgroundColor: termsAccepted ? 'white' : '#F8FAFC',
                borderWidth: 1,
                borderColor: termsAccepted ? '#E2E8F0' : '#E2E8F0',
                flexDirection: 'row',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 12,
                shadowColor: '#000',
                shadowOffset: { width: 0, height: 4 },
                shadowOpacity: termsAccepted ? 0.05 : 0.02,
                shadowRadius: 20,
                elevation: termsAccepted ? 2 : 0,
                opacity: termsAccepted ? 1 : 0.5,
              }}
              activeOpacity={0.8}
              onPress={handleLogin}
            >
              <GoogleIcon />
              <Text style={{
                color: termsAccepted ? '#1E293B' : '#94A3B8',
                fontWeight: '600',
                fontSize: 16,
              }}>
                Continue with Google
              </Text>
            </TouchableOpacity>

            <TouchableOpacity 
              style={{
                width: '100%',
                height: 56,
                borderRadius: 16,
                backgroundColor: termsAccepted ? '#F1F5F9' : '#F8FAFC',
                alignItems: 'center',
                justifyContent: 'center',
                opacity: termsAccepted ? 1 : 0.5,
              }}
              activeOpacity={0.8}
              onPress={handleGuestLogin}
            >
              <Text style={{
                color: termsAccepted ? '#64748B' : '#94A3B8',
                fontWeight: '600',
                fontSize: 16,
              }}>
                Continue as Guest
              </Text>
            </TouchableOpacity>
          </View>
          
          <Text style={{
            color: '#94A3B8',
            fontSize: 11,
            textAlign: 'center',
            paddingHorizontal: 16,
            marginTop: 24,
          }}>
            By continuing, you agree to create an account or sign in to your existing one.
          </Text>
        </View>
      </ScrollView>

      {/* Terms & Conditions Modal */}
      <Modal
        visible={showTermsModal}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setShowTermsModal(false)}
      >
        <View style={{
          flex: 1,
          justifyContent: 'flex-end',
          backgroundColor: 'rgba(0, 0, 0, 0.5)',
        }}>
          <View style={{
            backgroundColor: 'white',
            borderTopLeftRadius: 24,
            borderTopRightRadius: 24,
            maxHeight: '80%',
            paddingTop: 8,
          }}>
            {/* Handle Bar */}
            <View style={{ alignItems: 'center', paddingVertical: 12 }}>
              <View style={{
                width: 40,
                height: 4,
                backgroundColor: '#E2E8F0',
                borderRadius: 2,
              }} />
            </View>

            {/* Header */}
            <View style={{
              flexDirection: 'row',
              alignItems: 'center',
              justifyContent: 'space-between',
              paddingHorizontal: 24,
              paddingBottom: 16,
              borderBottomWidth: 1,
              borderBottomColor: '#F1F5F9',
            }}>
              <Text style={{
                fontSize: 20,
                fontWeight: 'bold',
                color: '#0F172A',
              }}>
                Terms & Conditions
              </Text>
              <TouchableOpacity onPress={() => setShowTermsModal(false)}>
                <Ionicons name="close" size={24} color="#64748B" />
              </TouchableOpacity>
            </View>

            {/* Content */}
            <ScrollView style={{ paddingHorizontal: 24, paddingVertical: 20 }}>
              <Text style={{
                fontSize: 16,
                fontWeight: '600',
                color: '#0F172A',
                marginBottom: 12,
              }}>
                1. Acceptance of Terms
              </Text>
              <Text style={{
                fontSize: 14,
                color: '#64748B',
                lineHeight: 20,
                marginBottom: 20,
              }}>
                By accessing and using Auto Expense, you accept and agree to be bound by the terms and provision of this agreement.
              </Text>

              <Text style={{
                fontSize: 16,
                fontWeight: '600',
                color: '#0F172A',
                marginBottom: 12,
              }}>
                2. Data Collection & Privacy
              </Text>
              <Text style={{
                fontSize: 14,
                color: '#64748B',
                lineHeight: 20,
                marginBottom: 20,
              }}>
                We collect and process your email and transaction data to provide expense tracking services. All data is stored securely in your Google Drive and is never shared with third parties.
              </Text>

              <Text style={{
                fontSize: 16,
                fontWeight: '600',
                color: '#0F172A',
                marginBottom: 12,
              }}>
                3. Permissions
              </Text>
              <Text style={{
                fontSize: 14,
                color: '#64748B',
                lineHeight: 20,
                marginBottom: 20,
              }}>
                The app requires access to your emails to parse transaction notifications and Google Drive to store your expense data. You can revoke these permissions at any time through your Google account settings.
              </Text>

              <Text style={{
                fontSize: 16,
                fontWeight: '600',
                color: '#0F172A',
                marginBottom: 12,
              }}>
                4. User Responsibilities
              </Text>
              <Text style={{
                fontSize: 14,
                color: '#64748B',
                lineHeight: 20,
                marginBottom: 20,
              }}>
                You are responsible for maintaining the confidentiality of your account and MPIN. You agree to accept responsibility for all activities that occur under your account.
              </Text>

              <Text style={{
                fontSize: 16,
                fontWeight: '600',
                color: '#0F172A',
                marginBottom: 12,
              }}>
                5. Limitation of Liability
              </Text>
              <Text style={{
                fontSize: 14,
                color: '#64748B',
                lineHeight: 20,
                marginBottom: 20,
              }}>
                Auto Expense is provided "as is" without any warranties. We are not liable for any damages arising from the use of this application.
              </Text>

              <Text style={{
                fontSize: 16,
                fontWeight: '600',
                color: '#0F172A',
                marginBottom: 12,
              }}>
                6. Changes to Terms
              </Text>
              <Text style={{
                fontSize: 14,
                color: '#64748B',
                lineHeight: 20,
                marginBottom: 40,
              }}>
                We reserve the right to modify these terms at any time. Continued use of the app after changes constitutes acceptance of the new terms.
              </Text>
            </ScrollView>

            {/* Footer Button */}
            <View style={{
              padding: 24,
              borderTopWidth: 1,
              borderTopColor: '#F1F5F9',
            }}>
              <TouchableOpacity
                style={{
                  backgroundColor: '#FF002E',
                  height: 56,
                  borderRadius: 16,
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
                onPress={() => {
                  setTermsAccepted(true);
                  setShowTermsModal(false);
                }}
              >
                <Text style={{
                  color: 'white',
                  fontSize: 16,
                  fontWeight: '600',
                }}>
                  Accept & Continue
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}