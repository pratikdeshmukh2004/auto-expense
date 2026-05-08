import React from 'react';
import { View, Text, TouchableOpacity, Animated } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

interface SpendingTrendsProps {
  transactions: any[];
}

export default function SpendingTrends({ transactions }: SpendingTrendsProps) {
  const [selectedPeriod, setSelectedPeriod] = React.useState<'weekly' | 'monthly' | 'yearly'>('monthly');
  const barAnimations = React.useRef<Animated.Value[]>([]).current;

  const getExpenseTransactions = () => transactions.filter(t => t.type === 'expense');

  const getWeeklyData = () => {
    const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
    const today = new Date();
    const dayOfWeek = today.getDay();
    const weekStart = new Date(today);
    weekStart.setDate(today.getDate() - (dayOfWeek === 0 ? 6 : dayOfWeek - 1));
    weekStart.setHours(0, 0, 0, 0);

    return days.map((day, index) => {
      const dayDate = new Date(weekStart);
      dayDate.setDate(weekStart.getDate() + index);

      const amount = getExpenseTransactions()
        .filter(t => new Date(t.timestamp).toDateString() === dayDate.toDateString())
        .reduce((sum, t) => sum + parseFloat(t.amount), 0);

      return { label: day, amount };
    });
  };

  const getMonthlyData = () => {
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const now = new Date();
    const year = now.getFullYear();

    return months.map((month, index) => {
      const amount = getExpenseTransactions()
        .filter(t => {
          const d = new Date(t.timestamp);
          return d.getMonth() === index && d.getFullYear() === year;
        })
        .reduce((sum, t) => sum + parseFloat(t.amount), 0);

      return { label: month, amount };
    });
  };

  const getYearlyData = () => {
    const now = new Date();
    const years: { label: string; amount: number }[] = [];

    for (let i = 2; i >= 0; i--) {
      const year = now.getFullYear() - i;
      const amount = getExpenseTransactions()
        .filter(t => new Date(t.timestamp).getFullYear() === year)
        .reduce((sum, t) => sum + parseFloat(t.amount), 0);

      years.push({ label: String(year), amount });
    }

    return years;
  };

  const getData = () => {
    if (selectedPeriod === 'weekly') return getWeeklyData();
    if (selectedPeriod === 'yearly') return getYearlyData();
    return getMonthlyData();
  };

  const data = getData();
  const maxAmount = Math.max(...data.map(d => d.amount), 1);

  // Reset animations on period change
  React.useEffect(() => {
    barAnimations.length = 0;
    data.forEach(() => {
      const anim = new Animated.Value(0);
      barAnimations.push(anim);
      Animated.timing(anim, {
        toValue: 1,
        duration: 800,
        useNativeDriver: false,
      }).start();
    });
  }, [selectedPeriod, transactions.length]);

  const periods = [
    { key: 'weekly', label: 'Weekly' },
    { key: 'monthly', label: 'Monthly' },
    { key: 'yearly', label: 'Yearly' },
  ] as const;

  return (
    <View style={{
      backgroundColor: 'white',
      borderRadius: 16,
      padding: 20,
      marginBottom: 24,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 1 },
      shadowOpacity: 0.05,
      shadowRadius: 2,
      elevation: 1,
    }}>
      <View style={{ flexDirection: 'column', gap: 16, marginBottom: 16 }}>
        <Text style={{ fontSize: 18, fontWeight: 'bold', color: '#0d121b' }}>Spending Trends</Text>
        <View style={{
          backgroundColor: '#f1f5f9',
          padding: 4,
          borderRadius: 20,
          flexDirection: 'row',
          alignSelf: 'flex-start',
        }}>
          {periods.map(p => (
            <TouchableOpacity
              key={p.key}
              style={{
                paddingHorizontal: 14,
                paddingVertical: 6,
                borderRadius: 16,
                backgroundColor: selectedPeriod === p.key ? 'white' : 'transparent',
                shadowColor: selectedPeriod === p.key ? '#000' : 'transparent',
                shadowOffset: { width: 0, height: 1 },
                shadowOpacity: selectedPeriod === p.key ? 0.05 : 0,
                shadowRadius: 2,
                elevation: selectedPeriod === p.key ? 1 : 0,
              }}
              onPress={() => setSelectedPeriod(p.key)}
            >
              <Text style={{
                fontSize: 11,
                fontWeight: selectedPeriod === p.key ? 'bold' : '500',
                color: selectedPeriod === p.key ? '#0d121b' : '#64748b',
              }}>{p.label}</Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      <View style={{ height: 180, marginTop: 16, position: 'relative' }}>
        {data.some(d => d.amount > 0) ? (
          <>
            {/* Grid lines */}
            <View style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 24, flexDirection: 'column', justifyContent: 'space-between' }}>
              {Array.from({ length: 4 }).map((_, i) => (
                <View key={i} style={{
                  borderBottomWidth: 1,
                  borderBottomColor: '#f1f5f9',
                  width: '100%',
                  height: 0,
                }} />
              ))}
            </View>

            <View style={{ flexDirection: 'row', alignItems: 'flex-end', justifyContent: 'space-between', height: '100%', paddingHorizontal: 4 }}>
              {data.map((item, index) => {
                const barHeight = (item.amount / maxAmount) * 130;
                const animatedHeight = barAnimations[index]?.interpolate({
                  inputRange: [0, 1],
                  outputRange: [4, Math.max(barHeight, 4)],
                }) || Math.max(barHeight, 4);

                const isCurrentPeriod = (() => {
                  const now = new Date();
                  if (selectedPeriod === 'weekly') return index === (now.getDay() === 0 ? 6 : now.getDay() - 1);
                  if (selectedPeriod === 'monthly') return index === now.getMonth();
                  return item.label === String(now.getFullYear());
                })();

                return (
                  <View key={index} style={{ flex: 1, alignItems: 'center', justifyContent: 'flex-end', height: '100%', gap: 6 }}>
                    <Animated.View style={{
                      width: selectedPeriod === 'yearly' ? 24 : selectedPeriod === 'monthly' ? 10 : 14,
                      backgroundColor: isCurrentPeriod ? '#EA2831' : 'rgba(234, 40, 49, 0.3)',
                      borderRadius: 4,
                      height: animatedHeight,
                    }} />
                    <Text style={{
                      fontSize: selectedPeriod === 'monthly' ? 8 : 10,
                      fontWeight: isCurrentPeriod ? 'bold' : '500',
                      color: isCurrentPeriod ? '#0d121b' : '#9ca3af',
                    }}>{item.label}</Text>
                  </View>
                );
              })}
            </View>
          </>
        ) : (
          <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
            <Ionicons name="bar-chart-outline" size={48} color="#94a3b8" />
            <Text style={{ fontSize: 14, fontWeight: 'bold', color: '#64748b', marginTop: 12 }}>No expense data</Text>
          </View>
        )}
      </View>
    </View>
  );
}
