import { Account, Client, Databases, TablesDB } from 'react-native-appwrite';

export const client = new Client()
  .setEndpoint(process.env.EXPO_PUBLIC_APPWRITE_ENDPOINT!)
  .setProject(process.env.EXPO_PUBLIC_APPWRITE_PROJECT_ID!)
  .setPlatform(process.env.EXPO_PUBLIC_APPWRITE_PLATFORM!);

export const account = new Account(client);
export const databases = new Databases(client);
export const tables = new TablesDB(client);

export const DATABASEID = process.env.EXPO_PUBLIC_APPWRITE_DB_ID!;
export const habitsTableId = 'habits';
