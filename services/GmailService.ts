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
      
      // Add default keywords if not already present
      const defaultKeywords = ['Jupiter', 'HDFC', 'BOI', 'SBI', 'UPI', 'Credited', 'Debited', 'Salary'];
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
      
      // Check if it's a UPI transaction
      const isUpiTransaction = subject.toLowerCase().includes('you have done a upi txn') || 
                               subject.toLowerCase().includes('upi payment was successful') ||
                               fullMessage.toLowerCase().includes('upi transaction') ||
                               fullMessage.toLowerCase().includes('your upi payment');
      
      let merchant = 'Unknown';
      let amount = '0.00';
      let paymentMethod = 'UPI';
      
      if (isUpiTransaction) {
        // Extract amount - handle both ₹230 and Rs. 230 formats
        const amountMatch = fullMessage.match(/(?:You paid|Rs\.?|₹)\s*(\d+(?:,\d+)*(?:\.\d{2})?)/i);
        amount = amountMatch ? amountMatch[1].replace(/,/g, '') : '0.00';
        
        // Extract merchant name - look for "Paid to" section
        const paidToMatch = fullMessage.match(/Paid to[\s\n]+([A-Z][A-Z\s&]+?)(?:[\s\n]+[a-z0-9@]|$)/i);
        if (paidToMatch) {
          merchant = paidToMatch[1].trim();
        } else {
          // Fallback: Extract merchant name (after UPI ID)
          const upiMerchantMatch = fullMessage.match(/to\s+[A-Z0-9]+@[a-z]+\s+([A-Z][A-Z\s]+?)(?:\s+on|\.|$)/i);
          if (upiMerchantMatch) {
            merchant = upiMerchantMatch[1].trim();
          } else {
            const nameMatch = fullMessage.match(/to\s+[^\s]+\s+([A-Z][A-Z\s]+?)(?:\s+on|\.|$)/i);
            if (nameMatch) {
              merchant = nameMatch[1].trim();
            }
          }
        }
        
        // Extract payment method
        const cardMatch = fullMessage.match(/(RuPay|Visa|Mastercard)\s+(?:Credit|Debit)\s+Card\s+(?:XX)?(\d{4})/i);
        if (cardMatch) {
          paymentMethod = `${cardMatch[1]} Card ending ${cardMatch[2]}`;
        }
      } else {
        const amountMatch = fullMessage.match(/(?:Rs\.?|₹)\s*(\d+(?:,\d+)*(?:\.\d{2})?)/i);
        amount = amountMatch ? amountMatch[1].replace(/,/g, '') : '0.00';
        
        const toMatch = fullMessage.match(/to\s+([A-Z][A-Za-z\s]+?)(?:\s+on|\.|$)/i);
        if (toMatch) {
          merchant = toMatch[1].trim();
        } else {
          merchant = this.extractSenderName(fromHeader?.value || '');
        }
        
        const cardMatch = fullMessage.match(/(RuPay|Visa|Mastercard|Credit|Debit)\s+(?:Credit|Debit)?\s*Card\s+(?:XX)?(\d{4})/i);
        if (cardMatch) {
          paymentMethod = `${cardMatch[1]} Card ending ${cardMatch[2]}`;
        } else {
          paymentMethod = 'Unknown';
        }
      }

      const category = this.categorizeTransaction(merchant, fullMessage);
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
    if (lowerMerchant.includes('restaurant') || lowerMerchant.includes('cafe') || lowerMerchant.includes('sweets') ||
        lowerMerchant.includes('food') || lowerMerchant.includes('kitchen') || lowerMerchant.includes('dhaba') ||
        lowerContent.includes('food') || lowerContent.includes('sweet') || lowerContent.includes('dinner') ||
        lowerContent.includes('lunch') || lowerContent.includes('breakfast') || lowerContent.includes('meal') ||
        lowerMerchant.includes('swiggy') || lowerMerchant.includes('zomato') || lowerContent.includes('food delivery')) {
      return 'Food & Dining';
    }
    
    // Shopping
    if (lowerMerchant.includes('amazon') || lowerMerchant.includes('flipkart') || lowerContent.includes('shopping') ||
        lowerMerchant.includes('store') || lowerMerchant.includes('mart') || lowerMerchant.includes('mall')) {
      return 'Shopping';
    }
    
    // Transport
    if (lowerMerchant.includes('uber') || lowerMerchant.includes('ola') || lowerContent.includes('ride') ||
        lowerMerchant.includes('taxi') || lowerMerchant.includes('cab') || lowerContent.includes('transport')) {
      return 'Transport';
    }
    
    // Entertainment
    if (lowerMerchant.includes('netflix') || lowerMerchant.includes('spotify') || lowerContent.includes('subscription') ||
        lowerMerchant.includes('movie') || lowerMerchant.includes('cinema') || lowerContent.includes('entertainment')) {
      return 'Entertainment';
    }
    
    // Groceries
    if (lowerContent.includes('grocery') || lowerContent.includes('supermarket') || lowerMerchant.includes('grocery') ||
        lowerMerchant.includes('vegetables') || lowerMerchant.includes('fruits')) {
      return 'Groceries';
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
