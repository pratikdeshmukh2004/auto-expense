import { Ionicons } from '@expo/vector-icons';
import React, { useState } from 'react';
import { Modal, ScrollView, Text, TextInput, TouchableOpacity, View, Dimensions, Alert } from 'react-native';
import { PaymentMethodService, PaymentMethod } from '../../services/PaymentMethodService';

interface PaymentMethodModalProps {
  visible: boolean;
  onClose: () => void;
  onSave: () => void;
  paymentMethod?: PaymentMethod;
  isAddMode?: boolean;
}

export default function PaymentMethodModal({ visible, onClose, onSave, paymentMethod, isAddMode = false }: PaymentMethodModalProps) {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [selectedColor, setSelectedColor] = useState('#EA2831');
  const [selectedIcon, setSelectedIcon] = useState('card');
  const [selectedType, setSelectedType] = useState<'card' | 'bank' | 'wallet' | 'cash'>('card');
  
  // Reset state when modal opens
  React.useEffect(() => {
    if (visible) {
      if (paymentMethod && !isAddMode) {
        setName(paymentMethod.name);
        setDescription(paymentMethod.description || '');
        setSelectedColor(paymentMethod.color);
        setSelectedIcon(paymentMethod.icon);
        setSelectedType(paymentMethod.type);
      } else {
        setName('');
        setDescription('');
        setSelectedColor('#EA2831');
        setSelectedIcon('card');
        setSelectedType('card');
      }
    }
  }, [visible, paymentMethod, isAddMode]);
  
  const colors = ['#EA2831', '#3b82f6', '#10b981', '#f59e0b', '#8b5cf6', '#64748b'];
  const icons = ['card', 'wallet', 'cash', 'phone-portrait', 'business', 'library', 'diamond', 'gift'];
  const types = [
    { key: 'card', label: 'Credit/Debit Card', icon: 'card' },
    { key: 'bank', label: 'Bank Account', icon: 'business' },
    { key: 'wallet', label: 'Digital Wallet', icon: 'wallet' },
    { key: 'cash', label: 'Cash', icon: 'cash' }
  ];
  const screenHeight = Dimensions.get('window').height;

  const handleSave = async () => {
    if (!name.trim()) return;
    
    try {
      if (isAddMode) {
        await PaymentMethodService.addPaymentMethod({
          name: name.trim(),
          icon: selectedIcon,
          color: selectedColor,
          type: selectedType,
          description: description.trim() || `${name.trim()} payment method`
        });
      } else if (paymentMethod) {
        await PaymentMethodService.updatePaymentMethod(paymentMethod.id, {
          name: name.trim(),
          icon: selectedIcon,
          color: selectedColor,
          type: selectedType,
          description: description.trim() || paymentMethod.description
        });
      }
      onSave();
      onClose();
    } catch (error) {
      console.error('Error saving payment method:', error);
    }
  };

  const handleDelete = async () => {
    if (paymentMethod) {
      // Check if it's a default payment method
      const defaultIds = ['1', '2', '3', '4'];
      if (defaultIds.includes(paymentMethod.id)) {
        Alert.alert(
          'Cannot Delete',
          'Default payment methods cannot be deleted. You can only edit them.',
          [{ text: 'OK' }]
        );
        return;
      }

      Alert.alert(
        'Delete Payment Method',
        `Are you sure you want to delete "${paymentMethod.name}"? This action cannot be undone.`,
        [
          { text: 'Cancel', style: 'cancel' },
          {
            text: 'Delete',
            style: 'destructive',
            onPress: async () => {
              try {
                await PaymentMethodService.deletePaymentMethod(paymentMethod.id);
                onSave();
                onClose();
              } catch (error) {
                console.error('Error deleting payment method:', error);
                Alert.alert('Error', 'Failed to delete payment method. Please try again.');
              }
            }
          }
        ]
      );
    }
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={onClose}
    >
      <View style={{ flex: 1, backgroundColor: '#f8f6f6', maxHeight: screenHeight * 0.9 }}>
        {/* Handle */}
        <View style={{ alignItems: 'center', paddingTop: 8, paddingBottom: 4 }}>
          <View style={{
            width: 40,
            height: 6,
            backgroundColor: '#d1d5db',
            borderRadius: 3,
          }} />
        </View>

        {/* Header */}
        <View style={{
          flexDirection: 'row',
          justifyContent: 'space-between',
          alignItems: 'center',
          paddingHorizontal: 24,
          paddingVertical: 16,
        }}>
          <Text style={{ fontSize: 20, fontWeight: 'bold', color: '#1f2937' }}>{isAddMode ? 'Add Payment Method' : 'Edit Payment Method'}</Text>
          <TouchableOpacity onPress={onClose} style={{
            width: 40,
            height: 40,
            borderRadius: 20,
            alignItems: 'center',
            justifyContent: 'center',
          }}>
            <Ionicons name="close" size={24} color="#1f2937" />
          </TouchableOpacity>
        </View>

        <ScrollView style={{ flex: 1, paddingHorizontal: 24 }} showsVerticalScrollIndicator={false}>
          {/* Icon Section */}
          <View style={{ alignItems: 'center', paddingVertical: 12 }}>
            <View style={{
              width: 80,
              height: 80,
              borderRadius: 40,
              backgroundColor: `${selectedColor}20`,
              alignItems: 'center',
              justifyContent: 'center',
            }}>
              <Ionicons name={selectedIcon as any} size={36} color={selectedColor} />
            </View>
          </View>

          {/* Icon Selection */}
          <View style={{ marginTop: 20 }}>
            <Text style={{ fontSize: 16, fontWeight: 'bold', color: '#1f2937', marginBottom: 12 }}>Choose Icon</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ paddingVertical: 4 }}>
              <View style={{ flexDirection: 'row', gap: 12, paddingHorizontal: 4 }}>
                {icons.map((icon) => (
                  <TouchableOpacity
                    key={icon}
                    onPress={() => setSelectedIcon(icon)}
                    style={{
                      width: 48,
                      height: 48,
                      borderRadius: 12,
                      backgroundColor: selectedIcon === icon ? `${selectedColor}20` : '#f3f4f6',
                      alignItems: 'center',
                      justifyContent: 'center',
                      borderWidth: selectedIcon === icon ? 2 : 1,
                      borderColor: selectedIcon === icon ? selectedColor : '#e5e7eb',
                    }}
                  >
                    <Ionicons name={icon as any} size={24} color={selectedIcon === icon ? selectedColor : '#6b7280'} />
                  </TouchableOpacity>
                ))}
              </View>
            </ScrollView>
          </View>

          {/* Color Selection */}
          <View style={{ marginTop: 20 }}>
            <Text style={{ fontSize: 16, fontWeight: 'bold', color: '#1f2937', marginBottom: 12 }}>Color Tag</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ paddingVertical: 4 }}>
              <View style={{ flexDirection: 'row', gap: 16, paddingHorizontal: 4 }}>
                {colors.map((color) => (
                  <TouchableOpacity
                    key={color}
                    onPress={() => setSelectedColor(color)}
                    style={{
                      width: 48,
                      height: 48,
                      borderRadius: 24,
                      backgroundColor: color,
                      alignItems: 'center',
                      justifyContent: 'center',
                      borderWidth: selectedColor === color ? 2 : 0,
                      borderColor: selectedColor === color ? color : 'transparent',
                      shadowColor: selectedColor === color ? color : '#000',
                      shadowOffset: { width: 0, height: 2 },
                      shadowOpacity: selectedColor === color ? 0.3 : 0.1,
                      shadowRadius: 4,
                      elevation: selectedColor === color ? 4 : 2,
                    }}
                  >
                    {selectedColor === color && (
                      <Ionicons name="checkmark" size={20} color="white" />
                    )}
                  </TouchableOpacity>
                ))}
              </View>
            </ScrollView>
          </View>

          {/* Name Input */}
          <View style={{ marginTop: 20 }}>
            <Text style={{ fontSize: 14, fontWeight: 'bold', color: '#1f2937', marginBottom: 8 }}>Payment Method Name</Text>
            <TextInput
              style={{
                backgroundColor: 'white',
                borderRadius: 12,
                paddingHorizontal: 16,
                paddingVertical: 16,
                fontSize: 16,
                fontWeight: '500',
                color: '#1f2937',
                borderWidth: 1,
                borderColor: '#e5e7eb',
                shadowColor: '#000',
                shadowOffset: { width: 0, height: 1 },
                shadowOpacity: 0.05,
                shadowRadius: 2,
                elevation: 1,
              }}
              placeholder="e.g. HDFC Credit Card"
              placeholderTextColor="#9ca3af"
              value={name}
              onChangeText={setName}
              maxLength={25}
            />
          </View>

          {/* Description Input */}
          <View style={{ marginTop: 16 }}>
            <Text style={{ fontSize: 14, fontWeight: 'bold', color: '#1f2937', marginBottom: 8 }}>Description</Text>
            <TextInput
              style={{
                backgroundColor: 'white',
                borderRadius: 12,
                paddingHorizontal: 16,
                paddingVertical: 16,
                fontSize: 16,
                fontWeight: '500',
                color: '#1f2937',
                borderWidth: 1,
                borderColor: '#e5e7eb',
                shadowColor: '#000',
                shadowOffset: { width: 0, height: 1 },
                shadowOpacity: 0.05,
                shadowRadius: 2,
                elevation: 1,
              }}
              placeholder="e.g. Primary credit card for online purchases"
              placeholderTextColor="#9ca3af"
              value={description}
              onChangeText={setDescription}
            />
          </View>

          {/* Type Selection */}
          <View style={{ marginTop: 20 }}>
            <Text style={{ fontSize: 16, fontWeight: 'bold', color: '#1f2937', marginBottom: 12 }}>Payment Type</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ paddingVertical: 4 }}>
              <View style={{ flexDirection: 'row', gap: 12, paddingHorizontal: 4 }}>
                {types.map((type) => (
                  <TouchableOpacity
                    key={type.key}
                    onPress={() => setSelectedType(type.key as any)}
                    style={{
                      width: 80,
                      height: 80,
                      borderRadius: 12,
                      backgroundColor: selectedType === type.key ? `${selectedColor}20` : '#f3f4f6',
                      alignItems: 'center',
                      justifyContent: 'center',
                      borderWidth: selectedType === type.key ? 2 : 1,
                      borderColor: selectedType === type.key ? selectedColor : '#e5e7eb',
                      gap: 4,
                    }}
                  >
                    <Ionicons 
                      name={type.icon as any} 
                      size={24} 
                      color={selectedType === type.key ? selectedColor : '#6b7280'} 
                    />
                    <Text style={{
                      fontSize: 10,
                      fontWeight: selectedType === type.key ? 'bold' : '500',
                      color: selectedType === type.key ? selectedColor : '#6b7280',
                      textAlign: 'center',
                    }}>
                      {type.label.split(' ')[0]}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </ScrollView>
          </View>

          <View style={{ height: 20 }} />
        </ScrollView>

        {/* Action Buttons */}
        <View style={{ paddingHorizontal: 24, paddingBottom: 24, gap: 12 }}>
          <TouchableOpacity
            onPress={handleSave}
            style={{
              backgroundColor: '#EA2831',
              paddingVertical: 16,
              borderRadius: 12,
              alignItems: 'center',
              shadowColor: '#EA2831',
              shadowOffset: { width: 0, height: 4 },
              shadowOpacity: 0.25,
              shadowRadius: 8,
              elevation: 4,
            }}
          >
            <Text style={{ color: 'white', fontSize: 16, fontWeight: 'bold' }}>{isAddMode ? 'Add Payment Method' : 'Save Changes'}</Text>
          </TouchableOpacity>
          
          {!isAddMode && (
            <TouchableOpacity
              onPress={handleDelete}
              style={{
                paddingVertical: 16,
                alignItems: 'center',
                flexDirection: 'row',
                justifyContent: 'center',
                gap: 8,
              }}
            >
              <Ionicons name="trash" size={18} color="#ef4444" />
              <Text style={{ color: '#ef4444', fontSize: 16, fontWeight: 'bold' }}>Delete Payment Method</Text>
            </TouchableOpacity>
          )}
        </View>
      </View>
    </Modal>
  );
}