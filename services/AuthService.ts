import {
  GoogleSignin,
  statusCodes,
} from '@react-native-google-signin/google-signin';
import * as SecureStore from 'expo-secure-store';
import { StorageKeys } from '../constants/StorageKeys';

export class AuthService {
  static async isLoggedIn(): Promise<boolean> {
    try {
      const token = await SecureStore.getItemAsync(StorageKeys.USER_TOKEN);
      const isGuest = await SecureStore.getItemAsync(StorageKeys.USER_GUEST);
      return !!token || !!isGuest;
    } catch {
      return false;
    }
  }

  static async loginAsGuest(): Promise<boolean> {
    try {
      await SecureStore.setItemAsync(StorageKeys.USER_GUEST, 'true');
      return true;
    } catch {
      return false;
    }
  }

  static async isGuest(): Promise<boolean> {
    const isGuest = await SecureStore.getItemAsync(StorageKeys.USER_GUEST);
    return isGuest === 'true';
  }

  static async login(email: string, password: string): Promise<boolean> {
    // Simulate login - in real app, call your API
    if (email && password) {
      await SecureStore.setItemAsync(StorageKeys.USER_TOKEN, 'dummy_token');
      return true;
    }
    return false;
  }

  static async signInWithGoogle(): Promise<boolean> {
    try {
      GoogleSignin.configure({
        scopes: [
          'https://www.googleapis.com/auth/drive',
          'https://www.googleapis.com/auth/spreadsheets',
          'https://www.googleapis.com/auth/gmail.readonly'
        ],
        webClientId: '801866874360-96td9gafiulbleuhoh73kbniin47csj0.apps.googleusercontent.com',
        iosClientId: '801866874360-m23kvuibisrtk6i36gq3ghveieu6fd94.apps.googleusercontent.com',
      });
      await GoogleSignin.hasPlayServices();
      const userInfo = await GoogleSignin.signIn();
      
      if (userInfo.data?.idToken) {
        await SecureStore.setItemAsync(StorageKeys.USER_TOKEN, userInfo.data.idToken);
        // Store user info for later retrieval
        if (userInfo.data.user) {
          await SecureStore.setItemAsync(StorageKeys.USER_NAME, userInfo.data.user.name || '');
          await SecureStore.setItemAsync(StorageKeys.USER_EMAIL, userInfo.data.user.email || '');
          await SecureStore.setItemAsync(StorageKeys.USER_PHOTO, userInfo.data.user.photo || '');
        }
        return true;
      }
      return false;
    } catch (error) {
      console.log(error, 'error...')
      if (isErrorWithCode(error)) {
        switch (error.code) {
          case statusCodes.SIGN_IN_CANCELLED:
            console.log('User cancelled the login flow');
            break;
          case statusCodes.IN_PROGRESS:
            console.log('Sign in is in progress already');
            break;
          case statusCodes.PLAY_SERVICES_NOT_AVAILABLE:
            console.log('Play services not available or outdated');
            break;
          default:
            console.error('Some other error happened', error);
        }
      }
      return false;
    }
  }

  static async logout(): Promise<void> {
    await SecureStore.deleteItemAsync(StorageKeys.USER_TOKEN);
    await SecureStore.deleteItemAsync(StorageKeys.USER_GUEST);
    await SecureStore.deleteItemAsync(StorageKeys.USER_NAME);
    await SecureStore.deleteItemAsync(StorageKeys.USER_EMAIL);
    await SecureStore.deleteItemAsync(StorageKeys.USER_PHOTO);
  }

  static async deleteAccount(): Promise<void> {
    await this.logout();
    
    // Clear Auth & Security
    await SecureStore.deleteItemAsync(StorageKeys.USER_MPIN);
    await SecureStore.deleteItemAsync(StorageKeys.BIOMETRIC_ENABLED);
    
    // Clear User Data
    await SecureStore.deleteItemAsync(StorageKeys.TRANSACTIONS);
    await SecureStore.deleteItemAsync(StorageKeys.CATEGORIES);
    await SecureStore.deleteItemAsync(StorageKeys.PAYMENT_METHODS);
    await SecureStore.deleteItemAsync(StorageKeys.BANK_KEYWORDS);
    await SecureStore.deleteItemAsync(StorageKeys.STORAGE_TYPE);
    await SecureStore.deleteItemAsync(StorageKeys.PARSED_TRANSACTIONS);
    await SecureStore.deleteItemAsync(StorageKeys.APPROVED_SENDERS);
    await SecureStore.deleteItemAsync(StorageKeys.LAST_EMAIL_SYNC);
    await SecureStore.deleteItemAsync(StorageKeys.AUTO_PARSING_ENABLED);
  }

  static async getMpin(): Promise<string | null> {
    return await SecureStore.getItemAsync(StorageKeys.USER_MPIN);
  }

  static async setMpin(mpin: string): Promise<void> {
    await SecureStore.setItemAsync(StorageKeys.USER_MPIN, mpin);
  }

  static async getUserName(): Promise<string | null> {
    return await SecureStore.getItemAsync(StorageKeys.USER_NAME);
  }

  static async getUserEmail(): Promise<string | null> {
    return await SecureStore.getItemAsync(StorageKeys.USER_EMAIL);
  }

  static async getUserPhoto(): Promise<string | null> {
    return await SecureStore.getItemAsync(StorageKeys.USER_PHOTO);
  }

  static async getStorageType(): Promise<string | null> {
    return await SecureStore.getItemAsync(StorageKeys.STORAGE_TYPE);
  }
}

function isErrorWithCode(error: unknown): error is { code: string } {
  return typeof error === 'object' && error !== null && 'code' in error;
}