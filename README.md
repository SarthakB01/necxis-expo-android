# Expo WebView FCM with Next.js Google Auth

This is a React Native application that uses WebView to display a Next.js application with Google Authentication and Firebase Cloud Messaging (FCM) integration.

## Configuration

### WebView URL Configuration

The WebView URL can be configured in `src/config/env.ts`. The configuration supports both development and production environments:

```typescript
const config = {
  WEBVIEW_URL: {
    development: Platform.select({
      android: 'http://10.0.2.2:3000', // Android emulator
      ios: 'http://localhost:3000',    // iOS simulator
      default: 'http://localhost:3000',
    }),
    production: 'https://your-production-url.com', // Replace with your production URL
  },
};
```

#### Development URLs
- For Android Emulator: `http://10.0.2.2:3000`
- For iOS Simulator: `http://localhost:3000`
- For Physical Devices: Replace with your computer's local IP address

#### Production URL
Replace the production URL in the config with your actual production website URL.

## Setup Instructions

1. Start your Next.js Google Auth application:
```bash
cd nextjs-google-auth
pnpm dev
```

2. Install Expo dependencies:
```bash
cd expo-webview-fcm
pnpm install
```

3. Start the Expo development server:
```bash
pnpm start
```

4. Run on specific platform:
```bash
# For Android
pnpm android

# For iOS
pnpm ios
```

## Development Notes

- The app automatically switches between development and production URLs based on the `__DEV__` flag
- For physical device testing, make sure to update the development URL to your computer's local IP address
- The WebView component includes:
  - Authentication handling
  - Cookie management
  - Error handling
  - Loading states
  - Message passing between WebView and React Native

## Authentication Flow

The WebView component is configured to:
1. Enable cookies and localStorage for authentication persistence
2. Handle authentication messages between the Next.js app and React Native
3. Support Google Sign-In through the WebView
4. Maintain session state across app restarts

## Troubleshooting

If you encounter authentication issues:
1. Make sure your Next.js app is running and accessible
2. Check that cookies are enabled in the WebView
3. Verify the URL configuration matches your development environment
4. For physical devices, ensure you're using the correct local IP address 