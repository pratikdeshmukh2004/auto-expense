import * as SecureStore from 'expo-secure-store';

const DEFAULT_API_URL = 'https://script.google.com/macros/s/AKfycbzzAVWc8Yg-BYJoipLHIvJNaQdDr53CLiru6csh9CtQU7eeIO2ywDYW7BkHGpw4Opdx2w/exec';
const API_URL_KEY = 'app_api_url';

export interface ApiTransaction {
  Date: string;
  'Paid to': string;
  Category: string;
  Description: string;
  Amount: number;
  'Paid By': string;
  Type: string;
  Month: string;
  Year: number;
}

export interface ApiAddPayload {
  date: string;
  paidTo: string;
  category: string;
  description: string;
  amount: number;
  paidBy: string;
  type: string;
}

export class ApiService {
  static async getApiUrl(): Promise<string> {
    try {
      const url = await SecureStore.getItemAsync(API_URL_KEY);
      return url || DEFAULT_API_URL;
    } catch {
      return DEFAULT_API_URL;
    }
  }

  static async setApiUrl(url: string): Promise<void> {
    await SecureStore.setItemAsync(API_URL_KEY, url);
  }

  static async getTransactions(): Promise<ApiTransaction[]> {
    try {
      const url = await this.getApiUrl();
      const response = await fetch(url);
      const json = await response.json();
      return json.data || [];
    } catch (error) {
      console.error('Failed to fetch transactions:', error);
      return [];
    }
  }

  static async addTransaction(payload: ApiAddPayload): Promise<boolean> {
    try {
      const url = await this.getApiUrl();
      const response = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      const json = await response.json();
      return json.status === 'success' || response.ok;
    } catch (error) {
      console.error('Failed to add transaction:', error);
      return false;
    }
  }
}
