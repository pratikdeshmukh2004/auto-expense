import { ApiService, ApiTransaction } from './ApiService';

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
  description?: string;
  paidBy?: string;
  rawMessage?: string;
  notes?: string;
  sender?: string;
}

function mapApiToTransaction(item: ApiTransaction, index: number): Transaction {
  return {
    id: `${item.Date}-${index}-${item.Amount}`,
    merchant: item['Paid to'] || '',
    amount: String(item.Amount),
    category: item.Category || 'Other',
    date: item.Date,
    timestamp: new Date(item.Date),
    type: item.Type?.toLowerCase() === 'credit' ? 'income' : 'expense',
    status: 'completed',
    description: item.Description || '',
    paidBy: item['Paid By'] || '',
    paymentMethod: item['Paid By'] || '',
  };
}

export class TransactionService {
  static async getTransactions(): Promise<Transaction[]> {
    const data = await ApiService.getTransactions();
    return data.map(mapApiToTransaction);
  }

  static async addTransaction(transaction: Omit<Transaction, 'id' | 'timestamp'>): Promise<Transaction> {
    const payload = {
      date: transaction.date || new Date().toISOString().split('T')[0],
      paidTo: transaction.merchant,
      category: transaction.category,
      description: transaction.description || transaction.notes || '',
      amount: parseFloat(transaction.amount),
      paidBy: transaction.paidBy || 'Pratik',
      type: transaction.type === 'income' ? 'Credit' : 'Debit',
    };

    const success = await ApiService.addTransaction(payload);
    if (!success) throw new Error('Failed to add transaction');

    return {
      ...transaction,
      id: Date.now().toString(),
      timestamp: new Date(transaction.date || new Date()),
    };
  }

  static async getRecentTransactions(limit: number = 10): Promise<Transaction[]> {
    const transactions = await this.getTransactions();
    return transactions
      .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
      .slice(0, limit);
  }

  static async getTransactionsByCategory(): Promise<{ [category: string]: Transaction[] }> {
    const transactions = await this.getTransactions();
    return transactions
      .filter(t => t.type === 'expense')
      .reduce((acc, t) => {
        if (!acc[t.category]) acc[t.category] = [];
        acc[t.category].push(t);
        return acc;
      }, {} as { [category: string]: Transaction[] });
  }

  static async getIncomeByCategory(): Promise<{ [category: string]: Transaction[] }> {
    const transactions = await this.getTransactions();
    return transactions
      .filter(t => t.type === 'income')
      .reduce((acc, t) => {
        if (!acc[t.category]) acc[t.category] = [];
        acc[t.category].push(t);
        return acc;
      }, {} as { [category: string]: Transaction[] });
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

  // No-op for API-based service (delete not supported by this API)
  static async deleteTransaction(_id: string): Promise<void> {}
  static async updateTransaction(_id: string, _updates: Partial<Transaction>): Promise<void> {}
}
