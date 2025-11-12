import { AuthProvider, useAuth } from '@/context/auth-context';
import { NAV_THEME } from '@/lib/theme';
import { ThemeProvider } from '@react-navigation/native';
import { PortalHost } from '@rn-primitives/portal';
import { Stack } from 'expo-router';
import React from 'react';
import { Appearance } from 'react-native';
import '../global.css';

export default function RootLayout() {
  const { user } = useAuth();

  // Set the color scheme to light by default
  Appearance.setColorScheme('light');
  const theme = Appearance.getColorScheme() === 'dark' ? NAV_THEME.dark : NAV_THEME.light;

  return (
    <AuthProvider>
      <ThemeProvider value={theme}>
        <Stack screenOptions={{ headerTitleAlign: 'center' }}>
          <Stack.Protected guard={!!user}>
            <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
          </Stack.Protected>

          <Stack.Protected guard={!user}>
            <Stack.Screen name="auth" />
          </Stack.Protected>
        </Stack>
        <PortalHost />
      </ThemeProvider>
    </AuthProvider>
  );
}
