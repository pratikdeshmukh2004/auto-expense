import * as SecureStore from 'expo-secure-store';
import { ApiService } from './ApiService';

const KEYS = {
  CATEGORIES: 'app_categories',
  PAYMENT_METHODS: 'app_payment_methods',
  KEYWORDS: 'app_keywords',
  APPROVED_SENDERS: 'app_approved_senders',
};

const DEFAULT_CATEGORIES = [
  { id: '1', name: 'Material', icon: 'cube', color: '#f59e0b' },
  { id: '2', name: 'Construction', icon: 'hammer', color: '#3b82f6' },
  { id: '3', name: 'Labour', icon: 'people', color: '#8b5cf6' },
  { id: '4', name: 'Transport', icon: 'car', color: '#10b981' },
  { id: '5', name: 'Plumbing', icon: 'water', color: '#06b6d4' },
  { id: '6', name: 'Electrical', icon: 'flash', color: '#eab308' },
  { id: '7', name: 'Cement', icon: 'layers', color: '#64748b' },
  { id: '8', name: 'Steel', icon: 'grid', color: '#475569' },
  { id: '9', name: 'Sand & Gravel', icon: 'earth', color: '#a16207' },
  { id: '10', name: 'Tiles & Flooring', icon: 'apps', color: '#0891b2' },
  { id: '11', name: 'Paint', icon: 'color-palette', color: '#ec4899' },
  { id: '12', name: 'Woodwork', icon: 'leaf', color: '#854d0e' },
  { id: '13', name: 'Fabrication', icon: 'construct', color: '#6366f1' },
  { id: '14', name: 'Food', icon: 'restaurant', color: '#ef4444' },
  { id: '15', name: 'Other', icon: 'ellipsis-horizontal', color: '#6b7280' },
];

const DEFAULT_PAYMENT_METHODS = [
  { id: '1', name: 'Credit Card', icon: 'card', color: '#3b82f6' },
  { id: '2', name: 'Pratik', icon: 'person', color: '#8b5cf6' },
  { id: '3', name: 'Vishal', icon: 'person', color: '#10b981' },
  { id: '4', name: 'Home', icon: 'home', color: '#f59e0b' },
  { id: '5', name: 'Other', icon: 'ellipsis-horizontal', color: '#6b7280' },
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
    if (cats.length === 0 || cats.length === 6) {
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
    if (methods.length === 0 || methods.length === 4) {
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
    return data.map((item, index) => ({
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
}
