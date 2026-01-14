import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import React, { useEffect, useRef, useState } from 'react';
import { Animated, PanResponder, RefreshControl, ScrollView, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import TransactionFiltersModal from '../../components/drawers/TransactionFiltersModal';
import TransactionModal from '../../components/drawers/TransactionModal';
import { CategoryService } from '../../services/CategoryService';
import { PaymentMethodService } from '../../services/PaymentMethodService';
import { Transaction, TransactionService } from '../../services/TransactionService';
import { getRelativeTime } from '../../utils/dateUtils';



export default function TransactionsIndex() {
  const [showAddModal, setShowAddModal] = useState(false);
  const [showFiltersModal, setShowFiltersModal] = useState(false);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryIcons, setCategoryIcons] = useState<{[key: string]: string}>({});
  const [categoryColors, setCategoryColors] = useState<{[key: string]: string}>({});
  const [categories, setCategories] = useState<any[]>([]);
  const [paymentMethods, setPaymentMethods] = useState<any[]>([]);
  const [topMerchants, setTopMerchants] = useState<string[]>([]);
  const [selectedDateFilter, setSelectedDateFilter] = useState('This Month');
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [selectedPaymentMethods, setSelectedPaymentMethods] = useState<string[]>([]);
  const [selectedTypes, setSelectedTypes] = useState<string[]>([]);
  const [selectedMerchants, setSelectedMerchants] = useState<string[]>([]);
  const [refreshing, setRefreshing] = useState(false);
  
  useEffect(() => {
    loadTransactions();
  }, []);
  
  const handleDateFilterSelect = (filter: string) => {
    setSelectedDateFilter(filter);
  };

  const handleCategorySelect = (category: string) => {
    setSelectedCategories(prev => 
      prev.includes(category) 
        ? prev.filter(c => c !== category)
        : [...prev, category]
    );
  };

  const handlePaymentMethodSelect = (method: string) => {
    setSelectedPaymentMethods(prev => 
      prev.includes(method) 
        ? prev.filter(m => m !== method)
        : [...prev, method]
    );
  };

  const handleApplyFilters = (filters: any) => {
    setSelectedDateFilter(filters.period);
    setSelectedCategories(filters.categories);
    setSelectedPaymentMethods(filters.payments);
    setSelectedMerchants(filters.merchants || []);
  };

  const handleMerchantSelect = (merchant: string) => {
    setSelectedMerchants(prev => 
      prev.includes(merchant) 
        ? prev.filter(m => m !== merchant)
        : [...prev, merchant]
    );
  };

  const handleTypeSelect = (type: string) => {
    setSelectedTypes(prev => 
      prev.includes(type) 
        ? prev.filter(t => t !== type)
        : [...prev, type]
    );
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadTransactions();
    setRefreshing(false);
  };

  const getFilteredTransactions = () => {
    let filtered = transactions.filter(transaction =>
      transaction.merchant.toLowerCase().includes(searchQuery.toLowerCase()) ||
      transaction.category.toLowerCase().includes(searchQuery.toLowerCase())
    );

    // Date filtering
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const yesterday = new Date(today.getTime() - 24 * 60 * 60 * 1000);
    const thisMonth = new Date(now.getFullYear(), now.getMonth(), 1);

    if (selectedDateFilter === 'Today') {
      filtered = filtered.filter(t => {
        const transactionDate = new Date(t.timestamp);
        return transactionDate >= today;
      });
    } else if (selectedDateFilter === 'Yesterday') {
      filtered = filtered.filter(t => {
        const transactionDate = new Date(t.timestamp);
        return transactionDate >= yesterday && transactionDate < today;
      });
    } else if (selectedDateFilter === 'This Month') {
      filtered = filtered.filter(t => {
        const transactionDate = new Date(t.timestamp);
        return transactionDate >= thisMonth;
      });
    }

    // Category filtering
    if (selectedCategories.length > 0) {
      filtered = filtered.filter(t => selectedCategories.includes(t.category));
    }

    // Payment method filtering
    if (selectedPaymentMethods.length > 0) {
      filtered = filtered.filter(t => selectedPaymentMethods.includes(t.paymentMethod || ''));
    }

    // Merchant filtering
    if (selectedMerchants.length > 0) {
      filtered = filtered.filter(t => selectedMerchants.includes(t.merchant));
    }

    // Type filtering
    if (selectedTypes.length > 0) {
      filtered = filtered.filter(t => selectedTypes.includes(t.type));
    }

    return filtered;
  };

  const getGroupedTransactions = () => {
    const filtered = getFilteredTransactions();
    const grouped = filtered.reduce((acc, transaction) => {
      const date = new Date(transaction.timestamp);
      const dateKey = date.toDateString();
      if (!acc[dateKey]) {
        acc[dateKey] = [];
      }
      acc[dateKey].push(transaction);
      return acc;
    }, {} as {[key: string]: Transaction[]});

    return Object.entries(grouped)
      .sort(([a], [b]) => new Date(b).getTime() - new Date(a).getTime())
      .map(([dateKey, transactions]) => ({
        date: dateKey,
        transactions: transactions.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
      }));
  };

  const getDateLabel = (dateString: string) => {
    const date = new Date(dateString);
    const today = new Date();
    const yesterday = new Date(today.getTime() - 24 * 60 * 60 * 1000);
    
    if (date.toDateString() === today.toDateString()) {
      return 'Today';
    } else if (date.toDateString() === yesterday.toDateString()) {
      return 'Yesterday';
    } else {
      const diffInDays = Math.floor((today.getTime() - date.getTime()) / (1000 * 60 * 60 * 24));
      if (diffInDays < 7) {
        return `${diffInDays} days ago`;
      } else {
        return date.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' });
      }
    }
  };
  
  const loadTransactions = async () => {
    try {
      const allTransactions = await TransactionService.getTransactions();
      const categoriesData = await CategoryService.getCategories();
      
      // Create category icon and color mapping
      const iconMap = categoriesData.reduce((acc, cat) => {
        acc[cat.name] = cat.icon;
        return acc;
      }, {} as {[key: string]: string});
      
      const colorMap = categoriesData.reduce((acc, cat) => {
        acc[cat.name] = cat.color;
        return acc;
      }, {} as {[key: string]: string});
      
      // Get top 3 categories by transaction count
      const categoryCount = allTransactions.reduce((acc, t) => {
        acc[t.category] = (acc[t.category] || 0) + 1;
        return acc;
      }, {} as {[key: string]: number});
      
      const topCategories = Object.entries(categoryCount)
        .sort(([,a], [,b]) => b - a)
        .slice(0, 3)
        .map(([name]) => categoriesData.find(c => c.name === name))
        .filter(Boolean);
      
      // Get payment methods data
      const paymentMethodsData = await PaymentMethodService.getPaymentMethods();
      
      setTransactions(allTransactions);
      setCategoryIcons(iconMap);
      setCategoryColors(colorMap);
      setCategories(topCategories);
      setPaymentMethods(paymentMethodsData.slice(0, 3));
    } catch (error) {
      console.error('Error loading transactions:', error);
    }
  };
  
  const handleDeleteTransaction = async (id: string) => {
    try {
      await TransactionService.deleteTransaction(id);
      await loadTransactions();
    } catch (error) {
      console.error('Error deleting transaction:', error);
    }
  };
  
  const handleDuplicateTransaction = async (transaction: Transaction) => {
    try {
      await TransactionService.addTransaction({
        merchant: transaction.merchant,
        amount: transaction.amount,
        category: transaction.category,
        paymentMethod: transaction.paymentMethod,
        date: new Date().toISOString().split('T')[0],
        type: transaction.type,
        status: 'completed'
      });
      await loadTransactions();
    } catch (error) {
      console.error('Error duplicating transaction:', error);
    }
  };
  
  const filteredTransactions = getFilteredTransactions();
  const groupedTransactions = getGroupedTransactions();
  
  const SwipeableTransactionCard = ({ transaction, onEdit, onDuplicate, onDelete }: { transaction: Transaction, onEdit: () => void, onDuplicate: () => void, onDelete: () => void }) => {
    const translateX = useRef(new Animated.Value(0)).current;
    
    const panResponder = PanResponder.create({
      onMoveShouldSetPanResponder: (_, gestureState) => {
        return Math.abs(gestureState.dx) > 20;
      },
      onPanResponderMove: (_, gestureState) => {
        if (gestureState.dx < 0) {
          translateX.setValue(Math.max(gestureState.dx, -120));
        }
      },
      onPanResponderRelease: (_, gestureState) => {
        if (gestureState.dx < -60) {
          Animated.spring(translateX, {
            toValue: -120,
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
        {/* Action Buttons */}
        <View style={{
          position: 'absolute',
          right: 0,
          top: 0,
          bottom: 0,
          flexDirection: 'row',
          alignItems: 'center',
          paddingRight: 16,
        }}>
          <TouchableOpacity 
            style={{
              backgroundColor: '#10b981',
              width: 50,
              height: 50,
              borderRadius: 25,
              alignItems: 'center',
              justifyContent: 'center',
              marginRight: 8,
            }}
            onPress={onDuplicate}
          >
            <Ionicons name="copy" size={20} color="white" />
          </TouchableOpacity>
          <TouchableOpacity 
            style={{
              backgroundColor: '#3b82f6',
              width: 50,
              height: 50,
              borderRadius: 25,
              alignItems: 'center',
              justifyContent: 'center',
              marginRight: 8,
            }}
            onPress={onEdit}
          >
            <Ionicons name="create" size={20} color="white" />
          </TouchableOpacity>
          <TouchableOpacity 
            style={{
              backgroundColor: '#ef4444',
              width: 50,
              height: 50,
              borderRadius: 25,
              alignItems: 'center',
              justifyContent: 'center',
            }}
            onPress={onDelete}
          >
            <Ionicons name="trash" size={20} color="white" />
          </TouchableOpacity>
        </View>
        
        {/* Transaction Card */}
        <Animated.View
          style={{
            transform: [{ translateX }],
            backgroundColor: 'white',
            borderRadius: 16,
            padding: 14,
            shadowColor: '#000',
            shadowOffset: { width: 0, height: 1 },
            shadowOpacity: 0.05,
            shadowRadius: 2,
            elevation: 1,
          }}
          {...panResponder.panHandlers}
        >
          <TouchableOpacity
            onPress={() => router.push(`/transactions/details?id=${transaction.id}`)}
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              justifyContent: 'space-between',
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
                <Ionicons name={categoryIcons[transaction.category] || 'storefront'} size={24} color={categoryColors[transaction.category] || '#ea2a33'} />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={{ fontSize: 16, fontWeight: 'bold', color: '#111827' }} numberOfLines={1} ellipsizeMode="tail">{transaction.merchant}</Text>
                <Text style={{ fontSize: 12, fontWeight: '500', color: '#6b7280', marginTop: 4 }}>{transaction.category} • {getRelativeTime(transaction.timestamp)}</Text>
              </View>
            </View>
            <View style={{ alignItems: 'flex-end', gap: 4 }}>
              <Text style={{ fontSize: 16, fontWeight: 'bold', color: transaction.type === 'income' ? '#10b981' : '#ea2a33' }}>{transaction.type === 'income' ? '+' : '-'}₹{transaction.amount}</Text>
              <Ionicons name="chevron-forward" size={16} color="#d1d5db" />
            </View>
          </TouchableOpacity>
        </Animated.View>
      </View>
    );
  };
  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#f8f6f6' }}>
      {/* Header */}
      <View style={{ paddingHorizontal: 20, paddingTop: 16, paddingBottom: 8 }}>
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
          <Text style={{ fontSize: 24, fontWeight: 'bold', color: '#111827' }}>Transactions</Text>
          <TouchableOpacity 
            style={{
              width: 40,
              height: 40,
              borderRadius: 20,
              alignItems: 'center',
              justifyContent: 'center',
              position: 'relative',
            }}
            onPress={() => setShowFiltersModal(true)}
          >
            <Ionicons name="options" size={24} color="#111827" />
            <View style={{
              position: 'absolute',
              top: 8,
              right: 8,
              width: 10,
              height: 10,
              backgroundColor: '#ea2a33',
              borderRadius: 5,
              borderWidth: 2,
              borderColor: '#f8f6f6',
            }} />
          </TouchableOpacity>
        </View>

        {/* Search Bar */}
        <View style={{
          flexDirection: 'row',
          alignItems: 'center',
          backgroundColor: 'white',
          borderRadius: 12,
          paddingHorizontal: 16,
          height: 48,
          marginBottom: 12,
          shadowColor: '#000',
          shadowOffset: { width: 0, height: 1 },
          shadowOpacity: 0.05,
          shadowRadius: 2,
          elevation: 1,
        }}>
          <Ionicons name="search" size={24} color="#ea2a33" style={{ marginRight: 12 }} />
          <TextInput
            placeholder="Search merchant or category..."
            placeholderTextColor="#9ca3af"
            style={{ flex: 1, fontSize: 16, fontWeight: '500', color: '#111827' }}
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
        </View>

        {/* Filter Chips */}
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginBottom: 16 }}>
          <View style={{ flexDirection: 'row', gap: 12, paddingVertical: 8 }}>
            {/* Type filters */}
            {[
              { name: 'Income', icon: 'arrow-down' },
              { name: 'Expense', icon: 'arrow-up' }
            ].map((filter) => (
              <TouchableOpacity 
                key={filter.name}
                style={{
                  flexDirection: 'row',
                  alignItems: 'center',
                  gap: 6,
                  paddingHorizontal: 16,
                  height: 36,
                  borderRadius: 18,
                  backgroundColor: selectedTypes.includes(filter.name.toLowerCase()) ? '#ea2a33' : 'white',
                  shadowColor: selectedTypes.includes(filter.name.toLowerCase()) ? '#ea2a33' : '#000',
                  shadowOffset: { width: 0, height: selectedTypes.includes(filter.name.toLowerCase()) ? 4 : 1 },
                  shadowOpacity: selectedTypes.includes(filter.name.toLowerCase()) ? 0.25 : 0.05,
                  shadowRadius: selectedTypes.includes(filter.name.toLowerCase()) ? 8 : 2,
                  elevation: selectedTypes.includes(filter.name.toLowerCase()) ? 4 : 1,
                }}
                onPress={() => handleTypeSelect(filter.name.toLowerCase())}
              >
                <Ionicons name={filter.icon as any} size={16} color={selectedTypes.includes(filter.name.toLowerCase()) ? 'white' : '#6b7280'} />
                <Text style={{ fontSize: 14, fontWeight: '600', color: selectedTypes.includes(filter.name.toLowerCase()) ? 'white' : '#6b7280' }}>{filter.name}</Text>
              </TouchableOpacity>
            ))}
            
            {/* Time filters */}
            {[
              { name: 'Today', icon: 'today' },
              { name: 'Yesterday', icon: 'calendar' },
              { name: 'This Week', icon: 'calendar-outline' },
              { name: 'This Month', icon: 'calendar' },
              { name: 'Last Month', icon: 'calendar-outline' },
              { name: 'This Year', icon: 'calendar' }
            ].map((filter) => (
              <TouchableOpacity 
                key={filter.name}
                style={{
                  flexDirection: 'row',
                  alignItems: 'center',
                  gap: 6,
                  paddingHorizontal: 16,
                  height: 36,
                  borderRadius: 18,
                  backgroundColor: selectedDateFilter === filter.name ? '#ea2a33' : 'white',
                  shadowColor: selectedDateFilter === filter.name ? '#ea2a33' : '#000',
                  shadowOffset: { width: 0, height: selectedDateFilter === filter.name ? 4 : 1 },
                  shadowOpacity: selectedDateFilter === filter.name ? 0.25 : 0.05,
                  shadowRadius: selectedDateFilter === filter.name ? 8 : 2,
                  elevation: selectedDateFilter === filter.name ? 4 : 1,
                }}
                onPress={() => handleDateFilterSelect(filter.name)}
              >
                <Ionicons name={filter.icon as any} size={16} color={selectedDateFilter === filter.name ? 'white' : '#6b7280'} />
                <Text style={{ fontSize: 14, fontWeight: '600', color: selectedDateFilter === filter.name ? 'white' : '#6b7280' }}>{filter.name}</Text>
              </TouchableOpacity>
            ))}
            
            {/* All categories */}
            {categories.map((category) => (
              <TouchableOpacity 
                key={category.name}
                style={{
                  flexDirection: 'row',
                  alignItems: 'center',
                  gap: 6,
                  paddingHorizontal: 16,
                  height: 36,
                  borderRadius: 18,
                  backgroundColor: selectedCategories.includes(category.name) ? '#ea2a33' : 'white',
                  shadowColor: selectedCategories.includes(category.name) ? '#ea2a33' : '#000',
                  shadowOffset: { width: 0, height: selectedCategories.includes(category.name) ? 4 : 1 },
                  shadowOpacity: selectedCategories.includes(category.name) ? 0.25 : 0.05,
                  shadowRadius: selectedCategories.includes(category.name) ? 8 : 2,
                  elevation: selectedCategories.includes(category.name) ? 4 : 1,
                }}
                onPress={() => handleCategorySelect(category.name)}
              >
                <Ionicons name={category.icon as any} size={16} color={selectedCategories.includes(category.name) ? 'white' : '#6b7280'} />
                <Text style={{ fontSize: 14, fontWeight: '600', color: selectedCategories.includes(category.name) ? 'white' : '#6b7280' }}>{category.name}</Text>
              </TouchableOpacity>
            ))}
            
            {/* All payment methods */}
            {paymentMethods.map((method) => (
              <TouchableOpacity 
                key={method.name}
                style={{
                  flexDirection: 'row',
                  alignItems: 'center',
                  gap: 6,
                  paddingHorizontal: 16,
                  height: 36,
                  borderRadius: 18,
                  backgroundColor: selectedPaymentMethods.includes(method.name) ? '#ea2a33' : 'white',
                  shadowColor: selectedPaymentMethods.includes(method.name) ? '#ea2a33' : '#000',
                  shadowOffset: { width: 0, height: selectedPaymentMethods.includes(method.name) ? 4 : 1 },
                  shadowOpacity: selectedPaymentMethods.includes(method.name) ? 0.25 : 0.05,
                  shadowRadius: selectedPaymentMethods.includes(method.name) ? 8 : 2,
                  elevation: selectedPaymentMethods.includes(method.name) ? 4 : 1,
                }}
                onPress={() => handlePaymentMethodSelect(method.name)}
              >
                <Ionicons name={method.icon as any} size={16} color={selectedPaymentMethods.includes(method.name) ? 'white' : '#6b7280'} />
                <Text style={{ fontSize: 14, fontWeight: '600', color: selectedPaymentMethods.includes(method.name) ? 'white' : '#6b7280' }}>{method.name}</Text>
              </TouchableOpacity>
            ))}
            
            {/* Top merchants */}
            {topMerchants.map((merchant) => (
              <TouchableOpacity 
                key={merchant}
                style={{
                  flexDirection: 'row',
                  alignItems: 'center',
                  gap: 6,
                  paddingHorizontal: 16,
                  height: 36,
                  borderRadius: 18,
                  backgroundColor: selectedMerchants.includes(merchant) ? '#ea2a33' : 'white',
                  shadowColor: selectedMerchants.includes(merchant) ? '#ea2a33' : '#000',
                  shadowOffset: { width: 0, height: selectedMerchants.includes(merchant) ? 4 : 1 },
                  shadowOpacity: selectedMerchants.includes(merchant) ? 0.25 : 0.05,
                  shadowRadius: selectedMerchants.includes(merchant) ? 8 : 2,
                  elevation: selectedMerchants.includes(merchant) ? 4 : 1,
                }}
                onPress={() => handleMerchantSelect(merchant)}
              >
                <Ionicons name="storefront" size={16} color={selectedMerchants.includes(merchant) ? 'white' : '#6b7280'} />
                <Text style={{ fontSize: 14, fontWeight: '600', color: selectedMerchants.includes(merchant) ? 'white' : '#6b7280' }}>{merchant}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </ScrollView>
      </View>

      {/* Transactions List */}
      <ScrollView 
        style={{ flex: 1 }} 
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        {groupedTransactions.length > 0 ? (
          <View style={{ paddingHorizontal: 20, paddingTop: 12, marginBottom: 20 }}>
            {groupedTransactions.map((group) => (
              <View key={group.date} style={{ marginBottom: 16 }}>
                <Text style={{
                  fontSize: 14,
                  fontWeight: '600',
                  color: '#9ca3af',
                  marginBottom: 8,
                  paddingHorizontal: 4
                }}>
                  {getDateLabel(group.date)}
                </Text>
                {group.transactions.map((transaction) => (
                  <SwipeableTransactionCard
                    key={transaction.id}
                    transaction={transaction}
                    onEdit={() => router.push(`/transactions/edit?id=${transaction.id}`)}
                    onDuplicate={() => handleDuplicateTransaction(transaction)}
                    onDelete={() => handleDeleteTransaction(transaction.id)}
                  />
                ))}
              </View>
            ))}
          </View>
        ) : (
          <View style={{
            flex: 1,
            alignItems: 'center',
            justifyContent: 'center',
            paddingHorizontal: 20,
            paddingTop: 60,
          }}>
            <Ionicons name="receipt-outline" size={64} color="#94a3b8" />
            <Text style={{ fontSize: 18, fontWeight: 'bold', color: '#64748b', marginTop: 16 }}>No transactions found</Text>
            <Text style={{ fontSize: 14, color: '#94a3b8', textAlign: 'center', marginTop: 8 }}>Add your first transaction or adjust your search filters</Text>
          </View>
        )}
      </ScrollView>

      {/* Floating Action Button */}
      <TouchableOpacity 
        style={{
          position: 'absolute',
          bottom: 125,
          right: 20,
          width: 56,
          height: 56,
          borderRadius: 28,
          backgroundColor: '#ea2a33',
          alignItems: 'center',
          justifyContent: 'center',
          shadowColor: '#ea2a33',
          shadowOffset: { width: 0, height: 8 },
          shadowOpacity: 0.4,
          shadowRadius: 16,
          elevation: 12,
        }}
        onPress={() => setShowAddModal(true)}
      >
        <Ionicons name="add" size={28} color="white" />
      </TouchableOpacity>

      <TransactionModal 
        visible={showAddModal} 
        onClose={() => {
          setShowAddModal(false);
          loadTransactions();
        }} 
      />
      
      <TransactionFiltersModal
        visible={showFiltersModal}
        onClose={() => setShowFiltersModal(false)}
        onApplyFilters={handleApplyFilters}
        currentFilters={{
          period: selectedDateFilter,
          categories: selectedCategories,
          payments: selectedPaymentMethods,
          merchants: selectedMerchants
        }}
      />
    </SafeAreaView>
  );
}