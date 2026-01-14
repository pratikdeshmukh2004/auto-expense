import { Ionicons } from '@expo/vector-icons';
import React, { useEffect, useRef, useState } from 'react';
import { Animated, Dimensions, Modal, PanResponder, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Transaction, TransactionService } from '../../services/TransactionService';
import TransactionModal from './TransactionModal';

const { width: screenWidth } = Dimensions.get('window');

interface TransactionApprovalModalProps {
  visible: boolean;
  onClose: () => void;
}

export default function TransactionApprovalModal({ visible, onClose }: TransactionApprovalModalProps) {
  const [currentTransaction, setCurrentTransaction] = useState(0);
  const [merchantName, setMerchantName] = useState('');
  const [note, setNote] = useState('');
  const [pendingTransactions, setPendingTransactions] = useState<Transaction[]>([]);
  const [showTransactionModal, setShowTransactionModal] = useState(false);
  
  const pan = useRef(new Animated.ValueXY()).current;
  const opacity = useRef(new Animated.Value(1)).current;

  const currentTx = pendingTransactions[currentTransaction];

  // Load pending transactions when modal opens
  useEffect(() => {
    if (visible) {
      loadPendingTransactions();
    }
  }, [visible]);

  const loadPendingTransactions = async () => {
    const transactions = await TransactionService.getTransactions();
    const pending = transactions.filter(t => t.status === 'pending');
    setPendingTransactions(pending);
    setCurrentTransaction(0);
    if (pending.length > 0) {
      setMerchantName(pending[0].merchant);
      setNote(pending[0].notes || '');
    }
    resetCard();
  };

  const handleApprove = async () => {
    if (currentTx) {
      await TransactionService.updateTransaction(currentTx.id, {
        merchant: merchantName,
        notes: note,
        status: 'completed'
      });
    }
    animateCardExit('right', () => {
      if (currentTransaction < pendingTransactions.length - 1) {
        setCurrentTransaction(currentTransaction + 1);
        setMerchantName(pendingTransactions[currentTransaction + 1].merchant);
        setNote(pendingTransactions[currentTransaction + 1].notes || '');
        resetCard();
      } else {
        onClose();
      }
    });
  };

  const handleReject = async () => {
    if (currentTx) {
      await TransactionService.updateTransaction(currentTx.id, {
        status: 'rejected'
      });
    }
    animateCardExit('left', () => {
      if (currentTransaction < pendingTransactions.length - 1) {
        setCurrentTransaction(currentTransaction + 1);
        setMerchantName(pendingTransactions[currentTransaction + 1].merchant);
        setNote(pendingTransactions[currentTransaction + 1].notes || '');
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
    

  if (!currentTx) {
    return (
      <Modal visible={visible} animationType="fade" presentationStyle="overFullScreen" transparent statusBarTranslucent>
        <View style={{ flex: 1, backgroundColor: 'rgba(0, 0, 0, 0.6)', alignItems: 'center', justifyContent: 'center' }}>
          <View style={{ backgroundColor: 'white', borderRadius: 16, padding: 32, alignItems: 'center' }}>
            <Ionicons name="checkmark-circle" size={64} color="#10b981" />
            <Text style={{ fontSize: 18, fontWeight: 'bold', color: '#1f2937', marginTop: 16 }}>All Caught Up!</Text>
            <Text style={{ fontSize: 14, color: '#6b7280', marginTop: 8, textAlign: 'center' }}>No pending transactions to review</Text>
            <TouchableOpacity
              style={{ marginTop: 24, backgroundColor: '#EA2831', paddingHorizontal: 24, paddingVertical: 12, borderRadius: 12 }}
              onPress={onClose}
            >
              <Text style={{ color: 'white', fontWeight: 'bold' }}>Close</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    );
  }

  return (
    <Modal visible={visible} animationType="fade" presentationStyle="overFullScreen" transparent statusBarTranslucent>
      <View style={{ flex: 1, backgroundColor: 'rgba(0, 0, 0, 0.6)' }}>
        <SafeAreaView style={{ flex: 1 }} edges={['top']}>
          <View style={{
            flex: 1,
            alignItems: 'center',
            justifyContent: 'center',
            paddingHorizontal: 16,
            paddingTop: 60,
            paddingBottom: 20,
          }}>
            <View style={{
              position: 'absolute',
              top: 20,
              left: 16,
              right: 16,
              flexDirection: 'row',
              alignItems: 'center',
              justifyContent: 'space-between',
              paddingHorizontal: 10,
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
            
            <TouchableOpacity
              onPress={() => setShowTransactionModal(true)}
              style={{
                width: 40,
                height: 40,
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <Ionicons name="create-outline" size={24} color="white" />
            </TouchableOpacity>
          </View>

          {(pendingTransactions.length - currentTransaction) > 1 && (
            <>
              {/* Back Card */}
              <View style={{
                position: 'absolute',
                width: '100%',
                maxWidth: 500,
                backgroundColor: 'white',
                borderRadius: 32,
                height: 555,
                top: 100,
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
                width: '100%',
                maxWidth: 500,
                backgroundColor: 'white',
                borderRadius: 32,
                height: 550,
                top: 100,
                opacity: 0.6,
                shadowColor: '#000',
                shadowOffset: { width: 0, height: 4 },
                shadowOpacity: 0.15,
                shadowRadius: 8,
                elevation: 4,
              }} />
            </>
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
                paddingVertical: 24,
                paddingTop: 32,
              }}>
                <Text style={{ fontSize: 48, fontWeight: '800', color: '#0d121b' }}>
                  <Text style={{ fontSize: 24, color: '#9ca3af' }}>₹</Text>
                  {parseFloat(currentTx.amount).toFixed(2)}
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
              <View style={{ padding: 24, gap: 24, paddingBottom: 32 }}>
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
                  <View style={{
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
                        <Ionicons name="pricetag" size={18} color="#ea580c" />
                      </View>
                      <Text style={{ fontSize: 14, fontWeight: '500', color: '#374151' }}>{currentTx.category}</Text>
                    </View>
                  </View>
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
                  <View style={{
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
                      <Text style={{ fontSize: 14, fontWeight: '500', color: '#374151' }}>{currentTx.paymentMethod || 'Unknown'}</Text>
                    </View>
                  </View>
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
              marginTop: 20,
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
                <Text style={{ fontSize: 16, fontWeight: 'bold', color: '#dc2626' }}>Wrong</Text>
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
                <Text style={{ fontSize: 16, fontWeight: 'bold', color: 'white' }}>Correct</Text>
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
      
      {currentTx && (
        <TransactionModal
          visible={showTransactionModal}
          onClose={() => setShowTransactionModal(false)}
          transaction={currentTx}
          onTransactionUpdated={async () => {
            await TransactionService.updateTransaction(currentTx.id, {
              status: 'completed'
            });
            await loadPendingTransactions();
            setShowTransactionModal(false);
          }}
        />
      )}
    </Modal>
  );
}