import { GoogleSheetsService } from './GoogleSheetsService';

export class StorageService {
  // Categories
  static async getCategories(): Promise<any[]> {
    return await GoogleSheetsService.getCategories();
  }

  static async saveCategories(categories: any[]): Promise<void> {
    await GoogleSheetsService.saveCategories(categories);
  }

  // Payment Methods
  static async getPaymentMethods(): Promise<any[]> {
    return await GoogleSheetsService.getPaymentMethods();
  }

  static async savePaymentMethods(methods: any[]): Promise<void> {
    await GoogleSheetsService.savePaymentMethods(methods);
  }

  // Transactions
  static async getTransactions(): Promise<any[]> {
    return await GoogleSheetsService.getTransactions();
  }

  static async saveTransactions(transactions: any[]): Promise<void> {
    await GoogleSheetsService.saveTransactions(transactions);
  }

  static async addTransaction(transaction: any): Promise<void> {
    await GoogleSheetsService.addTransaction(transaction);
  }

  static async deleteTransaction(transactionId: string): Promise<void> {
    await GoogleSheetsService.deleteTransactionById(transactionId);
  }

  // Keywords
  static async getKeywords(): Promise<any[]> {
    return await GoogleSheetsService.getKeywords();
  }

  static async saveKeywords(keywords: any[]): Promise<void> {
    await GoogleSheetsService.saveKeywords(keywords);
  }

  // Approved Senders
  static async getApprovedSenders(): Promise<any[]> {
    return await GoogleSheetsService.getApprovedSenders();
  }

  static async saveApprovedSenders(senders: any[]): Promise<void> {
    await GoogleSheetsService.saveApprovedSenders(senders);
  }
}
