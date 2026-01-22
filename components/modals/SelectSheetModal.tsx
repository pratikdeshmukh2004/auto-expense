import { Ionicons } from '@expo/vector-icons';
import { GoogleSignin } from '@react-native-google-signin/google-signin';
import React, { useEffect, useState } from 'react';
import { ActivityIndicator, FlatList, Modal, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import * as SecureStore from 'expo-secure-store';
import { StorageKeys } from '@/constants/StorageKeys';
import GoogleSheetsIcon from '../icons/GoogleSheetsIcon';

interface Sheet {
  id: string;
  name: string;
  modifiedDate: string;
}

interface SelectSheetModalProps {
  visible: boolean;
  onClose: () => void;
  onConfirm: (sheetId: string, sheetName: string) => void;
}

export default function SelectSheetModal({ visible, onClose, onConfirm }: SelectSheetModalProps) {
  const [selectedSheet, setSelectedSheet] = useState<string>('');
  const [searchQuery, setSearchQuery] = useState('');
  const [sheets, setSheets] = useState<Sheet[]>([]);
  const [loading, setLoading] = useState(false);
  const [validating, setValidating] = useState(false);

  useEffect(() => {
    if (visible) {
      fetchSheets();
    }
  }, [visible]);

  const fetchSheets = async () => {
    setLoading(true);
    try {
      const userInfo = await GoogleSignin.getCurrentUser();
      if (!userInfo) {
        return;
      }

      const tokens = await GoogleSignin.getTokens();
      
      if (!tokens.accessToken) {
        return;
      }

      const response = await fetch(
        'https://www.googleapis.com/drive/v3/files?q=mimeType="application/vnd.google-apps.spreadsheet"&orderBy=modifiedTime desc&pageSize=20&fields=files(id,name,modifiedTime)',
        {
          headers: {
            Authorization: `Bearer ${tokens.accessToken}`,
          },
        }
      );

      const data = await response.json();
      
      if (data.files && data.files.length > 0) {
        const formattedSheets = data.files.map((file: any) => ({
          id: file.id,
          name: file.name,
          modifiedDate: formatDate(file.modifiedTime),
        }));
        setSheets(formattedSheets);
        if (formattedSheets.length > 0) {
          setSelectedSheet(formattedSheets[0].id);
        }
      }
    } catch (error) {
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffTime = Math.abs(now.getTime() - date.getTime());
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays === 0) return 'Modified today';
    if (diffDays === 1) return 'Modified yesterday';
    if (diffDays < 7) return `Modified ${diffDays} days ago`;
    return `Modified ${date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}`;
  };

  const filteredSheets = sheets.filter(sheet =>
    sheet.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const validateSheetFormat = async (sheetId: string): Promise<boolean> => {
    try {
      const tokens = await GoogleSignin.getTokens();
      const SHEETS_API_BASE = "https://sheets.googleapis.com/v4/spreadsheets";
      
      // Get sheet metadata to check if Configuration and Transactions sheets exist
      const metadataResponse = await fetch(
        `${SHEETS_API_BASE}/${sheetId}?fields=sheets.properties`,
        {
          headers: {
            Authorization: `Bearer ${tokens.accessToken}`,
          },
        }
      );
      
      const metadata = await metadataResponse.json();
      const sheetNames = metadata.sheets?.map((sheet: any) => sheet.properties.title) || [];
      
      // Check if required sheets exist
      if (!sheetNames.includes('Configuration') || !sheetNames.includes('Transactions')) {
        return false;
      }
      
      // Validate Transactions sheet headers (this is the main validation)
      const transactionsResponse = await fetch(
        `${SHEETS_API_BASE}/${sheetId}/values/Transactions!A1:I1`,
        {
          headers: {
            Authorization: `Bearer ${tokens.accessToken}`,
          },
        }
      );
      
      const transactionsData = await transactionsResponse.json();
      const transactionHeaders = transactionsData.values?.[0] || [];
      
      const expectedHeaders = [
        'Date', 'Merchant', 'Amount', 'Category', 'Payment Method', 
        'Type', 'Status', 'Notes', 'Created At'
      ];
      
      // Check if all expected headers are present
      const hasValidHeaders = expectedHeaders.every((header, index) => 
        transactionHeaders[index] === header
      );
      
      if (!hasValidHeaders) {
        return false;
      }
      
      // Validate Configuration sheet has data tables (check for Categories table)
      const configResponse = await fetch(
        `${SHEETS_API_BASE}/${sheetId}/values/Configuration!A1:E1`,
        {
          headers: {
            Authorization: `Bearer ${tokens.accessToken}`,
          },
        }
      );
      
      const configData = await configResponse.json();
      const configHeaders = configData.values?.[0] || [];
      
      // Check if Configuration has Categories table structure
      const expectedConfigHeaders = ['ID', 'Name', 'Icon', 'Color', 'Description'];
      const hasValidConfig = expectedConfigHeaders.every((header, index) => 
        configHeaders[index] === header
      );
      
      return hasValidConfig;
    } catch (error) {
      return false;
    }
  };

  const handleConfirm = async () => {
    if (selectedSheet) {
      setValidating(true);
      const sheet = sheets.find(s => s.id === selectedSheet);
      
      if (sheet) {
        const isValid = await validateSheetFormat(selectedSheet);
        
        if (isValid) {
          // Store sheet ID in SecureStore
          await SecureStore.setItemAsync(StorageKeys.GOOGLE_SHEET_ID, selectedSheet);
          
          onConfirm(selectedSheet, sheet.name);
          onClose();
        } else {
          // Show error message
          const { Alert } = require('react-native');
          Alert.alert(
            'Invalid Sheet Format',
            'This sheet is not matching with our requirements. Please select a sheet created by Auto Expense or create a new one.',
            [{ text: 'OK' }]
          );
        }
      }
      setValidating(false);
    }
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent={true}
      onRequestClose={onClose}
      presentationStyle="pageSheet"
    >
      <TouchableOpacity 
        style={styles.overlay}
        activeOpacity={1}
        onPress={onClose}
      >
        <TouchableOpacity 
          style={styles.bottomSheet}
          activeOpacity={1}
          onPress={(e) => e.stopPropagation()}
        >
          <View style={styles.handleContainer}>
            <View style={styles.handle} />
          </View>

          <View style={styles.header}>
            <Text style={styles.title}>Select Recent Sheet</Text>
            <View style={styles.headerButtons}>
              <TouchableOpacity
                style={styles.refreshButton}
                onPress={fetchSheets}
                disabled={loading}
              >
                <Ionicons name="refresh" size={20} color="#EA2831" />
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.cancelButton}
                onPress={onClose}
              >
                <Ionicons name="close" size={20} color="#64748B" />
              </TouchableOpacity>
            </View>
          </View>

          <View style={styles.searchContainer}>
            <View style={styles.searchBar}>
              <Ionicons name="search" size={20} color="#9CA3AF" style={styles.searchIcon} />
              <TextInput
                style={styles.searchInput}
                placeholder="Search for a spreadsheet..."
                placeholderTextColor="#9CA3AF"
                value={searchQuery}
                onChangeText={setSearchQuery}
              />
            </View>
          </View>

          {loading ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="large" color="#EA2831" />
              <Text style={styles.loadingText}>Loading spreadsheets...</Text>
            </View>
          ) : (
            <FlatList
              data={filteredSheets}
              keyExtractor={(item) => item.id}
              contentContainerStyle={styles.listContent}
              ListEmptyComponent={
                <View style={styles.emptyContainer}>
                  <Ionicons name="document-text-outline" size={48} color="#D1D5DB" />
                  <Text style={styles.emptyText}>No spreadsheets found</Text>
                </View>
              }
              renderItem={({ item }) => (
                <TouchableOpacity
                  style={[
                    styles.listItem,
                    selectedSheet === item.id && styles.listItemSelected
                  ]}
                  onPress={() => setSelectedSheet(item.id)}
                  activeOpacity={0.7}
                >
                  <View style={styles.iconContainer}>
                    <GoogleSheetsIcon size={48} />
                  </View>
                  <View style={styles.textContainer}>
                    <Text style={styles.sheetName} numberOfLines={1}>{item.name}</Text>
                    <Text style={styles.modifiedDate}>{item.modifiedDate}</Text>
                  </View>
                  <View style={[
                    styles.radioOuter,
                    selectedSheet === item.id && styles.radioOuterSelected
                  ]}>
                    {selectedSheet === item.id && <View style={styles.radioInner} />}
                  </View>
                </TouchableOpacity>
              )}
            />
          )}

          <View style={styles.footer}>
            <TouchableOpacity
              style={[
                styles.confirmButton,
                (validating || !selectedSheet) && styles.confirmButtonDisabled
              ]}
              onPress={handleConfirm}
              activeOpacity={0.8}
              disabled={validating || !selectedSheet}
            >
              {validating ? (
                <ActivityIndicator size="small" color="white" />
              ) : (
                <Ionicons name="checkmark-circle" size={20} color="white" />
              )}
              <Text style={styles.confirmButtonText}>
                {validating ? 'Validating...' : 'Confirm Selection'}
              </Text>
            </TouchableOpacity>
          </View>
        </TouchableOpacity>
      </TouchableOpacity>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.4)',
    justifyContent: 'flex-end',
  },
  bottomSheet: {
    backgroundColor: 'white',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    maxHeight: '90%',
    flexDirection: 'column',
  },
  handleContainer: {
    alignItems: 'center',
    paddingTop: 12,
    paddingBottom: 8,
  },
  handle: {
    width: 48,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#D1D5DB',
  },
  header: {
    paddingHorizontal: 24,
    paddingTop: 16,
    paddingBottom: 8,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  headerButtons: {
    flexDirection: 'row',
    gap: 8,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1B0E0E',
  },
  refreshButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#FEF2F2',
    alignItems: 'center',
    justifyContent: 'center',
  },
  cancelButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#F3F4F6',
    alignItems: 'center',
    justifyContent: 'center',
  },
  searchContainer: {
    paddingHorizontal: 24,
    paddingVertical: 12,
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F3F4F6',
    borderRadius: 12,
    height: 48,
  },
  searchIcon: {
    paddingLeft: 16,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    color: '#1B0E0E',
    paddingHorizontal: 12,
  },
  listContent: {
    paddingHorizontal: 24,
    paddingVertical: 8,
    paddingBottom: 32,
  },
  listItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
    backgroundColor: '#F9FAFB',
    padding: 16,
    borderRadius: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: 'transparent',
  },
  listItemSelected: {
    borderColor: 'rgba(234, 40, 49, 0.4)',
    backgroundColor: 'rgba(234, 40, 49, 0.04)',
  },
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: 12,
    overflow: 'hidden',
  },
  textContainer: {
    flex: 1,
  },
  sheetName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1B0E0E',
    marginBottom: 2,
  },
  modifiedDate: {
    fontSize: 12,
    color: '#9CA3AF',
  },
  radioOuter: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#D1D5DB',
    alignItems: 'center',
    justifyContent: 'center',
  },
  radioOuterSelected: {
    borderColor: '#EA2831',
  },
  radioInner: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: '#EA2831',
  },
  footer: {
    paddingHorizontal: 24,
    paddingTop: 24,
    paddingBottom: 40,
    backgroundColor: 'white',
    borderTopWidth: 1,
    borderTopColor: '#F3F4F6',
  },
  confirmButton: {
    width: '100%',
    backgroundColor: '#EA2831',
    height: 56,
    borderRadius: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    shadowColor: '#EA2831',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 12,
    elevation: 4,
  },
  confirmButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
  confirmButtonDisabled: {
    backgroundColor: '#9CA3AF',
    shadowOpacity: 0,
    elevation: 0,
  },
  loadingContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
  },
  loadingText: {
    marginTop: 16,
    fontSize: 14,
    color: '#9CA3AF',
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
  },
  emptyText: {
    marginTop: 16,
    fontSize: 14,
    color: '#9CA3AF',
  },
});
