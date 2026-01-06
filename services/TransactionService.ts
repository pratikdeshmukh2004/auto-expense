import * as SecureStore from 'expo-secure-store';

export interface Transaction {
  id: string;
  merchant: string;
  amount: string;
  category: string;
  paymentMethod?: string;
  date: string;
  timestamp: Date;
  type: 'expense' | 'income';
  status: 'completed' | 'pending';
  rawMessage?: string;
  notes?: string;
}

export class TransactionService {
  private static readonly TRANSACTIONS_KEY = 'app_transactions';

  static async getTransactions(): Promise<Transaction[]> {
    try {
      const stored = await SecureStore.getItemAsync(this.TRANSACTIONS_KEY);
      if (!stored) return [];
      
      const transactions = JSON.parse(stored);
      return transactions.map((t: any) => ({
        ...t,
        timestamp: new Date(t.timestamp)
      }));
    } catch (error) {
      console.error('Error getting transactions:', error);
      return [];
    }
  }

  static async addTransaction(transaction: Omit<Transaction, 'id' | 'timestamp'>): Promise<Transaction> {
    try {
      const transactions = await this.getTransactions();
      const newTransaction: Transaction = {
        ...transaction,
        id: Date.now().toString(),
        timestamp: transaction.date ? new Date(transaction.date) : new Date()
      };
      
      transactions.unshift(newTransaction);
      await SecureStore.setItemAsync(this.TRANSACTIONS_KEY, JSON.stringify(transactions));
      return newTransaction;
    } catch (error) {
      console.error('Error adding transaction:', error);
      throw error;
    }
  }

  static async updateTransaction(id: string, updates: Partial<Transaction>): Promise<void> {
    try {
      const transactions = await this.getTransactions();
      const index = transactions.findIndex(t => t.id === id);
      
      if (index !== -1) {
        const updatedTransaction = { ...transactions[index], ...updates };
        if (updates.date) {
          updatedTransaction.timestamp = new Date(updates.date);
        }
        transactions[index] = updatedTransaction;
        await SecureStore.setItemAsync(this.TRANSACTIONS_KEY, JSON.stringify(transactions));
      }
    } catch (error) {
      console.error('Error updating transaction:', error);
      throw error;
    }
  }

  static async deleteTransaction(id: string): Promise<void> {
    try {
      const transactions = await this.getTransactions();
      const filtered = transactions.filter(t => t.id !== id);
      await SecureStore.setItemAsync(this.TRANSACTIONS_KEY, JSON.stringify(filtered));
    } catch (error) {
      console.error('Error deleting transaction:', error);
      throw error;
    }
  }

  static async getRecentTransactions(limit: number = 10): Promise<Transaction[]> {
    const transactions = await this.getTransactions();
    return transactions.slice(0, limit);
  }

  static async getTransactionsByCategory(): Promise<{[category: string]: Transaction[]}> {
    const transactions = await this.getTransactions();
    return transactions
      .filter(t => t.type === 'expense')
      .reduce((acc, transaction) => {
        if (!acc[transaction.category]) {
          acc[transaction.category] = [];
        }
        acc[transaction.category].push(transaction);
        return acc;
      }, {} as {[category: string]: Transaction[]});
  }

  static async getIncomeByCategory(): Promise<{[category: string]: Transaction[]}> {
    const transactions = await this.getTransactions();
    return transactions
      .filter(t => t.type === 'income')
      .reduce((acc, transaction) => {
        if (!acc[transaction.category]) {
          acc[transaction.category] = [];
        }
        acc[transaction.category].push(transaction);
        return acc;
      }, {} as {[category: string]: Transaction[]});
  }

  static async getTotalExpenses(): Promise<number> {
    const transactions = await this.getTransactions();
    return transactions
      .filter(t => t.type === 'expense')
      .reduce((sum, t) => sum + parseFloat(t.amount), 0);
  }

  static async getTotalIncome(): Promise<number> {
    const transactions = await this.getTransactions();
    return transactions
      .filter(t => t.type === 'income')
      .reduce((sum, t) => sum + parseFloat(t.amount), 0);
  }
}