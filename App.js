import React, { useRef, useState } from 'react';
import { SafeAreaView, StatusBar, BackHandler, Platform, StyleSheet, View, ActivityIndicator } from 'react-native';
import { WebView } from 'react-native-webview';

const SITE_URL = 'https://ikasso.ml';

export default function App() {
  const webViewRef = useRef(null);
  const [loading, setLoading] = useState(true);

  // Android back button handler
  React.useEffect(() => {
    if (Platform.OS === 'android') {
      const handler = BackHandler.addEventListener('hardwareBackPress', () => {
        if (webViewRef.current) {
          webViewRef.current.goBack();
          return true;
        }
        return false;
      });
      return () => handler.remove();
    }
  }, []);

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#E85D04" />
      {loading && (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#E85D04" />
        </View>
      )}
      <WebView
        ref={webViewRef}
        source={{ uri: SITE_URL }}
        style={styles.webview}
        onLoadEnd={() => setLoading(false)}
        javaScriptEnabled={true}
        domStorageEnabled={true}
        startInLoadingState={false}
        allowsBackForwardNavigationGestures={true}
        allowsInlineMediaPlayback={true}
        mediaPlaybackRequiresUserAction={false}
        sharedCookiesEnabled={true}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#E85D04',
  },
  webview: {
    flex: 1,
  },
  loadingContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#ffffff',
    zIndex: 10,
  },
});
