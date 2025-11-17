import { Models } from 'react-native-appwrite';

export interface Habit extends Models.Document {
  user_id: string;
  title: string;
  description: string;
  frequency: string;
  streak_count: number;
  last_completed: string;
  isCompletedToday?: boolean; // Added when fetching habits to show completion status
}

export interface HabitCompletion extends Models.Document {
  habit_id: string;
  user_id: string;
  completed_at: string;
}
