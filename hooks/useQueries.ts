import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { StorageService } from '../services/StorageService';
import { TransactionService } from '../services/TransactionService';

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

// Transaction Query Hooks
export function useTransactions() {
  return useQuery({
    queryKey: QUERY_KEYS.transactions,
    queryFn: () => StorageService.getTransactions(),
  });
}

export function useRecentTransactions(limit: number) {
  return useQuery({
    queryKey: QUERY_KEYS.recentTransactions(limit),
    queryFn: async () => {
      const transactions = await StorageService.getTransactions();
      return transactions
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
        .filter(t => t.type === 'expense')
        .reduce((acc, t) => {
          if (!acc[t.category]) acc[t.category] = [];
          acc[t.category].push(t);
          return acc;
        }, {} as { [category: string]: any[] });
    },
  });
}

export function useIncomeByCategory() {
  return useQuery({
    queryKey: QUERY_KEYS.incomeByCategory,
    queryFn: async () => {
      const transactions = await StorageService.getTransactions();
      return transactions
        .filter(t => t.type === 'income')
        .reduce((acc, t) => {
          if (!acc[t.category]) acc[t.category] = [];
          acc[t.category].push(t);
          return acc;
        }, {} as { [category: string]: any[] });
    },
  });
}

export function useTotalIncome() {
  return useQuery({
    queryKey: QUERY_KEYS.totalIncome,
    queryFn: async () => {
      const transactions = await StorageService.getTransactions();
      return transactions
        .filter(t => t.type === 'income')
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
        .filter(t => t.type === 'expense')
        .reduce((sum, t) => sum + parseFloat(t.amount), 0);
    },
  });
}

// Transaction Mutations
export function useAddTransaction() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (transaction: any) => {
      await StorageService.addTransaction(transaction);
      return transaction;
    },
    onSuccess: () => {
      // Delay refetch to allow API to process the new transaction
      setTimeout(() => {
        queryClient.invalidateQueries({ queryKey: QUERY_KEYS.transactions });
        queryClient.invalidateQueries({ queryKey: QUERY_KEYS.transactionsByCategory });
        queryClient.invalidateQueries({ queryKey: QUERY_KEYS.incomeByCategory });
        queryClient.invalidateQueries({ queryKey: QUERY_KEYS.totalIncome });
        queryClient.invalidateQueries({ queryKey: QUERY_KEYS.totalExpenses });
      }, 2000);
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
    },
  });
}

export function useDeleteTransaction() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => StorageService.deleteTransaction(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.transactions });
    },
  });
}

// Category Hooks
export function useCategories() {
  return useQuery({
    queryKey: QUERY_KEYS.categories,
    queryFn: () => StorageService.getCategories(),
  });
}

export function useAddCategory() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (category: any) => {
      const categories = await StorageService.getCategories();
      const newCategory = { ...category, id: Date.now().toString() };
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
      await StorageService.saveCategories(categories.filter(cat => cat.id !== id));
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.categories });
    },
  });
}

// Payment Method Hooks
export function usePaymentMethods() {
  return useQuery({
    queryKey: QUERY_KEYS.paymentMethods,
    queryFn: () => StorageService.getPaymentMethods(),
  });
}

export function useAddPaymentMethod() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (method: any) => {
      const methods = await StorageService.getPaymentMethods();
      const newMethod = { ...method, id: Date.now().toString() };
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
      const index = methods.findIndex(m => m.id === id);
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
      await StorageService.savePaymentMethods(methods.filter(m => m.id !== id));
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.paymentMethods });
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
