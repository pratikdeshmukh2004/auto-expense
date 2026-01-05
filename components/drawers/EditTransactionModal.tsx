import React, { useState, useRef, useEffect } from 'react';
import { View, Text, TouchableOpacity, TextInput, ScrollView, Modal, PanResponder, Animated } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { BlurView } from 'expo-blur';
import DateTimePickerModal from './DateTimePickerModal';

interface EditTransactionModalProps {
  visible: boolean;
  onClose: () => void;
}

export default function EditTransactionModal({ visible, onClose }: EditTransactionModalProps) {
  const [amount, setAmount] = useState('45.20');
  const [description, setDescription] = useState('Uber Eats');
  const [selectedCategory, setSelectedCategory] = useState('Food & Drink');
  const [selectedPayment, setSelectedPayment] = useState('Chase Sapphire');
  const [notes, setNotes] = useState('Lunch with the team regarding Q4 marketing strategy.');
  const [selectedDateTime, setSelectedDateTime] = useState(new Date());
  const [showDatePicker, setShowDatePicker] = useState(false);

  const pan = useRef(new Animated.ValueXY()).current;
  
  useEffect(() => {
    pan.setValue({ x: 0, y: 0 });
  }, [visible]);
  
  const panResponder = PanResponder.create({
    onStartShouldSetPanResponder: () => false,
    onMoveShouldSetPanResponder: () => false,
  });

  const handlePanResponder = PanResponder.create({
    onStartShouldSetPanResponder: (evt) => {
      // Only respond if touch starts in the handle area (top 40px)
      return evt.nativeEvent.locationY < 40;
    },
    onMoveShouldSetPanResponder: (evt, gestureState) => {
      // Only respond if starting from handle area AND moving down significantly
      return evt.nativeEvent.locationY < 40 && gestureState.dy > 20 && Math.abs(gestureState.dx) < Math.abs(gestureState.dy);
    },
    onPanResponderMove: (_, gestureState) => {
      if (gestureState.dy > 0) {
        pan.setValue({ x: 0, y: gestureState.dy });
      }
    },
    onPanResponderRelease: (_, gestureState) => {
      if (gestureState.dy > 150 && gestureState.vy > 0.5) {
        onClose();
      } else {
        Animated.spring(pan, {
          toValue: { x: 0, y: 0 },
          useNativeDriver: true,
        }).start();
      }
    },
  });
  
  const categories = [
    { name: 'Food & Drink', icon: 'restaurant' },
    { name: 'Transport', icon: 'car' },
    { name: 'Shopping', icon: 'bag' },
    { name: 'Entertainment', icon: 'game-controller' },
  ];

  const paymentMethods = [
    { name: 'Cash', icon: 'cash' },
    { name: 'Chase Sapphire', icon: 'card' },
    { name: 'Debit Card', icon: 'wallet' },
  ];

  return (
    <Modal visible={visible} animationType="slide" presentationStyle="fullScreen" transparent>
      <View 
        style={{ flex: 1, backgroundColor: 'rgba(0, 0, 0, 0.6)', justifyContent: 'flex-end' }}
      >
        <Animated.View 
          style={{
            backgroundColor: '#f8f6f6',
            borderTopLeftRadius: 24,
            borderTopRightRadius: 24,
            height: '90%',
            shadowColor: '#000',
            shadowOffset: { width: 0, height: -8 },
            shadowOpacity: 0.3,
            shadowRadius: 20,
            elevation: 20,
            paddingBottom: 80,
            transform: [{ translateY: pan.y }],
          }}
        >
          {/* Handle */}
          <View 
            style={{ alignItems: 'center', paddingTop: 12, paddingBottom: 4 }}
            {...handlePanResponder.panHandlers}
          >
            <View style={{
              width: 48,
              height: 6,
              backgroundColor: '#d1d5db',
              borderRadius: 3,
            }} />
          </View>

          {/* Header */}
          <View style={{
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'space-between',
            paddingHorizontal: 24,
            paddingVertical: 8,
          }}>
            <TouchableOpacity
              onPress={onClose}
              style={{
                width: 40,
                height: 40,
                alignItems: 'center',
                justifyContent: 'center',
                borderRadius: 20,
              }}
            >
              <Ionicons name="close" size={24} color="#64748b" />
            </TouchableOpacity>
            <Text style={{ fontSize: 16, fontWeight: 'bold', color: '#0f172a' }}>Edit Transaction</Text>
            <View style={{ width: 40 }} />
          </View>

          <ScrollView style={{ flex: 1 }} showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 160 }}>
            {/* Amount Input */}
            <View style={{
              alignItems: 'center',
              justifyContent: 'center',
              paddingTop: 16,
              paddingBottom: 32,
              paddingHorizontal: 24,
            }}>
              <View style={{ position: 'relative', alignItems: 'center' }}>
                <View style={{ flexDirection: 'row', alignItems: 'baseline', justifyContent: 'center', gap: 4 }}>
                  <Text style={{ fontSize: 48, fontWeight: 'bold', color: '#94a3b8' }}>$</Text>
                  <TextInput
                    style={{
                      fontSize: 56,
                      fontWeight: '800',
                      color: '#0f172a',
                      textAlign: 'center',
                      width: 220,
                      backgroundColor: 'transparent',
                    }}
                    value={amount}
                    onChangeText={setAmount}
                    keyboardType="decimal-pad"
                  />
                </View>
              </View>
            </View>

            <View style={{ paddingHorizontal: 20, gap: 24 }}>
              {/* Description */}
              <View style={{ gap: 8 }}>
                <Text style={{
                  fontSize: 14,
                  fontWeight: '500',
                  color: '#64748b',
                  marginLeft: 4,
                }}>Description</Text>
                <View style={{ position: 'relative' }}>
                  <View style={{
                    position: 'absolute',
                    left: 16,
                    top: 16,
                    zIndex: 1,
                  }}>
                    <Ionicons name="create-outline" size={20} color="#94a3b8" />
                  </View>
                  <TextInput
                    style={{
                      backgroundColor: 'white',
                      borderRadius: 16,
                      paddingLeft: 48,
                      paddingRight: 48,
                      paddingVertical: 16,
                      fontSize: 18,
                      fontWeight: '600',
                      color: '#0f172a',
                      borderWidth: 1,
                      borderColor: 'rgba(0, 0, 0, 0.05)',
                    }}
                    value={description}
                    onChangeText={setDescription}
                  />
                  <TouchableOpacity 
                    style={{
                      position: 'absolute',
                      right: 16,
                      top: 16,
                    }}
                    onPress={() => setShowDatePicker(true)}
                  >
                    <Ionicons name="calendar-outline" size={20} color="#EA2831" />
                  </TouchableOpacity>
                </View>
              </View>

              {/* Category */}
              <View style={{ gap: 12 }}>
                <Text style={{
                  fontSize: 14,
                  fontWeight: '500',
                  color: '#64748b',
                  marginLeft: 4,
                }}>Category</Text>
                <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
                  {categories.map((category) => (
                    <TouchableOpacity
                      key={category.name}
                      style={{
                        flexDirection: 'row',
                        alignItems: 'center',
                        gap: 8,
                        backgroundColor: selectedCategory === category.name ? '#EA2831' : 'white',
                        paddingHorizontal: 16,
                        paddingVertical: 10,
                        borderRadius: 12,
                        borderWidth: selectedCategory === category.name ? 2 : 1,
                        borderColor: selectedCategory === category.name ? '#EA2831' : 'rgba(0, 0, 0, 0.05)',
                        shadowColor: selectedCategory === category.name ? '#EA2831' : '#000',
                        shadowOffset: { width: 0, height: selectedCategory === category.name ? 4 : 0 },
                        shadowOpacity: selectedCategory === category.name ? 0.2 : 0,
                        shadowRadius: selectedCategory === category.name ? 8 : 0,
                        elevation: selectedCategory === category.name ? 4 : 0,
                      }}
                      onPress={() => setSelectedCategory(category.name)}
                    >
                      <Ionicons 
                        name={category.icon as any} 
                        size={18} 
                        color={selectedCategory === category.name ? 'white' : '#64748b'} 
                      />
                      <Text style={{
                        fontSize: 14,
                        fontWeight: selectedCategory === category.name ? 'bold' : '500',
                        color: selectedCategory === category.name ? 'white' : '#64748b',
                      }}>
                        {category.name}
                      </Text>
                    </TouchableOpacity>
                  ))}
                  <TouchableOpacity style={{
                    paddingHorizontal: 12,
                    paddingVertical: 10,
                    borderRadius: 12,
                    backgroundColor: 'white',
                    borderWidth: 1,
                    borderColor: 'rgba(0, 0, 0, 0.05)',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}>
                    <Ionicons name="add" size={20} color="#94a3b8" />
                  </TouchableOpacity>
                </View>
              </View>

              {/* Payment Method */}
              <View style={{ gap: 12 }}>
                <Text style={{
                  fontSize: 14,
                  fontWeight: '500',
                  color: '#64748b',
                  marginLeft: 4,
                }}>Payment Method</Text>
                <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
                  {paymentMethods.map((method) => (
                    <TouchableOpacity
                      key={method.name}
                      style={{
                        flexDirection: 'row',
                        alignItems: 'center',
                        gap: 8,
                        backgroundColor: selectedPayment === method.name ? '#EA2831' : 'white',
                        paddingHorizontal: 16,
                        paddingVertical: 10,
                        borderRadius: 12,
                        borderWidth: selectedPayment === method.name ? 2 : 1,
                        borderColor: selectedPayment === method.name ? '#EA2831' : 'rgba(0, 0, 0, 0.05)',
                        shadowColor: selectedPayment === method.name ? '#EA2831' : '#000',
                        shadowOffset: { width: 0, height: selectedPayment === method.name ? 4 : 0 },
                        shadowOpacity: selectedPayment === method.name ? 0.2 : 0,
                        shadowRadius: selectedPayment === method.name ? 8 : 0,
                        elevation: selectedPayment === method.name ? 4 : 0,
                      }}
                      onPress={() => setSelectedPayment(method.name)}
                    >
                      <Ionicons 
                        name={method.icon as any} 
                        size={18} 
                        color={selectedPayment === method.name ? 'white' : '#64748b'} 
                      />
                      <Text style={{
                        fontSize: 14,
                        fontWeight: selectedPayment === method.name ? 'bold' : '500',
                        color: selectedPayment === method.name ? 'white' : '#64748b',
                      }}>
                        {method.name}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>

              {/* Notes */}
              <View style={{ gap: 8 }}>
                <Text style={{
                  fontSize: 14,
                  fontWeight: '500',
                  color: '#64748b',
                  marginLeft: 4,
                }}>Notes</Text>
                <View style={{ position: 'relative' }}>
                  <View style={{
                    position: 'absolute',
                    left: 16,
                    top: 16,
                    zIndex: 1,
                  }}>
                    <Ionicons name="document-text-outline" size={20} color="#94a3b8" />
                  </View>
                  <TextInput
                    style={{
                      backgroundColor: 'white',
                      borderRadius: 16,
                      paddingLeft: 48,
                      paddingRight: 16,
                      paddingVertical: 16,
                      fontSize: 16,
                      fontWeight: '500',
                      color: '#0f172a',
                      height: 96,
                      textAlignVertical: 'top',
                      borderWidth: 1,
                      borderColor: 'rgba(0, 0, 0, 0.05)',
                      lineHeight: 24,
                    }}
                    value={notes}
                    onChangeText={setNotes}
                    multiline
                  />
                </View>
              </View>
            </View>
          </ScrollView>

          {/* Bottom Actions */}
          <View style={{
            position: 'absolute',
            bottom: 0,
            left: 0,
            right: 0,
            backgroundColor: 'rgba(248, 246, 246, 0.95)',
            borderTopWidth: 1,
            borderTopColor: 'rgba(0, 0, 0, 0.05)',
            paddingHorizontal: 20,
            paddingTop: 20,
            paddingBottom: 32,
            gap: 12,
          }}>
            <TouchableOpacity
              style={{
                backgroundColor: '#EA2831',
                paddingVertical: 16,
                borderRadius: 12,
                flexDirection: 'row',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 8,
                shadowColor: '#EA2831',
                shadowOffset: { width: 0, height: 4 },
                shadowOpacity: 0.2,
                shadowRadius: 8,
                elevation: 4,
              }}
              onPress={onClose}
            >
              <Ionicons name="checkmark" size={20} color="white" />
              <Text style={{ fontSize: 18, fontWeight: 'bold', color: 'white' }}>Save Changes</Text>
            </TouchableOpacity>
            
            <TouchableOpacity
              style={{
                backgroundColor: 'transparent',
                paddingVertical: 12,
                borderRadius: 12,
                flexDirection: 'row',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 8,
              }}
              onPress={onClose}
            >
              <Ionicons name="trash-outline" size={20} color="#ef4444" />
              <Text style={{ fontSize: 16, fontWeight: '600', color: '#ef4444' }}>Delete Transaction</Text>
            </TouchableOpacity>
          </View>
        </Animated.View>
      </View>
      
      <DateTimePickerModal
        visible={showDatePicker}
        onClose={() => setShowDatePicker(false)}
        onSelectDateTime={(date) => {
          setSelectedDateTime(date);
          setShowDatePicker(false);
        }}
        initialDate={selectedDateTime}
      />
    </Modal>
  );
}