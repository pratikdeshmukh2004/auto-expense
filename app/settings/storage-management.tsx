import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import * as SecureStore from 'expo-secure-store';
import React, { useEffect, useState } from 'react';
import { Alert, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import SelectSheetModal from '../../components/modals/SelectSheetModal';
import { StorageKeys } from '../../constants/StorageKeys';

export default function StorageManagementScreen() {
  const [storageType, setStorageType] = useState<'offline' | 'auto' | 'existing'>('offline');
  const [sheetId, setSheetId] = useState<string | null>(null);
  const [showSheetModal, setShowSheetModal] = useState(false);

  useEffect(() => {
    loadStorageInfo();
  }, []);

  const loadStorageInfo = async () => {
    const type = await SecureStore.getItemAsync(StorageKeys.STORAGE_TYPE);
    const id = await SecureStore.getItemAsync(StorageKeys.GOOGLE_SHEET_ID);
    setStorageType((type as any) || 'offline');
    setSheetId(id);
  };

  const handleStorageChange = (newType: 'offline' | 'auto' | 'existing') => {
    if (newType === 'existing') {
      setShowSheetModal(true);
    } else {
      Alert.alert(
        'Change Storage Type',
        `Switch to ${newType === 'offline' ? 'offline' : 'Google Sheets'} storage?`,
        [
          { text: 'Cancel' },
          { 
            text: 'Confirm', 
            onPress: async () => {
              await SecureStore.setItemAsync(StorageKeys.STORAGE_TYPE, newType);
              if (newType === 'offline') {
                await SecureStore.deleteItemAsync(StorageKeys.GOOGLE_SHEET_ID);
              }
              setStorageType(newType);
              setSheetId(null);
            }
          }
        ]
      );
    }
  };

  const getStorageStatusText = () => {
    switch (storageType) {
      case 'offline':
        return 'Data stored locally on device';
      case 'auto':
        return sheetId ? `Connected to Google Sheets` : 'Auto-created sheet';
      case 'existing':
        return sheetId ? `Connected to existing sheet` : 'No sheet selected';
      default:
        return 'Unknown storage type';
    }
  };

  const getStorageIcon = () => {
    switch (storageType) {
      case 'offline':
        return 'phone-portrait';
      case 'auto':
      case 'existing':
        return 'cloud';
      default:
        return 'help';
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View>
        <View style={{
          flexDirection: 'row',
          alignItems: 'center',
          paddingHorizontal: 16,
          paddingVertical: 16,
          backgroundColor: 'rgba(248, 246, 246, 0.9)',
        }}>
          <TouchableOpacity onPress={() => router.back()} style={{
            width: 40,
            height: 40,
            borderRadius: 20,
            alignItems: 'center',
            justifyContent: 'center',
          }}>
            <Ionicons name="arrow-back" size={24} color="#1f2937" />
          </TouchableOpacity>
          <Text style={{
            flex: 1,
            textAlign: 'center',
            fontSize: 18,
            fontWeight: 'bold',
            color: '#1f2937',
            paddingRight: 40,
          }}>Storage Management</Text>
        </View>
        <View style={{
          height: 1,
          backgroundColor: '#e5e7eb',
        }} />
      </View>

      <ScrollView style={styles.content}>
        {/* Current Storage Status */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Current Storage</Text>
          <View style={styles.statusCard}>
            <View style={styles.statusIcon}>
              <Ionicons name={getStorageIcon()} size={24} color="#EA2831" />
            </View>
            <View style={styles.statusContent}>
              <Text style={styles.statusTitle}>
                {storageType === 'offline' ? 'Offline Storage' : 'Google Sheets'}
              </Text>
              <Text style={styles.statusDescription}>{getStorageStatusText()}</Text>
              {sheetId && (
                <Text style={styles.sheetId}>Sheet ID: {sheetId.substring(0, 20)}...</Text>
              )}
            </View>
          </View>
        </View>

        {/* Storage Options */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Storage Options</Text>
          
          <TouchableOpacity
            style={[styles.optionCard, storageType === 'offline' && styles.optionSelected, styles.optionDisabled]}
            disabled={true}
          >
            <View style={styles.optionIcon}>
              <Ionicons name="phone-portrait" size={20} color={storageType === 'offline' ? '#EA2831' : '#64748B'} />
            </View>
            <View style={styles.optionContent}>
              <Text style={styles.optionTitle}>Offline Storage</Text>
              <Text style={styles.optionDescription}>Store data locally on this device</Text>
            </View>
            {storageType === 'offline' && (
              <Ionicons name="checkmark-circle" size={20} color="#EA2831" />
            )}
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.optionCard, storageType === 'auto' && styles.optionSelected, styles.optionDisabled]}
            disabled={true}
          >
            <View style={styles.optionIcon}>
              <Ionicons name="add-circle" size={20} color={storageType === 'auto' ? '#EA2831' : '#64748B'} />
            </View>
            <View style={styles.optionContent}>
              <Text style={styles.optionTitle}>Auto-Create Sheet</Text>
              <Text style={styles.optionDescription}>Create new Google Sheet automatically</Text>
            </View>
            {storageType === 'auto' && (
              <Ionicons name="checkmark-circle" size={20} color="#EA2831" />
            )}
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.optionCard, storageType === 'existing' && styles.optionSelected, styles.optionDisabled]}
            disabled={true}
          >
            <View style={styles.optionIcon}>
              <Ionicons name="folder-open" size={20} color={storageType === 'existing' ? '#EA2831' : '#64748B'} />
            </View>
            <View style={styles.optionContent}>
              <Text style={styles.optionTitle}>Select Existing Sheet</Text>
              <Text style={styles.optionDescription}>Choose from your Google Sheets</Text>
            </View>
            {storageType === 'existing' && (
              <Ionicons name="checkmark-circle" size={20} color="#EA2831" />
            )}
          </TouchableOpacity>
        </View>

        {/* Storage Actions */}
        {(storageType === 'auto' || storageType === 'existing') && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Actions</Text>
            
            <TouchableOpacity style={styles.actionCard}>
              <View style={styles.actionIcon}>
                <Ionicons name="open" size={20} color="#3b82f6" />
              </View>
              <View style={styles.actionContent}>
                <Text style={styles.actionTitle}>Open in Google Sheets</Text>
                <Text style={styles.actionDescription}>View your data in browser</Text>
              </View>
            </TouchableOpacity>
          </View>
        )}
      </ScrollView>

      <SelectSheetModal
        visible={showSheetModal}
        onClose={() => setShowSheetModal(false)}
        onConfirm={async (selectedSheetId, sheetName) => {
          await SecureStore.setItemAsync(StorageKeys.STORAGE_TYPE, 'existing');
          setStorageType('existing');
          setSheetId(selectedSheetId);
        }}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f6f6',
  },
  content: {
    flex: 1,
    padding: 24,
  },
  section: {
    marginBottom: 32,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1f2937',
    marginBottom: 16,
  },
  statusCard: {
    backgroundColor: 'white',
    borderRadius: 16,
    padding: 20,
    flexDirection: 'row',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  statusIcon: {
    width: 48,
    height: 48,
    borderRadius: 12,
    backgroundColor: '#fef2f2',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
  },
  statusContent: {
    flex: 1,
  },
  statusTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1f2937',
    marginBottom: 4,
  },
  statusDescription: {
    fontSize: 14,
    color: '#6b7280',
    marginBottom: 4,
  },
  sheetId: {
    fontSize: 12,
    color: '#9ca3af',
    fontFamily: 'monospace',
  },
  optionCard: {
    backgroundColor: 'white',
    borderRadius: 16,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#f3f4f6',
  },
  optionSelected: {
    borderColor: '#EA2831',
    backgroundColor: '#fef2f2',
  },
  optionIcon: {
    width: 40,
    height: 40,
    borderRadius: 10,
    backgroundColor: '#f8fafc',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  optionContent: {
    flex: 1,
  },
  optionTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1f2937',
    marginBottom: 2,
  },
  optionDescription: {
    fontSize: 12,
    color: '#6b7280',
  },
  optionDisabled: {
    opacity: 0.6,
  },
  actionCard: {
    backgroundColor: 'white',
    borderRadius: 16,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  actionIcon: {
    width: 40,
    height: 40,
    borderRadius: 10,
    backgroundColor: '#f8fafc',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  actionContent: {
    flex: 1,
  },
  actionTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1f2937',
    marginBottom: 2,
  },
  actionDescription: {
    fontSize: 12,
    color: '#6b7280',
  },
});