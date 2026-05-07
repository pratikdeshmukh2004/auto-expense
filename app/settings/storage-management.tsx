import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import * as SecureStore from 'expo-secure-store';
import React, { useEffect, useState } from 'react';
import { Alert, ScrollView, Share, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import SelectSheetModal from '../../components/modals/SelectSheetModal';
import { StorageKeys } from '../../constants/StorageKeys';

export default function StorageManagementScreen() {
  const [sheetId, setSheetId] = useState<string | null>(null);
  const [showSheetModal, setShowSheetModal] = useState(false);

  useEffect(() => {
    loadStorageInfo();
  }, []);

  const loadStorageInfo = async () => {
    const id = await SecureStore.getItemAsync(StorageKeys.GOOGLE_SHEET_ID);
    setSheetId(id);
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
        <View style={{ height: 1, backgroundColor: '#e5e7eb' }} />
      </View>

      <ScrollView style={styles.content}>
        {/* Current Storage Status */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Current Storage</Text>
          <View style={styles.statusCard}>
            <View style={styles.statusIcon}>
              <Ionicons name="cloud" size={24} color="#EA2831" />
            </View>
            <View style={styles.statusContent}>
              <Text style={styles.statusTitle}>Google Sheets</Text>
              <Text style={styles.statusDescription}>
                {sheetId ? 'Connected to Google Sheets' : 'No sheet connected'}
              </Text>
              {sheetId && (
                <Text style={styles.sheetId}>Sheet ID: {sheetId.substring(0, 20)}...</Text>
              )}
            </View>
          </View>
        </View>

        {/* Actions */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Actions</Text>
          
          <TouchableOpacity
            style={styles.actionCard}
            onPress={() => setShowSheetModal(true)}
          >
            <View style={styles.actionIcon}>
              <Ionicons name="swap-horizontal" size={20} color="#f59e0b" />
            </View>
            <View style={styles.actionContent}>
              <Text style={styles.actionTitle}>Switch Sheet</Text>
              <Text style={styles.actionDescription}>Connect to a different Google Sheet</Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color="#9ca3af" />
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.actionCard}
            onPress={async () => {
              if (sheetId) {
                const link = `https://docs.google.com/spreadsheets/d/${sheetId}`;
                await Share.share({ message: link });
              } else {
                Alert.alert('No Sheet', 'No Google Sheet is connected.');
              }
            }}
          >
            <View style={styles.actionIcon}>
              <Ionicons name="copy" size={20} color="#3b82f6" />
            </View>
            <View style={styles.actionContent}>
              <Text style={styles.actionTitle}>Copy Sheet Link</Text>
              <Text style={styles.actionDescription}>Copy the Google Sheet URL to clipboard</Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color="#9ca3af" />
          </TouchableOpacity>
        </View>
      </ScrollView>

      <SelectSheetModal
        visible={showSheetModal}
        onClose={() => setShowSheetModal(false)}
        onConfirm={async (selectedSheetId) => {
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
