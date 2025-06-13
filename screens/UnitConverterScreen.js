import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from 'react-native';
import { useSelector } from 'react-redux';
import { Picker } from '@react-native-picker/picker';
import { LinearGradient } from 'expo-linear-gradient';
import Animated, { useSharedValue, useAnimatedStyle, withSpring } from 'react-native-reanimated';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useNavigation } from '@react-navigation/native';


const units = {
  Length: ['Meters', 'Kilometers', 'Miles', 'Feet'],
  Area: ['Square Meters', 'Square Kilometers', 'Square Miles', 'Acres'],
  Temperature: ['Celsius', 'Fahrenheit', 'Kelvin'],
  Volume: ['Liters', 'Milliliters', 'Cubic Meters', 'Gallons'],
  Mass: ['Grams', 'Kilograms', 'Pounds', 'Ounces'],
  Speed: ['Meters/Second', 'Kilometers/Hour', 'Miles/Hour', 'Feet/Second'],
  Time: ['Seconds', 'Minutes', 'Hours', 'Days'],
  Tip: ['Percentage'],
};


const conversionRates = {
  Length: { Meters: 1, Kilometers: 1000, Miles: 1609.34, Feet: 0.3048 },
  Area: { 'Square Meters': 1, 'Square Kilometers': 1e6, 'Square Miles': 2.59e6, Acres: 4046.86 },
  Temperature: {}, 
  Volume: { Liters: 1, Milliliters: 0.001, 'Cubic Meters': 1000, Gallons: 3.78541 },
  Mass: { Grams: 1, Kilograms: 1000, Pounds: 453.592, Ounces: 28.3495 },
  Speed: { 'Meters/Second': 1, 'Kilometers/Hour': 0.277778, 'Miles/Hour': 0.44704, 'Feet/Second': 0.3048 },
  Time: { Seconds: 1, Minutes: 60, Hours: 3600, Days: 86400 },
  Tip: {},
};

