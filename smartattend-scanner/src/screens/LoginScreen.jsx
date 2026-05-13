import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  Alert,
  Dimensions,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useAuth } from '../context/AuthContext';
import { Input, Button, Alert as UIAlert } from '../components/UIComponents';
import { colors, typography, spacing, borderRadius } from '../config/theme';
import { validateUsername, validatePassword, getErrorMessage } from '../utils/helpers';

const { height } = Dimensions.get('window');

export default function LoginScreen({ navigation }) {
  const { state, authContext } = useAuth();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const [showAlert, setShowAlert] = useState(false);
  const [alertMessage, setAlertMessage] = useState('');
  const [rememberMe, setRememberMe] = useState(false);

  // Load saved credentials if remember me was enabled
  useEffect(() => {
    const loadCredentials = async () => {
      try {
        const savedUsername = await AsyncStorage.getItem('smartattend_remember_username');
        const savedRemember = await AsyncStorage.getItem('smartattend_remember_me');
        
        if (savedUsername && savedRemember === 'true') {
          setUsername(savedUsername);
          setRememberMe(true);
        }
      } catch (e) {
        console.error('Error loading credentials:', e);
      }
    };

    loadCredentials();
  }, []);

  function validateForm() {
    const newErrors = {};
    const usernameError = validateUsername(username);
    const passwordError = validatePassword(password);

    if (usernameError) newErrors.username = usernameError;
    if (passwordError) newErrors.password = passwordError;

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }

  async function handleLogin() {
    if (!validateForm()) return;

    setLoading(true);
    setShowAlert(false);

    try {
      await authContext.signIn(username, password);
      
      // Save credentials if remember me is enabled
      if (rememberMe) {
        await AsyncStorage.setItem('smartattend_remember_username', username);
        await AsyncStorage.setItem('smartattend_remember_me', 'true');
      } else {
        await AsyncStorage.removeItem('smartattend_remember_username');
        await AsyncStorage.removeItem('smartattend_remember_me');
      }

      navigation.replace('Scanner');
    } catch (error) {
      const message = getErrorMessage(error);
      setAlertMessage(message);
      setShowAlert(true);
      console.error('Login error:', error);
    } finally {
      setLoading(false);
    }
  }

  return (
    <SafeAreaView style={styles.safeContainer}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.container}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          {/* Header */}
          <View style={styles.header}>
            <Text style={styles.headerIcon}>📱</Text>
            <Text style={styles.headerTitle}>Welcome Back</Text>
            <Text style={styles.headerSubtitle}>
              Sign in to your SmartAttend account
            </Text>
          </View>

          {/* Alert */}
          {showAlert && (
            <UIAlert
              type="error"
              message={alertMessage}
              onClose={() => setShowAlert(false)}
            />
          )}

          {/* Form */}
          <View style={styles.form}>
            <Input
              label="Username or Email"
              placeholder="Enter your username"
              value={username}
              onChangeText={(text) => {
                setUsername(text);
                if (errors.username) setErrors({ ...errors, username: '' });
              }}
              error={errors.username}
              editable={!loading}
              placeholderTextColor={colors.dark.textTertiary}
            />

            <Input
              label="Password"
              placeholder="Enter your password"
              value={password}
              onChangeText={(text) => {
                setPassword(text);
                if (errors.password) setErrors({ ...errors, password: '' });
              }}
              secureTextEntry
              error={errors.password}
              editable={!loading}
              placeholderTextColor={colors.dark.textTertiary}
            />

            {/* Remember Me */}
            <View style={styles.rememberContainer}>
              <Text 
                style={styles.rememberText}
                onPress={() => setRememberMe(!rememberMe)}
              >
                {rememberMe ? '☑' : '☐'} Remember me
              </Text>
            </View>

            {/* Login Button */}
            <Button
              title={loading ? 'Signing in...' : 'Sign In'}
              onPress={handleLogin}
              loading={loading}
              disabled={loading}
              size="lg"
              style={styles.loginButton}
            />
          </View>

          {/* Footer */}
          <View style={styles.footer}>
            <Text style={styles.footerText}>Demo Account</Text>
            <Text style={styles.credentials}>Username: employee1</Text>
            <Text style={styles.credentials}>Password: password</Text>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeContainer: {
    flex: 1,
    backgroundColor: colors.dark.background,
  },
  container: {
    flex: 1,
    backgroundColor: colors.dark.background,
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: 'space-between',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.xl,
  },
  header: {
    alignItems: 'center',
    marginBottom: spacing.xl,
    marginTop: spacing.lg,
  },
  headerIcon: {
    fontSize: 64,
    marginBottom: spacing.md,
  },
  headerTitle: {
    ...typography.title,
    color: colors.dark.text,
    textAlign: 'center',
    marginBottom: spacing.sm,
  },
  headerSubtitle: {
    ...typography.body,
    color: colors.dark.textSecondary,
    textAlign: 'center',
  },
  form: {
    marginVertical: spacing.xl,
  },
  rememberContainer: {
    marginBottom: spacing.lg,
    marginTop: spacing.sm,
  },
  rememberText: {
    ...typography.body,
    color: colors.dark.text,
  },
  loginButton: {
    marginTop: spacing.lg,
  },
  footer: {
    alignItems: 'center',
    paddingVertical: spacing.lg,
    borderTopWidth: 1,
    borderTopColor: colors.dark.border,
  },
  footerText: {
    ...typography.label,
    color: colors.dark.textSecondary,
    marginBottom: spacing.sm,
  },
  credentials: {
    ...typography.label,
    color: colors.dark.textTertiary,
    marginVertical: spacing.xs,
    fontFamily: 'Courier New',
  },
});

