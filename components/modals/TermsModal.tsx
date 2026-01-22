import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { Modal, ScrollView, Text, TouchableOpacity, View, Dimensions } from 'react-native';

interface TermsModalProps {
  visible: boolean;
  onClose: () => void;
}

export default function TermsModal({ visible, onClose }: TermsModalProps) {
  const screenHeight = Dimensions.get('window').height;

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent
      onRequestClose={onClose}
    >
      <View style={{ flex: 1, backgroundColor: 'rgba(0, 0, 0, 0.6)', justifyContent: 'flex-end' }}>
        <View style={{ 
          backgroundColor: '#f8f6f6', 
          borderTopLeftRadius: 32, 
          borderTopRightRadius: 32, 
          height: screenHeight * 0.85,
        }}>
            {/* Handle */}
            <View style={{ alignItems: 'center', paddingTop: 8, paddingBottom: 4 }}>
              <View style={{
                width: 40,
                height: 6,
                backgroundColor: '#d1d5db',
                borderRadius: 3,
              }} />
            </View>

            {/* Header */}
            <View style={{
              flexDirection: 'row',
              justifyContent: 'space-between',
              alignItems: 'center',
              paddingHorizontal: 24,
              paddingVertical: 16,
            }}>
              <Text style={{ fontSize: 20, fontWeight: 'bold', color: '#1f2937' }}>Terms and Conditions</Text>
              <TouchableOpacity onPress={onClose} style={{
                width: 40,
                height: 40,
                borderRadius: 20,
                alignItems: 'center',
                justifyContent: 'center',
              }}>
                <Ionicons name="close" size={24} color="#1f2937" />
              </TouchableOpacity>
            </View>

            {/* Content */}
            <ScrollView 
              style={{ flex: 1, paddingHorizontal: 24 }} 
              showsVerticalScrollIndicator={false} 
              contentContainerStyle={{ paddingBottom: 20 }}
            >
              <Text style={{ fontSize: 14, lineHeight: 22, color: '#64748B' }}>
                <Text style={{ fontWeight: 'bold', color: '#1f2937', fontSize: 15 }}>1. Acceptance of Terms{"\n"}</Text>
                By accessing and using Auto Expense, you accept and agree to be bound by the terms and provision of this agreement.{"\n\n"}

                <Text style={{ fontWeight: 'bold', color: '#1f2937', fontSize: 15 }}>2. Use License{"\n"}</Text>
                Permission is granted to temporarily use Auto Expense for personal, non-commercial transitory viewing only.{"\n\n"}

                <Text style={{ fontWeight: 'bold', color: '#1f2937', fontSize: 15 }}>3. Privacy and Data{"\n"}</Text>
                • All your financial data is stored locally on your device{"\n"}
                • We use end-to-end encryption for data security{"\n"}
                • No data is shared with third parties without your consent{"\n"}
                • You can delete your account and data at any time{"\n\n"}

                <Text style={{ fontWeight: 'bold', color: '#1f2937', fontSize: 15 }}>4. User Responsibilities{"\n"}</Text>
                • Keep your MPIN secure and confidential{"\n"}
                • Ensure accuracy of transaction data you enter{"\n"}
                • Use the app in compliance with applicable laws{"\n\n"}

                <Text style={{ fontWeight: 'bold', color: '#1f2937', fontSize: 15 }}>5. Disclaimer{"\n"}</Text>
                The app is provided "as is" without warranty of any kind. We are not responsible for any financial decisions made based on the app's data.{"\n\n"}

                <Text style={{ fontWeight: 'bold', color: '#1f2937', fontSize: 15 }}>6. Changes to Terms{"\n"}</Text>
                We reserve the right to modify these terms at any time. Continued use of the app constitutes acceptance of modified terms.{"\n\n"}

                <Text style={{ fontWeight: 'bold', color: '#1f2937', fontSize: 15 }}>7. Contact{"\n"}</Text>
                For questions about these terms, contact us at pratikdeshmukhlobhi@gmail.com
              </Text>
            </ScrollView>

            {/* Action Button */}
            <View style={{ paddingHorizontal: 24, paddingBottom: 24 }}>
              <TouchableOpacity
                onPress={onClose}
                style={{
                  backgroundColor: '#EA2831',
                  paddingVertical: 16,
                  borderRadius: 12,
                  alignItems: 'center',
                  shadowColor: '#EA2831',
                  shadowOffset: { width: 0, height: 4 },
                  shadowOpacity: 0.25,
                  shadowRadius: 8,
                  elevation: 4,
                }}
              >
                <Text style={{ color: 'white', fontSize: 16, fontWeight: 'bold' }}>I Understand</Text>
              </TouchableOpacity>
            </View>
        </View>
      </View>
    </Modal>
  );
}
