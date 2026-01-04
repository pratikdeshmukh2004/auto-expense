import * as SecureStore from 'expo-secure-store';

export class AuthService {
  private static readonly USER_TOKEN_KEY = 'user_token';
  private static readonly USER_MPIN_KEY = 'user_mpin';

  static async isLoggedIn(): Promise<boolean> {
    try {
      const token = await SecureStore.getItemAsync(this.USER_TOKEN_KEY);
      return !!token;
    } catch {
      return false;
    }
  }

  static async login(email: string, password: string): Promise<boolean> {
    // Simulate login - in real app, call your API
    if (email && password) {
      await SecureStore.setItemAsync(this.USER_TOKEN_KEY, 'dummy_token');
      return true;
    }
    return false;
  }

  static async logout(): Promise<void> {
    await SecureStore.deleteItemAsync(this.USER_TOKEN_KEY);
  }

  static async getMpin(): Promise<string | null> {
    return await SecureStore.getItemAsync(this.USER_MPIN_KEY);
  }

  static async setMpin(mpin: string): Promise<void> {
    await SecureStore.setItemAsync(this.USER_MPIN_KEY, mpin);
  }
}