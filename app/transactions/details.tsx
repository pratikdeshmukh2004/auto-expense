import React, { useState } from 'react';
import { View, Text, TouchableOpacity, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { router, useLocalSearchParams } from 'expo-router';
import { TransactionModal } from '../../components/modals';
import { Shimmer } from '../../components/animations';
import { Transaction } from '../../services/TransactionService';
import { useTransactions } from '../../hooks/useQueries';
import { useTheme } from '../../providers/ThemeProvider';

export default function TransactionDetailsScreen() {
  const { colors } = useTheme();
  const [showEditModal, setShowEditModal] = useState(false);
  const [showAllHistory, setShowAllHistory] = useState(false);
  const { id } = useLocalSearchParams();
  
  // Use TanStack Query to get transactions
  const { data: transactions = [], isLoading } = useTransactions();
  
  // Find the specific transaction
  const transaction = transactions.find(t => t.id === id) || null;
  
  // Calculate derived data
  const recentHistory = transaction ? transactions
    .filter(t => t.merchant === transaction.merchant && t.id !== transaction.id)
    .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
    : [];
    
  const yearlyTotal = transaction ? (() => {
    const now = new Date();
    const startOfYear = new Date(now.getFullYear(), 0, 1);
    const yearlyTransactions = transactions.filter(t => 
      t.merchant === transaction.merchant && 
      new Date(t.timestamp) >= startOfYear
    );
    return yearlyTransactions.reduce((sum, t) => sum + parseFloat(t.amount), 0);
  })() : 0;
  
  const monthlyData = transaction ? (() => {
    const now = new Date();
    const data = [];
    for (let i = 0; i < 12; i++) {
      const monthStart = new Date(now.getFullYear(), i, 1);
      const monthEnd = new Date(now.getFullYear(), i + 1, 0);
      const monthTransactions = transactions.filter(t => 
        t.merchant === transaction.merchant &&
        new Date(t.timestamp) >= monthStart &&
        new Date(t.timestamp) <= monthEnd
      );
      const monthTotal = monthTransactions.reduce((sum, t) => sum + parseFloat(t.amount), 0);
      data.push(monthTotal);
    }
    return data;
  })() : [];

  const merchantSummary = transaction ? (() => {
    const now = new Date();
    const merchantTxns = transactions.filter(t => t.merchant === transaction.merchant);
    const totalPaid = merchantTxns.reduce((sum, t) => sum + parseFloat(t.amount), 0);
    const thisMonthPaid = merchantTxns
      .filter(t => { const d = new Date(t.timestamp); return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear(); })
      .reduce((sum, t) => sum + parseFloat(t.amount), 0);
    const lm = now.getMonth() === 0 ? 11 : now.getMonth() - 1;
    const ly = now.getMonth() === 0 ? now.getFullYear() - 1 : now.getFullYear();
    const lastMonthPaid = merchantTxns
      .filter(t => { const d = new Date(t.timestamp); return d.getMonth() === lm && d.getFullYear() === ly; })
      .reduce((sum, t) => sum + parseFloat(t.amount), 0);
    const thisYearPaid = merchantTxns
      .filter(t => new Date(t.timestamp).getFullYear() === now.getFullYear())
      .reduce((sum, t) => sum + parseFloat(t.amount), 0);
    return { totalPaid, thisMonthPaid, lastMonthPaid, thisYearPaid, totalCount: merchantTxns.length };
  })() : { totalPaid: 0, thisMonthPaid: 0, lastMonthPaid: 0, thisYearPaid: 0, totalCount: 0 };

  const handleTransactionUpdated = () => {
    setShowEditModal(false);
  };

  if (!transaction && !isLoading) {
    return (
      <SafeAreaView style={{ flex: 1, backgroundColor: colors.background, alignItems: 'center', justifyContent: 'center' }}>
        <Ionicons name="receipt-outline" size={64} color="#94a3b8" />
        <Text style={{ fontSize: 18, fontWeight: 'bold', color: colors.textSecondary, marginTop: 16 }}>Transaction not found</Text>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.background }}>
      {/* Header */}
      <View style={{
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 16,
        paddingVertical: 16,
        backgroundColor: colors.background,
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
          <Ionicons name="chevron-back" size={24} color={colors.text} />
        </TouchableOpacity>
        
        <Text style={{
          fontSize: 18,
          fontWeight: 'bold',
          color: colors.text,
          flex: 1,
          textAlign: 'center',
        }}>
          Transaction Details
        </Text>
        
        <TouchableOpacity 
          style={{
          paddingHorizontal: 12,
          paddingVertical: 8,
          borderRadius: 20,
        }}>
          <View style={{ width: 24 }} />
        </TouchableOpacity>
      </View>

      <ScrollView style={{ flex: 1 }} showsVerticalScrollIndicator={false}>
        {isLoading ? (
          <View style={{ paddingHorizontal: 16, paddingBottom: 24, gap: 16 }}>
            {/* Amount Section Shimmer */}
            <View style={{ alignItems: 'center', paddingVertical: 24, gap: 8 }}>
              <Shimmer width={200} height={48} borderRadius={8} />
              <Shimmer width={150} height={20} borderRadius={8} />
              <Shimmer width={80} height={24} borderRadius={12} style={{ marginTop: 12 }} />
            </View>
            
            {/* Details Section Shimmer */}
            <View style={{ backgroundColor: colors.card, borderRadius: 24, padding: 20 }}>
              <Shimmer width={60} height={12} borderRadius={6} style={{ marginBottom: 16 }} />
              <View style={{ gap: 20 }}>
                <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                  <Shimmer width={100} height={16} borderRadius={8} />
                  <Shimmer width={80} height={16} borderRadius={8} />
                </View>
                <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                  <Shimmer width={80} height={16} borderRadius={8} />
                  <Shimmer width={60} height={16} borderRadius={8} />
                </View>
                <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                  <Shimmer width={70} height={16} borderRadius={8} />
                  <Shimmer width={50} height={16} borderRadius={8} />
                </View>
              </View>
            </View>
            
            {/* Insights Section Shimmer */}
            <View style={{ backgroundColor: colors.card, borderRadius: 24, padding: 20 }}>
              <Shimmer width={120} height={12} borderRadius={6} style={{ marginBottom: 16 }} />
              <Shimmer width="100%" height={96} borderRadius={8} />
            </View>
            
            {/* History Section Shimmer */}
            <View style={{ backgroundColor: colors.card, borderRadius: 24, padding: 20 }}>
              <Shimmer width={100} height={12} borderRadius={6} style={{ marginBottom: 16 }} />
              <Shimmer width="100%" height={60} borderRadius={8} style={{ marginBottom: 12 }} />
              <Shimmer width="100%" height={60} borderRadius={8} />
            </View>
          </View>
        ) : (
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
              color: transaction.type === 'income' ? '#10b981' : colors.text,
              lineHeight: 48,
              letterSpacing: -1,
            }}>
              {transaction.type === 'income' ? '+' : '-'}₹{transaction.amount}
            </Text>
            <Text style={{
              fontSize: 20,
              fontWeight: 'bold',
              color: colors.textSecondary,
              marginTop: 4,
            }} numberOfLines={1} ellipsizeMode="tail">
              {transaction.merchant}
            </Text>
          </View>

          {/* Details Section */}
          <View style={{
            backgroundColor: colors.card,
            borderRadius: 24,
            padding: 20,
            shadowColor: '#000',
            shadowOffset: { width: 0, height: 1 },
            shadowOpacity: 0.05,
            shadowRadius: 4,
            elevation: 2,
            borderWidth: 1,
            borderColor: colors.border,
          }}>
            <Text style={{
              fontSize: 12,
              fontWeight: 'bold',
              color: colors.textSecondary,
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
                    backgroundColor: colors.chipBg,
                    borderRadius: 20,
                  }}>
                    <Ionicons name="calendar-outline" size={20} color={colors.text} style={{ opacity: 0.7 }} />
                  </View>
                  <Text style={{ fontSize: 14, fontWeight: '500', color: colors.textSecondary }}>Date & Time</Text>
                </View>
                <Text style={{ fontSize: 16, fontWeight: 'bold', color: colors.text }}>{new Date(transaction.timestamp).toLocaleDateString('en-US', { month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit' })}</Text>
              </View>

              {/* Category */}
              <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
                  <View style={{
                    padding: 8,
                    backgroundColor: colors.chipBg,
                    borderRadius: 20,
                  }}>
                    <Ionicons name="restaurant" size={20} color={colors.text} style={{ opacity: 0.7 }} />
                  </View>
                  <Text style={{ fontSize: 14, fontWeight: '500', color: colors.textSecondary }}>Category</Text>
                </View>
                <Text style={{ fontSize: 16, fontWeight: 'bold', color: colors.text }}>{transaction.category}</Text>
              </View>

              {/* Payment Method */}
              <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
                  <View style={{
                    padding: 8,
                    backgroundColor: colors.chipBg,
                    borderRadius: 20,
                  }}>
                    <Ionicons name="card" size={20} color={colors.text} style={{ opacity: 0.7 }} />
                  </View>
                  <Text style={{ fontSize: 14, fontWeight: '500', color: colors.textSecondary }}>Payment</Text>
                </View>
                <Text style={{ fontSize: 16, fontWeight: 'bold', color: colors.text }}>{transaction.paymentMethod || 'Unknown'}</Text>
              </View>

              {/* Sender */}
              {transaction.sender && (
                <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                  <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
                    <View style={{
                      padding: 8,
                      backgroundColor: colors.chipBg,
                      borderRadius: 20,
                    }}>
                      <Ionicons name="mail" size={20} color={colors.text} style={{ opacity: 0.7 }} />
                    </View>
                    <Text style={{ fontSize: 14, fontWeight: '500', color: colors.textSecondary }}>Sender</Text>
                  </View>
                  <View style={{ flex: 1, alignItems: 'flex-end', paddingLeft: 12 }}>
                    <Text style={{ fontSize: 14, fontWeight: 'bold', color: colors.text }} numberOfLines={1}>{transaction.sender.split('<')[0].trim()}</Text>
                    <Text style={{ fontSize: 11, color: colors.textSecondary, marginTop: 2 }} numberOfLines={1}>{transaction.sender.match(/<(.+)>/)?.[1] || transaction.sender}</Text>
                  </View>
                </View>
              )}
            </View>

            {/* Divider */}
            <View style={{
              height: 1,
              backgroundColor: colors.border,
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
                    color: colors.text,
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
                    color: colors.textMuted,
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
            backgroundColor: colors.card,
            borderRadius: 24,
            padding: 20,
            shadowColor: '#000',
            shadowOffset: { width: 0, height: 1 },
            shadowOpacity: 0.05,
            shadowRadius: 4,
            elevation: 2,
            borderWidth: 1,
            borderColor: colors.border,
          }}>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 16 }}>
              <View style={{ flex: 1 }}>
                <Text style={{
                  fontSize: 12,
                  fontWeight: 'bold',
                  color: colors.textSecondary,
                  textTransform: 'uppercase',
                  letterSpacing: 1.5,
                }}>
                  Spending Insights
                </Text>
                <Text style={{
                  fontSize: 14,
                  fontWeight: '600',
                  color: colors.text,
                  marginTop: 4,
                }}>
                  This Year with {transaction.merchant}
                </Text>
              </View>
              <Text style={{
                fontSize: 18,
                fontWeight: '800',
                color: '#EA2831',
              }} numberOfLines={1} adjustsFontSizeToFit>
                ₹{yearlyTotal % 1 === 0 ? yearlyTotal.toLocaleString("en-IN") : yearlyTotal.toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </Text>
            </View>

            {/* Chart */}
            <View style={{
              height: 96,
              flexDirection: 'row',
              alignItems: 'flex-end',
              justifyContent: 'space-between',
              gap: 4,
              paddingHorizontal: 4,
            }}>
              {monthlyData.map((amount, index) => {
                const maxAmount = Math.max(...monthlyData, 1);
                const height = maxAmount > 0 ? `${(amount / maxAmount) * 100}%` : '0%';
                const isCurrentMonth = index === new Date().getMonth();
                
                return (
                  <View key={index} style={{ flex: 1, alignItems: 'center', height: '100%', justifyContent: 'flex-end' }}>
                    <View style={{
                      width: 8,
                      height: height,
                      backgroundColor: isCurrentMonth ? '#EA2831' : 'rgba(234, 40, 49, 0.15)',
                      borderRadius: 4,
                      minHeight: amount > 0 ? 4 : 0,
                    }} />
                  </View>
                );
              })}
            </View>
            
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginTop: 8 }}>
              {['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'].map((m, i) => (
                <Text key={m} style={{ fontSize: 8, fontWeight: i === new Date().getMonth() ? 'bold' : '500', color: i === new Date().getMonth() ? '#0d121b' : '#886364' }}>{m}</Text>
              ))}
            </View>
          </View>

          {/* Merchant Summary */}
          <View style={{
            backgroundColor: colors.card,
            borderRadius: 24,
            padding: 20,
            shadowColor: '#000',
            shadowOffset: { width: 0, height: 1 },
            shadowOpacity: 0.05,
            shadowRadius: 4,
            elevation: 2,
            borderWidth: 1,
            borderColor: colors.border,
          }}>
            <Text style={{
              fontSize: 12,
              fontWeight: 'bold',
              color: colors.textSecondary,
              textTransform: 'uppercase',
              letterSpacing: 1.5,
              marginBottom: 16,
            }}>
              Summary • {transaction.merchant}
            </Text>

            <View style={{ gap: 14 }}>
              <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                <Text style={{ fontSize: 13, fontWeight: '500', color: colors.textSecondary }}>Total Paid ({merchantSummary.totalCount} txns)</Text>
                <Text style={{ fontSize: 15, fontWeight: '800', color: colors.text }} numberOfLines={1} adjustsFontSizeToFit>
                  ₹{merchantSummary.totalPaid % 1 === 0 ? merchantSummary.totalPaid.toLocaleString('en-IN') : merchantSummary.totalPaid.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </Text>
              </View>
              <View style={{ height: 1, backgroundColor: colors.border }} />
              <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                <Text style={{ fontSize: 13, fontWeight: '500', color: colors.textSecondary }}>This Year</Text>
                <Text style={{ fontSize: 14, fontWeight: '700', color: colors.text }} numberOfLines={1} adjustsFontSizeToFit>
                  ₹{merchantSummary.thisYearPaid % 1 === 0 ? merchantSummary.thisYearPaid.toLocaleString('en-IN') : merchantSummary.thisYearPaid.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </Text>
              </View>
              <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                <Text style={{ fontSize: 13, fontWeight: '500', color: colors.textSecondary }}>This Month</Text>
                <Text style={{ fontSize: 14, fontWeight: '700', color: colors.text }} numberOfLines={1} adjustsFontSizeToFit>
                  ₹{merchantSummary.thisMonthPaid % 1 === 0 ? merchantSummary.thisMonthPaid.toLocaleString('en-IN') : merchantSummary.thisMonthPaid.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </Text>
              </View>
              <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                <Text style={{ fontSize: 13, fontWeight: '500', color: colors.textSecondary }}>Last Month</Text>
                <Text style={{ fontSize: 14, fontWeight: '700', color: colors.text }} numberOfLines={1} adjustsFontSizeToFit>
                  ₹{merchantSummary.lastMonthPaid % 1 === 0 ? merchantSummary.lastMonthPaid.toLocaleString('en-IN') : merchantSummary.lastMonthPaid.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </Text>
              </View>
            </View>
          </View>

          {/* Recent History */}
          <View style={{
            backgroundColor: colors.card,
            borderRadius: 24,
            padding: 20,
            shadowColor: '#000',
            shadowOffset: { width: 0, height: 1 },
            shadowOpacity: 0.05,
            shadowRadius: 4,
            elevation: 2,
            borderWidth: 1,
            borderColor: colors.border,
          }}>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
              <Text style={{
                fontSize: 12,
                fontWeight: 'bold',
                color: colors.textSecondary,
                textTransform: 'uppercase',
                letterSpacing: 1.5,
              }}>
                Recent History ({recentHistory.length})
              </Text>
            </View>
            
            <View style={{ gap: 0 }}>
              {recentHistory.length > 0 ? (showAllHistory ? recentHistory : recentHistory.slice(0, 5)).map((historyTransaction, index) => (
                <TouchableOpacity 
                  key={historyTransaction.id} 
                  onPress={() => router.push(`/transactions/details?id=${historyTransaction.id}`)}
                  style={{
                  flexDirection: 'row',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  paddingVertical: 12,
                  borderBottomWidth: index < (showAllHistory ? recentHistory.length : Math.min(recentHistory.length, 5)) - 1 ? 1 : 0,
                  borderBottomColor: colors.border,
                }}>
                  <View style={{ flex: 1 }}>
                    <Text style={{ fontSize: 14, fontWeight: 'bold', color: colors.text }} numberOfLines={1} ellipsizeMode="tail">{historyTransaction.merchant}</Text>
                    <Text style={{ fontSize: 12, color: colors.textSecondary }}>{new Date(historyTransaction.timestamp).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} • {historyTransaction.category}</Text>
                  </View>
                  <Text style={{ fontSize: 14, fontWeight: 'bold', color: colors.text }}>{historyTransaction.type === 'income' ? '+' : '-'}₹{historyTransaction.amount}</Text>
                </TouchableOpacity>
              )) : (
                <View style={{ paddingVertical: 20, alignItems: 'center' }}>
                  <Ionicons name="time-outline" size={32} color="#d1d5db" />
                  <Text style={{ fontSize: 14, color: colors.textMuted, marginTop: 8 }}>No recent transactions</Text>
                  <Text style={{ fontSize: 12, color: colors.textMuted, marginTop: 2 }}>with {transaction.merchant}</Text>
                </View>
              )}
              {recentHistory.length > 5 && (
                <TouchableOpacity
                  onPress={() => setShowAllHistory(!showAllHistory)}
                  style={{ alignItems: 'center', paddingVertical: 12, marginTop: 8 }}
                >
                  <Text style={{ fontSize: 13, fontWeight: 'bold', color: '#EA2831' }}>
                    {showAllHistory ? 'Show Less' : `Show More (${recentHistory.length - 5} more)`}
                  </Text>
                </TouchableOpacity>
              )}
            </View>
          </View>
        </View>
        )}
      </ScrollView>
      
      <TransactionModal 
        visible={showEditModal} 
        onClose={() => setShowEditModal(false)}
        transaction={transaction}
        onTransactionUpdated={handleTransactionUpdated}
      />
    </SafeAreaView>
  );
}