export default function UnitConverterScreen() {
  const theme = useSelector((state) => state.theme.mode);
  const navigation = useNavigation();
  const [category, setCategory] = useState('Length');
  const [inputValue, setInputValue] = useState('');
  const [tipPercentage, setTipPercentage] = useState('');
  const [fromUnit, setFromUnit] = useState(units[category][0]);
  const [toUnit, setToUnit] = useState(units[category][1] || units[category][0]);
  const [result, setResult] = useState(null);

  useEffect(() => {
    setFromUnit(units[category][0]);
    setToUnit(units[category][1] || units[category][0]);
    setResult(null);
    setInputValue('');
    setTipPercentage('');
  }, [category]);

  const saveToHistory = async (expr, result) => {
    try {
      const storedHistory = await AsyncStorage.getItem('calcHistory');
      const history = storedHistory ? JSON.parse(storedHistory) : [];
      history.unshift({
        expression: expr,
        result,
        timestamp: new Date().toISOString(),
        type: 'unit',
      });
      if (history.length > 50) history.pop();
      await AsyncStorage.setItem('calcHistory', JSON.stringify(history));
    } catch (e) {
      console.warn('Failed to save history:', e);
    }
  };

  const convert = () => {
    const value = parseFloat(inputValue);
    if (isNaN(value)) {
      setResult('Please enter a valid number');
      return;
    }

    let expr, convertedResult;

    
    if (category === 'Tip') {
      const percentage = parseFloat(tipPercentage);
      if (isNaN(percentage) || percentage < 0) {
        setResult('Please enter a valid tip percentage');
        return;
      }
      const tipAmount = (value * percentage) / 100;
      expr = `${value} with ${percentage}% tip`;
      convertedResult = `Tip: ${tipAmount.toFixed(2)} (Total: ${(value + tipAmount).toFixed(2)})`;
      setResult(convertedResult);
      saveToHistory(expr, convertedResult);
      return;
    }

   
    if (category === 'Temperature') {
      let celsiusValue;
      switch (fromUnit) {
        case 'Celsius':
          celsiusValue = value;
          break;
        case 'Fahrenheit':
          celsiusValue = (value - 32) * (5 / 9);
          break;
        case 'Kelvin':
          celsiusValue = value - 273.15;
          break;
        default:
          celsiusValue = value;
      }
      let convertedValue;
      switch (toUnit) {
        case 'Celsius':
          convertedValue = celsiusValue;
          break;
        case 'Fahrenheit':
          convertedValue = celsiusValue * (9 / 5) + 32;
          break;
        case 'Kelvin':
          convertedValue = celsiusValue + 273.15;
          break;
        default:
          convertedValue = celsiusValue;
      }
      expr = `${value} ${fromUnit} to ${toUnit}`;
      convertedResult = `${convertedValue.toFixed(2)} °${toUnit[0]}`;
      setResult(convertedResult);
      saveToHistory(expr, convertedResult);
      return;
    }

   
    const baseValue = value * conversionRates[category][fromUnit];
    const convertedValue = baseValue / conversionRates[category][toUnit];
    expr = `${value} ${fromUnit} to ${toUnit}`;
    convertedResult = `${convertedValue.toFixed(4)} ${toUnit}`;
    setResult(convertedResult);
    saveToHistory(expr, convertedResult);
  };

  
  const AnimatedButton = ({ onPress, children }) => {
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
        <TouchableOpacity
          onPressIn={handlePressIn}
          onPressOut={handlePressOut}
          onPress={onPress}
          style={styles.buttonInner}
        >
          <LinearGradient
            colors={theme === 'dark' ? ['#007bff', '#00d4ff'] : ['#0055cc', '#007bff']}
            style={styles.buttonGradient}
          >
            <Text style={[styles.buttonText, { color: '#fff' }]}>{children}</Text>
          </LinearGradient>
        </TouchableOpacity>
      </Animated.View>
    );
  };

  return (
    <LinearGradient
      colors={theme === 'dark' ? ['#1e1e2e', '#434343'] : ['#e0e0e0', '#ffffff']}
      style={styles.container}
    >
      <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <ScrollView keyboardShouldPersistTaps="handled">
          <View style={styles.header}>
            <Text style={[styles.title, { color: theme === 'dark' ? '#00d4ff' : '#007bff' }]}>
                      Unit Converter
            </Text>
          
          </View>

          {/* Category Picker */}
          <View style={styles.row}>
            <Text style={[styles.label, { color: theme === 'dark' ? '#fff' : '#000' }]}>Category:</Text>
            <LinearGradient
              colors={theme === 'dark' ? ['#2e2e2e', '#4e4e4e'] : ['#e0e0e0', '#ffffff']}
              style={styles.pickerContainer}
            >
              <Picker
                selectedValue={category}
                style={[styles.picker, { color: theme === 'dark' ? '#fff' : '#000' }]}
                onValueChange={(itemValue) => setCategory(itemValue)}
              >
                {Object.keys(units).map((cat) => (
                  <Picker.Item key={cat} label={cat} value={cat} />
                ))}
              </Picker>
            </LinearGradient>
          </View>

          {/* Value Input */}
          <View style={styles.row}>
            <Text style={[styles.label, { color: theme === 'dark' ? '#fff' : '#000' }]}>Value:</Text>
            <TextInput
              style={[styles.input, { borderColor: theme === 'dark' ? '#555' : '#ccc', color: theme === 'dark' ? '#fff' : '#000' }]}
              keyboardType="numeric"
              placeholder="Enter value"
              placeholderTextColor={theme === 'dark' ? '#aaa' : '#999'}
              value={inputValue}
              onChangeText={setInputValue}
            />
          </View>

          {/* From Unit */}
          {category !== 'Tip' && (
            <View style={styles.row}>
              <Text style={[styles.label, { color: theme === 'dark' ? '#fff' : '#000' }]}>From:</Text>
              <LinearGradient
                colors={theme === 'dark' ? ['#2e2e2e', '#4e4e4e'] : ['#e0e0e0', '#ffffff']}
                style={styles.pickerContainer}
              >
                <Picker
                  selectedValue={fromUnit}
                  style={[styles.picker, { color: theme === 'dark' ? '#fff' : '#000' }]}
                  onValueChange={(itemValue) => setFromUnit(itemValue)}
                >
                  {units[category].map((unit) => (
                    <Picker.Item key={unit} label={unit} value={unit} />
                  ))}
                </Picker>
              </LinearGradient>
            </View>
          )}

          {/* Tip Input or To Unit */}
          {category === 'Tip' ? (
            <View style={styles.row}>
              <Text style={[styles.label, { color: theme === 'dark' ? '#fff' : '#000' }]}>Tip %:</Text>
              <TextInput
                style={[styles.input, { borderColor: theme === 'dark' ? '#555' : '#ccc', color: theme === 'dark' ? '#fff' : '#000' }]}
                keyboardType="numeric"
                placeholder="Enter tip percentage"
                placeholderTextColor={theme === 'dark' ? '#aaa' : '#999'}
                value={tipPercentage}
                onChangeText={setTipPercentage}
              />
            </View>
          ) : (
            <View style={styles.row}>
              <Text style={[styles.label, { color: theme === 'dark' ? '#fff' : '#000' }]}>To:</Text>
              <LinearGradient
                colors={theme === 'dark' ? ['#2e2e2e', '#4e4e4e'] : ['#e0e0e0', '#ffffff']}
                style={styles.pickerContainer}
              >
                <Picker
                  selectedValue={toUnit}
                  style={[styles.picker, { color: theme === 'dark' ? '#fff' : '#000' }]}
                  onValueChange={(itemValue) => setToUnit(itemValue)}
                >
                  {units[category].map((unit) => (
                    <Picker.Item key={unit} label={unit} value={unit} />
                  ))}
                </Picker>
              </LinearGradient>
            </View>
          )}

          {/* Convert Button */}
          <AnimatedButton onPress={convert}>Convert</AnimatedButton>

          {/* Result Output */}
          {result !== null && (
            <Text style={[styles.result, { color: theme === 'dark' ? '#00d4ff' : '#007bff' }]}>{result}</Text>
          )}
        </ScrollView>
      </KeyboardAvoidingView>
    </LinearGradient>
  );
}


const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    paddingTop: 40,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 24,
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    textShadowColor: 'rgba(0, 212, 255, 0.5)',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 8,
    textAlign:'center',
    width:'100%',
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  label: {
    fontSize: 18,
    fontWeight: '500',
    width: 100,
  },
  input: {
    flex: 1,
    borderWidth: 1,
    borderRadius: 8,
    padding: 12,
    fontSize: 18,
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3,
  },
  pickerContainer: {
    flex: 1,
    borderRadius: 8,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3,
  },
  picker: {
    flex: 1,
    height: 50,
  },
  button: {
    marginTop: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
    elevation: 5,
  },
  buttonInner: {
    flex: 1,
    borderRadius: 8,
    overflow: 'hidden',
  },
  buttonGradient: {
    paddingVertical: 14,
    alignItems: 'center',
  },
  buttonText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#fff',
  },
  result: {
    marginTop: 24,
    fontSize: 22,
    fontWeight: 'bold',
    textAlign: 'center',
    textShadowColor: 'rgba(0, 212, 255, 0.3)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 4,
  },
});