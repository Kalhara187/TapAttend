import React, { useEffect } from 'react';
import { StatusBar } from 'expo-status-bar';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import SplashScreen from './src/screens/SplashScreen';
import LoginScreen from './src/screens/LoginScreen';
import ScannerScreen from './src/screens/ScannerScreen';
import SuccessScreen from './src/screens/SuccessScreen';
import { AuthProvider, useAuth } from './src/context/AuthContext';
import { colors } from './src/config/theme';

const Stack = createNativeStackNavigator();

function RootNavigator() {
  const { state } = useAuth();

  if (state.isLoading) {
    return <SplashScreen navigation={{ replace: () => {} }} />;
  }

  return (
    <Stack.Navigator
      initialRouteName={state.isLoggedIn ? 'Scanner' : 'Splash'}
      screenOptions={{
        headerShown: false,
        cardStyle: { backgroundColor: colors.dark.background },
        animationEnabled: true,
      }}
    >
      {!state.isLoggedIn ? (
        <>
          <Stack.Screen
            name="Splash"
            component={SplashScreen}
            options={{
              animationEnabled: false,
            }}
          />
          <Stack.Screen
            name="Login"
            component={LoginScreen}
            options={{
              animationEnabled: true,
            }}
          />
        </>
      ) : (
        <>
          <Stack.Screen
            name="Scanner"
            component={ScannerScreen}
            options={{
              animationEnabled: true,
            }}
          />
          <Stack.Screen
            name="Success"
            component={SuccessScreen}
            options={{
              animationEnabled: true,
            }}
          />
        </>
      )}
    </Stack.Navigator>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <NavigationContainer>
        <RootNavigator />
      </NavigationContainer>
      <StatusBar barStyle="light-content" translucent backgroundColor="transparent" />
    </AuthProvider>
  );
}

