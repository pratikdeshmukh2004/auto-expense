import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import React from 'react';
import { Text, TouchableOpacity, View } from 'react-native';
import { Transaction } from '../services/TransactionService';
import { getRelativeTime } from '../utils/dateUtils';

interface TransactionCardProps {
  transaction: Transaction;
  categoryIcons: {[key: string]: string};
  categoryColors: {[key: string]: string};
  showRelativeTime?: boolean;
}

export default function TransactionCard({ 
  transaction, 
  categoryIcons, 
  categoryColors, 
  showRelativeTime = true 
}: TransactionCardProps) {
  return (
    <TouchableOpacity
      onPress={() => router.push(`/transactions/details?id=${transaction.id}`)}
      style={{
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        backgroundColor: 'white',
        borderRadius: 12,
        padding: 16,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.05,
        shadowRadius: 2,
        elevation: 1,
        marginBottom: 4,
      }}
    >
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 16, flex: 1 }}>
        <View style={{
          width: 48,
          height: 48,
          borderRadius: 12,
          backgroundColor: 'rgba(234, 42, 51, 0.1)',
          alignItems: 'center',
          justifyContent: 'center',
        }}>
          <Ionicons 
            name={categoryIcons[transaction.category] || 'storefront'} 
            size={24} 
            color={categoryColors[transaction.category] || '#ea2a33'} 
          />
        </View>
        <View style={{ flex: 1 }}>
          <Text style={{ fontSize: 16, fontWeight: 'bold', color: '#111827' }} numberOfLines={1} ellipsizeMode="tail">
            {transaction.merchant}
          </Text>
          <Text style={{ fontSize: 12, fontWeight: '500', color: '#6b7280', marginTop: 4 }}>
            {transaction.category} • {showRelativeTime ? getRelativeTime(transaction.timestamp) : new Date(transaction.timestamp).toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })}
          </Text>
        </View>
      </View>
      <View style={{ alignItems: 'flex-end', gap: 4 }}>
        <Text style={{ 
          fontSize: 16, 
          fontWeight: 'bold', 
          color: transaction.type === 'income' ? '#10b981' : '#ea2a33' 
        }}>
          {transaction.type === 'income' ? '+' : '-'}₹{transaction.amount}
        </Text>
        <Ionicons name="chevron-forward" size={16} color="#d1d5db" />
      </View>
    </TouchableOpacity>
  );
}