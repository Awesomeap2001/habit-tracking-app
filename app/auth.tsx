import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Text } from '@/components/ui/text';
import { useAuth } from '@/context/auth-context';
import { router } from 'expo-router';
import React from 'react';
import { KeyboardAvoidingView, Platform, Pressable, type TextInput, View } from 'react-native';

const Auth = () => {
  const passwordInputRef = React.useRef<TextInput>(null);
  const [isSignIn, setIsSignIn] = React.useState(true);
  const [user, setUser] = React.useState<{ email: string; password: string }>({ email: '', password: '' });
  const [error, setError] = React.useState<string | null>(null);
  const { signIn, signUp } = useAuth();

  const handleChange = (key: 'email' | 'password', value: string) => {
    setUser({ ...user, [key]: value });
  };

  function onEmailSubmitEditing() {
    passwordInputRef.current?.focus();
  }

  const validateForm = () => {
    if (user.email === '' || user.password === '') {
      setError('Please fill in all fields');
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(user.email)) {
      setError('Please enter a valid email');
    } else if (user.password.length < 8) {
      setError('Password must be at least 8 characters long');
    } else {
      setError(null);
    }
    return !error ? true : false;
  };

  async function onSubmit() {
    if (!validateForm()) return;

    if (isSignIn) {
      const error = await signIn(user.email, user.password);
      if (error) {
        setError(error);
        return;
      }
    } else {
      const error = await signUp(user.email, user.password);
      if (error) {
        setError(error);
        return;
      }
    }
    router.replace('/');
  }

  return (
    <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} className="flex-1">
      <View className="gap-6 justify-center flex-1">
        <Card className="border-border/0 sm:border-border shadow-none sm:shadow-sm sm:shadow-black/5">
          <CardHeader>
            <CardTitle className="text-center text-xl sm:text-left">
              {isSignIn ? 'Sign in to Habit Tracker' : 'Create your account'}
            </CardTitle>
            <CardDescription className="text-center sm:text-left">
              {isSignIn
                ? 'Welcome back! Please sign in to continue'
                : 'Welcome! Please fill in the details to get started with Habit Tracker.'}
            </CardDescription>
          </CardHeader>
          <CardContent className="gap-6">
            <View className="gap-6">
              <View className="gap-1.5">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  placeholder="email@example.com"
                  keyboardType="email-address"
                  autoComplete="email"
                  autoCapitalize="none"
                  onSubmitEditing={onEmailSubmitEditing}
                  returnKeyType="next"
                  submitBehavior="submit"
                  value={user?.email}
                  onChangeText={(text) => handleChange('email', text)}
                />
              </View>
              <View className="gap-1.5">
                <Label htmlFor="password">Password</Label>
                <Input
                  ref={passwordInputRef}
                  id="password"
                  secureTextEntry
                  returnKeyType="send"
                  onSubmitEditing={onSubmit}
                  value={user?.password}
                  onChangeText={(text) => handleChange('password', text)}
                />
              </View>

              {error && <Text className="text-red-500 text-center text-sm">{error}</Text>}

              <Button className="w-full bg-violet-700  active:bg-violet-600" onPress={onSubmit}>
                <Text>{isSignIn ? 'Sign in' : 'Sign up'}</Text>
              </Button>
            </View>
            <View className="flex-row items-center justify-center">
              <Text className="text-center text-sm">Don&apos;t have an account? </Text>
              <Pressable onPress={() => setIsSignIn(!isSignIn)}>
                <Text className="text-sm underline underline-offset-4">{isSignIn ? 'Sign up' : 'Sign in'}</Text>
              </Pressable>
            </View>
          </CardContent>
        </Card>
      </View>
    </KeyboardAvoidingView>
  );
};

export default Auth;
