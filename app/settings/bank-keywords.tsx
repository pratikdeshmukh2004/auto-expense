import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { ScrollView, StyleSheet, Switch, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { NotificationParser } from '../../services/NotificationParser';

export default function BankKeywords() {
  const [keywords, setKeywords] = useState<string[]>([]);
  const [newKeyword, setNewKeyword] = useState('');
  const [smsEnabled, setSmsEnabled] = useState(true);
  const [emailAccounts] = useState([
    { email: 'receipts@gmail.com', lastSync: '14m ago', icon: 'mail' },
    { email: 'finance@work.com', lastSync: '2h ago', icon: 'briefcase' }
  ]);
  const [recentMessages] = useState([
    {
      id: '1',
      type: 'sms',
      sender: '+1-555-0192',
      time: '2h ago',
      message: 'Acct: 1234. Debit: $14.50 at WHOLEFDS MRKT on 24/10. Bal: $200.50',
      merchant: 'Whole Foods',
      amount: '14.50',
      category: 'Groceries'
    },
    {
      id: '2',
      type: 'email',
      sender: 'receipts@netflix.com',
      time: '5h ago',
      message: 'Netflix.com Subscription payment of 15.99 USD processed on card ending 8899.',
      merchant: 'Netflix',
      amount: '15.99',
      category: 'Entertainment'
    }
  ]);

  useEffect(() => {
    loadKeywords();
  }, []);

  const loadKeywords = async () => {
    const savedKeywords = await NotificationParser.getKeywords();
    setKeywords(savedKeywords);
  };

  const addKeyword = async () => {
    if (newKeyword.trim()) {
      const updatedKeywords = [...keywords, newKeyword.trim()];
      setKeywords(updatedKeywords);
      await NotificationParser.saveKeywords(updatedKeywords);
      setNewKeyword('');
    }
  };

  const removeKeyword = async (index: number) => {
    const updatedKeywords = keywords.filter((_, i) => i !== index);
    setKeywords(updatedKeywords);
    await NotificationParser.saveKeywords(updatedKeywords);
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color="#1f2937" />
        </TouchableOpacity>
        <View style={styles.headerCenter}>
          <Text style={styles.headerTitle}>Smart Parsing</Text>
          <Text style={styles.headerSubtitle}>MANAGE & PARSE</Text>
        </View>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Receivers Section */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>RECEIVERS</Text>
          </View>
          
          <View style={styles.sectionContent}>
            {/* SMS Toggle */}
            <View style={styles.toggleRow}>
              <View style={styles.toggleLeft}>
                <View style={[styles.iconContainer, { backgroundColor: '#dbeafe' }]}>
                  <Ionicons name="chatbubble" size={20} color="#3b82f6" />
                </View>
                <View>
                  <Text style={styles.toggleTitle}>SMS Messages</Text>
                  <Text style={styles.toggleSubtitle}>Parse incoming texts</Text>
                </View>
              </View>
              <Switch
                value={smsEnabled}
                onValueChange={setSmsEnabled}
                trackColor={{ false: '#e5e7eb', true: '#EA2831' }}
                thumbColor="white"
              />
            </View>

            <View style={styles.divider} />

            {/* Email Accounts */}
            <View style={styles.emailSection}>
              <View style={styles.emailHeader}>
                <Text style={styles.emailTitle}>EMAIL ACCOUNTS</Text>
                <View style={styles.connectedBadge}>
                  <Text style={styles.connectedText}>2 Connected</Text>
                </View>
              </View>
              
              <View style={styles.emailList}>
                {emailAccounts.map((account, index) => (
                  <View key={index} style={styles.emailItem}>
                    <View style={styles.emailLeft}>
                      <View style={styles.emailIcon}>
                        <Ionicons 
                          name={account.icon as any} 
                          size={18} 
                          color="#64748b" 
                        />
                      </View>
                      <View>
                        <Text style={styles.emailAddress}>{account.email}</Text>
                        <Text style={styles.emailSync}>Synced {account.lastSync}</Text>
                      </View>
                    </View>
                    <View style={styles.emailActions}>
                      <TouchableOpacity style={styles.emailActionButton}>
                        <Ionicons name="sync" size={18} color="#94a3b8" />
                      </TouchableOpacity>
                      <TouchableOpacity style={styles.emailActionButton}>
                        <Ionicons name="remove-circle" size={18} color="#94a3b8" />
                      </TouchableOpacity>
                    </View>
                  </View>
                ))}
              </View>
              
              <TouchableOpacity style={styles.addEmailButton}>
                <Ionicons name="add-circle" size={18} color="#94a3b8" />
                <Text style={styles.addEmailText}>Add Email Account</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>

        {/* Active Keywords Section */}
        <View style={styles.section}>
          <View style={styles.keywordsHeader}>
            <Text style={styles.sectionTitle}>ACTIVE KEYWORDS</Text>
          </View>
          
          <View style={styles.keywordsContainer}>
            {keywords.map((keyword, index) => (
              <View key={index} style={styles.keywordTag}>
                <Text style={styles.keywordText}>{keyword}</Text>
                <TouchableOpacity onPress={() => removeKeyword(index)}>
                  <Ionicons name="close" size={16} color="#94a3b8" />
                </TouchableOpacity>
              </View>
            ))}
          </View>
          
          <View style={styles.divider} />
          
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

        {/* Recent Messages Divider */}
        <View style={styles.dividerSection}>
          <View style={styles.dividerLine} />
          <Text style={styles.dividerText}>RECENT MESSAGES</Text>
          <View style={styles.dividerLine} />
        </View>

        {/* Recent Messages */}
        {recentMessages.map((message) => (
          <View key={message.id} style={styles.messageCard}>
            <View style={styles.messageHeader}>
              <View style={[
                styles.messageIcon,
                message.type === 'sms' 
                  ? { backgroundColor: '#dbeafe', borderColor: '#bfdbfe' }
                  : { backgroundColor: '#f3e8ff', borderColor: '#e9d5ff' }
              ]}>
                <Ionicons 
                  name={message.type === 'sms' ? 'chatbubble' : 'mail'} 
                  size={20} 
                  color={message.type === 'sms' ? '#3b82f6' : '#8b5cf6'} 
                />
              </View>
              <View style={styles.messageInfo}>
                <View style={styles.messageTopRow}>
                  <Text style={styles.senderText}>From: {message.sender}</Text>
                  <Text style={styles.messageTime}>{message.time}</Text>
                </View>
                <View style={styles.messageContent}>
                  <Text style={styles.messageText}>"{message.message}"</Text>
                </View>
              </View>
            </View>

            <View style={styles.formSection}>
              <View style={styles.formRow}>
                <View style={styles.formField}>
                  <Text style={styles.fieldLabel}>MERCHANT</Text>
                  <TextInput
                    style={styles.fieldInput}
                    value={message.merchant}
                    editable={false}
                  />
                </View>
                <View style={styles.formField}>
                  <Text style={styles.fieldLabel}>AMOUNT</Text>
                  <View style={styles.amountInput}>
                    <Text style={styles.dollarSign}>$</Text>
                    <TextInput
                      style={styles.amountField}
                      value={message.amount}
                      editable={false}
                    />
                  </View>
                </View>
              </View>
              
              <View style={styles.categoryRow}>
                <Text style={styles.fieldLabel}>CATEGORY</Text>
                <View style={styles.selectContainer}>
                  <Text style={styles.selectText}>{message.category}</Text>
                  <Ionicons name="chevron-down" size={16} color="#94a3b8" />
                </View>
              </View>
            </View>

            <View style={styles.actionButtons}>
              <TouchableOpacity style={styles.approveButton}>
                <Ionicons name="checkmark-circle" size={18} color="#059669" />
                <Text style={styles.approveText}>Approve Sender</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.rejectButton}>
                <Ionicons name="ban" size={18} color="#dc2626" />
                <Text style={styles.rejectText}>Reject Sender</Text>
              </TouchableOpacity>
            </View>
          </View>
        ))}

        {/* Info Card */}
        <View style={styles.infoCard}>
          <Ionicons name="information-circle" size={18} color="#1d4ed8" />
          <Text style={styles.infoText}>
            Correcting these values helps the app learn your transaction patterns. All learning happens on your device.
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f6f6',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 24,
    paddingVertical: 16,
    backgroundColor: 'rgba(248, 246, 246, 0.9)',
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  backButton: {
    padding: 8,
    marginLeft: -8,
    borderRadius: 20,
  },
  headerCenter: {
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1f2937',
    letterSpacing: -0.5,
  },
  headerSubtitle: {
    fontSize: 10,
    fontWeight: '500',
    color: '#64748b',
    letterSpacing: 1,
    marginTop: 2,
  },
  content: {
    flex: 1,
    paddingHorizontal: 24,
  },
  section: {
    backgroundColor: 'white',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#f1f5f9',
    marginTop: 24,
    overflow: 'hidden',
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    paddingBottom: 12,
    backgroundColor: '#f8fafc',
    borderBottomWidth: 1,
    borderBottomColor: '#f1f5f9',
  },
  sectionTitle: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#94a3b8',
    letterSpacing: 1,
  },
  refreshButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#fef2f2',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 20,
  },
  refreshText: {
    fontSize: 11,
    fontWeight: 'bold',
    color: '#EA2831',
  },
  sectionContent: {
    padding: 20,
  },
  toggleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  toggleLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#bfdbfe',
  },
  toggleTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#1f2937',
  },
  toggleSubtitle: {
    fontSize: 10,
    color: '#64748b',
  },
  divider: {
    height: 1,
    backgroundColor: '#f1f5f9',
    marginVertical: 24,
  },
  emailSection: {
    gap: 16,
  },
  emailHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  emailTitle: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#94a3b8',
    letterSpacing: 1,
  },
  connectedBadge: {
    backgroundColor: '#f1f5f9',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 20,
  },
  connectedText: {
    fontSize: 10,
    fontWeight: 'bold',
    color: '#64748b',
  },
  emailList: {
    gap: 12,
  },
  emailItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 12,
    backgroundColor: '#f8fafc',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#f1f5f9',
  },
  emailLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    flex: 1,
  },
  emailIcon: {
    width: 32,
    height: 32,
    borderRadius: 8,
    backgroundColor: 'white',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#f1f5f9',
  },
  emailAddress: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#374151',
  },
  emailSync: {
    fontSize: 10,
    color: '#94a3b8',
  },
  emailActions: {
    flexDirection: 'row',
    gap: 4,
  },
  emailActionButton: {
    width: 32,
    height: 32,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  addEmailButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 12,
    borderWidth: 1,
    borderColor: '#d1d5db',
    borderStyle: 'dashed',
    borderRadius: 12,
    backgroundColor: 'transparent',
  },
  addEmailText: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#64748b',
  },
  keywordsHeader: {
    paddingHorizontal: 20,
    paddingVertical: 16,
    paddingBottom: 12,
  },
  keywordsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    paddingHorizontal: 20,
  },
  keywordTag: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f8fafc',
    borderWidth: 1,
    borderColor: '#e2e8f0',
    borderRadius: 8,
    paddingLeft: 12,
    paddingRight: 4,
    paddingVertical: 4,
    gap: 4,
  },
  keywordText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#374151',
  },
  addKeywordSection: {
    backgroundColor: '#f8fafc',
    padding: 16,
  },
  inputLabel: {
    fontSize: 10,
    fontWeight: 'bold',
    color: '#94a3b8',
    letterSpacing: 1,
    marginBottom: 8,
    marginLeft: 4,
  },
  addKeywordRow: {
    flexDirection: 'row',
    gap: 8,
  },
  keywordInput: {
    flex: 1,
    backgroundColor: 'white',
    borderWidth: 1,
    borderColor: '#e2e8f0',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 10,
    fontSize: 14,
    color: '#0f172a',
  },
  addButton: {
    backgroundColor: '#1f2937',
    paddingHorizontal: 24,
    paddingVertical: 10,
    borderRadius: 12,
    justifyContent: 'center',
  },
  addButtonText: {
    color: 'white',
    fontSize: 14,
    fontWeight: 'bold',
  },
  dividerSection: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
    marginVertical: 24,
    paddingHorizontal: 8,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: '#e5e7eb',
  },
  dividerText: {
    fontSize: 10,
    fontWeight: 'bold',
    color: '#94a3b8',
    letterSpacing: 1,
  },
  messageCard: {
    backgroundColor: 'white',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#f1f5f9',
    padding: 20,
    marginBottom: 16,
  },
  messageHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
    marginBottom: 16,
  },
  messageIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    flexShrink: 0,
  },
  messageInfo: {
    flex: 1,
  },
  messageTopRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  senderText: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#475569',
    letterSpacing: 0.5,
  },
  messageTime: {
    fontSize: 10,
    color: '#94a3b8',
  },
  messageContent: {
    backgroundColor: '#f8fafc',
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#f1f5f9',
  },
  messageText: {
    fontSize: 11,
    fontFamily: 'monospace',
    color: '#475569',
    lineHeight: 16,
  },
  formSection: {
    gap: 16,
  },
  formRow: {
    flexDirection: 'row',
    gap: 16,
  },
  formField: {
    flex: 1,
    gap: 6,
  },
  fieldLabel: {
    fontSize: 10,
    fontWeight: 'bold',
    color: '#94a3b8',
    letterSpacing: 1,
    marginLeft: 4,
  },
  fieldInput: {
    backgroundColor: 'white',
    borderWidth: 1,
    borderColor: '#e2e8f0',
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 14,
    color: '#1f2937',
  },
  amountInput: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'white',
    borderWidth: 1,
    borderColor: '#e2e8f0',
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 10,
  },
  dollarSign: {
    fontSize: 12,
    color: '#94a3b8',
    marginRight: 4,
  },
  amountField: {
    flex: 1,
    fontSize: 14,
    color: '#1f2937',
    fontFamily: 'monospace',
  },
  categoryRow: {
    gap: 6,
  },
  selectContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: 'white',
    borderWidth: 1,
    borderColor: '#e2e8f0',
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 10,
  },
  selectText: {
    fontSize: 14,
    color: '#1f2937',
  },
  actionButtons: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 20,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: '#f1f5f9',
  },
  approveButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 10,
    backgroundColor: '#f0fdf4',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#bbf7d0',
  },
  approveText: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#059669',
  },
  rejectButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 10,
    backgroundColor: '#fef2f2',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#fecaca',
  },
  rejectText: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#dc2626',
  },
  infoCard: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
    backgroundColor: '#dbeafe',
    padding: 16,
    borderRadius: 12,
    marginBottom: 40,
  },
  infoText: {
    flex: 1,
    fontSize: 12,
    color: '#1d4ed8',
    lineHeight: 18,
  },
});