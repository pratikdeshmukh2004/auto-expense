import React, { useEffect, useState } from 'react';
import { View, Text, TouchableOpacity, ScrollView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { PaymentMethodService, PaymentMethod } from '../services/PaymentMethodService';

interface PaymentMethodsProps {
  transactions: any[];
}

export default function PaymentMethods({ transactions }: PaymentMethodsProps) {
  const [paymentMethods, setPaymentMethods] = useState<PaymentMethod[]>([]);
  
  useEffect(() => {
    loadPaymentMethods();
  }, []);
  
  const loadPaymentMethods = async () => {
    const methods = await PaymentMethodService.getPaymentMethods();
    setPaymentMethods(methods);
  };

  // Calculate real data from transactions
  const getPaymentMethodData = () => {
    return paymentMethods.map(method => {
      const methodTransactions = transactions.filter(t => 
        t.paymentMethod === method.name || 
        (method.name === 'Cash' && !t.paymentMethod)
      );
      
      const income = methodTransactions
        .filter(t => t.type === 'income')
        .reduce((sum, t) => sum + parseFloat(t.amount), 0);
        
      const outgoing = methodTransactions
        .filter(t => t.type === 'expense')
        .reduce((sum, t) => sum + parseFloat(t.amount), 0);
      
      return {
        ...method,
        income,
        outgoing
      };
    }).filter(method => method.income > 0 || method.outgoing > 0);
  };

  const activePaymentMethods = getPaymentMethodData();

  return (
    <View style={{
      backgroundColor: 'white',
      borderRadius: 16,
      padding: 20,
      marginBottom: 24,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 1 },
      shadowOpacity: 0.05,
      shadowRadius: 2,
      elevation: 1,
    }}>
      <View style={{
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 20,
      }}>
        <Text style={{ fontSize: 18, fontWeight: 'bold', color: '#0d121b' }}>Payment Methods</Text>
        <TouchableOpacity>
          <Ionicons name="ellipsis-horizontal" size={20} color="#64748b" />
        </TouchableOpacity>
      </View>

      <ScrollView showsVerticalScrollIndicator={false}>
        {activePaymentMethods.length > 0 ? activePaymentMethods.map((method, index) => (
          <TouchableOpacity 
            key={method.id}
            style={{
              backgroundColor: '#f8fafc',
              borderRadius: 12,
              padding: 16,
              marginBottom: index < activePaymentMethods.length - 1 ? 16 : 0,
            }}
          >
            <View style={{
              flexDirection: 'row',
              alignItems: 'center',
              marginBottom: 16,
            }}>
              <View style={{
                width: 40,
                height: 40,
                borderRadius: 8,
                backgroundColor: method.color,
                alignItems: 'center',
                justifyContent: 'center',
                marginRight: 12,
              }}>
                <Ionicons name={method.icon} size={20} color="white" />
              </View>
              <View style={{ flex: 1 }}>
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                  <Text style={{ fontSize: 16, fontWeight: 'bold', color: '#0d121b' }}>
                    {method.name}
                  </Text>
                </View>
                <Text style={{ fontSize: 12, color: '#64748b', marginTop: 2 }}>
                  {method.description}
                </Text>
              </View>
            </View>

            <View style={{ flexDirection: 'row' }}>
              <View style={{ flex: 1 }}>
                <Text style={{ fontSize: 10, fontWeight: '600', color: '#64748b', textTransform: 'uppercase' }}>
                  INCOME
                </Text>
                <Text style={{ fontSize: 18, fontWeight: 'bold', color: '#0d121b', marginTop: 4 }}>
                  ₹{method.income.toFixed(2)}
                </Text>
              </View>
              <View style={{
                width: 1,
                backgroundColor: '#e2e8f0',
                marginHorizontal: 16,
              }} />
              <View style={{ flex: 1, alignItems: 'flex-end' }}>
                <Text style={{ fontSize: 10, fontWeight: '600', color: '#64748b', textTransform: 'uppercase' }}>
                  OUTGOING
                </Text>
                <Text style={{ fontSize: 18, fontWeight: 'bold', color: '#0d121b', marginTop: 4 }}>
                  ₹{method.outgoing.toFixed(method.outgoing % 1 === 0 ? 0 : 2)}
                </Text>
              </View>
            </View>
          </TouchableOpacity>
        )) : (
          <View style={{ alignItems: 'center', justifyContent: 'center', paddingVertical: 60 }}>
            <Ionicons name="card-outline" size={48} color="#94a3b8" />
            <Text style={{ fontSize: 16, fontWeight: 'bold', color: '#64748b', marginTop: 12 }}>
              No payment activity
            </Text>
            <Text style={{ fontSize: 14, color: '#94a3b8', textAlign: 'center', marginTop: 4 }}>
              Add transactions to see payment methods
            </Text>
          </View>
        )}
      </ScrollView>
    </View>
  );
}