import * as SecureStore from 'expo-secure-store';
import { ApiService } from './ApiService';

const KEYS = {
  CATEGORIES: 'app_categories',
  PAYMENT_METHODS: 'app_payment_methods',
  KEYWORDS: 'app_keywords',
  APPROVED_SENDERS: 'app_approved_senders',
};

const DEFAULT_CATEGORIES = [
  { id: '1', name: 'Food & Dining', icon: 'restaurant', color: '#ef4444' },
  { id: '2', name: 'Transport', icon: 'car', color: '#10b981' },
  { id: '3', name: 'Shopping', icon: 'cart', color: '#8b5cf6' },
  { id: '4', name: 'Bills & Utilities', icon: 'flash', color: '#f59e0b' },
  { id: '5', name: 'Entertainment', icon: 'game-controller', color: '#ec4899' },
  { id: '6', name: 'Health', icon: 'medkit', color: '#06b6d4' },
  { id: '7', name: 'Education', icon: 'school', color: '#3b82f6' },
  { id: '8', name: 'Groceries', icon: 'basket', color: '#22c55e' },
  { id: '9', name: 'Rent', icon: 'home', color: '#6366f1' },
  { id: '10', name: 'Salary', icon: 'cash', color: '#10b981' },
  { id: '11', name: 'Other', icon: 'ellipsis-horizontal', color: '#6b7280' },
];

const DEFAULT_PAYMENT_METHODS = [
  { id: '1', name: 'Cash', icon: 'cash', color: '#10b981' },
  { id: '2', name: 'UPI', icon: 'phone-portrait', color: '#6366f1' },
  { id: '3', name: 'Credit Card', icon: 'card', color: '#3b82f6' },
  { id: '4', name: 'Debit Card', icon: 'card-outline', color: '#f59e0b' },
  { id: '5', name: 'Bank Transfer', icon: 'swap-horizontal', color: '#8b5cf6' },
  { id: '6', name: 'Other', icon: 'ellipsis-horizontal', color: '#6b7280' },
];

async function getJson(key: string): Promise<any[]> {
  try {
    const raw = await SecureStore.getItemAsync(key);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

async function setJson(key: string, data: any[]): Promise<void> {
  await SecureStore.setItemAsync(key, JSON.stringify(data));
}

export class StorageService {
  // Categories (local)
  static async getCategories(): Promise<any[]> {
    const cats = await getJson(KEYS.CATEGORIES);
    if (cats.length === 0) {
      await setJson(KEYS.CATEGORIES, DEFAULT_CATEGORIES);
      return DEFAULT_CATEGORIES;
    }
    return cats;
  }

  static async saveCategories(categories: any[]): Promise<void> {
    await setJson(KEYS.CATEGORIES, categories);
  }

  // Payment Methods (local)
  static async getPaymentMethods(): Promise<any[]> {
    const methods = await getJson(KEYS.PAYMENT_METHODS);
    if (methods.length === 0) {
      await setJson(KEYS.PAYMENT_METHODS, DEFAULT_PAYMENT_METHODS);
      return DEFAULT_PAYMENT_METHODS;
    }
    return methods;
  }

  static async savePaymentMethods(methods: any[]): Promise<void> {
    await setJson(KEYS.PAYMENT_METHODS, methods);
  }

  // Transactions (API)
  static async getTransactions(): Promise<any[]> {
    const data = await ApiService.getTransactions();
    const transactions = data.map((item, index) => ({
      id: `${item.Date}-${index}-${item.Amount}`,
      merchant: item['Paid to'] || '',
      amount: String(item.Amount),
      category: item.Category || 'Other',
      date: item.Date,
      timestamp: new Date(item.Date),
      type: item.Type?.toLowerCase() === 'credit' ? 'income' : 'expense',
      status: 'completed',
      description: item.Description || '',
      paidBy: item['Paid By'] || '',
      paymentMethod: item['Paid By'] || '',
    }));

    // Sync new categories & payment methods from API
    if (transactions.length > 0) {
      this.syncFromTransactions(data).catch(() => {});
    }

    return transactions;
  }

  static async saveTransactions(_transactions: any[]): Promise<void> {
    // Not supported - API is source of truth
  }

  static async addTransaction(transaction: any): Promise<void> {
    await ApiService.addTransaction({
      date: transaction.date ? transaction.date.split('T')[0] : new Date().toISOString().split('T')[0],
      paidTo: transaction.merchant,
      category: transaction.category,
      description: transaction.description || transaction.notes || '',
      amount: parseFloat(transaction.amount),
      paidBy: transaction.paidBy || transaction.paymentMethod || 'Pratik',
      type: transaction.type === 'income' ? 'Credit' : 'Debit',
    });
  }

  static async deleteTransaction(_transactionId: string): Promise<void> {
    // Not supported by this API
  }

  // Keywords (local)
  static async getKeywords(): Promise<any[]> {
    return await getJson(KEYS.KEYWORDS);
  }

  static async saveKeywords(keywords: any[]): Promise<void> {
    await setJson(KEYS.KEYWORDS, keywords);
  }

  // Approved Senders (local)
  static async getApprovedSenders(): Promise<any[]> {
    return await getJson(KEYS.APPROVED_SENDERS);
  }

  static async saveApprovedSenders(senders: any[]): Promise<void> {
    await setJson(KEYS.APPROVED_SENDERS, senders);
  }

  // Sync categories & payment methods from API transactions
  static async syncFromTransactions(transactions: any[]): Promise<void> {
    const SYNC_COLORS = ['#ef4444', '#3b82f6', '#8b5cf6', '#10b981', '#f59e0b', '#06b6d4', '#ec4899', '#6366f1', '#22c55e', '#64748b'];

    // Sync categories
    const categories = await this.getCategories();
    const existingCatNames = new Set(categories.map(c => c.name.toLowerCase()));
    let catAdded = false;
    transactions.forEach(t => {
      const cat = t.category || t.Category;
      if (cat && !existingCatNames.has(cat.toLowerCase())) {
        existingCatNames.add(cat.toLowerCase());
        categories.push({
          id: Date.now().toString() + Math.random().toString(36).slice(2, 6),
          name: cat,
          icon: 'pricetag',
          color: SYNC_COLORS[categories.length % SYNC_COLORS.length],
        });
        catAdded = true;
      }
    });
    if (catAdded) await this.saveCategories(categories);

    // Sync payment methods
    const methods = await this.getPaymentMethods();
    const existingMethodNames = new Set(methods.map(m => m.name.toLowerCase()));
    let methodAdded = false;
    transactions.forEach(t => {
      const method = t.paymentMethod || t.paidBy || t['Paid By'];
      if (method && !existingMethodNames.has(method.toLowerCase())) {
        existingMethodNames.add(method.toLowerCase());
        methods.push({
          id: Date.now().toString() + Math.random().toString(36).slice(2, 6),
          name: method,
          icon: 'wallet',
          color: SYNC_COLORS[methods.length % SYNC_COLORS.length],
        });
        methodAdded = true;
      }
    });
    if (methodAdded) await this.savePaymentMethods(methods);
  }
}
