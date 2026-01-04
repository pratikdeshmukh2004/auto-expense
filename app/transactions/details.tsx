import React, { useState } from 'react';
import { View, Text, TouchableOpacity, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import EditTransactionModal from '../../components/EditTransactionModal';

export default function TransactionDetailsScreen() {
  const [showEditModal, setShowEditModal] = useState(false);

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#f8f6f6' }}>
      {/* Header */}
      <View style={{
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 16,
        paddingVertical: 16,
        backgroundColor: 'rgba(248, 246, 246, 0.9)',
      }}>
        <TouchableOpacity
          onPress={() => router.back()}
          style={{
            width: 40,
            height: 40,
            alignItems: 'center',
            justifyContent: 'center',
            borderRadius: 20,
          }}
        >
          <Ionicons name="chevron-back" size={24} color="#181111" />
        </TouchableOpacity>
        
        <Text style={{
          fontSize: 18,
          fontWeight: 'bold',
          color: '#181111',
          flex: 1,
          textAlign: 'center',
        }}>
          Transaction Details
        </Text>
        
        <TouchableOpacity 
          onPress={() => setShowEditModal(true)}
          style={{
          paddingHorizontal: 12,
          paddingVertical: 8,
          borderRadius: 20,
        }}>
          <Ionicons name="ellipsis-horizontal" size={24} color="#181111" />
        </TouchableOpacity>
      </View>

      <ScrollView style={{ flex: 1 }} showsVerticalScrollIndicator={false}>
        <View style={{ paddingHorizontal: 16, paddingBottom: 24, gap: 16 }}>
          {/* Amount Section */}
          <View style={{
            alignItems: 'center',
            justifyContent: 'center',
            paddingVertical: 24,
            gap: 4,
          }}>
            <Text style={{
              fontSize: 48,
              fontWeight: '800',
              color: '#181111',
              lineHeight: 48,
              letterSpacing: -1,
            }}>
              -$12.50
            </Text>
            <Text style={{
              fontSize: 20,
              fontWeight: 'bold',
              color: '#886364',
              marginTop: 4,
            }}>
              Starbucks
            </Text>
            
            {/* Status Badge */}
            <View style={{
              flexDirection: 'row',
              alignItems: 'center',
              gap: 8,
              backgroundColor: 'rgba(34, 197, 94, 0.1)',
              borderWidth: 1,
              borderColor: 'rgba(34, 197, 94, 0.2)',
              paddingHorizontal: 12,
              paddingVertical: 4,
              borderRadius: 25,
              marginTop: 12,
            }}>
              <Ionicons name="checkmark-circle" size={16} color="#22c55e" />
              <Text style={{
                fontSize: 10,
                fontWeight: 'bold',
                color: '#15803d',
                textTransform: 'uppercase',
                letterSpacing: 1.5,
              }}>
                Completed
              </Text>
            </View>
          </View>

          {/* Details Section */}
          <View style={{
            backgroundColor: 'white',
            borderRadius: 24,
            padding: 20,
            shadowColor: '#000',
            shadowOffset: { width: 0, height: 1 },
            shadowOpacity: 0.05,
            shadowRadius: 4,
            elevation: 2,
            borderWidth: 1,
            borderColor: 'rgba(0, 0, 0, 0.05)',
          }}>
            <Text style={{
              fontSize: 12,
              fontWeight: 'bold',
              color: '#886364',
              textTransform: 'uppercase',
              letterSpacing: 1.5,
              marginBottom: 16,
            }}>
              Details
            </Text>
            
            <View style={{ gap: 20 }}>
              {/* Date & Time */}
              <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
                  <View style={{
                    padding: 8,
                    backgroundColor: '#f8f6f6',
                    borderRadius: 20,
                  }}>
                    <Ionicons name="calendar-outline" size={20} color="#181111" style={{ opacity: 0.7 }} />
                  </View>
                  <Text style={{ fontSize: 14, fontWeight: '500', color: '#886364' }}>Date & Time</Text>
                </View>
                <Text style={{ fontSize: 16, fontWeight: 'bold', color: '#181111' }}>Oct 24, 10:30 AM</Text>
              </View>

              {/* Category */}
              <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
                  <View style={{
                    padding: 8,
                    backgroundColor: '#f8f6f6',
                    borderRadius: 20,
                  }}>
                    <Ionicons name="restaurant" size={20} color="#181111" style={{ opacity: 0.7 }} />
                  </View>
                  <Text style={{ fontSize: 14, fontWeight: '500', color: '#886364' }}>Category</Text>
                </View>
                <Text style={{ fontSize: 16, fontWeight: 'bold', color: '#181111' }}>Coffee & Dining</Text>
              </View>

              {/* Payment Method */}
              <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
                  <View style={{
                    padding: 8,
                    backgroundColor: '#f8f6f6',
                    borderRadius: 20,
                  }}>
                    <Ionicons name="card" size={20} color="#181111" style={{ opacity: 0.7 }} />
                  </View>
                  <Text style={{ fontSize: 14, fontWeight: '500', color: '#886364' }}>Payment</Text>
                </View>
                <Text style={{ fontSize: 16, fontWeight: 'bold', color: '#181111' }}>Visa •••• 1234</Text>
              </View>
            </View>

            {/* Divider */}
            <View style={{
              height: 1,
              backgroundColor: 'rgba(0, 0, 0, 0.05)',
              marginVertical: 20,
            }} />

            {/* Note */}
            <TouchableOpacity style={{ position: 'relative' }}>
              <View style={{ flexDirection: 'row', gap: 12, alignItems: 'flex-start' }}>
                <Ionicons name="create-outline" size={20} color="#886364" style={{ marginTop: 2 }} />
                <Text style={{
                  fontSize: 14,
                  fontWeight: '500',
                  color: '#181111',
                  lineHeight: 20,
                  fontStyle: 'italic',
                  flex: 1,
                }}>
                  "Morning coffee run with the design team to discuss the Q4 roadmap."
                </Text>
              </View>
            </TouchableOpacity>
          </View>

          {/* Spending Insights */}
          <View style={{
            backgroundColor: 'white',
            borderRadius: 24,
            padding: 20,
            shadowColor: '#000',
            shadowOffset: { width: 0, height: 1 },
            shadowOpacity: 0.05,
            shadowRadius: 4,
            elevation: 2,
            borderWidth: 1,
            borderColor: 'rgba(0, 0, 0, 0.05)',
          }}>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 16 }}>
              <View>
                <Text style={{
                  fontSize: 12,
                  fontWeight: 'bold',
                  color: '#886364',
                  textTransform: 'uppercase',
                  letterSpacing: 1.5,
                }}>
                  Spending Insights
                </Text>
                <Text style={{
                  fontSize: 14,
                  fontWeight: '600',
                  color: '#181111',
                  marginTop: 4,
                }}>
                  This Month with Starbucks
                </Text>
              </View>
              <Text style={{
                fontSize: 24,
                fontWeight: '800',
                color: '#EA2831',
              }}>
                $45.00
              </Text>
            </View>

            {/* Chart */}
            <View style={{
              height: 96,
              flexDirection: 'row',
              alignItems: 'flex-end',
              justifyContent: 'space-between',
              gap: 8,
              paddingHorizontal: 4,
            }}>
              {[
                { height: '30%', amount: '$8' },
                { height: '45%', amount: '$12' },
                { height: '20%', amount: '$5' },
                { height: '0%', amount: '$0' },
                { height: '60%', amount: '$18' },
                { height: '35%', amount: '$9' },
                { height: '50%', amount: '$12.50', active: true },
              ].map((bar, index) => (
                <View key={index} style={{ flex: 1, alignItems: 'center', height: '100%', justifyContent: 'flex-end' }}>
                  <View style={{
                    width: '100%',
                    height: bar.height,
                    backgroundColor: bar.active ? '#EA2831' : 'rgba(234, 40, 49, 0.1)',
                    borderTopLeftRadius: 2,
                    borderTopRightRadius: 2,
                  }} />
                </View>
              ))}
            </View>
            
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginTop: 8 }}>
              <Text style={{ fontSize: 10, fontWeight: '500', color: '#886364', textTransform: 'uppercase', letterSpacing: 1 }}>Oct 1</Text>
              <Text style={{ fontSize: 10, fontWeight: '500', color: '#886364', textTransform: 'uppercase', letterSpacing: 1 }}>Oct 24</Text>
            </View>
          </View>

          {/* Recent History */}
          <View style={{
            backgroundColor: 'white',
            borderRadius: 24,
            padding: 20,
            shadowColor: '#000',
            shadowOffset: { width: 0, height: 1 },
            shadowOpacity: 0.05,
            shadowRadius: 4,
            elevation: 2,
            borderWidth: 1,
            borderColor: 'rgba(0, 0, 0, 0.05)',
          }}>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
              <Text style={{
                fontSize: 12,
                fontWeight: 'bold',
                color: '#886364',
                textTransform: 'uppercase',
                letterSpacing: 1.5,
              }}>
                Recent History
              </Text>
              <TouchableOpacity>
                <Text style={{ fontSize: 12, fontWeight: 'bold', color: '#EA2831' }}>View All</Text>
              </TouchableOpacity>
            </View>
            
            <View style={{ gap: 0 }}>
              {[
                { date: 'Oct 22', amount: '-$8.50' },
                { date: 'Oct 18', amount: '-$14.20' },
                { date: 'Oct 12', amount: '-$5.75' },
              ].map((transaction, index) => (
                <TouchableOpacity key={index} style={{
                  flexDirection: 'row',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  paddingVertical: 12,
                  borderBottomWidth: index < 2 ? 1 : 0,
                  borderBottomColor: 'rgba(0, 0, 0, 0.05)',
                }}>
                  <View>
                    <Text style={{ fontSize: 14, fontWeight: 'bold', color: '#181111' }}>Starbucks</Text>
                    <Text style={{ fontSize: 12, color: '#886364' }}>{transaction.date} • Coffee & Dining</Text>
                  </View>
                  <Text style={{ fontSize: 14, fontWeight: 'bold', color: '#181111' }}>{transaction.amount}</Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        </View>
      </ScrollView>
      
      {/* Floating Edit Button */}
      <TouchableOpacity
        style={{
          position: 'absolute',
          bottom: 32,
          right: 24,
          width: 56,
          height: 56,
          backgroundColor: '#EA2831',
          borderRadius: 28,
          alignItems: 'center',
          justifyContent: 'center',
          shadowColor: '#EA2831',
          shadowOffset: { width: 0, height: 4 },
          shadowOpacity: 0.3,
          shadowRadius: 15,
          elevation: 8,
        }}
        onPress={() => setShowEditModal(true)}
      >
        <Ionicons name="pencil" size={24} color="white" />
      </TouchableOpacity>
      
      <EditTransactionModal 
        visible={showEditModal} 
        onClose={() => setShowEditModal(false)} 
      />
    </SafeAreaView>
  );
}