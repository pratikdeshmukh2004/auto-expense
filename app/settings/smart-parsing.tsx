import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { NotificationParser } from '../../services/NotificationParser';

export default function SmartParsing() {
  const [keywords, setKeywords] = useState<string[]>([]);
  const [newKeyword, setNewKeyword] = useState('');
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
            {/* SMS Coming Soon */}
            <View>
              <View style={styles.comingSoonGradient}>
                <View style={styles.comingSoonContent}>
                  <View style={styles.smsIconContainer}>
                    <Ionicons name="chatbubble" size={20} color="#EA2831" />
                  </View>
                  <View style={styles.smsTextContainer}>
                    <View style={styles.smsHeaderRow}>
                      <Text style={styles.smsTitle}>SMS Messages</Text>
                      <View style={styles.comingSoonBadge}>
                        <Text style={styles.comingSoonText}>Coming Soon</Text>
                      </View>
                    </View>
                    <Text style={styles.smsSubtitle}>Automated parsing for text notifications</Text>
                  </View>
                </View>
                <View style={styles.lockIcon}>
                  <Ionicons name="time" size={20} color="#EA2831" style={{ opacity: 0.5 }} />
                </View>
              </View>
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
                          color="#EA2831" 
                        />
                      </View>
                      <View>
                        <Text style={styles.emailAddress}>{account.email}</Text>
                        <Text style={styles.emailSync}>Synced {account.lastSync}</Text>
                      </View>
                    </View>
                    <View style={styles.emailActions}>
                      <TouchableOpacity style={styles.emailActionButton}>
                        <Ionicons name="refresh" size={18} color="#EA2831" />
                      </TouchableOpacity>
                      <TouchableOpacity style={styles.emailActionButton}>
                        <Ionicons name="close-circle" size={18} color="#EA2831" />
                      </TouchableOpacity>
                    </View>
                  </View>
                ))}
              </View>
              
              <TouchableOpacity style={styles.addEmailButton}>
                <Ionicons name="add-circle" size={18} color="#EA2831" />
                <Text style={styles.addEmailText}>Add Email Account</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>

        {/* Active Keywords Section */}
        <View style={styles.section}>
          <View style={styles.keywordsContent}>
            <Text style={styles.sectionTitle}>ACTIVE KEYWORDS</Text>
            
            <View style={styles.keywordsContainer}>
              {keywords.map((keyword, index) => (
                <View key={index} style={styles.keywordTag}>
                  <Text style={styles.keywordText}>{keyword}</Text>
                  <TouchableOpacity onPress={() => removeKeyword(index)} style={styles.keywordCloseButton}>
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

        {/* Recent Messages Divider */}
        <View style={styles.dividerSection}>
          <View style={styles.dividerLine} />
          <Text style={styles.dividerText}>RECENT MESSAGES</Text>
          <View style={styles.dividerLine} />
        </View>

        {/* Recent Messages */}
        {recentMessages.map((message, index) => (
          <View key={message.id} style={styles.messageCard}>
            <View style={styles.messageContent}>
              <View style={styles.messageHeader}>
                <View style={styles.messageIcon}>
                  <Ionicons name="mail" size={20} color="#EA2831" />
                </View>
                <View style={styles.messageInfo}>
                  <View style={styles.messageTopRow}>
                    <Text style={styles.senderLabel}>
                      {index === 0 ? 'receipts@wholefoods.com' : 'receipts@netflix.com'}
                    </Text>
                    <Text style={styles.messageTime}>{message.time}</Text>
                  </View>
                  <View style={styles.rawMessageContainer}>
                    <Text style={styles.rawMessageText}>
                      "{index === 0 
                        ? 'Receipt for your visit at Whole Foods Market. You paid $14.50 using Visa ending 1234.'
                        : 'Netflix.com Subscription payment of 15.99 USD processed on card ending 8899.'
                      }"
                    </Text>
                  </View>
                </View>
              </View>

              <View style={styles.inlineFormSection}>
                <View style={styles.inlineFormField}>
                  <View style={[styles.fieldIconContainer, { backgroundColor: '#f8f6f6', borderColor: '#e5e7eb' }]}>
                    <Ionicons name="storefront" size={20} color="#64748b" />
                  </View>
                  <View style={styles.fieldContent}>
                    <Text style={[styles.inlineFieldLabel, { color: '#64748b' }]}>Merchant</Text>
                    <TextInput
                      style={styles.inlineFieldInput}
                      value={index === 0 ? 'Whole Foods Market' : 'Netflix.com'}
                      editable={true}
                    />
                  </View>
                  <Ionicons name="create-outline" size={16} color="#cbd5e1" />
                </View>

                <View style={styles.inlineFormField}>
                  <View style={[styles.fieldIconContainer, { backgroundColor: '#f8f6f6', borderColor: '#e5e7eb' }]}>
                    <Ionicons name="cash" size={20} color="#64748b" />
                  </View>
                  <View style={styles.fieldContent}>
                    <Text style={[styles.inlineFieldLabel, { color: '#64748b' }]}>Amount</Text>
                    <TextInput
                      style={[styles.inlineFieldInput, { fontFamily: 'monospace' }]}
                      value={index === 0 ? '14.50' : '15.99'}
                      editable={true}
                    />
                  </View>
                  <Ionicons name="create-outline" size={16} color="#cbd5e1" />
                </View>

                <View style={styles.inlineFormField}>
                  <View style={[styles.fieldIconContainer, { backgroundColor: '#f8f6f6', borderColor: '#e5e7eb' }]}>
                    <Ionicons name="card" size={20} color="#64748b" />
                  </View>
                  <View style={styles.fieldContent}>
                    <Text style={[styles.inlineFieldLabel, { color: '#64748b' }]}>Method</Text>
                    <TextInput
                      style={styles.inlineFieldInput}
                      value={index === 0 ? 'Visa ending 1234' : 'card ending 8899'}
                      editable={true}
                    />
                  </View>
                  <Ionicons name="create-outline" size={16} color="#cbd5e1" />
                </View>
              </View>
            </View>

            <View style={styles.actionButtonsContainer}>
              <TouchableOpacity style={styles.rejectButton}>
                <Ionicons name="ban" size={18} color="#EA2831" />
                <Text style={styles.rejectText}>Reject</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.approveButton}>
                <Ionicons name="checkmark-circle" size={18} color="white" />
                <Text style={styles.approveText}>Approve</Text>
              </TouchableOpacity>
            </View>
          </View>
        ))}

        {/* Info Card */}
        <View style={styles.infoCard}>
          <Ionicons name="information-circle" size={18} color="#1d4ed8" />
          <Text style={styles.infoText}>
            Correcting these values helps the app learn your transaction patterns. Tap text in the snippet to quick-select.
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
  sectionContent: {
    padding: 20,
  },
  comingSoonGradient: {
    backgroundColor: 'rgba(234, 40, 49, 0.1)',
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: 'rgba(234, 40, 49, 0.3)',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  comingSoonContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    flex: 1,
  },
  smsIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: 'rgba(234, 40, 49, 0.2)',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'rgba(234, 40, 49, 0.3)',
  },
  smsTextContainer: {
    flex: 1,
  },
  smsHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  smsTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#7f1d1d',
  },
  comingSoonBadge: {
    backgroundColor: 'rgba(255, 255, 255, 0.8)',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'rgba(234, 40, 49, 0.3)',
  },
  comingSoonText: {
    fontSize: 9,
    fontWeight: 'bold',
    color: '#EA2831',
  },
  smsSubtitle: {
    fontSize: 10,
    color: 'rgba(127, 29, 29, 0.7)',
    marginTop: 2,
  },
  lockIcon: {
    opacity: 0.5,
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
    borderColor: 'rgba(234, 40, 49, 0.3)',
    borderRadius: 12,
    backgroundColor: 'rgba(234, 40, 49, 0.05)',
  },
  addEmailText: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#EA2831',
  },
  keywordsContent: {
    paddingHorizontal: 20,
    paddingVertical: 16,
    paddingBottom: 12,
  },
  keywordsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginTop: 12,
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
  keywordCloseButton: {
    padding: 4,
    borderRadius: 6,
  },
  keywordsDivider: {
    height: 1,
    backgroundColor: '#f1f5f9',
    width: '100%',
    marginVertical: 0,
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
    backgroundColor: '#EA2831',
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
    marginBottom: 16,
    overflow: 'hidden',
  },
  messageContent: {
    padding: 20,
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
    backgroundColor: '#fef2f2',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#fecaca',
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
  senderLabel: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#475569',
    letterSpacing: 0.5,
  },
  messageTime: {
    fontSize: 10,
    color: '#94a3b8',
  },
  rawMessageContainer: {
    backgroundColor: '#f8fafc',
    padding: 12,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#f1f5f9',
    marginTop: 8,
  },
  rawMessageText: {
    fontSize: 11,
    fontFamily: 'monospace',
    color: '#475569',
    lineHeight: 20,
  },
  inlineFormSection: {
    gap: 12,
    marginTop: 16,
  },
  inlineFormField: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    padding: 4,
    paddingRight: 12,
    backgroundColor: 'white',
    borderWidth: 1,
    borderColor: '#f1f5f9',
    borderRadius: 12,
  },
  fieldIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
  },
  fieldContent: {
    flex: 1,
  },
  inlineFieldLabel: {
    fontSize: 9,
    fontWeight: 'bold',
    letterSpacing: 1,
    marginBottom: 2,
  },
  inlineFieldInput: {
    fontSize: 14,
    fontWeight: '600',
    color: '#374151',
    padding: 0,
  },
  actionButtonsContainer: {
    flexDirection: 'row',
    gap: 12,
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: 'rgba(248, 250, 252, 0.5)',
    borderTopWidth: 1,
    borderTopColor: '#f1f5f9',
  },
  approveButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 12,
    backgroundColor: '#EA2831',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#EA2831',
  },
  approveText: {
    fontSize: 12,
    fontWeight: 'bold',
    color: 'white',
  },
  rejectButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 12,
    backgroundColor: 'white',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  rejectText: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#EA2831',
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