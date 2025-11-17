import { AuthProvider, useAuth } from '@/context/auth-context';
import { NAV_THEME } from '@/lib/theme';
import { ThemeProvider } from '@react-navigation/native';
import { PortalHost } from '@rn-primitives/portal';
import { Stack } from 'expo-router';
import { PropsWithChildren, useMemo } from 'react';
import { ActivityIndicator, useColorScheme, View } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import '../global.css';

const RootNavigator = () => {
  const { isUserLoading, user } = useAuth();

  // Show loading screen while checking user session
  if (isUserLoading) {
    return (
      <View className="flex-1 items-center justify-center bg-background">
        <ActivityIndicator color="#6200ee" size="large" />
      </View>
    );
  }

  return (
    <Stack screenOptions={{ headerTitleAlign: 'center' }}>
      <Stack.Protected guard={!!user}>
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
      </Stack.Protected>

      <Stack.Protected guard={!user}>
        <Stack.Screen name="auth" options={{ headerShown: false }} />
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
