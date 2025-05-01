import React, { useRef, useState, useEffect } from 'react';
import { StyleSheet, View, ActivityIndicator, Platform, Text, TouchableOpacity, Linking } from 'react-native';
import { WebView } from 'react-native-webview';
import { getWebViewUrl } from '../config/env';
import DevMenu from './DevMenu';

const WebViewComponent = () => {
  const webViewRef = useRef<WebView>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isDevMenuVisible, setIsDevMenuVisible] = useState(false);
  const [currentUrl, setCurrentUrl] = useState(getWebViewUrl());

  useEffect(() => {
    // Handle deep linking
    const handleDeepLink = (event: { url: string }) => {
      if (event.url.startsWith('exp://')) {
        // Extract session from URL
        const url = new URL(event.url);
        const sessionParam = url.searchParams.get('session');
        if (sessionParam) {
          try {
            const session = JSON.parse(decodeURIComponent(sessionParam));
            // Inject the session into the WebView
            webViewRef.current?.injectJavaScript(`
              window.localStorage.setItem('session', '${JSON.stringify(session)}');
              window.dispatchEvent(new Event('storage'));
              true;
            `);
          } catch (error) {
            console.error('Error parsing session:', error);
          }
        }
        // Reload the WebView
        webViewRef.current?.reload();
      }
    };

    // Add event listener for deep linking
    Linking.addEventListener('url', handleDeepLink);

    // Cleanup
    return () => {
      Linking.removeAllListeners('url');
    };
  }, []);

  // Inject JavaScript to handle authentication
  const injectedJavaScript = `
    // Enable cookies and localStorage
    window.localStorage.setItem('isNativeApp', 'true');
    
    // Handle authentication state
    window.addEventListener('message', function(event) {
      if (event.data && event.data.type === 'auth') {
        window.ReactNativeWebView.postMessage(JSON.stringify({
          type: 'auth',
          data: event.data
        }));
      }
    });

    // Detect Google OAuth URLs
    const originalFetch = window.fetch;
    window.fetch = function(url, options) {
      if (url && typeof url === 'string' && url.includes('accounts.google.com')) {
        window.ReactNativeWebView.postMessage(JSON.stringify({
          type: 'openAuth',
          url: url
        }));
        return Promise.reject('Opening in system browser');
      }
      return originalFetch(url, options);
    };

    // Check for existing session
    const existingSession = window.localStorage.getItem('session');
    if (existingSession) {
      try {
        const session = JSON.parse(existingSession);
        window.dispatchEvent(new Event('storage'));
      } catch (error) {
        console.error('Error parsing existing session:', error);
      }
    }

    true; // Note: this is needed for iOS
  `;

  const handleUrlChange = (newUrl: string) => {
    setCurrentUrl(newUrl);
    setLoading(true);
    setError(null);
  };

  const handleRetry = () => {
    setError(null);
    setLoading(true);
    webViewRef.current?.reload();
  };

  const renderError = () => {
    if (!error) return null;

    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorText}>Error: {error}</Text>
        <Text style={styles.errorText}>URL: {currentUrl}</Text>
        <Text style={styles.errorHelpText}>
          Make sure your Next.js server is running and accessible.
          {Platform.OS === 'android' ? '\nFor physical devices, use your computer\'s IP address.' : ''}
        </Text>
        <TouchableOpacity style={styles.retryButton} onPress={handleRetry}>
          <Text style={styles.retryButtonText}>Retry</Text>
        </TouchableOpacity>
      </View>
    );
  };

  return (
    <View style={styles.container}>
      {__DEV__ && (
        <TouchableOpacity
          style={styles.devButton}
          onPress={() => setIsDevMenuVisible(true)}
        >
          <Text style={styles.devButtonText}>Dev Menu</Text>
        </TouchableOpacity>
      )}
      
      {loading && (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#3f51b5" />
          <Text style={styles.loadingText}>Loading website...</Text>
        </View>
      )}
      
      {renderError()}

      <WebView
        ref={webViewRef}
        source={{ uri: currentUrl }}
        style={styles.webview}
        onLoadEnd={() => setLoading(false)}
        onError={(syntheticEvent) => {
          const { nativeEvent } = syntheticEvent;
          console.error('WebView error:', nativeEvent);
          setError(nativeEvent.description);
        }}
        onHttpError={(syntheticEvent) => {
          const { nativeEvent } = syntheticEvent;
          console.error('WebView HTTP error:', nativeEvent);
          setError(`HTTP Error: ${nativeEvent.statusCode}`);
        }}
        javaScriptEnabled={true}
        domStorageEnabled={true}
        startInLoadingState={true}
        scalesPageToFit={true}
        allowsBackForwardNavigationGestures={true}
        sharedCookiesEnabled={true}
        thirdPartyCookiesEnabled={true}
        injectedJavaScript={injectedJavaScript}
        onMessage={(event) => {
          try {
            const data = JSON.parse(event.nativeEvent.data);
            if (data.type === 'auth') {
              // Handle authentication messages here
              console.log('Auth message received:', data);
            } else if (data.type === 'openAuth') {
              // Open Google OAuth in system browser
              Linking.openURL(data.url);
            }
          } catch (error) {
            console.error('Error parsing message:', error);
          }
        }}
        onShouldStartLoadWithRequest={(request) => {
          // Open Google OAuth URLs in system browser
          if (request.url.includes('accounts.google.com')) {
            Linking.openURL(request.url);
            return false;
          }
          console.log('Loading URL:', request.url);
          return true;
        }}
      />

      <DevMenu
        isVisible={isDevMenuVisible}
        onClose={() => setIsDevMenuVisible(false)}
        currentUrl={currentUrl}
        onUrlChange={handleUrlChange}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  webview: {
    flex: 1,
  },
  loadingContainer: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fff',
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    color: '#666',
  },
  errorContainer: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fff',
    padding: 20,
  },
  errorText: {
    color: 'red',
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 10,
  },
  errorHelpText: {
    color: '#666',
    fontSize: 14,
    textAlign: 'center',
    marginBottom: 20,
    paddingHorizontal: 20,
  },
  retryButton: {
    backgroundColor: '#3f51b5',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 5,
  },
  retryButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
  devButton: {
    position: 'absolute',
    top: Platform.OS === 'ios' ? 50 : 20,
    right: 20,
    backgroundColor: '#3f51b5',
    padding: 10,
    borderRadius: 5,
    zIndex: 1000,
  },
  devButtonText: {
    color: 'white',
    fontSize: 14,
    fontWeight: 'bold',
  },
});

export default WebViewComponent;