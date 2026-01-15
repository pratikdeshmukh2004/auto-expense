import * as SecureStore from 'expo-secure-store';

export interface PaymentMethod {
  id: string;
  name: string;
  icon: string;
  color: string;
  type: 'card' | 'bank' | 'wallet' | 'cash';
  description?: string;
}

const PAYMENT_METHODS_KEY = 'user_payment_methods';

export class PaymentMethodService {
  static async getPaymentMethods(): Promise<PaymentMethod[]> {
    try {
      const methodsJson = await SecureStore.getItemAsync(PAYMENT_METHODS_KEY);
      if (methodsJson) {
        const methods = JSON.parse(methodsJson);
        // Ensure default methods are always present
        const defaultMethods = this.getDefaultPaymentMethods();
        const existingIds = methods.map((m: PaymentMethod) => m.id);
        const missingDefaults = defaultMethods.filter(def => !existingIds.includes(def.id));
        
        if (missingDefaults.length > 0) {
          const updatedMethods = [...methods, ...missingDefaults];
          await SecureStore.setItemAsync(PAYMENT_METHODS_KEY, JSON.stringify(updatedMethods));
          return updatedMethods;
        }
        return methods;
      }
      // First time - save and return default methods
      await SecureStore.setItemAsync(PAYMENT_METHODS_KEY, JSON.stringify(this.getDefaultPaymentMethods()));
      return this.getDefaultPaymentMethods();
    } catch (error) {
      console.error('Error getting payment methods:', error);
      return this.getDefaultPaymentMethods();
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
      await SecureStore.setItemAsync(PAYMENT_METHODS_KEY, JSON.stringify(methods));
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
        await SecureStore.setItemAsync(PAYMENT_METHODS_KEY, JSON.stringify(methods));
      }
    } catch (error) {
      console.error('Error updating payment method:', error);
    }
  }

  static async deletePaymentMethod(id: string): Promise<void> {
    try {
      // Prevent deleting default payment methods
      const defaultIds = ['1', '2', '3', '4', '5'];
      if (defaultIds.includes(id)) {
        throw new Error('Cannot delete default payment methods');
      }
      
      const methods = await this.getPaymentMethods();
      const filteredMethods = methods.filter(method => method.id !== id);
      await SecureStore.setItemAsync(PAYMENT_METHODS_KEY, JSON.stringify(filteredMethods));
    } catch (error) {
      console.error('Error deleting payment method:', error);
      throw error;
    }
  }

  private static getDefaultPaymentMethods(): PaymentMethod[] {
    return [
      { id: '1', name: 'HDFC Credit Card', type: 'card', icon: 'card', color: '#3b82f6', description: 'Primary credit card' },
      { id: '2', name: 'Savings Account', type: 'bank', icon: 'wallet', color: '#10b981', description: 'Main savings account' },
      { id: '3', name: 'Cash', type: 'cash', icon: 'cash', color: '#f59e0b', description: 'Physical cash payments' },
      { id: '4', name: 'Paytm Wallet', type: 'wallet', icon: 'phone-portrait', color: '#8b5cf6', description: 'Digital wallet' },
      { id: '5', name: 'Other', type: 'card', icon: 'ellipsis-horizontal', color: '#6b7280', description: 'Other payment methods' },
    ];
  }
}