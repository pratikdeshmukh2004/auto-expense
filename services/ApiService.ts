import * as SecureStore from 'expo-secure-store';

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
    const url = await SecureStore.getItemAsync(API_URL_KEY);
    return url || '';
  }

  static async hasApiUrl(): Promise<boolean> {
    const url = await SecureStore.getItemAsync(API_URL_KEY);
    return !!url;
  }

  static async setApiUrl(url: string): Promise<void> {
    await SecureStore.setItemAsync(API_URL_KEY, url);
  }

  static async clearApiUrl(): Promise<void> {
    await SecureStore.deleteItemAsync(API_URL_KEY);
  }

  static async getTransactions(): Promise<ApiTransaction[]> {
    const url = await this.getApiUrl();
    if (!url) throw new Error('NO_API_URL');
    const response = await fetch(url);
    const json = await response.json();
    if (!json.data || !Array.isArray(json.data)) throw new Error('INVALID_RESPONSE');
    return json.data;
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
