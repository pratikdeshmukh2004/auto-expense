import { Ionicons } from "@expo/vector-icons";
import { router, useFocusEffect } from "expo-router";
import React, { useEffect, useState } from "react";
import {
  Alert,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import * as SecureStore from 'expo-secure-store';
import { TransactionModal } from '../../components/modals';
import { StorageKeys } from '../../constants/StorageKeys';
import { AuthService } from "../../services/AuthService";
import { GmailService } from "../../services/GmailService";
import { NotificationParser } from "../../services/NotificationParser";
import { PaymentMethodService } from "../../services/PaymentMethodService";
import { CategoryService } from '../../services/CategoryService';
import { StorageService } from "../../services/StorageService";
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
  const [paymentMethods, setPaymentMethods] = useState<any[]>([]);
  const [rejectedTransactions, setRejectedTransactions] = useState<any[]>([]);
  const [activeTab, setActiveTab] = useState<'configure' | 'activity'>('configure');
  const [activitySubTab, setActivitySubTab] = useState<'pending' | 'rejected'>('pending');
  const [expandedMessages, setExpandedMessages] = useState<Set<string>>(new Set());
  const [lastSyncTime, setLastSyncTime] = useState<string>('Never');
  const [dateRange, setDateRange] = useState<'thisMonth' | 'lastMonth' | 'last3Months' | 'last6Months' | 'last9Months' | 'thisYear' | 'lastYear'>('thisMonth');
  const [addingKeyword, setAddingKeyword] = useState(false);
  const [deletingKeyword, setDeletingKeyword] = useState<number | null>(null);
  const [showAllKeywords, setShowAllKeywords] = useState(false);
  const [showAllMessages, setShowAllMessages] = useState(false);

  useEffect(() => {
    loadKeywords();
    loadUserEmail();
    loadApprovedSenders();
    loadCategories();
    loadPaymentMethods();
    loadRejectedTransactions();
    loadLastSyncTime();
  }, []);

  useFocusEffect(
    React.useCallback(() => {
      loadLastSyncTime();
    }, [])
  );

  useEffect(() => {
    if (activeTab === 'activity') {
      checkAutoParsingAndLoad();
    }
  }, [activeTab, dateRange]);

  const checkAutoParsingAndLoad = async () => {
    const autoParsingEnabled = await SecureStore.getItemAsync(StorageKeys.AUTO_PARSING_ENABLED);
    if (autoParsingEnabled === 'false') {
      Alert.alert(
        'Auto-Parsing Disabled',
        'Email transaction parsing is currently turned off. Enable it in Settings to automatically track transactions from your emails.',
        [
          { text: 'OK', style: 'cancel' },
          { 
            text: 'Enable Now', 
            onPress: async () => {
              await SecureStore.setItemAsync(StorageKeys.AUTO_PARSING_ENABLED, 'true');
              loadTransactionEmails();
            }
          }
        ]
      );
    } else {
      loadTransactionEmails();
    }
  };

  const loadUserEmail = async () => {
    const email = await AuthService.getUserEmail();
    setUserEmail(email);
  };

  const loadLastSyncTime = async () => {
    const lastSync = await SecureStore.getItemAsync(StorageKeys.LAST_EMAIL_SYNC);
    if (lastSync) {
      const syncDate = new Date(lastSync);
      const now = new Date();
      const diffMs = now.getTime() - syncDate.getTime();
      const diffMins = Math.floor(diffMs / 60000);
      
      if (diffMins < 1) {
        setLastSyncTime('Just now');
      } else if (diffMins < 60) {
        setLastSyncTime(`${diffMins}m ago`);
      } else if (diffMins < 1440) {
        const hours = Math.floor(diffMins / 60);
        setLastSyncTime(`${hours}h ago`);
      } else {
        const days = Math.floor(diffMins / 1440);
        setLastSyncTime(`${days}d ago`);
      }
    }
  };

  const loadTransactionEmails = async () => {
    setLoadingMessages(true);
    try {
      const transactions = await GmailService.fetchTransactionEmails();
      setRecentMessages(transactions);
      await SecureStore.setItemAsync(StorageKeys.LAST_EMAIL_SYNC, new Date().toISOString());
      await loadLastSyncTime();
    } catch (error) {
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
  
  const loadPaymentMethods = async () => {
    const methods = await PaymentMethodService.getPaymentMethods();
    setPaymentMethods(methods);
  };

  const loadRejectedTransactions = async () => {
    const rejected = await TransactionService.getRejectedTransactions();
    const formatted = rejected.map((t) => ({
      id: t.id,
      sender: t.notes || 'Transaction',
      message: t.rawMessage || `${t.merchant} - ₹${t.amount}`,
      merchant: t.merchant,
      amount: t.amount,
      category: t.category,
      paymentMethod: t.paymentMethod,
      date: t.date,
      time: new Date(t.timestamp).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }),
    }));
    setRejectedTransactions(formatted);
  };

  const removeSender = async (sender: string) => {
    Alert.alert(
      'Delete Approved Sender',
      'Do you want to delete transactions from this sender as well?',
      [
        {
          text: 'Cancel',
          style: 'cancel'
        },
        {
          text: 'Keep Transactions',
          onPress: async () => {
            const senders = await NotificationParser.getApprovedSenders();
            const filtered = senders.filter((s: any) => s.sender !== sender);
            await NotificationParser.saveApprovedSenders(filtered);
            await loadApprovedSenders();
          }
        },
        {
          text: 'Delete All',
          style: 'destructive',
          onPress: async () => {
            await TransactionService.deleteTransactionsBySender(sender);
            const senders = await NotificationParser.getApprovedSenders();
            const filtered = senders.filter((s: any) => s.sender !== sender);
            await NotificationParser.saveApprovedSenders(filtered);
            await loadApprovedSenders();
          }
        }
      ]
    );
  };

  const updateSenderCategory = async (sender: string, newPaymentMethod: string) => {
    const senders = await NotificationParser.getApprovedSenders();
    const updated = senders.map((s: any) => 
      s.sender === sender ? { ...s, paymentMethod: newPaymentMethod } : s
    );
    await NotificationParser.saveApprovedSenders(updated);
    await loadApprovedSenders();
    setEditingSenderCategory(null);
    setEditCategoryValue("");
  };

  const addKeyword = async () => {
    if (newKeyword.trim() && !addingKeyword) {
      setAddingKeyword(true);
      try {
        const existingKeywords = await StorageService.getKeywords();
        const newId = Date.now().toString();
        const updatedKeywords = [...existingKeywords, { id: newId, keyword: newKeyword.trim(), category: 'expense' }];
        await StorageService.saveKeywords(updatedKeywords);
        await loadKeywords();
        setNewKeyword("");
      } finally {
        setAddingKeyword(false);
      }
    }
  };

  const removeKeyword = async (index: number) => {
    if (deletingKeyword === index) return;
    setDeletingKeyword(index);
    try {
      const existingKeywords = await StorageService.getKeywords();
      const updatedKeywords = existingKeywords.filter((_: any, i: number) => i !== index);
      await StorageService.saveKeywords(updatedKeywords);
      await loadKeywords();
    } finally {
      setDeletingKeyword(null);
    }
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
    const paymentMethod = editedData?.method || message.paymentMethod || "Other";
    
    if (!merchant || !amount || !category || category === 'Others' || category === 'Other') {
      return;
    }
    
    const existingMethods = await PaymentMethodService.getPaymentMethods();
    const methodExists = existingMethods.some(m => m.name === paymentMethod);

    const transaction = {
      merchant,
      amount,
      category,
      paymentMethod: methodExists ? paymentMethod : 'Other',
      date: message.date,
      type: "expense" as const,
      status: "pending" as const,
      rawMessage: message.message,
      notes: "Email Automated",
      sender: message.sender,
    };

    await TransactionService.addTransaction(transaction);
    await NotificationParser.addApprovedSender(message.sender, paymentMethod);
    await loadApprovedSenders();
    
    setRecentMessages((prev) => prev.filter((m) => m.id !== messageId));
    setEditingFields((prev) => {
      const updated = { ...prev };
      delete updated[messageId];
      return updated;
    });
  };

  const handleReject = async (messageId: string) => {
    const message = recentMessages.find((m) => m.id === messageId);
    if (message) {
      await TransactionService.addTransaction({
        merchant: message.merchant,
        amount: message.amount,
        category: message.category,
        paymentMethod: message.paymentMethod || 'Unknown',
        date: message.date,
        type: 'expense',
        status: 'rejected',
        rawMessage: message.message,
        sender: message.sender,
      });
      await loadRejectedTransactions();
      setActivitySubTab('rejected');
    }
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
      
      // Update the transaction with sender if it was just added
      if (latestTransaction && !latestTransaction.sender) {
        await TransactionService.updateTransaction(latestTransaction.id, {
          sender: selectedMessage.sender
        });
      }
      
      if (latestTransaction && latestTransaction.paymentMethod) {
        const methods = await PaymentMethodService.getPaymentMethods();
        const savedMethod = methods.find(m => m.name === latestTransaction.paymentMethod);
        
        if (savedMethod) {
          await NotificationParser.addApprovedSender(selectedMessage.sender, savedMethod.name);
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

  const handleRestoreRejected = async (transaction: any) => {
    await TransactionService.deleteTransaction(transaction.id);
    await loadRejectedTransactions();
    await loadTransactionEmails();
  };

  const handleDeleteRejected = async (id: string) => {
    await TransactionService.deleteTransaction(id);
    await loadRejectedTransactions();
  };

  const toggleMessageExpand = (messageId: string) => {
    setExpandedMessages(prev => {
      const newSet = new Set(prev);
      if (newSet.has(messageId)) {
        newSet.delete(messageId);
      } else {
        newSet.add(messageId);
      }
      return newSet;
    });
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

      {/* Tabs */}
      <View style={styles.tabContainer}>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'configure' && styles.activeTab]}
          onPress={() => setActiveTab('configure')}
        >
          <Text style={[styles.tabText, activeTab === 'configure' && styles.activeTabText]}>Configure</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'activity' && styles.activeTab]}
          onPress={() => setActiveTab('activity')}
        >
          <Text style={[styles.tabText, activeTab === 'activity' && styles.activeTabText]}>Activity</Text>
        </TouchableOpacity>
      </View>

      <ScrollView
        style={styles.content}
        showsVerticalScrollIndicator={false}
      >
        {activeTab === 'configure' ? (
          <>
            {/* Receivers Section */}
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>RECEIVERS</Text>
              <Text style={{ fontSize: 11, color: '#6b7280', marginTop: 4, lineHeight: 16 }}>
                Connect accounts to automatically track transactions
              </Text>
            </View>

            {/* SMS Messages Card */}
            <View style={{
              backgroundColor: 'rgba(234, 40, 49, 0.05)',
              borderWidth: 1,
              borderColor: 'rgba(234, 40, 49, 0.2)',
              borderRadius: 16,
              padding: 16,
              marginBottom: 12,
              marginHorizontal: 24,
              position: 'relative',
              overflow: 'hidden',
            }}>
              <View style={styles.cardHeader}>
                <View style={styles.cardHeaderLeft}>
                  <View style={styles.emailIconContainer}>
                    <Ionicons name="chatbubble" size={20} color="#EA2831" />
                  </View>
                  <View>
                    <Text style={styles.cardTitle}>SMS Messages</Text>
                    <Text style={styles.cardSubtitle}>Automated SMS transaction parsing</Text>
                  </View>
                </View>
                <View style={styles.comingSoonBadge}>
                  <Text style={styles.comingSoonText}>COMING SOON</Text>
                </View>
              </View>
              <View style={{
                position: 'absolute',
                right: -48,
                top: -48,
                width: 128,
                height: 128,
                backgroundColor: 'rgba(234, 40, 49, 0.05)',
                borderRadius: 64,
              }} />
            </View>

            {/* Email Accounts Card */}
            <View style={styles.card}>
              <View style={styles.cardHeader}>
                <View style={styles.cardHeaderLeft}>
                  <View style={styles.emailIconContainer}>
                    <Ionicons name="mail" size={20} color="#EA2831" />
                  </View>
                  <View>
                    <Text style={styles.cardTitle}>Email Accounts</Text>
                    <Text style={styles.cardSubtitle}>{userEmail ? '1 account connected' : 'No accounts connected'}</Text>
                  </View>
                </View>
              </View>

              {userEmail && (
                <View style={styles.emailItem}>
                  <View style={styles.emailLeft}>
                    <View style={styles.emailAvatar}>
                      <Ionicons name="person" size={16} color="#64748b" />
                    </View>
                    <View style={{ flex: 1 }}>
                      <Text style={styles.emailAddress}>{userEmail}</Text>
                      <Text style={styles.emailSync}>Last sync: {lastSyncTime}</Text>
                    </View>
                  </View>
                  <TouchableOpacity onPress={loadTransactionEmails}>
                    <Ionicons name="refresh" size={20} color="#94a3b8" />
                  </TouchableOpacity>
                </View>
              )}

              <TouchableOpacity style={styles.addButton}>
                <Ionicons name="add-circle" size={20} color="#EA2831" />
                <Text style={styles.addButtonText}>Add Email Account</Text>
              </TouchableOpacity>
            </View>

            {/* Active Keywords Section */}
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>ACTIVE KEYWORDS</Text>
              <Text style={{ fontSize: 11, color: '#6b7280', marginTop: 4, lineHeight: 16 }}>
                Keywords help identify transaction emails from banks and payment apps
              </Text>
            </View>

            <View style={styles.card}>
              <View style={styles.keywordsContainer}>
                {(showAllKeywords ? keywords : keywords.slice(0, 6)).map((keyword, index) => (
                  <View key={index} style={styles.keywordTag}>
                    <Text style={styles.keywordText}>{keyword}</Text>
                    <TouchableOpacity
                      onPress={() => removeKeyword(index)}
                      style={styles.keywordCloseButton}
                      disabled={deletingKeyword === index}
                    >
                      {deletingKeyword === index ? (
                        <Text style={{ fontSize: 10, color: '#94a3b8' }}>...</Text>
                      ) : (
                        <Ionicons name="close" size={14} color="#64748b" />
                      )}
                    </TouchableOpacity>
                  </View>
                ))}
                {keywords.length > 6 && (
                  <TouchableOpacity 
                    style={styles.showMoreButton}
                    onPress={() => setShowAllKeywords(!showAllKeywords)}
                  >
                    <Text style={styles.showMoreText}>
                      {showAllKeywords ? 'Show Less' : `+${keywords.length - 6} More`}
                    </Text>
                  </TouchableOpacity>
                )}
              </View>

              <View style={styles.dividerLine} />

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
                  <TouchableOpacity 
                    style={styles.addKeywordButton} 
                    onPress={addKeyword}
                    disabled={addingKeyword || !newKeyword.trim()}
                  >
                    <Text style={styles.addKeywordButtonText}>
                      {addingKeyword ? 'Adding...' : 'Add'}
                    </Text>
                  </TouchableOpacity>
                </View>
              </View>
            </View>

            {/* Approved Senders Section */}
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>APPROVED SENDERS</Text>
              <Text style={{ fontSize: 11, color: '#6b7280', marginTop: 4, lineHeight: 16 }}>
                Trusted senders whose transactions are auto-approved
              </Text>
            </View>

            {approvedSenders.length > 0 ? (
              <View style={{ gap: 12, marginBottom: 16, marginHorizontal: 24 }}>
                {approvedSenders.map((sender, index) => {
                  const name = sender.sender.split('<')[0].trim();
                  const email = sender.sender.match(/<(.+)>/)?.[1] || sender.sender;
                  const initials = name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase();
                  const isEditing = editingSenderCategory === sender.sender;
                  
                  return (
                    <View key={index} style={{
                      backgroundColor: 'white',
                      borderRadius: 16,
                      padding: 16,
                      shadowColor: "#000",
                      shadowOffset: { width: 0, height: 1 },
                      shadowOpacity: 0.05,
                      shadowRadius: 2,
                      elevation: 1,
                    }}>
                      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
                        <View style={styles.senderAvatar}>
                          <Text style={styles.senderInitials}>{initials}</Text>
                        </View>
                        <View style={{ flex: 1 }}>
                          <Text style={styles.senderName} numberOfLines={1}>{name}</Text>
                          <Text style={styles.senderEmail} numberOfLines={1}>{email}</Text>
                          {isEditing ? (
                            <View style={{ marginTop: 8 }}>
                              <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                                <View style={{ flexDirection: 'row', gap: 8 }}>
                                  {paymentMethods.map((method) => (
                                    <TouchableOpacity
                                      key={method.id}
                                      onPress={() => updateSenderCategory(sender.sender, method.name)}
                                      style={[
                                        styles.categoryChip,
                                        editCategoryValue === method.name && styles.categoryChipActive
                                      ]}
                                    >
                                      <Ionicons name={method.icon} size={12} color={editCategoryValue === method.name ? 'white' : '#64748b'} />
                                      <Text style={[
                                        styles.categoryChipText,
                                        editCategoryValue === method.name && styles.categoryChipTextActive
                                      ]}>{method.name}</Text>
                                    </TouchableOpacity>
                                  ))}
                                  <TouchableOpacity
                                    onPress={() => {
                                      setEditingSenderCategory(null);
                                      setEditCategoryValue("");
                                    }}
                                    style={styles.categoryChipCancel}
                                  >
                                    <Ionicons name="close" size={14} color="#64748b" />
                                  </TouchableOpacity>
                                </View>
                              </ScrollView>
                            </View>
                          ) : (
                            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, marginTop: 4 }}>
                              <View style={styles.categoryBadge}>
                                <Text style={styles.categoryBadgeText}>{sender.paymentMethod || 'Not Set'}</Text>
                              </View>
                              <TouchableOpacity
                                onPress={() => {
                                  setEditingSenderCategory(sender.sender);
                                  setEditCategoryValue(sender.paymentMethod || '');
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
              <View style={styles.emptyCard}>
                <View style={styles.emptyIcon}>
                  <Ionicons name="people-outline" size={28} color="#10b981" />
                </View>
                <Text style={styles.emptyTitle}>No Approved Senders</Text>
                <Text style={styles.emptySubtitle}>Approve transactions to auto-add future emails</Text>
              </View>
            )}
          </>
        ) : (
          <>
            {/* Activity Sub-Tabs */}
            <View style={styles.subTabContainer}>
              <TouchableOpacity
                style={styles.subTab}
                onPress={() => setActivitySubTab('pending')}
              >
                <Text style={[styles.subTabText, activitySubTab === 'pending' && styles.activeSubTabText]}>Pending</Text>
                {activitySubTab === 'pending' && <View style={styles.subTabIndicator} />}
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.subTab}
                onPress={() => setActivitySubTab('rejected')}
              >
                <Text style={[styles.subTabText, activitySubTab === 'rejected' && styles.activeSubTabText]}>Rejected</Text>
                {activitySubTab === 'rejected' && <View style={styles.subTabIndicator} />}
              </TouchableOpacity>
            </View>

            {activitySubTab === 'pending' ? (
              <>
            {/* Activity Tab Content */}
            <View style={{ paddingHorizontal: 24, paddingTop: 24, paddingBottom: 8 }}>
              <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <View style={{ flex: 1 }}>
                  <Text style={styles.sectionTitle}>RECENT TRANSACTIONS</Text>
                  <Text style={{ fontSize: 11, color: '#6b7280', marginTop: 4, lineHeight: 16 }}>
                    Review and approve parsed transactions from your emails
                  </Text>
                </View>
                <TouchableOpacity
                  onPress={loadTransactionEmails}
                  disabled={loadingMessages}
                  style={{ padding: 4 }}
                >
                  <Ionicons name="refresh" size={22} color={loadingMessages ? '#d1d5db' : '#EA2831'} />
                </TouchableOpacity>
              </View>
            </View>
            
            {/* Date Range Selector */}
            <View style={{ paddingHorizontal: 24, marginBottom: 16 }}>
              <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                <View style={{ flexDirection: 'row', gap: 8 }}>
                  <TouchableOpacity
                    style={[
                      styles.dateRangeChip,
                      dateRange === 'thisMonth' && styles.dateRangeChipActive
                    ]}
                    onPress={() => setDateRange('thisMonth')}
                  >
                    <Text style={[
                      styles.dateRangeText,
                      dateRange === 'thisMonth' && styles.dateRangeTextActive
                    ]}>This Month</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={[
                      styles.dateRangeChip,
                      dateRange === 'lastMonth' && styles.dateRangeChipActive
                    ]}
                    onPress={() => setDateRange('lastMonth')}
                  >
                    <Text style={[
                      styles.dateRangeText,
                      dateRange === 'lastMonth' && styles.dateRangeTextActive
                    ]}>Last Month</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={[
                      styles.dateRangeChip,
                      dateRange === 'last3Months' && styles.dateRangeChipActive
                    ]}
                    onPress={() => setDateRange('last3Months')}
                  >
                    <Text style={[
                      styles.dateRangeText,
                      dateRange === 'last3Months' && styles.dateRangeTextActive
                    ]}>Last 3 Months</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={[
                      styles.dateRangeChip,
                      dateRange === 'last6Months' && styles.dateRangeChipActive
                    ]}
                    onPress={() => setDateRange('last6Months')}
                  >
                    <Text style={[
                      styles.dateRangeText,
                      dateRange === 'last6Months' && styles.dateRangeTextActive
                    ]}>Last 6 Months</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={[
                      styles.dateRangeChip,
                      dateRange === 'last9Months' && styles.dateRangeChipActive
                    ]}
                    onPress={() => setDateRange('last9Months')}
                  >
                    <Text style={[
                      styles.dateRangeText,
                      dateRange === 'last9Months' && styles.dateRangeTextActive
                    ]}>Last 9 Months</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={[
                      styles.dateRangeChip,
                      dateRange === 'thisYear' && styles.dateRangeChipActive
                    ]}
                    onPress={() => setDateRange('thisYear')}
                  >
                    <Text style={[
                      styles.dateRangeText,
                      dateRange === 'thisYear' && styles.dateRangeTextActive
                    ]}>This Year</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={[
                      styles.dateRangeChip,
                      dateRange === 'lastYear' && styles.dateRangeChipActive
                    ]}
                    onPress={() => setDateRange('lastYear')}
                  >
                    <Text style={[
                      styles.dateRangeText,
                      dateRange === 'lastYear' && styles.dateRangeTextActive
                    ]}>Last Year</Text>
                  </TouchableOpacity>
                </View>
              </ScrollView>
            </View>

        {/* Recent Transactions */}
        {loadingMessages ? (
          <View style={{ padding: 40, alignItems: "center", marginHorizontal: 24 }}>
            <Text style={{ color: "#94a3b8", fontSize: 14 }}>
              Loading messages...
            </Text>
          </View>
        ) : recentMessages.length === 0 ? (
          <View
            style={{
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
          (showAllMessages ? recentMessages : recentMessages.slice(0, 3)).map((message) => {
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
                  <Text style={styles.rawMessageText} numberOfLines={expandedMessages.has(message.id) ? undefined : 2}>
                    {message.message}
                  </Text>
                  <TouchableOpacity 
                    onPress={() => toggleMessageExpand(message.id)}
                    style={{ marginTop: 8 }}
                  >
                    <Text style={{ fontSize: 11, color: '#EA2831', fontWeight: '600' }}>
                      {expandedMessages.has(message.id) ? 'Show less' : 'Show email'}
                    </Text>
                  </TouchableOpacity>
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
        
        {recentMessages.length > 3 && (
          <View style={{ paddingHorizontal: 24, marginBottom: 16 }}>
            <TouchableOpacity 
              style={styles.showMoreMessagesButton}
              onPress={() => setShowAllMessages(!showAllMessages)}
            >
              <Text style={styles.showMoreMessagesText}>
                {showAllMessages ? 'Show Less' : `Show ${recentMessages.length - 3} More Messages`}
              </Text>
              <Ionicons 
                name={showAllMessages ? 'chevron-up' : 'chevron-down'} 
                size={16} 
                color="#EA2831" 
              />
            </TouchableOpacity>
          </View>
        )}
              </>
            ) : (
              <>
                <View style={styles.sectionHeader}>
                  <Text style={styles.sectionTitle}>REJECTED TRANSACTIONS</Text>
                  <Text style={{ fontSize: 11, color: '#6b7280', marginTop: 4, lineHeight: 16 }}>
                    Transactions you've rejected - restore or delete permanently
                  </Text>
                </View>

                {rejectedTransactions.length === 0 ? (
                  <View style={{
                    padding: 40,
                    alignItems: "center",
                    marginBottom: 16,
                  }}>
                    <View style={styles.emptyIcon}>
                      <Ionicons name="checkmark-circle-outline" size={28} color="#10b981" />
                    </View>
                    <Text style={styles.emptyTitle}>No Rejected Transactions</Text>
                    <Text style={styles.emptySubtitle}>All transactions have been reviewed</Text>
                  </View>
                ) : (
                  rejectedTransactions.map((transaction) => (
              <View key={transaction.id} style={styles.rejectedCard}>
                <View style={styles.messageContent}>
                  <View style={styles.messageHeader}>
                    <View style={styles.rejectedIcon}>
                      <Ionicons name="close-circle" size={20} color="#EA2831" />
                    </View>
                    <View style={styles.messageInfo}>
                      <View style={styles.messageTopRow}>
                        <Text style={styles.senderLabel} numberOfLines={2}>
                          {transaction.sender}
                        </Text>
                        <Text style={styles.messageTime}>{transaction.time}</Text>
                      </View>
                    </View>
                  </View>
                  <View style={styles.rawMessageContainer}>
                    <Text style={styles.rawMessageText}>{transaction.message}</Text>
                  </View>
                  <View style={styles.inlineFormSection}>
                    <View style={styles.inlineFormField}>
                      <View style={[styles.fieldIconContainer, { backgroundColor: "rgba(234, 40, 49, 0.1)", borderColor: "rgba(234, 40, 49, 0.2)" }]}>
                        <Ionicons name="storefront" size={20} color="#EA2831" />
                      </View>
                      <View style={styles.fieldContent}>
                        <Text style={[styles.inlineFieldLabel, { color: "#EA2831" }]}>Merchant</Text>
                        <Text style={styles.inlineFieldInput} numberOfLines={1}>{transaction.merchant}</Text>
                      </View>
                    </View>
                    <View style={styles.inlineFormField}>
                      <View style={[styles.fieldIconContainer, { backgroundColor: "rgba(234, 40, 49, 0.1)", borderColor: "rgba(234, 40, 49, 0.2)" }]}>
                        <Ionicons name="cash" size={20} color="#EA2831" />
                      </View>
                      <View style={styles.fieldContent}>
                        <Text style={[styles.inlineFieldLabel, { color: "#EA2831" }]}>Amount</Text>
                        <Text style={[styles.inlineFieldInput, { fontFamily: "monospace" }]}>₹{transaction.amount}</Text>
                      </View>
                    </View>
                    <View style={styles.inlineFormField}>
                      <View style={[styles.fieldIconContainer, { backgroundColor: "rgba(234, 40, 49, 0.1)", borderColor: "rgba(234, 40, 49, 0.2)" }]}>
                        <Ionicons name="card" size={20} color="#EA2831" />
                      </View>
                      <View style={styles.fieldContent}>
                        <Text style={[styles.inlineFieldLabel, { color: "#EA2831" }]}>Method</Text>
                        <Text style={styles.inlineFieldInput}>{transaction.paymentMethod || "Unknown"}</Text>
                      </View>
                    </View>
                    <View style={styles.inlineFormField}>
                      <View style={[styles.fieldIconContainer, { backgroundColor: "rgba(234, 40, 49, 0.1)", borderColor: "rgba(234, 40, 49, 0.2)" }]}>
                        <Ionicons name="pricetag" size={20} color="#EA2831" />
                      </View>
                      <View style={styles.fieldContent}>
                        <Text style={[styles.inlineFieldLabel, { color: "#EA2831" }]}>Category</Text>
                        <Text style={styles.inlineFieldInput}>{transaction.category}</Text>
                      </View>
                    </View>
                  </View>
                </View>

                <View style={styles.actionButtonsContainer}>
                  <TouchableOpacity
                    style={styles.deleteButton}
                    onPress={() => handleDeleteRejected(transaction.id)}
                  >
                    <Ionicons name="trash-outline" size={18} color="#ef4444" />
                    <Text style={styles.deleteText}>Delete</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={styles.restoreButton}
                    onPress={() => handleRestoreRejected(transaction)}
                  >
                    <Ionicons name="arrow-undo" size={18} color="white" />
                    <Text style={styles.approveText}>Restore</Text>
                  </TouchableOpacity>
                </View>
                  </View>
                  ))
                )}
              </>
            )}
          </>
        )}

        {/* Info Card */}
        <View style={styles.infoCard}>
          <Ionicons name="information-circle" size={18} color="#1d4ed8" />
          <Text style={styles.infoText}>
            {activeTab === 'configure' 
              ? 'Configure email accounts and keywords to automatically parse transaction notifications.'
              : 'Review and approve parsed transactions. Correcting values helps the app learn your patterns.'}
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
            sender: selectedMessage.sender,
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
    backgroundColor: "white",
    borderBottomWidth: 1,
    borderBottomColor: "#f1f5f9",
  },
  backButton: {
    padding: 8,
    marginLeft: -8,
  },
  headerCenter: {
    alignItems: "center",
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#1f2937",
  },
  tabContainer: {
    flexDirection: "row",
    backgroundColor: "white",
    paddingHorizontal: 24,
    paddingTop: 16,
    paddingBottom: 8,
    gap: 12,
  },
  tab: {
    flex: 1,
    paddingVertical: 12,
    alignItems: "center",
    borderRadius: 12,
    backgroundColor: "#f8fafc",
  },
  activeTab: {
    backgroundColor: "#EA2831",
    shadowColor: "#EA2831",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3,
  },
  tabText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#94a3b8",
  },
  activeTabText: {
    color: "white",
  },
  content: {
    flex: 1,
  },
  sectionHeader: {
    paddingVertical: 16,
    paddingTop: 24,
    paddingHorizontal: 24,
  },
  sectionTitle: {
    fontSize: 11,
    fontWeight: "bold",
    color: "#94a3b8",
    letterSpacing: 1,
  },
  card: {
    backgroundColor: "white",
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    marginHorizontal: 24,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  cardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 16,
  },
  cardHeaderLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    flex: 1,
  },
  emailIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: "rgba(234, 40, 49, 0.1)",
    alignItems: "center",
    justifyContent: "center",
  },
  smsIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: "#f1f5f9",
    alignItems: "center",
    justifyContent: "center",
  },
  cardTitle: {
    fontSize: 14,
    fontWeight: "bold",
    color: "#1f2937",
  },
  cardSubtitle: {
    fontSize: 12,
    color: "#94a3b8",
    marginTop: 2,
  },
  comingSoonBadge: {
    backgroundColor: "rgba(234, 40, 49, 0.1)",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  comingSoonText: {
    fontSize: 9,
    fontWeight: "bold",
    color: "#EA2831",
    letterSpacing: 0.5,
  },
  emailItem: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 12,
    borderTopWidth: 1,
    borderTopColor: "#f1f5f9",
  },
  emailLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    flex: 1,
  },
  emailAvatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: "#f8fafc",
    alignItems: "center",
    justifyContent: "center",
  },
  emailAddress: {
    fontSize: 13,
    fontWeight: "600",
    color: "#1f2937",
  },
  emailSync: {
    fontSize: 11,
    color: "#94a3b8",
    marginTop: 2,
  },
  addButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    paddingVertical: 12,
    borderWidth: 1.5,
    borderColor: "rgba(234, 40, 49, 0.2)",
    borderRadius: 12,
    borderStyle: "dashed",
    marginTop: 12,
  },
  addButtonText: {
    fontSize: 13,
    fontWeight: "bold",
    color: "#EA2831",
  },
  keywordsContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  keywordTag: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#f8fafc",
    borderWidth: 1,
    borderColor: "#e2e8f0",
    borderRadius: 8,
    paddingLeft: 10,
    paddingRight: 4,
    paddingVertical: 6,
    gap: 6,
  },
  keywordText: {
    fontSize: 13,
    fontWeight: "500",
    color: "#374151",
  },
  keywordCloseButton: {
    padding: 2,
  },
  dividerLine: {
    height: 1,
    backgroundColor: "#f1f5f9",
    marginVertical: 16,
  },
  addKeywordSection: {
    gap: 8,
  },
  inputLabel: {
    fontSize: 10,
    fontWeight: "bold",
    color: "#94a3b8",
    letterSpacing: 1,
  },
  addKeywordRow: {
    flexDirection: "row",
    gap: 8,
  },
  keywordInput: {
    flex: 1,
    backgroundColor: "#f8fafc",
    borderWidth: 1,
    borderColor: "#e2e8f0",
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 10,
    fontSize: 14,
    color: "#1f2937",
  },
  addKeywordButton: {
    backgroundColor: "#EA2831",
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 12,
    justifyContent: "center",
  },
  addKeywordButtonText: {
    color: "white",
    fontSize: 14,
    fontWeight: "bold",
  },
  senderAvatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: "#10b981",
    alignItems: "center",
    justifyContent: "center",
  },
  senderInitials: {
    fontSize: 14,
    fontWeight: "bold",
    color: "white",
  },
  senderName: {
    fontSize: 14,
    fontWeight: "bold",
    color: "#1f2937",
  },
  senderEmail: {
    fontSize: 12,
    color: "#94a3b8",
    marginTop: 2,
  },
  categoryChip: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    backgroundColor: "#f8fafc",
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#e2e8f0",
  },
  categoryChipActive: {
    backgroundColor: "#10b981",
    borderColor: "#10b981",
  },
  categoryChipText: {
    fontSize: 11,
    fontWeight: "600",
    color: "#1f2937",
  },
  categoryChipTextActive: {
    color: "white",
  },
  categoryChipCancel: {
    backgroundColor: "#f1f5f9",
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
  },
  categoryBadge: {
    backgroundColor: "rgba(16, 185, 129, 0.1)",
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  categoryBadgeText: {
    fontSize: 10,
    fontWeight: "bold",
    color: "#10b981",
  },
  deleteButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: "#fef2f2",
    alignItems: "center",
    justifyContent: "center",
  },
  emptyCard: {
    backgroundColor: "white",
    borderRadius: 16,
    padding: 32,
    alignItems: "center",
    marginBottom: 16,
    marginHorizontal: 24,
  },
  emptyIcon: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: "rgba(16, 185, 129, 0.1)",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 12,
  },
  emptyTitle: {
    fontSize: 14,
    fontWeight: "bold",
    color: "#1f2937",
    marginBottom: 4,
  },
  emptySubtitle: {
    fontSize: 12,
    color: "#94a3b8",
    textAlign: "center",
  },
  messageCard: {
    backgroundColor: "white",
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "#f1f5f9",
    marginBottom: 16,
    marginHorizontal: 24,
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
    marginTop: 16,
    marginHorizontal: 24,
  },
  infoText: {
    flex: 1,
    fontSize: 12,
    color: "#1d4ed8",
    lineHeight: 18,
  },
  rejectedCard: {
    backgroundColor: "rgba(234, 40, 49, 0.05)",
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "rgba(234, 40, 49, 0.2)",
    marginBottom: 16,
    marginHorizontal: 24,
    overflow: "hidden",
  },
  rejectedIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "rgba(234, 40, 49, 0.1)",
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: "rgba(234, 40, 49, 0.2)",
    flexShrink: 0,
  },
  deleteButton: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    paddingVertical: 12,
    backgroundColor: "white",
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "rgba(234, 40, 49, 0.3)",
  },
  deleteText: {
    fontSize: 12,
    fontWeight: "bold",
    color: "#EA2831",
  },
  restoreButton: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    paddingVertical: 12,
    backgroundColor: "#10b981",
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#10b981",
  },
  dateRangeChip: {
    paddingVertical: 8,
    paddingHorizontal: 14,
    borderRadius: 20,
    backgroundColor: 'white',
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  dateRangeChipActive: {
    backgroundColor: '#EA2831',
    borderColor: '#EA2831',
  },
  dateRangeText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#6b7280',
  },
  dateRangeTextActive: {
    color: 'white',
  },
  subTabContainer: {
    flexDirection: "row",
    paddingTop: 16,
    paddingBottom: 8,
    backgroundColor: "#f8f6f6",
  },
  subTab: {
    flex: 1,
    paddingBottom: 12,
    position: "relative",
    alignItems: "center",
  },
  subTabText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#94a3b8",
  },
  activeSubTabText: {
    color: "#EA2831",
  },
  subTabIndicator: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    height: 2,
    backgroundColor: "#EA2831",
    borderRadius: 1,
  },
  showMoreButton: {
    backgroundColor: "#f8fafc",
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#e2e8f0",
  },
  showMoreText: {
    fontSize: 11,
    fontWeight: "600",
    color: "#64748b",
  },
  showMoreMessagesButton: {
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
  showMoreMessagesText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#EA2831",
  },
});
