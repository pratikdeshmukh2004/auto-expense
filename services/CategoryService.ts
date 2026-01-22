import { StorageService } from './StorageService';

export interface Category {
  id: string;
  name: string;
  icon: string;
  color: string;
  description?: string;
}

export class CategoryService {
  static async getCategories(): Promise<Category[]> {
    try {
      return await StorageService.getCategories();
    } catch (error) {
      return [];
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
      await StorageService.saveCategories(categories);
    } catch (error) {
    }
  }

  static async updateCategory(id: string, updates: Partial<Category>): Promise<void> {
    try {
      const categories = await this.getCategories();
      const index = categories.findIndex(cat => cat.id === id);
      if (index !== -1) {
        categories[index] = { ...categories[index], ...updates };
        await StorageService.saveCategories(categories);
      }
    } catch (error) {
    }
  }

  static async deleteCategory(id: string): Promise<void> {
    try {
      const categories = await this.getCategories();
      const filteredCategories = categories.filter(cat => cat.id !== id);
      await StorageService.saveCategories(filteredCategories);
    } catch (error) {
      throw error;
    }
  }
}