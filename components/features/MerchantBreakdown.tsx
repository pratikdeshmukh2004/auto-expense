import React from 'react';
import { View, Text, TouchableOpacity, Dimensions, Animated } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Svg, { Circle } from 'react-native-svg';

const AnimatedCircle = Animated.createAnimatedComponent(Circle);
const { width: screenWidth } = Dimensions.get('window');

interface MerchantBreakdownProps {
  allTransactions: any[];
}

export default function MerchantBreakdown({ allTransactions = [] }: MerchantBreakdownProps) {
  const [selectedPeriod, setSelectedPeriod] = React.useState<'this_month' | 'last_month' | 'this_year' | 'all_time'>('this_month');
  const [merchants, setMerchants] = React.useState<any[]>([]);
  const animatedValues = React.useRef<Animated.Value[]>([]).current;
  const isSmallScreen = screenWidth < 400;
  const chartSize = isSmallScreen ? 120 : 160;
  const radius = isSmallScreen ? 50 : 70;
  const circumference = 2 * Math.PI * radius;

  const colors = ['#EA2831', '#8b5cf6', '#06b6d4', '#f59e0b', '#10b981'];

  React.useEffect(() => {
    const now = new Date();
    let filtered: any[] = [];

    if (selectedPeriod === 'this_month') {
      filtered = allTransactions.filter(t => {
        const d = new Date(t.timestamp || t.date);
        return t.type === 'expense' && d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
      });
    } else if (selectedPeriod === 'last_month') {
      const lm = now.getMonth() === 0 ? 11 : now.getMonth() - 1;
      const ly = now.getMonth() === 0 ? now.getFullYear() - 1 : now.getFullYear();
      filtered = allTransactions.filter(t => {
        const d = new Date(t.timestamp || t.date);
        return t.type === 'expense' && d.getMonth() === lm && d.getFullYear() === ly;
      });
    } else if (selectedPeriod === 'this_year') {
      filtered = allTransactions.filter(t => {
        const d = new Date(t.timestamp || t.date);
        return t.type === 'expense' && d.getFullYear() === now.getFullYear();
      });
    } else {
      filtered = allTransactions.filter(t => t.type === 'expense');
    }

    const total = filtered.reduce((sum, t) => sum + parseFloat(t.amount), 0);
    const breakdown: { [key: string]: number } = {};
    filtered.forEach(t => {
      const merchant = t.merchant || 'Unknown';
      breakdown[merchant] = (breakdown[merchant] || 0) + parseFloat(t.amount);
    });

    const newMerchants = Object.entries(breakdown)
      .map(([name, amount]) => ({
        name,
        amount,
        percentage: total > 0 ? (amount / total) * 100 : 0,
        total,
      }))
      .sort((a, b) => b.amount - a.amount)
      .slice(0, 5);

    setMerchants(newMerchants);

    animatedValues.length = 0;
    newMerchants.forEach(() => {
      const anim = new Animated.Value(0);
      animatedValues.push(anim);
      Animated.timing(anim, {
        toValue: 1,
        duration: 1000,
        useNativeDriver: false,
      }).start();
    });
  }, [allTransactions, selectedPeriod]);

  const currentTotal = merchants.length > 0 ? merchants[0].total : 0;
  let offset = 0;

  const periods = [
    { key: 'this_month', label: 'This Month' },
    { key: 'last_month', label: 'Last Month' },
    { key: 'this_year', label: 'This Year' },
    { key: 'all_time', label: 'All Time' },
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
      <View style={{ flexDirection: 'column', gap: 16, marginBottom: 24 }}>
        <Text style={{ fontSize: 18, fontWeight: 'bold', color: '#0d121b' }}>Paid To Breakdown</Text>
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
                paddingHorizontal: 12,
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

      {merchants.length > 0 ? (
        <View style={{ flexDirection: 'column', alignItems: 'center', gap: 24 }}>
          <View style={{ alignItems: 'center', justifyContent: 'center', position: 'relative' }}>
            <View style={{
              width: chartSize,
              height: chartSize,
              borderRadius: chartSize / 2,
              shadowColor: '#d1d5db',
              shadowOffset: { width: 0, height: 4 },
              shadowOpacity: 0.3,
              shadowRadius: 8,
              elevation: 4,
              backgroundColor: '#f8fafc',
            }}>
              <Svg width={chartSize} height={chartSize} style={{ position: 'absolute' }}>
                {merchants.map((merchant, index) => {
                  const strokeDasharray = `${(merchant.percentage / 100) * circumference} ${circumference}`;
                  const strokeDashoffset = -offset;
                  offset += (merchant.percentage / 100) * circumference;

                  const animatedStrokeDasharray = animatedValues[index]?.interpolate({
                    inputRange: [0, 1],
                    outputRange: [`0 ${circumference}`, strokeDasharray],
                  }) || strokeDasharray;

                  return (
                    <AnimatedCircle
                      key={merchant.name}
                      cx={chartSize / 2}
                      cy={chartSize / 2}
                      r={radius}
                      stroke={colors[index % colors.length]}
                      strokeWidth={isSmallScreen ? 15 : 20}
                      fill="transparent"
                      strokeDasharray={animatedStrokeDasharray}
                      strokeDashoffset={strokeDashoffset}
                      transform={`rotate(-90 ${chartSize / 2} ${chartSize / 2})`}
                    />
                  );
                })}
              </Svg>
              <View style={{
                position: 'absolute',
                top: isSmallScreen ? 12 : 16,
                left: isSmallScreen ? 12 : 16,
                right: isSmallScreen ? 12 : 16,
                bottom: isSmallScreen ? 12 : 16,
                borderRadius: (chartSize - (isSmallScreen ? 24 : 32)) / 2,
                backgroundColor: 'white',
                alignItems: 'center',
                justifyContent: 'center',
                zIndex: 10,
              }}>
                <Text style={{ fontSize: 10, fontWeight: '600', color: '#64748b', textTransform: 'uppercase', letterSpacing: 1 }}>TOTAL</Text>
                <Text style={{ fontSize: isSmallScreen ? 14 : 16, fontWeight: '800', color: '#0d121b' }} numberOfLines={1} adjustsFontSizeToFit>
                  ₹{currentTotal % 1 === 0 ? currentTotal.toLocaleString("en-IN") : currentTotal.toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </Text>
              </View>
            </View>
          </View>

          <View style={{ flex: 1, gap: 12, width: '100%' }}>
            {merchants.map((merchant, index) => (
              <View key={merchant.name} style={{
                flexDirection: 'row',
                justifyContent: 'space-between',
                alignItems: 'center',
                paddingVertical: 8,
                paddingHorizontal: 8,
                marginHorizontal: -8,
                borderRadius: 8,
              }}>
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12, flex: 1 }}>
                  <View style={{
                    width: 40,
                    height: 40,
                    borderRadius: 20,
                    backgroundColor: `${colors[index % colors.length]}15`,
                    alignItems: 'center',
                    justifyContent: 'center',
                    borderWidth: 1,
                    borderColor: `${colors[index % colors.length]}30`,
                  }}>
                    <Ionicons name="person" size={18} color={colors[index % colors.length]} />
                  </View>
                  <View style={{ flex: 1 }}>
                    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                      <Text style={{ fontSize: 13, fontWeight: 'bold', color: '#0d121b' }} numberOfLines={1}>{merchant.name}</Text>
                      <View style={{
                        width: 8,
                        height: 8,
                        borderRadius: 4,
                        backgroundColor: colors[index % colors.length],
                      }} />
                    </View>
                    <Text style={{ fontSize: 10, fontWeight: '500', color: '#64748b' }}>
                      {merchant.percentage.toFixed(0)}% of total
                    </Text>
                  </View>
                </View>
                <View style={{ alignItems: 'flex-end', gap: 6, width: isSmallScreen ? 80 : 96 }}>
                  <Text style={{ fontSize: 12, fontWeight: 'bold', color: '#0d121b' }} numberOfLines={1} adjustsFontSizeToFit>
                    ₹{merchant.amount % 1 === 0 ? merchant.amount.toLocaleString("en-IN") : merchant.amount.toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </Text>
                  <View style={{
                    width: '100%',
                    height: 6,
                    backgroundColor: '#f1f5f9',
                    borderRadius: 3,
                    overflow: 'hidden',
                  }}>
                    <Animated.View style={{
                      height: '100%',
                      backgroundColor: colors[index % colors.length],
                      borderRadius: 3,
                      width: animatedValues[index]?.interpolate({
                        inputRange: [0, 1],
                        outputRange: ['0%', `${merchant.percentage}%`],
                      }) || `${merchant.percentage}%`,
                    }} />
                  </View>
                </View>
              </View>
            ))}
          </View>
        </View>
      ) : (
        <View style={{ alignItems: 'center', justifyContent: 'center', paddingVertical: 40 }}>
          <Ionicons name="people-outline" size={48} color="#94a3b8" />
          <Text style={{ fontSize: 14, fontWeight: 'bold', color: '#64748b', marginTop: 12 }}>No data</Text>
          <Text style={{ fontSize: 12, color: '#94a3b8', textAlign: 'center', marginTop: 4 }}>
            Add expenses to see merchant breakdown
          </Text>
        </View>
      )}
    </View>
  );
}
