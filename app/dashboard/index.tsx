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
import { CategoryBreakdown, PaymentMethods, SpendingTrends, TransactionCard } from "../../components/features";
import { TransactionApprovalModal, TransactionModal } from "../../components/modals";
import { Shimmer } from "../../components/animations";
import {
  useAddTransaction,
  useCategories,
  useDeleteTransaction,
  useIncomeByCategory,
  useRecentTransactions,
  useTotalExpenses,
  useTotalIncome,
  useTransactions,
  useTransactionsByCategory
} from "../../hooks/useQueries";
import { AuthService } from "../../services/AuthService";
import {
  Transaction
} from "../../services/TransactionService";

const AnimatedNumber = ({
  value,
  prefix = "₹",
  suffix = "",
}: {
  value: string;
  prefix?: string;
  suffix?: string;
}) => {
  const [displayValue, setDisplayValue] = useState(0);
  const targetValue = parseFloat(value);

  useEffect(() => {
    let start = 0;
    const duration = 1000;
    const startTime = Date.now();

    const animate = () => {
      const now = Date.now();
      const progress = Math.min((now - startTime) / duration, 1);
      const easeOut = 1 - Math.pow(1 - progress, 3);
      const current = start + (targetValue - start) * easeOut;

      setDisplayValue(current);

      if (progress < 1) {
        requestAnimationFrame(animate);
      }
    };

    animate();
  }, [targetValue]);

  return (
    <Text style={{ fontSize: 20, fontWeight: "bold", color: "#0d121b" }}>
      {prefix}
      {displayValue.toFixed(2)}
      {suffix}
    </Text>
  );
};

