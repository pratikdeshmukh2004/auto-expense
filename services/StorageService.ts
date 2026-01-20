import * as SecureStore from 'expo-secure-store';
import { StorageKeys } from '../constants/StorageKeys';
import { GoogleSheetsService } from './GoogleSheetsService';

export class StorageService {
  private static async getStorageType(): Promise<'offline' | 'auto' | 'existing'> {
    const type = await SecureStore.getItemAsync(StorageKeys.STORAGE_TYPE);
    return (type as 'offline' | 'auto' | 'existing') || 'offline';
  }

  private static isOnlineMode(type: string): boolean {
    return type === 'auto' || type === 'existing';
  }

  // Categories
  static async getCategories(): Promise<any[]> {
    const storageType = await this.getStorageType();
    
    if (this.isOnlineMode(storageType)) {
      return await GoogleSheetsService.getCategories();
    } else {
      const stored = await SecureStore.getItemAsync(StorageKeys.CATEGORIES);
      return stored ? JSON.parse(stored) : [];
    }
  }

  static async saveCategories(categories: any[]): Promise<void> {
    const storageType = await this.getStorageType();
    
    if (this.isOnlineMode(storageType)) {
      await GoogleSheetsService.saveCategories(categories);
    } else {
      await SecureStore.setItemAsync(StorageKeys.CATEGORIES, JSON.stringify(categories));
    }
  }

  // Payment Methods
  static async getPaymentMethods(): Promise<any[]> {
    const storageType = await this.getStorageType();
    
    if (this.isOnlineMode(storageType)) {
      return await GoogleSheetsService.getPaymentMethods();
    } else {
      const stored = await SecureStore.getItemAsync(StorageKeys.PAYMENT_METHODS);
      return stored ? JSON.parse(stored) : [];
    }
  }

  static async savePaymentMethods(methods: any[]): Promise<void> {
    const storageType = await this.getStorageType();
    
    if (this.isOnlineMode(storageType)) {
      await GoogleSheetsService.savePaymentMethods(methods);
    } else {
      await SecureStore.setItemAsync(StorageKeys.PAYMENT_METHODS, JSON.stringify(methods));
    }
  }

  // Transactions
  static async getTransactions(): Promise<any[]> {
    const storageType = await this.getStorageType();
    
    if (this.isOnlineMode(storageType)) {
      return await GoogleSheetsService.getTransactions();
    } else {
      const stored = await SecureStore.getItemAsync(StorageKeys.TRANSACTIONS);
      return stored ? JSON.parse(stored) : [];
    }
  }

  static async saveTransactions(transactions: any[]): Promise<void> {
    const storageType = await this.getStorageType();
    
    if (this.isOnlineMode(storageType)) {
      await GoogleSheetsService.saveTransactions(transactions);
    } else {
      await SecureStore.setItemAsync(StorageKeys.TRANSACTIONS, JSON.stringify(transactions));
    }
  }

  static async addTransaction(transaction: any): Promise<void> {
    const storageType = await this.getStorageType();
    
    if (this.isOnlineMode(storageType)) {
      await GoogleSheetsService.addTransaction(transaction);
    } else {
      const transactions = await this.getTransactions();
      transactions.push(transaction);
      await this.saveTransactions(transactions);
    }
  }

  static async deleteTransaction(transactionId: string): Promise<void> {
    const storageType = await this.getStorageType();
    
    if (this.isOnlineMode(storageType)) {
      await GoogleSheetsService.deleteTransactionById(transactionId);
    } else {
      const transactions = await this.getTransactions();
      const filtered = transactions.filter((t: any) => t.id !== transactionId);
      await this.saveTransactions(filtered);
    }
  }

  // Keywords
  static async getKeywords(): Promise<any[]> {
    const storageType = await this.getStorageType();
    
    if (this.isOnlineMode(storageType)) {
      return await GoogleSheetsService.getKeywords();
    } else {
      const stored = await SecureStore.getItemAsync(StorageKeys.BANK_KEYWORDS);
      return stored ? JSON.parse(stored) : [];
    }
  }

  static async saveKeywords(keywords: any[]): Promise<void> {
    const storageType = await this.getStorageType();
    
    if (this.isOnlineMode(storageType)) {
      await GoogleSheetsService.saveKeywords(keywords);
    } else {
      await SecureStore.setItemAsync(StorageKeys.BANK_KEYWORDS, JSON.stringify(keywords));
    }
  }

  // Approved Senders
  static async getApprovedSenders(): Promise<any[]> {
    const storageType = await this.getStorageType();
    
    if (this.isOnlineMode(storageType)) {
      return await GoogleSheetsService.getApprovedSenders();
    } else {
      const stored = await SecureStore.getItemAsync(StorageKeys.APPROVED_SENDERS);
      return stored ? JSON.parse(stored) : [];
    }
  }

  static async saveApprovedSenders(senders: any[]): Promise<void> {
    const storageType = await this.getStorageType();
    
    if (this.isOnlineMode(storageType)) {
      await GoogleSheetsService.saveApprovedSenders(senders);
    } else {
      await SecureStore.setItemAsync(StorageKeys.APPROVED_SENDERS, JSON.stringify(senders));
    }
  }
}