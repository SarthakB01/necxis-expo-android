import React, { useRef, useEffect, useState } from 'react';
import { StyleSheet, View, ActivityIndicator, Alert } from 'react-native';
import { WebView } from 'react-native-webview';
import messaging from '@react-native-firebase/messaging';

const WebViewComponent = () => {
  const webViewRef = useRef<WebView>(null);
  const [loading, setLoading] = useState(true);

  // Request notification permissions
  useEffect(() => {
    const requestPermissions = async () => {
      const authStatus = await messaging().requestPermission();
      const enabled =
        authStatus === messaging.AuthorizationStatus.AUTHORIZED ||
        authStatus === messaging.AuthorizationStatus.PROVISIONAL;

      if (enabled) {
        console.log('Authorization status:', authStatus);
        getFcmToken();
      } else {
        Alert.alert(
          'Permission Required', 
          'Please enable notifications to receive updates'
        );
      }
    };

    requestPermissions();
  }, []);

  // Get FCM token
  const getFcmToken = async () => {
    try {
      const token = await messaging().getToken();
      console.log('FCM Token:', token);
      
      // Send token to WebView when it's ready
      if (webViewRef.current) {
        const scriptToInject = `
          window.postMessage(
            ${JSON.stringify({ type: 'FCM_TOKEN', token })}, 
            '*'
          );
          true;
        `;
        webViewRef.current.injectJavaScript(scriptToInject);
      }
    } catch (error) {
      console.error('Failed to get FCM token:', error);
    }
  };

  // Handle messages from WebView
  const handleWebViewMessage = (event: { nativeEvent: { data: string } }) => {
    try {
      const message = JSON.parse(event.nativeEvent.data);
      console.log('Message from WebView:', message);
      
      if (message.type === 'WEB_VIEW_READY') {
        // WebView is ready, send FCM token
        getFcmToken();
      }
    } catch (error) {
      console.error('Failed to parse WebView message:', error);
    }
  };

  // Set up FCM message handlers
  useEffect(() => {
    // Handle foreground messages
    const unsubscribeForeground = messaging().onMessage(async remoteMessage => {
      console.log('Foreground Message received:', remoteMessage);
      // You can show a notification here using a library like react-native-push-notification
      Alert.alert(
        remoteMessage.notification?.title || 'New Message',
        remoteMessage.notification?.body || 'You have a new notification'
      );
    });

    // Handle notification clicks when app is in background
    const unsubscribeBackground = messaging().onNotificationOpenedApp(remoteMessage => {
      console.log('Background Message clicked:', remoteMessage);
      // Navigate to specific screen if needed
    });

    // Check if app was opened from a notification
    messaging()
      .getInitialNotification()
      .then(remoteMessage => {
        if (remoteMessage) {
          console.log('App opened from notification:', remoteMessage);
          // Navigate to specific screen if needed
        }
      });

    return () => {
      unsubscribeForeground();
      unsubscribeBackground();
    };
  }, []);

  return (
    <View style={styles.container}>
      {loading && (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#3f51b5" />
        </View>
      )}
      <WebView
        ref={webViewRef}
        source={{ uri: 'http://10.0.2.2:3000' }} // Android emulator localhost
        style={styles.webview}
        onLoadEnd={() => setLoading(false)}
        onMessage={handleWebViewMessage}
        javaScriptEnabled={true}
        domStorageEnabled={true}
        startInLoadingState={true}
        scalesPageToFit={true}
        allowsBackForwardNavigationGestures={true}
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
});

export default WebViewComponent;