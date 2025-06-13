import React, { useEffect, useState } from 'react';
import { View, Text, Switch, StyleSheet, Alert, Pressable, Modal, TextInput } from 'react-native';
import { useSelector, useDispatch } from 'react-redux';
import { setTheme, toggleTheme } from '../redux/slices/themeSlice';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { LinearGradient } from 'expo-linear-gradient';

import Animated, { useSharedValue, useAnimatedStyle, withSpring } from 'react-native-reanimated';

const SettingsScreen = () => {
  const theme = useSelector((state) => state.theme.mode);
  const dispatch = useDispatch();
  const [notificationsEnabled, setNotificationsEnabled] = useState(false);
  const [feedbackModalVisible, setFeedbackModalVisible] = useState(false);
  const [feedback, setFeedback] = useState('');

  useEffect(() => {
    const loadNotifications = async () => {
      const notifications = await AsyncStorage.getItem('notifications');
      if (notifications === 'true') setNotificationsEnabled(true);
    };
    loadNotifications();
  }, []);

  const onToggleTheme = () => {
    dispatch(toggleTheme());
    Alert.alert('Theme Updated', `Switched to ${theme === 'light' ? 'Dark' : 'Light'} Mode`);
  };

  const toggleNotifications = async () => {
    const newStatus = !notificationsEnabled;
    setNotificationsEnabled(newStatus);
    await AsyncStorage.setItem('notifications', newStatus ? 'true' : 'false');
    Alert.alert('Notifications Updated', `Notifications are now ${newStatus ? 'Enabled' : 'Disabled'}`);
  };

  const resetSettings = () => {
    Alert.alert('Reset All Settings', 'Are you sure you want to reset everything?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Yes, Reset',
        style: 'destructive',
        onPress: async () => {
          await AsyncStorage.multiRemove(['notifications']);
          dispatch(setTheme('light'));
          setNotificationsEnabled(false);
          Alert.alert('Settings Reset', 'All settings have been reset.');
        },
      },
    ]);
  };

  const submitFeedback = async () => {
    console.log('Feedback submitted:', feedback);
    setFeedback('');
    setFeedbackModalVisible(false);
    Alert.alert('Feedback Submitted', 'Thank you for your feedback!');
  };

  const openSupport = () => {
    Alert.alert('Help & Support', 'Please contact support@example.com for assistance.');
  };

  const AnimatedButton = ({ onPress, children, colors }) => {
    const scale = useSharedValue(1);
    const animatedStyle = useAnimatedStyle(() => ({
      transform: [{ scale: scale.value }],
    }));

    const handlePressIn = () => {
      scale.value = withSpring(0.95, { damping: 20 });
    };

    const handlePressOut = () => {
      scale.value = withSpring(1, { damping: 20 });
    };

    return (
      <Animated.View style={[styles.button, animatedStyle]}>
        <Pressable
          onPressIn={handlePressIn}
          onPressOut={handlePressOut}
          onPress={onPress}
          style={styles.buttonInner}
        >
          <LinearGradient colors={colors} style={styles.buttonGradient}>
            <Text style={styles.buttonText}>{children}</Text>
          </LinearGradient>
        </Pressable>
      </Animated.View>
    );
  };

  return (
    <LinearGradient
      colors={theme === 'dark' ? ['#1e1e2e', '#434343'] : ['#e0e0e0', '#ffffff']}
      style={styles.container}
    >
      <Text style={[styles.heading, { color: theme === 'dark' ? '#00d4ff' : '#007bff' }]}>Settings</Text>
      <View style={styles.settingItem}>
        <Text style={[styles.settingText, { color: theme === 'dark' ? '#fff' : '#000' }]}>Dark Mode</Text>
        <Switch
          value={theme === 'dark'}
          onValueChange={onToggleTheme}
          thumbColor={theme === 'dark' ? '#00d4ff' : '#ccc'}
          trackColor={{ false: '#767577', true: '#00d4ff' }}
        />
      </View>
      <View style={styles.settingItem}>
        <Text style={[styles.settingText, { color: theme === 'dark' ? '#fff' : '#000' }]}>Notifications</Text>
        <Switch
          value={notificationsEnabled}
          onValueChange={toggleNotifications}
          thumbColor={notificationsEnabled ? '#00d4ff' : '#ccc'}
          trackColor={{ false: '#767577', true: '#00d4ff' }}
        />
      </View>
      <View style={styles.settingItem}>
        <Text style={[styles.settingText, { color: theme === 'dark' ? '#fff' : '#000' }]}>App Version</Text>
        <Text style={[styles.versionText, { color: theme === 'dark' ? '#aaa' : '#555' }]}>1.0.0</Text>
      </View>
      <AnimatedButton colors={theme === 'dark' ? ['#ff4d4d', '#ff6666'] : ['#cc0000', '#ff4d4d']} onPress={resetSettings}>
        Reset All Settings
      </AnimatedButton>
      <AnimatedButton colors={theme === 'dark' ? ['#4CAF50', '#66cc66'] : ['#339933', '#4CAF50']} onPress={() => setFeedbackModalVisible(true)}>
        Send Feedback
      </AnimatedButton>
      <AnimatedButton colors={theme === 'dark' ? ['#2196F3', '#66b0ff'] : ['#0055cc', '#007bff']} onPress={openSupport}>
        Help & Support
      </AnimatedButton>
      <Modal
        animationType="slide"
        transparent={true}
        visible={feedbackModalVisible}
        onRequestClose={() => setFeedbackModalVisible(false)}
      >
        <LinearGradient colors={['#1e1e2e', '#434343']} style={styles.modalView}>
          <Text style={styles.modalText}>Your Feedback</Text>
          <TextInput
            style={[styles.textInput, { color: '#fff', borderColor: '#00d4ff' }]}
            placeholder="Type your feedback here..."
            placeholderTextColor="#aaa"
            value={feedback}
            onChangeText={setFeedback}
            multiline
          />
          <AnimatedButton colors={['#4CAF50', '#66cc66']} onPress={submitFeedback}>
            Submit
          </AnimatedButton>
          <AnimatedButton colors={['#ff4d4d', '#ff6666']} onPress={() => setFeedbackModalVisible(false)}>
            Close
          </AnimatedButton>
        </LinearGradient>
      </Modal>
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
  },
  heading: {
    fontSize: 26,
    fontWeight: 'bold',
    marginBottom: 20,
    textShadowColor: 'rgba(0, 212, 255, 0.5)',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 8,
  },
  settingItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#ccc',
  },
  settingText: {
    fontSize: 18,
  },
  versionText: {
    fontSize: 16,
  },
  button: {
    marginTop: 20,
  },
  buttonInner: {
    flex: 1,
    borderRadius: 8,
    overflow: 'hidden',
  },
  buttonGradient: {
    padding: 12,
    alignItems: 'center',
  },
  buttonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
  },
  modalView: {
    margin: 20,
    borderRadius: 20,
    padding: 35,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
  modalText: {
    marginBottom: 15,
    textAlign: 'center',
    fontSize: 18,
    color: '#00d4ff',
  },
  textInput: {
    height: 100,
    borderWidth: 1,
    borderRadius: 8,
    width: '100%',
    padding: 10,
    marginBottom: 15,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
  },
});

export default SettingsScreen;