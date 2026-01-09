import * as AuthSession from 'expo-auth-session';
import * as WebBrowser from 'expo-web-browser';
import * as SecureStore from 'expo-secure-store';
import { GOOGLE_WEB_CLIENT_ID, GOOGLE_CLIENT_SECRET } from '@env';

WebBrowser.maybeCompleteAuthSession();

interface UserInfo {
  id: string;
  name: string;
  email: string;
  photo?: string;
}

export class AuthService {
  private static readonly USER_TOKEN_KEY = 'user_token';
  private static readonly USER_MPIN_KEY = 'user_mpin';
  private static readonly USER_INFO_KEY = 'user_info';

  static async initialize(): Promise<void> {
    // No initialization needed
  }

  static async isLoggedIn(): Promise<boolean> {
    try {
      const token = await SecureStore.getItemAsync(this.USER_TOKEN_KEY);
      return !!token;
    } catch {
      return false;
    }
  }

  static async googleSignIn(): Promise<boolean> {
    try {
      const redirectUri = AuthSession.makeRedirectUri({
        scheme: 'autoexpense',
        path: 'auth'
      });
      
      const clientId = GOOGLE_WEB_CLIENT_ID;
      
      const authUrl = `https://accounts.google.com/o/oauth2/v2/auth?` +
        `client_id=${clientId}&` +
        `redirect_uri=${encodeURIComponent(redirectUri)}&` +
        `response_type=code&` +
        `scope=${encodeURIComponent('openid profile email')}&` +
        `access_type=offline`;

      const result = await WebBrowser.openAuthSessionAsync(authUrl, redirectUri);
      
      if (result.type === 'success' && result.url) {
        const url = new URL(result.url);
        const code = url.searchParams.get('code');
        
        if (code) {
          const tokenResponse = await fetch('https://oauth2.googleapis.com/token', {
            method: 'POST',
            headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
            body: new URLSearchParams({
              client_id: clientId,
              client_secret: GOOGLE_CLIENT_SECRET,
              code: code,
              grant_type: 'authorization_code',
              redirect_uri: redirectUri,
            }),
          });

          const tokens = await tokenResponse.json();
          
          if (tokens.access_token) {
            const userResponse = await fetch('https://www.googleapis.com/oauth2/v2/userinfo', {
              headers: { Authorization: `Bearer ${tokens.access_token}` },
            });
            
            const userData = await userResponse.json();
            
            const user: UserInfo = {
              id: userData.id,
              name: userData.name || '',
              email: userData.email,
              photo: userData.picture,
            };
            
            await SecureStore.setItemAsync(this.USER_TOKEN_KEY, tokens.access_token);
            await SecureStore.setItemAsync(this.USER_INFO_KEY, JSON.stringify(user));
            return true;
          }
        }
      }
      return false;
    } catch (error) {
      console.error('Google Sign-In error:', error);
      return false;
    }
  }

  static async getUserInfo(): Promise<UserInfo | null> {
    try {
      const userInfoStr = await SecureStore.getItemAsync(this.USER_INFO_KEY);
      return userInfoStr ? JSON.parse(userInfoStr) : null;
    } catch {
      return null;
    }
  }

  static async setUserInfo(user: UserInfo): Promise<void> {
    await SecureStore.setItemAsync(this.USER_INFO_KEY, JSON.stringify(user));
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
    await SecureStore.deleteItemAsync(this.USER_INFO_KEY);
  }

  static async deleteAccount(): Promise<void> {
    await SecureStore.deleteItemAsync(this.USER_TOKEN_KEY);
    await SecureStore.deleteItemAsync(this.USER_INFO_KEY);
    await SecureStore.deleteItemAsync(this.USER_MPIN_KEY);
  }

  static async getMpin(): Promise<string | null> {
    return await SecureStore.getItemAsync(this.USER_MPIN_KEY);
  }

  static async setMpin(mpin: string): Promise<void> {
    await SecureStore.setItemAsync(this.USER_MPIN_KEY, mpin);
  }
}