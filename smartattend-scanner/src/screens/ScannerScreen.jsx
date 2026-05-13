import React, { useEffect, useRef, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Vibration,
  Alert,
  SafeAreaView,
  Dimensions,
  Animated,
} from 'react-native';
import { Camera } from 'expo-camera';
import { Audio } from 'expo-av';
import { useAuth } from '../context/AuthContext';
import { Button, Alert as UIAlert } from '../components/UIComponents';
import api from '../services/api';
import { colors, typography, spacing, borderRadius } from '../config/theme';
import {
  formatTime,
  getErrorMessage,
  SCAN_DEBOUNCE_TIME,
  VIBRATION_DURATION,
} from '../utils/helpers';

const { width, height } = Dimensions.get('window');

export default function ScannerScreen({ navigation }) {
  const { state, authContext } = useAuth();
  const [hasPermission, setHasPermission] = useState(null);
  const [scanned, setScanned] = useState(false);
  const [loading, setLoading] = useState(false);
  const [lastScanTime, setLastScanTime] = useState(0);
  const [attendanceStatus, setAttendanceStatus] = useState(null);
  const [showAlert, setShowAlert] = useState(false);
  const [alertType, setAlertType] = useState('info');
  const [alertMessage, setAlertMessage] = useState('');
  const cameraRef = useRef(null);
  const soundRef = useRef(null);
  const focusAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    (async () => {
      const { status } = await Camera.requestCameraPermissionsAsync();
      setHasPermission(status === 'granted');

      if (status !== 'granted') {
        setAlertType('error');
        setAlertMessage('Camera permission is required to scan QR codes');
        setShowAlert(true);
      }
    })();

    return () => {
      if (soundRef.current) {
        soundRef.current.unloadAsync?.();
      }
    };
  }, []);

  async function playSuccessSound() {
    try {
      const { sound } = await Audio.Sound.createAsync(
        require('../../assets/success.wav')
      );
      soundRef.current = sound;
      await sound.playAsync();
    } catch (e) {
      console.error('Error playing sound:', e);
    }
  }

  function animateFocus() {
    focusAnim.setValue(0);
    Animated.timing(focusAnim, {
      toValue: 1,
      duration: 500,
      useNativeDriver: true,
    }).start();
  }

  async function submitScan(qrToken) {
    const now = Date.now();

    // Debounce scans
    if (now - lastScanTime < SCAN_DEBOUNCE_TIME) {
      return;
    }

    setLastScanTime(now);
    setLoading(true);

    try {
      const res = await api.post('/attendance/scan', { qrToken });
      const data = res.data;

      // Play sound and vibrate
      Vibration.vibrate(VIBRATION_DURATION);
      playSuccessSound();

      // Animate focus
      animateFocus();

      // Update attendance status
      setAttendanceStatus(data.type);

      // Show success message
      setAlertType('success');
      setAlertMessage(data.message || 'Attendance recorded successfully');
      setShowAlert(true);

      // Navigate to success screen after brief delay
      setTimeout(() => {
        navigation.navigate('Success', {
          message: data.message,
          type: data.type,
        });
      }, 800);
    } catch (error) {
      const message = getErrorMessage(error);

      Vibration.vibrate([200, 100, 200]); // Double vibration for error

      setAlertType('error');
      setAlertMessage(message);
      setShowAlert(true);

      console.error('Scan error:', error);
    } finally {
      setLoading(false);
      setScanned(false);
    }
  }

  function handleBarCodeScanned({ data, type }) {
    if (scanned || loading) return;

    setScanned(true);
    submitScan(data);
  }

  if (hasPermission === null) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.centerContainer}>
          <Text style={styles.permissionText}>Requesting camera permission...</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (hasPermission === false) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.centerContainer}>
          <Text style={styles.errorText}>❌ Camera access denied</Text>
          <Text style={styles.errorSubtext}>
            Please enable camera permissions in your device settings
          </Text>
          <Button
            title="Open Settings"
            onPress={() => Alert.alert('Settings', 'Please enable camera in app settings')}
            style={styles.settingsButton}
          />
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      {/* Camera */}
      <View style={styles.cameraContainer}>
        <Camera
          style={styles.camera}
          type={Camera.Constants.Type.back}
          onBarCodeScanned={handleBarCodeScanned}
          ref={cameraRef}
          barCodeScannerSettings={{
            barCodeTypes: [Camera.Constants.BarCodeType.qr],
          }}
        />

        {/* Scan Focus Animation */}
        <Animated.View
          style={[
            styles.scanOverlay,
            {
              opacity: focusAnim.interpolate({
                inputRange: [0, 0.5, 1],
                outputRange: [0, 1, 0],
              }),
            },
          ]}
        >
          <View style={styles.scanFrame} />
        </Animated.View>

        {/* Scan Frame */}
        <View style={styles.frameContainer}>
          <View style={styles.frame} />
          <Text style={styles.frameHint}>
            {scanned ? '🔄 Processing...' : 'Align QR code here'}
          </Text>
        </View>

        {/* Loading Indicator */}
        {loading && (
          <View style={styles.loadingContainer}>
            <Text style={styles.loadingText}>Scanning...</Text>
          </View>
        )}
      </View>

      {/* Alert */}
      {showAlert && (
        <View style={styles.alertContainer}>
          <UIAlert
            type={alertType}
            message={alertMessage}
            onClose={() => setShowAlert(false)}
          />
        </View>
      )}

      {/* Attendance Status */}
      {attendanceStatus && (
        <View style={styles.statusBar}>
          <Text style={styles.statusText}>
            {attendanceStatus === 'checkin'
              ? '✓ Checked In'
              : attendanceStatus === 'checkout'
              ? '✓ Checked Out'
              : attendanceStatus}
          </Text>
        </View>
      )}

      {/* Footer */}
      <View style={styles.footer}>
        <View style={styles.footerContent}>
          <Text style={styles.footerLabel}>Logged in as</Text>
          <Text style={styles.userName}>{state.user?.username || 'User'}</Text>
        </View>

        <Button
          title="Sign Out"
          onPress={() => {
            Alert.alert('Sign Out', 'Are you sure you want to sign out?', [
              { text: 'Cancel' },
              {
                text: 'Sign Out',
                onPress: () => authContext.signOut(),
              },
            ]);
          }}
          variant="secondary"
          size="sm"
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
  cameraContainer: {
    flex: 1,
    position: 'relative',
  },
  camera: {
    flex: 1,
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: spacing.lg,
  },
  permissionText: {
    ...typography.body,
    color: colors.dark.textSecondary,
    textAlign: 'center',
  },
  errorText: {
    ...typography.heading,
    color: colors.error,
    textAlign: 'center',
    marginBottom: spacing.md,
  },
  errorSubtext: {
    ...typography.body,
    color: colors.dark.textSecondary,
    textAlign: 'center',
    marginBottom: spacing.lg,
  },
  settingsButton: {
    marginTop: spacing.lg,
  },
  scanOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(6, 182, 212, 0.15)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  scanFrame: {
    width: 250,
    height: 250,
    borderRadius: borderRadius.lg,
    borderWidth: 3,
    borderColor: colors.primary,
  },
  frameContainer: {
    position: 'absolute',
    top: '50%',
    left: '50%',
    transform: [{ translateX: -125 }, { translateY: -125 }],
    alignItems: 'center',
  },
  frame: {
    width: 250,
    height: 250,
    borderRadius: borderRadius.lg,
    borderWidth: 3,
    borderColor: colors.primary,
    backgroundColor: 'rgba(6, 182, 212, 0.05)',
  },
  frameHint: {
    marginTop: spacing.lg,
    ...typography.label,
    color: colors.primary,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: borderRadius.md,
  },
  loadingContainer: {
    position: 'absolute',
    bottom: 120,
    left: 0,
    right: 0,
    alignItems: 'center',
  },
  loadingText: {
    ...typography.body,
    color: colors.primary,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    borderRadius: borderRadius.md,
    fontWeight: '600',
  },
  alertContainer: {
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
  },
  statusBar: {
    backgroundColor: colors.success,
    paddingVertical: spacing.md,
    justifyContent: 'center',
    alignItems: 'center',
  },
  statusText: {
    ...typography.heading,
    color: '#fff',
    fontWeight: '700',
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.lg,
    backgroundColor: colors.dark.card,
    borderTopWidth: 1,
    borderTopColor: colors.dark.border,
  },
  footerContent: {
    flex: 1,
  },
  footerLabel: {
    ...typography.label,
    color: colors.dark.textTertiary,
    marginBottom: spacing.xs,
  },
  userName: {
    ...typography.heading,
    color: colors.dark.text,
    fontWeight: '600',
  },
});

