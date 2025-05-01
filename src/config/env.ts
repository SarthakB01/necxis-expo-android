import { Platform } from 'react-native';

interface EnvConfig {
  WEBVIEW_URL: {
    android: string;
    ios: string;
    default: string;
  };
}

// Use ngrok URL
const NGROK_URL = 'https://9ebb-2401-4900-7b7c-3503-d0d7-eba1-f08a-56b4.ngrok-free.app'; // Replace this with your current ngrok URL

const config: EnvConfig = {
  WEBVIEW_URL: {
    android: NGROK_URL,
    ios: NGROK_URL,
    default: NGROK_URL,
  },
};

export const getWebViewUrl = () => {
  const platform = Platform.OS as 'android' | 'ios';
  return config.WEBVIEW_URL[platform] || config.WEBVIEW_URL.default;
};

export default config; 