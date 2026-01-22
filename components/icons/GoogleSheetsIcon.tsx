import React from 'react';
import { View, StyleSheet } from 'react-native';

interface GoogleSheetsIconProps {
  size?: number;
}

export default function GoogleSheetsIcon({ size = 48 }: GoogleSheetsIconProps) {
  return (
    <View style={[styles.container, { width: size, height: size, borderRadius: size * 0.25 }]}>
      <View style={styles.rowsContainer}>
        <View style={[styles.row, { width: size * 0.5, height: size * 0.12, borderRadius: size * 0.02 }]}>
          <View style={[styles.checkbox, { width: size * 0.08, height: size * 0.08, borderRadius: size * 0.015 }]} />
        </View>
        <View style={[styles.row, { width: size * 0.5, height: size * 0.12, borderRadius: size * 0.02 }]}>
          <View style={[styles.checkbox, { width: size * 0.08, height: size * 0.08, borderRadius: size * 0.015 }]} />
        </View>
        <View style={[styles.row, { width: size * 0.5, height: size * 0.12, borderRadius: size * 0.02 }]}>
          <View style={[styles.checkbox, { width: size * 0.08, height: size * 0.08, borderRadius: size * 0.015 }]} />
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#D4F1E3',
    alignItems: 'center',
    justifyContent: 'center',
  },
  rowsContainer: {
    gap: 2,
  },
  row: {
    backgroundColor: '#34A853',
    flexDirection: 'row',
    alignItems: 'center',
    paddingLeft: 4,
  },
  checkbox: {
    backgroundColor: '#FFFFFF',
  },
});
