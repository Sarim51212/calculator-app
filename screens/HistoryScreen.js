import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  Pressable,
  Alert,
  TextInput,
} from 'react-native';
import { useSelector } from 'react-redux';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useFocusEffect } from '@react-navigation/native';
import moment from 'moment';
import { LinearGradient } from 'expo-linear-gradient';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  FadeIn,
} from 'react-native-reanimated';

const HistoryScreen = () => {
  const theme = useSelector((state) => state.theme.mode);
  const [history, setHistory] = useState([]);
  const [editIndex, setEditIndex] = useState(null);
  const [editText, setEditText] = useState('');

  const loadHistory = async () => {
    try {
      const stored = await AsyncStorage.getItem('calcHistory');
      if (stored) {
        const parsed = JSON.parse(stored);
        const cleanHistory = parsed.filter(
          (item) =>
            item &&
            typeof item === 'object' &&
            typeof item.expression === 'string' &&
            typeof item.result === 'string'
        );
        setHistory(cleanHistory);
      } else {
        setHistory([]);
      }
    } catch (e) {
      console.error('Failed to load history:', e);
      setHistory([]);
    }
  };

  const saveHistory = async (updated) => {
    try {
      await AsyncStorage.setItem('calcHistory', JSON.stringify(updated));
      setHistory(updated);
    } catch (e) {
      console.error('Failed to save history:', e);
    }
  };

  const deleteAllHistory = () => {
    Alert.alert('Confirm Delete', 'Are you sure you want to delete all history?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Yes, Delete All',
        style: 'destructive',
        onPress: async () => {
          try {
            await AsyncStorage.removeItem('calcHistory');
            setHistory([]);
            Alert.alert('History Cleared');
          } catch (e) {
            console.error('Failed to delete history:', e);
            Alert.alert('Error', 'Could not clear history.');
          }
        },
      },
    ]);
  };

  const handleEdit = (index) => {
    if (
      history[index] &&
      typeof history[index].expression === 'string' &&
      typeof history[index].result === 'string'
    ) {
      Alert.alert('Edit or Delete', 'Choose an action for this entry.', [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: () => deleteEntry(index),
        },
        {
          text: 'Edit',
          onPress: () => {
            setEditIndex(index);
            setEditText(`${history[index].expression} = ${history[index].result}`);
          },
        },
      ]);
    } else {
      Alert.alert('Error', 'Invalid entry.');
    }
  };

  const confirmEdit = async () => {
    const parts = editText.split('=');
    if (parts.length === 2 && editIndex !== null && history[editIndex]) {
      const updated = [...history];
      updated[editIndex] = {
        expression: parts[0].trim(),
        result: parts[1].trim(),
        timestamp: updated[editIndex].timestamp || new Date().toISOString(),
      };
      await saveHistory(updated);
    } else {
      Alert.alert('Invalid Format', 'Use format: 2+2 = 4');
    }
    setEditIndex(null);
    setEditText('');
  };

  const deleteEntry = async (index) => {
    const updated = [...history];
    updated.splice(index, 1);
    await saveHistory(updated);
  };

  const groupByDate = () => {
    const grouped = {};
    const today = moment().startOf('day');
    const yesterday = moment().subtract(1, 'days').startOf('day');

    history.forEach((item) => {
      if (!item || !moment(item.timestamp).isValid()) return;

      const time = moment(item.timestamp);
      let key = time.format('YYYY-MM-DD');
      if (time.isSame(today, 'day')) key = 'Today';
      else if (time.isSame(yesterday, 'day')) key = 'Yesterday';

      if (!grouped[key]) grouped[key] = [];
      grouped[key].push(item);
    });

    return grouped;
  };

  useFocusEffect(
    React.useCallback(() => {
      loadHistory();
      return () => {};
    }, [])
  );

  const AnimatedButton = ({ onPress, children, colors }) => {
    const scale = useSharedValue(1);
    const animatedStyle = useAnimatedStyle(() => ({
      transform: [{ scale: scale.value }],
    }));

    return (
      <Animated.View style={[styles.button, animatedStyle]}>
        <Pressable
          onPressIn={() => (scale.value = withSpring(0.95))}
          onPressOut={() => (scale.value = withSpring(1))}
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
      <View style={styles.header}>
        <Text style={[styles.title, { color: theme === 'dark' ? '#00d4ff' : '#007bff' }]}>
          Calculation History
        </Text>
        <AnimatedButton colors={['#ff4d4d', '#ff6666']} onPress={deleteAllHistory}>
          Clear All
        </AnimatedButton>
      </View>

      <ScrollView>
        {Object.entries(groupByDate()).map(([date, items]) => (
          <View key={date}>
            <Text style={[styles.dateHeader, { color: theme === 'dark' ? '#ccc' : '#555' }]}>
              {date}
            </Text>
            {items.map((item, i) => {
              const index = history.findIndex(
                (h) =>
                  h.expression === item.expression &&
                  h.result === item.result &&
                  h.timestamp === item.timestamp
              );

              if (editIndex === index) {
                return (
                  <View key={index} style={styles.editContainer}>
                    <TextInput
                      style={[styles.input, { color: theme === 'dark' ? '#fff' : '#000' }]}
                      value={editText}
                      onChangeText={setEditText}
                      autoFocus
                      onSubmitEditing={confirmEdit}
                    />
                    <AnimatedButton colors={['#00d4ff', '#66e0ff']} onPress={confirmEdit}>
                      Save
                    </AnimatedButton>
                    <AnimatedButton colors={['#aaa', '#ccc']} onPress={() => { setEditIndex(null); setEditText(''); }}>
                      Cancel
                    </AnimatedButton>
                  </View>
                );
              }

              return (
                <Animated.View key={index} entering={FadeIn.duration(300)} style={styles.entryContainer}>
                  <Pressable onLongPress={() => handleEdit(index)}>
                    <LinearGradient
                      colors={theme === 'dark' ? ['#2e2e2e', '#4e4e4e'] : ['#e0e0e0', '#ffffff']}
                      style={styles.entryGradient}
                    >
                      <Text style={[styles.entry, { color: theme === 'dark' ? '#fff' : '#000' }]}>
                        {item.expression} = {item.result}
                      </Text>
                    </LinearGradient>
                  </Pressable>
                </Animated.View>
              );
            })}
          </View>
        ))}
      </ScrollView>
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    textShadowColor: 'rgba(0, 212, 255, 0.5)',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 8,
  },
  button: {
    padding: 5,
  },
  buttonInner: {
    borderRadius: 8,
    overflow: 'hidden',
  },
  buttonGradient: {
    padding: 10,
    alignItems: 'center',
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  dateHeader: {
    fontSize: 18,
    marginTop: 20,
    marginBottom: 6,
    fontWeight: 'bold',
  },
  entryContainer: {
    marginVertical: 4,
  },
  entryGradient: {
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 8,
  },
  entry: {
    fontSize: 16,
  },
  input: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    padding: 8,
    marginVertical: 4,
    borderRadius: 4,
    flex: 1,
  },
  editContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 8,
  },
});

export default HistoryScreen;
