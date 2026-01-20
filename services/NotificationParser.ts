import * as SecureStore from 'expo-secure-store';
import { StorageKeys } from '../constants/StorageKeys';
import { StorageService } from './StorageService';

interface ParsedTransaction {
  id: string;
  merchant: string;
  amount: string;
  category: string;
  rawMessage: string;
  timestamp: Date;
  status: 'parsed' | 'needs_review';
}

export class NotificationParser {
  static async getKeywords(): Promise<string[]> {
    const keywords = await StorageService.getKeywords();
    return keywords.map((k: any) => k.keyword || k);
  }

  static async saveKeywords(keywords: string[]): Promise<void> {
    const keywordObjects = keywords.map((keyword, index) => ({
      id: (index + 1).toString(),
      keyword,
      category: 'expense'
    }));
    await StorageService.saveKeywords(keywordObjects);
  }

  static async getApprovedSenders(): Promise<any[]> {
    return await StorageService.getApprovedSenders();
  }

  static async addApprovedSender(sender: string, paymentMethod: string): Promise<void> {
    const senders = await StorageService.getApprovedSenders();
    const existing = senders.find((s: any) => s.sender === sender);
    if (!existing) {
      senders.push({ sender, paymentMethod });
      await StorageService.saveApprovedSenders(senders);
    }
  }

  static async saveApprovedSenders(senders: any[]): Promise<void> {
    await StorageService.saveApprovedSenders(senders);
  }

  static async getApprovedSenderCategory(sender: string): Promise<string | null> {
    const stored = await SecureStore.getItemAsync(StorageKeys.APPROVED_SENDERS);
    if (!stored) return null;
    const senders = JSON.parse(stored);
    const found = senders.find((s: any) => s.sender === sender);
    return found ? found.category : null;
  }
}