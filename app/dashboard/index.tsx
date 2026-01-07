import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { RefreshControl, ScrollView, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import CategoryBreakdown from '../../components/CategoryBreakdown';
import TransactionApprovalModal from '../../components/drawers/TransactionApprovalModal';
import TransactionModal from '../../components/drawers/TransactionModal';
import PaymentMethods from '../../components/PaymentMethods';
import SpendingTrends from '../../components/SpendingTrends';
import TransactionCard from '../../components/TransactionCard';
import { CategoryService } from '../../services/CategoryService';
import { Transaction, TransactionService } from '../../services/TransactionService';

const AnimatedNumber = ({ value, prefix = '₹', suffix = '' }) => {
  return (
    <Text style={{ fontSize: 20, fontWeight: 'bold', color: '#0d121b' }}>
      {prefix}{value}{suffix}
    </Text>
  );
};

export default function DashboardIndex() {
  const [showAddModal, setShowAddModal] = useState(false);
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
  
  useEffect(() => {
    const now = new Date();
    setCurrentDate(now.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' }));
    loadTransactionData();
  }, []);

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
    await loadTransactionData();
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
      {/* Header */}
      <View style={{
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: 16,
        paddingVertical: 16,
        paddingTop: 32,
        backgroundColor: 'rgba(248, 246, 246, 0.9)',
      }}>
        <View>
          <Text style={{ fontSize: 14, color: '#64748b', fontWeight: '500' }}>{currentDate}</Text>
          <Text style={{ fontSize: 20, fontWeight: 'bold', color: '#0d121b' }}>Good Morning, Pratik</Text>
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
          <View style={{
            position: 'absolute',
            top: 8,
            right: 8,
            width: 10,
            height: 10,
            borderRadius: 5,
            backgroundColor: '#10b981',
            borderWidth: 2,
            borderColor: 'white',
          }} />
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
      
      <TransactionApprovalModal 
        visible={showApprovalModal} 
        onClose={() => setShowApprovalModal(false)} 
      />
    </SafeAreaView>
  );
}