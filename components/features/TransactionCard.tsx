import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import React, { useRef } from 'react';
import { Animated, PanResponder, Text, TouchableOpacity, View } from 'react-native';
import { Transaction } from '@/services/TransactionService';
import { getRelativeTime } from '@/utils/dateUtils';

interface TransactionCardProps {
  transaction: Transaction;
  categoryIcons: {[key: string]: string};
  categoryColors: {[key: string]: string};
  showRelativeTime?: boolean;
  onEdit?: () => void;
  onDuplicate?: () => void;
  onDelete?: () => void;
  isSelected?: boolean;
  onToggleSelect?: () => void;
  selectionMode?: boolean;
  onLongPress?: () => void;
}

export default function TransactionCard({ 
  transaction, 
  categoryIcons, 
  categoryColors, 
  showRelativeTime = true,
  onEdit,
  onDuplicate,
  onDelete,
  isSelected,
  onToggleSelect,
  selectionMode,
  onLongPress
}: TransactionCardProps) {
  const translateX = useRef(new Animated.Value(0)).current;
  
  const panResponder = PanResponder.create({
    onMoveShouldSetPanResponder: (_, gestureState) => {
      return Math.abs(gestureState.dx) > 20;
    },
    onPanResponderMove: (_, gestureState) => {
      if (gestureState.dx < 0) {
        translateX.setValue(Math.max(gestureState.dx, -180));
      }
    },
    onPanResponderRelease: (_, gestureState) => {
      if (gestureState.dx < -40) {
        Animated.spring(translateX, {
          toValue: -180,
          useNativeDriver: false,
        }).start();
      } else {
        Animated.spring(translateX, {
          toValue: 0,
          useNativeDriver: false,
        }).start();
      }
    },
  });
  
  return (
    <View style={{ position: 'relative', marginBottom: 12 }}>
      {/* Background Card */}
      <View style={{
        position: 'absolute',
        right: 0,
        top: 0,
        bottom: 0,
        left: 0,
        backgroundColor: 'rgba(255, 255, 255, 0.6)',
        borderRadius: 12,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.05,
        shadowRadius: 2,
        elevation: 1,
      }} />
      
      {/* Action Buttons */}
      {(onEdit || onDuplicate || onDelete) && !selectionMode && (
        <View style={{
          position: 'absolute',
          right: 0,
          top: 0,
          bottom: 0,
          flexDirection: 'row',
          alignItems: 'center',
          paddingRight: 16,
          borderRadius: 12,
          paddingLeft: 8,
        }}>
          {onDuplicate && (
            <TouchableOpacity 
              style={{
                width: 40,
                height: 40,
                alignItems: 'center',
                justifyContent: 'center',
                marginRight: 8,
              }}
              onPress={onDuplicate}
            >
              <Ionicons name="copy" size={20} color="#10b981" />
            </TouchableOpacity>
          )}
          {onEdit && (
            <TouchableOpacity 
              style={{
                width: 40,
                height: 40,
                alignItems: 'center',
                justifyContent: 'center',
                marginRight: 8,
              }}
              onPress={onEdit}
            >
              <Ionicons name="create" size={20} color="#3b82f6" />
            </TouchableOpacity>
          )}
          {onDelete && (
            <TouchableOpacity 
              style={{
                width: 40,
                height: 40,
                alignItems: 'center',
                justifyContent: 'center',
              }}
              onPress={onDelete}
            >
              <Ionicons name="trash" size={20} color="#ef4444" />
            </TouchableOpacity>
          )}
        </View>
      )}
      
      {/* Transaction Card */}
      <Animated.View
        style={{
          transform: [{ translateX }],
          backgroundColor: isSelected ? 'rgba(234, 40, 49, 0.05)' : 'white',
          borderRadius: 12,
          padding: 16,
          shadowColor: '#000',
          shadowOffset: { width: 0, height: 1 },
          shadowOpacity: 0.05,
          shadowRadius: 2,
          elevation: 1,
          borderWidth: isSelected ? 1 : 0,
          borderColor: isSelected ? 'rgba(234, 40, 49, 0.3)' : 'transparent',
        }}
        {...(onEdit || onDuplicate || onDelete ? panResponder.panHandlers : {})}
      >
    <TouchableOpacity
      onPress={() => selectionMode && onToggleSelect ? onToggleSelect() : router.push(`/transactions/details?id=${transaction.id}`)}
      onLongPress={onLongPress}
      style={{
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
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
            {transaction.paymentMethod || 'Cash'} • {showRelativeTime ? getRelativeTime(transaction.timestamp) : new Date(transaction.timestamp).toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })}
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
      </Animated.View>
    </View>
  );
}