import { StorageService } from './StorageService';

export interface PaymentMethod {
  id: string;
  name: string;
  icon: string;
  color: string;
  type: 'card' | 'bank' | 'wallet' | 'cash' | 'upi';
  description?: string;
  last4?: string;
}

export class PaymentMethodService {
  static async getPaymentMethods(): Promise<PaymentMethod[]> {
    try {
      return await StorageService.getPaymentMethods();
    } catch (error) {
      console.error('Error getting payment methods:', error);
      return [];
    }
  }

  static async addPaymentMethod(method: Omit<PaymentMethod, 'id'>): Promise<void> {
    try {
      const methods = await this.getPaymentMethods();
      const newMethod: PaymentMethod = {
        ...method,
        id: Date.now().toString(),
      };
      methods.push(newMethod);
      await StorageService.savePaymentMethods(methods);
    } catch (error) {
      console.error('Error adding payment method:', error);
    }
  }

  static async updatePaymentMethod(id: string, updates: Partial<PaymentMethod>): Promise<void> {
    try {
      const methods = await this.getPaymentMethods();
      const index = methods.findIndex(method => method.id === id);
      if (index !== -1) {
        methods[index] = { ...methods[index], ...updates };
        await StorageService.savePaymentMethods(methods);
      }
    } catch (error) {
      console.error('Error updating payment method:', error);
    }
  }

  static async deletePaymentMethod(id: string): Promise<void> {
    try {
      const methods = await this.getPaymentMethods();
      const filteredMethods = methods.filter(method => method.id !== id);
      await StorageService.savePaymentMethods(filteredMethods);
    } catch (error) {
      console.error('Error deleting payment method:', error);
      throw error;
    }
  }
}