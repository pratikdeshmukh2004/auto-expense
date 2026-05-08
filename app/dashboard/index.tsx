import { Ionicons } from "@expo/vector-icons";
import { useQueryClient } from "@tanstack/react-query";
import { router, useFocusEffect } from "expo-router";
import React, { useEffect, useState } from "react";
import {
  RefreshControl,
  ScrollView,
  Text,
  TouchableOpacity,
  View
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { AnimatedBackground } from "../../components/animations";
import { CategoryBreakdown, MerchantBreakdown, SpendingTrends, TransactionCard } from "../../components/features";
import { TransactionModal } from "../../components/modals";
import { Shimmer } from "../../components/animations";
import { useTheme } from "../../providers/ThemeProvider";
import {
  useAddTransaction,
  useCategories,
  useDeleteTransaction,
  useTransactions,
} from "../../hooks/useQueries";
import {
  Transaction
} from "../../services/TransactionService";

const AnimatedNumber = ({
  value,
  prefix = "₹",
  style = {},
}: {
  value: number;
  prefix?: string;
  style?: any;
}) => {
  const [displayValue, setDisplayValue] = useState(0);

  useEffect(() => {
    let start = displayValue;
    const duration = 1000;
    const startTime = Date.now();

    const animate = () => {
      const now = Date.now();
      const progress = Math.min((now - startTime) / duration, 1);
      const easeOut = 1 - Math.pow(1 - progress, 3);
      const current = start + (value - start) * easeOut;

      setDisplayValue(current);

      if (progress < 1) {
        requestAnimationFrame(animate);
      }
    };

    animate();
  }, [value]);

  const formatted = displayValue % 1 === 0
    ? Math.round(displayValue).toLocaleString("en-IN")
    : displayValue.toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 });

  return (
    <Text style={[{ fontSize: 20, fontWeight: "bold" }, style]} numberOfLines={1} adjustsFontSizeToFit>
      {prefix}{formatted}
    </Text>
  );
};

