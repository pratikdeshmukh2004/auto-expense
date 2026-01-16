import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { Animated, RefreshControl, ScrollView, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import CategoryBreakdown from '../../components/CategoryBreakdown';
import TransactionApprovalModal from '../../components/drawers/TransactionApprovalModal';
import TransactionModal from '../../components/drawers/TransactionModal';
import PaymentMethods from '../../components/PaymentMethods';
import SpendingTrends from '../../components/SpendingTrends';
import TransactionCard from '../../components/TransactionCard';
import { AuthService } from '../../services/AuthService';
import { CategoryService } from '../../services/CategoryService';
import { Transaction, TransactionService } from '../../services/TransactionService';

const AnimatedBackground = () => {
  const [animations] = useState(() => {
    return Array.from({ length: 12 }, () => ({
      translateY: new Animated.Value(180),
      translateX: new Animated.Value(0),
      opacity: new Animated.Value(0.2),
      rotate: new Animated.Value(0),
    }));
  });

  useEffect(() => {
    const animateElements = () => {
      animations.forEach((anim, index) => {
        Animated.loop(
          Animated.sequence([
            Animated.parallel([
              Animated.timing(anim.translateY, {
                toValue: -40 - (index * 8),
                duration: 6000 + (index * 600),
                useNativeDriver: true,
              }),
              Animated.timing(anim.translateX, {
                toValue: (index % 2 === 0 ? 30 : -30),
                duration: 5000 + (index * 400),
                useNativeDriver: true,
              }),
              Animated.timing(anim.opacity, {
                toValue: 0.4,
                duration: 3000,
                useNativeDriver: true,
              }),
              Animated.timing(anim.rotate, {
                toValue: 1,
                duration: 8000 + (index * 500),
                useNativeDriver: true,
              }),
            ]),
            Animated.parallel([
              Animated.timing(anim.translateY, {
                toValue: 180,
                duration: 0,
                useNativeDriver: true,
              }),
              Animated.timing(anim.translateX, {
                toValue: 0,
                duration: 0,
                useNativeDriver: true,
              }),
              Animated.timing(anim.opacity, {
                toValue: 0.2,
                duration: 0,
                useNativeDriver: true,
              }),
              Animated.timing(anim.rotate, {
                toValue: 0,
                duration: 0,
                useNativeDriver: true,
              }),
            ]),
          ])
        ).start();
      });
    };

    animateElements();
  }, []);

  const hour = new Date().getHours();
  let elements = [];
  
  if (hour < 6) {
    // Night: moon, stars, clouds
    elements = [
      { icon: 'moon', color: '#818cf8', size: 40 },
      { icon: 'star', color: '#fbbf24', size: 16 },
      { icon: 'star', color: '#fde68a', size: 12 },
      { icon: 'star-outline', color: '#fef3c7', size: 14 },
      { icon: 'cloud-outline', color: '#94a3b8', size: 32 },
      { icon: 'cloud', color: '#cbd5e1', size: 28 },
      { icon: 'star', color: '#fbbf24', size: 10 },
      { icon: 'ellipse', color: '#818cf8', size: 8 },
      { icon: 'star-outline', color: '#fde68a', size: 16 },
      { icon: 'cloud-outline', color: '#94a3b8', size: 24 },
      { icon: 'star', color: '#fef3c7', size: 12 },
      { icon: 'ellipse', color: '#a5b4fc', size: 6 },
    ];
  } else if (hour < 12) {
    // Morning: sun, birds, clouds
    elements = [
      { icon: 'sunny', color: '#fbbf24', size: 44 },
      { icon: 'airplane', color: '#64748b', size: 20 },
      { icon: 'cloud-outline', color: '#fde68a', size: 32 },
      { icon: 'leaf', color: '#10b981', size: 18 },
      { icon: 'cloud', color: '#fef3c7', size: 28 },
      { icon: 'airplane-outline', color: '#94a3b8', size: 16 },
      { icon: 'ellipse', color: '#fbbf24', size: 10 },
      { icon: 'leaf-outline', color: '#34d399', size: 14 },
      { icon: 'cloud-outline', color: '#fde68a', size: 24 },
      { icon: 'ellipse', color: '#fcd34d', size: 8 },
      { icon: 'airplane', color: '#64748b', size: 18 },
      { icon: 'leaf', color: '#10b981', size: 12 },
    ];
  } else if (hour < 17) {
    // Afternoon: sun, clouds, warm tones
    elements = [
      { icon: 'partly-sunny', color: '#fb923c', size: 42 },
      { icon: 'cloud', color: '#fed7aa', size: 36 },
      { icon: 'sunny-outline', color: '#fdba74', size: 24 },
      { icon: 'cloud-outline', color: '#fef3c7', size: 28 },
      { icon: 'ellipse', color: '#fb923c', size: 12 },
      { icon: 'cloud', color: '#fed7aa', size: 32 },
      { icon: 'ellipse', color: '#fdba74', size: 10 },
      { icon: 'cloud-outline', color: '#fde68a', size: 26 },
      { icon: 'sunny-outline', color: '#fb923c', size: 20 },
      { icon: 'ellipse', color: '#fbbf24', size: 8 },
      { icon: 'cloud', color: '#fed7aa', size: 30 },
      { icon: 'ellipse', color: '#fb923c', size: 6 },
    ];
  } else if (hour < 20) {
    // Evening: sunset, birds flying home, warm colors
    elements = [
      { icon: 'sunset', color: '#f87171', size: 40 },
      { icon: 'airplane', color: '#64748b', size: 18 },
      { icon: 'cloud', color: '#fca5a5', size: 34 },
      { icon: 'ellipse', color: '#fb923c', size: 14 },
      { icon: 'cloud-outline', color: '#fed7aa', size: 28 },
      { icon: 'airplane-outline', color: '#94a3b8', size: 16 },
      { icon: 'ellipse', color: '#f87171', size: 10 },
      { icon: 'cloud', color: '#fca5a5', size: 30 },
      { icon: 'airplane', color: '#64748b', size: 20 },
      { icon: 'ellipse', color: '#fb923c', size: 8 },
      { icon: 'cloud-outline', color: '#fed7aa', size: 26 },
      { icon: 'ellipse', color: '#f87171', size: 6 },
    ];
  } else {
    // Night: moon, stars, clouds
    elements = [
      { icon: 'moon', color: '#818cf8', size: 40 },
      { icon: 'star', color: '#fbbf24', size: 16 },
      { icon: 'star', color: '#fde68a', size: 12 },
      { icon: 'star-outline', color: '#fef3c7', size: 14 },
      { icon: 'cloud-outline', color: '#94a3b8', size: 32 },
      { icon: 'cloud', color: '#cbd5e1', size: 28 },
      { icon: 'star', color: '#fbbf24', size: 10 },
      { icon: 'ellipse', color: '#818cf8', size: 8 },
      { icon: 'star-outline', color: '#fde68a', size: 16 },
      { icon: 'cloud-outline', color: '#94a3b8', size: 24 },
      { icon: 'star', color: '#fef3c7', size: 12 },
      { icon: 'ellipse', color: '#a5b4fc', size: 6 },
    ];
  }

  return (
    <View style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 180, overflow: 'hidden' }}>
      {animations.map((anim, index) => {
        const element = elements[index];
        const isAirplane = element?.icon.includes('airplane');
        const shouldRotate = element?.icon.includes('star') || element?.icon.includes('leaf');
        
        return (
          <Animated.View
            key={index}
            style={{
              position: 'absolute',
              top: 15 + (index * 15),
              left: 10 + (index * 30),
              opacity: anim.opacity,
              transform: [
                { translateY: anim.translateY },
                { translateX: isAirplane ? anim.translateX.interpolate({
                  inputRange: [-30, 0, 30],
                  outputRange: [-100, 0, 100],
                }) : anim.translateX },
                ...(shouldRotate ? [{ rotate: anim.rotate.interpolate({
                  inputRange: [0, 1],
                  outputRange: ['0deg', '360deg'],
                }) }] : []),
              ],
            }}
          >
            <Ionicons 
              name={element?.icon as any} 
              size={element?.size || 20} 
              color={element?.color || '#94a3b8'}
            />
          </Animated.View>
        );
      })}
    </View>
  );
};

