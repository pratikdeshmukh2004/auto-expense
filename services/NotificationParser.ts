import * as SecureStore from 'expo-secure-store';
import { Platform } from 'react-native';

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
  private static readonly KEYWORDS_KEY = 'bank_keywords';
  private static readonly TRANSACTIONS_KEY = 'parsed_transactions';
  private static readonly APPROVED_SENDERS_KEY = 'approved_senders';

  static async requestPermissions(): Promise<boolean> {
    // Notification permissions removed due to Expo Go SDK 53+ limitations
    return true;
  }

  static async getKeywords(): Promise<string[]> {
    const stored = await SecureStore.getItemAsync(this.KEYWORDS_KEY);
    return stored ? JSON.parse(stored) : ['HDFC', 'SBI', 'ICICI', 'Axis', 'Kotak', 'BOI', 'PNB', 'Canara', 'Union', 'BOB', 'IDBI', 'Indian', 'Central', 'UCO', 'Syndicate', 'Allahabad', 'Andhra', 'Corporation', 'Dena', 'Indian Overseas', 'Oriental', 'Punjab', 'Vijaya', 'United', 'State Bank', 'Bank of India', 'Bank of Baroda', 'Federal', 'Jupiter', 'Paytm', 'PhonePe', 'Google Pay', 'Amazon Pay'];
  }

  static async saveKeywords(keywords: string[]): Promise<void> {
    await SecureStore.setItemAsync(this.KEYWORDS_KEY, JSON.stringify(keywords));
  }

  static async getApprovedSenders(): Promise<string[]> {
    const stored = await SecureStore.getItemAsync(this.APPROVED_SENDERS_KEY);
    return stored ? JSON.parse(stored) : [];
  }

  static async addApprovedSender(sender: string, category: string): Promise<void> {
    const stored = await SecureStore.getItemAsync(this.APPROVED_SENDERS_KEY);
    const senders = stored ? JSON.parse(stored) : [];
    const existing = senders.find((s: any) => s.sender === sender);
    if (!existing) {
      senders.push({ sender, category });
      await SecureStore.setItemAsync(this.APPROVED_SENDERS_KEY, JSON.stringify(senders));
    }
  }

  static async saveApprovedSenders(senders: any[]): Promise<void> {
    await SecureStore.setItemAsync(this.APPROVED_SENDERS_KEY, JSON.stringify(senders));
  }

  static async getApprovedSenderCategory(sender: string): Promise<string | null> {
    const stored = await SecureStore.getItemAsync(this.APPROVED_SENDERS_KEY);
    if (!stored) return null;
    const senders = JSON.parse(stored);
    const found = senders.find((s: any) => s.sender === sender);
    return found ? found.category : null;
  }

  static parseTransactionMessage(message: string): ParsedTransaction | null {
    const transactionPatterns = [
      // Bank debit patterns
      /(?:debit|debited|spent).*?(?:rs\.?|₹|\$)\s*(\d+(?:\.\d{2})?)\s*(?:at|from|to)?\s*([a-zA-Z0-9\s]+)/i,
      // UPI patterns
      /UPI.*?(\d+(?:\.\d{2})?)\s*(?:to|from)\s*([a-zA-Z0-9\s@]+)/i,
      // Card transaction patterns
      /(?:card|payment).*?(\d+(?:\.\d{2})?)\s*(?:at|to)\s*([a-zA-Z0-9\s]+)/i,
    ];

    for (const pattern of transactionPatterns) {
      const match = message.match(pattern);
      if (match) {
        const amount = match[1];
        let merchant = match[2]?.trim().replace(/[^\w\s]/g, '').trim() || 'Unknown';
        
        // Clean merchant name
        merchant = merchant.split(/\s+/).slice(0, 2).join(' ');
        
        const category = this.categorizeTransaction(merchant, message);
        
        return {
          id: Date.now().toString(),
          merchant,
          amount,
          category,
          rawMessage: message,
          timestamp: new Date(),
          status: this.shouldReview(merchant, amount) ? 'needs_review' : 'parsed'
        };
      }
    }
    
    return null;
  }

  private static categorizeTransaction(merchant: string, message: string): string {
    const categories = {
      'Groceries': ['walmart', 'target', 'whole foods', 'kroger', 'safeway'],
      'Dining Out': ['starbucks', 'mcdonalds', 'subway', 'pizza', 'restaurant'],
      'Entertainment': ['netflix', 'spotify', 'amazon prime', 'disney'],
      'Transportation': ['uber', 'lyft', 'gas', 'fuel', 'parking'],
      'Shopping': ['amazon', 'ebay', 'apple', 'google'],
      'Bills': ['electric', 'water', 'internet', 'phone', 'insurance']
    };

    const lowerMerchant = merchant.toLowerCase();
    const lowerMessage = message.toLowerCase();

    for (const [category, keywords] of Object.entries(categories)) {
      if (keywords.some(keyword => 
        lowerMerchant.includes(keyword) || lowerMessage.includes(keyword)
      )) {
        return category;
      }
    }

    return 'Other';
  }

  private static shouldReview(merchant: string, amount: string): boolean {
    const amountNum = parseFloat(amount);
    return amountNum > 100 || merchant === 'Unknown' || merchant.length < 3;
  }

  static async getTransactions(): Promise<ParsedTransaction[]> {
    const stored = await SecureStore.getItemAsync(this.TRANSACTIONS_KEY);
    return stored ? JSON.parse(stored) : [];
  }

  static async saveTransaction(transaction: ParsedTransaction): Promise<void> {
    const transactions = await this.getTransactions();
    transactions.unshift(transaction);
    // Keep only last 50 transactions
    const limited = transactions.slice(0, 50);
    await SecureStore.setItemAsync(this.TRANSACTIONS_KEY, JSON.stringify(limited));
  }

  static async updateTransaction(id: string, updates: Partial<ParsedTransaction>): Promise<void> {
    const transactions = await this.getTransactions();
    const index = transactions.findIndex(t => t.id === id);
    if (index !== -1) {
      transactions[index] = { ...transactions[index], ...updates };
      await SecureStore.setItemAsync(this.TRANSACTIONS_KEY, JSON.stringify(transactions));
    }
  }

  static async deleteTransaction(id: string): Promise<void> {
    const transactions = await this.getTransactions();
    const filtered = transactions.filter(t => t.id !== id);
    await SecureStore.setItemAsync(this.TRANSACTIONS_KEY, JSON.stringify(filtered));
  }

  static async addTransaction(transaction: ParsedTransaction): Promise<void> {
    const transactions = await this.getTransactions();
    transactions.unshift(transaction);
    const limited = transactions.slice(0, 50);
    await SecureStore.setItemAsync(this.TRANSACTIONS_KEY, JSON.stringify(limited));
  }

  static async startListening(): Promise<void> {
    // Start Android notification listener if available
    if (Platform.OS === 'android') {
      try {
        const { AndroidNotificationListener } = await import('./AndroidNotificationListener');
        await AndroidNotificationListener.startListening();
      } catch (error) {
        console.log('Android notification listener not available');
      }
    }
  }

  private static isTransactionMessage(message: string): boolean {
    const bankKeywords = ['debit', 'credit', 'payment', 'transaction', 'upi', 'spent', 'charged'];
    const lowerMessage = message.toLowerCase();
    return bankKeywords.some(keyword => lowerMessage.includes(keyword));
  }
}