import React, { useState, useRef, useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Modal, ScrollView, TextInput, PanResponder, Animated } from 'react-native';
import { BlurView } from 'expo-blur';
import { Ionicons } from '@expo/vector-icons';
import { useCategories, usePaymentMethods, useTransactions } from '@/hooks/useQueries';
import Shimmer from '../animations/Shimmer';

interface TransactionFiltersModalProps {
  visible: boolean;
  onClose: () => void;
  onApplyFilters: (filters: any) => void;
  currentFilters?: {
    period: string;
    categories: string[];
    payments: string[];
    merchants: string[];
  };
}

export default function TransactionFiltersModal({ visible, onClose, onApplyFilters, currentFilters }: TransactionFiltersModalProps) {
  const [selectedPeriod, setSelectedPeriod] = useState('Today');
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [selectedPayments, setSelectedPayments] = useState<string[]>([]);
  const [selectedMerchants, setSelectedMerchants] = useState<string[]>([]);
  const [customDate, setCustomDate] = useState('');
  const [topMerchants, setTopMerchants] = useState<string[]>([]);

  // TanStack Query hooks
  const { data: categories = [], isLoading: categoriesLoading } = useCategories();
  const { data: paymentMethods = [], isLoading: paymentMethodsLoading } = usePaymentMethods();
  const { data: transactions = [], isLoading: transactionsLoading } = useTransactions();
  
  const loading = categoriesLoading || paymentMethodsLoading || transactionsLoading;

  const pan = useRef(new Animated.ValueXY()).current;
  
  useEffect(() => {
    pan.setValue({ x: 0, y: 0 });
    if (visible) {
      // Sync with current filters from parent
      if (currentFilters) {
        setSelectedPeriod(currentFilters.period);
        setSelectedCategories(currentFilters.categories);
        setSelectedPayments(currentFilters.payments);
        setSelectedMerchants(currentFilters.merchants);
      }
    }
  }, [visible, currentFilters]);

  // Calculate top merchants when transactions data changes
  useEffect(() => {
    if (transactions.length > 0) {
      const merchantCounts = transactions.reduce((acc: any, transaction: any) => {
        if (transaction.merchant) {
          acc[transaction.merchant] = (acc[transaction.merchant] || 0) + 1;
        }
        return acc;
      }, {});
      
      const sortedMerchants = Object.entries(merchantCounts)
        .sort(([,a], [,b]) => (b as number) - (a as number))
        .slice(0, 5)
        .map(([merchant]) => merchant);
      
      setTopMerchants(sortedMerchants);
    }
  }, [transactions]);
  
  const panResponder = PanResponder.create({
    onStartShouldSetPanResponder: () => false,
    onMoveShouldSetPanResponder: () => false,
  });

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

  const periods = ['Today', 'Yesterday', 'This Week', 'Last 7 Days', 'This Month', 'Last Month', 'This Year', 'All Time', 'Custom Range'];

  const toggleCategory = (category: string) => {
    setSelectedCategories(prev => 
      prev.includes(category) 
        ? prev.filter(c => c !== category)
        : [...prev, category]
    );
  };

  const togglePayment = (payment: string) => {
    setSelectedPayments(prev => 
      prev.includes(payment) 
        ? prev.filter(p => p !== payment)
        : [...prev, payment]
    );
  };

  const toggleMerchant = (merchant: string) => {
    setSelectedMerchants(prev => 
      prev.includes(merchant) 
        ? prev.filter(m => m !== merchant)
        : [...prev, merchant]
    );
  };

  const resetFilters = () => {
    setSelectedPeriod('Today');
    setSelectedCategories([]);
    setSelectedPayments([]);
    setSelectedMerchants([]);
    setCustomDate('');
  };

  const applyFilters = () => {
    const activeFilters = selectedCategories.length + selectedPayments.length + selectedMerchants.length + (selectedPeriod !== 'Today' ? 1 : 0);
    onApplyFilters({
      period: selectedPeriod,
      categories: selectedCategories,
      payments: selectedPayments,
      merchants: selectedMerchants,
      customDate,
      count: activeFilters
    });
    onClose();
  };

  const activeFiltersCount = selectedCategories.length + selectedPayments.length + selectedMerchants.length + (selectedPeriod !== 'Today' ? 1 : 0);

  return (
    <Modal visible={visible} transparent animationType="slide">
      <View style={styles.overlay}>
        <Animated.View 
          style={[
            styles.container,
            { transform: [{ translateY: pan.y }] }
          ]}
        >
          {/* Drag Handle */}
          <View 
            style={styles.dragHandle}
            {...handlePanResponder.panHandlers}
          >
            <View style={styles.handle} />
          </View>

          {/* Header */}
          <View style={styles.header}>
            <Text style={styles.title}>Filters</Text>
            <TouchableOpacity onPress={onClose} style={styles.closeButton}>
              <Ionicons name="close" size={24} color="#6b7280" />
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
            {/* Time Period */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Time Period</Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.chipsContainer}>
                {periods.map((period) => (
                  <TouchableOpacity
                    key={period}
                    style={[
                      styles.chip,
                      selectedPeriod === period && styles.activeChip
                    ]}
                    onPress={() => setSelectedPeriod(period)}
                  >
                    {period === 'Custom Range' && (
                      <Ionicons name="calendar" size={18} color={selectedPeriod === period ? '#EA2831' : '#374151'} />
                    )}
                    {selectedPeriod === period && period !== 'Custom Range' && (
                      <Ionicons name="checkmark" size={18} color="#EA2831" />
                    )}
                    <Text style={[
                      styles.chipText,
                      selectedPeriod === period && styles.activeChipText
                    ]}>
                      {period}
                    </Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>
            </View>

            <View style={styles.divider} />

            {/* Categories */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Categories</Text>
              {loading ? (
                <View style={styles.chipsWrap}>
                  <Shimmer width={80} height={34} borderRadius={16} />
                  <Shimmer width={100} height={34} borderRadius={16} />
                  <Shimmer width={90} height={34} borderRadius={16} />
                  <Shimmer width={70} height={34} borderRadius={16} />
                </View>
              ) : (
                <View style={styles.chipsWrap}>
                {categories.map((category) => (
                  <TouchableOpacity
                    key={category.id}
                    style={[
                      styles.categoryChip,
                      selectedCategories.includes(category.name) && styles.activeCategoryChip
                    ]}
                    onPress={() => toggleCategory(category.name)}
                  >
                    <Ionicons 
                      name={category.icon as any} 
                      size={18} 
                      color={selectedCategories.includes(category.name) ? category.color : '#9ca3af'} 
                    />
                    <Text style={[
                      styles.categoryChipText,
                      selectedCategories.includes(category.name) && styles.activeCategoryChipText
                    ]}>
                      {category.name}
                    </Text>
                  </TouchableOpacity>
                ))}
                <TouchableOpacity
                  style={[styles.categoryChip, { borderStyle: 'dashed' }]}
                  onPress={() => {/* Add category logic */}}
                >
                  <Ionicons name="add" size={18} color="#9ca3af" />
                  <Text style={styles.categoryChipText}>Add New</Text>
                </TouchableOpacity>
              </View>
              )}
            </View>

            <View style={styles.divider} />

            {/* Payment Methods */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Payment Methods</Text>
              {loading ? (
                <View style={styles.chipsWrap}>
                  <Shimmer width={70} height={34} borderRadius={16} />
                  <Shimmer width={85} height={34} borderRadius={16} />
                  <Shimmer width={95} height={34} borderRadius={16} />
                </View>
              ) : (
                <View style={styles.chipsWrap}>
                {paymentMethods.map((payment) => (
                  <TouchableOpacity
                    key={payment.id}
                    style={[
                      styles.categoryChip,
                      selectedPayments.includes(payment.name) && styles.activeCategoryChip
                    ]}
                    onPress={() => togglePayment(payment.name)}
                  >
                    <Ionicons 
                      name={payment.icon as any} 
                      size={18} 
                      color={selectedPayments.includes(payment.name) ? payment.color : '#9ca3af'} 
                    />
                    <Text style={[
                      styles.categoryChipText,
                      selectedPayments.includes(payment.name) && styles.activeCategoryChipText
                    ]}>
                      {payment.name}
                    </Text>
                  </TouchableOpacity>
                ))}
                <TouchableOpacity
                  style={[styles.categoryChip, { borderStyle: 'dashed' }]}
                  onPress={() => {/* Add payment method logic */}}
                >
                  <Ionicons name="add" size={18} color="#9ca3af" />
                  <Text style={styles.categoryChipText}>Add New</Text>
                </TouchableOpacity>
              </View>
              )}
            </View>

            <View style={styles.divider} />

            {/* Top Merchants */}
            {topMerchants.length > 0 && (
              <View style={styles.section}>
                <Text style={styles.sectionTitle}>Top Merchants</Text>
                <View style={styles.chipsWrap}>
                  {topMerchants.map((merchant) => (
                    <TouchableOpacity
                      key={merchant}
                      style={[
                        styles.categoryChip,
                        selectedMerchants.includes(merchant) && styles.activeCategoryChip
                      ]}
                      onPress={() => toggleMerchant(merchant)}
                    >
                      <Ionicons 
                        name="storefront" 
                        size={18} 
                        color={selectedMerchants.includes(merchant) ? '#EA2831' : '#9ca3af'} 
                      />
                      <Text style={[
                        styles.categoryChipText,
                        selectedMerchants.includes(merchant) && styles.activeCategoryChipText
                      ]}>
                        {merchant}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>
            )}
          </ScrollView>

          {/* Footer */}
          <View style={styles.footer}>
            <TouchableOpacity onPress={resetFilters} style={styles.resetButton}>
              <Text style={styles.resetText}>Reset</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={applyFilters} style={styles.applyButton}>
              <Text style={styles.applyText}>Apply Filters</Text>
              {activeFiltersCount > 0 && (
                <View style={styles.badge}>
                  <Text style={styles.badgeText}>{activeFiltersCount}</Text>
                </View>
              )}
            </TouchableOpacity>
          </View>
        </Animated.View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  container: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    height: '90%',
  },
  dragHandle: {
    alignItems: 'center',
    paddingVertical: 12,
  },
  handle: {
    width: 40,
    height: 4,
    backgroundColor: '#d1d5db',
    borderRadius: 2,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f3f4f6',
  },
  title: {
    fontSize: 20,
    fontWeight: '600',
    color: '#111827',
  },
  closeButton: {
    padding: 4,
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
  },
  section: {
    paddingVertical: 20,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 12,
  },
  chipsContainer: {
    marginBottom: 16,
  },
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 8,
    backgroundColor: '#fff',
    borderRadius: 20,
    marginRight: 8,
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  activeChip: {
    backgroundColor: '#fef2f2',
    borderColor: '#EA2831',
  },
  chipText: {
    fontSize: 14,
    color: '#111827',
    marginLeft: 4,
    fontWeight: '500',
  },
  activeChipText: {
    color: '#EA2831',
    fontWeight: '500',
  },
  customDateContainer: {
    position: 'relative',
  },
  customDateInput: {
    borderWidth: 1,
    borderColor: '#d1d5db',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 14,
    color: '#374151',
    paddingRight: 40,
  },
  calendarIcon: {
    position: 'absolute',
    right: 12,
    top: 12,
  },
  divider: {
    height: 1,
    backgroundColor: '#f3f4f6',
  },
  chipsWrap: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  categoryChip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
    backgroundColor: '#f9fafb',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#e5e7eb',
    marginBottom: 8,
  },
  activeCategoryChip: {
    backgroundColor: '#fef2f2',
    borderColor: '#EA2831',
  },
  categoryChipText: {
    fontSize: 13,
    color: '#111827',
    marginLeft: 6,
    fontWeight: '500',
  },
  activeCategoryChipText: {
    color: '#EA2831',
    fontWeight: '500',
  },
  footer: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderTopWidth: 1,
    borderTopColor: '#f3f4f6',
    gap: 12,
  },
  resetButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#d1d5db',
    alignItems: 'center',
  },
  resetText: {
    fontSize: 16,
    color: '#6b7280',
    fontWeight: '500',
  },
  applyButton: {
    flex: 2,
    flexDirection: 'row',
    paddingVertical: 12,
    borderRadius: 8,
    backgroundColor: '#EA2831',
    alignItems: 'center',
    justifyContent: 'center',
  },
  applyText: {
    fontSize: 16,
    color: '#fff',
    fontWeight: '600',
  },
  badge: {
    backgroundColor: '#fff',
    borderRadius: 10,
    paddingHorizontal: 6,
    paddingVertical: 2,
    marginLeft: 8,
  },
  badgeText: {
    fontSize: 12,
    color: '#EA2831',
    fontWeight: '600',
  },
});