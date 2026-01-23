import {
  useCategories,
  usePaymentMethods,
  useTransactions,
} from "@/hooks/useQueries";
import { TransactionService } from "@/services/TransactionService";
import { Ionicons } from "@expo/vector-icons";
import React, { useEffect, useRef, useState } from "react";
import {
  Animated,
  Dimensions,
  Modal,
  PanResponder,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import DateTimePickerModal from "./DateTimePickerModal";

const { width: screenWidth } = Dimensions.get("window");

interface TransactionApprovalModalProps {
  visible: boolean;
  onClose: () => void;
}

export default function TransactionApprovalModal({
  visible,
  onClose,
}: TransactionApprovalModalProps) {
  const [currentTransaction, setCurrentTransaction] = useState(0);
  const [amount, setAmount] = useState("");
  const [merchantName, setMerchantName] = useState("");
  const [note, setNote] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("");
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState("");
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [showDatePicker, setShowDatePicker] = useState(false);

  const { data: transactions = [], isLoading: transactionsLoading } =
    useTransactions();
  const { data: categories = [], isLoading: categoriesLoading } =
    useCategories();
  const { data: paymentMethods = [], isLoading: paymentMethodsLoading } =
    usePaymentMethods();

  const pendingTransactions = transactions.filter(
    (t) => t.status === "pending",
  );
  const loading =
    transactionsLoading || categoriesLoading || paymentMethodsLoading;

  // Sort categories and payment methods by usage
  const sortedCategories = React.useMemo(() => {
    const completedTransactions = transactions.filter(t => t.status === 'completed');
    const categoryCount = completedTransactions.reduce((acc, t) => {
      acc[t.category] = (acc[t.category] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);
    return [...categories].sort((a, b) => (categoryCount[b.name] || 0) - (categoryCount[a.name] || 0));
  }, [categories, transactions]);

  const sortedPaymentMethods = React.useMemo(() => {
    const completedTransactions = transactions.filter(t => t.status === 'completed');
    const paymentCount = completedTransactions.reduce((acc, t) => {
      if (t.paymentMethod) acc[t.paymentMethod] = (acc[t.paymentMethod] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);
    return [...paymentMethods].sort((a, b) => (paymentCount[b.name] || 0) - (paymentCount[a.name] || 0));
  }, [paymentMethods, transactions]);

  const pan = useRef(new Animated.ValueXY()).current;
  const opacity = useRef(new Animated.Value(1)).current;

  const currentTx = pendingTransactions[currentTransaction];

  React.useEffect(() => {
    if (!currentTx && visible) {
      onClose();
    }
  }, [currentTx, visible, onClose]);

  useEffect(() => {
    if (visible && pendingTransactions.length > 0 && !loading) {
      const firstTx = pendingTransactions[0];
      setCurrentTransaction(0);
      setAmount(firstTx.amount);
      setMerchantName(firstTx.merchant);
      setNote(firstTx.notes || "");
      setSelectedCategory(firstTx.category === "Other" ? "" : firstTx.category);
      setSelectedPaymentMethod(
        firstTx.paymentMethod === "Other" || !firstTx.paymentMethod
          ? ""
          : firstTx.paymentMethod,
      );
      setSelectedDate(new Date(firstTx.date));
      resetCard();
    }
  }, [visible, pendingTransactions.length, loading]);

  const handleApprove = () => {
    if (!selectedCategory || !selectedPaymentMethod) {
      return;
    }
    animateCardExit("right", () => {
      if (currentTx) {
        TransactionService.updateTransaction(currentTx.id, {
          amount,
          merchant: merchantName,
          notes: note,
          category: selectedCategory,
          paymentMethod: selectedPaymentMethod,
          date: selectedDate.toISOString(),
          status: "completed",
        });
      }
      if (currentTransaction < pendingTransactions.length - 1) {
        const nextTx = pendingTransactions[currentTransaction + 1];
        setCurrentTransaction(currentTransaction + 1);
        setAmount(nextTx.amount);
        setMerchantName(nextTx.merchant);
        setNote(nextTx.notes || "");
        setSelectedCategory(nextTx.category === "Other" ? "" : nextTx.category);
        setSelectedPaymentMethod(
          nextTx.paymentMethod === "Other" || !nextTx.paymentMethod
            ? ""
            : nextTx.paymentMethod,
        );
        setSelectedDate(new Date(nextTx.date));
        resetCard();
      } else {
        onClose();
      }
    });
  };

  const handleReject = () => {
    animateCardExit("left", () => {
      if (currentTx) {
        TransactionService.updateTransaction(currentTx.id, {
          status: "rejected",
        });
      }
      if (currentTransaction < pendingTransactions.length - 1) {
        const nextTx = pendingTransactions[currentTransaction + 1];
        setCurrentTransaction(currentTransaction + 1);
        setAmount(nextTx.amount);
        setMerchantName(nextTx.merchant);
        setNote(nextTx.notes || "");
        setSelectedCategory(nextTx.category === "Other" ? "" : nextTx.category);
        setSelectedPaymentMethod(
          nextTx.paymentMethod === "Other" || !nextTx.paymentMethod
            ? ""
            : nextTx.paymentMethod,
        );
        setSelectedDate(new Date(nextTx.date));
        resetCard();
      } else {
        onClose();
      }
    });
  };

  const animateCardExit = (
    direction: "left" | "right",
    callback: () => void,
  ) => {
    const toValue = direction === "right" ? screenWidth : -screenWidth;
    Animated.parallel([
      Animated.timing(pan.x, {
        toValue,
        duration: 300,
        useNativeDriver: false,
      }),
      Animated.timing(opacity, {
        toValue: 0,
        duration: 300,
        useNativeDriver: false,
      }),
    ]).start(callback);
  };

  const resetCard = () => {
    pan.setValue({ x: 0, y: 0 });
    opacity.setValue(1);
  };

  const panResponder = PanResponder.create({
    onStartShouldSetPanResponder: () => true,
    onMoveShouldSetPanResponder: (_, gestureState) => {
      return Math.abs(gestureState.dx) > 20 && Math.abs(gestureState.dy) < 50;
    },
    onPanResponderGrant: () => {
      pan.setOffset({
        x: pan.x._value,
        y: pan.y._value,
      });
    },
    onPanResponderMove: (_, gestureState) => {
      const canApprove = selectedCategory && selectedPaymentMethod;
      const dx = canApprove ? gestureState.dx : Math.min(gestureState.dx, 0);
      pan.setValue({ x: dx, y: 0 });
      const progress = Math.abs(dx) / (screenWidth * 0.4);
      opacity.setValue(1 - Math.min(progress, 0.5));
    },
    onPanResponderRelease: (_, gestureState) => {
      pan.flattenOffset();
      const threshold = screenWidth * 0.25;

      if (
        gestureState.dx > threshold &&
        selectedCategory &&
        selectedPaymentMethod
      ) {
        // Swipe right - approve
        handleApprove();
      } else if (gestureState.dx < -threshold) {
        // Swipe left - reject
        handleReject();
      } else {
        // Snap back
        Animated.parallel([
          Animated.spring(pan.x, {
            toValue: 0,
            useNativeDriver: false,
          }),
          Animated.spring(opacity, {
            toValue: 1,
            useNativeDriver: false,
          }),
        ]).start();
      }
    },
  });

  if (loading) {
    return (
      <Modal
        visible={visible}
        animationType="fade"
        presentationStyle="overFullScreen"
        transparent
        statusBarTranslucent
      >
        <View
          style={{
            flex: 1,
            backgroundColor: "rgba(0, 0, 0, 0.6)",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <View
            style={{
              backgroundColor: "white",
              borderRadius: 16,
              padding: 32,
              alignItems: "center",
            }}
          >
            <Text
              style={{
                fontSize: 18,
                fontWeight: "bold",
                color: "#1f2937",
                marginTop: 16,
              }}
            >
              Loading...
            </Text>
          </View>
        </View>
      </Modal>
    );
  }

  if (!currentTx) {
    return null;
  }

  return (
    <Modal
      visible={visible}
      animationType="fade"
      presentationStyle="overFullScreen"
      transparent
      statusBarTranslucent
    >
      <View style={{ flex: 1, backgroundColor: "rgba(0, 0, 0, 0.6)" }}>
        <SafeAreaView style={{ flex: 1 }} edges={["top"]}>
          <View
            style={{
              flex: 1,
              alignItems: "center",
              justifyContent: "center",
              paddingHorizontal: 16,
              paddingTop: 60,
              paddingBottom: 20,
            }}
          >
            <View
              style={{
                position: "absolute",
                top: 20,
                left: 16,
                right: 16,
                flexDirection: "row",
                alignItems: "center",
                justifyContent: "space-between",
                paddingHorizontal: 10,
                zIndex: 10,
              }}
            >
              <TouchableOpacity
                onPress={onClose}
                style={{
                  width: 40,
                  height: 40,
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <Ionicons name="chevron-back" size={24} color="white" />
              </TouchableOpacity>

              <Text
                style={{
                  fontSize: 16,
                  fontWeight: "bold",
                  color: "white",
                }}
              >
                {pendingTransactions.length - currentTransaction} Left
              </Text>

              <View style={{ width: 40 }} />
            </View>

            {pendingTransactions.length - currentTransaction > 1 && (
              <>
                {/* Back Card */}
                <View
                  style={{
                    width: "100%",
                    maxWidth: 500,
                    backgroundColor: "white",
                    borderRadius: 32,
                    height: 475,
                    marginBottom: -470,
                    transform: [{ scale: 0.95 }],
                    opacity: 0.3,
                  }}
                />
                {/* Middle Card */}
                <View
                  style={{
                    width: "100%",
                    maxWidth: 500,
                    backgroundColor: "white",
                    borderRadius: 32,
                    height: 470,
                    marginBottom: -470,
                    transform: [{ scale: 0.97 }],
                    opacity: 0.6,
                  }}
                />
              </>
            )}

            {/* Main Transaction Card */}
            <Animated.View
              style={[
                {
                  width: "100%",
                  maxWidth: 500,
                  backgroundColor: "white",
                  borderRadius: 32,
                  shadowColor: "#000",
                  shadowOffset: { width: 0, height: 8 },
                  shadowOpacity: 0.2,
                  shadowRadius: 16,
                  elevation: 8,
                },
                {
                  transform: [{ translateX: pan.x }],
                  opacity: opacity,
                },
              ]}
              {...panResponder.panHandlers}
            >
              <ScrollView showsVerticalScrollIndicator={false}>
                {/* Amount */}
                <View
                  style={{
                    alignItems: "center",
                    paddingVertical: 16,
                    paddingTop: 24,
                  }}
                >
                  <View style={{ flexDirection: "row", alignItems: "center" }}>
                    <Text
                      style={{
                        fontSize: 24,
                        color: "#9ca3af",
                        fontWeight: "800",
                      }}
                    >
                      ₹
                    </Text>
                    <TextInput
                      style={{
                        fontSize: 48,
                        fontWeight: "800",
                        color: "#0d121b",
                        minWidth: 100,
                        textAlign: "center",
                      }}
                      value={amount}
                      onChangeText={setAmount}
                      keyboardType="decimal-pad"
                      placeholder="0.00"
                    />
                  </View>
                </View>

                {/* Merchant */}
                <View style={{ paddingHorizontal: 32 }}>
                  <Text
                    style={{
                      fontSize: 12,
                      fontWeight: "bold",
                      color: "#9ca3af",
                      textTransform: "uppercase",
                      letterSpacing: 1,
                      marginBottom: 8,
                      marginLeft: 4,
                    }}
                  >
                    Merchant
                  </Text>
                  <TextInput
                    style={{
                      backgroundColor: "#f8fafc",
                      borderWidth: 1,
                      borderColor: "#e2e8f0",
                      borderRadius: 12,
                      paddingHorizontal: 16,
                      paddingVertical: 16,
                      fontSize: 16,
                      fontWeight: "600",
                      color: "#0d121b",
                    }}
                    value={merchantName}
                    onChangeText={setMerchantName}
                    placeholder="Enter description"
                    placeholderTextColor="#9ca3af"
                  />
                </View>

                {/* Date */}
                <View style={{ paddingHorizontal: 32, marginTop: 16 }}>
                  <Text
                    style={{
                      fontSize: 12,
                      fontWeight: "bold",
                      color: "#9ca3af",
                      textTransform: "uppercase",
                      letterSpacing: 1,
                      marginBottom: 8,
                      marginLeft: 4,
                    }}
                  >
                    Date
                  </Text>
                  <TouchableOpacity
                    onPress={() => setShowDatePicker(true)}
                    style={{
                      backgroundColor: "#f8fafc",
                      borderWidth: 1,
                      borderColor: "#e2e8f0",
                      borderRadius: 12,
                      paddingHorizontal: 16,
                      paddingVertical: 16,
                      flexDirection: "row",
                      alignItems: "center",
                      gap: 12,
                    }}
                  >
                    <Ionicons
                      name="calendar-outline"
                      size={20}
                      color="#6b7280"
                    />
                    <Text
                      style={{
                        fontSize: 16,
                        fontWeight: "600",
                        color: "#0d121b",
                      }}
                    >
                      {selectedDate.toLocaleDateString("en-IN", {
                        day: "numeric",
                        month: "short",
                        year: "numeric",
                      })}
                      {" • "}
                      {selectedDate.toLocaleTimeString("en-IN", {
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </Text>
                  </TouchableOpacity>
                </View>

                {/* Form Fields */}
                <View style={{ padding: 24, gap: 20, paddingBottom: 24 }}>
                  {/* Category */}
                  <View>
                    <View
                      style={{
                        flexDirection: "row",
                        alignItems: "center",
                        gap: 4,
                        marginBottom: 8,
                        marginLeft: 4,
                      }}
                    >
                      <Text
                        style={{
                          fontSize: 12,
                          fontWeight: "bold",
                          color: !selectedCategory ? "#dc2626" : "#9ca3af",
                          textTransform: "uppercase",
                          letterSpacing: 1,
                        }}
                      >
                        Category
                      </Text>
                      <Ionicons name="star" size={8} color="#dc2626" />
                    </View>
                    <ScrollView
                      horizontal
                      showsHorizontalScrollIndicator={false}
                      style={{ marginHorizontal: -4 }}
                    >
                      <View
                        style={{
                          flexDirection: "row",
                          gap: 8,
                          paddingHorizontal: 4,
                        }}
                      >
                        {sortedCategories.map((cat) => {
                          const isSelected = selectedCategory === cat.name;
                          return (
                            <TouchableOpacity
                              key={cat.id}
                              onPress={() => setSelectedCategory(cat.name)}
                              style={{
                                flexDirection: "row",
                                alignItems: "center",
                                gap: 6,
                                paddingHorizontal: 12,
                                paddingVertical: 8,
                                borderRadius: 20,
                                backgroundColor: isSelected
                                  ? cat.color
                                  : "#f8fafc",
                                borderWidth: 1,
                                borderColor: isSelected
                                  ? cat.color
                                  : !selectedCategory
                                    ? "#fca5a5"
                                    : "#e2e8f0",
                              }}
                            >
                              <Ionicons
                                name={cat.icon as any}
                                size={16}
                                color={isSelected ? "white" : cat.color}
                              />
                              <Text
                                style={{
                                  fontSize: 13,
                                  fontWeight: "600",
                                  color: isSelected ? "white" : "#374151",
                                }}
                              >
                                {cat.name}
                              </Text>
                            </TouchableOpacity>
                          );
                        })}
                      </View>
                    </ScrollView>
                  </View>

                  {/* Payment Method */}
                  <View>
                    <View
                      style={{
                        flexDirection: "row",
                        alignItems: "center",
                        gap: 4,
                        marginBottom: 8,
                        marginLeft: 4,
                      }}
                    >
                      <Text
                        style={{
                          fontSize: 12,
                          fontWeight: "bold",
                          color: !selectedPaymentMethod ? "#dc2626" : "#9ca3af",
                          textTransform: "uppercase",
                          letterSpacing: 1,
                        }}
                      >
                        Payment Method
                      </Text>
                      <Ionicons name="star" size={8} color="#dc2626" />
                    </View>
                    <ScrollView
                      horizontal
                      showsHorizontalScrollIndicator={false}
                      style={{ marginHorizontal: -4 }}
                    >
                      <View
                        style={{
                          flexDirection: "row",
                          gap: 8,
                          paddingHorizontal: 4,
                        }}
                      >
                        {sortedPaymentMethods.map((method) => {
                          const isSelected =
                            selectedPaymentMethod === method.name;
                          return (
                            <TouchableOpacity
                              key={method.id}
                              onPress={() =>
                                setSelectedPaymentMethod(method.name)
                              }
                              style={{
                                flexDirection: "row",
                                alignItems: "center",
                                gap: 6,
                                paddingHorizontal: 12,
                                paddingVertical: 8,
                                borderRadius: 20,
                                backgroundColor: isSelected
                                  ? method.color
                                  : "#f8fafc",
                                borderWidth: 1,
                                borderColor: isSelected
                                  ? method.color
                                  : !selectedPaymentMethod
                                    ? "#fca5a5"
                                    : "#e2e8f0",
                              }}
                            >
                              <Ionicons
                                name={method.icon as any}
                                size={16}
                                color={isSelected ? "white" : method.color}
                              />
                              <Text
                                style={{
                                  fontSize: 13,
                                  fontWeight: "600",
                                  color: isSelected ? "white" : "#374151",
                                }}
                              >
                                {method.name}
                              </Text>
                            </TouchableOpacity>
                          );
                        })}
                      </View>
                    </ScrollView>
                  </View>

                  {/* Note */}
                  <View>
                    <Text
                      style={{
                        fontSize: 12,
                        fontWeight: "bold",
                        color: "#9ca3af",
                        textTransform: "uppercase",
                        letterSpacing: 1,
                        marginBottom: 8,
                        marginLeft: 4,
                      }}
                    >
                      Notes
                    </Text>
                    <TextInput
                      style={{
                        backgroundColor: "#f8fafc",
                        borderWidth: 1,
                        borderColor: "#e2e8f0",
                        borderRadius: 12,
                        paddingHorizontal: 16,
                        paddingVertical: 16,
                        fontSize: 14,
                        color: "#374151",
                        height: 80,
                        textAlignVertical: "top",
                      }}
                      placeholder="Add a note..."
                      placeholderTextColor="#9ca3af"
                      value={note}
                      onChangeText={setNote}
                      multiline
                    />
                  </View>
                </View>
              </ScrollView>
            </Animated.View>

            {/* Action Buttons */}
            <View
              style={{
                flexDirection: "row",
                gap: 16,
                marginTop: 20,
                width: "100%",
                maxWidth: 360,
              }}
            >
              <TouchableOpacity
                style={{
                  flex: 1,
                  flexDirection: "row",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: 8,
                  paddingVertical: 16,
                  borderRadius: 12,
                  borderWidth: 1,
                  borderColor: "#fecaca",
                  backgroundColor: "white",
                  shadowColor: "#000",
                  shadowOffset: { width: 0, height: 4 },
                  shadowOpacity: 0.1,
                  shadowRadius: 8,
                  elevation: 4,
                }}
                onPress={handleReject}
              >
                <Ionicons name="close" size={20} color="#dc2626" />
                <Text
                  style={{ fontSize: 16, fontWeight: "bold", color: "#dc2626" }}
                >
                  Reject
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={{
                  flex: 1,
                  flexDirection: "row",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: 8,
                  paddingVertical: 16,
                  borderRadius: 12,
                  backgroundColor:
                    !selectedCategory || !selectedPaymentMethod
                      ? "#d1d5db"
                      : "#EA2831",
                  shadowColor: "#EA2831",
                  shadowOffset: { width: 0, height: 4 },
                  shadowOpacity:
                    !selectedCategory || !selectedPaymentMethod ? 0 : 0.3,
                  shadowRadius: 8,
                  elevation:
                    !selectedCategory || !selectedPaymentMethod ? 0 : 4,
                }}
                onPress={handleApprove}
                disabled={!selectedCategory || !selectedPaymentMethod}
              >
                <Ionicons name="checkmark" size={20} color="white" />
                <Text
                  style={{ fontSize: 16, fontWeight: "bold", color: "white" }}
                >
                  Approve
                </Text>
              </TouchableOpacity>
            </View>

            <Text
              style={{
                fontSize: 12,
                fontWeight: "500",
                color: "rgba(255, 255, 255, 0.6)",
                textAlign: "center",
                marginTop: 10,
              }}
            >
              Swipe right to approve
            </Text>
          </View>
        </SafeAreaView>
      </View>

      <DateTimePickerModal
        visible={showDatePicker}
        onClose={() => setShowDatePicker(false)}
        onSelectDateTime={(date) => {
          setSelectedDate(date);
          setShowDatePicker(false);
        }}
        initialDate={selectedDate}
      />
    </Modal>
  );
}
