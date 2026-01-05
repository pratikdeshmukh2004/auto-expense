import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import React, { useEffect, useRef, useState } from 'react';
import { Animated, ScrollView, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import AddTransactionModal from '../../components/drawers/AddTransactionModal';
import PieChart from '../../components/PieChart';
import TransactionApprovalModal from '../../components/drawers/TransactionApprovalModal';

const AnimatedNumber = ({ value, duration = 1500, prefix = '$', suffix = '' }) => {
  const animatedValue = useRef(new Animated.Value(0)).current;
  const [displayValue, setDisplayValue] = useState('0');

  useEffect(() => {
    const numericValue = parseFloat(value.replace(/[$,]/g, ''));
    
    const listener = animatedValue.addListener(({ value }) => {
      const formatted = numericValue === 0 ? '0.00' : 
        value < 1000 ? value.toFixed(2) : 
        (value / 1000).toFixed(1) + 'k';
      setDisplayValue(formatted);
    });

    Animated.timing(animatedValue, {
      toValue: numericValue,
      duration,
      useNativeDriver: false,
    }).start();

    return () => animatedValue.removeListener(listener);
  }, [value]);

  return <Text style={{ fontSize: 20, fontWeight: 'bold', color: '#0d121b' }}>
    {prefix}{displayValue}{suffix}
  </Text>;
};

export default function DashboardIndex() {
  const [showAddModal, setShowAddModal] = useState(false);
  const [showApprovalModal, setShowApprovalModal] = useState(false);
  const [currentDate, setCurrentDate] = useState('');
  
  const barAnimations = useRef([
    new Animated.Value(0),
    new Animated.Value(0),
    new Animated.Value(0),
    new Animated.Value(0),
    new Animated.Value(0),
    new Animated.Value(0),
    new Animated.Value(0),
  ]).current;
  const circleAnim = useRef(new Animated.Value(0)).current;
  const progressAnimations = useRef([
    new Animated.Value(0),
    new Animated.Value(0),
    new Animated.Value(0),
  ]).current;
  
  useEffect(() => {
    const now = new Date();
    setCurrentDate(now.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' }));
    const barAnimationSequence = barAnimations.map((anim, index) => 
      Animated.timing(anim, {
        toValue: 1,
        duration: 1000,
        delay: index * 150,
        useNativeDriver: false,
      })
    );
    
    const progressAnimationSequence = progressAnimations.map((anim, index) => 
      Animated.timing(anim, {
        toValue: 1,
        duration: 1200,
        delay: 800 + index * 300,
        useNativeDriver: false,
      })
    );
    
    const circleAnimation = Animated.timing(circleAnim, {
      toValue: 1,
      duration: 1500,
      delay: 600,
      useNativeDriver: false,
    });
    
    Animated.parallel([
      ...barAnimationSequence,
      ...progressAnimationSequence,
      circleAnimation,
    ]).start();
  }, []);

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

      <ScrollView style={{ flex: 1, paddingHorizontal: 16, paddingTop: 8 }} showsVerticalScrollIndicator={false}>
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
            <AnimatedNumber value="4,250.00" />
            <Text style={{ fontSize: 10, fontWeight: '500', color: '#10b981' }}>+12% vs last month</Text>
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
            <AnimatedNumber value="2,145.50" />
            <Text style={{ fontSize: 10, fontWeight: '500', color: '#EA2831' }}>+5% vs last month</Text>
          </View>
        </View>

        {/* Category Breakdown */}
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
            flexDirection: 'row',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: 16,
          }}>
            <Text style={{ fontSize: 18, fontWeight: 'bold', color: '#0d121b' }}>Category Breakdown</Text>
            <TouchableOpacity>
              <Ionicons name="ellipsis-horizontal" size={20} color="#64748b" />
            </TouchableOpacity>
          </View>
          
          <View style={{ flexDirection: 'column', gap: 24 }}>
            <View style={{ alignItems: 'center', justifyContent: 'center', alignSelf: 'center' }}>
              <View style={{
                width: 144,
                height: 144,
                borderRadius: 72,
                position: 'relative',
                alignItems: 'center',
                justifyContent: 'center',
              }}>
                <PieChart 
                  size={144}
                  strokeWidth={12}
                  data={[
                    { percentage: 45, color: '#EA2831' },
                    { percentage: 30, color: '#8b5cf6' },
                    { percentage: 25, color: '#06b6d4' }
                  ]}
                />
                
                <View style={{
                  width: 120,
                  height: 120,
                  borderRadius: 60,
                  backgroundColor: 'white',
                  alignItems: 'center',
                  justifyContent: 'center',
                  position: 'absolute',
                }}>
                  <Text style={{ fontSize: 10, fontWeight: '600', color: '#64748b', textTransform: 'uppercase' }}>Total</Text>
                  <AnimatedNumber value="1,245" />
                </View>
              </View>
            </View>
            
            <View style={{ width: '100%', gap: 16 }}>
              <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
                  <View style={{
                    width: 36,
                    height: 36,
                    borderRadius: 18,
                    backgroundColor: '#fef2f2',
                    alignItems: 'center',
                    justifyContent: 'center',
                    borderWidth: 1,
                    borderColor: '#fecaca',
                  }}>
                    <Ionicons name="car" size={16} color="#EA2831" />
                  </View>
                  <View>
                    <Text style={{ fontSize: 14, fontWeight: 'bold', color: '#0d121b' }}>Transport</Text>
                    <Text style={{ fontSize: 10, fontWeight: '500', color: '#64748b' }}>45% of total</Text>
                  </View>
                </View>
                <View style={{ alignItems: 'flex-end', gap: 6, minWidth: 96 }}>
                  <AnimatedNumber value="560.25" duration={1200} />
                  <View style={{
                    width: '100%',
                    height: 6,
                    backgroundColor: '#f1f5f9',
                    borderRadius: 3,
                    overflow: 'hidden',
                  }}>
                    <Animated.View style={{ 
                      height: '100%', 
                      backgroundColor: '#EA2831', 
                      borderRadius: 3,
                      width: progressAnimations[0].interpolate({
                        inputRange: [0, 1],
                        outputRange: ['0%', '45%']
                      })
                    }} />
                  </View>
                </View>
              </View>

              <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
                  <View style={{
                    width: 36,
                    height: 36,
                    borderRadius: 18,
                    backgroundColor: '#f3f4f6',
                    alignItems: 'center',
                    justifyContent: 'center',
                    borderWidth: 1,
                    borderColor: '#e5e7eb',
                  }}>
                    <Ionicons name="bag" size={16} color="#8b5cf6" />
                  </View>
                  <View>
                    <Text style={{ fontSize: 14, fontWeight: 'bold', color: '#0d121b' }}>Shopping</Text>
                    <Text style={{ fontSize: 10, fontWeight: '500', color: '#64748b' }}>30% of total</Text>
                  </View>
                </View>
                <View style={{ alignItems: 'flex-end', gap: 6, minWidth: 96 }}>
                  <AnimatedNumber value="373.50" duration={1500} />
                  <View style={{
                    width: '100%',
                    height: 6,
                    backgroundColor: '#f1f5f9',
                    borderRadius: 3,
                    overflow: 'hidden',
                  }}>
                    <Animated.View style={{ 
                      height: '100%', 
                      backgroundColor: '#8b5cf6', 
                      borderRadius: 3,
                      width: progressAnimations[1].interpolate({
                        inputRange: [0, 1],
                        outputRange: ['0%', '30%']
                      })
                    }} />
                  </View>
                </View>
              </View>

              <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
                  <View style={{
                    width: 36,
                    height: 36,
                    borderRadius: 18,
                    backgroundColor: '#ecfeff',
                    alignItems: 'center',
                    justifyContent: 'center',
                    borderWidth: 1,
                    borderColor: '#a5f3fc',
                  }}>
                    <Ionicons name="restaurant" size={16} color="#06b6d4" />
                  </View>
                  <View>
                    <Text style={{ fontSize: 14, fontWeight: 'bold', color: '#0d121b' }}>Food & Drink</Text>
                    <Text style={{ fontSize: 10, fontWeight: '500', color: '#64748b' }}>25% of total</Text>
                  </View>
                </View>
                <View style={{ alignItems: 'flex-end', gap: 6, minWidth: 96 }}>
                  <AnimatedNumber value="311.25" duration={1800} />
                  <View style={{
                    width: '100%',
                    height: 6,
                    backgroundColor: '#f1f5f9',
                    borderRadius: 3,
                    overflow: 'hidden',
                  }}>
                    <Animated.View style={{ 
                      height: '100%', 
                      backgroundColor: '#06b6d4', 
                      borderRadius: 3,
                      width: progressAnimations[2].interpolate({
                        inputRange: [0, 1],
                        outputRange: ['0%', '25%']
                      })
                    }} />
                  </View>
                </View>
              </View>
            </View>
          </View>
        </View>

        {/* Payment Methods */}
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
            flexDirection: 'row',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: 20,
          }}>
            <Text style={{ fontSize: 18, fontWeight: 'bold', color: '#0d121b' }}>Payment Methods</Text>
            <TouchableOpacity>
              <Ionicons name="ellipsis-horizontal" size={20} color="#64748b" />
            </TouchableOpacity>
          </View>
          
          <View style={{ gap: 20 }}>
            <View style={{
              backgroundColor: '#f8fafc',
              borderRadius: 12,
              padding: 12,
              borderWidth: 1,
              borderColor: '#e2e8f0',
            }}>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12, marginBottom: 12 }}>
                <View style={{
                  width: 40,
                  height: 40,
                  borderRadius: 12,
                  backgroundColor: '#3b82f6',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}>
                  <Ionicons name="card" size={20} color="white" />
                </View>
                <View>
                  <Text style={{ fontSize: 14, fontWeight: 'bold', color: '#0d121b' }}>HDFC Credit Card</Text>
                  <Text style={{ fontSize: 10, fontWeight: '500', color: '#64748b' }}>**** 4582 • Platinum</Text>
                </View>
              </View>
              <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 4 }}>
                <View>
                  <Text style={{ fontSize: 10, fontWeight: '600', color: '#64748b', textTransform: 'uppercase', marginBottom: 2 }}>Income</Text>
                  <AnimatedNumber value="0.00" />
                </View>
                <View style={{ width: 1, height: 32, backgroundColor: '#e2e8f0' }} />
                <View style={{ alignItems: 'flex-end' }}>
                  <Text style={{ fontSize: 10, fontWeight: '600', color: '#64748b', textTransform: 'uppercase', marginBottom: 2 }}>Outgoing</Text>
                  <AnimatedNumber value="1,250.40" />
                </View>
              </View>
            </View>

            <View style={{
              backgroundColor: '#f8fafc',
              borderRadius: 12,
              padding: 12,
              borderWidth: 1,
              borderColor: '#e2e8f0',
            }}>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12, marginBottom: 12 }}>
                <View style={{
                  width: 40,
                  height: 40,
                  borderRadius: 12,
                  backgroundColor: '#6366f1',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}>
                  <Ionicons name="business" size={20} color="white" />
                </View>
                <View>
                  <Text style={{ fontSize: 14, fontWeight: 'bold', color: '#0d121b' }}>HDFC Bank Saving</Text>
                  <Text style={{ fontSize: 10, fontWeight: '500', color: '#64748b' }}>**** 8821 • Savings</Text>
                </View>
              </View>
              <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 4 }}>
                <View>
                  <Text style={{ fontSize: 10, fontWeight: '600', color: '#64748b', textTransform: 'uppercase', marginBottom: 2 }}>Income</Text>
                  <AnimatedNumber value="2,500.00" />
                </View>
                <View style={{ width: 1, height: 32, backgroundColor: '#e2e8f0' }} />
                <View style={{ alignItems: 'flex-end' }}>
                  <Text style={{ fontSize: 10, fontWeight: '600', color: '#64748b', textTransform: 'uppercase', marginBottom: 2 }}>Outgoing</Text>
                  <AnimatedNumber value="450.00" />
                </View>
              </View>
            </View>

            <View style={{
              backgroundColor: '#f8fafc',
              borderRadius: 12,
              padding: 12,
              borderWidth: 1,
              borderColor: '#e2e8f0',
            }}>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12, marginBottom: 12 }}>
                <View style={{
                  width: 40,
                  height: 40,
                  borderRadius: 12,
                  backgroundColor: '#10b981',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}>
                  <Ionicons name="cash" size={20} color="white" />
                </View>
                <View>
                  <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                    <Text style={{ fontSize: 14, fontWeight: 'bold', color: '#0d121b' }}>Cash</Text>
                    <View style={{
                      backgroundColor: '#dcfce7',
                      paddingHorizontal: 6,
                      paddingVertical: 2,
                      borderRadius: 6,
                    }}>
                      <Text style={{ fontSize: 10, fontWeight: '600', color: '#10b981' }}>On Track</Text>
                    </View>
                  </View>
                  <Text style={{ fontSize: 10, fontWeight: '500', color: '#64748b' }}>Wallet & Petty Cash</Text>
                </View>
              </View>
              <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 4 }}>
                <View>
                  <Text style={{ fontSize: 10, fontWeight: '600', color: '#64748b', textTransform: 'uppercase', marginBottom: 2 }}>Income</Text>
                  <AnimatedNumber value="500.00" />
                </View>
                <View style={{ width: 1, height: 32, backgroundColor: '#e2e8f0' }} />
                <View style={{ alignItems: 'flex-end' }}>
                  <Text style={{ fontSize: 10, fontWeight: '600', color: '#64748b', textTransform: 'uppercase', marginBottom: 2 }}>Outgoing</Text>
                  <AnimatedNumber value="325.50" />
                </View>
              </View>
            </View>
          </View>
        </View>

        {/* Spending Trends */}
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
            flexDirection: 'row',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: 24,
          }}>
            <Text style={{ fontSize: 18, fontWeight: 'bold', color: '#0d121b' }}>Spending Trends</Text>
            <TouchableOpacity style={{
              backgroundColor: '#f1f5f9',
              paddingHorizontal: 12,
              paddingVertical: 4,
              borderRadius: 20,
              flexDirection: 'row',
              alignItems: 'center',
              gap: 4,
            }}>
              <Text style={{ fontSize: 12, fontWeight: '500', color: '#64748b' }}>Weekly</Text>
              <Ionicons name="chevron-down" size={14} color="#64748b" />
            </TouchableOpacity>
          </View>
          
          <View style={{ flexDirection: 'row', alignItems: 'end', justifyContent: 'space-between', height: 160, gap: 12 }}>
            {[
              { day: 'Mon', height: 72, opacity: 0.4 },
              { day: 'Tue', height: 104, opacity: 0.6 },
              { day: 'Wed', height: 48, opacity: 0.3 },
              { day: 'Thu', height: 136, opacity: 1 },
              { day: 'Fri', height: 88, opacity: 0.5 },
              { day: 'Sat', height: 120, opacity: 0.8 },
              { day: 'Sun', height: 40, opacity: 0.2 },
            ].map((bar, index) => (
              <View key={index} style={{ flex: 1, alignItems: 'center', gap: 8, height: '100%', justifyContent: 'flex-end' }}>
                <Animated.View style={{
                  width: '100%',
                  maxWidth: 24,
                  backgroundColor: `rgba(234, 40, 49, ${bar.opacity})`,
                  borderRadius: 4,
                  height: barAnimations[index].interpolate({
                    inputRange: [0, 1],
                    outputRange: [0, bar.height]
                  })
                }} />
                <Text style={{
                  fontSize: 10,
                  fontWeight: bar.day === 'Thu' ? 'bold' : '500',
                  color: bar.day === 'Thu' ? '#0d121b' : '#64748b'
                }}>{bar.day}</Text>
              </View>
            ))}
          </View>
        </View>

        {/* Recent Transactions */}
        <View style={{ marginBottom: 100 }}>
          <View style={{
            flexDirection: 'row',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: 16,
            paddingHorizontal: 4,
          }}>
            <Text style={{ fontSize: 18, fontWeight: 'bold', color: '#0d121b' }}>Recent Transactions</Text>
            <TouchableOpacity>
              <Text style={{ fontSize: 14, fontWeight: 'bold', color: '#EA2831' }}>See All</Text>
            </TouchableOpacity>
          </View>
          
          <View style={{ gap: 12 }}>
            <TouchableOpacity 
              onPress={() => router.push('/transactions/details')}
              style={{
              flexDirection: 'row',
              justifyContent: 'space-between',
              alignItems: 'center',
              backgroundColor: 'white',
              borderRadius: 12,
              padding: 16,
              shadowColor: '#000',
              shadowOffset: { width: 0, height: 1 },
              shadowOpacity: 0.05,
              shadowRadius: 2,
              elevation: 1,
            }}>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 16 }}>
                <View style={{
                  width: 48,
                  height: 48,
                  borderRadius: 12,
                  backgroundColor: 'rgba(234, 42, 51, 0.1)',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}>
                  <Ionicons name="car" size={24} color="#ea2a33" />
                </View>
                <View>
                  <Text style={{ fontSize: 16, fontWeight: 'bold', color: '#111827' }}>Uber</Text>
                  <Text style={{ fontSize: 12, fontWeight: '500', color: '#6b7280', marginTop: 4 }}>Transport • 2:30 PM</Text>
                </View>
              </View>
              <View style={{ alignItems: 'flex-end', gap: 4 }}>
                <Text style={{ fontSize: 16, fontWeight: 'bold', color: '#ea2a33' }}>-$24.00</Text>
                <Ionicons name="chevron-forward" size={16} color="#d1d5db" />
              </View>
            </TouchableOpacity>

            <TouchableOpacity 
              onPress={() => router.push('/transactions/details')}
              style={{
              flexDirection: 'row',
              justifyContent: 'space-between',
              alignItems: 'center',
              backgroundColor: 'white',
              borderRadius: 12,
              padding: 16,
              shadowColor: '#000',
              shadowOffset: { width: 0, height: 1 },
              shadowOpacity: 0.05,
              shadowRadius: 2,
              elevation: 1,
            }}>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 16 }}>
                <View style={{
                  width: 48,
                  height: 48,
                  borderRadius: 12,
                  backgroundColor: 'rgba(16, 185, 129, 0.1)',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}>
                  <Ionicons name="restaurant" size={24} color="#10b981" />
                </View>
                <View>
                  <Text style={{ fontSize: 16, fontWeight: 'bold', color: '#111827' }}>Starbucks</Text>
                  <Text style={{ fontSize: 12, fontWeight: '500', color: '#6b7280', marginTop: 4 }}>Food & Drink • 8:15 AM</Text>
                </View>
              </View>
              <View style={{ alignItems: 'flex-end', gap: 4 }}>
                <Text style={{ fontSize: 16, fontWeight: 'bold', color: '#ea2a33' }}>-$6.50</Text>
                <Ionicons name="chevron-forward" size={16} color="#d1d5db" />
              </View>
            </TouchableOpacity>

            <TouchableOpacity 
              onPress={() => router.push('/transactions/details')}
              style={{
              flexDirection: 'row',
              alignItems: 'center',
              justifyContent: 'space-between',
              backgroundColor: 'white',
              borderRadius: 16,
              padding: 14,
              shadowColor: '#000',
              shadowOffset: { width: 0, height: 1 },
              shadowOpacity: 0.05,
              shadowRadius: 2,
              elevation: 1,
            }}>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 16 }}>
                <View style={{
                  width: 48,
                  height: 48,
                  borderRadius: 12,
                  backgroundColor: 'rgba(234, 42, 51, 0.1)',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}>
                  <Ionicons name="car-sport" size={24} color="#ea2a33" />
                </View>
                <View>
                  <Text style={{ fontSize: 16, fontWeight: 'bold', color: '#111827' }}>Shell Station</Text>
                  <Text style={{ fontSize: 12, fontWeight: '500', color: '#6b7280', marginTop: 4 }}>Fuel • Yesterday</Text>
                </View>
              </View>
              <View style={{ alignItems: 'flex-end', gap: 4 }}>
                <Text style={{ fontSize: 16, fontWeight: 'bold', color: '#ea2a33' }}>-$45.00</Text>
                <Ionicons name="chevron-forward" size={16} color="#d1d5db" />
              </View>
            </TouchableOpacity>

            <TouchableOpacity 
              onPress={() => router.push('/transactions/details')}
              style={{
              flexDirection: 'row',
              alignItems: 'center',
              justifyContent: 'space-between',
              backgroundColor: 'white',
              borderRadius: 16,
              padding: 14,
              shadowColor: '#000',
              shadowOffset: { width: 0, height: 1 },
              shadowOpacity: 0.05,
              shadowRadius: 2,
              elevation: 1,
            }}>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 16 }}>
                <View style={{
                  width: 48,
                  height: 48,
                  borderRadius: 12,
                  backgroundColor: 'rgba(147, 51, 234, 0.1)',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}>
                  <Ionicons name="bag" size={24} color="#9333ea" />
                </View>
                <View>
                  <Text style={{ fontSize: 16, fontWeight: 'bold', color: '#111827' }}>Target</Text>
                  <Text style={{ fontSize: 12, fontWeight: '500', color: '#6b7280', marginTop: 4 }}>Shopping • Yesterday</Text>
                </View>
              </View>
              <View style={{ alignItems: 'flex-end', gap: 4 }}>
                <Text style={{ fontSize: 16, fontWeight: 'bold', color: '#ea2a33' }}>-$67.00</Text>
                <Ionicons name="chevron-forward" size={16} color="#d1d5db" />
              </View>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>

      {/* Floating Action Button */}
      <TouchableOpacity 
        style={{
          position: 'absolute',
          bottom: 96,
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

      <AddTransactionModal 
        visible={showAddModal} 
        onClose={() => setShowAddModal(false)} 
      />
      
      <TransactionApprovalModal 
        visible={showApprovalModal} 
        onClose={() => setShowApprovalModal(false)} 
      />
    </SafeAreaView>
  );
}