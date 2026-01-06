import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { router, useLocalSearchParams } from 'expo-router';
import TransactionModal from '../../components/drawers/TransactionModal';
import { TransactionService, Transaction } from '../../services/TransactionService';

export default function TransactionDetailsScreen() {
  const [showEditModal, setShowEditModal] = useState(false);
  const [transaction, setTransaction] = useState<Transaction | null>(null);
  const [recentHistory, setRecentHistory] = useState<Transaction[]>([]);
  const [monthlyTotal, setMonthlyTotal] = useState(0);
  const [weeklyData, setWeeklyData] = useState<number[]>([]);
  const { id } = useLocalSearchParams();

  useEffect(() => {
    loadTransaction();
  }, [id]);

  const loadTransaction = async () => {
    if (!id) return;
    
    try {
      const transactions = await TransactionService.getTransactions();
      const foundTransaction = transactions.find(t => t.id === id);
      setTransaction(foundTransaction || null);
      
      if (foundTransaction) {
        // Get recent history for same merchant
        const history = transactions
          .filter(t => t.merchant === foundTransaction.merchant && t.id !== foundTransaction.id)
          .slice(0, 3);
        setRecentHistory(history);
        
        // Calculate monthly total for same merchant
        const now = new Date();
        const thisMonth = new Date(now.getFullYear(), now.getMonth(), 1);
        const monthlyTransactions = transactions.filter(t => 
          t.merchant === foundTransaction.merchant && 
          new Date(t.timestamp) >= thisMonth
        );
        const total = monthlyTransactions.reduce((sum, t) => sum + parseFloat(t.amount), 0);
        setMonthlyTotal(total);
        
        // Generate weekly spending data for chart
        const weeklyData = [];
        for (let i = 6; i >= 0; i--) {
          const weekStart = new Date(now.getTime() - i * 7 * 24 * 60 * 60 * 1000);
          const weekEnd = new Date(weekStart.getTime() + 7 * 24 * 60 * 60 * 1000);
          const weekTransactions = transactions.filter(t => 
            t.merchant === foundTransaction.merchant &&
            new Date(t.timestamp) >= weekStart &&
            new Date(t.timestamp) < weekEnd
          );
          const weekTotal = weekTransactions.reduce((sum, t) => sum + parseFloat(t.amount), 0);
          weeklyData.push(weekTotal);
        }
        setWeeklyData(weeklyData);
      }
    } catch (error) {
      console.error('Error loading transaction:', error);
    }
  };

  const handleTransactionUpdated = () => {
    loadTransaction();
    setShowEditModal(false);
  };

  if (!transaction) {
    return (
      <SafeAreaView style={{ flex: 1, backgroundColor: '#f8f6f6', alignItems: 'center', justifyContent: 'center' }}>
        <Ionicons name="receipt-outline" size={64} color="#94a3b8" />
        <Text style={{ fontSize: 18, fontWeight: 'bold', color: '#64748b', marginTop: 16 }}>Transaction not found</Text>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#f8f6f6' }}>
      {/* Header */}
      <View style={{
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 16,
        paddingVertical: 16,
        backgroundColor: 'rgba(248, 246, 246, 0.9)',
      }}>
        <TouchableOpacity
          onPress={() => router.back()}
          style={{
            width: 40,
            height: 40,
            alignItems: 'center',
            justifyContent: 'center',
            borderRadius: 20,
          }}
        >
          <Ionicons name="chevron-back" size={24} color="#181111" />
        </TouchableOpacity>
        
        <Text style={{
          fontSize: 18,
          fontWeight: 'bold',
          color: '#181111',
          flex: 1,
          textAlign: 'center',
        }}>
          Transaction Details
        </Text>
        
        <TouchableOpacity 
          onPress={() => setShowEditModal(true)}
          style={{
          paddingHorizontal: 12,
          paddingVertical: 8,
          borderRadius: 20,
        }}>
          <Ionicons name="ellipsis-horizontal" size={24} color="#181111" />
        </TouchableOpacity>
      </View>

      <ScrollView style={{ flex: 1 }} showsVerticalScrollIndicator={false}>
        <View style={{ paddingHorizontal: 16, paddingBottom: 24, gap: 16 }}>
          {/* Amount Section */}
          <View style={{
            alignItems: 'center',
            justifyContent: 'center',
            paddingVertical: 24,
            gap: 4,
          }}>
            <Text style={{
              fontSize: 48,
              fontWeight: '800',
              color: transaction.type === 'income' ? '#10b981' : '#181111',
              lineHeight: 48,
              letterSpacing: -1,
            }}>
              {transaction.type === 'income' ? '+' : '-'}₹{transaction.amount}
            </Text>
            <Text style={{
              fontSize: 20,
              fontWeight: 'bold',
              color: '#886364',
              marginTop: 4,
            }}>
              {transaction.merchant}
            </Text>
            
            {/* Status Badge */}
            <View style={{
              flexDirection: 'row',
              alignItems: 'center',
              gap: 8,
              backgroundColor: 'rgba(34, 197, 94, 0.1)',
              borderWidth: 1,
              borderColor: 'rgba(34, 197, 94, 0.2)',
              paddingHorizontal: 12,
              paddingVertical: 4,
              borderRadius: 25,
              marginTop: 12,
            }}>
              <Ionicons name="checkmark-circle" size={16} color="#22c55e" />
              <Text style={{
                fontSize: 10,
                fontWeight: 'bold',
                color: '#15803d',
                textTransform: 'uppercase',
                letterSpacing: 1.5,
              }}>
                Completed
              </Text>
            </View>
          </View>

          {/* Details Section */}
          <View style={{
            backgroundColor: 'white',
            borderRadius: 24,
            padding: 20,
            shadowColor: '#000',
            shadowOffset: { width: 0, height: 1 },
            shadowOpacity: 0.05,
            shadowRadius: 4,
            elevation: 2,
            borderWidth: 1,
            borderColor: 'rgba(0, 0, 0, 0.05)',
          }}>
            <Text style={{
              fontSize: 12,
              fontWeight: 'bold',
              color: '#886364',
              textTransform: 'uppercase',
              letterSpacing: 1.5,
              marginBottom: 16,
            }}>
              Details
            </Text>
            
            <View style={{ gap: 20 }}>
              {/* Date & Time */}
              <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
                  <View style={{
                    padding: 8,
                    backgroundColor: '#f8f6f6',
                    borderRadius: 20,
                  }}>
                    <Ionicons name="calendar-outline" size={20} color="#181111" style={{ opacity: 0.7 }} />
                  </View>
                  <Text style={{ fontSize: 14, fontWeight: '500', color: '#886364' }}>Date & Time</Text>
                </View>
                <Text style={{ fontSize: 16, fontWeight: 'bold', color: '#181111' }}>{new Date(transaction.timestamp).toLocaleDateString('en-US', { month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit' })}</Text>
              </View>

              {/* Category */}
              <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
                  <View style={{
                    padding: 8,
                    backgroundColor: '#f8f6f6',
                    borderRadius: 20,
                  }}>
                    <Ionicons name="restaurant" size={20} color="#181111" style={{ opacity: 0.7 }} />
                  </View>
                  <Text style={{ fontSize: 14, fontWeight: '500', color: '#886364' }}>Category</Text>
                </View>
                <Text style={{ fontSize: 16, fontWeight: 'bold', color: '#181111' }}>{transaction.category}</Text>
              </View>

              {/* Payment Method */}
              <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
                  <View style={{
                    padding: 8,
                    backgroundColor: '#f8f6f6',
                    borderRadius: 20,
                  }}>
                    <Ionicons name="card" size={20} color="#181111" style={{ opacity: 0.7 }} />
                  </View>
                  <Text style={{ fontSize: 14, fontWeight: '500', color: '#886364' }}>Payment</Text>
                </View>
                <Text style={{ fontSize: 16, fontWeight: 'bold', color: '#181111' }}>{transaction.paymentMethod || 'Unknown'}</Text>
              </View>
            </View>

            {/* Divider */}
            <View style={{
              height: 1,
              backgroundColor: 'rgba(0, 0, 0, 0.05)',
              marginVertical: 20,
            }} />

            {/* Note */}
            {transaction.notes ? (
              <TouchableOpacity style={{ position: 'relative' }}>
                <View style={{ flexDirection: 'row', gap: 12, alignItems: 'flex-start' }}>
                  <Ionicons name="create-outline" size={20} color="#886364" style={{ marginTop: 2 }} />
                  <Text style={{
                    fontSize: 14,
                    fontWeight: '500',
                    color: '#181111',
                    lineHeight: 20,
                    flex: 1,
                  }}>
                    {transaction.notes}
                  </Text>
                </View>
              </TouchableOpacity>
            ) : (
              <TouchableOpacity 
                style={{ position: 'relative' }}
                onPress={() => setShowEditModal(true)}
              >
                <View style={{ flexDirection: 'row', gap: 12, alignItems: 'center' }}>
                  <Ionicons name="add-circle-outline" size={20} color="#9ca3af" style={{ marginTop: 2 }} />
                  <Text style={{
                    fontSize: 14,
                    fontWeight: '500',
                    color: '#9ca3af',
                    fontStyle: 'italic',
                  }}>
                    Add a note...
                  </Text>
                </View>
              </TouchableOpacity>
            )}
          </View>

          {/* Spending Insights */}
          <View style={{
            backgroundColor: 'white',
            borderRadius: 24,
            padding: 20,
            shadowColor: '#000',
            shadowOffset: { width: 0, height: 1 },
            shadowOpacity: 0.05,
            shadowRadius: 4,
            elevation: 2,
            borderWidth: 1,
            borderColor: 'rgba(0, 0, 0, 0.05)',
          }}>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 16 }}>
              <View>
                <Text style={{
                  fontSize: 12,
                  fontWeight: 'bold',
                  color: '#886364',
                  textTransform: 'uppercase',
                  letterSpacing: 1.5,
                }}>
                  Spending Insights
                </Text>
                <Text style={{
                  fontSize: 14,
                  fontWeight: '600',
                  color: '#181111',
                  marginTop: 4,
                }}>
                  This Month with {transaction.merchant}
                </Text>
              </View>
              <Text style={{
                fontSize: 24,
                fontWeight: '800',
                color: '#EA2831',
              }}>
                ₹{monthlyTotal.toFixed(2)}
              </Text>
            </View>

            {/* Chart */}
            <View style={{
              height: 96,
              flexDirection: 'row',
              alignItems: 'flex-end',
              justifyContent: 'space-between',
              gap: 8,
              paddingHorizontal: 4,
            }}>
              {weeklyData.map((amount, index) => {
                const maxAmount = Math.max(...weeklyData, 1);
                const height = maxAmount > 0 ? `${(amount / maxAmount) * 100}%` : '0%';
                const isCurrentWeek = index === weeklyData.length - 1;
                
                return (
                  <View key={index} style={{ flex: 1, alignItems: 'center', height: '100%', justifyContent: 'flex-end' }}>
                    <View style={{
                      width: '100%',
                      height: height,
                      backgroundColor: isCurrentWeek ? '#EA2831' : 'rgba(234, 40, 49, 0.1)',
                      borderTopLeftRadius: 2,
                      borderTopRightRadius: 2,
                      minHeight: amount > 0 ? 4 : 0,
                    }} />
                  </View>
                );
              })}
            </View>
            
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginTop: 8 }}>
              <Text style={{ fontSize: 10, fontWeight: '500', color: '#886364', textTransform: 'uppercase', letterSpacing: 1 }}>Oct 1</Text>
              <Text style={{ fontSize: 10, fontWeight: '500', color: '#886364', textTransform: 'uppercase', letterSpacing: 1 }}>Oct 24</Text>
            </View>
          </View>

          {/* Recent History */}
          <View style={{
            backgroundColor: 'white',
            borderRadius: 24,
            padding: 20,
            shadowColor: '#000',
            shadowOffset: { width: 0, height: 1 },
            shadowOpacity: 0.05,
            shadowRadius: 4,
            elevation: 2,
            borderWidth: 1,
            borderColor: 'rgba(0, 0, 0, 0.05)',
          }}>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
              <Text style={{
                fontSize: 12,
                fontWeight: 'bold',
                color: '#886364',
                textTransform: 'uppercase',
                letterSpacing: 1.5,
              }}>
                Recent History
              </Text>
              <TouchableOpacity>
                <Text style={{ fontSize: 12, fontWeight: 'bold', color: '#EA2831' }}>View All</Text>
              </TouchableOpacity>
            </View>
            
            <View style={{ gap: 0 }}>
              {recentHistory.length > 0 ? recentHistory.map((historyTransaction, index) => (
                <TouchableOpacity 
                  key={historyTransaction.id} 
                  onPress={() => router.push(`/transactions/details?id=${historyTransaction.id}`)}
                  style={{
                  flexDirection: 'row',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  paddingVertical: 12,
                  borderBottomWidth: index < recentHistory.length - 1 ? 1 : 0,
                  borderBottomColor: 'rgba(0, 0, 0, 0.05)',
                }}>
                  <View>
                    <Text style={{ fontSize: 14, fontWeight: 'bold', color: '#181111' }}>{historyTransaction.merchant}</Text>
                    <Text style={{ fontSize: 12, color: '#886364' }}>{new Date(historyTransaction.timestamp).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} • {historyTransaction.category}</Text>
                  </View>
                  <Text style={{ fontSize: 14, fontWeight: 'bold', color: '#181111' }}>{historyTransaction.type === 'income' ? '+' : '-'}₹{historyTransaction.amount}</Text>
                </TouchableOpacity>
              )) : (
                <View style={{ paddingVertical: 20, alignItems: 'center' }}>
                  <Ionicons name="time-outline" size={32} color="#d1d5db" />
                  <Text style={{ fontSize: 14, color: '#9ca3af', marginTop: 8 }}>No recent transactions</Text>
                  <Text style={{ fontSize: 12, color: '#d1d5db', marginTop: 2 }}>with {transaction.merchant}</Text>
                </View>
              )}
            </View>
          </View>
        </View>
      </ScrollView>
      
      {/* Floating Edit Button */}
      <TouchableOpacity
        style={{
          position: 'absolute',
          bottom: 32,
          right: 24,
          width: 56,
          height: 56,
          backgroundColor: '#EA2831',
          borderRadius: 28,
          alignItems: 'center',
          justifyContent: 'center',
          shadowColor: '#EA2831',
          shadowOffset: { width: 0, height: 4 },
          shadowOpacity: 0.3,
          shadowRadius: 15,
          elevation: 8,
        }}
        onPress={() => setShowEditModal(true)}
      >
        <Ionicons name="pencil" size={24} color="white" />
      </TouchableOpacity>
      
      <TransactionModal 
        visible={showEditModal} 
        onClose={() => setShowEditModal(false)}
        transaction={transaction}
        onTransactionUpdated={handleTransactionUpdated}
      />
    </SafeAreaView>
  );
}