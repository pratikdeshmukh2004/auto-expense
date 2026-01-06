import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

interface SpendingTrendsProps {
  transactions: any[];
}

export default function SpendingTrends({ transactions }: SpendingTrendsProps) {
  const [selectedType, setSelectedType] = React.useState<'income' | 'expenses' | 'net'>('net');
  // Calculate daily data from real transactions
  const getDailyData = () => {
    const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
    const today = new Date();
    const weekStart = new Date(today.setDate(today.getDate() - today.getDay() + 1));
    
    return days.map((day, index) => {
      const dayDate = new Date(weekStart);
      dayDate.setDate(weekStart.getDate() + index);
      
      const dayTransactions = transactions.filter(t => {
        const tDate = new Date(t.timestamp);
        return tDate.toDateString() === dayDate.toDateString();
      });
      
      const income = dayTransactions.filter(t => t.type === 'income').reduce((sum, t) => sum + parseFloat(t.amount), 0);
      const expenses = dayTransactions.filter(t => t.type === 'expense').reduce((sum, t) => sum + parseFloat(t.amount), 0);
      const total = income + expenses;
      
      return { day, income, expenses, total };
    });
  };

  const renderTrendBars = () => {
    const dailyData = getDailyData();
    const maxTotal = Math.max(...dailyData.map(d => {
      if (selectedType === 'income') return d.income;
      if (selectedType === 'expenses') return d.expenses;
      return d.total;
    }), 1);
    
    return dailyData.map((data, index) => {
      const isActive = index === 3; // Thursday is active
      let barHeight = 0;
      let incomeHeight = 0;
      let expenseHeight = 0;
      
      if (selectedType === 'income') {
        barHeight = (data.income / maxTotal) * 144;
        incomeHeight = barHeight;
      } else if (selectedType === 'expenses') {
        barHeight = (data.expenses / maxTotal) * 144;
        expenseHeight = barHeight;
      } else {
        barHeight = (data.total / maxTotal) * 144;
        incomeHeight = data.total > 0 ? (data.income / data.total) * barHeight : 0;
        expenseHeight = barHeight - incomeHeight;
      }
      
      return (
        <View key={index} style={{ flex: 1, alignItems: 'center', gap: 12, height: '100%', justifyContent: 'flex-end' }}>
          <View style={{
            width: 12,
            backgroundColor: '#f8fafc',
            borderRadius: 2,
            overflow: 'hidden',
            flexDirection: 'column',
            justifyContent: 'flex-end',
            height: Math.max(barHeight, 8),
            shadowColor: isActive ? '#000' : 'transparent',
            shadowOffset: { width: 0, height: 2 },
            shadowOpacity: isActive ? 0.1 : 0,
            shadowRadius: 4,
            elevation: isActive ? 2 : 0,
          }}>
            {selectedType === 'net' && (
              <>
                <View style={{
                  width: '100%',
                  backgroundColor: '#10b981',
                  opacity: 0.9,
                  height: incomeHeight
                }} />
                <View style={{ width: '100%', height: 1, backgroundColor: 'white' }} />
              </>
            )}
            <View style={{
              width: '100%',
              backgroundColor: selectedType === 'income' ? '#10b981' : '#EA2831',
              opacity: 0.9,
              height: selectedType === 'net' ? expenseHeight : barHeight
            }} />
          </View>
          <Text style={{
            fontSize: 10,
            fontWeight: isActive ? 'bold' : '600',
            color: isActive ? '#0d121b' : '#64748b'
          }}>{data.day}</Text>
        </View>
      );
    });
  };

  return (
    <View style={{
      backgroundColor: 'white',
      borderRadius: 16,
      padding: 24,
      marginBottom: 24,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 1 },
      shadowOpacity: 0.05,
      shadowRadius: 2,
      elevation: 1,
    }}>
      <View style={{
        flexDirection: 'column',
        gap: 16,
        marginBottom: 16,
      }}>
        <View>
          <Text style={{ fontSize: 18, fontWeight: 'bold', color: '#0d121b' }}>Spending Trends</Text>
          <Text style={{ fontSize: 10, fontWeight: '500', color: '#64748b' }}>Daily Net Activity</Text>
        </View>
        <View style={{
          backgroundColor: '#f1f5f9',
          padding: 4,
          borderRadius: 8,
          flexDirection: 'row',
          alignSelf: 'flex-start',
        }}>
          <TouchableOpacity 
            style={{
              paddingHorizontal: 12,
              paddingVertical: 6,
              borderRadius: 6,
              backgroundColor: selectedType === 'income' ? 'white' : 'transparent',
              shadowColor: selectedType === 'income' ? '#000' : 'transparent',
              shadowOffset: { width: 0, height: 1 },
              shadowOpacity: selectedType === 'income' ? 0.05 : 0,
              shadowRadius: 2,
              elevation: selectedType === 'income' ? 1 : 0,
            }}
            onPress={() => setSelectedType('income')}
          >
            <Text style={{ 
              fontSize: 12, 
              fontWeight: selectedType === 'income' ? 'bold' : '500', 
              color: selectedType === 'income' ? '#0d121b' : '#64748b' 
            }}>Income</Text>
          </TouchableOpacity>
          <TouchableOpacity 
            style={{
              paddingHorizontal: 12,
              paddingVertical: 6,
              borderRadius: 6,
              backgroundColor: selectedType === 'expenses' ? 'white' : 'transparent',
              shadowColor: selectedType === 'expenses' ? '#000' : 'transparent',
              shadowOffset: { width: 0, height: 1 },
              shadowOpacity: selectedType === 'expenses' ? 0.05 : 0,
              shadowRadius: 2,
              elevation: selectedType === 'expenses' ? 1 : 0,
            }}
            onPress={() => setSelectedType('expenses')}
          >
            <Text style={{ 
              fontSize: 12, 
              fontWeight: selectedType === 'expenses' ? 'bold' : '500', 
              color: selectedType === 'expenses' ? '#0d121b' : '#64748b' 
            }}>Expenses</Text>
          </TouchableOpacity>
          <TouchableOpacity 
            style={{
              paddingHorizontal: 12,
              paddingVertical: 6,
              borderRadius: 6,
              backgroundColor: selectedType === 'net' ? 'white' : 'transparent',
              shadowColor: selectedType === 'net' ? '#000' : 'transparent',
              shadowOffset: { width: 0, height: 1 },
              shadowOpacity: selectedType === 'net' ? 0.05 : 0,
              shadowRadius: 2,
              elevation: selectedType === 'net' ? 1 : 0,
            }}
            onPress={() => setSelectedType('net')}
          >
            <Text style={{ 
              fontSize: 12, 
              fontWeight: selectedType === 'net' ? 'bold' : '500', 
              color: selectedType === 'net' ? '#0d121b' : '#64748b' 
            }}>Net</Text>
          </TouchableOpacity>
        </View>
      </View>
      
      <View style={{ height: 208, marginTop: 24, position: 'relative' }}>
        {transactions.length > 0 ? (
          <>
            {/* Grid lines */}
            <View style={{ position: 'absolute', inset: 0, flexDirection: 'column', justifyContent: 'space-between' }}>
              {Array.from({ length: 5 }).map((_, i) => (
                <View key={i} style={{ 
                  borderBottomWidth: 1, 
                  borderBottomColor: i === 4 ? '#d1d5db' : '#f1f5f9',
                  borderStyle: i === 4 ? 'solid' : 'dashed',
                  width: '100%', 
                  height: 0 
                }} />
              ))}
            </View>
            
            <View style={{ flexDirection: 'row', alignItems: 'end', justifyContent: 'space-between', height: '100%', paddingHorizontal: 8, paddingTop: 8, zIndex: 10 }}>
              {renderTrendBars()}
            </View>
          </>
        ) : (
          <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', paddingVertical: 40 }}>
            <Ionicons name="bar-chart-outline" size={48} color="#94a3b8" />
            <Text style={{ fontSize: 16, fontWeight: 'bold', color: '#64748b', marginTop: 12 }}>
              No transaction data
            </Text>
            <Text style={{ fontSize: 14, color: '#94a3b8', textAlign: 'center', marginTop: 4 }}>
              Add transactions to see trends
            </Text>
          </View>
        )}
      </View>
        
      {/* Legend */}
      <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 24, marginTop: 24, paddingTop: 16, borderTopWidth: 1, borderTopColor: '#f1f5f9' }}>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
          <View style={{ width: 10, height: 10, borderRadius: 2, backgroundColor: '#10b981' }} />
          <Text style={{ fontSize: 12, fontWeight: '500', color: '#64748b' }}>Income</Text>
        </View>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
          <View style={{ width: 10, height: 10, borderRadius: 2, backgroundColor: '#EA2831' }} />
          <Text style={{ fontSize: 12, fontWeight: '500', color: '#64748b' }}>Expenses</Text>
        </View>
      </View>
    </View>
  );
}