const AnimatedNumber = ({ value, prefix = '₹', suffix = '' }: { value: string, prefix?: string, suffix?: string }) => {
  const [displayValue, setDisplayValue] = useState(0);
  const targetValue = parseFloat(value);

  useEffect(() => {
    let start = 0;
    const duration = 1000;
    const startTime = Date.now();

    const animate = () => {
      const now = Date.now();
      const progress = Math.min((now - startTime) / duration, 1);
      const easeOut = 1 - Math.pow(1 - progress, 3);
      const current = start + (targetValue - start) * easeOut;
      
      setDisplayValue(current);
      
      if (progress < 1) {
        requestAnimationFrame(animate);
      }
    };
    
    animate();
  }, [targetValue]);

  return (
    <Text style={{ fontSize: 20, fontWeight: 'bold', color: '#0d121b' }}>
      {prefix}{displayValue.toFixed(2)}{suffix}
    </Text>
  );
};

export default function DashboardIndex() {
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedTransaction, setSelectedTransaction] = useState<Transaction | null>(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [showDuplicateConfirm, setShowDuplicateConfirm] = useState(false);
  const [transactionToDelete, setTransactionToDelete] = useState<string | null>(null);
  const [transactionToDuplicate, setTransactionToDuplicate] = useState<Transaction | null>(null);
  const [showApprovalModal, setShowApprovalModal] = useState(false);
  const [currentDate, setCurrentDate] = useState('');
  const [recentTransactions, setRecentTransactions] = useState<Transaction[]>([]);
  const [totalIncome, setTotalIncome] = useState(0);
  const [totalExpenses, setTotalExpenses] = useState(0);
  const [categoryBreakdown, setCategoryBreakdown] = useState<{[category: string]: Transaction[]}>({});
  const [incomeBreakdown, setIncomeBreakdown] = useState<{[category: string]: Transaction[]}>({});
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [categoryIcons, setCategoryIcons] = useState<{[key: string]: string}>({});
  const [categoryColors, setCategoryColors] = useState<{[key: string]: string}>({});
  const [refreshing, setRefreshing] = useState(false);
  const [userName, setUserName] = useState<string | null>(null);
  const [isGuest, setIsGuest] = useState(false);
  const [hasPendingTransactions, setHasPendingTransactions] = useState(false);
  const [pendingCount, setPendingCount] = useState(0);
  
  const handleDeleteTransaction = (id: string) => {
    setTransactionToDelete(id);
    setShowDeleteConfirm(true);
  };
  
  const confirmDelete = async () => {
    if (!transactionToDelete) return;
    try {
      await TransactionService.deleteTransaction(transactionToDelete);
      await loadTransactionData();
      setShowDeleteConfirm(false);
      setTransactionToDelete(null);
    } catch (error) {
      console.error('Error deleting transaction:', error);
    }
  };
  
  const handleDuplicateTransaction = (transaction: Transaction) => {
    setTransactionToDuplicate(transaction);
    setShowDuplicateConfirm(true);
  };
  
  const confirmDuplicate = async () => {
    if (!transactionToDuplicate) return;
    try {
      await TransactionService.addTransaction({
        merchant: transactionToDuplicate.merchant,
        amount: transactionToDuplicate.amount,
        category: transactionToDuplicate.category,
        paymentMethod: transactionToDuplicate.paymentMethod,
        date: new Date().toISOString(),
        type: transactionToDuplicate.type,
        status: 'completed'
      });
      await loadTransactionData();
      setShowDuplicateConfirm(false);
      setTransactionToDuplicate(null);
    } catch (error) {
      console.error('Error duplicating transaction:', error);
    }
  };
  
  const handleEditTransaction = (transaction: Transaction) => {
    setSelectedTransaction(transaction);
    setShowEditModal(true);
  };
  
  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good Morning';
    if (hour < 17) return 'Good Afternoon';
    return 'Good Evening';
  };

  useEffect(() => {
    const now = new Date();
    setCurrentDate(now.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' }));
    loadTransactionData();
    loadUserInfo();
  }, []);

  const loadUserInfo = async () => {
    const guest = await AuthService.isGuest();
    setIsGuest(guest);
    if (!guest) {
      const name = await AuthService.getUserName();
      setUserName(name);
    }
  };

  const loadTransactionData = async () => {
    try {
      const allTransactions = await TransactionService.getTransactions();
      const recentTxns = await TransactionService.getRecentTransactions(4);
      const income = await TransactionService.getTotalIncome();
      const expenses = await TransactionService.getTotalExpenses();
      const categoryData = await TransactionService.getTransactionsByCategory();
      const incomeData = await TransactionService.getIncomeByCategory();
      const categories = await CategoryService.getCategories();
      
      const iconMap = categories.reduce((acc, cat) => {
        acc[cat.name] = cat.icon;
        return acc;
      }, {} as {[key: string]: string});
      
      const colorMap = categories.reduce((acc, cat) => {
        acc[cat.name] = cat.color;
        return acc;
      }, {} as {[key: string]: string});
      
      const pendingCount = allTransactions.filter(t => t.status === 'pending').length;
      setHasPendingTransactions(pendingCount > 0);
      setPendingCount(pendingCount);
      
      setTransactions(allTransactions);
      setRecentTransactions(recentTxns);
      setTotalIncome(income);
      setTotalExpenses(expenses);
      setCategoryBreakdown(categoryData);
      setIncomeBreakdown(incomeData || {});
      setCategoryIcons(iconMap);
      setCategoryColors(colorMap);
    } catch (error) {
      console.error('Error loading transaction data:', error);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    try {
      const { GmailService } = await import('../../services/GmailService');
      await GmailService.fetchTransactionEmails();
      const SecureStore = await import('expo-secure-store');
      await SecureStore.setItemAsync('last_email_sync', new Date().toISOString());
    } catch (error) {
      console.log('Error fetching Gmail transactions:', error);
    }
    await loadTransactionData();
    await loadUserInfo();
    setRefreshing(false);
  };

  const getMonthlyComparison = () => {
    const now = new Date();
    const currentMonth = now.getMonth();
    const lastMonth = currentMonth === 0 ? 11 : currentMonth - 1;
    const lastMonthYear = currentMonth === 0 ? now.getFullYear() - 1 : now.getFullYear();
    
    const currentMonthTransactions = transactions.filter(t => {
      const date = new Date(t.timestamp);
      return date.getMonth() === currentMonth && date.getFullYear() === now.getFullYear();
    });
    
    const lastMonthTransactions = transactions.filter(t => {
      const date = new Date(t.timestamp);
      return date.getMonth() === lastMonth && date.getFullYear() === lastMonthYear;
    });
    
    const currentIncome = currentMonthTransactions.filter(t => t.type === 'income').reduce((sum, t) => sum + parseFloat(t.amount), 0);
    const currentExpenses = currentMonthTransactions.filter(t => t.type === 'expense').reduce((sum, t) => sum + parseFloat(t.amount), 0);
    const lastIncome = lastMonthTransactions.filter(t => t.type === 'income').reduce((sum, t) => sum + parseFloat(t.amount), 0);
    const lastExpenses = lastMonthTransactions.filter(t => t.type === 'expense').reduce((sum, t) => sum + parseFloat(t.amount), 0);
    
    const incomeChange = lastIncome > 0 ? ((currentIncome - lastIncome) / lastIncome) * 100 : 0;
    const expenseChange = lastExpenses > 0 ? ((currentExpenses - lastExpenses) / lastExpenses) * 100 : 0;
    
    return { incomeChange, expenseChange };
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#f8f6f6' }}>
      <AnimatedBackground />
      {/* Header */}
      <View style={{
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: 16,
        paddingVertical: 16,
        paddingTop: 32,
        backgroundColor: 'transparent',
      }}>
        <View>
          <Text style={{ fontSize: 14, color: '#64748b', fontWeight: '500' }}>{currentDate}</Text>
          <Text style={{ fontSize: 20, fontWeight: 'bold', color: '#0d121b' }}>
            {isGuest ? getGreeting() : `${getGreeting()}, ${userName ? userName.split(' ')[0] : 'User'}`}
          </Text>
        </View>
        <TouchableOpacity 
          style={{
            width: 44,
            height: 44,
            borderRadius: 22,
            backgroundColor: 'white',
            alignItems: 'center',
            justifyContent: 'center',
            shadowColor: '#000',
            shadowOffset: { width: 0, height: 1 },
            shadowOpacity: 0.1,
            shadowRadius: 2,
            elevation: 2,
            position: 'relative',
          }}
          onPress={() => setShowApprovalModal(true)}
        >
          <Ionicons name="notifications-outline" size={24} color="#EA2831" />
          {hasPendingTransactions && (
            <View style={{
              position: 'absolute',
              top: 6,
              right: 6,
              minWidth: 18,
              height: 18,
              borderRadius: 9,
              backgroundColor: '#10b981',
              borderWidth: 2,
              borderColor: 'white',
              alignItems: 'center',
              justifyContent: 'center',
              paddingHorizontal: 4,
            }}>
              <Text style={{ fontSize: 10, fontWeight: 'bold', color: 'white' }}>{pendingCount}</Text>
            </View>
          )}
        </TouchableOpacity>
      </View>

      <ScrollView 
        style={{ flex: 1, paddingHorizontal: 16, paddingTop: 8 }} 
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        {/* Income/Expense Cards */}
        <View style={{ flexDirection: 'row', gap: 12, marginBottom: 24 }}>
          <View style={{
            flex: 1,
            backgroundColor: 'white',
            borderRadius: 16,
            padding: 16,
            height: 112,
            justifyContent: 'space-between',
            shadowColor: '#000',
            shadowOffset: { width: 0, height: 1 },
            shadowOpacity: 0.05,
            shadowRadius: 2,
            elevation: 1,
          }}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
              <View style={{
                width: 32,
                height: 32,
                borderRadius: 16,
                backgroundColor: '#dcfce7',
                alignItems: 'center',
                justifyContent: 'center',
              }}>
                <Ionicons name="arrow-down" size={16} color="#10b981" />
              </View>
              <Text style={{ fontSize: 12, fontWeight: '600', color: '#64748b' }}>Income</Text>
            </View>
            <AnimatedNumber value={totalIncome.toFixed(2)} />
            <Text style={{ fontSize: 10, fontWeight: '500', color: '#10b981' }}>
              {(() => {
                const { incomeChange } = getMonthlyComparison();
                const sign = incomeChange >= 0 ? '+' : '';
                return `${sign}${incomeChange.toFixed(0)}% vs last month`;
              })()}
            </Text>
          </View>
          
          <View style={{
            flex: 1,
            backgroundColor: 'white',
            borderRadius: 16,
            padding: 16,
            height: 112,
            justifyContent: 'space-between',
            shadowColor: '#000',
            shadowOffset: { width: 0, height: 1 },
            shadowOpacity: 0.05,
            shadowRadius: 2,
            elevation: 1,
          }}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
              <View style={{
                width: 32,
                height: 32,
                borderRadius: 16,
                backgroundColor: 'rgba(234, 40, 49, 0.1)',
                alignItems: 'center',
                justifyContent: 'center',
              }}>
                <Ionicons name="arrow-up" size={16} color="#EA2831" />
              </View>
              <Text style={{ fontSize: 12, fontWeight: '600', color: '#64748b' }}>Expense</Text>
            </View>
            <AnimatedNumber value={totalExpenses.toFixed(2)} />
            <Text style={{ fontSize: 10, fontWeight: '500', color: '#EA2831' }}>
              {(() => {
                const { expenseChange } = getMonthlyComparison();
                const sign = expenseChange >= 0 ? '+' : '';
                return `${sign}${expenseChange.toFixed(0)}% vs last month`;
              })()}
            </Text>
          </View>
        </View>

        <CategoryBreakdown 
          categoryBreakdown={categoryBreakdown}
          incomeBreakdown={incomeBreakdown}
          totalExpenses={totalExpenses}
          totalIncome={totalIncome}
          categoryIcons={categoryIcons}
          categoryColors={categoryColors}
        />

        <SpendingTrends transactions={transactions} />

        <PaymentMethods transactions={transactions} />

        {/* Recent Transactions */}
        <View style={{ marginBottom: 200 }}>
          <View style={{
            flexDirection: 'row',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: 16,
            paddingHorizontal: 4,
          }}>
            <Text style={{ fontSize: 18, fontWeight: 'bold', color: '#0d121b' }}>Recent Transactions</Text>
            <TouchableOpacity onPress={() => router.push('/transactions')}>
              <Text style={{ fontSize: 14, fontWeight: 'bold', color: '#EA2831' }}>See All</Text>
            </TouchableOpacity>
          </View>
          
          <View style={{ gap: 12 }}>
            {recentTransactions.length > 0 ? recentTransactions.map((transaction) => (
              <TransactionCard
                key={transaction.id}
                transaction={transaction}
                categoryIcons={categoryIcons}
                categoryColors={categoryColors}
                onEdit={() => handleEditTransaction(transaction)}
                onDuplicate={() => handleDuplicateTransaction(transaction)}
                onDelete={() => handleDeleteTransaction(transaction.id)}
              />
            )) : (
              <View style={{
                backgroundColor: 'white',
                borderRadius: 12,
                padding: 40,
                paddingVertical: 100,
                alignItems: 'center',
                shadowColor: '#000',
                shadowOffset: { width: 0, height: 1 },
                shadowOpacity: 0.05,
                shadowRadius: 2,
                elevation: 1,
              }}>
                <Ionicons name="receipt-outline" size={48} color="#94a3b8" />
                <Text style={{ fontSize: 16, fontWeight: 'bold', color: '#64748b', marginTop: 12 }}>No transactions yet</Text>
                <Text style={{ fontSize: 14, color: '#94a3b8', textAlign: 'center', marginTop: 4 }}>Add your first transaction to get started</Text>
              </View>
            )}
          </View>
        </View>
      </ScrollView>

      {/* Floating Action Button */}
      <TouchableOpacity 
        style={{
          position: 'absolute',
          bottom: 125,
          right: 16,
          width: 56,
          height: 56,
          borderRadius: 28,
          backgroundColor: '#EA2831',
          alignItems: 'center',
          justifyContent: 'center',
          shadowColor: '#EA2831',
          shadowOffset: { width: 0, height: 4 },
          shadowOpacity: 0.4,
          shadowRadius: 8,
          elevation: 8,
        }}
        onPress={() => setShowAddModal(true)}
      >
        <Ionicons name="add" size={28} color="white" />
      </TouchableOpacity>

      <TransactionModal 
        visible={showAddModal} 
        onClose={() => setShowAddModal(false)}
        onTransactionAdded={loadTransactionData}
      />
      
      <TransactionModal 
        visible={showEditModal} 
        onClose={() => {
          setShowEditModal(false);
          setSelectedTransaction(null);
        }}
        transaction={selectedTransaction || undefined}
        onTransactionUpdated={() => {
          loadTransactionData();
          setShowEditModal(false);
          setSelectedTransaction(null);
        }}
      />
      
      <TransactionApprovalModal 
        visible={showApprovalModal} 
        onClose={() => {
          setShowApprovalModal(false);
          loadTransactionData();
        }} 
      />
      
      {showDeleteConfirm && (
        <View style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(0, 0, 0, 0.5)',
          alignItems: 'center',
          justifyContent: 'center',
        }}>
          <View style={{
            backgroundColor: 'white',
            borderRadius: 24,
            padding: 32,
            width: '85%',
            maxWidth: 400,
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
            <Text style={{ fontSize: 22, fontWeight: 'bold', color: '#111827', textAlign: 'center', marginBottom: 8 }}>Delete Transaction?</Text>
            <Text style={{ fontSize: 14, color: '#6b7280', textAlign: 'center', marginBottom: 28, lineHeight: 20 }}>This action cannot be undone. This transaction will be permanently removed.</Text>
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
                onPress={confirmDelete}
              >
                <Text style={{ fontSize: 16, fontWeight: 'bold', color: 'white' }}>Delete</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      )}
      
      {showDuplicateConfirm && (
        <View style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(0, 0, 0, 0.5)',
          alignItems: 'center',
          justifyContent: 'center',
        }}>
          <View style={{
            backgroundColor: 'white',
            borderRadius: 24,
            padding: 32,
            width: '85%',
            maxWidth: 400,
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
            <Text style={{ fontSize: 22, fontWeight: 'bold', color: '#111827', textAlign: 'center', marginBottom: 8 }}>Duplicate Transaction?</Text>
            <Text style={{ fontSize: 14, color: '#6b7280', textAlign: 'center', marginBottom: 28, lineHeight: 20 }}>A copy of this transaction will be created with today's date and time.</Text>
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
          </View>
        </View>
      )}
    </SafeAreaView>
  );
}