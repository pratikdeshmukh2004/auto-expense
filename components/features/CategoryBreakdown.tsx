import React from 'react';
import { View, Text, TouchableOpacity, Dimensions, Animated } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Svg, { Circle } from 'react-native-svg';

const AnimatedCircle = Animated.createAnimatedComponent(Circle);

const { width: screenWidth } = Dimensions.get('window');

interface CategoryBreakdownProps {
  categoryBreakdown: {[category: string]: any[]};
  incomeBreakdown: {[category: string]: any[]};
  totalExpenses: number;
  totalIncome: number;
  categoryIcons: {[key: string]: string};
  categoryColors: {[key: string]: string};
  allTransactions?: any[];
  themeColors?: any;
}

export default function CategoryBreakdown({ 
  categoryBreakdown, 
  totalExpenses, 
  categoryIcons, 
  categoryColors,
  allTransactions = [],
  themeColors,
}: CategoryBreakdownProps) {
  const [selectedPeriod, setSelectedPeriod] = React.useState<'this_month' | 'last_month' | 'this_year' | 'all_time'>('this_month');
  const [categories, setCategories] = React.useState<any[]>([]);
  const animatedValues = React.useRef<Animated.Value[]>([]).current;
  const isSmallScreen = screenWidth < 400;
  const chartSize = isSmallScreen ? 120 : 160;
  const radius = isSmallScreen ? 50 : 70;
  const circumference = 2 * Math.PI * radius;

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
    const breakdown: {[key: string]: any[]} = {};
    filtered.forEach(t => {
      if (!breakdown[t.category]) breakdown[t.category] = [];
      breakdown[t.category].push(t);
    });

    const newCategories = Object.entries(breakdown).map(([name, transactions]) => {
      const amount = transactions.reduce((sum, t) => sum + parseFloat(t.amount), 0);
      const percentage = total > 0 ? (amount / total) * 100 : 0;
      return { name, amount, percentage, total };
    }).sort((a, b) => b.amount - a.amount).slice(0, 3);

    setCategories(newCategories);

    animatedValues.length = 0;
    newCategories.forEach(() => {
      const anim = new Animated.Value(0);
      animatedValues.push(anim);
      Animated.timing(anim, {
        toValue: 1,
        duration: 1000,
        useNativeDriver: false,
      }).start();
    });
  }, [allTransactions, selectedPeriod]);

  const currentTotal = categories.length > 0 ? categories[0].total : 0;
  let offset = 0;

  const periods = [
    { key: 'this_month', label: 'This Month' },
    { key: 'last_month', label: 'Last Month' },
    { key: 'this_year', label: 'This Year' },
    { key: 'all_time', label: 'All Time' },
  ] as const;

  const tc = themeColors || { card: 'white', text: '#0d121b', textSecondary: '#64748b', textMuted: '#9ca3af', chipBg: '#f1f5f9', chipActive: 'white', background: '#f8fafc' };

  return (
    <View style={{
      backgroundColor: tc.card,
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
        <Text style={{ fontSize: 18, fontWeight: 'bold', color: tc.text }}>Category Breakdown</Text>
        <View style={{
          backgroundColor: tc.chipBg,
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
                backgroundColor: selectedPeriod === p.key ? tc.chipActive : 'transparent',
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
                color: selectedPeriod === p.key ? tc.text : tc.textSecondary,
              }}>{p.label}</Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      {categories.length > 0 ? (
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
              backgroundColor: tc.chipBg,
            }}>
              <Svg width={chartSize} height={chartSize} style={{ position: 'absolute' }}>
                {categories.map((category, index) => {
                  const strokeDasharray = `${(category.percentage / 100) * circumference} ${circumference}`;
                  const strokeDashoffset = -offset;
                  offset += (category.percentage / 100) * circumference;

                  const animatedStrokeDasharray = animatedValues[index]?.interpolate({
                    inputRange: [0, 1],
                    outputRange: [`0 ${circumference}`, strokeDasharray],
                  }) || strokeDasharray;

                  return (
                    <AnimatedCircle
                      key={category.name}
                      cx={chartSize / 2}
                      cy={chartSize / 2}
                      r={radius}
                      stroke={categoryColors[category.name] || ['#EA2831', '#8b5cf6', '#06b6d4'][index]}
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
                backgroundColor: tc.card,
                alignItems: 'center',
                justifyContent: 'center',
                zIndex: 10,
              }}>
                <Text style={{ fontSize: 10, fontWeight: '600', color: tc.textSecondary, textTransform: 'uppercase', letterSpacing: 1 }}>TOTAL</Text>
                <Text style={{ fontSize: isSmallScreen ? 14 : 16, fontWeight: '800', color: tc.text }} numberOfLines={1} adjustsFontSizeToFit>₹{currentTotal % 1 === 0 ? currentTotal.toLocaleString("en-IN") : currentTotal.toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</Text>
              </View>
            </View>
          </View>

          <View style={{ flex: 1, gap: 12, width: '100%' }}>
            {categories.map((category, index) => {
              const defaultColors = ['#EA2831', '#8b5cf6', '#06b6d4'];
              const defaultIcons = ['car', 'bag', 'restaurant'];
              const iconColor = categoryColors[category.name] || defaultColors[index];

              return (
                <View key={category.name} style={{
                  flexDirection: 'row',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  paddingVertical: 8,
                  paddingHorizontal: 8,
                  marginHorizontal: -8,
                  borderRadius: 8,
                }}>
                  <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
                    <View style={{
                      width: 40,
                      height: 40,
                      borderRadius: 20,
                      backgroundColor: `${iconColor}20`,
                      alignItems: 'center',
                      justifyContent: 'center',
                      borderWidth: 1,
                      borderColor: `${iconColor}30`,
                    }}>
                      <Ionicons
                        name={categoryIcons[category.name] || defaultIcons[index]}
                        size={20}
                        color={iconColor}
                      />
                    </View>
                    <View>
                      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                        <Text style={{ fontSize: 14, fontWeight: 'bold', color: tc.text }}>{category.name}</Text>
                        <View style={{
                          width: 8,
                          height: 8,
                          borderRadius: 4,
                          backgroundColor: iconColor,
                        }} />
                      </View>
                      <Text style={{ fontSize: 10, fontWeight: '500', color: tc.textSecondary }}>
                        {category.percentage.toFixed(0)}% of total
                      </Text>
                    </View>
                  </View>
                  <View style={{ alignItems: 'flex-end', gap: 6, width: isSmallScreen ? 80 : 96 }}>
                    <Text style={{ fontSize: 12, fontWeight: 'bold', color: tc.text }} numberOfLines={1} adjustsFontSizeToFit>₹{category.amount % 1 === 0 ? category.amount.toLocaleString("en-IN") : category.amount.toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</Text>
                    <View style={{
                      width: '100%',
                      height: 6,
                      backgroundColor: tc.chipBg,
                      borderRadius: 3,
                      overflow: 'hidden',
                    }}>
                      <Animated.View style={{
                        height: '100%',
                        backgroundColor: iconColor,
                        borderRadius: 3,
                        width: animatedValues[index]?.interpolate({
                          inputRange: [0, 1],
                          outputRange: ['0%', `${category.percentage}%`],
                        }) || `${category.percentage}%`,
                      }} />
                    </View>
                  </View>
                </View>
              );
            })}
          </View>
        </View>
      ) : (
        <View style={{ alignItems: 'center', justifyContent: 'center', paddingVertical: 40 }}>
          <Ionicons name="pie-chart-outline" size={48} color="#94a3b8" />
          <Text style={{ fontSize: 16, fontWeight: 'bold', color: tc.textSecondary, marginTop: 12 }}>
            No expense data
          </Text>
          <Text style={{ fontSize: 14, color: '#94a3b8', textAlign: 'center', marginTop: 4 }}>
            Add some expenses to see breakdown
          </Text>
        </View>
      )}
    </View>
  );
}
