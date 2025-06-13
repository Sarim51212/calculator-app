import React, { useEffect } from 'react';
import { View, Text, StyleSheet, Dimensions, Image } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withTiming,
  Easing,
} from 'react-native-reanimated';
import { LinearGradient } from 'expo-linear-gradient';
import { Audio } from 'expo-av';

const { width } = Dimensions.get('window');

const SplashScreen = ({ onFinish }) => {
  const scale = useSharedValue(0.8);
  const opacity = useSharedValue(0);
  const translateY = useSharedValue(20);
  const logoOpacity = useSharedValue(0);

  let soundObject = null;

  useEffect(() => {
    
    const playSound = async () => {
      try {
        const { sound } = await Audio.Sound.createAsync(
          require('../assets/aud.mp3') 
        );
        soundObject = sound;
        await sound.playAsync();
      } catch (error) {
        console.error('Error playing sound:', error);
      }
    };

    playSound();

   
    logoOpacity.value = withTiming(1, {
      duration: 700,
      easing: Easing.out(Easing.exp),
    });
    scale.value = withSpring(1, { damping: 12, stiffness: 100 });
    opacity.value = withTiming(1, {
      duration: 900,
      easing: Easing.out(Easing.exp),
    });
    translateY.value = withTiming(0, {
      duration: 900,
      easing: Easing.out(Easing.exp),
    });

    
    const timeout = setTimeout(() => {
      onFinish();
    }, 3000);

  
    return () => {
      if (soundObject) {
        soundObject.stopAsync();
        soundObject.unloadAsync();
      }
      clearTimeout(timeout);
    };
  }, [onFinish, scale, opacity, translateY, logoOpacity]);

  const logoAnimatedStyle = useAnimatedStyle(() => ({
    opacity: logoOpacity.value,
    transform: [{ scale: withSpring(1, { damping: 15, stiffness: 90 }) }],
  }));

  const contentAnimatedStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
    transform: [{ scale: scale.value }, { translateY: translateY.value }],
  }));

  return (
    <LinearGradient
      colors={['#1e3a8a', '#3b82f6', '#60a5fa']}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={styles.container}
    >
      <Animated.View style={[styles.logoContainer, logoAnimatedStyle]}>
        <View style={styles.logoFrame}>
          <Image
            source={require('../assets/logo1.jpg')} 
            style={styles.image}
            resizeMode="contain"
          />
        </View>
      </Animated.View>

      <Animated.View style={[styles.content, contentAnimatedStyle]}>
        <LinearGradient
          colors={['#00f5d4', '#9b5de5']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
          style={styles.titleGradient}
        >
          <Text style={styles.title}>Pro Calculator</Text>
        </LinearGradient>

        <Text style={styles.subtitle}>
          Calculate Everything{'\n'}From Units to Complex Equations
        </Text>

        <Text style={styles.tagline}>Version 1.0.0</Text>
      </Animated.View>
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#1e3a8a',
  },
  logoContainer: {
    marginBottom: 20,
    alignItems: 'center',
  },
  logoFrame: {
    width: width * 0.4,
    height: width * 0.4,
    borderRadius: (width * 0.4) / 2,
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#60a5fa',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.9,
    shadowRadius: 12,
    elevation: 10,
    borderWidth: 2,
    borderColor: 'rgba(96, 165, 250, 0.4)',
  },
  image: {
    width: width * 0.35,
    height: width * 0.35,
    borderRadius: (width * 0.35) / 2,
  },
  content: {
    alignItems: 'center',
    paddingHorizontal: 30,
  },
  titleGradient: {
    paddingVertical: 5,
    paddingHorizontal: 20,
    borderRadius: 10,
    marginBottom: 15,
  },
  title: {
    color: '#ffffff',
    fontSize: 36,
    fontWeight: '900',
    textAlign: 'center',
    letterSpacing: 1.5,
    textShadowColor: 'rgba(0, 245, 212, 0.6)',
    textShadowOffset: { width: 0, height: 3 },
    textShadowRadius: 10,
  },
  subtitle: {
    color: '#f1f5f9',
    fontSize: 18,
    fontWeight: '400',
    textAlign: 'center',
    letterSpacing: 0.5,
    lineHeight: 24,
    opacity: 0.9,
    marginBottom: 10,
  },
  tagline: {
    color: '#93c5fd',
    fontSize: 14,
    fontWeight: '600',
    textAlign: 'center',
    opacity: 0.8,
  },
});

export default SplashScreen;
