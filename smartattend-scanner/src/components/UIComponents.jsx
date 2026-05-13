import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
} from 'react-native';
import { colors, typography, spacing, borderRadius, shadows } from '../config/theme';

// Button Component
export function Button({
  title,
  onPress,
  loading = false,
  disabled = false,
  variant = 'primary',
  size = 'md',
  style,
  textStyle,
}) {
  const variants = {
    primary: styles.buttonPrimary,
    secondary: styles.buttonSecondary,
    danger: styles.buttonDanger,
  };

  const sizes = {
    sm: styles.buttonSm,
    md: styles.buttonMd,
    lg: styles.buttonLg,
  };

  return (
    <TouchableOpacity
      style={[
        styles.button,
        variants[variant],
        sizes[size],
        disabled && styles.buttonDisabled,
        style,
      ]}
      onPress={onPress}
      disabled={disabled || loading}
      activeOpacity={0.7}
    >
      {loading ? (
        <ActivityIndicator color={variant === 'primary' ? '#042027' : colors.primary} />
      ) : (
        <Text style={[styles.buttonText, textStyle]}>{title}</Text>
      )}
    </TouchableOpacity>
  );
}

// Input Component
export function Input({
  placeholder,
  value,
  onChangeText,
  secureTextEntry = false,
  keyboardType = 'default',
  editable = true,
  style,
  placeholderTextColor,
  error,
  label,
}) {
  return (
    <View style={styles.inputContainer}>
      {label && <Text style={styles.inputLabel}>{label}</Text>}
      <TextInput
        style={[styles.input, error && styles.inputError, style]}
        placeholder={placeholder}
        placeholderTextColor={placeholderTextColor || colors.dark.textTertiary}
        value={value}
        onChangeText={onChangeText}
        secureTextEntry={secureTextEntry}
        keyboardType={keyboardType}
        editable={editable}
      />
      {error && <Text style={styles.errorText}>{error}</Text>}
    </View>
  );
}

// Card Component
export function Card({ children, style, onPress }) {
  const Component = onPress ? TouchableOpacity : View;
  return (
    <Component style={[styles.card, style]} onPress={onPress} activeOpacity={0.8}>
      {children}
    </Component>
  );
}

// Badge Component
export function Badge({ text, type = 'default', style }) {
  const types = {
    default: styles.badgeDefault,
    success: styles.badgeSuccess,
    warning: styles.badgeWarning,
    error: styles.badgeError,
    info: styles.badgeInfo,
  };

  const textTypes = {
    default: styles.badgeDefaultText,
    success: styles.badgeSuccessText,
    warning: styles.badgeWarningText,
    error: styles.badgeErrorText,
    info: styles.badgeInfoText,
  };

  return (
    <View style={[styles.badge, types[type], style]}>
      <Text style={[styles.badgeText, textTypes[type]]}>{text}</Text>
    </View>
  );
}

// Loading Spinner
export function LoadingSpinner({ size = 'large', color = colors.primary }) {
  return (
    <View style={styles.spinnerContainer}>
      <ActivityIndicator size={size} color={color} />
    </View>
  );
}

// Empty State
export function EmptyState({ icon, title, message, action, actionLabel }) {
  return (
    <View style={styles.emptyContainer}>
      {icon && <Text style={styles.emptyIcon}>{icon}</Text>}
      <Text style={styles.emptyTitle}>{title}</Text>
      <Text style={styles.emptyMessage}>{message}</Text>
      {action && <Button title={actionLabel || 'Try Again'} onPress={action} />}
    </View>
  );
}

