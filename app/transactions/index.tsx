import { Ionicons } from '@expo/vector-icons';
import { router, useFocusEffect } from 'expo-router';
import React, { useEffect, useRef, useState } from 'react';
import { Animated, PanResponder, RefreshControl, ScrollView, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTheme } from '../../providers/ThemeProvider';
import { TransactionCard } from '../../components/features';
import { Shimmer } from '../../components/animations';
import { TransactionFiltersModal, TransactionModal } from '../../components/modals';
import { Transaction } from '../../services/TransactionService';
import { getRelativeTime } from '../../utils/dateUtils';
import { useCategories, usePaymentMethods, useTransactions, useDeleteTransaction, useAddTransaction } from '../../hooks/useQueries';



export default function TransactionsIndex() {
  const { colors } = useTheme();
  const [showAddModal, setShowAddModal] = useState(false);
  const [showFiltersModal, setShowFiltersModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedTransaction, setSelectedTransaction] = useState<Transaction | null>(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [showDuplicateConfirm, setShowDuplicateConfirm] = useState(false);
  const [transactionToDelete, setTransactionToDelete] = useState<string | null>(null);
  const [transactionToDuplicate, setTransactionToDuplicate] = useState<Transaction | null>(null);
  const [selectionMode, setSelectionMode] = useState(false);
  const [selectedTransactions, setSelectedTransactions] = useState<string[]>([]);
  const [showBulkEditModal, setShowBulkEditModal] = useState(false);
  const [bulkEditCategory, setBulkEditCategory] = useState<string | undefined>();
  const [bulkEditPaymentMethod, setBulkEditPaymentMethod] = useState<string | undefined>();
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [topMerchants, setTopMerchants] = useState<string[]>([]);
  const [selectedDateFilter, setSelectedDateFilter] = useState('Last 3 Months');
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [selectedPaymentMethods, setSelectedPaymentMethods] = useState<string[]>([]);
  const [selectedTypes, setSelectedTypes] = useState<string[]>([]);
  const [selectedMerchants, setSelectedMerchants] = useState<string[]>([]);
  
  // TanStack Query hooks
  const { data: transactions = [], isLoading: transactionsLoading, refetch } = useTransactions();
  const { data: categories = [], isLoading: categoriesLoading } = useCategories();
  const { data: paymentMethods = [], isLoading: paymentMethodsLoading } = usePaymentMethods();
  const deleteTransactionMutation = useDeleteTransaction();
  const addTransactionMutation = useAddTransaction();
  
  const loading = (transactionsLoading || categoriesLoading || paymentMethodsLoading) && transactions.length === 0;
  
  const [categoryIcons, setCategoryIcons] = useState<{[key: string]: string}>({});
  const [categoryColors, setCategoryColors] = useState<{[key: string]: string}>({});
  const [allCategories, setAllCategories] = useState<any[]>([]);
  const [allPaymentMethods, setAllPaymentMethods] = useState<any[]>([]);
  
  useEffect(() => {
    // Data will be automatically loaded by TanStack Query
  }, []);

  useFocusEffect(
    React.useCallback(() => {
      loadTransactions();
    }, [])
  );
  
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
    } else if (selectedDateFilter === 'This Week') {
      const startOfWeek = new Date(today);
      startOfWeek.setDate(today.getDate() - today.getDay());
      filtered = filtered.filter(t => new Date(t.timestamp) >= startOfWeek);
    } else if (selectedDateFilter === 'This Month') {
      filtered = filtered.filter(t => new Date(t.timestamp) >= thisMonth);
    } else if (selectedDateFilter === 'Last Month') {
      const lastMonthStart = new Date(now.getFullYear(), now.getMonth() - 1, 1);
      const lastMonthEnd = new Date(now.getFullYear(), now.getMonth(), 0);
      filtered = filtered.filter(t => {
        const d = new Date(t.timestamp);
        return d >= lastMonthStart && d <= lastMonthEnd;
      });
    } else if (selectedDateFilter === 'Last 3 Months') {
      const threeMonthsAgo = new Date(now.getFullYear(), now.getMonth() - 3, now.getDate());
      filtered = filtered.filter(t => new Date(t.timestamp) >= threeMonthsAgo);
    } else if (selectedDateFilter === 'This Year') {
      const startOfYear = new Date(now.getFullYear(), 0, 1);
      filtered = filtered.filter(t => new Date(t.timestamp) >= startOfYear);
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
    // Data is now handled by TanStack Query hooks
    const iconMap = categories.reduce((acc, cat) => {
      acc[cat.name] = cat.icon;
      return acc;
    }, {} as {[key: string]: string});
    
    const colorMap = categories.reduce((acc, cat) => {
      acc[cat.name] = cat.color;
      return acc;
    }, {} as {[key: string]: string});
    
    setCategoryIcons(iconMap);
    setCategoryColors(colorMap);
    setAllCategories(categories);
    setAllPaymentMethods(paymentMethods);
  };
  
  const handleDeleteTransaction = async (id: string) => {
    setTransactionToDelete(id);
    setShowDeleteConfirm(true);
  };
  
  const confirmDelete = async () => {
    if (!transactionToDelete) return;
    deleteTransactionMutation.mutate(transactionToDelete, {
      onSuccess: () => {
        setShowDeleteConfirm(false);
        setTransactionToDelete(null);
      }
    });
  };
  
  const handleBulkDelete = () => {
    setShowDeleteConfirm(true);
  };
  
  const confirmBulkDelete = async () => {
    for (const id of selectedTransactions) {
      deleteTransactionMutation.mutate(id);
    }
    setSelectedTransactions([]);
    setSelectionMode(false);
    setShowDeleteConfirm(false);
  };
  
  const toggleSelection = (id: string) => {
    setSelectedTransactions(prev => 
      prev.includes(id) ? prev.filter(t => t !== id) : [...prev, id]
    );
  };
  
  const handleBulkEdit = async (category?: string, paymentMethod?: string) => {
    if (category) setBulkEditCategory(category);
    if (paymentMethod) setBulkEditPaymentMethod(paymentMethod);
  };
  
  const saveBulkEdit = async () => {
    try {
      for (const id of selectedTransactions) {
        const updates: any = {};
        if (bulkEditCategory) updates.category = bulkEditCategory;
        if (bulkEditPaymentMethod) updates.paymentMethod = bulkEditPaymentMethod;
        await TransactionService.updateTransaction(id, updates);
      }
      await loadTransactions();
      setSelectedTransactions([]);
      setSelectionMode(false);
      setShowBulkEditModal(false);
      setBulkEditCategory(undefined);
      setBulkEditPaymentMethod(undefined);
    } catch (error) {
    }
  };
  
  const handleDuplicateTransaction = async (transaction: Transaction) => {
    setTransactionToDuplicate(transaction);
    setShowDuplicateConfirm(true);
  };
  
  const confirmDuplicate = async () => {
    if (!transactionToDuplicate) return;
    addTransactionMutation.mutate({
      merchant: transactionToDuplicate.merchant,
      amount: transactionToDuplicate.amount,
      category: transactionToDuplicate.category,
      paymentMethod: transactionToDuplicate.paymentMethod,
      date: new Date().toISOString(),
      type: transactionToDuplicate.type,
      status: 'completed'
    }, {
      onSuccess: () => {
        setShowDuplicateConfirm(false);
        setTransactionToDuplicate(null);
      }
    });
  };
  
  const handleEditTransaction = (transaction: Transaction) => {
    setSelectedTransaction(transaction);
    setShowEditModal(true);
  };
  
  const filteredTransactions = getFilteredTransactions();
  const groupedTransactions = getGroupedTransactions();
  
  const SwipeableTransactionCard = ({ transaction, onEdit, onDuplicate, onDelete, isSelected, onToggleSelect }: { transaction: Transaction, onEdit: () => void, onDuplicate: () => void, onDelete: () => void, isSelected: boolean, onToggleSelect: () => void }) => {
    const translateX = useRef(new Animated.Value(0)).current;
    
    const panResponder = PanResponder.create({
      onMoveShouldSetPanResponder: (_, gestureState) => {
        return Math.abs(gestureState.dx) > 20;
      },
      onPanResponderMove: (_, gestureState) => {
        if (gestureState.dx < 0) {
          translateX.setValue(Math.max(gestureState.dx, -200));
        }
      },
      onPanResponderRelease: (_, gestureState) => {
        if (gestureState.dx < -40) {
          Animated.spring(translateX, {
            toValue: -200,
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
        {/* Background Card */}
        <View style={{
          position: 'absolute',
          right: 0,
          top: 0,
          bottom: 0,
          left: 0,
          backgroundColor: colors.card,
          borderRadius: 16,
          shadowColor: '#000',
          shadowOffset: { width: 0, height: 1 },
          shadowOpacity: 0.05,
          shadowRadius: 2,
          elevation: 1,
        }} />
        
        {/* Action Buttons */}
        <View style={{
          position: 'absolute',
          right: 0,
          top: 0,
          bottom: 0,
          flexDirection: 'row',
          alignItems: 'center',
          paddingRight: 16,
          borderRadius: 16,
          paddingLeft: 8,
        }}>
          <TouchableOpacity 
            style={{
              width: 50,
              height: 50,
              alignItems: 'center',
              justifyContent: 'center',
              marginRight: 8,
            }}
            onPress={onDuplicate}
          >
            <Ionicons name="copy" size={24} color="#10b981" />
          </TouchableOpacity>
          <TouchableOpacity 
            style={{
              width: 50,
              height: 50,
              alignItems: 'center',
              justifyContent: 'center',
              marginRight: 8,
            }}
            onPress={onEdit}
          >
            <Ionicons name="create" size={24} color="#3b82f6" />
          </TouchableOpacity>
          <TouchableOpacity 
            style={{
              width: 50,
              height: 50,
              alignItems: 'center',
              justifyContent: 'center',
            }}
            onPress={onDelete}
          >
            <Ionicons name="trash" size={24} color="#ef4444" />
          </TouchableOpacity>
        </View>
        
        {/* Transaction Card */}
        <Animated.View
          style={{
            transform: [{ translateX }],
            backgroundColor: colors.card,
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
            onPress={() => selectionMode ? onToggleSelect() : router.push(`/transactions/details?id=${transaction.id}`)}
            onLongPress={() => {
              if (!selectionMode) {
                setSelectionMode(true);
                onToggleSelect();
              }
            }}
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              justifyContent: 'space-between',
            }}
          >
            {selectionMode && (
              <View style={{
                width: 24,
                height: 24,
                borderRadius: 12,
                borderWidth: 2,
                borderColor: isSelected ? '#EA2831' : '#d1d5db',
                backgroundColor: isSelected ? '#EA2831' : 'transparent',
                alignItems: 'center',
                justifyContent: 'center',
                marginRight: 12,
              }}>
                {isSelected && <Ionicons name="checkmark" size={16} color="white" />}
              </View>
            )}
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
                <Text style={{ fontSize: 16, fontWeight: 'bold', color: colors.text }} numberOfLines={1} ellipsizeMode="tail">{transaction.merchant}</Text>
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
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.background }}>
      {/* Header */}
      <View style={{ paddingHorizontal: 20, paddingTop: 16, paddingBottom: 8 }}>
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
          {selectionMode ? (
            <>
              <TouchableOpacity onPress={() => {
                setSelectionMode(false);
                setSelectedTransactions([]);
              }}>
                <Text style={{ fontSize: 16, fontWeight: '600', color: '#6b7280' }}>Cancel</Text>
              </TouchableOpacity>
              <Text style={{ fontSize: 18, fontWeight: 'bold', color: colors.text }}>{selectedTransactions.length} Selected</Text>
              <View style={{ flexDirection: 'row', gap: 12 }}>
                <TouchableOpacity onPress={() => setShowBulkEditModal(true)} disabled={selectedTransactions.length === 0}>
                  <Ionicons name="create" size={24} color={selectedTransactions.length > 0 ? '#3b82f6' : '#d1d5db'} />
                </TouchableOpacity>
                <TouchableOpacity onPress={handleBulkDelete} disabled={selectedTransactions.length === 0}>
                  <Ionicons name="trash" size={24} color={selectedTransactions.length > 0 ? '#ef4444' : '#d1d5db'} />
                </TouchableOpacity>
              </View>
            </>
          ) : (
            <>
              <View>
                <Text style={{ fontSize: 24, fontWeight: 'bold', color: colors.text }}>Transactions</Text>
              </View>
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
                <Ionicons name="options" size={24} color={colors.text} />
                <View style={{
                  position: 'absolute',
                  top: 8,
                  right: 8,
                  width: 10,
                  height: 10,
                  backgroundColor: '#ea2a33',
                  borderRadius: 5,
                  borderWidth: 2,
                  borderColor: colors.background,
                }} />
              </TouchableOpacity>
            </>
          )}
        </View>

        {/* Search Bar */}
        <View style={{
          flexDirection: 'row',
          alignItems: 'center',
          backgroundColor: colors.card,
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
            style={{ flex: 1, fontSize: 16, fontWeight: '500', color: colors.text }}
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
        </View>

        {/* Filter Chips */}
        {loading ? (
          <View style={{ marginBottom: 16, paddingVertical: 8 }}>
            <Shimmer width={300} height={36} borderRadius={18} />
          </View>
        ) : (
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginBottom: 16 }}>
          <View style={{ flexDirection: 'row', gap: 12, paddingVertical: 8, paddingBottom: 16 }}>
            {/* All chips sorted: selected first */}
            {[
              ...[
                { name: 'Today', icon: 'today', filterType: 'date' },
                { name: 'Yesterday', icon: 'calendar', filterType: 'date' },
                { name: 'This Week', icon: 'calendar-outline', filterType: 'date' },
                { name: 'This Month', icon: 'calendar', filterType: 'date' },
                { name: 'Last Month', icon: 'calendar-outline', filterType: 'date' },
                { name: 'Last 3 Months', icon: 'calendar', filterType: 'date' },
                { name: 'This Year', icon: 'calendar', filterType: 'date' }
              ],
              ...categories.map(c => ({ name: c.name, icon: c.icon, filterType: 'category' })),
              ...paymentMethods.map(m => ({ name: m.name, icon: m.icon, filterType: 'payment' })),
              ...topMerchants.map(m => ({ name: m, icon: 'storefront', filterType: 'merchant' }))
            ]
            .sort((a, b) => {
              const aSelected = 
                (a.filterType === 'type' && selectedTypes.includes(a.name.toLowerCase())) ||
                (a.filterType === 'date' && selectedDateFilter === a.name) ||
                (a.filterType === 'category' && selectedCategories.includes(a.name)) ||
                (a.filterType === 'payment' && selectedPaymentMethods.includes(a.name)) ||
                (a.filterType === 'merchant' && selectedMerchants.includes(a.name));
              const bSelected = 
                (b.filterType === 'type' && selectedTypes.includes(b.name.toLowerCase())) ||
                (b.filterType === 'date' && selectedDateFilter === b.name) ||
                (b.filterType === 'category' && selectedCategories.includes(b.name)) ||
                (b.filterType === 'payment' && selectedPaymentMethods.includes(b.name)) ||
                (b.filterType === 'merchant' && selectedMerchants.includes(b.name));
              if (aSelected && !bSelected) return -1;
              if (!aSelected && bSelected) return 1;
              return 0;
            })
            .map((filter) => {
              const isSelected = 
                (filter.filterType === 'type' && selectedTypes.includes(filter.name.toLowerCase())) ||
                (filter.filterType === 'date' && selectedDateFilter === filter.name) ||
                (filter.filterType === 'category' && selectedCategories.includes(filter.name)) ||
                (filter.filterType === 'payment' && selectedPaymentMethods.includes(filter.name)) ||
                (filter.filterType === 'merchant' && selectedMerchants.includes(filter.name));
              
              const onPress = () => {
                if (filter.filterType === 'type') handleTypeSelect(filter.name.toLowerCase());
                else if (filter.filterType === 'date') handleDateFilterSelect(filter.name);
                else if (filter.filterType === 'category') handleCategorySelect(filter.name);
                else if (filter.filterType === 'payment') handlePaymentMethodSelect(filter.name);
                else if (filter.filterType === 'merchant') handleMerchantSelect(filter.name);
              };

              return (
                <TouchableOpacity 
                  key={`${filter.filterType}-${filter.name}`}
                  style={{
                    flexDirection: 'row',
                    alignItems: 'center',
                    gap: 6,
                    paddingHorizontal: 16,
                    height: 36,
                    borderRadius: 18,
                    backgroundColor: isSelected ? '#ea2a33' : colors.card,
                    shadowColor: isSelected ? '#ea2a33' : '#000',
                    shadowOffset: { width: 0, height: isSelected ? 4 : 1 },
                    shadowOpacity: isSelected ? 0.25 : 0.05,
                    shadowRadius: isSelected ? 8 : 2,
                    elevation: isSelected ? 4 : 1,
                  }}
                  onPress={onPress}
                >
                  <Ionicons name={filter.icon as any} size={16} color={isSelected ? 'white' : colors.textSecondary} />
                  <Text style={{ fontSize: 14, fontWeight: '600', color: isSelected ? 'white' : colors.textSecondary }}>{filter.name}</Text>
                </TouchableOpacity>
              );
            })}
          </View>
        </ScrollView>
        )}

        {/* Summary */}
        {!loading && (
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 4, marginBottom: 8 }}>
            <Text style={{ fontSize: 12, fontWeight: '600', color: colors.textSecondary }}>
              {filteredTransactions.length} transactions
            </Text>
            <Text style={{ fontSize: 12, fontWeight: '700', color: colors.text }}>
              ₹{filteredTransactions.filter(t => t.type === 'expense').reduce((sum, t) => sum + parseFloat(t.amount), 0).toLocaleString('en-IN')}
            </Text>
          </View>
        )}
      </View>

      {/* Transactions List */}
      {loading ? (
        <View style={{ paddingHorizontal: 20, paddingTop: 12, marginBottom: 20 }}>
          <Shimmer width={80} height={16} borderRadius={8} style={{ marginBottom: 8 }} />
          <Shimmer width="100%" height={80} borderRadius={12} style={{ marginBottom: 12 }} />
          <Shimmer width="100%" height={80} borderRadius={12} style={{ marginBottom: 12 }} />
          <Shimmer width="100%" height={80} borderRadius={12} style={{ marginBottom: 12 }} />
          <Shimmer width="100%" height={80} borderRadius={12} style={{ marginBottom: 12 }} />
          <Shimmer width="100%" height={80} borderRadius={12} />
        </View>
      ) : (
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
                  color: colors.textMuted,
                  marginBottom: 8,
                  paddingHorizontal: 4
                }}>
                  {getDateLabel(group.date)}
                </Text>
                {group.transactions.map((transaction) => (
                  <TransactionCard
                    key={transaction.id}
                    transaction={transaction}
                    categoryIcons={categoryIcons}
                    categoryColors={categoryColors}
                    onEdit={() => {}}
                    onDuplicate={() => {}}
                    onDelete={() => {}}
                    isSelected={selectedTransactions.includes(transaction.id)}
                    onToggleSelect={() => toggleSelection(transaction.id)}
                    selectionMode={selectionMode}
                    onLongPress={() => {
                      if (!selectionMode) {
                        setSelectionMode(true);
                        toggleSelection(transaction.id);
                      }
                    }}
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
            <Text style={{ fontSize: 18, fontWeight: 'bold', color: colors.textSecondary, marginTop: 16 }}>No transactions found</Text>
            <Text style={{ fontSize: 14, color: '#94a3b8', textAlign: 'center', marginTop: 8 }}>Add your first transaction or adjust your search filters</Text>
          </View>
        )}
      </ScrollView>
      )}

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
        onClose={() => setShowAddModal(false)}
        onTransactionAdded={() => setShowAddModal(false)}
      />
      
      <TransactionModal 
        visible={showEditModal} 
        onClose={() => {
          setShowEditModal(false);
          setSelectedTransaction(null);
        }}
        transaction={selectedTransaction || undefined}
        onTransactionUpdated={() => {
          setShowEditModal(false);
          setSelectedTransaction(null);
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
      
      {/* Bulk Edit Modal */}
      {showBulkEditModal && (
        <View style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(0, 0, 0, 0.5)',
          alignItems: 'center',
          justifyContent: 'flex-end',
        }}>
          <View style={{
            backgroundColor: colors.card,
            borderTopLeftRadius: 24,
            borderTopRightRadius: 24,
            padding: 24,
            paddingBottom: 120,
            width: '100%',
            maxHeight: '60%',
          }}>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
              <Text style={{ fontSize: 20, fontWeight: 'bold', color: colors.text }}>Edit {selectedTransactions.length} Transactions</Text>
              <TouchableOpacity onPress={() => {
                setShowBulkEditModal(false);
                setBulkEditCategory(undefined);
                setBulkEditPaymentMethod(undefined);
              }}>
                <Ionicons name="close" size={24} color="#6b7280" />
              </TouchableOpacity>
            </View>
            
            <ScrollView showsVerticalScrollIndicator={false}>
              <Text style={{ fontSize: 14, fontWeight: 'bold', color: '#6b7280', marginBottom: 12, textTransform: 'uppercase', letterSpacing: 1 }}>Category</Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginBottom: 24 }}>
                <View style={{ flexDirection: 'row', gap: 8 }}>
                  {allCategories.map((cat) => (
                    <TouchableOpacity
                      key={cat.id}
                      style={{
                        flexDirection: 'row',
                        alignItems: 'center',
                        gap: 8,
                        paddingVertical: 10,
                        paddingHorizontal: 14,
                        borderRadius: 20,
                        backgroundColor: bulkEditCategory === cat.name ? cat.color : 'white',
                        borderWidth: 1,
                        borderColor: bulkEditCategory === cat.name ? cat.color : '#e5e7eb',
                      }}
                      onPress={() => handleBulkEdit(cat.name, undefined)}
                    >
                      <Ionicons name={cat.icon as any} size={18} color={bulkEditCategory === cat.name ? 'white' : cat.color} />
                      <Text style={{ fontSize: 14, fontWeight: '600', color: bulkEditCategory === cat.name ? 'white' : '#374151' }}>{cat.name}</Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </ScrollView>
              
              <Text style={{ fontSize: 14, fontWeight: 'bold', color: '#6b7280', marginBottom: 12, textTransform: 'uppercase', letterSpacing: 1 }}>Payment Method</Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                <View style={{ flexDirection: 'row', gap: 8 }}>
                  {allPaymentMethods.map((method) => (
                    <TouchableOpacity
                      key={method.id}
                      style={{
                        flexDirection: 'row',
                        alignItems: 'center',
                        gap: 8,
                        paddingVertical: 10,
                        paddingHorizontal: 14,
                        borderRadius: 20,
                        backgroundColor: bulkEditPaymentMethod === method.name ? method.color : 'white',
                        borderWidth: 1,
                        borderColor: bulkEditPaymentMethod === method.name ? method.color : '#e5e7eb',
                      }}
                      onPress={() => handleBulkEdit(undefined, method.name)}
                    >
                      <Ionicons name={method.icon as any} size={18} color={bulkEditPaymentMethod === method.name ? 'white' : method.color} />
                      <Text style={{ fontSize: 14, fontWeight: '600', color: bulkEditPaymentMethod === method.name ? 'white' : '#374151' }}>{method.name}</Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </ScrollView>
            </ScrollView>
            
            <View style={{ flexDirection: 'row', gap: 12, marginTop: 20 }}>
              <TouchableOpacity
                style={{
                  flex: 1,
                  paddingVertical: 14,
                  borderRadius: 12,
                  backgroundColor: '#f3f4f6',
                  alignItems: 'center',
                }}
                onPress={() => {
                  setShowBulkEditModal(false);
                  setBulkEditCategory(undefined);
                  setBulkEditPaymentMethod(undefined);
                }}
              >
                <Text style={{ fontSize: 16, fontWeight: 'bold', color: '#6b7280' }}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={{
                  flex: 1,
                  paddingVertical: 14,
                  borderRadius: 12,
                  backgroundColor: '#EA2831',
                  alignItems: 'center',
                  shadowColor: '#EA2831',
                  shadowOffset: { width: 0, height: 4 },
                  shadowOpacity: 0.3,
                  shadowRadius: 8,
                  elevation: 4,
                }}
                onPress={saveBulkEdit}
                disabled={!bulkEditCategory && !bulkEditPaymentMethod}
              >
                <Text style={{ fontSize: 16, fontWeight: 'bold', color: 'white' }}>Save Changes</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      )}
      
      {/* Delete Confirmation */}
      {showDeleteConfirm && (
        <Animated.View style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(0, 0, 0, 0.5)',
          alignItems: 'center',
          justifyContent: 'center',
        }}>
          <Animated.View style={{
            backgroundColor: colors.card,
            borderRadius: 24,
            padding: 32,
            width: '85%',
            maxWidth: 400,
            transform: [{ scale: 1 }],
          }}>
            <View style={{
              width: 80,
              height: 80,
              borderRadius: 40,
              backgroundColor: 'rgba(239, 68, 68, 0.1)',
              alignItems: 'center',
              justifyContent: 'center',
              alignSelf: 'center',
              marginBottom: 20,
            }}>
              <Ionicons name="trash" size={40} color="#ef4444" />
            </View>
            <Text style={{ fontSize: 22, fontWeight: 'bold', color: colors.text, textAlign: 'center', marginBottom: 8 }}>
              {selectedTransactions.length > 0 ? `Delete ${selectedTransactions.length} Transactions?` : 'Delete Transaction?'}
            </Text>
            <Text style={{ fontSize: 14, color: '#6b7280', textAlign: 'center', marginBottom: 28, lineHeight: 20 }}>
              This action cannot be undone. {selectedTransactions.length > 0 ? 'All selected transactions' : 'This transaction'} will be permanently removed.
            </Text>
            <View style={{ flexDirection: 'row', gap: 12 }}>
              <TouchableOpacity
                style={{
                  flex: 1,
                  paddingVertical: 16,
                  borderRadius: 14,
                  backgroundColor: '#f3f4f6',
                  alignItems: 'center',
                }}
                onPress={() => {
                  setShowDeleteConfirm(false);
                  setTransactionToDelete(null);
                }}
              >
                <Text style={{ fontSize: 16, fontWeight: 'bold', color: '#6b7280' }}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={{
                  flex: 1,
                  paddingVertical: 16,
                  borderRadius: 14,
                  backgroundColor: '#ef4444',
                  alignItems: 'center',
                  shadowColor: '#ef4444',
                  shadowOffset: { width: 0, height: 4 },
                  shadowOpacity: 0.3,
                  shadowRadius: 8,
                  elevation: 4,
                }}
                onPress={selectedTransactions.length > 0 ? confirmBulkDelete : confirmDelete}
              >
                <Text style={{ fontSize: 16, fontWeight: 'bold', color: 'white' }}>Delete</Text>
              </TouchableOpacity>
            </View>
          </Animated.View>
        </Animated.View>
      )}
      
      {/* Duplicate Confirmation */}
      {showDuplicateConfirm && (
        <Animated.View style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(0, 0, 0, 0.5)',
          alignItems: 'center',
          justifyContent: 'center',
        }}>
          <Animated.View style={{
            backgroundColor: colors.card,
            borderRadius: 24,
            padding: 32,
            width: '85%',
            maxWidth: 400,
            transform: [{ scale: 1 }],
          }}>
            <View style={{
              width: 80,
              height: 80,
              borderRadius: 40,
              backgroundColor: 'rgba(16, 185, 129, 0.1)',
              alignItems: 'center',
              justifyContent: 'center',
              alignSelf: 'center',
              marginBottom: 20,
            }}>
              <Ionicons name="copy" size={40} color="#10b981" />
            </View>
            <Text style={{ fontSize: 22, fontWeight: 'bold', color: colors.text, textAlign: 'center', marginBottom: 8 }}>Duplicate Transaction?</Text>
            <Text style={{ fontSize: 14, color: '#6b7280', textAlign: 'center', marginBottom: 28, lineHeight: 20 }}>
              A copy of this transaction will be created with today's date and time.
            </Text>
            <View style={{ flexDirection: 'row', gap: 12 }}>
              <TouchableOpacity
                style={{
                  flex: 1,
                  paddingVertical: 16,
                  borderRadius: 14,
                  backgroundColor: '#f3f4f6',
                  alignItems: 'center',
                }}
                onPress={() => {
                  setShowDuplicateConfirm(false);
                  setTransactionToDuplicate(null);
                }}
              >
                <Text style={{ fontSize: 16, fontWeight: 'bold', color: '#6b7280' }}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={{
                  flex: 1,
                  paddingVertical: 16,
                  borderRadius: 14,
                  backgroundColor: '#10b981',
                  alignItems: 'center',
                  shadowColor: '#10b981',
                  shadowOffset: { width: 0, height: 4 },
                  shadowOpacity: 0.3,
                  shadowRadius: 8,
                  elevation: 4,
                }}
                onPress={confirmDuplicate}
              >
                <Text style={{ fontSize: 16, fontWeight: 'bold', color: 'white' }}>Duplicate</Text>
              </TouchableOpacity>
            </View>
          </Animated.View>
        </Animated.View>
      )}
    </SafeAreaView>
  );
}