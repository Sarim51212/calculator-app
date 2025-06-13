import React, { useState } from 'react';
import { View, Text, Pressable, StyleSheet } from 'react-native';
import { useSelector } from 'react-redux';
import { evaluate } from 'mathjs';
import AsyncStorage from '@react-native-async-storage/async-storage';

const MainScreen = () => {
  const theme = useSelector((state) => state.theme.mode);
  const [expression, setExpression] = useState('0');
  const [memory, setMemory] = useState(0);

  const themeStyles = {
    light: {
      containerBg: '#f5f5f5',
      displayBg: '#ffffff',
      buttonBg: '#e0e0e0',
      operationBg: '#007bff',
      textColor: '#000',
      operationText: '#fff',
      borderColor: '#ccc',
    },
    dark: {
      containerBg: '#1e1e2e',
      displayBg: '#2a2a3a',
      buttonBg: '#3a3a4a',
      operationBg: '#ff6f31',
      textColor: '#fff',
      operationText: '#fff',
      borderColor: '#444',
    },
  };

  const currentTheme = themeStyles[theme] || themeStyles.dark;

  const saveToHistory = async (expr, result) => {
    try {
      const storedHistory = await AsyncStorage.getItem('calcHistory');
      const history = storedHistory ? JSON.parse(storedHistory) : [];
      history.unshift({ expression: expr, result });
      if (history.length > 50) history.pop();
      await AsyncStorage.setItem('calcHistory', JSON.stringify(history));
    } catch (e) {
     
    }
  };

  const handlePress = (val) => {
    if (val === 'AC') return setExpression('0');
    if (val === 'Backspace') {
      setExpression((prev) => (prev.length > 1 ? prev.slice(0, -1) : '0'));
      return;
    }
    if (val === '=') {
      try {
        let expr = expression
          .replace(/×/g, '*')
          .replace(/÷/g, '/')
          .replace(/−/g, '-')
          .replace(/([0-9])\(/g, '$1*(');

        const result = evaluate(expr);
        const resultStr = result.toString();
        setExpression(resultStr);
        if (resultStr !== 'undefined' && resultStr !== 'Infinity' && resultStr !== 'NaN') {
          saveToHistory(expression, resultStr);
        }
      } catch {
        setExpression('Error');
      }
      return;
    }

    if (val === '±') {
      setExpression((prev) => (prev.startsWith('-') ? prev.slice(1) : '-' + prev));
      return;
    }

    if (['mc', 'm+', 'm-', 'mr'].includes(val)) return handleMemory(val);

    setExpression((prev) => (prev === '0' || prev === 'Error' ? val : prev + val));
  };

  const handleMemory = (op) => {
    try {
      const currentVal = parseFloat(evaluate(expression));
      switch (op) {
        case 'mc':
          return setMemory(0);
        case 'm+':
          return setMemory((prev) => prev + currentVal);
        case 'm-':
          return setMemory((prev) => prev - currentVal);
        case 'mr':
          return setExpression(memory.toString());
      }
    } catch {
      
    }
  };

  const buttons = [
    ['(', ')', 'mc', 'm+', 'm-', 'mr'],
    ['7', '8', '9', '÷'],
    ['4', '5', '6', '×'],
    ['1', '2', '3', '−'],
    ['0', '.', '±', '+'],
    ['AC', 'Backspace', '='],
  ];

  const isOperation = (btn) =>
    ['+', '−', '×', '÷', '=', 'AC', 'Backspace', '±'].includes(btn);

  return (
    <View style={[styles.container, { backgroundColor: currentTheme.containerBg }]}>
      <View style={[styles.display, { backgroundColor: currentTheme.displayBg, borderColor: currentTheme.borderColor }]}>
        <Text style={[styles.displayText, { color: currentTheme.textColor }]} numberOfLines={1} adjustsFontSizeToFit>
          {expression}
        </Text>
      </View>

      <View style={styles.buttonGrid}>
        {buttons.map((row, rowIndex) => (
          <View key={rowIndex} style={styles.buttonRow}>
            {row.map((btn) => (
              <Pressable
                key={btn}
                onPress={() => handlePress(btn)}
                style={({ pressed }) => [
                  styles.button,
                  {
                    backgroundColor: isOperation(btn)
                      ? currentTheme.operationBg
                      : currentTheme.buttonBg,
                    borderColor: currentTheme.borderColor,
                  },
                  pressed && styles.buttonPressed,
                ]}
              >
                <Text
                  style={{
                    color: isOperation(btn)
                      ? currentTheme.operationText
                      : currentTheme.textColor,
                    fontSize: 20,
                    fontWeight: '600',
                  }}
                >
                  {btn}
                </Text>
              </Pressable>
            ))}
          </View>
        ))}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'flex-end',
    paddingBottom: 10,
  },
 display: {
    flex: 1, 
    backgroundColor: 'white',
    marginHorizontal: 10,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#333',
    shadowColor: '#000',
    justifyContent: 'center',
    paddingHorizontal: 24,
  },
  displayText: {
    fontSize: 48,
    fontWeight: '700',
    textAlign: 'right',
  },
  buttonGrid: {
    paddingHorizontal: 8,
    paddingBottom: 12,
  },
  buttonRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginVertical: 4,
  },
  button: {
    flex: 1,
    height: 56,
    marginHorizontal: 4,
    borderRadius: 12,
    borderWidth: 1,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 4,
  },
  buttonPressed: {
    opacity: 0.7,
  },
});

export default MainScreen;
