import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, TextInput, ScrollView, Modal } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { BlurView } from 'expo-blur';
import { NotificationParser } from '../services/NotificationParser';

interface BankKeywordsModalProps {
  visible: boolean;
  onClose: () => void;
}

export default function BankKeywordsModal({ visible, onClose }: BankKeywordsModalProps) {
  const [keywords, setKeywords] = useState<string[]>([]);
  const [newKeyword, setNewKeyword] = useState('');
  const [transactions, setTransactions] = useState<any[]>([]);
  
  useEffect(() => {
    if (visible) {
      loadData();
    }
  }, [visible]);

  const loadData = async () => {
    const savedKeywords = await NotificationParser.getKeywords();
    const savedTransactions = await NotificationParser.getTransactions();
    setKeywords(savedKeywords);
    setTransactions(savedTransactions.slice(0, 3)); // Show only 3 recent
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
    <Modal visible={visible} transparent animationType="slide">
      <BlurView intensity={20} style={styles.overlay}>
        <View style={styles.container}>
          <View style={styles.handle} />
          
          <View style={styles.header}>
            <View>
              <Text style={styles.title}>Bank Keywords</Text>
              <Text style={styles.subtitle}>Add manual rules or review recent parsing.</Text>
            </View>
            <TouchableOpacity onPress={onClose} style={styles.closeButton}>
              <Ionicons name="close" size={24} color="#64748b" />
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>ACTIVE KEYWORDS</Text>
              <View style={styles.keywordsContainer}>
                {keywords.map((keyword, index) => (
                  <View key={index} style={styles.keywordTag}>
                    <Text style={styles.keywordText}>{keyword}</Text>
                    <TouchableOpacity onPress={() => removeKeyword(index)}>
                      <Ionicons name="close" size={16} color="#64748b" />
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

            <View style={styles.dividerSection}>
              <View style={styles.dividerLine} />
              <Text style={styles.dividerText}>RECENT MESSAGES</Text>
              <View style={styles.dividerLine} />
            </View>

            {transactions.map((transaction, index) => (
              <View key={transaction.id} style={styles.messageCard}>
                <View style={styles.messageHeader}>
                  <View style={[
                    styles.messageIcon, 
                    transaction.status === 'parsed' 
                      ? { backgroundColor: '#dcfce7', borderColor: '#bbf7d0' }
                      : { backgroundColor: '#fef3c7', borderColor: '#fde68a' }
                  ]}>
                    <Ionicons 
                      name={transaction.rawMessage.includes('@') ? 'mail' : 'chatbubble'} 
                      size={20} 
                      color={transaction.status === 'parsed' ? '#16a34a' : '#d97706'} 
                    />
                  </View>
                  <View style={styles.messageInfo}>
                    <Text style={[
                      styles.messageStatus, 
                      { color: transaction.status === 'parsed' ? '#16a34a' : '#d97706' }
                    ]}>
                      {transaction.status === 'parsed' ? 'PARSED OK' : 'NEEDS REVIEW'}
                    </Text>
                    <Text style={styles.messageTime}>
                      {new Date(transaction.timestamp).toLocaleTimeString()}
                    </Text>
                    <Text style={styles.senderInfo}>
                      From: {transaction.rawMessage.includes('@') ? 'Email' : 'SMS'}
                    </Text>
                  </View>
                </View>
                
                <View style={styles.messageContent}>
                  <Text style={styles.messageText}>
                    "{transaction.rawMessage}"
                  </Text>
                </View>

                <View style={styles.formRow}>
                  <View style={styles.formField}>
                    <Text style={styles.fieldLabel}>MERCHANT</Text>
                    {transaction.status === 'needs_review' ? (
                      <View style={styles.selectContainer}>
                        <Text style={styles.selectText}>{transaction.merchant}</Text>
                        <Ionicons name="chevron-down" size={16} color="#64748b" />
                      </View>
                    ) : (
                      <View style={styles.readOnlyField}>
                        <Text style={styles.readOnlyText}>{transaction.merchant}</Text>
                      </View>
                    )}
                  </View>
                  <View style={styles.formField}>
                    <Text style={styles.fieldLabel}>AMOUNT</Text>
                    {transaction.status === 'needs_review' ? (
                      <TextInput
                        style={styles.fieldInput}
                        value={transaction.amount}
                        keyboardType="numeric"
                      />
                    ) : (
                      <View style={styles.readOnlyField}>
                        <Text style={styles.readOnlyText}>${transaction.amount}</Text>
                      </View>
                    )}
                  </View>
                </View>

                <View style={styles.categoryField}>
                  <Text style={styles.fieldLabel}>CATEGORY</Text>
                  {transaction.status === 'needs_review' ? (
                    <View style={styles.selectContainer}>
                      <Text style={styles.selectText}>{transaction.category}</Text>
                      <Ionicons name="chevron-down" size={16} color="#64748b" />
                    </View>
                  ) : (
                    <View style={styles.readOnlyField}>
                      <Text style={styles.readOnlyText}>{transaction.category}</Text>
                    </View>
                  )}
                </View>

                {transaction.status === 'needs_review' && (
                  <View style={styles.actionButtons}>
                    <TouchableOpacity style={styles.approveButton}>
                      <Ionicons name="checkmark-circle" size={18} color="#16a34a" />
                      <Text style={styles.approveText}>Approve Sender</Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.rejectButton}>
                      <Ionicons name="close-circle" size={18} color="#dc2626" />
                      <Text style={styles.rejectText}>Reject Sender</Text>
                    </TouchableOpacity>
                  </View>
                )}
              </View>
            ))}}

            <View style={styles.infoCard}>
              <Ionicons name="information-circle" size={18} color="#3b82f6" />
              <Text style={styles.infoText}>
                Correcting these values helps the app learn your transaction patterns. All learning happens on your device.
              </Text>
            </View>
          </ScrollView>

          <View style={styles.footer}>
            <TouchableOpacity style={styles.discardButton}>
              <Text style={styles.discardText}>Discard</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.saveButton}>
              <Text style={styles.saveText}>Save Keywords</Text>
            </TouchableOpacity>
          </View>
        </View>
      </BlurView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.6)',
    justifyContent: 'flex-end',
  },
  container: {
    backgroundColor: 'white',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    height: '90%',
  },
  handle: {
    width: 48,
    height: 6,
    backgroundColor: '#d1d5db',
    borderRadius: 3,
    alignSelf: 'center',
    marginTop: 12,
    marginBottom: 20,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    paddingHorizontal: 24,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f1f5f9',
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#0f172a',
  },
  subtitle: {
    fontSize: 12,
    color: '#64748b',
    marginTop: 4,
  },
  closeButton: {
    padding: 8,
    borderRadius: 20,
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
  sectionTitle: {
    fontSize: 10,
    fontWeight: 'bold',
    color: '#94a3b8',
    letterSpacing: 1,
    padding: 20,
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
  divider: {
    height: 1,
    backgroundColor: '#f1f5f9',
    marginVertical: 16,
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
    backgroundColor: '#f1f5f9',
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
    backgroundColor: '#dbeafe',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#bfdbfe',
  },
  messageInfo: {
    flex: 1,
  },
  messageStatus: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#EA2831',
    letterSpacing: 1,
    marginBottom: 8,
  },
  messageTime: {
    fontSize: 10,
    color: '#94a3b8',
    position: 'absolute',
    right: 0,
    top: 0,
  },
  messageContent: {
    backgroundColor: '#f8fafc',
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#f1f5f9',
    marginBottom: 16,
  },
  messageText: {
    fontSize: 11,
    fontFamily: 'monospace',
    color: '#475569',
    lineHeight: 16,
  },
  formRow: {
    flexDirection: 'row',
    gap: 16,
    marginBottom: 16,
  },
  formField: {
    flex: 1,
  },
  fieldLabel: {
    fontSize: 10,
    fontWeight: 'bold',
    color: '#94a3b8',
    letterSpacing: 1,
    marginBottom: 6,
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
    color: '#0f172a',
  },
  amountInput: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'white',
    borderWidth: 1,
    borderColor: '#e2e8f0',
    borderRadius: 12,
    paddingHorizontal: 12,
  },
  dollarSign: {
    fontSize: 12,
    color: '#94a3b8',
    marginRight: 4,
  },
  amountField: {
    flex: 1,
    paddingVertical: 10,
    fontSize: 14,
    color: '#0f172a',
    fontFamily: 'monospace',
  },
  categoryField: {
    marginBottom: 16,
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
    color: '#0f172a',
  },
  infoCard: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
    backgroundColor: '#dbeafe',
    padding: 16,
    borderRadius: 12,
    marginBottom: 80,
  },
  infoText: {
    flex: 1,
    fontSize: 12,
    color: '#1d4ed8',
    lineHeight: 18,
  },
  footer: {
    flexDirection: 'row',
    gap: 16,
    padding: 24,
    borderTopWidth: 1,
    borderTopColor: '#f1f5f9',
    backgroundColor: 'white',
  },
  discardButton: {
    flex: 1,
    backgroundColor: '#f1f5f9',
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
  },
  discardText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#475569',
  },
  saveButton: {
    flex: 2,
    backgroundColor: '#EA2831',
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
  },
  saveText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: 'white',
  },
  readOnlyField: {
    backgroundColor: '#f8fafc',
    borderWidth: 1,
    borderColor: '#e2e8f0',
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 10,
  },
  readOnlyText: {
    fontSize: 14,
    color: '#64748b',
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
    color: '#0f172a',
  },
  senderInfo: {
    fontSize: 10,
    color: '#94a3b8',
    marginTop: 2,
  },
  actionButtons: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 16,
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
  },
  approveText: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#16a34a',
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
  },
  rejectText: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#dc2626',
  },
});