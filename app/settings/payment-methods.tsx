import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import React, { useState } from 'react';
import { ScrollView, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { PaymentMethodModal } from '../../components/modals';
import { PaymentMethod } from '../../services/PaymentMethodService';
import { usePaymentMethods } from '../../hooks/useQueries';

export default function PaymentMethodsScreen() {
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState<PaymentMethod | null>(null);
  const [isAddMode, setIsAddMode] = useState(false);

  // TanStack Query hook
  const { data: paymentMethods = [] } = usePaymentMethods();

  const addPaymentMethod = () => {
    setSelectedPaymentMethod(null);
    setIsAddMode(true);
    setShowEditModal(true);
  };

  const handleEditPaymentMethod = (paymentMethod: PaymentMethod) => {
    setSelectedPaymentMethod(paymentMethod);
    setIsAddMode(false);
    setShowEditModal(true);
  };

  const handleSave = () => {
    // Data will be automatically refetched by TanStack Query
  };

  const getTypeLabel = (type: string) => {
    switch (type) {
      case 'card': return 'Card';
      case 'bank': return 'Bank';
      case 'wallet': return 'Wallet';
      case 'cash': return 'Cash';
      default: return 'Other';
    }
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#f8f6f6' }}>
      {/* Header */}
      <View style={{
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 16,
        paddingVertical: 16,
        backgroundColor: 'rgba(248, 246, 246, 0.9)',
      }}>
        <TouchableOpacity onPress={() => router.back()} style={{
          width: 40,
          height: 40,
          borderRadius: 20,
          alignItems: 'center',
          justifyContent: 'center',
        }}>
          <Ionicons name="arrow-back" size={24} color="#1f2937" />
        </TouchableOpacity>
        <Text style={{
          flex: 1,
          textAlign: 'center',
          fontSize: 18,
          fontWeight: 'bold',
          color: '#1f2937',
          paddingRight: 40,
        }}>Manage Payment Methods</Text>
      </View>

      <ScrollView style={{ flex: 1 }} showsVerticalScrollIndicator={false}>
        {/* Payment Methods List */}
        <View style={{ paddingHorizontal: 20, paddingTop: 20, paddingBottom: 20 }}>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
            <Text style={{ fontSize: 18, fontWeight: 'bold', color: '#1f2937' }}>Your Payment Methods</Text>
            <View style={{
              backgroundColor: '#f3f4f6',
              paddingHorizontal: 8,
              paddingVertical: 4,
              borderRadius: 6,
            }}>
              <Text style={{ fontSize: 12, fontWeight: '500', color: '#6b7280' }}>{paymentMethods.length} Total</Text>
            </View>
          </View>
          
          <View style={{ gap: 12 }}>
            {paymentMethods.map((paymentMethod) => (
              <TouchableOpacity 
                key={paymentMethod.id} 
                onPress={() => handleEditPaymentMethod(paymentMethod)}
                style={{
                  flexDirection: 'row',
                  alignItems: 'center',
                  gap: 16,
                  backgroundColor: 'white',
                  padding: 12,
                  borderRadius: 12,
                  borderWidth: 1,
                  borderColor: '#f3f4f6',
                  shadowColor: '#000',
                  shadowOffset: { width: 0, height: 1 },
                  shadowOpacity: 0.05,
                  shadowRadius: 2,
                  elevation: 1,
                }}
              >
                <View style={{
                  width: 48,
                  height: 48,
                  borderRadius: 12,
                  backgroundColor: `${paymentMethod.color}20`,
                  alignItems: 'center',
                  justifyContent: 'center',
                }}>
                  <Ionicons name={paymentMethod.icon as any} size={24} color={paymentMethod.color} />
                </View>
                <View style={{ flex: 1 }}>
                  <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                    <Text style={{ fontSize: 16, fontWeight: 'bold', color: '#1f2937' }}>{paymentMethod.name}</Text>
                    <View style={{
                      backgroundColor: `${paymentMethod.color}20`,
                      paddingHorizontal: 6,
                      paddingVertical: 2,
                      borderRadius: 4,
                    }}>
                      <Text style={{ fontSize: 10, fontWeight: 'bold', color: paymentMethod.color, textTransform: 'uppercase' }}>
                        {getTypeLabel(paymentMethod.type)}
                      </Text>
                    </View>
                  </View>
                  <Text style={{ fontSize: 12, color: '#6b7280', marginTop: 2 }}>{paymentMethod.description || `${paymentMethod.name} payment method`}</Text>
                </View>
                <Ionicons name="chevron-forward" size={20} color="#9ca3af" />
              </TouchableOpacity>
            ))}
          </View>
        </View>
      </ScrollView>
      
      {/* Floating Action Button */}
      <TouchableOpacity 
        style={{
          position: 'absolute',
          bottom: 100,
          right: 20,
          width: 56,
          height: 56,
          borderRadius: 28,
          backgroundColor: '#EA2831',
          alignItems: 'center',
          justifyContent: 'center',
          shadowColor: '#EA2831',
          shadowOffset: { width: 0, height: 4 },
          shadowOpacity: 0.4,
          shadowRadius: 8,
          elevation: 8,
        }}
        onPress={addPaymentMethod}
      >
        <Ionicons name="add" size={28} color="white" />
      </TouchableOpacity>
      
      <PaymentMethodModal
        visible={showEditModal}
        onClose={() => setShowEditModal(false)}
        onSave={handleSave}
        paymentMethod={selectedPaymentMethod}
        isAddMode={isAddMode}
      />
    </SafeAreaView>
  );
}