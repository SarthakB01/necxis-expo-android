import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Modal, TextInput, Platform, Alert } from 'react-native';

interface DevMenuProps {
  isVisible: boolean;
  onClose: () => void;
  currentUrl: string;
  onUrlChange: (url: string) => void;
}

const DevMenu: React.FC<DevMenuProps> = ({ isVisible, onClose, currentUrl, onUrlChange }) => {
  const [customUrl, setCustomUrl] = useState(currentUrl);
  const [isCustomUrlVisible, setIsCustomUrlVisible] = useState(false);

  // Your computer's IP address from the Expo logs
  const LOCAL_IP = '172.20.184.222';

  // Update customUrl when currentUrl changes
  useEffect(() => {
    setCustomUrl(currentUrl);
  }, [currentUrl]);

  const predefinedUrls = {
    'Local (Android Emulator)': 'http://10.0.2.2:3000',
    'Local (iOS Simulator)': `http://${LOCAL_IP}:3000`,
    'Expo Go (iOS/Android)': `http://${LOCAL_IP}:3000`,
    'Custom URL': 'custom',
  };

  const handleUrlSelect = (url: string) => {
    if (url === 'custom') {
      setIsCustomUrlVisible(true);
    } else {
      onUrlChange(url);
      onClose();
    }
  };

  const validateUrl = (url: string): boolean => {
    try {
      new URL(url);
      return true;
    } catch {
      return false;
    }
  };

  const handleCustomUrlSubmit = () => {
    if (!customUrl) {
      Alert.alert('Error', 'Please enter a URL');
      return;
    }

    if (!validateUrl(customUrl)) {
      Alert.alert('Error', 'Please enter a valid URL (e.g., http://192.168.1.100:3000)');
      return;
    }

    onUrlChange(customUrl);
    setIsCustomUrlVisible(false);
    onClose();
  };

  const handleGetLocalIp = async () => {
    try {
      const response = await fetch('https://api.ipify.org?format=json');
      const data = await response.json();
      const localIp = data.ip;
      setCustomUrl(`http://${localIp}:3000`);
    } catch (error) {
      Alert.alert('Error', 'Could not fetch local IP address');
    }
  };

  return (
    <Modal
      visible={isVisible}
      transparent
      animationType="slide"
      onRequestClose={onClose}
    >
      <View style={styles.modalContainer}>
        <View style={styles.menuContainer}>
          <Text style={styles.title}>Development Menu</Text>
          <Text style={styles.currentUrl}>Current URL: {currentUrl}</Text>
          
          {Object.entries(predefinedUrls).map(([label, url]) => (
            <TouchableOpacity
              key={label}
              style={styles.menuItem}
              onPress={() => handleUrlSelect(url)}
            >
              <Text style={styles.menuItemText}>{label}</Text>
            </TouchableOpacity>
          ))}

          <TouchableOpacity style={styles.closeButton} onPress={onClose}>
            <Text style={styles.closeButtonText}>Close</Text>
          </TouchableOpacity>
        </View>

        <Modal
          visible={isCustomUrlVisible}
          transparent
          animationType="slide"
          onRequestClose={() => setIsCustomUrlVisible(false)}
        >
          <View style={styles.modalContainer}>
            <View style={styles.customUrlContainer}>
              <Text style={styles.title}>Enter Custom URL</Text>
              <TextInput
                style={styles.input}
                value={customUrl}
                onChangeText={setCustomUrl}
                placeholder="Enter URL (e.g., http://192.168.1.100:3000)"
                autoCapitalize="none"
                autoCorrect={false}
                keyboardType="url"
              />
              <TouchableOpacity
                style={[styles.button, styles.getIpButton]}
                onPress={handleGetLocalIp}
              >
                <Text style={styles.buttonText}>Get Local IP</Text>
              </TouchableOpacity>
              <View style={styles.buttonContainer}>
                <TouchableOpacity
                  style={[styles.button, styles.cancelButton]}
                  onPress={() => setIsCustomUrlVisible(false)}
                >
                  <Text style={styles.buttonText}>Cancel</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.button, styles.submitButton]}
                  onPress={handleCustomUrlSubmit}
                >
                  <Text style={styles.buttonText}>Submit</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </Modal>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  menuContainer: {
    backgroundColor: 'white',
    borderRadius: 10,
    padding: 20,
    width: '80%',
    maxWidth: 400,
  },
  customUrlContainer: {
    backgroundColor: 'white',
    borderRadius: 10,
    padding: 20,
    width: '80%',
    maxWidth: 400,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 15,
    textAlign: 'center',
  },
  currentUrl: {
    fontSize: 14,
    color: '#666',
    marginBottom: 15,
    textAlign: 'center',
  },
  menuItem: {
    padding: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  menuItemText: {
    fontSize: 16,
    color: '#333',
  },
  closeButton: {
    marginTop: 20,
    padding: 15,
    backgroundColor: '#f44336',
    borderRadius: 5,
  },
  closeButtonText: {
    color: 'white',
    textAlign: 'center',
    fontSize: 16,
    fontWeight: 'bold',
  },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 5,
    padding: 10,
    marginBottom: 15,
    fontSize: 16,
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  button: {
    flex: 1,
    padding: 15,
    borderRadius: 5,
    marginHorizontal: 5,
  },
  getIpButton: {
    backgroundColor: '#2196f3',
    marginBottom: 15,
  },
  cancelButton: {
    backgroundColor: '#9e9e9e',
  },
  submitButton: {
    backgroundColor: '#4caf50',
  },
  buttonText: {
    color: 'white',
    textAlign: 'center',
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default DevMenu; 