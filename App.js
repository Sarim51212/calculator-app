import React, { useState, useEffect } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createDrawerNavigator } from '@react-navigation/drawer';
import { StatusBar, View, StyleSheet } from 'react-native';
import { Provider, useSelector } from 'react-redux';
import Animated, { FadeIn, FadeOut } from 'react-native-reanimated';
import store from './redux/store';
import SplashScreen from './screens/SplashScreen';
import MainScreen from './screens/MainScreen';
import HistoryScreen from './screens/HistoryScreen';
import ScientificCalculator from './screens/ScientificCalculator';
import UnitConverterScreen from './screens/UnitConverterScreen';
import SettingsScreen from './screens/SettingsScreen';

const Drawer = createDrawerNavigator();

export default function App() {
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
  
    const timer = setTimeout(() => setIsLoaded(true), 2000);
    return () => clearTimeout(timer);
  }, []);

  if (!isLoaded) {
    return <SplashScreen onFinish={() => setIsLoaded(true)} />;
  }

  return (
    <Provider store={store}>
      <NavigationContainer>
        <AppContent />
      </NavigationContainer>
    </Provider>
  );
}

function AppContent() {
  const theme = useSelector((state) => state.theme.mode); 

  
  const themeStyles = {
    light: {
      backgroundColor: '#f5f5f5',
      textColor: '#333',
      drawerBackground: '#ffffff',
      drawerActiveTint: '#007AFF',
      drawerBorder: '#007AFF',
      headerTint: '#333',
    },
    dark: {
      backgroundColor: '#1e1e2e',
      textColor: '#fff',
      drawerBackground: '#2a2a3a',
      drawerActiveTint: '#00d4ff',
      drawerBorder: '#00d4ff',
      headerTint: '#fff',
    },
  };

  const currentTheme = themeStyles[theme] || themeStyles.dark; 

  return (
    <>
      <StatusBar
        barStyle={theme === 'light' ? 'dark-content' : 'light-content'}
        backgroundColor="transparent"
        translucent
      />
      <View style={[styles.container, { backgroundColor: currentTheme.backgroundColor }]}>
        <Animated.View
          entering={FadeIn.duration(600)}
          exiting={FadeOut.duration(600)}
          style={styles.animatedContainer}
        >
          <Drawer.Navigator
            initialRouteName="Standard Calculator"
            screenOptions={{
              headerStyle: {
                backgroundColor: 'transparent',
                elevation: 0, // Remove shadow on Android
                shadowOpacity: 0, // Remove shadow on iOS
              },
              headerTintColor: currentTheme.headerTint,
              drawerActiveTintColor: currentTheme.drawerActiveTint,
              drawerInactiveTintColor: currentTheme.textColor,
              drawerStyle: {
                backgroundColor: currentTheme.drawerBackground,
                borderRightWidth: 1,
                borderRightColor: currentTheme.drawerBorder,
                width: 280, // Slightly wider drawer for better UX
              },
              drawerLabelStyle: {
                fontSize: 18,
                fontWeight: '600',
                color: currentTheme.textColor,
                marginLeft: -16, // Adjust label position
              },
              drawerItemStyle: {
                borderRadius: 12,
                marginVertical: 4,
                marginHorizontal: 8,
                paddingVertical: 4,
              },
              sceneContainerStyle: {
                backgroundColor: 'transparent',
              },
            }}
          >
            <Drawer.Screen name="Standard Calculator" component={MainScreen} />
            <Drawer.Screen name="Scientific Calculator" component={ScientificCalculator} />
            <Drawer.Screen name="Unit Converter" component={UnitConverterScreen} />
            <Drawer.Screen name="Settings" component={SettingsScreen} />
            <Drawer.Screen name="History" component={HistoryScreen} />
          </Drawer.Navigator>
        </Animated.View>
      </View>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 5, 
  },
  animatedContainer: {
    flex: 1,
    borderRadius: 12,
    overflow: 'hidden', 
    margin: 8, 
    backgroundColor: 'transparent', 
  },
});