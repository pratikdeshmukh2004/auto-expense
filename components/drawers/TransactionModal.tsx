import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import React, { useEffect, useRef, useState } from 'react';
import { Animated, KeyboardAvoidingView, Modal, PanResponder, Platform, ScrollView, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { Category, CategoryService } from '../../services/CategoryService';
import { PaymentMethod, PaymentMethodService } from '../../services/PaymentMethodService';
import { Transaction, TransactionService } from '../../services/TransactionService';
import CategoryModal from './CategoryModal';
import DateTimePickerModal from './DateTimePickerModal';
import PaymentMethodModal from './PaymentMethodModal';

interface TransactionModalProps {
  visible: boolean;
  onClose: () => void;
  transaction?: Transaction;
  onTransactionUpdated?: () => void;
  onTransactionAdded?: () => void;
}

export default function TransactionModal({ visible, onClose, transaction, onTransactionUpdated, onTransactionAdded }: TransactionModalProps) {
  const [amount, setAmount] = useState('');
  const [description, setDescription] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [selectedPayment, setSelectedPayment] = useState('');
  const [notes, setNotes] = useState('');
  const [selectedDateTime, setSelectedDateTime] = useState(new Date());
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [categories, setCategories] = useState<Category[]>([]);
  const [paymentMethods, setPaymentMethods] = useState<PaymentMethod[]>([]);
  const [showCategoryModal, setShowCategoryModal] = useState(false);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [transactionType, setTransactionType] = useState<'income' | 'expense'>('expense');
  const scrollViewRef = useRef<ScrollView>(null);

  const isEditMode = !!transaction;

  useEffect(() => {
    if (visible) {
      loadData();
      if (!isEditMode) {
        setSelectedDateTime(new Date());
      }
    }
  }, [visible]);

  const loadData = async () => {
    const cats = await CategoryService.getCategories();
    const methods = await PaymentMethodService.getPaymentMethods();
    setCategories(cats);
    setPaymentMethods(methods);
    
    if (!isEditMode) {
      // Set defaults for add mode
      if (cats.length > 0 && !selectedCategory) {
        setSelectedCategory(cats[0].name);
      }
      if (methods.length > 0 && !selectedPayment) {
        setSelectedPayment(methods[0].name);
      }
    }
  };

  useEffect(() => {
    if (transaction && visible && categories.length > 0 && paymentMethods.length > 0) {
      setAmount(transaction.amount);
      setDescription(transaction.merchant);
      setSelectedCategory(transaction.category);
      setSelectedPayment(transaction.paymentMethod || paymentMethods[0].name);
      setNotes(transaction.notes || '');
      setSelectedDateTime(new Date(transaction.timestamp));
      setTransactionType(transaction.type as 'income' | 'expense' || 'expense');
    }
  }, [transaction, visible, categories, paymentMethods]);

  const handleSave = async () => {
    if (!amount || !description) return;

    try {
      if (isEditMode && transaction) {
        await TransactionService.updateTransaction(transaction.id, {
          merchant: description,
          amount: amount,
          category: selectedCategory,
          paymentMethod: selectedPayment,
          date: selectedDateTime.toISOString(),
          type: transactionType,
          notes: notes
        });
      } else {
        await TransactionService.addTransaction({
          merchant: description,
          amount: amount,
          category: selectedCategory,
          paymentMethod: selectedPayment,
          date: selectedDateTime.toISOString(),
          type: transactionType,
          status: 'completed',
          notes: notes
        });
      }
      
      if (isEditMode) {
        onTransactionUpdated?.();
      } else {
        onTransactionAdded?.();
        // Reset form for add mode
        setAmount('');
        setDescription('');
        setSelectedCategory(categories.length > 0 ? categories[0].name : '');
        setSelectedPayment(paymentMethods.length > 0 ? paymentMethods[0].name : '');
        setNotes('');
        setSelectedDateTime(new Date());
      }
      
      onClose();
    } catch (error) {
      console.error('Error saving transaction:', error);
    }
  };

  const handleDelete = async () => {
    if (!transaction) return;

    try {
      await TransactionService.deleteTransaction(transaction.id);
      onTransactionUpdated?.();
      onClose();
      // Navigate back to transactions list after deletion
      router.back();
    } catch (error) {
      console.error('Error deleting transaction:', error);
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
          <View style={{ paddingHorizontal: 24, paddingTop: 16, paddingBottom: 8 }}>
            <View style={{
              flexDirection: 'row',
              padding: 6,
              backgroundColor: 'rgba(156, 163, 175, 0.6)',
              borderRadius: 12,
              position: 'relative',
            }}>
              <TouchableOpacity
                style={{
                  flex: 1,
                  paddingVertical: 10,
                  alignItems: 'center',
                  borderRadius: 8,
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
                  fontSize: 14,
                  fontWeight: 'bold',
                  color: transactionType === 'income' ? '#EA2831' : '#6b7280',
                }}>Income</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={{
                  flex: 1,
                  paddingVertical: 10,
                  alignItems: 'center',
                  borderRadius: 8,
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
                  fontSize: 14,
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
              paddingTop: 16,
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
                    fontSize: amount.length > 8 ? 32 : amount.length > 6 ? 48 : amount.length > 5 ? 60 : amount.length > 4 ? 70 : amount.length > 3 ? 70 : 88,
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
                <View style={{
                  flexDirection: 'row',
                  flexWrap: 'wrap',
                  gap: 8,
                }}>
                  {categories.slice(0, 7).map((category) => (
                    <TouchableOpacity
                      key={category.id}
                      style={{
                        width: '22%',
                        alignItems: 'center',
                        gap: 8,
                        marginBottom: 16,
                      }}
                      onPress={() => setSelectedCategory(category.name)}
                    >
                      <View style={{
                        width: 56,
                        height: 56,
                        borderRadius: 18,
                        alignItems: 'center',
                        justifyContent: 'center',
                        backgroundColor: selectedCategory === category.name ? '#EA2831' : 'white',
                        borderWidth: selectedCategory === category.name ? 0 : 1,
                        borderColor: '#f3f4f6',
                        shadowColor: selectedCategory === category.name ? '#EA2831' : '#000',
                        shadowOffset: { width: 0, height: 4 },
                        shadowOpacity: selectedCategory === category.name ? 0.3 : 0.05,
                        shadowRadius: selectedCategory === category.name ? 15 : 20,
                        elevation: selectedCategory === category.name ? 8 : 2,
                      }}>
                        <Ionicons 
                          name={category.icon as any} 
                          size={24} 
                          color={selectedCategory === category.name ? 'white' : '#6b7280'} 
                        />
                      </View>
                      <Text style={{
                        fontSize: 12,
                        fontWeight: selectedCategory === category.name ? 'bold' : '500',
                        color: selectedCategory === category.name ? '#EA2831' : '#6b7280',
                        textAlign: 'center',
                        lineHeight: 14,
                      }}>
                        {category.name}
                      </Text>
                    </TouchableOpacity>
                  ))}
                  <TouchableOpacity 
                    style={{
                      width: '22%',
                      alignItems: 'center',
                      gap: 8,
                      marginBottom: 16,
                    }}
                    onPress={() => setShowCategoryModal(true)}
                  >
                    <View style={{
                      width: 56,
                      height: 56,
                      borderRadius: 18,
                      alignItems: 'center',
                      justifyContent: 'center',
                      backgroundColor: 'white',
                      borderWidth: 1,
                      borderColor: '#f3f4f6',
                      shadowColor: '#000',
                      shadowOffset: { width: 0, height: 4 },
                      shadowOpacity: 0.05,
                      shadowRadius: 20,
                      elevation: 2,
                    }}>
                      <Ionicons name="add" size={24} color="#6b7280" />
                    </View>
                    <Text style={{
                      fontSize: 12,
                      fontWeight: '500',
                      color: '#6b7280',
                      textAlign: 'center',
                      lineHeight: 14,
                    }}>
                      More
                    </Text>
                  </TouchableOpacity>
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
                <ScrollView 
                  horizontal 
                  showsHorizontalScrollIndicator={false}
                  style={{ marginHorizontal: -24 }}
                  contentContainerStyle={{ paddingHorizontal: 24, paddingBottom: 8 }}
                >
                  <View style={{ flexDirection: 'row', gap: 16 }}>
                    {paymentMethods.map((method) => (
                      <TouchableOpacity
                        key={method.id}
                        style={{
                          flexDirection: 'row',
                          alignItems: 'center',
                          gap: 12,
                          backgroundColor: 'white',
                          paddingVertical: 16,
                          paddingHorizontal: 16,
                          paddingRight: 24,
                          borderRadius: 20,
                          borderWidth: selectedPayment === method.name ? 2 : 1,
                          borderColor: selectedPayment === method.name ? '#EA2831' : 'transparent',
                          shadowColor: '#000',
                          shadowOffset: { width: 0, height: 4 },
                          shadowOpacity: 0.05,
                          shadowRadius: 20,
                          elevation: 2,
                          minWidth: 140,
                        }}
                        onPress={() => setSelectedPayment(method.name)}
                      >
                        <View style={{
                          width: 40,
                          height: 40,
                          borderRadius: 20,
                          backgroundColor: selectedPayment === method.name ? 'rgba(234, 40, 49, 0.1)' : '#f3f4f6',
                          alignItems: 'center',
                          justifyContent: 'center',
                        }}>
                          <Ionicons 
                            name={method.icon as any} 
                            size={20} 
                            color={selectedPayment === method.name ? '#EA2831' : '#6b7280'} 
                          />
                        </View>
                        <View style={{ flex: 1 }}>
                          <Text style={{
                            fontSize: 14,
                            fontWeight: 'bold',
                            color: selectedPayment === method.name ? '#EA2831' : '#181111',
                            lineHeight: 16,
                            marginBottom: 4,
                          }}>
                            {method.name}
                          </Text>
                          <Text style={{
                            fontSize: 10,
                            fontWeight: '600',
                            color: selectedPayment === method.name ? 'rgba(234, 40, 49, 0.6)' : '#9ca3af',
                            textTransform: 'uppercase',
                            letterSpacing: 1,
                          }}>
                            **** {method.id.toString().padStart(4, '0')}
                          </Text>
                        </View>
                        {selectedPayment === method.name && (
                          <View style={{
                            width: 20,
                            height: 20,
                            borderRadius: 10,
                            backgroundColor: '#EA2831',
                            alignItems: 'center',
                            justifyContent: 'center',
                            marginLeft: 8,
                          }}>
                            <Ionicons name="checkmark" size={14} color="white" />
                          </View>
                        )}
                      </TouchableOpacity>
                    ))}
                    <TouchableOpacity
                      style={{
                        flexDirection: 'row',
                        alignItems: 'center',
                        gap: 12,
                        backgroundColor: 'white',
                        paddingVertical: 16,
                        paddingHorizontal: 16,
                        paddingRight: 24,
                        borderRadius: 20,
                        borderWidth: 1,
                        borderColor: 'transparent',
                        shadowColor: '#000',
                        shadowOffset: { width: 0, height: 4 },
                        shadowOpacity: 0.05,
                        shadowRadius: 20,
                        elevation: 2,
                        minWidth: 140,
                      }}
                      onPress={() => setShowPaymentModal(true)}
                    >
                      <View style={{
                        width: 40,
                        height: 40,
                        borderRadius: 20,
                        backgroundColor: '#f3f4f6',
                        alignItems: 'center',
                        justifyContent: 'center',
                      }}>
                        <Ionicons name="add" size={20} color="#6b7280" />
                      </View>
                      <View style={{ flex: 1 }}>
                        <Text style={{
                          fontSize: 14,
                          fontWeight: 'bold',
                          color: '#181111',
                          lineHeight: 16,
                          marginBottom: 4,
                        }}>
                          Add New
                        </Text>
                        <Text style={{
                          fontSize: 10,
                          fontWeight: '600',
                          color: '#9ca3af',
                          textTransform: 'uppercase',
                          letterSpacing: 1,
                        }}>
                          Method
                        </Text>
                      </View>
                    </TouchableOpacity>
                  </View>
                </ScrollView>
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
                backgroundColor: amount && description ? '#EA2831' : '#94a3b8',
                height: 56,
                borderRadius: 16,
                flexDirection: 'row',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 8,
                shadowColor: amount && description ? '#EA2831' : '#94a3b8',
                shadowOffset: { width: 0, height: 4 },
                shadowOpacity: 0.3,
                shadowRadius: 15,
                elevation: 8,
                marginBottom: isEditMode ? 12 : 0,
              }}
              onPress={handleSave}
              disabled={!amount || !description}
            >
              <Text style={{ fontSize: 18, fontWeight: 'bold', color: 'white' }}>
                {isEditMode ? 'Save Changes' : 'Save Transaction'}
              </Text>
              <Ionicons name="checkmark-circle" size={24} color="white" />
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
              >
                <Ionicons name="trash-outline" size={20} color="#ef4444" />
                <Text style={{ fontSize: 16, fontWeight: '600', color: '#ef4444' }}>Delete Transaction</Text>
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
          loadData();
          setShowCategoryModal(false);
        }}
        isAddMode={true}
      />
      
      <PaymentMethodModal
        visible={showPaymentModal}
        onClose={() => setShowPaymentModal(false)}
        onSave={() => {
          loadData();
          setShowPaymentModal(false);
        }}
        isAddMode={true}
      />
    </Modal>
  );
}