export default function DashboardIndex() {
  const { isDark, toggle, colors } = useTheme();
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedTransaction, setSelectedTransaction] =
    useState<Transaction | null>(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [showDuplicateConfirm, setShowDuplicateConfirm] = useState(false);
  const [transactionToDelete, setTransactionToDelete] = useState<string | null>(
    null,
  );
  const [transactionToDuplicate, setTransactionToDuplicate] =
    useState<Transaction | null>(null);
  const [refreshing, setRefreshing] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);
  const [selectedMonth, setSelectedMonth] = useState(new Date());

  // TanStack Query hooks
  const queryClient = useQueryClient();
  const { data: allTransactions = [], isLoading: transactionsLoading } =
    useTransactions();
  const { data: categories = [], isLoading: categoriesLoading } =
    useCategories();

  const transactions = allTransactions;

  const recentTransactions = [...transactions]
    .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
    .slice(0, 4);

  const now = new Date();
  const thisMonthExpenses = allTransactions
    .filter(t => t.type === 'expense' && new Date(t.timestamp).getMonth() === now.getMonth() && new Date(t.timestamp).getFullYear() === now.getFullYear())
    .reduce((sum, t) => sum + parseFloat(t.amount), 0);

  const lastMonthExpenses = (() => {
    const lm = now.getMonth() === 0 ? 11 : now.getMonth() - 1;
    const ly = now.getMonth() === 0 ? now.getFullYear() - 1 : now.getFullYear();
    return allTransactions
      .filter(t => t.type === 'expense' && new Date(t.timestamp).getMonth() === lm && new Date(t.timestamp).getFullYear() === ly)
      .reduce((sum, t) => sum + parseFloat(t.amount), 0);
  })();

  const allTimeExpenses = allTransactions
    .filter(t => t.type === 'expense')
    .reduce((sum, t) => sum + parseFloat(t.amount), 0);

  const totalExpenses = thisMonthExpenses;
  const totalIncome = transactions
    .filter(t => t.type === 'income')
    .reduce((sum, t) => sum + parseFloat(t.amount), 0);

  const categoryBreakdown = transactions
    .filter(t => t.type === 'expense')
    .reduce((acc, t) => {
      if (!acc[t.category]) acc[t.category] = [];
      acc[t.category].push(t);
      return acc;
    }, {} as { [key: string]: any[] });

  const incomeBreakdown = transactions
    .filter(t => t.type === 'income')
    .reduce((acc, t) => {
      if (!acc[t.category]) acc[t.category] = [];
      acc[t.category].push(t);
      return acc;
    }, {} as { [key: string]: any[] });

  const loading = transactionsLoading && allTransactions.length === 0;

  // Mutations
  const addTransactionMutation = useAddTransaction();
  const deleteTransactionMutation = useDeleteTransaction();

  const [categoryIcons, setCategoryIcons] = useState<{ [key: string]: string }>(
    {},
  );
  const [categoryColors, setCategoryColors] = useState<{
    [key: string]: string;
  }>({});

  const handleDeleteTransaction = (id: string) => {
    setTransactionToDelete(id);
    setShowDeleteConfirm(true);
  };

  const confirmDelete = async () => {
    if (!transactionToDelete) return;
    deleteTransactionMutation.mutate(transactionToDelete, {
      onSuccess: () => {
        setShowDeleteConfirm(false);
        setTransactionToDelete(null);
      },
    });
  };

  const handleDuplicateTransaction = (transaction: Transaction) => {
    setTransactionToDuplicate(transaction);
    setShowDuplicateConfirm(true);
  };

  const confirmDuplicate = async () => {
    if (!transactionToDuplicate) return;
    addTransactionMutation.mutate(
      {
        merchant: transactionToDuplicate.merchant,
        amount: transactionToDuplicate.amount,
        category: transactionToDuplicate.category,
        paymentMethod: transactionToDuplicate.paymentMethod,
        date: new Date().toISOString(),
        type: transactionToDuplicate.type,
        status: "completed",
      },
      {
        onSuccess: () => {
          setShowDuplicateConfirm(false);
          setTransactionToDuplicate(null);
        },
      },
    );
  };

  const handleEditTransaction = (transaction: Transaction) => {
    setSelectedTransaction(transaction);
    setShowEditModal(true);
  };

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return "Good Morning";
    if (hour < 17) return "Good Afternoon";
    return "Good Evening";
  };

  // Separate effect for handling data updates
  useEffect(() => {
    // Set category icons and colors when categories are loaded
    if (categories.length > 0) {
      const iconMap = categories.reduce(
        (acc, cat) => {
          acc[cat.name] = cat.icon;
          return acc;
        },
        {} as { [key: string]: string },
      );

      const colorMap = categories.reduce(
        (acc, cat) => {
          acc[cat.name] = cat.color;
          return acc;
        },
        {} as { [key: string]: string },
      );

      setCategoryIcons(iconMap);
      setCategoryColors(colorMap);
    }

    setInitialLoading(loading);
  }, [categories.length, transactions.length, loading]);

  useFocusEffect(
    React.useCallback(() => {
      // Data will be automatically refetched by TanStack Query
    }, []),
  );


  const onRefresh = async () => {
    setRefreshing(true);
    await queryClient.invalidateQueries();
    setRefreshing(false);
  };

  const getMonthlyComparison = () => {
    const lastMonth = selectedMonth.getMonth() === 0 ? 11 : selectedMonth.getMonth() - 1;
    const lastMonthYear = selectedMonth.getMonth() === 0 ? selectedMonth.getFullYear() - 1 : selectedMonth.getFullYear();

    const lastMonthTransactions = allTransactions.filter((t) => {
      const date = new Date(t.timestamp);
      return date.getMonth() === lastMonth && date.getFullYear() === lastMonthYear;
    });

    const lastIncome = lastMonthTransactions
      .filter((t) => t.type === "income")
      .reduce((sum, t) => sum + parseFloat(t.amount), 0);
    const lastExpenses = lastMonthTransactions
      .filter((t) => t.type === "expense")
      .reduce((sum, t) => sum + parseFloat(t.amount), 0);

    const incomeChange = lastIncome > 0 ? ((totalIncome - lastIncome) / lastIncome) * 100 : 0;
    const expenseChange = lastExpenses > 0 ? ((totalExpenses - lastExpenses) / lastExpenses) * 100 : 0;

    return { incomeChange, expenseChange };
  };


  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.background }}>
      {!initialLoading && <AnimatedBackground />}

      {/* Header */}
      <View
        style={{
          flexDirection: "row",
          justifyContent: "space-between",
          alignItems: "center",
          paddingHorizontal: 16,
          paddingVertical: 16,
          paddingTop: 32,
          backgroundColor: "transparent",
        }}
      >
        <View>
          <Text style={{ fontSize: 20, fontWeight: "bold", color: colors.text }}>
            {getGreeting()}
          </Text>
        </View>
        <TouchableOpacity
          style={{
            width: 44,
            height: 44,
            borderRadius: 22,
            backgroundColor: colors.card,
            alignItems: "center",
            justifyContent: "center",
            shadowColor: "#000",
            shadowOffset: { width: 0, height: 1 },
            shadowOpacity: 0.1,
            shadowRadius: 2,
            elevation: 2,
          }}
          onPress={toggle}
        >
          <Ionicons name={isDark ? "sunny" : "moon"} size={22} color="#EA2831" />
        </TouchableOpacity>
      </View>

      <ScrollView
        style={{ flex: 1, paddingHorizontal: 16, paddingTop: 8 }}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        {/* Expense Card */}
        {initialLoading ? (
          <View style={{ marginBottom: 24 }}>
            <Shimmer width="100%" height={260} borderRadius={24} />
          </View>
        ) : (
          <View
            style={{
              backgroundColor: colors.cardAlt,
              borderRadius: 24,
              padding: 24,
              marginBottom: 24,
              shadowColor: "#000",
              shadowOffset: { width: 0, height: 4 },
              shadowOpacity: 0.08,
              shadowRadius: 12,
              elevation: 4,
            }}
          >
            {/* Header row */}
            <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "flex-start" }}>
              <View>
                <Text style={{ fontSize: 11, fontWeight: "600", color: colors.textMuted, letterSpacing: 1.2 }}>
                  TOTAL EXPENSE • {now.toLocaleDateString("en-US", { month: "short", year: "numeric" }).toUpperCase()}
                </Text>
                <AnimatedNumber
                  value={thisMonthExpenses}
                  style={{ fontSize: 28, fontWeight: "900", color: "#EA2831", marginTop: 8 }}
                />
              </View>
              <View style={{
                width: 40,
                height: 40,
                borderRadius: 12,
                backgroundColor: "rgba(234, 40, 49, 0.1)",
                alignItems: "center",
                justifyContent: "center",
              }}>
                <Ionicons name="trending-down" size={20} color="#EA2831" />
              </View>
            </View>

            {/* Divider */}
            <View style={{ height: 1, backgroundColor: "rgba(234, 40, 49, 0.08)", marginVertical: 20 }} />

            {/* Last Month & Yearly */}
            <View style={{ flexDirection: "row", gap: 24 }}>
              <View style={{ flex: 1 }}>
                <Text style={{ fontSize: 9, fontWeight: "700", color: colors.textMuted, letterSpacing: 1.2, marginBottom: 4 }}>LAST MONTH</Text>
                <AnimatedNumber
                  value={lastMonthExpenses}
                  style={{ fontSize: 18, fontWeight: "800", color: colors.text }}
                />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={{ fontSize: 9, fontWeight: "700", color: colors.textMuted, letterSpacing: 1.2, marginBottom: 4 }}>ALL TIME</Text>
                <AnimatedNumber
                  value={allTimeExpenses}
                  style={{ fontSize: 18, fontWeight: "800", color: colors.text }}
                />
              </View>
            </View>
          </View>
        )}

        {initialLoading ? (
          <>
            <Shimmer
              width="100%"
              height={200}
              borderRadius={16}
              style={{ marginBottom: 24 }}
            />
            <Shimmer
              width="100%"
              height={150}
              borderRadius={16}
              style={{ marginBottom: 24 }}
            />
            <Shimmer
              width="100%"
              height={120}
              borderRadius={16}
              style={{ marginBottom: 24 }}
            />
            <View style={{ marginBottom: 200 }}>
              <Shimmer
                width={150}
                height={20}
                borderRadius={8}
                style={{ marginBottom: 16 }}
              />
              <Shimmer
                width="100%"
                height={80}
                borderRadius={12}
                style={{ marginBottom: 12 }}
              />
              <Shimmer
                width="100%"
                height={80}
                borderRadius={12}
                style={{ marginBottom: 12 }}
              />
              <Shimmer width="100%" height={80} borderRadius={12} />
            </View>
          </>
        ) : (
          <>
            <CategoryBreakdown
              categoryBreakdown={categoryBreakdown}
              incomeBreakdown={incomeBreakdown}
              totalExpenses={totalExpenses}
              totalIncome={totalIncome}
              categoryIcons={categoryIcons}
              categoryColors={categoryColors}
              allTransactions={allTransactions}
              themeColors={colors}
            />

            <MerchantBreakdown allTransactions={allTransactions} themeColors={colors} />

            <SpendingTrends transactions={transactions} themeColors={colors} />

            {/* Recent Transactions */}
            <View style={{ marginBottom: 200 }}>
              <View
                style={{
                  flexDirection: "row",
                  justifyContent: "space-between",
                  alignItems: "center",
                  marginBottom: 16,
                  paddingHorizontal: 4,
                }}
              >
                <Text
                  style={{ fontSize: 18, fontWeight: "bold", color: colors.text }}
                >
                  Recent Transactions
                </Text>
                <TouchableOpacity onPress={() => router.push("/transactions")}>
                  <Text
                    style={{
                      fontSize: 14,
                      fontWeight: "bold",
                      color: "#EA2831",
                    }}
                  >
                    See All
                  </Text>
                </TouchableOpacity>
              </View>

              <View style={{ gap: 12 }}>
                {recentTransactions.length > 0 ? (
                  recentTransactions.map((transaction) => (
                    <TransactionCard
                      key={transaction.id}
                      transaction={transaction}
                      categoryIcons={categoryIcons}
                      categoryColors={categoryColors}
                      onEdit={() => {}}
                      onDuplicate={() => {}}
                      onDelete={() => {}}
                    />
                  ))
                ) : (
                  <View
                    style={{
                      backgroundColor: colors.card,
                      borderRadius: 12,
                      padding: 40,
                      paddingVertical: 100,
                      alignItems: "center",
                      shadowColor: "#000",
                      shadowOffset: { width: 0, height: 1 },
                      shadowOpacity: 0.05,
                      shadowRadius: 2,
                      elevation: 1,
                    }}
                  >
                    <Ionicons
                      name="receipt-outline"
                      size={48}
                      color="#94a3b8"
                    />
                    <Text
                      style={{
                        fontSize: 16,
                        fontWeight: "bold",
                        color: "#64748b",
                        marginTop: 12,
                      }}
                    >
                      No transactions yet
                    </Text>
                    <Text
                      style={{
                        fontSize: 14,
                        color: "#94a3b8",
                        textAlign: "center",
                        marginTop: 4,
                      }}
                    >
                      Add your first transaction to get started
                    </Text>
                  </View>
                )}
              </View>
            </View>
          </>
        )}
      </ScrollView>

      {/* Floating Action Button */}
      <TouchableOpacity
        style={{
          position: "absolute",
          bottom: 125,
          right: 16,
          width: 56,
          height: 56,
          borderRadius: 28,
          backgroundColor: "#EA2831",
          alignItems: "center",
          justifyContent: "center",
          shadowColor: "#EA2831",
          shadowOffset: { width: 0, height: 4 },
          shadowOpacity: 0.4,
          shadowRadius: 8,
          elevation: 8,
        }}
        onPress={() => setShowAddModal(true)}
      >
        <Ionicons name="add" size={28} color="white" />
      </TouchableOpacity>

      <TransactionModal
        visible={showAddModal}
        onClose={() => setShowAddModal(false)}
        onTransactionAdded={() => setShowAddModal(false)}
      />

      <TransactionModal
        visible={showEditModal}
        onClose={() => {
          setShowEditModal(false);
          setSelectedTransaction(null);
        }}
        transaction={selectedTransaction || undefined}
        onTransactionUpdated={() => {
          setShowEditModal(false);
          setSelectedTransaction(null);
        }}
      />

      {showDeleteConfirm && (
        <View
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: "rgba(0, 0, 0, 0.5)",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <View
            style={{
              backgroundColor: "white",
              borderRadius: 24,
              padding: 32,
              width: "85%",
              maxWidth: 400,
            }}
          >
            <View
              style={{
                width: 80,
                height: 80,
                borderRadius: 40,
                backgroundColor: "rgba(239, 68, 68, 0.1)",
                alignItems: "center",
                justifyContent: "center",
                alignSelf: "center",
                marginBottom: 20,
              }}
            >
              <Ionicons name="trash" size={40} color="#ef4444" />
            </View>
            <Text
              style={{
                fontSize: 22,
                fontWeight: "bold",
                color: "#111827",
                textAlign: "center",
                marginBottom: 8,
              }}
            >
              Delete Transaction?
            </Text>
            <Text
              style={{
                fontSize: 14,
                color: "#6b7280",
                textAlign: "center",
                marginBottom: 28,
                lineHeight: 20,
              }}
            >
              This action cannot be undone. This transaction will be permanently
              removed.
            </Text>
            <View style={{ flexDirection: "row", gap: 12 }}>
              <TouchableOpacity
                style={{
                  flex: 1,
                  paddingVertical: 16,
                  borderRadius: 14,
                  backgroundColor: "#f3f4f6",
                  alignItems: "center",
                }}
                onPress={() => {
                  setShowDeleteConfirm(false);
                  setTransactionToDelete(null);
                }}
              >
                <Text
                  style={{ fontSize: 16, fontWeight: "bold", color: "#6b7280" }}
                >
                  Cancel
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={{
                  flex: 1,
                  paddingVertical: 16,
                  borderRadius: 14,
                  backgroundColor: "#ef4444",
                  alignItems: "center",
                  shadowColor: "#ef4444",
                  shadowOffset: { width: 0, height: 4 },
                  shadowOpacity: 0.3,
                  shadowRadius: 8,
                  elevation: 4,
                }}
                onPress={confirmDelete}
              >
                <Text
                  style={{ fontSize: 16, fontWeight: "bold", color: "white" }}
                >
                  Delete
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      )}

      {showDuplicateConfirm && (
        <View
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: "rgba(0, 0, 0, 0.5)",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <View
            style={{
              backgroundColor: "white",
              borderRadius: 24,
              padding: 32,
              width: "85%",
              maxWidth: 400,
            }}
          >
            <View
              style={{
                width: 80,
                height: 80,
                borderRadius: 40,
                backgroundColor: "rgba(16, 185, 129, 0.1)",
                alignItems: "center",
                justifyContent: "center",
                alignSelf: "center",
                marginBottom: 20,
              }}
            >
              <Ionicons name="copy" size={40} color="#10b981" />
            </View>
            <Text
              style={{
                fontSize: 22,
                fontWeight: "bold",
                color: "#111827",
                textAlign: "center",
                marginBottom: 8,
              }}
            >
              Duplicate Transaction?
            </Text>
            <Text
              style={{
                fontSize: 14,
                color: "#6b7280",
                textAlign: "center",
                marginBottom: 28,
                lineHeight: 20,
              }}
            >
              A copy of this transaction will be created with today's date and
              time.
            </Text>
            <View style={{ flexDirection: "row", gap: 12 }}>
              <TouchableOpacity
                style={{
                  flex: 1,
                  paddingVertical: 16,
                  borderRadius: 14,
                  backgroundColor: "#f3f4f6",
                  alignItems: "center",
                }}
                onPress={() => {
                  setShowDuplicateConfirm(false);
                  setTransactionToDuplicate(null);
                }}
              >
                <Text
                  style={{ fontSize: 16, fontWeight: "bold", color: "#6b7280" }}
                >
                  Cancel
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={{
                  flex: 1,
                  paddingVertical: 16,
                  borderRadius: 14,
                  backgroundColor: "#10b981",
                  alignItems: "center",
                  shadowColor: "#10b981",
                  shadowOffset: { width: 0, height: 4 },
                  shadowOpacity: 0.3,
                  shadowRadius: 8,
                  elevation: 4,
                }}
                onPress={confirmDuplicate}
              >
                <Text
                  style={{ fontSize: 16, fontWeight: "bold", color: "white" }}
                >
                  Duplicate
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      )}
    </SafeAreaView>
  );
}
