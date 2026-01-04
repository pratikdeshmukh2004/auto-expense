import { NativeModules, DeviceEventEmitter } from 'react-native';
import { NotificationParser } from './NotificationParser';

export class AndroidNotificationListener {
  static async requestPermission(): Promise<boolean> {
    try {
      return await NativeModules.NotificationListener?.requestPermission() || false;
    } catch {
      return false;
    }
  }

  static async startListening(): Promise<void> {
    const keywords = await NotificationParser.getKeywords();
    
    DeviceEventEmitter.addListener('onNotificationReceived', async (notification) => {
      const { title, text } = notification;
      const fullText = `${title} ${text}`.toLowerCase();
      
      // Check if any keyword matches
      const hasKeyword = keywords.some(keyword => 
        fullText.includes(keyword.toLowerCase())
      );
      
      if (hasKeyword || this.isTransactionText(fullText)) {
        const parsed = NotificationParser.parseTransactionMessage(text);
        if (parsed) {
          await NotificationParser.addTransaction(parsed);
        }
      }
    });
  }

  private static isTransactionText(text: string): boolean {
    const keywords = ['debited', 'credited', 'payment', 'transaction', 'upi', 'spent', 'charged', 'debit', 'credit'];
    return keywords.some(keyword => text.includes(keyword));
  }
}