export default function DashboardIndex() {
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
  const [showApprovalModal, setShowApprovalModal] = useState(false);
  const [currentDate, setCurrentDate] = useState("");
  const [refreshing, setRefreshing] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);
  const [userName, setUserName] = useState<string | null>(null);
  const [isGuest, setIsGuest] = useState(false);
  const [hasPendingTransactions, setHasPendingTransactions] = useState(false);
  const [pendingCount, setPendingCount] = useState(0);

  // TanStack Query hooks
  const queryClient = useQueryClient();
  const { data: transactions = [], isLoading: transactionsLoading } =
    useTransactions();
  const { data: recentTransactions = [], isLoading: recentLoading } =
    useRecentTransactions(4);
  const { data: totalIncome = 0, isLoading: incomeLoading } = useTotalIncome();
  const { data: totalExpenses = 0, isLoading: expensesLoading } =
    useTotalExpenses();
  const { data: categoryBreakdown = {}, isLoading: categoryLoading } =
    useTransactionsByCategory();
  const { data: incomeBreakdown = {}, isLoading: incomeBreakdownLoading } =
    useIncomeByCategory();
  const { data: categories = [], isLoading: categoriesLoading } =
    useCategories();

  // Mutations
  const addTransactionMutation = useAddTransaction();
  const deleteTransactionMutation = useDeleteTransaction();

  const [categoryIcons, setCategoryIcons] = useState<{ [key: string]: string }>(
    {},
  );
  const [categoryColors, setCategoryColors] = useState<{
    [key: string]: string;
  }>({});

  const loading =
    (transactionsLoading ||
      recentLoading ||
      incomeLoading ||
      expensesLoading ||
      categoryLoading ||
      incomeBreakdownLoading ||
      categoriesLoading) &&
    transactions.length === 0;

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

  useEffect(() => {
    const now = new Date();
    setCurrentDate(
      now.toLocaleDateString("en-US", {
        year: "numeric",
        month: "long",
        day: "numeric",
      }),
    );
    loadUserInfo();
  }, []);

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

    // Set pending transactions count
    if (transactions.length > 0) {
      const pendingCount = transactions.filter(
        (t) => t.status === "pending",
      ).length;
      setHasPendingTransactions(pendingCount > 0);
      setPendingCount(pendingCount);
    }

    setInitialLoading(loading);
  }, [categories.length, transactions.length, loading]);

  useFocusEffect(
    React.useCallback(() => {
      // Data will be automatically refetched by TanStack Query
    }, []),
  );

  const loadUserInfo = async () => {
    const guest = await AuthService.isGuest();
    setIsGuest(guest);
    if (!guest) {
      const name = await AuthService.getUserName();
      setUserName(name);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    try {
      const SecureStore = await import("expo-secure-store");
      const lastSync = await SecureStore.getItemAsync("last_email_sync");
      
      // Fetch emails in background without waiting
      const { GmailService } = await import("../../services/GmailService");
      GmailService.fetchTransactionEmails(lastSync || undefined).then(async () => {
        await SecureStore.setItemAsync(
          "last_email_sync",
          new Date().toISOString(),
        );
      }).catch((error) => {
      });
    } catch (error) {
    }
    // Immediately refresh data from sheet/local storage
    await queryClient.invalidateQueries();
    await loadUserInfo();
    setRefreshing(false);
  };

  const getMonthlyComparison = () => {
    const now = new Date();
    const currentMonth = now.getMonth();
    const lastMonth = currentMonth === 0 ? 11 : currentMonth - 1;
    const lastMonthYear =
      currentMonth === 0 ? now.getFullYear() - 1 : now.getFullYear();

    const currentMonthTransactions = transactions.filter((t) => {
      const date = new Date(t.timestamp);
      return (
        date.getMonth() === currentMonth &&
        date.getFullYear() === now.getFullYear()
      );
    });

    const lastMonthTransactions = transactions.filter((t) => {
      const date = new Date(t.timestamp);
      return (
        date.getMonth() === lastMonth && date.getFullYear() === lastMonthYear
      );
    });

    const currentIncome = currentMonthTransactions
      .filter((t) => t.type === "income")
      .reduce((sum, t) => sum + parseFloat(t.amount), 0);
    const currentExpenses = currentMonthTransactions
      .filter((t) => t.type === "expense")
      .reduce((sum, t) => sum + parseFloat(t.amount), 0);
    const lastIncome = lastMonthTransactions
      .filter((t) => t.type === "income")
      .reduce((sum, t) => sum + parseFloat(t.amount), 0);
    const lastExpenses = lastMonthTransactions
      .filter((t) => t.type === "expense")
      .reduce((sum, t) => sum + parseFloat(t.amount), 0);

    const incomeChange =
      lastIncome > 0 ? ((currentIncome - lastIncome) / lastIncome) * 100 : 0;
    const expenseChange =
      lastExpenses > 0
        ? ((currentExpenses - lastExpenses) / lastExpenses) * 100
        : 0;

    return { incomeChange, expenseChange };
  };


  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: "#f8f6f6" }}>
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
          <Text style={{ fontSize: 14, color: "#64748b", fontWeight: "500" }}>
            {currentDate}
          </Text>
          <Text style={{ fontSize: 20, fontWeight: "bold", color: "#0d121b" }}>
            {isGuest
              ? getGreeting()
              : `${getGreeting()}, ${userName ? userName.split(" ")[0] : "User"}`}
          </Text>
        </View>
        <TouchableOpacity
          style={{
            width: 44,
            height: 44,
            borderRadius: 22,
            backgroundColor: "white",
            alignItems: "center",
            justifyContent: "center",
            shadowColor: "#000",
            shadowOffset: { width: 0, height: 1 },
            shadowOpacity: 0.1,
            shadowRadius: 2,
            elevation: 2,
            position: "relative",
          }}
          onPress={() => setShowApprovalModal(true)}
        >
          <Ionicons name="notifications-outline" size={24} color="#EA2831" />
          {hasPendingTransactions && (
            <View
              style={{
                position: "absolute",
                top: 6,
                right: 6,
                minWidth: 18,
                height: 18,
                borderRadius: 9,
                backgroundColor: "#10b981",
                borderWidth: 2,
                borderColor: "white",
                alignItems: "center",
                justifyContent: "center",
                paddingHorizontal: 4,
              }}
            >
              <Text
                style={{ fontSize: 10, fontWeight: "bold", color: "white" }}
              >
                {pendingCount}
              </Text>
            </View>
          )}
        </TouchableOpacity>
      </View>

      <ScrollView
        style={{ flex: 1, paddingHorizontal: 16, paddingTop: 8 }}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        {/* Income/Expense Cards */}
        {initialLoading ? (
          <View style={{ flexDirection: "row", gap: 12, marginBottom: 24 }}>
            <Shimmer width="50%" height={112} borderRadius={16} />
            <Shimmer width="50%" height={112} borderRadius={16} />
          </View>
        ) : (
          <View style={{ flexDirection: "row", gap: 12, marginBottom: 24 }}>
            <View
              style={{
                flex: 1,
                backgroundColor: "white",
                borderRadius: 16,
                padding: 16,
                height: 112,
                justifyContent: "space-between",
                shadowColor: "#000",
                shadowOffset: { width: 0, height: 1 },
                shadowOpacity: 0.05,
                shadowRadius: 2,
                elevation: 1,
              }}
            >
              <View
                style={{ flexDirection: "row", alignItems: "center", gap: 8 }}
              >
                <View
                  style={{
                    width: 32,
                    height: 32,
                    borderRadius: 16,
                    backgroundColor: "#dcfce7",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  <Ionicons name="arrow-down" size={16} color="#10b981" />
                </View>
                <Text
                  style={{ fontSize: 12, fontWeight: "600", color: "#64748b" }}
                >
                  Income
                </Text>
              </View>
              <AnimatedNumber value={totalIncome.toFixed(2)} />
              <Text
                style={{ fontSize: 10, fontWeight: "500", color: "#10b981" }}
              >
                {(() => {
                  const { incomeChange } = getMonthlyComparison();
                  const sign = incomeChange >= 0 ? "+" : "";
                  return `${sign}${incomeChange.toFixed(0)}% vs last month`;
                })()}
              </Text>
            </View>

            <View
              style={{
                flex: 1,
                backgroundColor: "white",
                borderRadius: 16,
                padding: 16,
                height: 112,
                justifyContent: "space-between",
                shadowColor: "#000",
                shadowOffset: { width: 0, height: 1 },
                shadowOpacity: 0.05,
                shadowRadius: 2,
                elevation: 1,
              }}
            >
              <View
                style={{ flexDirection: "row", alignItems: "center", gap: 8 }}
              >
                <View
                  style={{
                    width: 32,
                    height: 32,
                    borderRadius: 16,
                    backgroundColor: "rgba(234, 40, 49, 0.1)",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  <Ionicons name="arrow-up" size={16} color="#EA2831" />
                </View>
                <Text
                  style={{ fontSize: 12, fontWeight: "600", color: "#64748b" }}
                >
                  Expense
                </Text>
              </View>
              <AnimatedNumber value={totalExpenses.toFixed(2)} />
              <Text
                style={{ fontSize: 10, fontWeight: "500", color: "#EA2831" }}
              >
                {(() => {
                  const { expenseChange } = getMonthlyComparison();
                  const sign = expenseChange >= 0 ? "+" : "";
                  return `${sign}${expenseChange.toFixed(0)}% vs last month`;
                })()}
              </Text>
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
            />

            <SpendingTrends transactions={transactions} />

            <PaymentMethods transactions={transactions} />

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
                  style={{ fontSize: 18, fontWeight: "bold", color: "#0d121b" }}
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
                      onEdit={() => handleEditTransaction(transaction)}
                      onDuplicate={() =>
                        handleDuplicateTransaction(transaction)
                      }
                      onDelete={() => handleDeleteTransaction(transaction.id)}
                    />
                  ))
                ) : (
                  <View
                    style={{
                      backgroundColor: "white",
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

      <TransactionApprovalModal
        visible={showApprovalModal}
        onClose={() => {
          setShowApprovalModal(false);
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
