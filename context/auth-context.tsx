import { account } from '@/lib/appwrite';
import { createContext, useContext, useEffect, useState } from 'react';
import { ID, Models } from 'react-native-appwrite';

type AuthContextType = {
  user: Models.User<Models.Preferences> | null;
  isUserLoading: boolean;
  signUp: (email: string, password: string) => Promise<string | null>;
  signIn: (email: string, password: string) => Promise<string | null>;
  signOut: () => Promise<void>;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<Models.User<Models.Preferences> | null>(null);
  const [isUserLoading, setIsUserLoading] = useState(true);

  const signUp = async (email: string, password: string) => {
    try {
      await account.create({
        userId: ID.unique(),
        email: email,
        password: password,
      });
      console.log('user created');
      await signIn(email, password);
      return null;
    } catch (error) {
      if (error instanceof Error) return error.message;
      return 'An unknown error occurred';
    } finally {
      setIsUserLoading(false);
    }
  };

  const signIn = async (email: string, password: string) => {
    try {
      await account.createEmailPasswordSession({ email, password });
      setUser(await account.get());
      return null;
    } catch (error) {
      if (error instanceof Error) return error.message;
      return 'An unknown error occurred';
    } finally {
      setIsUserLoading(false);
    }
  };

  const signOut = async () => {
    try {
      await account.deleteSession({ sessionId: 'current' });
      setUser(null);
    } catch (error) {
      console.log(error);
    } finally {
      setIsUserLoading(false);
    }
  };

  const getUser = async () => {
    try {
      const user = await account.get();
      setUser(user);
      return null;
    } catch (error) {
      if (error instanceof Error) return error.message;
      return 'An unknown error occurred';
    } finally {
      setIsUserLoading(false);
    }
  };

  useEffect(() => {
    getUser();
  }, []);

  return (
    <AuthContext.Provider value={{ user, isUserLoading, signUp, signIn, signOut }}>{children}</AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
