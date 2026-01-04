import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Modal, ScrollView, TextInput } from 'react-native';
import { BlurView } from 'expo-blur';
import { Ionicons } from '@expo/vector-icons';

interface TransactionFiltersModalProps {
  visible: boolean;
  onClose: () => void;
  onApplyFilters: (filters: any) => void;
}

export default function TransactionFiltersModal({ visible, onClose, onApplyFilters }: TransactionFiltersModalProps) {
  const [selectedPeriod, setSelectedPeriod] = useState('Last 7 Days');
  const [selectedCategories, setSelectedCategories] = useState(['Fuel']);
  const [selectedPayments, setSelectedPayments] = useState(['Visa ••45']);
  const [customDate, setCustomDate] = useState('');

  const periods = ['Today', 'Last 7 Days', 'This Month'];
  const categories = [
    { id: 'fuel', name: 'Fuel', icon: 'car' },
    { id: 'groceries', name: 'Groceries', icon: 'basket' },
    { id: 'dining', name: 'Dining', icon: 'restaurant' },
    { id: 'services', name: 'Services', icon: 'build' },
    { id: 'online', name: 'Online', icon: 'wifi' }
  ];
  const payments = [
    { id: 'visa', name: 'Visa ••45', icon: 'card' },
    { id: 'apple', name: 'Apple Pay', icon: 'phone-portrait' },
    { id: 'cash', name: 'Cash', icon: 'cash' }
  ];

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

  const resetFilters = () => {
    setSelectedPeriod('');
    setSelectedCategories([]);
    setSelectedPayments([]);
    setCustomDate('');
  };

  const applyFilters = () => {
    const activeFilters = selectedCategories.length + selectedPayments.length + (selectedPeriod ? 1 : 0);
    onApplyFilters({
      period: selectedPeriod,
      categories: selectedCategories,
      payments: selectedPayments,
      customDate,
      count: activeFilters
    });
    onClose();
  };

  const activeFiltersCount = selectedCategories.length + selectedPayments.length + (selectedPeriod ? 1 : 0);

  return (
    <Modal visible={visible} transparent animationType="slide">
      <BlurView intensity={50} style={styles.overlay}>
        <View style={styles.container}>
          {/* Drag Handle */}
          <View style={styles.dragHandle}>
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
                    {selectedPeriod === period && (
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
              
              <View style={styles.customDateContainer}>
                <TextInput
                  style={styles.customDateInput}
                  placeholder="Custom Date Range"
                  value={customDate}
                  onChangeText={setCustomDate}
                  placeholderTextColor="#9ca3af"
                />
                <Ionicons name="calendar" size={20} color="#EA2831" style={styles.calendarIcon} />
              </View>
            </View>

            <View style={styles.divider} />

            {/* Expense Type */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Expense Type</Text>
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
                      color={selectedCategories.includes(category.name) ? '#EA2831' : '#9ca3af'} 
                    />
                    <Text style={[
                      styles.categoryChipText,
                      selectedCategories.includes(category.name) && styles.activeCategoryChipText
                    ]}>
                      {category.name}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            <View style={styles.divider} />

            {/* Payment Method */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Paid via</Text>
              <View style={styles.chipsWrap}>
                {payments.map((payment) => (
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
                      color={selectedPayments.includes(payment.name) ? '#EA2831' : '#9ca3af'} 
                    />
                    <Text style={[
                      styles.categoryChipText,
                      selectedPayments.includes(payment.name) && styles.activeCategoryChipText
                    ]}>
                      {payment.name}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>
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
        </View>
      </BlurView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    justifyContent: 'flex-end',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  container: {
    backgroundColor: '#f8f6f6',
    borderTopLeftRadius: 32,
    borderTopRightRadius: 32,
    height: '85%',
    overflow: 'hidden',
  },
  dragHandle: {
    alignItems: 'center',
    paddingTop: 12,
    paddingBottom: 4,
  },
  handle: {
    width: 48,
    height: 6,
    backgroundColor: '#d1d5db',
    borderRadius: 3,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingVertical: 16,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1f2937',
  },
  closeButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  content: {
    flex: 1,
    paddingHorizontal: 24,
  },
  section: {
    marginBottom: 32,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1b0e0e',
    marginBottom: 16,
  },
  chipsContainer: {
    marginBottom: 16,
  },
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'white',
    borderWidth: 1,
    borderColor: '#f1f5f9',
    marginRight: 12,
    gap: 8,
  },
  activeChip: {
    backgroundColor: 'rgba(234, 42, 51, 0.1)',
    borderColor: '#EA2831',
  },
  chipText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#6b7280',
  },
  activeChipText: {
    color: '#EA2831',
    fontWeight: 'bold',
  },
  customDateContainer: {
    position: 'relative',
  },
  customDateInput: {
    height: 56,
    paddingHorizontal: 20,
    paddingRight: 48,
    borderRadius: 16,
    backgroundColor: 'white',
    borderWidth: 1,
    borderColor: '#e5e7eb',
    fontSize: 16,
    fontWeight: '500',
    color: '#1f2937',
  },
  calendarIcon: {
    position: 'absolute',
    right: 16,
    top: 18,
  },
  chipsWrap: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  categoryChip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    height: 40,
    borderRadius: 12,
    backgroundColor: 'white',
    borderWidth: 1,
    borderColor: '#e5e7eb',
    gap: 8,
  },
  activeCategoryChip: {
    backgroundColor: 'rgba(234, 42, 51, 0.1)',
    borderColor: '#EA2831',
  },
  categoryChipText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#6b7280',
  },
  activeCategoryChipText: {
    color: '#EA2831',
    fontWeight: 'bold',
  },
  divider: {
    height: 1,
    backgroundColor: '#f1f5f9',
    marginBottom: 32,
  },
  footer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 24,
    paddingVertical: 24,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: '#f1f5f9',
    gap: 16,
  },
  resetButton: {
    paddingHorizontal: 8,
    paddingVertical: 12,
    minWidth: 80,
  },
  resetText: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#6b7280',
  },
  applyButton: {
    flex: 1,
    height: 56,
    backgroundColor: '#EA2831',
    borderRadius: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  applyText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: 'white',
  },
  badge: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 12,
  },
  badgeText: {
    fontSize: 12,
    color: 'white',
    fontWeight: 'bold',
  },
});