import { NotificationParser } from './NotificationParser';

interface ParsedTransaction {
  id: string;
  type: 'email';
  sender: string;
  time: string;
  date: string;
  message: string;
  merchant: string;
  amount: string;
  category: string;
  paymentMethod?: string;
}

export class GmailService {
  private static readonly GMAIL_API_BASE = 'https://gmail.googleapis.com/gmail/v1';

  static async getAccessToken(): Promise<string | null> {
    try {
      const { GoogleSignin } = await import('@react-native-google-signin/google-signin');
      
      try {
        const tokens = await GoogleSignin.getTokens();
        return tokens.accessToken;
      } catch (tokenError: any) {
        if (tokenError.message?.includes('getTokens requires a user to be signed in')) {
          console.log('Token expired, attempting to refresh...');
          try {
            await GoogleSignin.signInSilently();
            const tokens = await GoogleSignin.getTokens();
            return tokens.accessToken;
          } catch (refreshError) {
            console.error('Failed to refresh token:', refreshError);
            return null;
          }
        }
        throw tokenError;
      }
    } catch (error) {
      console.error('Error getting access token:', error);
      return null;
    }
  }

  static async fetchTransactionEmails(): Promise<ParsedTransaction[]> {
    try {
      const SecureStore = await import('expo-secure-store');
      const autoParsingEnabled = await SecureStore.getItemAsync('auto_parsing_enabled');
      if (autoParsingEnabled === 'false') {
        console.log('Auto-parsing is disabled');
        return [];
      }

      const token = await this.getAccessToken();
      if (!token) {
        console.log('No access token found');
        return [];
      }

      let keywords = await NotificationParser.getKeywords();
      
      // Add comprehensive default keywords if not already present
      const defaultKeywords = [
        // Banks
        'Jupiter', 'HDFC', 'ICICI', 'SBI', 'Axis', 'Kotak', 'IDFC', 'Yes Bank', 'IndusInd',
        'BOI', 'Bank of India', 'PNB', 'Canara', 'Union Bank', 'BOB', 'Federal',
        // Payment Apps
        'Paytm', 'PhonePe', 'Google Pay', 'GPay', 'Amazon Pay', 'Mobikwik', 'Freecharge',
        // Transaction Keywords
        'UPI', 'NEFT', 'IMPS', 'RTGS', 'Credited', 'Debited', 'Paid', 'Received',
        'Transaction', 'Payment', 'Transfer', 'Salary', 'Refund', 'Cashback',
        // Card Networks
        'Visa', 'Mastercard', 'RuPay', 'Amex', 'Diners'
      ];
      const newKeywords = defaultKeywords.filter(k => !keywords.includes(k));
      if (newKeywords.length > 0) {
        keywords = [...keywords, ...newKeywords];
        await NotificationParser.saveKeywords(keywords);
      }
      
      if (keywords.length === 0) {
        console.log('No keywords configured');
        return [];
      }

      const keywordQuery = keywords.join(' OR ');

      const oneMonthAgo = new Date();
      oneMonthAgo.setMonth(oneMonthAgo.getMonth() - 1);
      const afterDate = oneMonthAgo.toISOString().split('T')[0].replace(/-/g, '/');

      const query = `(${keywordQuery}) after:${afterDate}`;
      const searchUrl = `${this.GMAIL_API_BASE}/users/me/messages?q=${encodeURIComponent(query)}&maxResults=10`;

      const searchResponse = await fetch(searchUrl, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      
      if (!searchResponse.ok) {
        console.log('Search failed:', searchResponse.status);
        return [];
      }

      const searchData = await searchResponse.json();
      if (!searchData.messages) {
        console.log('No messages found');
        return [];
      }

      console.log(`Found ${searchData.messages.length} messages`);

      const approvedSenders = await NotificationParser.getApprovedSenders();
      const { TransactionService } = await import('./TransactionService');
      const { PaymentMethodService } = await import('./PaymentMethodService');
      const allTransactions = await TransactionService.getAllTransactions();

      const transactions: ParsedTransaction[] = [];
      for (const msg of searchData.messages.slice(0, 5)) {
        try {
          const messageUrl = `${this.GMAIL_API_BASE}/users/me/messages/${msg.id}`;
          const messageResponse = await fetch(messageUrl, {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          });

          if (messageResponse.ok) {
            const messageData = await messageResponse.json();
            const parsed = this.parseEmailMessage(messageData);
            if (parsed) {
              const isDuplicate = allTransactions.some(t => 
                t.merchant === parsed.merchant && 
                t.amount === parsed.amount && 
                t.date === parsed.date
              );

              if (isDuplicate) {
                console.log('Duplicate transaction, skipping');
                continue;
              }

              const approvedSender = approvedSenders.find((s: any) => s.sender === parsed.sender);
              if (approvedSender) {
                const existingMethods = await PaymentMethodService.getPaymentMethods();
                const methodExists = existingMethods.some(m => m.name === parsed.paymentMethod);

                await TransactionService.addTransaction({
                  merchant: parsed.merchant,
                  amount: parsed.amount,
                  category: approvedSender.category,
                  paymentMethod: methodExists ? (parsed.paymentMethod || 'Other') : 'Other',
                  date: new Date(parsed.date).toISOString(),
                  type: 'expense',
                  status: 'pending',
                  rawMessage: parsed.message,
                  notes: 'Email Automated',
                  sender: parsed.sender,
                });
              } else {
                transactions.push(parsed);
              }
            }
          }
        } catch (msgError) {
          console.error('Error fetching message:', msgError);
        }
      }

      console.log(`Parsed ${transactions.length} transactions`);
      return transactions;
    } catch (error) {
      console.error('Error fetching Gmail messages:', error);
      return [];
    }
  }

  private static parseEmailMessage(messageData: any): ParsedTransaction | null {
    try {
      if (!messageData || !messageData.payload) {
        console.log('Invalid message data');
        return null;
      }

      const headers = messageData.payload.headers || [];
      const fromHeader = headers.find((h: any) => h.name === 'From');
      const dateHeader = headers.find((h: any) => h.name === 'Date');
      const subjectHeader = headers.find((h: any) => h.name === 'Subject');

      // Get full email body by decoding payload
      let fullMessage = messageData.snippet || '';
      
      // Try to get full body from payload
      try {
        if (messageData.payload.body?.data) {
          fullMessage = this.decodeBase64(messageData.payload.body.data);
        } else if (messageData.payload.parts) {
          // Multi-part email, find text/plain part
          const textPart = messageData.payload.parts.find((p: any) => p.mimeType === 'text/plain');
          if (textPart?.body?.data) {
            fullMessage = this.decodeBase64(textPart.body.data);
          }
        }
      } catch (e) {
        // Fallback to snippet if decoding fails
        console.log('Using snippet as fallback');
      }
      
      const subject = subjectHeader?.value || '';
      const combinedText = `${subject} ${fullMessage}`;
      
      // Check if it's a transaction
      const isTransaction = /\b(debited|credited|paid|received|spent|transaction|payment|upi|transfer|purchase)\b/i.test(combinedText);
      if (!isTransaction) return null;
      
      let merchant = 'Unknown';
      let amount = '0.00';
      let paymentMethod = 'Unknown';
      
      // Extract amount - multiple patterns
      const amountPatterns = [
        /(?:rs\.?|inr|₹)\s*(\d+(?:,\d+)*(?:\.\d{2})?)/i,
        /(?:amount|paid|debited|credited|spent)\s*:?\s*(?:rs\.?|inr|₹)?\s*(\d+(?:,\d+)*(?:\.\d{2})?)/i,
        /(\d+(?:,\d+)*(?:\.\d{2})?)\s*(?:rs\.?|inr|₹)/i,
      ];
      
      for (const pattern of amountPatterns) {
        const match = combinedText.match(pattern);
        if (match) {
          amount = match[1].replace(/,/g, '');
          break;
        }
      }
      
      // Extract merchant - multiple patterns
      const merchantPatterns = [
        /(?:paid to|sent to|transferred to|at|merchant)\s*:?\s*([A-Z][A-Za-z0-9\s&.'-]+?)(?:\s+(?:on|via|using|through|for|\.|,|\n|$))/i,
        /(?:to|from)\s+([A-Z][A-Za-z0-9\s&.'-]{3,30})(?:\s+(?:on|via|using|for|\.|,|\n|$))/i,
        /(?:merchant|vendor|store)\s*:?\s*([A-Z][A-Za-z0-9\s&.'-]+)/i,
      ];
      
      for (const pattern of merchantPatterns) {
        const match = combinedText.match(pattern);
        if (match) {
          merchant = match[1].trim()
            .replace(/\s+/g, ' ')
            .replace(/[^A-Za-z0-9\s&.'-]/g, '')
            .substring(0, 30);
          if (merchant.length >= 3) break;
        }
      }
      
      // If still unknown, try to extract from sender
      if (merchant === 'Unknown' || merchant.length < 3) {
        merchant = this.extractSenderName(fromHeader?.value || '');
      }
      
      // Extract payment method
      const cardPatterns = [
        /(visa|mastercard|rupay|amex|diners)\s*(?:credit|debit)?\s*card\s*(?:ending|xx)?\s*(\d{4})/i,
        /card\s*(?:ending|xx)\s*(\d{4})/i,
        /(upi|paytm|phonepe|gpay|google pay|amazon pay)/i,
      ];
      
      for (const pattern of cardPatterns) {
        const match = combinedText.match(pattern);
        if (match) {
          if (match[2]) {
            paymentMethod = `${match[1]} Card ending ${match[2]}`;
          } else {
            paymentMethod = match[1];
          }
          break;
        }
      }

      const category = this.categorizeTransaction(merchant, combinedText);
      const emailDate = new Date(dateHeader?.value || Date.now());
      const timeAgo = this.getTimeAgo(emailDate);

      return {
        id: messageData.id,
        type: 'email',
        sender: fromHeader?.value || 'Unknown',
        time: timeAgo,
        date: emailDate.toISOString(),
        message: fullMessage.substring(0, 500),
        merchant: merchant,
        amount: amount,
        category: category,
        paymentMethod: paymentMethod,
      };
    } catch (error) {
      console.error('Error parsing email message:', error);
      return null;
    }
  }

  private static decodeBase64(data: string): string {
    // Gmail API returns base64url encoded data
    // Replace URL-safe characters and decode
    const base64 = data.replace(/-/g, '+').replace(/_/g, '/');
    try {
      return decodeURIComponent(escape(atob(base64)));
    } catch (e) {
      return atob(base64);
    }
  }

  private static extractSenderName(from: string): string {
    const match = from.match(/^([^<]+)/);
    return match ? match[1].trim() : from;
  }

  private static categorizeTransaction(merchant: string, content: string): string {
    const lowerMerchant = merchant.toLowerCase();
    const lowerContent = content.toLowerCase();

    // Food & Dining
    if (/\b(restaurant|cafe|sweets|food|kitchen|dhaba|pizza|burger|biryani|swiggy|zomato|domino|mcdonald|kfc|subway)\b/i.test(lowerMerchant) ||
        /\b(food|sweet|dinner|lunch|breakfast|meal|dining|restaurant|cafe)\b/i.test(lowerContent)) {
      return 'Food & Dining';
    }
    
    // Shopping
    if (/\b(amazon|flipkart|myntra|ajio|store|mart|mall|shop|retail|fashion|clothing|electronics)\b/i.test(lowerMerchant) ||
        /\b(shopping|purchase|bought|ordered)\b/i.test(lowerContent)) {
      return 'Shopping';
    }
    
    // Transport
    if (/\b(uber|ola|rapido|taxi|cab|metro|bus|train|petrol|diesel|fuel|parking)\b/i.test(lowerMerchant) ||
        /\b(ride|transport|travel|commute|fuel)\b/i.test(lowerContent)) {
      return 'Transport';
    }
    
    // Entertainment
    if (/\b(netflix|prime|hotstar|spotify|youtube|movie|cinema|pvr|inox|bookmyshow|game)\b/i.test(lowerMerchant) ||
        /\b(subscription|entertainment|movie|cinema|streaming|music)\b/i.test(lowerContent)) {
      return 'Entertainment';
    }
    
    // Groceries
    if (/\b(grocery|supermarket|blinkit|zepto|dunzo|bigbasket|dmart|reliance|fresh|vegetable|fruit)\b/i.test(lowerMerchant) ||
        /\b(grocery|groceries|vegetables|fruits|provisions)\b/i.test(lowerContent)) {
      return 'Groceries';
    }
    
    // Bills & Utilities
    if (/\b(electric|electricity|water|gas|internet|broadband|mobile|recharge|bill|utility)\b/i.test(lowerMerchant) ||
        /\b(bill payment|utility|recharge|electricity|water|gas)\b/i.test(lowerContent)) {
      return 'Bills & Utilities';
    }
    
    // Healthcare
    if (/\b(hospital|clinic|doctor|pharmacy|medicine|medical|health|apollo|fortis|max)\b/i.test(lowerMerchant) ||
        /\b(medical|medicine|doctor|hospital|health|pharmacy)\b/i.test(lowerContent)) {
      return 'Healthcare';
    }
    
    return 'Others';
  }

  private static getTimeAgo(date: Date): string {
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    return `${diffDays}d ago`;
  }
}
