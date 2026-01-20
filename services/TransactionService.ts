import { StorageService } from './StorageService';

export interface Transaction {
  id: string;
  merchant: string;
  amount: string;
  category: string;
  paymentMethod?: string;
  date: string;
  timestamp: Date;
  type: 'expense' | 'income';
  status: 'completed' | 'pending' | 'rejected';
  rawMessage?: string;
  notes?: string;
  sender?: string;
}

export class TransactionService {
  static async getTransactions(): Promise<Transaction[]> {
    try {
      const transactions = await StorageService.getTransactions();
      return transactions
        .filter((t: any) => t.status !== 'rejected')
        .map((t: any) => ({
          ...t,
          timestamp: new Date(t.timestamp || t.date)
        }));
    } catch (error) {
      console.error('Error getting transactions:', error);
      return [];
    }
  }

  static async getAllTransactions(): Promise<Transaction[]> {
    try {
      const transactions = await StorageService.getTransactions();
      return transactions.map((t: any) => ({
        ...t,
        timestamp: new Date(t.timestamp || t.date)
      }));
    } catch (error) {
      console.error('Error getting all transactions:', error);
      return [];
    }
  }

  static async getRejectedTransactions(): Promise<Transaction[]> {
    try {
      const transactions = await StorageService.getTransactions();
      return transactions
        .filter((t: any) => t.status === 'rejected')
        .map((t: any) => ({
          ...t,
          timestamp: new Date(t.timestamp || t.date)
        }));
    } catch (error) {
      console.error('Error getting rejected transactions:', error);
      return [];
    }
  }

  static async addTransaction(transaction: Omit<Transaction, 'id' | 'timestamp'>): Promise<Transaction> {
    try {
      const newTransaction: Transaction = {
        ...transaction,
        id: Date.now().toString(),
        timestamp: transaction.date ? new Date(transaction.date) : new Date()
      };
      
      await StorageService.addTransaction(newTransaction);
      return newTransaction;
    } catch (error) {
      console.error('Error adding transaction:', error);
      throw error;
    }
  }

  static async updateTransaction(id: string, updates: Partial<Transaction>): Promise<void> {
    try {
      const transactions = await StorageService.getTransactions();
      const index = transactions.findIndex((t: any) => t.id === id);
      
      if (index !== -1) {
        const updatedTransaction = { ...transactions[index], ...updates };
        if (updates.date) {
          updatedTransaction.timestamp = new Date(updates.date);
        }
        transactions[index] = updatedTransaction;
        await StorageService.saveTransactions(transactions);
      }
    } catch (error) {
      console.error('Error updating transaction:', error);
      throw error;
    }
  }

  static async deleteTransaction(id: string): Promise<void> {
    try {
      await StorageService.deleteTransaction(id);
    } catch (error) {
      console.error('Error deleting transaction:', error);
      throw error;
    }
  }

  static async getRecentTransactions(limit: number = 10): Promise<Transaction[]> {
    const transactions = await this.getTransactions();
    return transactions
      .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
      .slice(0, limit);
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

  static async deleteTransactionsBySender(sender: string): Promise<void> {
    try {
      const transactions = await StorageService.getTransactions();
      const filtered = transactions.filter((t: any) => t.sender !== sender);
      await StorageService.saveTransactions(filtered);
    } catch (error) {
      console.error('Error deleting transactions by sender:', error);
      throw error;
    }
  }
}