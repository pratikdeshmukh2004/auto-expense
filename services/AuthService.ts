import {
  GoogleSignin,
  statusCodes,
} from '@react-native-google-signin/google-signin';
import * as SecureStore from 'expo-secure-store';

export class AuthService {
  private static readonly USER_TOKEN_KEY = 'user_token';
  private static readonly USER_MPIN_KEY = 'user_mpin';
  private static readonly USER_GUEST_KEY = 'user_is_guest';

  static async isLoggedIn(): Promise<boolean> {
    try {
      const token = await SecureStore.getItemAsync(this.USER_TOKEN_KEY);
      const isGuest = await SecureStore.getItemAsync(this.USER_GUEST_KEY);
      return !!token || !!isGuest;
    } catch {
      return false;
    }
  }

  static async loginAsGuest(): Promise<boolean> {
    try {
      await SecureStore.setItemAsync(this.USER_GUEST_KEY, 'true');
      return true;
    } catch {
      return false;
    }
  }

  static async isGuest(): Promise<boolean> {
    const isGuest = await SecureStore.getItemAsync(this.USER_GUEST_KEY);
    return isGuest === 'true';
  }

  static async login(email: string, password: string): Promise<boolean> {
    // Simulate login - in real app, call your API
    if (email && password) {
      await SecureStore.setItemAsync(this.USER_TOKEN_KEY, 'dummy_token');
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
      console.log(userInfo, 'user...');
      
      if (userInfo.data?.idToken) {
        await SecureStore.setItemAsync(this.USER_TOKEN_KEY, userInfo.data.idToken);
        if (userInfo.data.user.name) {
          await SecureStore.setItemAsync('user_name', userInfo.data.user.name);
        }
        if (userInfo.data.user.email) {
          await SecureStore.setItemAsync('user_email', userInfo.data.user.email);
        }
        if (userInfo.data.user.photo) {
          await SecureStore.setItemAsync('user_photo', userInfo.data.user.photo);
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
      } else {
      }
      return false;
    }
  }

  static async logout(): Promise<void> {
    await SecureStore.deleteItemAsync(this.USER_TOKEN_KEY);
    await SecureStore.deleteItemAsync('user_name');
    await SecureStore.deleteItemAsync('user_email');
    await SecureStore.deleteItemAsync('user_photo'); // Added
    await SecureStore.deleteItemAsync(this.USER_GUEST_KEY);
  }

  static async deleteAccount(): Promise<void> {
    await this.logout();
    
    // Clear Auth & Security
    await SecureStore.deleteItemAsync(this.USER_MPIN_KEY);
    await SecureStore.deleteItemAsync('biometric_enabled');
    
    // Clear User Data
    await SecureStore.deleteItemAsync('app_transactions');
    await SecureStore.deleteItemAsync('user_categories');
    await SecureStore.deleteItemAsync('user_payment_methods');
  }

  static async getMpin(): Promise<string | null> {
    return await SecureStore.getItemAsync(this.USER_MPIN_KEY);
  }

  static async setMpin(mpin: string): Promise<void> {
    await SecureStore.setItemAsync(this.USER_MPIN_KEY, mpin);
  }

  static async getUserName(): Promise<string | null> {
    return await SecureStore.getItemAsync('user_name');
  }

  static async getUserEmail(): Promise<string | null> {
    return await SecureStore.getItemAsync('user_email');
  }

  static async getUserPhoto(): Promise<string | null> {
    return await SecureStore.getItemAsync('user_photo');
  }
}

function isErrorWithCode(error: unknown): error is { code: string } {
  return typeof error === 'object' && error !== null && 'code' in error;
}