import React, { useState, useRef } from 'react';
import { View, Text, TextInput, TouchableOpacity, ScrollView, Animated, PanResponder } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import AddTransactionModal from '../../components/AddTransactionModal';
import TransactionFiltersModal from '../../components/TransactionFiltersModal';

export default function TransactionsIndex() {
  const [showAddModal, setShowAddModal] = useState(false);
  const [showFiltersModal, setShowFiltersModal] = useState(false);
  
  const SwipeableTransactionCard = ({ merchant, amount, category, time, icon, bgColor, iconColor, onPress }: any) => {
    const translateX = useRef(new Animated.Value(0)).current;
    
    const panResponder = PanResponder.create({
      onMoveShouldSetPanResponder: (_, gestureState) => {
        return Math.abs(gestureState.dx) > 20;
      },
      onPanResponderMove: (_, gestureState) => {
        if (gestureState.dx < 0) {
          translateX.setValue(Math.max(gestureState.dx, -120));
        }
      },
      onPanResponderRelease: (_, gestureState) => {
        if (gestureState.dx < -60) {
          Animated.spring(translateX, {
            toValue: -120,
            useNativeDriver: false,
          }).start();
        } else {
          Animated.spring(translateX, {
            toValue: 0,
            useNativeDriver: false,
          }).start();
        }
      },
    });
    
    return (
      <View style={{ position: 'relative', marginBottom: 12 }}>
        {/* Action Buttons */}
        <View style={{
          position: 'absolute',
          right: 0,
          top: 0,
          bottom: 0,
          flexDirection: 'row',
          alignItems: 'center',
          paddingRight: 16,
        }}>
          <TouchableOpacity style={{
            backgroundColor: '#10b981',
            width: 50,
            height: 50,
            borderRadius: 25,
            alignItems: 'center',
            justifyContent: 'center',
            marginRight: 8,
          }}>
            <Ionicons name="copy" size={20} color="white" />
          </TouchableOpacity>
          <TouchableOpacity style={{
            backgroundColor: '#3b82f6',
            width: 50,
            height: 50,
            borderRadius: 25,
            alignItems: 'center',
            justifyContent: 'center',
          }}>
            <Ionicons name="create" size={20} color="white" />
          </TouchableOpacity>
        </View>
        
        {/* Transaction Card */}
        <Animated.View
          style={{
            transform: [{ translateX }],
            backgroundColor: 'white',
            borderRadius: 16,
            padding: 14,
            shadowColor: '#000',
            shadowOffset: { width: 0, height: 1 },
            shadowOpacity: 0.05,
            shadowRadius: 2,
            elevation: 1,
          }}
          {...panResponder.panHandlers}
        >
          <TouchableOpacity
            onPress={onPress}
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              justifyContent: 'space-between',
            }}
          >
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 16 }}>
              <View style={{
                width: 48,
                height: 48,
                borderRadius: 12,
                backgroundColor: bgColor,
                alignItems: 'center',
                justifyContent: 'center',
              }}>
                <Ionicons name={icon} size={24} color={iconColor} />
              </View>
              <View>
                <Text style={{ fontSize: 16, fontWeight: 'bold', color: '#111827' }}>{merchant}</Text>
                <Text style={{ fontSize: 12, fontWeight: '500', color: '#6b7280', marginTop: 4 }}>{category} • {time}</Text>
              </View>
            </View>
            <View style={{ alignItems: 'flex-end', gap: 4 }}>
              <Text style={{ fontSize: 16, fontWeight: 'bold', color: '#ea2a33' }}>-${amount}</Text>
              <Ionicons name="chevron-forward" size={16} color="#d1d5db" />
            </View>
          </TouchableOpacity>
        </Animated.View>
      </View>
    );
  };
  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#f8f6f6' }}>
      {/* Header */}
      <View style={{ paddingHorizontal: 20, paddingTop: 16, paddingBottom: 8 }}>
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
          <Text style={{ fontSize: 24, fontWeight: 'bold', color: '#111827' }}>Transactions</Text>
          <TouchableOpacity 
            style={{
              width: 40,
              height: 40,
              borderRadius: 20,
              alignItems: 'center',
              justifyContent: 'center',
              position: 'relative',
            }}
            onPress={() => setShowFiltersModal(true)}
          >
            <Ionicons name="options" size={24} color="#111827" />
            <View style={{
              position: 'absolute',
              top: 8,
              right: 8,
              width: 10,
              height: 10,
              backgroundColor: '#ea2a33',
              borderRadius: 5,
              borderWidth: 2,
              borderColor: '#f8f6f6',
            }} />
          </TouchableOpacity>
        </View>

        {/* Search Bar */}
        <View style={{
          flexDirection: 'row',
          alignItems: 'center',
          backgroundColor: 'white',
          borderRadius: 12,
          paddingHorizontal: 16,
          height: 48,
          marginBottom: 12,
          shadowColor: '#000',
          shadowOffset: { width: 0, height: 1 },
          shadowOpacity: 0.05,
          shadowRadius: 2,
          elevation: 1,
        }}>
          <Ionicons name="search" size={24} color="#ea2a33" style={{ marginRight: 12 }} />
          <TextInput
            placeholder="Search merchant or category..."
            placeholderTextColor="#9ca3af"
            style={{ flex: 1, fontSize: 16, fontWeight: '500', color: '#111827' }}
          />
        </View>

        {/* Filter Chips */}
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginBottom: 16 }}>
          <View style={{ flexDirection: 'row', gap: 12, paddingVertical: 8 }}>
            <TouchableOpacity style={{
              paddingHorizontal: 20,
              height: 36,
              borderRadius: 18,
              backgroundColor: '#ea2a33',
              alignItems: 'center',
              justifyContent: 'center',
              shadowColor: '#ea2a33',
              shadowOffset: { width: 0, height: 4 },
              shadowOpacity: 0.25,
              shadowRadius: 8,
              elevation: 4,
            }}>
              <Text style={{ fontSize: 14, fontWeight: '600', color: 'white' }}>Last 7 Days</Text>
            </TouchableOpacity>
            <TouchableOpacity style={{
              paddingHorizontal: 20,
              height: 36,
              borderRadius: 18,
              backgroundColor: 'white',
              alignItems: 'center',
              justifyContent: 'center',
            }}>
              <Text style={{ fontSize: 14, fontWeight: '500', color: '#6b7280' }}>Fuel</Text>
            </TouchableOpacity>
            <TouchableOpacity style={{
              paddingHorizontal: 20,
              height: 36,
              borderRadius: 18,
              backgroundColor: 'white',
              alignItems: 'center',
              justifyContent: 'center',
            }}>
              <Text style={{ fontSize: 14, fontWeight: '500', color: '#6b7280' }}>Food</Text>
            </TouchableOpacity>
            <TouchableOpacity style={{
              paddingHorizontal: 20,
              height: 36,
              borderRadius: 18,
              backgroundColor: 'white',
              alignItems: 'center',
              justifyContent: 'center',
            }}>
              <Text style={{ fontSize: 14, fontWeight: '500', color: '#6b7280' }}>Maintenance</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </View>

      {/* Transactions List */}
      <ScrollView style={{ flex: 1 }} showsVerticalScrollIndicator={false}>
        {/* Today Section */}
        <View style={{ marginBottom: 8 }}>
          <View style={{
            flexDirection: 'row',
            justifyContent: 'space-between',
            alignItems: 'center',
            paddingHorizontal: 20,
            paddingVertical: 12,
            backgroundColor: 'rgba(248, 246, 246, 0.95)',
            borderBottomWidth: 1,
            borderBottomColor: '#f3f4f6',
          }}>
            <Text style={{ fontSize: 12, fontWeight: 'bold', color: '#6b7280', textTransform: 'uppercase', letterSpacing: 1 }}>Today</Text>
            <Text style={{ fontSize: 14, fontWeight: 'bold', color: '#111827' }}>$45.20</Text>
          </View>
          <View style={{ paddingHorizontal: 20, paddingTop: 12 }}>
            <SwipeableTransactionCard
              merchant="Shell Station"
              amount="45.20"
              category="Fuel"
              time="2:30 PM"
              icon="car"
              bgColor="rgba(234, 42, 51, 0.1)"
              iconColor="#ea2a33"
              onPress={() => router.push('/transactions/details')}
            />
          </View>
        </View>

        {/* Yesterday Section */}
        <View style={{ marginBottom: 8 }}>
          <View style={{
            flexDirection: 'row',
            justifyContent: 'space-between',
            alignItems: 'center',
            paddingHorizontal: 20,
            paddingVertical: 12,
            backgroundColor: 'rgba(248, 246, 246, 0.95)',
            borderBottomWidth: 1,
            borderBottomColor: '#f3f4f6',
          }}>
            <Text style={{ fontSize: 12, fontWeight: 'bold', color: '#6b7280', textTransform: 'uppercase', letterSpacing: 1 }}>Yesterday</Text>
            <Text style={{ fontSize: 14, fontWeight: 'bold', color: '#111827' }}>$126.50</Text>
          </View>
          <View style={{ paddingHorizontal: 20, paddingTop: 12, gap: 12 }}>
            <SwipeableTransactionCard
              merchant="AutoZone"
              amount="120.00"
              category="Car Parts"
              time="5:15 PM"
              icon="build"
              bgColor="rgba(249, 115, 22, 0.1)"
              iconColor="#f97316"
              onPress={() => router.push('/transactions/details')}
            />

            <SwipeableTransactionCard
              merchant="Starbucks"
              amount="6.50"
              category="Food & Drink"
              time="8:45 AM"
              icon="restaurant"
              bgColor="rgba(16, 185, 129, 0.1)"
              iconColor="#10b981"
              onPress={() => router.push('/transactions/details')}
            />
          </View>
        </View>

        {/* Sept 24 Section */}
        <View style={{ marginBottom: 120 }}>
          <View style={{
            flexDirection: 'row',
            justifyContent: 'space-between',
            alignItems: 'center',
            paddingHorizontal: 20,
            paddingVertical: 12,
            backgroundColor: 'rgba(248, 246, 246, 0.95)',
            borderBottomWidth: 1,
            borderBottomColor: '#f3f4f6',
          }}>
            <Text style={{ fontSize: 12, fontWeight: 'bold', color: '#6b7280', textTransform: 'uppercase', letterSpacing: 1 }}>Sept 24</Text>
            <Text style={{ fontSize: 14, fontWeight: 'bold', color: '#111827' }}>$412.00</Text>
          </View>
          <View style={{ paddingHorizontal: 20, paddingTop: 12, gap: 12 }}>
            <TouchableOpacity style={{
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
                  backgroundColor: 'rgba(59, 130, 246, 0.1)',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}>
                  <Ionicons name="shield-checkmark" size={24} color="#3b82f6" />
                </View>
                <View>
                  <Text style={{ fontSize: 16, fontWeight: 'bold', color: '#111827' }}>Geico Insurance</Text>
                  <Text style={{ fontSize: 12, fontWeight: '500', color: '#6b7280', marginTop: 4 }}>Insurance • 9:00 AM</Text>
                </View>
              </View>
              <View style={{ alignItems: 'flex-end', gap: 4 }}>
                <Text style={{ fontSize: 16, fontWeight: 'bold', color: '#ea2a33' }}>-$250.00</Text>
                <Ionicons name="chevron-forward" size={16} color="#d1d5db" />
              </View>
            </TouchableOpacity>

            <TouchableOpacity style={{
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
                  <Ionicons name="car-sport" size={24} color="#9333ea" />
                </View>
                <View>
                  <Text style={{ fontSize: 16, fontWeight: 'bold', color: '#111827' }}>Sparkle Wash</Text>
                  <Text style={{ fontSize: 12, fontWeight: '500', color: '#6b7280', marginTop: 4 }}>Services • 11:20 AM</Text>
                </View>
              </View>
              <View style={{ alignItems: 'flex-end', gap: 4 }}>
                <Text style={{ fontSize: 16, fontWeight: 'bold', color: '#ea2a33' }}>-$162.00</Text>
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
          right: 20,
          width: 56,
          height: 56,
          borderRadius: 28,
          backgroundColor: '#ea2a33',
          alignItems: 'center',
          justifyContent: 'center',
          shadowColor: '#ea2a33',
          shadowOffset: { width: 0, height: 8 },
          shadowOpacity: 0.4,
          shadowRadius: 16,
          elevation: 12,
        }}
        onPress={() => setShowAddModal(true)}
      >
        <Ionicons name="add" size={28} color="white" />
      </TouchableOpacity>

      <AddTransactionModal 
        visible={showAddModal} 
        onClose={() => setShowAddModal(false)} 
      />
      
      <TransactionFiltersModal
        visible={showFiltersModal}
        onClose={() => setShowFiltersModal(false)}
        onApplyFilters={(filters) => {
          console.log('Applied filters:', filters);
          setShowFiltersModal(false);
        }}
      />
    </SafeAreaView>
  );
}