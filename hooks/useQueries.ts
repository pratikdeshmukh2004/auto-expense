import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { StorageService } from '../services/StorageService';
import { TransactionService } from '../services/TransactionService';

// Query Keys
export const QUERY_KEYS = {
  transactions: ['transactions'],
  categories: ['categories'],
  paymentMethods: ['paymentMethods'],
  keywords: ['keywords'],
  approvedSenders: ['approvedSenders'],
  recentTransactions: (limit: number) => ['transactions', 'recent', limit],
  transactionsByCategory: ['transactions', 'byCategory'],
  incomeByCategory: ['transactions', 'incomeByCategory'],
  totalIncome: ['transactions', 'totalIncome'],
  totalExpenses: ['transactions', 'totalExpenses'],
};

// Dashboard Data Hook
export function useDashboardData() {
  return useQuery({
    queryKey: ['dashboard'],
    queryFn: async () => {
      const [transactions, categories] = await Promise.all([
        StorageService.getTransactions(),
        StorageService.getCategories()
      ]);
      
      const recentTxns = transactions
        .sort((a, b) => new Date(b.timestamp || b.date).getTime() - new Date(a.timestamp || a.date).getTime())
        .slice(0, 4);
      
      const totalIncome = transactions
        .filter(t => t.type === 'income')
        .reduce((sum, t) => sum + parseFloat(t.amount), 0);
        
      const totalExpenses = transactions
        .filter(t => t.type === 'expense')
        .reduce((sum, t) => sum + parseFloat(t.amount), 0);
        
      const categoryBreakdown = transactions
        .filter(t => t.type === 'expense')
        .reduce((acc, transaction) => {
          if (!acc[transaction.category]) {
            acc[transaction.category] = [];
          }
          acc[transaction.category].push(transaction);
          return acc;
        }, {} as {[category: string]: any[]});
        
      const incomeBreakdown = transactions
        .filter(t => t.type === 'income')
        .reduce((acc, transaction) => {
          if (!acc[transaction.category]) {
            acc[transaction.category] = [];
          }
          acc[transaction.category].push(transaction);
          return acc;
        }, {} as {[category: string]: any[]});
      
      return {
        transactions,
        recentTransactions: recentTxns,
        totalIncome,
        totalExpenses,
        categoryBreakdown,
        incomeBreakdown,
        categories
      };
    },
  });
}

// Transaction Mutations
export function useAddTransaction() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (transaction: any) => {
      const newTransaction = {
        ...transaction,
        id: Date.now().toString(),
        timestamp: transaction.date ? new Date(transaction.date) : new Date()
      };
      await StorageService.addTransaction(newTransaction);
      return newTransaction;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.transactions });
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.transactionsByCategory });
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.incomeByCategory });
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.totalIncome });
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.totalExpenses });
    },
  });
}

export function useUpdateTransaction() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ id, updates }: { id: string; updates: any }) => 
      TransactionService.updateTransaction(id, updates),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.transactions });
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.transactionsByCategory });
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.incomeByCategory });
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.totalIncome });
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.totalExpenses });
    },
  });
}

export function useDeleteTransaction() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: StorageService.deleteTransaction,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.transactions });
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.transactionsByCategory });
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.incomeByCategory });
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.totalIncome });
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.totalExpenses });
    },
  });
}

// Category Hooks
export function useCategories() {
  return useQuery({
    queryKey: QUERY_KEYS.categories,
    queryFn: async () => {
      console.log('useCategories - queryFn starting');
      const result = await StorageService.getCategories();
      console.log('useCategories - StorageService result:', result);
      return result;
    },
  });
}

// Transaction Query Hooks
export function useTransactions() {
  return useQuery({
    queryKey: QUERY_KEYS.transactions,
    queryFn: async () => {
      const result = await StorageService.getTransactions();
      return result.filter(t => t.status !== 'rejected').map(t => ({
        ...t,
        timestamp: new Date(t.timestamp || t.date)
      }));
    },
  });
}

export function useRecentTransactions(limit: number) {
  return useQuery({
    queryKey: QUERY_KEYS.recentTransactions(limit),
    queryFn: async () => {
      const transactions = await StorageService.getTransactions();
      return transactions
        .filter(t => t.status !== 'rejected')
        .map(t => ({ ...t, timestamp: new Date(t.timestamp || t.date) }))
        .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
        .slice(0, limit);
    },
  });
}

