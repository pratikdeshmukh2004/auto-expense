import React, { useState, useRef, useEffect } from 'react';
import { View, Text, TouchableOpacity, TextInput, ScrollView, Modal, PanResponder, Animated } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { BlurView } from 'expo-blur';
import DateTimePickerModal from './DateTimePickerModal';

interface AddTransactionModalProps {
  visible: boolean;
  onClose: () => void;
}

export default function AddTransactionModal({ visible, onClose }: AddTransactionModalProps) {
  const [amount, setAmount] = useState('');
  const [description, setDescription] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('Food');
  const [selectedPayment, setSelectedPayment] = useState('HDFC Credit Card');
  const [notes, setNotes] = useState('');
  const [selectedDateTime, setSelectedDateTime] = useState(new Date());
  const [showDatePicker, setShowDatePicker] = useState(false);

  useEffect(() => {
    if (visible) {
      setSelectedDateTime(new Date());
    }
  }, [visible]);

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
    { name: 'Food', icon: 'restaurant' },
    { name: 'Transport', icon: 'car' },
    { name: 'Shopping', icon: 'bag' },
    { name: 'Bills', icon: 'receipt' },
    { name: 'Fun', icon: 'game-controller' },
    { name: 'Health', icon: 'medical' },
    { name: 'Education', icon: 'school' },
  ];

  const paymentMethods = [
    { name: 'HDFC Credit Card', icon: 'card' },
    { name: 'Savings', icon: 'wallet' },
    { name: 'Cash', icon: 'cash' },
    { name: 'Paytm', icon: 'wallet' },
  ];

  return (
    <Modal visible={visible} animationType="slide" presentationStyle="fullScreen" transparent>
      <View 
        style={{ flex: 1, backgroundColor: 'rgba(0, 0, 0, 0.6)', justifyContent: 'flex-end' }}
      >
        <Animated.View 
          style={{
            backgroundColor: '#f8f6f6',
            borderTopLeftRadius: 32,
            borderTopRightRadius: 32,
            height: '90%',
            shadowColor: '#000',
            shadowOffset: { width: 0, height: -4 },
            shadowOpacity: 0.15,
            shadowRadius: 30,
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
              opacity: 0.6,
            }} />
          </View>

          {/* Header */}
          <View style={{
            flexDirection: 'row',
            justifyContent: 'space-between',
            alignItems: 'center',
            paddingHorizontal: 24,
            paddingVertical: 8,
          }}>
            <TouchableOpacity onPress={onClose}>
              <Text style={{ fontSize: 16, fontWeight: '600', color: '#6b7280' }}>Cancel</Text>
            </TouchableOpacity>
            <Text style={{ fontSize: 18, fontWeight: 'bold', color: '#181111' }}>Add Transaction</Text>
            <View style={{ width: 48 }} />
          </View>

          <ScrollView style={{ flex: 1 }} showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 120 }}>
            {/* Amount Input */}
            <View style={{
              alignItems: 'center',
              justifyContent: 'center',
              paddingTop: 24,
              paddingBottom: 32,
              paddingHorizontal: 24,
            }}>
              <Text style={{
                fontSize: 12,
                fontWeight: 'bold',
                color: '#9ca3af',
                textTransform: 'uppercase',
                letterSpacing: 2,
                marginBottom: 8,
              }}>Enter Amount</Text>
              <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'center' }}>
                <Text style={{ fontSize: 64, fontWeight: 'bold', color: '#181111', marginRight: 4, marginTop: 4 }}>₹</Text>
                <TextInput
                  style={{
                    fontSize: 96,
                    fontWeight: '800',
                    color: '#181111',
                    textAlign: 'center',
                    maxWidth: 240,
                    backgroundColor: 'transparent',
                  }}
                  placeholder="0"
                  placeholderTextColor="#d1d5db"
                  value={amount}
                  onChangeText={setAmount}
                  keyboardType="decimal-pad"
                  autoFocus
                />
              </View>
            </View>

            <View style={{ paddingHorizontal: 24, gap: 32 }}>
              {/* Description */}
              <View>
                <Text style={{
                  fontSize: 12,
                  fontWeight: 'bold',
                  color: '#6b7280',
                  textTransform: 'uppercase',
                  letterSpacing: 2,
                  marginBottom: 10,
                  marginLeft: 4,
                }}>Description</Text>
                <View style={{
                  flexDirection: 'row',
                  alignItems: 'center',
                  backgroundColor: 'white',
                  borderRadius: 16,
                  borderWidth: 1,
                  borderColor: 'transparent',
                  shadowColor: '#000',
                  shadowOffset: { width: 0, height: 4 },
                  shadowOpacity: 0.05,
                  shadowRadius: 20,
                  elevation: 2,
                }}>
                  <View style={{ paddingLeft: 16 }}>
                    <Ionicons name="create-outline" size={20} color="#9ca3af" />
                  </View>
                  <TextInput
                    style={{
                      flex: 1,
                      fontSize: 16,
                      fontWeight: '500',
                      color: '#181111',
                      paddingVertical: 16,
                      paddingLeft: 12,
                      paddingRight: 8,
                    }}
                    placeholder="e.g. Starbucks, Uber, Rent"
                    placeholderTextColor="#9ca3af"
                    value={description}
                    onChangeText={setDescription}
                  />
                  <TouchableOpacity 
                    style={{ paddingRight: 16, paddingLeft: 8 }}
                    onPress={() => setShowDatePicker(true)}
                  >
                    <Ionicons name="calendar-outline" size={22} color="#EA2831" />
                  </TouchableOpacity>
                </View>
              </View>

              {/* Category */}
              <View>
                <View style={{
                  flexDirection: 'row',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  marginBottom: 12,
                  marginLeft: 4,
                }}>
                  <Text style={{
                    fontSize: 12,
                    fontWeight: 'bold',
                    color: '#6b7280',
                    textTransform: 'uppercase',
                    letterSpacing: 2,
                  }}>Category</Text>
                  <TouchableOpacity>
                    <Text style={{ fontSize: 12, fontWeight: 'bold', color: '#EA2831' }}>Edit</Text>
                  </TouchableOpacity>
                </View>
                <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 12 }}>
                  {categories.map((category) => (
                    <TouchableOpacity
                      key={category.name}
                      style={{
                        flexDirection: 'row',
                        alignItems: 'center',
                        gap: 6,
                        backgroundColor: selectedCategory === category.name ? '#EA2831' : 'white',
                        paddingHorizontal: 16,
                        paddingVertical: 8,
                        borderRadius: 25,
                        borderWidth: selectedCategory === category.name ? 0 : 1,
                        borderColor: '#e5e7eb',
                        shadowColor: selectedCategory === category.name ? '#EA2831' : '#000',
                        shadowOffset: { width: 0, height: selectedCategory === category.name ? 0 : 0 },
                        shadowOpacity: selectedCategory === category.name ? 0.3 : 0,
                        shadowRadius: selectedCategory === category.name ? 15 : 0,
                        elevation: selectedCategory === category.name ? 4 : 0,
                      }}
                      onPress={() => setSelectedCategory(category.name)}
                    >
                      <Ionicons 
                        name={category.icon as any} 
                        size={18} 
                        color={selectedCategory === category.name ? 'white' : '#6b7280'} 
                      />
                      <Text style={{
                        fontSize: 14,
                        fontWeight: selectedCategory === category.name ? 'bold' : '500',
                        color: selectedCategory === category.name ? 'white' : '#6b7280',
                      }}>
                        {category.name}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>

              {/* Payment Method */}
              <View>
                <Text style={{
                  fontSize: 12,
                  fontWeight: 'bold',
                  color: '#6b7280',
                  textTransform: 'uppercase',
                  letterSpacing: 2,
                  marginBottom: 12,
                  marginLeft: 4,
                }}>Payment Method</Text>
                <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 12 }}>
                  {paymentMethods.map((method) => (
                    <TouchableOpacity
                      key={method.name}
                      style={{
                        flexDirection: 'row',
                        alignItems: 'center',
                        gap: 6,
                        backgroundColor: selectedPayment === method.name ? '#EA2831' : 'white',
                        paddingHorizontal: 16,
                        paddingVertical: 8,
                        borderRadius: 25,
                        borderWidth: selectedPayment === method.name ? 0 : 1,
                        borderColor: '#e5e7eb',
                        shadowColor: selectedPayment === method.name ? '#EA2831' : '#000',
                        shadowOffset: { width: 0, height: selectedPayment === method.name ? 0 : 0 },
                        shadowOpacity: selectedPayment === method.name ? 0.3 : 0,
                        shadowRadius: selectedPayment === method.name ? 15 : 0,
                        elevation: selectedPayment === method.name ? 4 : 0,
                      }}
                      onPress={() => setSelectedPayment(method.name)}
                    >
                      <Ionicons 
                        name={method.icon as any} 
                        size={18} 
                        color={selectedPayment === method.name ? 'white' : '#6b7280'} 
                      />
                      <Text style={{
                        fontSize: 14,
                        fontWeight: selectedPayment === method.name ? 'bold' : '500',
                        color: selectedPayment === method.name ? 'white' : '#6b7280',
                      }}>
                        {method.name}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>

              {/* Notes */}
              <View style={{ paddingBottom: 24 }}>
                <Text style={{
                  fontSize: 12,
                  fontWeight: 'bold',
                  color: '#6b7280',
                  textTransform: 'uppercase',
                  letterSpacing: 2,
                  marginBottom: 10,
                  marginLeft: 4,
                }}>Notes</Text>
                <TextInput
                  style={{
                    backgroundColor: 'white',
                    borderRadius: 16,
                    padding: 16,
                    fontSize: 16,
                    color: '#181111',
                    height: 96,
                    textAlignVertical: 'top',
                    shadowColor: '#000',
                    shadowOffset: { width: 0, height: 4 },
                    shadowOpacity: 0.05,
                    shadowRadius: 20,
                    elevation: 2,
                  }}
                  placeholder="Add additional details..."
                  placeholderTextColor="#9ca3af"
                  value={notes}
                  onChangeText={setNotes}
                  multiline
                />
              </View>
            </View>
          </ScrollView>

          {/* Save Button */}
          <View style={{
            position: 'absolute',
            bottom: 0,
            left: 0,
            right: 0,
            backgroundColor: 'rgba(248, 246, 246, 0.95)',
            paddingHorizontal: 24,
            paddingTop: 40,
            paddingBottom: 32,
          }}>
            <TouchableOpacity
              style={{
                backgroundColor: '#EA2831',
                height: 56,
                borderRadius: 16,
                flexDirection: 'row',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 8,
                shadowColor: '#EA2831',
                shadowOffset: { width: 0, height: 4 },
                shadowOpacity: 0.3,
                shadowRadius: 15,
                elevation: 8,
              }}
              onPress={onClose}
            >
              <Text style={{ fontSize: 18, fontWeight: 'bold', color: 'white' }}>Save Transaction</Text>
              <Ionicons name="checkmark-circle" size={24} color="white" />
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