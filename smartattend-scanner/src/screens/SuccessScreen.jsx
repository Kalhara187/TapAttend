import React, { useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
  Animated,
} from 'react-native';
import { Button } from '../components/UIComponents';
import { colors, typography, spacing, borderRadius } from '../config/theme';

export default function SuccessScreen({ navigation, route }) {
  const message = route.params?.message || 'Attendance recorded';
  const type = route.params?.type || 'unknown';
  const scaleAnim = useRef(new Animated.Value(0)).current;
  const opacityAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    // Animate in with scale and fade
    Animated.parallel([
      Animated.spring(scaleAnim, {
        toValue: 1,
        friction: 5,
        tension: 40,
        useNativeDriver: true,
      }),
      Animated.timing(opacityAnim, {
        toValue: 1,
        duration: 300,
        useNativeDriver: true,
      }),
    ]).start();

    // Auto navigate back after 3 seconds
    const timer = setTimeout(() => {
      navigation.replace('Scanner');
    }, 3000);

    return () => clearTimeout(timer);
  }, [navigation, scaleAnim, opacityAnim]);

  const getStatusIcon = () => {
    switch (type?.toLowerCase()) {
      case 'checkin':
        return '👋';
      case 'checkout':
        return '👋';
      default:
        return '✓';
    }
  };

  const getStatusTitle = () => {
    switch (type?.toLowerCase()) {
      case 'checkin':
        return 'Checked In';
      case 'checkout':
        return 'Checked Out';
      default:
        return 'Success';
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <Animated.View
        style={[
          styles.content,
          {
            transform: [{ scale: scaleAnim }],
            opacity: opacityAnim,
          },
        ]}
      >
        {/* Icon */}
        <View style={styles.iconContainer}>
          <Text style={styles.icon}>{getStatusIcon()}</Text>
        </View>

        {/* Title */}
        <Text style={styles.title}>{getStatusTitle()}</Text>

        {/* Message */}
        <Text style={styles.message}>{message}</Text>

        {/* Success Badge */}
        <View style={styles.badge}>
          <Text style={styles.badgeText}>✓ Attendance Recorded</Text>
        </View>

        {/* Time Display */}
        <View style={styles.timeContainer}>
          <Text style={styles.timeLabel}>Time</Text>
          <Text style={styles.time}>
            {new Date().toLocaleTimeString('en-US', {
              hour: '2-digit',
              minute: '2-digit',
              second: '2-digit',
              hour12: true,
            })}
          </Text>
        </View>

        {/* Details */}
        <View style={styles.detailsContainer}>
          <View style={styles.detailItem}>
            <Text style={styles.detailLabel}>Date</Text>
            <Text style={styles.detailValue}>
              {new Date().toLocaleDateString('en-US', {
                weekday: 'short',
                month: 'short',
                day: 'numeric',
                year: 'numeric',
              })}
            </Text>
          </View>
        </View>
      </Animated.View>

      {/* Button */}
      <View style={styles.footer}>
        <Text style={styles.footerHint}>Returning to scanner...</Text>
        <Button
          title="Scan Again"
          onPress={() => navigation.replace('Scanner')}
          size="lg"
        />
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
  iconContainer: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: colors.success,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: spacing.xl,
  },
  icon: {
    fontSize: 50,
  },
  title: {
    ...typography.title,
    color: colors.dark.text,
    textAlign: 'center',
    marginBottom: spacing.md,
  },
  message: {
    ...typography.body,
    color: colors.dark.textSecondary,
    textAlign: 'center',
    marginBottom: spacing.lg,
    lineHeight: 20,
  },
  badge: {
    backgroundColor: colors.success,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.lg,
    borderRadius: borderRadius.full,
    marginVertical: spacing.lg,
  },
  badgeText: {
    ...typography.label,
    color: '#fff',
    fontWeight: '700',
  },
  timeContainer: {
    alignItems: 'center',
    marginVertical: spacing.lg,
  },
  timeLabel: {
    ...typography.label,
    color: colors.dark.textSecondary,
    marginBottom: spacing.sm,
  },
  time: {
    ...typography.subtitle,
    color: colors.primary,
    fontWeight: '700',
    fontFamily: 'Courier New',
  },
  detailsContainer: {
    width: '100%',
    backgroundColor: colors.dark.card,
    borderRadius: borderRadius.lg,
    padding: spacing.lg,
    marginVertical: spacing.lg,
  },
  detailItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: spacing.md,
  },
  detailLabel: {
    ...typography.label,
    color: colors.dark.textSecondary,
  },
  detailValue: {
    ...typography.body,
    color: colors.dark.text,
    fontWeight: '600',
  },
  footer: {
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.lg,
    borderTopWidth: 1,
    borderTopColor: colors.dark.border,
  },
  footerHint: {
    ...typography.label,
    color: colors.dark.textTertiary,
    textAlign: 'center',
    marginBottom: spacing.md,
  },
});

