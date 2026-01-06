import * as SecureStore from 'expo-secure-store';

export interface Category {
  id: string;
  name: string;
  icon: string;
  color: string;
  description?: string;
}

const CATEGORIES_KEY = 'user_categories';

export class CategoryService {
  static async getCategories(): Promise<Category[]> {
    try {
      const categoriesJson = await SecureStore.getItemAsync(CATEGORIES_KEY);
      if (categoriesJson) {
        const categories = JSON.parse(categoriesJson);
        // Ensure default categories are always present
        const defaultCategories = this.getDefaultCategories();
        const existingIds = categories.map((c: Category) => c.id);
        const missingDefaults = defaultCategories.filter(def => !existingIds.includes(def.id));
        
        if (missingDefaults.length > 0) {
          const updatedCategories = [...categories, ...missingDefaults];
          await SecureStore.setItemAsync(CATEGORIES_KEY, JSON.stringify(updatedCategories));
          return updatedCategories;
        }
        return categories;
      }
      // First time - save and return default categories
      await SecureStore.setItemAsync(CATEGORIES_KEY, JSON.stringify(this.getDefaultCategories()));
      return this.getDefaultCategories();
    } catch (error) {
      console.error('Error getting categories:', error);
      return this.getDefaultCategories();
    }
  }

  static async addCategory(category: Omit<Category, 'id'>): Promise<void> {
    try {
      const categories = await this.getCategories();
      const newCategory: Category = {
        ...category,
        id: Date.now().toString(),
      };
      categories.push(newCategory);
      await SecureStore.setItemAsync(CATEGORIES_KEY, JSON.stringify(categories));
    } catch (error) {
      console.error('Error adding category:', error);
    }
  }

  static async updateCategory(id: string, updates: Partial<Category>): Promise<void> {
    try {
      const categories = await this.getCategories();
      const index = categories.findIndex(cat => cat.id === id);
      if (index !== -1) {
        categories[index] = { ...categories[index], ...updates };
        await SecureStore.setItemAsync(CATEGORIES_KEY, JSON.stringify(categories));
      }
    } catch (error) {
      console.error('Error updating category:', error);
    }
  }

  static async deleteCategory(id: string): Promise<void> {
    try {
      // Prevent deleting default categories
      const defaultIds = ['1', '2', '3', '4', '5', '6'];
      if (defaultIds.includes(id)) {
        throw new Error('Cannot delete default categories');
      }
      
      const categories = await this.getCategories();
      const filteredCategories = categories.filter(cat => cat.id !== id);
      await SecureStore.setItemAsync(CATEGORIES_KEY, JSON.stringify(filteredCategories));
    } catch (error) {
      console.error('Error deleting category:', error);
      throw error;
    }
  }

  private static getDefaultCategories(): Category[] {
    return [
      { id: '1', name: 'Food & Drink', description: 'Dining out, groceries, snacks', icon: 'restaurant', color: '#f97316' },
      { id: '2', name: 'Transport', description: 'Fuel, uber, public transit', icon: 'car', color: '#3b82f6' },
      { id: '3', name: 'Shopping', description: 'Clothing, electronics, home', icon: 'bag', color: '#8b5cf6' },
      { id: '4', name: 'Rent & Utilities', description: 'Monthly bills, internet, electric', icon: 'home', color: '#10b981' },
      { id: '5', name: 'Health & Fitness', description: 'Gym, doctors, pharmacy', icon: 'fitness', color: '#ef4444' },
      { id: '6', name: 'Entertainment', description: 'Movies, games, subscriptions', icon: 'game-controller', color: '#ec4899' },
    ];
  }
}