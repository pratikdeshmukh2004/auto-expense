import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import React, { useState, useEffect } from 'react';
import { ScrollView, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import CategoryModal from '../../components/drawers/CategoryModal';
import { CategoryService, Category } from '../../services/CategoryService';

export default function CategoriesScreen() {
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<Category | null>(null);

  const [isAddMode, setIsAddMode] = useState(false);
  const [categories, setCategories] = useState<Category[]>([]);

  useEffect(() => {
    loadCategories();
  }, []);

  const loadCategories = async () => {
    const cats = await CategoryService.getCategories();
    setCategories(cats);
  };


  const addCategory = () => {
    setSelectedCategory(null);
    setIsAddMode(true);
    setShowEditModal(true);
  };

  const handleEditCategory = (category: Category) => {
    setSelectedCategory(category);
    setIsAddMode(false);
    setShowEditModal(true);
  };



  const handleSave = () => {
    loadCategories();
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#f8f6f6' }}>
      {/* Header */}
      <View style={{
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 16,
        paddingVertical: 16,
        backgroundColor: 'rgba(248, 246, 246, 0.9)',
      }}>
        <TouchableOpacity onPress={() => router.back()} style={{
          width: 40,
          height: 40,
          borderRadius: 20,
          alignItems: 'center',
          justifyContent: 'center',
        }}>
          <Ionicons name="arrow-back" size={24} color="#1f2937" />
        </TouchableOpacity>
        <Text style={{
          flex: 1,
          textAlign: 'center',
          fontSize: 18,
          fontWeight: 'bold',
          color: '#1f2937',
          paddingRight: 40,
        }}>Manage Categories</Text>
      </View>

      <ScrollView style={{ flex: 1 }} showsVerticalScrollIndicator={false}>
        {/* Categories List */}
        <View style={{ paddingHorizontal: 20, paddingTop: 20, paddingBottom: 20, overflow: 'visible' }}>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
            <Text style={{ fontSize: 18, fontWeight: 'bold', color: '#1f2937' }}>Your Categories</Text>
            <View style={{
              backgroundColor: '#f3f4f6',
              paddingHorizontal: 8,
              paddingVertical: 4,
              borderRadius: 6,
            }}>
              <Text style={{ fontSize: 12, fontWeight: '500', color: '#6b7280' }}>{categories.length} Total</Text>
            </View>
          </View>
          
          <View style={{ gap: 12 }}>
            {categories.map((category) => (
              <TouchableOpacity 
                key={category.id} 
                onPress={() => handleEditCategory(category)}
                style={{
                  flexDirection: 'row',
                  alignItems: 'center',
                  gap: 16,
                  backgroundColor: 'white',
                  padding: 12,
                  borderRadius: 12,
                  borderWidth: 1,
                  borderColor: '#f3f4f6',
                  shadowColor: '#000',
                  shadowOffset: { width: 0, height: 1 },
                  shadowOpacity: 0.05,
                  shadowRadius: 2,
                  elevation: 1,
                }}
              >
                <View style={{
                  width: 48,
                  height: 48,
                  borderRadius: 12,
                  backgroundColor: `${category.color}20`,
                  alignItems: 'center',
                  justifyContent: 'center',
                }}>
                  <Ionicons name={category.icon as any} size={24} color={category.color} />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={{ fontSize: 16, fontWeight: 'bold', color: '#1f2937' }}>{category.name}</Text>
                  <Text style={{ fontSize: 12, color: '#6b7280', marginTop: 2 }}>{category.description || `${category.name} expenses`}</Text>
                </View>
                <Ionicons name="chevron-forward" size={20} color="#9ca3af" />
              </TouchableOpacity>
            ))}
          </View>
        </View>
      </ScrollView>
      
      {/* Floating Action Button */}
      <TouchableOpacity 
        style={{
          position: 'absolute',
          bottom: 100,
          right: 20,
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
        onPress={addCategory}
      >
        <Ionicons name="add" size={28} color="white" />
      </TouchableOpacity>
      
      <CategoryModal
        visible={showEditModal}
        onClose={() => setShowEditModal(false)}
        onSave={handleSave}
        category={selectedCategory}
        isAddMode={isAddMode}
      />
    </SafeAreaView>
  );
}