import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import React, { useEffect, useState } from "react";
import {
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import TransactionModal from '../../components/drawers/TransactionModal';
import { AuthService } from "../../services/AuthService";
import { GmailService } from "../../services/GmailService";
import { NotificationParser } from "../../services/NotificationParser";
import { PaymentMethodService } from "../../services/PaymentMethodService";
import { CategoryService } from '../../services/CategoryService';
import { TransactionService } from "../../services/TransactionService";

export default function SmartParsing() {
  const [keywords, setKeywords] = useState<string[]>([]);
  const [newKeyword, setNewKeyword] = useState("");
  const [userEmail, setUserEmail] = useState<string | null>(null);
  const [recentMessages, setRecentMessages] = useState<any[]>([]);
  const [loadingMessages, setLoadingMessages] = useState(false);
  const [editingFields, setEditingFields] = useState<{
    [key: string]: { merchant: string; amount: string; method: string; category: string };
  }>({});
  const [showTransactionModal, setShowTransactionModal] = useState(false);
  const [selectedMessage, setSelectedMessage] = useState<any>(null);
  const [approvedSenders, setApprovedSenders] = useState<any[]>([]);
  const [editingSenderCategory, setEditingSenderCategory] = useState<string | null>(null);
  const [editCategoryValue, setEditCategoryValue] = useState("");
  const [categories, setCategories] = useState<any[]>([]);

  useEffect(() => {
    loadKeywords();
    loadUserEmail();
    loadTransactionEmails();
    loadApprovedSenders();
    loadCategories();
  }, []);

  const loadUserEmail = async () => {
    const email = await AuthService.getUserEmail();
    setUserEmail(email);
  };

  const loadTransactionEmails = async () => {
    setLoadingMessages(true);
    try {
      const transactions = await GmailService.fetchTransactionEmails();
      setRecentMessages(transactions);
    } catch (error) {
      console.error("Error loading transaction emails:", error);
    } finally {
      setLoadingMessages(false);
    }
  };

  const loadKeywords = async () => {
    const savedKeywords = await NotificationParser.getKeywords();
    setKeywords(savedKeywords);
  };

  const loadApprovedSenders = async () => {
    const senders = await NotificationParser.getApprovedSenders();
    setApprovedSenders(senders);
  };

  const loadCategories = async () => {
    const cats = await CategoryService.getCategories();
    setCategories(cats);
  };

  const removeSender = async (sender: string) => {
    const senders = await NotificationParser.getApprovedSenders();
    const filtered = senders.filter((s: any) => s.sender !== sender);
    await NotificationParser.saveApprovedSenders(filtered);
    await loadApprovedSenders();
  };

  const updateSenderCategory = async (sender: string, newCategory: string) => {
    const senders = await NotificationParser.getApprovedSenders();
    const updated = senders.map((s: any) => 
      s.sender === sender ? { ...s, category: newCategory } : s
    );
    await NotificationParser.saveApprovedSenders(updated);
    await loadApprovedSenders();
    setEditingSenderCategory(null);
    setEditCategoryValue("");
  };

  const addKeyword = async () => {
    if (newKeyword.trim()) {
      const updatedKeywords = [...keywords, newKeyword.trim()];
      setKeywords(updatedKeywords);
      await NotificationParser.saveKeywords(updatedKeywords);
      setNewKeyword("");
    }
  };

  const removeKeyword = async (index: number) => {
    const updatedKeywords = keywords.filter((_, i) => i !== index);
    setKeywords(updatedKeywords);
    await NotificationParser.saveKeywords(updatedKeywords);
  };

  const getValidation = (messageId: string) => {
    const message = recentMessages.find((m) => m.id === messageId);
    if (!message) return { isValidMerchant: false, isValidAmount: false, isValidCategory: false, canApprove: false };
    
    const editedData = editingFields[messageId];
    const merchant = editedData?.merchant || message.merchant;
    const amount = editedData?.amount || message.amount;
    const category = editedData?.category || message.category;
    
    const isValidMerchant = merchant && merchant.trim().length > 0;
    const isValidAmount = amount && parseFloat(amount) > 0;
    const isValidCategory = category && category !== 'Others' && category !== 'Other';
    const canApprove = isValidMerchant && isValidAmount && isValidCategory;
    
    return { isValidMerchant, isValidAmount, isValidCategory, canApprove };
  };

  const handleApprove = async (messageId: string) => {
    const message = recentMessages.find((m) => m.id === messageId);
    if (!message) return;

    const editedData = editingFields[messageId];
    const merchant = editedData?.merchant || message.merchant;
    const amount = editedData?.amount || message.amount;
    const category = editedData?.category || message.category;
    const paymentMethod = editedData?.method || message.paymentMethod || "Unknown";
    
    if (!merchant || !amount || !category || category === 'Others' || category === 'Other') {
      return;
    }
    
    const existingMethods = await PaymentMethodService.getPaymentMethods();
    const methodExists = existingMethods.some(m => m.name === paymentMethod);
    
    if (!methodExists && paymentMethod !== "Unknown") {
      await PaymentMethodService.addPaymentMethod({
        name: paymentMethod,
        type: 'card',
        icon: 'card',
        color: '#3b82f6',
      });
    }

    const transaction = {
      merchant,
      amount,
      category,
      paymentMethod: paymentMethod,
      date: message.date,
      type: "expense" as const,
      status: "pending" as const,
      rawMessage: message.message,
      notes: "Email Automated",
    };

    await TransactionService.addTransaction(transaction);
    await NotificationParser.addApprovedSender(message.sender, transaction.category);
    await loadApprovedSenders();
    
    setRecentMessages((prev) => prev.filter((m) => m.id !== messageId));
    setEditingFields((prev) => {
      const updated = { ...prev };
      delete updated[messageId];
      return updated;
    });
  };

  const handleReject = (messageId: string) => {
    setRecentMessages((prev) => prev.filter((m) => m.id !== messageId));
    setEditingFields((prev) => {
      const updated = { ...prev };
      delete updated[messageId];
      return updated;
    });
  };

  const updateField = (
    messageId: string,
    field: "merchant" | "amount" | "method" | "category",
    value: string
  ) => {
    setEditingFields((prev) => ({
      ...prev,
      [messageId]: {
        ...prev[messageId],
        [field]: value,
      },
    }));
  };

  const handleEditClick = async (message: any) => {
    const categories = await CategoryService.getCategories();
    const methods = await PaymentMethodService.getPaymentMethods();
    
    const categoryExists = categories.some(c => c.name === message.category);
    const methodExists = methods.some(m => m.name === message.paymentMethod);
    
    setSelectedMessage({
      ...message,
      merchant: message.merchant,
      amount: message.amount,
      category: categoryExists ? message.category : '',
      paymentMethod: methodExists ? message.paymentMethod : '',
      date: message.date,
    });
    setShowTransactionModal(true);
  };

  const handleTransactionSaved = async () => {
    if (selectedMessage) {
      // Get the latest transactions to find the one just added
      const transactions = await TransactionService.getTransactions();
      const latestTransaction = transactions[0]; // Most recent transaction
      
      if (latestTransaction && latestTransaction.category) {
        const categories = await CategoryService.getCategories();
        const savedCategory = categories.find(c => c.name === latestTransaction.category);
        
        if (savedCategory) {
          await NotificationParser.addApprovedSender(selectedMessage.sender, savedCategory.name);
          await loadApprovedSenders();
        }
      }
      
      setRecentMessages((prev) => prev.filter((m) => m.id !== selectedMessage.id));
      setEditingFields((prev) => {
        const updated = { ...prev };
        delete updated[selectedMessage.id];
        return updated;
      });
    }
    setShowTransactionModal(false);
    setSelectedMessage(null);
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => router.back()}
          style={styles.backButton}
        >
          <Ionicons name="arrow-back" size={24} color="#1f2937" />
        </TouchableOpacity>
        <View style={styles.headerCenter}>
          <Text style={styles.headerTitle}>Smart Parsing</Text>
        </View>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView
        style={styles.content}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={loadingMessages}
            onRefresh={loadTransactionEmails}
            tintColor="#EA2831"
          />
        }
      >
        {/* Receivers Section */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>RECEIVERS</Text>
        </View>

        {/* SMS Coming Soon */}
        <View style={styles.comingSoonGradient}>
          <View style={styles.comingSoonContent}>
            <View style={styles.smsIconContainer}>
              <Ionicons name="chatbubble" size={20} color="white" />
            </View>
            <View style={styles.smsTextContainer}>
              <View style={styles.smsHeaderRow}>
                <Text style={styles.smsTitle}>SMS Messages</Text>
                <View style={styles.comingSoonBadge}>
                  <Text style={styles.comingSoonText}>Coming Soon</Text>
                </View>
              </View>
              <Text style={styles.smsSubtitle}>
                Automated parsing for text notifications
              </Text>
            </View>
          </View>
        </View>

        <View style={styles.divider} />

        {/* Email Accounts */}
        <View style={styles.emailSection}>
          <View style={styles.emailHeader}>
            <Text style={styles.emailTitle}>EMAIL ACCOUNTS</Text>
            {userEmail && (
              <View style={styles.connectedBadge}>
                <Text style={styles.connectedText}>1 Connected</Text>
              </View>
            )}
          </View>

          <View style={styles.emailList}>
            {userEmail && (
              <View style={styles.emailItem}>
                <View style={styles.emailLeft}>
                  <View style={styles.emailIcon}>
                    <Ionicons name="person" size={18} color="#EA2831" />
                  </View>
                  <View>
                    <Text style={styles.emailAddress}>{userEmail}</Text>
                    <Text style={styles.emailSync}>Synced just now</Text>
                  </View>
                </View>
                <View style={styles.emailActions}>
                  <TouchableOpacity
                    style={styles.emailActionButton}
                    onPress={loadTransactionEmails}
                  >
                    <Ionicons name="refresh" size={18} color="#EA2831" />
                  </TouchableOpacity>
                </View>
              </View>
            )}
          </View>

          <TouchableOpacity style={styles.addEmailButton}>
            <Ionicons name="add-circle" size={18} color="#EA2831" />
            <Text style={styles.addEmailText}>Add Email Account</Text>
          </TouchableOpacity>
        </View>

        {/* Active Keywords Section */}
        <View style={styles.section}>
          <View style={styles.keywordsContent}>
            <Text style={styles.sectionTitle}>ACTIVE KEYWORDS</Text>

            <View style={styles.keywordsContainer}>
              {keywords.map((keyword, index) => (
                <View key={index} style={styles.keywordTag}>
                  <Text style={styles.keywordText}>{keyword}</Text>
                  <TouchableOpacity
                    onPress={() => removeKeyword(index)}
                    style={styles.keywordCloseButton}
                  >
                    <Ionicons name="close" size={16} color="#94a3b8" />
                  </TouchableOpacity>
                </View>
              ))}
            </View>
          </View>

          <View style={styles.keywordsDivider} />

          <View style={styles.addKeywordSection}>
            <Text style={styles.inputLabel}>ADD NEW KEYWORD</Text>
            <View style={styles.addKeywordRow}>
              <TextInput
                style={styles.keywordInput}
                placeholder="e.g. Amazon"
                value={newKeyword}
                onChangeText={setNewKeyword}
                placeholderTextColor="#94a3b8"
              />
              <TouchableOpacity style={styles.addButton} onPress={addKeyword}>
                <Text style={styles.addButtonText}>Add</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>

        {/* Recent Transactions Divider */}
        <View style={styles.dividerSection}>
          <View style={styles.dividerLine} />
          <Text style={styles.dividerText}>APPROVED SENDERS</Text>
          <View style={styles.dividerLine} />
        </View>

        {/* Approved Senders */}
        {approvedSenders.length > 0 ? (
          <View style={{ gap: 12, marginBottom: 16 }}>
            {approvedSenders.map((sender, index) => {
              const name = sender.sender.split('<')[0].trim();
              const email = sender.sender.match(/<(.+)>/)?.[1] || sender.sender;
              const initials = name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase();
              const isEditing = editingSenderCategory === sender.sender;
              
              return (
                <View key={index} style={{
                  backgroundColor: 'white',
                  borderRadius: 12,
                  padding: 16,
                  borderWidth: 1,
                  borderColor: '#f1f5f9',
                }}>
                  <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
                    <View style={{
                      width: 48,
                      height: 48,
                      borderRadius: 24,
                      backgroundColor: '#10b981',
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}>
                      <Text style={{ fontSize: 16, fontWeight: 'bold', color: 'white' }}>{initials}</Text>
                    </View>
                    <View style={{ flex: 1 }}>
                      <Text style={{ fontSize: 14, fontWeight: 'bold', color: '#1f2937' }} numberOfLines={1}>{name}</Text>
                      <Text style={{ fontSize: 12, color: '#94a3b8', marginTop: 2 }} numberOfLines={1}>{email}</Text>
                      {isEditing ? (
                        <View style={{ marginTop: 8 }}>
                          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginHorizontal: -16, paddingHorizontal: 16 }}>
                            <View style={{ flexDirection: 'row', gap: 8 }}>
                              {categories.map((cat) => (
                                <TouchableOpacity
                                  key={cat.id}
                                  onPress={() => updateSenderCategory(sender.sender, cat.name)}
                                  style={{
                                    flexDirection: 'row',
                                    alignItems: 'center',
                                    gap: 6,
                                    backgroundColor: editCategoryValue === cat.name ? '#10b981' : '#f8fafc',
                                    paddingHorizontal: 12,
                                    paddingVertical: 6,
                                    borderRadius: 8,
                                    borderWidth: 1,
                                    borderColor: editCategoryValue === cat.name ? '#10b981' : '#e2e8f0',
                                  }}
                                >
                                  <Ionicons name={cat.icon} size={14} color={editCategoryValue === cat.name ? 'white' : '#64748b'} />
                                  <Text style={{ fontSize: 12, fontWeight: '600', color: editCategoryValue === cat.name ? 'white' : '#1f2937' }}>{cat.name}</Text>
                                </TouchableOpacity>
                              ))}
                              <TouchableOpacity
                                onPress={() => {
                                  setEditingSenderCategory(null);
                                  setEditCategoryValue("");
                                }}
                                style={{
                                  backgroundColor: '#f1f5f9',
                                  paddingHorizontal: 12,
                                  paddingVertical: 6,
                                  borderRadius: 8,
                                }}
                              >
                                <Ionicons name="close" size={16} color="#64748b" />
                              </TouchableOpacity>
                            </View>
                          </ScrollView>
                        </View>
                      ) : (
                        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, marginTop: 4 }}>
                          <View style={{
                            backgroundColor: 'rgba(16, 185, 129, 0.1)',
                            paddingHorizontal: 8,
                            paddingVertical: 2,
                            borderRadius: 6,
                          }}>
                            <Text style={{ fontSize: 10, fontWeight: 'bold', color: '#10b981' }}>{sender.category}</Text>
                          </View>
                          <TouchableOpacity
                            onPress={() => {
                              setEditingSenderCategory(sender.sender);
                              setEditCategoryValue(sender.category);
                            }}
                          >
                            <Ionicons name="create-outline" size={14} color="#94a3b8" />
                          </TouchableOpacity>
                        </View>
                      )}
                    </View>
                    <TouchableOpacity
                      onPress={() => removeSender(sender.sender)}
                      style={{
                        width: 32,
                        height: 32,
                        borderRadius: 16,
                        backgroundColor: '#fef2f2',
                        alignItems: 'center',
                        justifyContent: 'center',
                      }}
                    >
                      <Ionicons name="trash-outline" size={16} color="#ef4444" />
                    </TouchableOpacity>
                  </View>
                </View>
              );
            })}
          </View>
        ) : (
          <View style={{
            backgroundColor: 'white',
            borderRadius: 16,
            borderWidth: 1,
            borderColor: '#f1f5f9',
            padding: 32,
            alignItems: 'center',
            marginBottom: 16,
          }}>
            <View style={{
              width: 56,
              height: 56,
              borderRadius: 28,
              backgroundColor: 'rgba(16, 185, 129, 0.1)',
              alignItems: 'center',
              justifyContent: 'center',
              marginBottom: 12,
            }}>
              <Ionicons name="people-outline" size={28} color="#10b981" />
            </View>
            <Text style={{ fontSize: 14, fontWeight: 'bold', color: '#1f2937', marginBottom: 4 }}>No Approved Senders</Text>
            <Text style={{ fontSize: 12, color: '#94a3b8', textAlign: 'center' }}>Approve transactions below to auto-add future emails</Text>
          </View>
        )}

        {/* Recent Transactions Divider */}
        <View style={styles.dividerSection}>
          <View style={styles.dividerLine} />
          <Text style={styles.dividerText}>RECENT TRANSACTIONS</Text>
          <View style={styles.dividerLine} />
        </View>

        {/* Recent Transactions */}
        {loadingMessages ? (
          <View style={{ padding: 40, alignItems: "center" }}>
            <Text style={{ color: "#94a3b8", fontSize: 14 }}>
              Loading messages...
            </Text>
          </View>
        ) : recentMessages.length === 0 ? (
          <View
            style={{
              backgroundColor: "white",
              borderRadius: 16,
              borderWidth: 1,
              borderColor: "#f1f5f9",
              padding: 40,
              alignItems: "center",
              marginBottom: 16,
            }}
          >
            <View
              style={{
                width: 64,
                height: 64,
                borderRadius: 32,
                backgroundColor: "rgba(234, 40, 49, 0.1)",
                alignItems: "center",
                justifyContent: "center",
                marginBottom: 16,
              }}
            >
              <Ionicons name="mail-open-outline" size={32} color="#EA2831" />
            </View>
            <Text
              style={{
                fontSize: 16,
                fontWeight: "bold",
                color: "#1f2937",
                marginBottom: 8,
              }}
            >
              No Recent Transactions
            </Text>
            <Text
              style={{
                fontSize: 14,
                color: "#94a3b8",
                textAlign: "center",
                lineHeight: 20,
              }}
            >
              Add keywords above to start tracking transaction emails from your
              inbox
            </Text>
          </View>
        ) : (
          recentMessages.map((message) => {
            const validation = getValidation(message.id);
            return (
            <View key={message.id} style={styles.messageCard}>
              <View style={styles.messageContent}>
                <View style={styles.messageHeader}>
                  <View style={styles.messageIcon}>
                    <Ionicons name="mail" size={20} color="#EA2831" />
                  </View>
                  <View style={styles.messageInfo}>
                    <View style={styles.messageTopRow}>
                      <Text style={styles.senderLabel} numberOfLines={2}>
                        {message.sender}
                      </Text>
                      <Text style={styles.messageTime}>{message.time}</Text>
                    </View>
                  </View>
                </View>
                <View style={styles.rawMessageContainer}>
                  <Text style={styles.rawMessageText}>{message.message}</Text>
                </View>
                <View style={styles.inlineFormSection}>
                  <View style={styles.inlineFormField}>
                    <View
                      style={[
                        styles.fieldIconContainer,
                        { backgroundColor: "#f8f6f6", borderColor: "#e5e7eb" },
                      ]}
                    >
                      <Ionicons name="storefront" size={20} color="#64748b" />
                    </View>
                    <View style={styles.fieldContent}>
                      <Text
                        style={[styles.inlineFieldLabel, { color: "#64748b" }]}
                      >
                        Merchant
                      </Text>
                      <Text style={styles.inlineFieldInput} numberOfLines={1} ellipsizeMode="tail">{message.merchant}</Text>
                    </View>
                  </View>

                  <View style={styles.inlineFormField}>
                    <View
                      style={[
                        styles.fieldIconContainer,
                        { backgroundColor: "#f8f6f6", borderColor: "#e5e7eb" },
                      ]}
                    >
                      <Ionicons name="cash" size={20} color="#64748b" />
                    </View>
                    <View style={styles.fieldContent}>
                      <Text
                        style={[styles.inlineFieldLabel, { color: "#64748b" }]}
                      >
                        Amount
                      </Text>
                      <Text style={[styles.inlineFieldInput, { fontFamily: "monospace" }]}>₹{message.amount}</Text>
                    </View>
                  </View>

                  <View style={styles.inlineFormField}>
                    <View
                      style={[
                        styles.fieldIconContainer,
                        { backgroundColor: "#f8f6f6", borderColor: "#e5e7eb" },
                      ]}
                    >
                      <Ionicons name="card" size={20} color="#64748b" />
                    </View>
                    <View style={styles.fieldContent}>
                      <Text
                        style={[styles.inlineFieldLabel, { color: "#64748b" }]}
                      >
                        Method
                      </Text>
                      <Text style={styles.inlineFieldInput}>{message.paymentMethod || "Unknown"}</Text>
                    </View>
                  </View>

                  <View style={styles.inlineFormField}>
                    <View
                      style={[
                        styles.fieldIconContainer,
                        { backgroundColor: "#f8f6f6", borderColor: "#e5e7eb" },
                      ]}
                    >
                      <Ionicons name="pricetag" size={20} color="#64748b" />
                    </View>
                    <View style={styles.fieldContent}>
                      <Text
                        style={[styles.inlineFieldLabel, { color: "#64748b" }]}
                      >
                        Category
                      </Text>
                      <Text style={styles.inlineFieldInput}>{message.category}</Text>
                    </View>
                  </View>
                </View>
              </View>

              <View style={styles.actionButtonsContainer}>
                <TouchableOpacity
                  style={styles.rejectButton}
                  onPress={() => handleReject(message.id)}
                >
                  <Ionicons name="ban" size={18} color="#EA2831" />
                  <Text style={styles.rejectText}>Reject</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.approveButton}
                  onPress={() => handleEditClick(message)}
                >
                  <Ionicons name="create" size={18} color="white" />
                  <Text style={styles.approveText}>Edit & Approve</Text>
                </TouchableOpacity>
              </View>
            </View>
          );
          })
        )}

        {/* Info Card */}
        <View style={styles.infoCard}>
          <Ionicons name="information-circle" size={18} color="#1d4ed8" />
          <Text style={styles.infoText}>
            Correcting these values helps the app learn your transaction
            patterns. Tap text in the snippet to quick-select.
          </Text>
        </View>
      </ScrollView>
      
      {selectedMessage && (
        <TransactionModal
          visible={showTransactionModal}
          onClose={() => {
            setShowTransactionModal(false);
            setSelectedMessage(null);
          }}
          prefillData={{
            merchant: selectedMessage.merchant,
            amount: selectedMessage.amount,
            category: selectedMessage.category,
            paymentMethod: selectedMessage.paymentMethod,
            date: selectedMessage.date,
          }}
          onTransactionAdded={handleTransactionSaved}
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f8f6f6",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 24,
    paddingVertical: 16,
    backgroundColor: "rgba(248, 246, 246, 0.9)",
    borderBottomWidth: 1,
    borderBottomColor: "#e5e7eb",
  },
  backButton: {
    padding: 8,
    marginLeft: -8,
    borderRadius: 20,
  },
  headerCenter: {
    alignItems: "center",
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#1f2937",
    letterSpacing: -0.5,
  },
  content: {
    flex: 1,
    paddingHorizontal: 24,
  },
  section: {
    backgroundColor: "white",
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "#f1f5f9",
    marginTop: 24,
    overflow: "hidden",
  },
  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 6,
    paddingVertical: 16,
    paddingBottom: 12,
    paddingTop: 24,
  },
  sectionTitle: {
    fontSize: 12,
    fontWeight: "bold",
    color: "#94a3b8",
    letterSpacing: 1,
  },
  sectionContent: {
    padding: 20,
  },
  comingSoonGradient: {
    backgroundColor: "rgba(234, 40, 49, 0.05)",
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: "rgba(234, 40, 49, 0.2)",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginHorizontal: 6,
  },
  comingSoonContent: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    flex: 1,
  },
  smsIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: "#ea2a33",
    alignItems: "center",
    justifyContent: "center",
  },
  smsTextContainer: {
    flex: 1,
  },
  smsHeaderRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  smsTitle: {
    fontSize: 14,
    fontWeight: "bold",
    color: "#0f172a",
  },
  comingSoonBadge: {
    backgroundColor: "rgba(255, 255, 255, 0.8)",
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: "rgba(234, 40, 49, 0.2)",
  },
  comingSoonText: {
    fontSize: 9,
    fontWeight: "bold",
    color: "#EA2831",
  },
  smsSubtitle: {
    fontSize: 10,
    color: "#475569",
    marginTop: 2,
  },
  lockIcon: {
    opacity: 0.5,
  },
  divider: {
    height: 1,
    backgroundColor: "#f1f5f9",
    marginVertical: 24,
    marginHorizontal: 2,
  },
  emailSection: {
    gap: 16,
    marginHorizontal: 6,
  },
  emailHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  emailTitle: {
    fontSize: 12,
    fontWeight: "bold",
    color: "#94a3b8",
    letterSpacing: 1,
  },
  connectedBadge: {
    backgroundColor: "#f1f5f9",
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 20,
  },
  connectedText: {
    fontSize: 10,
    fontWeight: "bold",
    color: "#64748b",
  },
  emailList: {
    gap: 12,
  },
  emailItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 12,
    backgroundColor: "#f8fafc",
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#f1f5f9",
  },
  emailLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    flex: 1,
  },
  emailIcon: {
    width: 32,
    height: 32,
    borderRadius: 8,
    backgroundColor: "white",
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: "#f1f5f9",
  },
  emailAddress: {
    fontSize: 12,
    fontWeight: "bold",
    color: "#374151",
  },
  emailSync: {
    fontSize: 10,
    color: "#94a3b8",
  },
  emailActions: {
    flexDirection: "row",
    gap: 0,
  },
  emailActionButton: {
    width: 32,
    height: 32,
    borderRadius: 8,
    alignItems: "center",
    justifyContent: "center",
  },
  addEmailButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    paddingVertical: 12,
    borderWidth: 1,
    borderColor: "rgba(234, 40, 49, 0.3)",
    borderRadius: 12,
    backgroundColor: "rgba(234, 40, 49, 0.05)",
  },
  addEmailText: {
    fontSize: 12,
    fontWeight: "bold",
    color: "#EA2831",
  },
  keywordsContent: {
    paddingHorizontal: 20,
    paddingVertical: 16,
    paddingBottom: 12,
  },
  keywordsContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
    marginTop: 12,
  },
  keywordTag: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#f8fafc",
    borderWidth: 1,
    borderColor: "#e2e8f0",
    borderRadius: 8,
    paddingLeft: 12,
    paddingRight: 4,
    paddingVertical: 4,
    gap: 4,
  },
  keywordText: {
    fontSize: 14,
    fontWeight: "500",
    color: "#374151",
  },
  keywordCloseButton: {
    padding: 4,
    borderRadius: 6,
  },
  keywordsDivider: {
    height: 1,
    backgroundColor: "#f1f5f9",
    width: "100%",
    marginVertical: 0,
  },
  addKeywordSection: {
    backgroundColor: "white",
    padding: 16,
  },
  inputLabel: {
    fontSize: 10,
    fontWeight: "bold",
    color: "#94a3b8",
    letterSpacing: 1,
    marginBottom: 8,
    marginLeft: 4,
  },
  addKeywordRow: {
    flexDirection: "row",
    gap: 8,
  },
  keywordInput: {
    flex: 1,
    backgroundColor: "white",
    borderWidth: 1,
    borderColor: "#e2e8f0",
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 10,
    fontSize: 14,
    color: "#0f172a",
  },
  addButton: {
    backgroundColor: "#EA2831",
    paddingHorizontal: 24,
    paddingVertical: 10,
    borderRadius: 12,
    justifyContent: "center",
  },
  addButtonText: {
    color: "white",
    fontSize: 14,
    fontWeight: "bold",
  },
  dividerSection: {
    flexDirection: "row",
    alignItems: "center",
    gap: 16,
    marginVertical: 24,
    paddingHorizontal: 8,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: "#e5e7eb",
  },
  dividerText: {
    fontSize: 10,
    fontWeight: "bold",
    color: "#94a3b8",
    letterSpacing: 1,
  },
  messageCard: {
    backgroundColor: "white",
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "#f1f5f9",
    marginBottom: 16,
    overflow: "hidden",
  },
  messageContent: {
    padding: 20,
  },
  messageHeader: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 12,
    marginBottom: 16,
  },
  messageIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#fef2f2",
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: "#fecaca",
    flexShrink: 0,
  },
  messageInfo: {
    flex: 1,
  },
  messageTopRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
  },
  senderLabel: {
    fontSize: 11,
    fontWeight: "600",
    color: "#475569",
    letterSpacing: 0.3,
    flex: 1,
  },
  messageTime: {
    fontSize: 10,
    color: "#94a3b8",
    marginLeft: 8,
  },
  rawMessageContainer: {
    backgroundColor: "#f8fafc",
    padding: 12,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#f1f5f9",
    marginTop: 8,
  },
  rawMessageText: {
    fontSize: 10,
    fontFamily: "monospace",
    color: "#475569",
    lineHeight: 16,
  },
  inlineFormSection: {
    gap: 12,
    marginTop: 16,
  },
  inlineFormField: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    padding: 4,
    paddingRight: 12,
    backgroundColor: "white",
    borderWidth: 1,
    borderColor: "#f1f5f9",
    borderRadius: 12,
  },
  fieldIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 8,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
  },
  fieldContent: {
    flex: 1,
  },
  inlineFieldLabel: {
    fontSize: 9,
    fontWeight: "bold",
    letterSpacing: 1,
    marginBottom: 2,
  },
  inlineFieldInput: {
    fontSize: 14,
    fontWeight: "600",
    color: "#374151",
    padding: 0,
  },
  actionButtonsContainer: {
    flexDirection: "row",
    gap: 12,
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: "rgba(248, 250, 252, 0.5)",
    borderTopWidth: 1,
    borderTopColor: "#f1f5f9",
  },
  approveButton: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    paddingVertical: 12,
    backgroundColor: "#EA2831",
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#EA2831",
  },
  approveText: {
    fontSize: 12,
    fontWeight: "bold",
    color: "white",
  },
  rejectButton: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    paddingVertical: 12,
    backgroundColor: "white",
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#e5e7eb",
  },
  rejectText: {
    fontSize: 12,
    fontWeight: "bold",
    color: "#EA2831",
  },
  infoCard: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 12,
    backgroundColor: "#dbeafe",
    padding: 16,
    borderRadius: 12,
    marginBottom: 40,
  },
  infoText: {
    flex: 1,
    fontSize: 12,
    color: "#1d4ed8",
    lineHeight: 18,
  },
});