// Alert Component
export function Alert({ type = 'info', title, message, onClose }) {
  const types = {
    success: styles.alertSuccess,
    error: styles.alertError,
    warning: styles.alertWarning,
    info: styles.alertInfo,
  };

  const iconMap = {
    success: '✓',
    error: '✕',
    warning: '⚠',
    info: 'ℹ',
  };

  return (
    <View style={[styles.alert, types[type]]}>
      <Text style={styles.alertIcon}>{iconMap[type]}</Text>
      <View style={styles.alertContent}>
        {title && <Text style={styles.alertTitle}>{title}</Text>}
        {message && <Text style={styles.alertMessage}>{message}</Text>}
      </View>
      {onClose && (
        <TouchableOpacity onPress={onClose}>
          <Text style={styles.alertClose}>✕</Text>
        </TouchableOpacity>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  // Button Styles
  button: {
    borderRadius: borderRadius.md,
    justifyContent: 'center',
    alignItems: 'center',
    flexDirection: 'row',
    ...shadows.sm,
  },
  buttonPrimary: {
    backgroundColor: colors.primary,
  },
  buttonSecondary: {
    backgroundColor: colors.dark.card,
    borderWidth: 1,
    borderColor: colors.dark.border,
  },
  buttonDanger: {
    backgroundColor: colors.error,
  },
  buttonSm: {
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
  },
  buttonMd: {
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.lg,
  },
  buttonLg: {
    paddingVertical: spacing.lg,
    paddingHorizontal: spacing.xl,
  },
  buttonDisabled: {
    opacity: 0.5,
  },
  buttonText: {
    ...typography.body,
    fontWeight: '600',
    color: colors.dark.text,
  },

  // Input Styles
  inputContainer: {
    marginBottom: spacing.md,
  },
  inputLabel: {
    ...typography.label,
    color: colors.dark.text,
    marginBottom: spacing.sm,
  },
  input: {
    backgroundColor: colors.dark.card,
    borderWidth: 1,
    borderColor: colors.dark.border,
    borderRadius: borderRadius.md,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.lg,
    color: colors.dark.text,
    fontSize: 14,
  },
  inputError: {
    borderColor: colors.error,
  },
  errorText: {
    color: colors.error,
    fontSize: 12,
    marginTop: spacing.xs,
  },

  // Card Styles
  card: {
    backgroundColor: colors.dark.card,
    borderRadius: borderRadius.lg,
    padding: spacing.lg,
    borderWidth: 1,
    borderColor: colors.dark.border,
    ...shadows.md,
  },

  // Badge Styles
  badge: {
    paddingVertical: spacing.xs,
    paddingHorizontal: spacing.md,
    borderRadius: borderRadius.full,
    alignSelf: 'flex-start',
  },
  badgeDefault: {
    backgroundColor: colors.dark.card,
  },
  badgeSuccess: {
    backgroundColor: colors.success,
  },
  badgeWarning: {
    backgroundColor: colors.warning,
  },
  badgeError: {
    backgroundColor: colors.error,
  },
  badgeInfo: {
    backgroundColor: colors.primary,
  },
  badgeText: {
    fontSize: 12,
    fontWeight: '600',
  },
  badgeDefaultText: {
    color: colors.dark.text,
  },
  badgeSuccessText: {
    color: '#fff',
  },
  badgeWarningText: {
    color: '#fff',
  },
  badgeErrorText: {
    color: '#fff',
  },
  badgeInfoText: {
    color: '#fff',
  },

  // Spinner Styles
  spinnerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },

  // Empty State Styles
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: spacing.lg,
  },
  emptyIcon: {
    fontSize: 48,
    marginBottom: spacing.md,
  },
  emptyTitle: {
    ...typography.heading,
    color: colors.dark.text,
    textAlign: 'center',
    marginBottom: spacing.sm,
  },
  emptyMessage: {
    ...typography.body,
    color: colors.dark.textSecondary,
    textAlign: 'center',
    marginBottom: spacing.lg,
  },

  // Alert Styles
  alert: {
    flexDirection: 'row',
    padding: spacing.lg,
    borderRadius: borderRadius.md,
    marginBottom: spacing.md,
    alignItems: 'flex-start',
  },
  alertSuccess: {
    backgroundColor: '#dcfce7',
    borderLeftWidth: 4,
    borderLeftColor: colors.success,
  },
  alertError: {
    backgroundColor: '#fee2e2',
    borderLeftWidth: 4,
    borderLeftColor: colors.error,
  },
  alertWarning: {
    backgroundColor: '#fef3c7',
    borderLeftWidth: 4,
    borderLeftColor: colors.warning,
  },
  alertInfo: {
    backgroundColor: '#cffafe',
    borderLeftWidth: 4,
    borderLeftColor: colors.primary,
  },
  alertIcon: {
    fontSize: 20,
    marginRight: spacing.md,
  },
  alertContent: {
    flex: 1,
  },
  alertTitle: {
    ...typography.label,
    fontWeight: '600',
    color: colors.dark.text,
    marginBottom: spacing.xs,
  },
  alertMessage: {
    ...typography.label,
    color: colors.dark.textSecondary,
  },
  alertClose: {
    fontSize: 16,
    color: colors.dark.textSecondary,
    marginLeft: spacing.md,
  },
});
