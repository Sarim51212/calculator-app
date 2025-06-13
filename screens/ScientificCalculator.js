import React, { useState, useCallback } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Dimensions } from 'react-native';
import { useSelector } from 'react-redux';
import { evaluate, factorial, sqrt, nthRoot, log, log10, exp, sin, cos, tan, sinh, cosh, tanh } from 'mathjs';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Animated, { useSharedValue, useAnimatedStyle, withTiming } from 'react-native-reanimated';

const screenWidth = Dimensions.get('window').width;

const buttons = [
  ['Rad', '(', ')', 'mc', 'm+', 'm-', 'mr'],
  ['2nd', 'x²', 'x³', 'xʸ', 'eˣ', '10ˣ'],
  ['1/x', '√x', '³√x', 'ʸ√x', 'ln', 'log₁₀'],
  ['x!', 'sin', 'cos', 'tan', 'e', 'EE'],
  ['Rand', 'sinh', 'cosh', 'tanh', 'π', 'Deg'],
  ['AC', '+/-', '%', '÷'],
  ['7', '8', '9', '×'],
  ['4', '5', '6', '-'],
  ['1', '2', '3', '+'],
  [ '0', '.', '='],
];


const AnimatedButton = React.memo(({ btn, onPress, themeStyles, isOperation }) => {
  const scale = useSharedValue(1);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const handlePressIn = useCallback(() => {
    scale.value = withTiming(0.9, { duration: 100 });
  }, [scale]);

  const handlePressOut = useCallback(() => {
    scale.value = withTiming(1, { duration: 100 });
  }, [scale]);

  return (
    <Animated.View style={[styles.button, animatedStyle]}>
      <TouchableOpacity
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        onPress={() => onPress(btn)}
        style={[
          styles.buttonInner,
          {
            backgroundColor: isOperation
              ? themeStyles.operationBg
              : themeStyles.buttonBg,
            borderColor: themeStyles.borderColor,
          },
        ]}
        activeOpacity={0.85}
      >
        <Text
          style={[
            styles.buttonText,
            {
              color: isOperation
                ? themeStyles.operationText
                : themeStyles.textColor,
            },
          ]}
        >
          {btn}
        </Text>
      </TouchableOpacity>
    </Animated.View>
  );
});

const ScientificCalculator = () => {
  const theme = useSelector((state) => state.theme.mode);
  const [expression, setExpression] = useState('');
  const [result, setResult] = useState('');

  
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

  const handleInput = async (input) => {
    let newExpr = expression;

    switch (input) {
      case 'AC':
        setExpression('');
        setResult('');
        return;
      case '=':
        try {
          
          const evalResult = evaluate(expression.replace(/÷/g, '/').replace(/×/g, '*'));
          setResult(evalResult.toString());
          await saveToHistory(expression, evalResult.toString());
        } catch (error) {
          setResult('Error');
        }
        return;
      case '+/-':
        setExpression((prev) => (prev.startsWith('-') ? prev.slice(1) : `-${prev}`));
        return;
      case 'π':
        newExpr += Math.PI.toFixed(8);
        break;
      case 'e':
        newExpr += Math.E.toFixed(8);
        break;
      case 'x²':
        newExpr += '**2';
        break;
      case 'x³':
        newExpr += '**3';
        break;
      case '√x':
        newExpr += 'sqrt(';
        break;
      case '³√x':
      case 'ʸ√x':
        newExpr += 'nthRoot(';
        break;
      case 'ln':
        newExpr += 'log(';
        break;
      case 'log₁₀':
        newExpr += 'log10(';
        break;
      case '1/x':
        newExpr += '1/(';
        break;
      case 'x!':
        newExpr += 'factorial(';
        break;
      case 'sin':
      case 'cos':
      case 'tan':
      case 'sinh':
      case 'cosh':
      case 'tanh':
        newExpr += `${input}(`;
        break;
      case 'xʸ':
        newExpr += '**';
        break;
      case 'eˣ':
        newExpr += 'exp(';
        break;
      case '10ˣ':
        newExpr += '10**';
        break;
      case 'Rand':
        newExpr += Math.random().toFixed(8);
        break;
      case 'EE':
        newExpr += 'e+';
        break;
      case '÷':
      case '×':
      case '+':
      case '-':
      case '.':
      case '(':
      case ')':
      case '%':
        newExpr += input;
        break;
      default:
        if (/^[0-9]$/.test(input)) {
          newExpr += input;
        }
    }
    setExpression(newExpr);
  };

  const saveToHistory = async (expr, res) => {
    try {
      const storedHistory = await AsyncStorage.getItem('calcHistory');
      const history = storedHistory ? JSON.parse(storedHistory) : [];
      history.unshift({ expression: expr, result: res });
      if (history.length > 50) history.pop();
      await AsyncStorage.setItem('calcHistory', JSON.stringify(history));
    } catch (e) {
      console.warn('Failed to save history:', e);
    }
  };

  return (
    <View style={[styles.container, { backgroundColor: currentTheme.containerBg }]}>
      <View
        style={[
          styles.display,
          { backgroundColor: currentTheme.displayBg, borderColor: currentTheme.borderColor },
        ]}
      >
        <Text
          style={[styles.expression, { color: theme === 'dark' ? '#aaa' : '#555' }]}
          numberOfLines={1}
          adjustsFontSizeToFit
        >
          {expression || '0'}
        </Text>
        <Text
          style={[styles.result, { color: currentTheme.textColor }]}
          numberOfLines={1}
          adjustsFontSizeToFit
        >
          {result}
        </Text>
      </View>
      <View style={styles.pad}>
        {buttons.map((row, rowIndex) => (
          <View key={rowIndex} style={styles.row}>
            {row.map((btn) => {
              const isOperation = ['÷', '×', '-', '+', '=', 'AC', '+/-', '%'].includes(btn);
              return (
                <AnimatedButton
                  key={btn}
                  btn={btn}
                  onPress={handleInput}
                  themeStyles={currentTheme}
                  isOperation={isOperation}
                />
              );
            })}
          </View>
        ))}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: 40, 
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  display: {
    minHeight: 120,
    maxHeight: 160,
    marginHorizontal: 12,
    marginVertical: 8,
    borderRadius: 16,
    borderWidth: 1,
    paddingHorizontal: 20,
    paddingVertical: 12,
    justifyContent: 'flex-end',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 6,
    elevation: 6,
  },
  expression: {
    fontSize: 24,
    textAlign: 'right',
    marginBottom: 8,
  },
  result: {
    fontSize: 36,
    fontWeight: '700',
    textAlign: 'right',
  },
  pad: {
    flex: 1,
    paddingHorizontal: 8,
    paddingBottom: 12,
  },
  row: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginVertical: 4,
  },
  button: {
    flex: 1,
    marginHorizontal: 4,
  },
  buttonInner: {
    flex: 1,
    borderRadius: 12,
    borderWidth: 1,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
    elevation: 3,
  },
  buttonText: {
    fontSize: 18,
    fontWeight: '600',
    textAlign: 'center',
    paddingVertical: 8,
  },
});

export default ScientificCalculator;