export function useTransactionsByCategory() {
  return useQuery({
    queryKey: QUERY_KEYS.transactionsByCategory,
    queryFn: async () => {
      const transactions = await StorageService.getTransactions();
      return transactions
        .filter(t => t.type === 'expense' && t.status !== 'rejected')
        .reduce((acc, transaction) => {
          if (!acc[transaction.category]) {
            acc[transaction.category] = [];
          }
          acc[transaction.category].push(transaction);
          return acc;
        }, {} as {[category: string]: any[]});
    },
  });
}

export function useIncomeByCategory() {
  return useQuery({
    queryKey: QUERY_KEYS.incomeByCategory,
    queryFn: async () => {
      const transactions = await StorageService.getTransactions();
      return transactions
        .filter(t => t.type === 'income' && t.status !== 'rejected')
        .reduce((acc, transaction) => {
          if (!acc[transaction.category]) {
            acc[transaction.category] = [];
          }
          acc[transaction.category].push(transaction);
          return acc;
        }, {} as {[category: string]: any[]});
    },
  });
}

export function useTotalIncome() {
  return useQuery({
    queryKey: QUERY_KEYS.totalIncome,
    queryFn: async () => {
      const transactions = await StorageService.getTransactions();
      return transactions
        .filter(t => t.type === 'income' && t.status !== 'rejected')
        .reduce((sum, t) => sum + parseFloat(t.amount), 0);
    },
  });
}

export function useTotalExpenses() {
  return useQuery({
    queryKey: QUERY_KEYS.totalExpenses,
    queryFn: async () => {
      const transactions = await StorageService.getTransactions();
      return transactions
        .filter(t => t.type === 'expense' && t.status !== 'rejected')
        .reduce((sum, t) => sum + parseFloat(t.amount), 0);
    },
  });
}

// Payment Method Hooks
export function usePaymentMethods() {
  return useQuery({
    queryKey: QUERY_KEYS.paymentMethods,
    queryFn: async () => {
      console.log('usePaymentMethods - queryFn starting');
      const result = await StorageService.getPaymentMethods();
      console.log('usePaymentMethods - StorageService result:', result);
      return result;
    },
  });
}

// Keywords Hooks
export function useKeywords() {
  return useQuery({
    queryKey: QUERY_KEYS.keywords,
    queryFn: StorageService.getKeywords,
  });
}

// Approved Senders Hooks
export function useApprovedSenders() {
  return useQuery({
    queryKey: QUERY_KEYS.approvedSenders,
    queryFn: StorageService.getApprovedSenders,
  });
}

// Category Mutations
export function useAddCategory() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (category: any) => {
      const newCategory = {
        ...category,
        id: Date.now().toString(),
      };
      const categories = await StorageService.getCategories();
      categories.push(newCategory);
      await StorageService.saveCategories(categories);
      return newCategory;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.categories });
    },
  });
}

export function useUpdateCategory() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ id, updates }: { id: string; updates: any }) => {
      const categories = await StorageService.getCategories();
      const index = categories.findIndex(cat => cat.id === id);
      if (index !== -1) {
        categories[index] = { ...categories[index], ...updates };
        await StorageService.saveCategories(categories);
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.categories });
    },
  });
}

export function useDeleteCategory() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (id: string) => {
      const categories = await StorageService.getCategories();
      const filtered = categories.filter(cat => cat.id !== id);
      await StorageService.saveCategories(filtered);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.categories });
    },
  });
}

// Payment Method Mutations
export function useAddPaymentMethod() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (method: any) => {
      const newMethod = {
        ...method,
        id: Date.now().toString(),
      };
      const methods = await StorageService.getPaymentMethods();
      methods.push(newMethod);
      await StorageService.savePaymentMethods(methods);
      return newMethod;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.paymentMethods });
    },
  });
}

export function useUpdatePaymentMethod() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ id, updates }: { id: string; updates: any }) => {
      const methods = await StorageService.getPaymentMethods();
      const index = methods.findIndex(method => method.id === id);
      if (index !== -1) {
        methods[index] = { ...methods[index], ...updates };
        await StorageService.savePaymentMethods(methods);
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.paymentMethods });
    },
  });
}

export function useDeletePaymentMethod() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (id: string) => {
      const methods = await StorageService.getPaymentMethods();
      const filtered = methods.filter(method => method.id !== id);
      await StorageService.savePaymentMethods(filtered);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.paymentMethods });
    },
  });
}