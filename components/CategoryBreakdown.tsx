import React from 'react';
import { View, Text, TouchableOpacity, Dimensions } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Svg, { Circle } from 'react-native-svg';

const { width: screenWidth } = Dimensions.get('window');

interface CategoryBreakdownProps {
  categoryBreakdown: {[category: string]: any[]};
  incomeBreakdown: {[category: string]: any[]};
  totalExpenses: number;
  totalIncome: number;
  categoryIcons: {[key: string]: string};
  categoryColors: {[key: string]: string};
}

export default function CategoryBreakdown({ 
  categoryBreakdown, 
  incomeBreakdown,
  totalExpenses, 
  totalIncome,
  categoryIcons, 
  categoryColors 
}: CategoryBreakdownProps) {
  const [selectedType, setSelectedType] = React.useState<'expenses' | 'income'>('expenses');
  const [categories, setCategories] = React.useState<any[]>([]);
  const isSmallScreen = screenWidth < 400;
  const chartSize = isSmallScreen ? 120 : 160;
  const radius = isSmallScreen ? 50 : 70;
  const circumference = 2 * Math.PI * radius;
  
  // Recalculate categories when props or selectedType changes
  React.useEffect(() => {
    const currentBreakdown = selectedType === 'expenses' ? categoryBreakdown : incomeBreakdown;
    const currentTotal = selectedType === 'expenses' ? totalExpenses : totalIncome;
    
    const newCategories = Object.entries(currentBreakdown || {}).map(([name, transactions]) => {
      const amount = transactions.reduce((sum, t) => sum + parseFloat(t.amount), 0);
      const percentage = currentTotal > 0 ? (amount / currentTotal) * 100 : 0;
      return { name, amount, percentage, transactions };
    }).sort((a, b) => b.amount - a.amount).slice(0, 3);
    
    setCategories(newCategories);
  }, [categoryBreakdown, incomeBreakdown, totalExpenses, totalIncome, selectedType]);
  
  const currentTotal = selectedType === 'expenses' ? totalExpenses : totalIncome;
  
  let offset = 0;

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
      <View style={{
        flexDirection: 'column',
        gap: 16,
        marginBottom: 24,
      }}>
        <Text style={{ fontSize: 18, fontWeight: 'bold', color: '#0d121b' }}>Category Breakdown</Text>
        <View style={{
          backgroundColor: '#f1f5f9',
          padding: 4,
          borderRadius: 20,
          flexDirection: 'row',
          alignSelf: 'flex-start',
        }}>
            <TouchableOpacity 
              style={{
                paddingHorizontal: 16,
                paddingVertical: 6,
                borderRadius: 16,
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
                paddingHorizontal: 16,
                paddingVertical: 6,
                borderRadius: 16,
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
          </View>
      </View>
      
      {categories.length > 0 ? (
        <View style={{ 
          flexDirection: isSmallScreen ? 'column' : 'row', 
          alignItems: 'center', 
          gap: isSmallScreen ? 24 : 32 
        }}>
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
                {categories.map((category, index) => {
                  const strokeDasharray = `${(category.percentage / 100) * circumference} ${circumference}`;
                  const strokeDashoffset = -offset;
                  offset += (category.percentage / 100) * circumference;
                  
                  return (
                    <Circle
                      key={category.name}
                      cx={chartSize / 2}
                      cy={chartSize / 2}
                      r={radius}
                      stroke={categoryColors[category.name] || ['#EA2831', '#8b5cf6', '#06b6d4'][index]}
                      strokeWidth={isSmallScreen ? 15 : 20}
                      fill="transparent"
                      strokeDasharray={strokeDasharray}
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
                <Text style={{ fontSize: isSmallScreen ? 20 : 24, fontWeight: '800', color: '#0d121b' }}>₹{currentTotal.toFixed(0)}</Text>
              </View>
            </View>
          </View>
          
          <View style={{ flex: 1, gap: 12, width: '100%' }}>
            {categories.map((category, index) => {
              const defaultColors = ['#EA2831', '#8b5cf6', '#06b6d4'];
              const defaultBgColors = ['#fef2f2', '#f5f3ff', '#ecfeff'];
              const defaultBorderColors = ['#fecaca', '#ddd6fe', '#a5f3fc'];
              const defaultIcons = ['car', 'bag', 'restaurant'];
              
              return (
                <TouchableOpacity key={category.name} style={{
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
                      backgroundColor: defaultBgColors[index],
                      alignItems: 'center',
                      justifyContent: 'center',
                      borderWidth: 1,
                      borderColor: defaultBorderColors[index],
                    }}>
                      <Ionicons 
                        name={categoryIcons[category.name] || defaultIcons[index]} 
                        size={20} 
                        color={categoryColors[category.name] || defaultColors[index]} 
                      />
                    </View>
                    <View>
                      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                        <Text style={{ fontSize: 14, fontWeight: 'bold', color: '#0d121b' }}>{category.name}</Text>
                        <View style={{ 
                          width: 8, 
                          height: 8, 
                          borderRadius: 4, 
                          backgroundColor: categoryColors[category.name] || defaultColors[index] 
                        }} />
                      </View>
                      <Text style={{ fontSize: 10, fontWeight: '500', color: '#64748b' }}>
                        {category.percentage.toFixed(0)}% of total
                      </Text>
                    </View>
                  </View>
                  <View style={{ alignItems: 'flex-end', gap: 6, width: isSmallScreen ? 80 : 96 }}>
                    <Text style={{ fontSize: 14, fontWeight: 'bold', color: '#0d121b' }}>₹{category.amount.toFixed(2)}</Text>
                    <View style={{
                      width: '100%',
                      height: 6,
                      backgroundColor: '#f1f5f9',
                      borderRadius: 3,
                      overflow: 'hidden',
                    }}>
                      <View style={{
                        height: '100%',
                        backgroundColor: categoryColors[category.name] || defaultColors[index],
                        borderRadius: 3,
                        width: `${category.percentage}%`
                      }} />
                    </View>
                  </View>
                </TouchableOpacity>
              );
            })}
          </View>
        </View>
      ) : (
        <View style={{ alignItems: 'center', justifyContent: 'center', paddingVertical: 40 }}>
          <Ionicons name="pie-chart-outline" size={48} color="#94a3b8" />
          <Text style={{ fontSize: 16, fontWeight: 'bold', color: '#64748b', marginTop: 12 }}>
            No {selectedType} data
          </Text>
          <Text style={{ fontSize: 14, color: '#94a3b8', textAlign: 'center', marginTop: 4 }}>
            Add some {selectedType} to see breakdown
          </Text>
        </View>
      )}
    </View>
  );
}