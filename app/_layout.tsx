import { AuthProvider, useAuth } from '@/context/auth-context';
import { NAV_THEME } from '@/lib/theme';
import { ThemeProvider } from '@react-navigation/native';
import { PortalHost } from '@rn-primitives/portal';
import { Stack } from 'expo-router';
import React, { PropsWithChildren, useMemo } from 'react';
import { useColorScheme } from 'react-native';
import '../global.css';
import { SafeAreaProvider } from 'react-native-safe-area-context';

const RootNavigator = () => {
  const { user } = useAuth();

  return (
    <Stack screenOptions={{ headerTitleAlign: 'center' }}>
      <Stack.Protected guard={!!user}>
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
      </Stack.Protected>

      <Stack.Protected guard={!user}>
        <Stack.Screen name="auth" />
      </Stack.Protected>
    </Stack>
  );
};

const Providers = ({ children }: PropsWithChildren) => {
  const colorScheme = useColorScheme();
  const theme = useMemo(() => (colorScheme === 'dark' ? NAV_THEME.dark : NAV_THEME.light), [colorScheme]);

  return (
    <AuthProvider>
      <ThemeProvider value={theme}>
        <SafeAreaProvider>{children}</SafeAreaProvider>
        <PortalHost />
      </ThemeProvider>
    </AuthProvider>
  );
};

export default function RootLayout() {
  return (
    <Providers>
      <RootNavigator />
    </Providers>
  );
}
