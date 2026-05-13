import React, { useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Animated,
  SafeAreaView,
} from 'react-native';
import { colors, typography, spacing } from '../config/theme';

export default function SplashScreen({ navigation }) {
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(0.5)).current;

  useEffect(() => {
    // Animate in
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 500,
        useNativeDriver: true,
      }),
      Animated.timing(scaleAnim, {
        toValue: 1,
        duration: 500,
        useNativeDriver: true,
      }),
    ]).start();

    // Navigate to Login after delay
    const timer = setTimeout(() => {
      navigation.replace('Login');
    }, 2000);

    return () => clearTimeout(timer);
  }, [navigation, fadeAnim, scaleAnim]);

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        <Animated.View
          style={[
            styles.logoContainer,
            {
              opacity: fadeAnim,
              transform: [{ scale: scaleAnim }],
            },
          ]}
        >
          <Text style={styles.logo}>📱</Text>
          <Text style={styles.appName}>SmartAttend</Text>
          <Text style={styles.appSubtitle}>Scanner</Text>
        </Animated.View>

        <Animated.View
          style={[
            styles.tagline,
            {
              opacity: fadeAnim,
            },
          ]}
        >
          <Text style={styles.taglineText}>Fast Mobile QR Attendance</Text>
        </Animated.View>

        <View style={styles.footer}>
          <Text style={styles.version}>v1.0.0</Text>
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.dark.background,
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: spacing.lg,
  },
  logoContainer: {
    alignItems: 'center',
    marginBottom: spacing.xl,
  },
  logo: {
    fontSize: 80,
    marginBottom: spacing.lg,
  },
  appName: {
    ...typography.title,
    color: colors.dark.text,
    textAlign: 'center',
  },
  appSubtitle: {
    ...typography.subtitle,
    color: colors.primary,
    textAlign: 'center',
    marginTop: spacing.sm,
  },
  tagline: {
    alignItems: 'center',
    marginTop: spacing.xl,
  },
  taglineText: {
    ...typography.body,
    color: colors.dark.textSecondary,
    textAlign: 'center',
  },
  footer: {
    position: 'absolute',
    bottom: spacing.xl,
    alignSelf: 'center',
  },
  version: {
    ...typography.label,
    color: colors.dark.textTertiary,
  },
});

