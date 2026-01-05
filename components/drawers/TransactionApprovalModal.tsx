import { Ionicons } from '@expo/vector-icons';
import React, { useEffect, useRef, useState } from 'react';
import { Animated, Dimensions, Modal, PanResponder, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

const { width: screenWidth } = Dimensions.get('window');

interface TransactionApprovalModalProps {
  visible: boolean;
  onClose: () => void;
}

export default function TransactionApprovalModal({ visible, onClose }: TransactionApprovalModalProps) {
  const [currentTransaction, setCurrentTransaction] = useState(0);
  const [merchantName, setMerchantName] = useState('Starbucks');
  const [note, setNote] = useState('');
  const [transactionDate, setTransactionDate] = useState('Today');
  const [transactionTime, setTransactionTime] = useState('8:45 AM');
  
  const pan = useRef(new Animated.ValueXY()).current;
  const opacity = useRef(new Animated.Value(1)).current;

  const pendingTransactions = [
    { merchant: 'Starbucks', amount: 14.50, category: 'Food & Drink', time: 'Today, 8:45 AM', icon: 'cafe' },
    { merchant: 'Uber', amount: 24.12, category: 'Transport', time: 'Today, 2:30 PM', icon: 'car' },
    { merchant: 'Shell Station', amount: 45.20, category: 'Fuel', time: 'Yesterday, 5:15 PM', icon: 'car-sport' },
    { merchant: 'Target', amount: 67.89, category: 'Shopping', time: 'Yesterday, 11:20 AM', icon: 'bag' },
    { merchant: 'Netflix', amount: 15.99, category: 'Entertainment', time: '2 days ago', icon: 'play-circle' },
  ];

  const currentTx = pendingTransactions[currentTransaction];

  // Reset state when modal opens
  useEffect(() => {
    if (visible) {
      setCurrentTransaction(0);
      setMerchantName('Starbucks');
      setNote('');
      resetCard();
    }
  }, [visible]);

  const handleApprove = () => {
    animateCardExit('right', () => {
      if (currentTransaction < pendingTransactions.length - 1) {
        setCurrentTransaction(currentTransaction + 1);
        setMerchantName(pendingTransactions[currentTransaction + 1].merchant);
        setNote('');
        resetCard();
      } else {
        onClose();
      }
    });
  };

  const handleReject = () => {
    animateCardExit('left', () => {
      if (currentTransaction < pendingTransactions.length - 1) {
        setCurrentTransaction(currentTransaction + 1);
        setMerchantName(pendingTransactions[currentTransaction + 1].merchant);
        setNote('');
        resetCard();
      } else {
        onClose();
      }
    });
  };

  const animateCardExit = (direction: 'left' | 'right', callback: () => void) => {
    const toValue = direction === 'right' ? screenWidth : -screenWidth;
    Animated.parallel([
      Animated.timing(pan.x, {
        toValue,
        duration: 300,
        useNativeDriver: false,
      }),
      Animated.timing(opacity, {
        toValue: 0,
        duration: 300,
        useNativeDriver: false,
      }),
    ]).start(callback);
  };

  const resetCard = () => {
    pan.setValue({ x: 0, y: 0 });
    opacity.setValue(1);
  };

  const panResponder = PanResponder.create({
    onStartShouldSetPanResponder: () => true,
    onMoveShouldSetPanResponder: (_, gestureState) => {
      return Math.abs(gestureState.dx) > 20 && Math.abs(gestureState.dy) < 50;
    },
    onPanResponderGrant: () => {
      pan.setOffset({
        x: pan.x._value,
        y: pan.y._value,
      });
    },
    onPanResponderMove: (_, gestureState) => {
      pan.setValue({ x: gestureState.dx, y: 0 });
      const progress = Math.abs(gestureState.dx) / (screenWidth * 0.4);
      opacity.setValue(1 - Math.min(progress, 0.5));
    },
    onPanResponderRelease: (_, gestureState) => {
      pan.flattenOffset();
      const threshold = screenWidth * 0.25;
      
      if (gestureState.dx > threshold) {
        // Swipe right - approve
        handleApprove();
      } else if (gestureState.dx < -threshold) {
        // Swipe left - reject
        handleReject();
      } else {
        // Snap back
        Animated.parallel([
          Animated.spring(pan.x, {
            toValue: 0,
            useNativeDriver: false,
          }),
          Animated.spring(opacity, {
            toValue: 1,
            useNativeDriver: false,
          }),
        ]).start();
      }
    },
  });
    

  return (
    <Modal visible={visible} animationType="fade" presentationStyle="overFullScreen" transparent statusBarTranslucent>
      <View style={{ flex: 1, backgroundColor: 'rgba(0, 0, 0, 0.6)' }}>
        <SafeAreaView style={{ flex: 1 }}>
          {/* Header with Back Button and Counter */}
          <View style={{
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'space-between',
            paddingHorizontal: 10,
            marginTop: 0,
            paddingBottom: 8,
            zIndex: 10,
          }}>
            <TouchableOpacity
              onPress={onClose}
              style={{
                width: 40,
                height: 40,
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <Ionicons name="chevron-back" size={24} color="white" />
            </TouchableOpacity>
            
            <Text style={{
              fontSize: 16,
              fontWeight: 'bold',
              color: 'white',
            }}>
              {pendingTransactions.length - currentTransaction} Left
            </Text>
            
            <View style={{ width: 40 }} />
          </View>
          {/* Transaction Card */}
          <View style={{
            flex: 1,
            alignItems: 'center',
            justifyContent: 'center',
            paddingHorizontal: 16,
            paddingVertical: 30,
            marginTop: 0,
          }}>
            {/* Stacked Cards Effect - Only show if more than 1 transaction remaining */}
            {(pendingTransactions.length - currentTransaction) > 1 && (
              <View style={{
                position: 'absolute',
                width: '100%',
                maxWidth: 500,
                height: 650,
                alignItems: 'center',
                justifyContent: 'center',
              }}>
                {/* Back Card */}
                <View style={{
                  position: 'absolute',
                  width: '97%',
                  height: 570,
                  backgroundColor: 'white',
                  borderRadius: 32,
                  top: 15,
                  opacity: 0.3,
                  shadowColor: '#000',
                  shadowOffset: { width: 0, height: 2 },
                  shadowOpacity: 0.1,
                  shadowRadius: 4,
                  elevation: 2,
                }} />
                {/* Middle Card */}
                <View style={{
                  position: 'absolute',
                  width: '97%',
                  height: 570,
                  backgroundColor: 'white',
                  borderRadius: 32,
                  top: 10,
                  opacity: 0.6,
                  shadowColor: '#000',
                  shadowOffset: { width: 0, height: 4 },
                  shadowOpacity: 0.15,
                  shadowRadius: 8,
                  elevation: 4,
                }} />
              </View>
            )}

            {/* Main Transaction Card */}
            <Animated.View 
              style={[
                {
                  width: '100%',
                  maxWidth: 500,
                  backgroundColor: 'white',
                  borderRadius: 32,
                  shadowColor: '#000',
                  shadowOffset: { width: 0, height: 8 },
                  shadowOpacity: 0.2,
                  shadowRadius: 16,
                  elevation: 8,
                  overflow: 'hidden',
                },
                {
                  transform: [{ translateX: pan.x }],
                  opacity: opacity,
                }
              ]}
              {...panResponder.panHandlers}
            >
              {/* Amount */}
              <View style={{
                alignItems: 'center',
                paddingVertical: 32,
                paddingTop: 40,
              }}>
                <Text style={{ fontSize: 48, fontWeight: '800', color: '#0d121b' }}>
                  <Text style={{ fontSize: 24, color: '#9ca3af' }}>$</Text>
                  {currentTx.amount.toFixed(2)}
                </Text>
              </View>

              {/* Description */}
              <View style={{ paddingHorizontal: 32}}>
                <Text style={{
                  fontSize: 12,
                  fontWeight: 'bold',
                  color: '#9ca3af',
                  textTransform: 'uppercase',
                  letterSpacing: 1,
                  marginBottom: 8,
                  marginLeft: 4,
                }}>Description</Text>
                <View style={{ position: 'relative' }}>
                  <TextInput
                    style={{
                      backgroundColor: '#f8fafc',
                      borderWidth: 1,
                      borderColor: '#e2e8f0',
                      borderRadius: 12,
                      paddingHorizontal: 16,
                      paddingVertical: 16,
                      paddingRight: 50,
                      fontSize: 16,
                      fontWeight: '600',
                      color: '#0d121b',
                    }}
                    value={merchantName}
                    onChangeText={setMerchantName}
                    placeholder="Enter description"
                    placeholderTextColor="#9ca3af"
                  />
                  <TouchableOpacity
                    style={{
                      position: 'absolute',
                      right: 16,
                      top: 16,
                      padding: 4,
                    }}
                  >
                    <Ionicons name="calendar-outline" size={20} color="#9ca3af" />
                  </TouchableOpacity>
                </View>
              </View>

              {/* Form Fields */}
              <View style={{ padding: 32, gap: 32, paddingBottom: 40 }}>
                {/* Category */}
                <View>
                  <Text style={{
                    fontSize: 12,
                    fontWeight: 'bold',
                    color: '#9ca3af',
                    textTransform: 'uppercase',
                    letterSpacing: 1,
                    marginBottom: 8,
                    marginLeft: 4,
                  }}>Category</Text>
                  <TouchableOpacity style={{
                    flexDirection: 'row',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    backgroundColor: '#f8fafc',
                    borderWidth: 1,
                    borderColor: '#e2e8f0',
                    borderRadius: 12,
                    paddingHorizontal: 16,
                    paddingVertical: 12,
                  }}>
                    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
                      <View style={{
                        padding: 6,
                        backgroundColor: '#fed7aa',
                        borderRadius: 8,
                      }}>
                        <Ionicons name="restaurant" size={18} color="#ea580c" />
                      </View>
                      <Text style={{ fontSize: 14, fontWeight: '500', color: '#374151' }}>{currentTx.category}</Text>
                    </View>
                    <Ionicons name="chevron-down" size={20} color="#9ca3af" />
                  </TouchableOpacity>
                </View>

                {/* Payment Method */}
                <View>
                  <Text style={{
                    fontSize: 12,
                    fontWeight: 'bold',
                    color: '#9ca3af',
                    textTransform: 'uppercase',
                    letterSpacing: 1,
                    marginBottom: 8,
                    marginLeft: 4,
                  }}>Payment Method</Text>
                  <TouchableOpacity style={{
                    flexDirection: 'row',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    backgroundColor: '#f8fafc',
                    borderWidth: 1,
                    borderColor: '#e2e8f0',
                    borderRadius: 12,
                    paddingHorizontal: 16,
                    paddingVertical: 12,
                  }}>
                    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
                      <View style={{
                        padding: 6,
                        backgroundColor: '#dbeafe',
                        borderRadius: 8,
                      }}>
                        <Ionicons name="card" size={18} color="#2563eb" />
                      </View>
                      <Text style={{ fontSize: 14, fontWeight: '500', color: '#374151' }}>Visa ending 4242</Text>
                    </View>
                    <Ionicons name="chevron-down" size={20} color="#9ca3af" />
                  </TouchableOpacity>
                </View>

                {/* Note */}
                <View>
                  <Text style={{
                    fontSize: 12,
                    fontWeight: 'bold',
                    color: '#9ca3af',
                    textTransform: 'uppercase',
                    letterSpacing: 1,
                    marginBottom: 8,
                    marginLeft: 4,
                  }}>Notes</Text>
                  <View style={{ position: 'relative' }}>
                    <TextInput
                      style={{
                        backgroundColor: '#f8fafc',
                        borderWidth: 1,
                        borderColor: '#e2e8f0',
                        borderRadius: 12,
                        paddingHorizontal: 16,
                        paddingVertical: 16,
                        fontSize: 14,
                        color: '#374151',
                        height: 80,
                        textAlignVertical: 'top',
                      }}
                      placeholder="Add a note..."
                      placeholderTextColor="#9ca3af"
                      value={note}
                      onChangeText={setNote}
                      multiline
                    />
                    <Ionicons
                      name="create-outline"
                      size={18}
                      color="#9ca3af"
                      style={{ position: 'absolute', right: 16, top: 16 }}
                    />
                  </View>
                </View>
              </View>
            </Animated.View>

            {/* Action Buttons */}
            <View style={{
              flexDirection: 'row',
              gap: 16,
              marginTop: 25,
              width: '100%',
              maxWidth: 360,
            }}>
              <TouchableOpacity
                style={{
                  flex: 1,
                  flexDirection: 'row',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: 8,
                  paddingVertical: 16,
                  borderRadius: 12,
                  borderWidth: 1,
                  borderColor: '#fecaca',
                  backgroundColor: 'white',
                  shadowColor: '#000',
                  shadowOffset: { width: 0, height: 4 },
                  shadowOpacity: 0.1,
                  shadowRadius: 8,
                  elevation: 4,
                }}
                onPress={handleReject}
              >
                <Ionicons name="close" size={20} color="#dc2626" />
                <Text style={{ fontSize: 16, fontWeight: 'bold', color: '#dc2626' }}>Reject</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={{
                  flex: 1,
                  flexDirection: 'row',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: 8,
                  paddingVertical: 16,
                  borderRadius: 12,
                  backgroundColor: '#EA2831',
                  shadowColor: '#EA2831',
                  shadowOffset: { width: 0, height: 4 },
                  shadowOpacity: 0.3,
                  shadowRadius: 8,
                  elevation: 4,
                }}
                onPress={handleApprove}
              >
                <Ionicons name="checkmark" size={20} color="white" />
                <Text style={{ fontSize: 16, fontWeight: 'bold', color: 'white' }}>Accept</Text>
              </TouchableOpacity>
            </View>

            <Text style={{
              fontSize: 12,
              fontWeight: '500',
              color: 'rgba(255, 255, 255, 0.6)',
              textAlign: 'center',
              marginTop: 10,
            }}>
              Swipe right to approve
            </Text>
          </View>
        </SafeAreaView>
      </View>
    </Modal>
  );
}