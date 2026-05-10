import { Redirect } from 'expo-router';
import * as SecureStore from 'expo-secure-store';
import React, { useEffect, useState } from 'react';
import { View, ActivityIndicator } from 'react-native';

const API_URL_KEY = 'app_api_url';

export default function Index() {
  const [ready, setReady] = useState(false);
  const [hasApiUrl, setHasApiUrl] = useState(false);

  useEffect(() => {
    SecureStore.getItemAsync(API_URL_KEY).then(url => {
      setHasApiUrl(!!url);
      setReady(true);
    }).catch(() => setReady(true));
  }, []);

  if (!ready) {
    return (
      <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
        <ActivityIndicator size="large" color="#EA2831" />
      </View>
    );
  }

  if (!hasApiUrl) {
    return <Redirect href="/onboarding" />;
  }

  return <Redirect href="/dashboard" />;
}
