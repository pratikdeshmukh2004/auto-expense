import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import React, { useEffect, useRef, useState } from 'react';
import { ActivityIndicator, Animated, KeyboardAvoidingView, Modal, PanResponder, Platform, ScrollView, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { PaymentMethod, PaymentMethodService } from '@/services/PaymentMethodService';
import { Transaction, TransactionService } from '@/services/TransactionService';
import Shimmer from '../animations/Shimmer';
import { useAddTransaction, useUpdateTransaction, useCategories, usePaymentMethods, useTransactions } from '@/hooks/useQueries';
import CategoryModal from './CategoryModal';
import DateTimePickerModal from './DateTimePickerModal';
import PaymentMethodModal from './PaymentMethodModal';

interface TransactionModalProps {
  visible: boolean;
  onClose: () => void;
  transaction?: Transaction;
  prefillData?: {
    merchant: string;
    amount: string;
    category: string;
    paymentMethod: string;
    date: string;
    sender?: string;
  };
  onTransactionUpdated?: () => void;
  onTransactionAdded?: () => void;
}

export default function TransactionModal({ visible, onClose, transaction, prefillData, onTransactionUpdated, onTransactionAdded }: TransactionModalProps) {
  const [amount, setAmount] = useState('');
  const [merchant, setMerchant] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [selectedPayment, setSelectedPayment] = useState('');
  const [notes, setNotes] = useState('');
  const [selectedDateTime, setSelectedDateTime] = useState(new Date());
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showCategoryModal, setShowCategoryModal] = useState(false);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [transactionType, setTransactionType] = useState<'income' | 'expense'>('expense');
  const [isSaving, setIsSaving] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const scrollViewRef = useRef<ScrollView>(null);

  // TanStack Query hooks
  const { data: categories = [], isLoading: categoriesLoading } = useCategories();
  const { data: paymentMethods = [], isLoading: paymentMethodsLoading } = usePaymentMethods();
  const { data: transactions = [] } = useTransactions();
  const addTransactionMutation = useAddTransaction();
  const updateTransactionMutation = useUpdateTransaction();

  const isEditMode = !!transaction;
  const loading = categoriesLoading || paymentMethodsLoading;

  // Sort categories and payment methods by usage
  const sortedCategories = React.useMemo(() => {
    const completedTransactions = transactions.filter(t => t.status === 'completed');
    const categoryCount = completedTransactions.reduce((acc, t) => {
      acc[t.category] = (acc[t.category] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);
    return [...categories].sort((a, b) => (categoryCount[b.name] || 0) - (categoryCount[a.name] || 0));
  }, [categories, transactions]);

  const sortedPaymentMethods = React.useMemo(() => {
    const completedTransactions = transactions.filter(t => t.status === 'completed');
    const paymentCount = completedTransactions.reduce((acc, t) => {
      if (t.paymentMethod) acc[t.paymentMethod] = (acc[t.paymentMethod] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);
    return [...paymentMethods].sort((a, b) => (paymentCount[b.name] || 0) - (paymentCount[a.name] || 0));
  }, [paymentMethods, transactions]);

  useEffect(() => {
    if (visible) {
      if (!isEditMode) {
        if (prefillData) {
          setAmount(prefillData.amount);
          setMerchant(prefillData.merchant);
          setSelectedCategory(prefillData.category);
          setSelectedPayment(prefillData.paymentMethod);
          setSelectedDateTime(new Date(prefillData.date));
        } else {
          setSelectedDateTime(new Date());
        }
      }
    }
  }, [visible]);

  // Set defaults when categories and payment methods are loaded
  useEffect(() => {
    if (!isEditMode && categories.length > 0 && !selectedCategory) {
      setSelectedCategory(categories[0].name);
    }
    if (!isEditMode && paymentMethods.length > 0 && !selectedPayment) {
      setSelectedPayment(paymentMethods[0].name);
    }
  }, [categories, paymentMethods, isEditMode, selectedCategory, selectedPayment]);

  useEffect(() => {
    if (transaction && visible && categories.length > 0 && paymentMethods.length > 0) {
      setAmount(transaction.amount);
      setMerchant(transaction.merchant);
      setSelectedCategory(transaction.category);
      setSelectedPayment(transaction.paymentMethod || paymentMethods[0].name);
      setNotes(transaction.notes || '');
      setSelectedDateTime(new Date(transaction.timestamp));
      setTransactionType(transaction.type as 'income' | 'expense' || 'expense');
    }
  }, [transaction, visible, categories, paymentMethods]);

  const handleSave = async () => {
    if (!amount || !merchant || isSaving) return;

    setIsSaving(true);
    
    if (isEditMode && transaction) {
      updateTransactionMutation.mutate({
        id: transaction.id,
        updates: {
          merchant: merchant,
          amount: amount,
          category: selectedCategory,
          paymentMethod: selectedPayment,
          date: selectedDateTime.toISOString(),
          type: transactionType,
          notes: notes
        }
      }, {
        onSuccess: () => {
          onTransactionUpdated?.();
          onClose();
          setIsSaving(false);
        },
        onError: () => {
          setIsSaving(false);
        }
      });
    } else {
      addTransactionMutation.mutate({
        merchant: merchant,
        amount: amount,
        category: selectedCategory,
        paymentMethod: selectedPayment,
        date: selectedDateTime.toISOString(),
        type: transactionType,
        status: prefillData ? 'pending' : 'completed',
        notes: notes || (prefillData ? 'Email Automated' : ''),
        sender: prefillData?.sender
      }, {
        onSuccess: () => {
          onTransactionAdded?.();
          // Reset form for add mode
          setAmount('');
          setMerchant('');
          setSelectedCategory(categories.length > 0 ? categories[0].name : '');
          setSelectedPayment(paymentMethods.length > 0 ? paymentMethods[0].name : '');
          setNotes('');
          setSelectedDateTime(new Date());
          onClose();
          setIsSaving(false);
        },
        onError: () => {
          setIsSaving(false);
        }
      });
    }
  };

  const handleDelete = async () => {
    if (!transaction || isDeleting) return;

    setIsDeleting(true);
    
    try {
      await TransactionService.deleteTransaction(transaction.id);
      
      // Navigate to transactions page after deletion
      router.replace('/transactions');
    } catch (error) {
    } finally {
      setIsDeleting(false);
    }
  };

  const pan = useRef(new Animated.ValueXY()).current;
  
  useEffect(() => {
    pan.setValue({ x: 0, y: 0 });
  }, [visible]);

  const handlePanResponder = PanResponder.create({
    onStartShouldSetPanResponder: (evt) => {
      return evt.nativeEvent.locationY < 40;
    },
    onMoveShouldSetPanResponder: (evt, gestureState) => {
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

  return (
    <Modal visible={visible} animationType="slide" transparent>
      <KeyboardAvoidingView 
        style={{ flex: 1 }}
        behavior="padding"
        enabled={false}
      >
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
            paddingBottom: 120,
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
            <Text style={{ fontSize: 18, fontWeight: 'bold', color: '#181111' }}>
              {isEditMode ? 'Edit Transaction' : 'Add Transaction'}
            </Text>
            <View style={{ width: 48 }} />
          </View>

          {/* Income/Expense Toggle */}
          <View style={{ paddingHorizontal: 24, paddingTop: 12, paddingBottom: 6 }}>
            <View style={{
              flexDirection: 'row',
              padding: 4,
              backgroundColor: 'rgba(156, 163, 175, 0.6)',
              borderRadius: 10,
              position: 'relative',
            }}>
              <TouchableOpacity
                style={{
                  flex: 1,
                  paddingVertical: 8,
                  alignItems: 'center',
                  borderRadius: 7,
                  backgroundColor: transactionType === 'income' ? 'white' : 'transparent',
                  shadowColor: transactionType === 'income' ? '#000' : 'transparent',
                  shadowOffset: { width: 0, height: 1 },
                  shadowOpacity: transactionType === 'income' ? 0.1 : 0,
                  shadowRadius: 2,
                  elevation: transactionType === 'income' ? 2 : 0,
                }}
                onPress={() => setTransactionType('income')}
              >
                <Text style={{
                  fontSize: 13,
                  fontWeight: 'bold',
                  color: transactionType === 'income' ? '#EA2831' : '#6b7280',
                }}>Income</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={{
                  flex: 1,
                  paddingVertical: 8,
                  alignItems: 'center',
                  borderRadius: 7,
                  backgroundColor: transactionType === 'expense' ? 'white' : 'transparent',
                  shadowColor: transactionType === 'expense' ? '#000' : 'transparent',
                  shadowOffset: { width: 0, height: 1 },
                  shadowOpacity: transactionType === 'expense' ? 0.1 : 0,
                  shadowRadius: 2,
                  elevation: transactionType === 'expense' ? 2 : 0,
                }}
                onPress={() => setTransactionType('expense')}
              >
                <Text style={{
                  fontSize: 13,
                  fontWeight: 'bold',
                  color: transactionType === 'expense' ? '#EA2831' : '#6b7280',
                }}>Expense</Text>
              </TouchableOpacity>
            </View>
          </View>

          <ScrollView 
            ref={scrollViewRef}
            style={{ flex: 1 }} 
            showsVerticalScrollIndicator={false} 
            contentContainerStyle={{ paddingBottom: 200 }} 
            keyboardShouldPersistTaps="handled"
          >
            {/* Amount Input */}
            <View style={{
              alignItems: 'center',
              justifyContent: 'center',
              paddingTop: 12,
              paddingBottom: 20,
              paddingHorizontal: 24,
            }}>
              <Text style={{
                fontSize: 12,
                fontWeight: 'bold',
                color: '#9ca3af',
                textTransform: 'uppercase',
                letterSpacing: 2,
                marginBottom: 6,
              }}>Enter Amount</Text>
              <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'center' }}>
                <Text style={{ fontSize: 40, fontWeight: 'bold', color: '#181111', marginRight: 4, marginTop: 4 }}>₹</Text>
                <TextInput
                  style={{
                    fontSize: amount.length > 8 ? 28 : amount.length > 6 ? 36 : amount.length > 5 ? 44 : amount.length > 4 ? 52 : amount.length > 3 ? 56 : 60,
                    fontWeight: '800',
                    color: '#181111',
                    textAlign: 'center',
                    maxWidth: 240,
                    backgroundColor: 'transparent',
                  }}
                  placeholder="0"
                  placeholderTextColor="#d1d5db"
                  value={amount}
                  onChangeText={(text) => {
                    // Only allow numbers and decimal point
                    const numericText = text.replace(/[^0-9.]/g, '');
                    // Prevent multiple decimal points
                    const parts = numericText.split('.');
                    if (parts.length > 2) {
                      setAmount(parts[0] + '.' + parts.slice(1).join(''));
                    } else {
                      setAmount(numericText);
                    }
                  }}
                  keyboardType="decimal-pad"
                  autoFocus={!isEditMode}
                />
              </View>
            </View>

            <View style={{ paddingHorizontal: 24, gap: 20 }}>
              {/* Merchant */}
              <View>
                <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
                  <Text style={{
                    fontSize: 12,
                    fontWeight: 'bold',
                    color: '#6b7280',
                    textTransform: 'uppercase',
                    letterSpacing: 2,
                    marginLeft: 4,
                  }}>Merchant</Text>
                  <Text style={{ fontSize: 12, fontWeight: '600', color: '#6b7280' }}>
                    {selectedDateTime.toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}
                    {' • '}
                    {selectedDateTime.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}
                  </Text>
                </View>
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
                    value={merchant}
                    onChangeText={setMerchant}
                    maxLength={30}
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
                <Text style={{
                  fontSize: 12,
                  fontWeight: 'bold',
                  color: '#6b7280',
                  textTransform: 'uppercase',
                  letterSpacing: 2,
                  marginBottom: 12,
                  marginLeft: 4,
                }}>Category</Text>
                {loading ? (
                  <View style={{ flexDirection: 'row', gap: 12, paddingHorizontal: 24 }}>
                    <Shimmer width={100} height={38} borderRadius={20} />
                    <Shimmer width={120} height={38} borderRadius={20} />
                    <Shimmer width={80} height={38} borderRadius={20} />
                  </View>
                ) : (
                  <ScrollView 
                  horizontal 
                  showsHorizontalScrollIndicator={false}
                  style={{ marginHorizontal: -24 }}
                  contentContainerStyle={{ paddingHorizontal: 24, paddingBottom: 8 }}
                >
                  <View style={{ flexDirection: 'row', gap: 12 }}>
                    {sortedCategories.map((category) => (
                      <TouchableOpacity
                        key={category.id}
                        style={{
                          flexDirection: 'row',
                          alignItems: 'center',
                          gap: 8,
                          paddingVertical: 10,
                          paddingHorizontal: 14,
                          borderRadius: 20,
                          backgroundColor: selectedCategory === category.name ? category.color : 'white',
                          borderWidth: 1,
                          borderColor: selectedCategory === category.name ? category.color : '#e5e7eb',
                        }}
                        onPress={() => setSelectedCategory(category.name)}
                      >
                        <Ionicons 
                          name={category.icon as any} 
                          size={18} 
                          color={selectedCategory === category.name ? 'white' : category.color} 
                        />
                        <Text style={{
                          fontSize: 14,
                          fontWeight: '600',
                          color: selectedCategory === category.name ? 'white' : '#374151',
                        }}>
                          {category.name}
                        </Text>
                      </TouchableOpacity>
                    ))}
                    <TouchableOpacity
                      style={{
                        flexDirection: 'row',
                        alignItems: 'center',
                        gap: 8,
                        paddingVertical: 10,
                        paddingHorizontal: 14,
                        borderRadius: 20,
                        backgroundColor: 'white',
                        borderWidth: 1,
                        borderColor: '#e5e7eb',
                      }}
                      onPress={() => setShowCategoryModal(true)}
                    >
                      <Ionicons name="add" size={18} color="#6b7280" />
                      <Text style={{
                        fontSize: 14,
                        fontWeight: '600',
                        color: '#6b7280',
                      }}>
                        Add
                      </Text>
                    </TouchableOpacity>
                  </View>
                </ScrollView>
                )}
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
                {loading ? (
                  <View style={{ flexDirection: 'row', gap: 12, paddingHorizontal: 24 }}>
                    <Shimmer width={90} height={38} borderRadius={20} />
                    <Shimmer width={110} height={38} borderRadius={20} />
                    <Shimmer width={70} height={38} borderRadius={20} />
                  </View>
                ) : (
                  <ScrollView 
                  horizontal 
                  showsHorizontalScrollIndicator={false}
                  style={{ marginHorizontal: -24 }}
                  contentContainerStyle={{ paddingHorizontal: 24, paddingBottom: 8 }}
                >
                  <View style={{ flexDirection: 'row', gap: 12 }}>
                    {sortedPaymentMethods.map((method) => (
                      <TouchableOpacity
                        key={method.id}
                        style={{
                          flexDirection: 'row',
                          alignItems: 'center',
                          gap: 8,
                          paddingVertical: 10,
                          paddingHorizontal: 14,
                          borderRadius: 20,
                          backgroundColor: selectedPayment === method.name ? method.color : 'white',
                          borderWidth: 1,
                          borderColor: selectedPayment === method.name ? method.color : '#e5e7eb',
                        }}
                        onPress={() => setSelectedPayment(method.name)}
                      >
                        <Ionicons 
                          name={method.icon as any} 
                          size={18} 
                          color={selectedPayment === method.name ? 'white' : method.color} 
                        />
                        <Text style={{
                          fontSize: 14,
                          fontWeight: '600',
                          color: selectedPayment === method.name ? 'white' : '#374151',
                        }}>
                          {method.name}
                        </Text>
                      </TouchableOpacity>
                    ))}
                    <TouchableOpacity
                      style={{
                        flexDirection: 'row',
                        alignItems: 'center',
                        gap: 8,
                        paddingVertical: 10,
                        paddingHorizontal: 14,
                        borderRadius: 20,
                        backgroundColor: 'white',
                        borderWidth: 1,
                        borderColor: '#e5e7eb',
                      }}
                      onPress={() => setShowPaymentModal(true)}
                    >
                      <Ionicons name="add" size={18} color="#6b7280" />
                      <Text style={{
                        fontSize: 14,
                        fontWeight: '600',
                        color: '#6b7280',
                      }}>
                        Add
                      </Text>
                    </TouchableOpacity>
                  </View>
                </ScrollView>
                )}
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
                    height: 72,
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
                  onFocus={() => {
                    setTimeout(() => {
                      scrollViewRef.current?.scrollToEnd({ animated: true });
                    }, 100);
                  }}
                  onSubmitEditing={() => {
                    // This allows keyboard to be dismissed
                  }}
                  returnKeyType="done"
                  blurOnSubmit={true}
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
                backgroundColor: (amount && merchant && !isSaving) ? '#EA2831' : '#94a3b8',
                height: 56,
                borderRadius: 16,
                flexDirection: 'row',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 8,
                shadowColor: (amount && merchant && !isSaving) ? '#EA2831' : '#94a3b8',
                shadowOffset: { width: 0, height: 4 },
                shadowOpacity: 0.3,
                shadowRadius: 15,
                elevation: 8,
                marginBottom: isEditMode ? 12 : 0,
              }}
              onPress={handleSave}
              disabled={!amount || !merchant || isSaving}
            >
              {isSaving ? (
                <>
                  <ActivityIndicator size="small" color="white" />
                  <Text style={{ fontSize: 18, fontWeight: 'bold', color: 'white' }}>Saving...</Text>
                </>
              ) : (
                <>
                  <Text style={{ fontSize: 18, fontWeight: 'bold', color: 'white' }}>
                    {isEditMode ? 'Save Changes' : 'Save Transaction'}
                  </Text>
                  <Ionicons name="checkmark-circle" size={24} color="white" />
                </>
              )}
            </TouchableOpacity>
            
            {isEditMode && (
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
                onPress={handleDelete}
                disabled={isDeleting}
              >
                {isDeleting ? (
                  <>
                    <ActivityIndicator size="small" color="#ef4444" />
                    <Text style={{ fontSize: 16, fontWeight: '600', color: '#ef4444' }}>Deleting...</Text>
                  </>
                ) : (
                  <>
                    <Ionicons name="trash-outline" size={20} color="#ef4444" />
                    <Text style={{ fontSize: 16, fontWeight: '600', color: '#ef4444' }}>Delete Transaction</Text>
                  </>
                )}
              </TouchableOpacity>
            )}
          </View>
        </Animated.View>
      </View>
      </KeyboardAvoidingView>
      
      <DateTimePickerModal
        visible={showDatePicker}
        onClose={() => setShowDatePicker(false)}
        onSelectDateTime={(date) => {
          setSelectedDateTime(date);
          setShowDatePicker(false);
        }}
        initialDate={selectedDateTime}
      />
      
      <CategoryModal
        visible={showCategoryModal}
        onClose={() => setShowCategoryModal(false)}
        onSave={() => {
          setShowCategoryModal(false);
        }}
        isAddMode={true}
      />
      
      <PaymentMethodModal
        visible={showPaymentModal}
        onClose={() => setShowPaymentModal(false)}
        onSave={() => {
          setShowPaymentModal(false);
        }}
        isAddMode={true}
      />
    </Modal>
  );
}