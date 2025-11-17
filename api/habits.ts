import { DATABASEID, habitsTableId, habitCompletionsTableId, tables } from '@/lib/appwrite';
import { Habit } from '@/types/database.type';
import { Query } from 'react-native-appwrite';

export interface ListRowsResponse {
  rows: Habit[];
  total: number;
}

export interface HabitStatistics {
  totalHabits: number;
  totalCompletions: number;
  highestStreakHabit: Habit | null;
  mostCompletedHabit: {
    habit: Habit;
    completionCount: number;
  } | null;
  habitsByStreak: Habit[];
}

export const habitsApi = {
  getHabits: async (userId: string): Promise<ListRowsResponse> => {
    const data = await tables.listRows({
      databaseId: DATABASEID,
      tableId: habitsTableId,
      queries: [Query.equal('user_id', userId)],
    });

    const habits = data.rows as unknown as Habit[];
    const currentDate = new Date();

    // Check completion status for each habit
    const habitsWithCompletionStatus = await Promise.all(
      habits.map(async (habit) => {
        const isCompleted = await checkIfAlreadyCompleted(habit.$id, userId, currentDate, habit.frequency);
        return {
          ...habit,
          isCompletedToday: isCompleted,
        };
      })
    );

    return {
      rows: habitsWithCompletionStatus,
      total: data.total,
    };
  },

  createHabit: async (habitData: {
    user_id: string;
    title: string;
    description: string;
    frequency: string;
    streak_count: number;
    last_completed: string;
  }): Promise<Habit> => {
    const data = await tables.createRow({
      databaseId: DATABASEID,
      tableId: habitsTableId,
      rowId: 'unique()',
      data: habitData,
    });
    return data as unknown as Habit;
  },

  deleteHabit: async (habitId: string): Promise<void> => {
    // Step 1: Delete all habit completions for this habit
    const completions = await tables.listRows({
      databaseId: DATABASEID,
      tableId: habitCompletionsTableId,
      queries: [Query.equal('habit_id', habitId)],
    });

    // Delete each completion row
    await Promise.all(
      completions.rows.map((completion) =>
        tables.deleteRow({
          databaseId: DATABASEID,
          tableId: habitCompletionsTableId,
          rowId: completion.$id,
        })
      )
    );

    // Step 2: Delete the habit itself
    await tables.deleteRow({
      databaseId: DATABASEID,
      tableId: habitsTableId,
      rowId: habitId,
    });
  },

  completeHabit: async (habitId: string, userId: string): Promise<void> => {
    const completedAt = new Date().toISOString();
    const currentDate = new Date(completedAt);

    // Step 1: Fetch the habit to get frequency and check for spam
    const habitData = await tables.getRow({
      databaseId: DATABASEID,
      tableId: habitsTableId,
      rowId: habitId,
    });
    const habit = habitData as unknown as Habit;

    // Step 2: Check if user is spamming (already completed in current period)
    const alreadyCompleted = await checkIfAlreadyCompleted(habitId, userId, currentDate, habit.frequency);

    if (alreadyCompleted) {
      throw new Error(`Habit already completed for this ${habit.frequency} period`);
    }

    // Step 3: Create a new entry in habit_completions table
    await tables.createRow({
      databaseId: DATABASEID,
      tableId: habitCompletionsTableId,
      rowId: 'unique()',
      data: {
        habit_id: habitId,
        user_id: userId,
        completed_at: completedAt,
      },
    });

    // Step 4: Calculate the new streak based on frequency
    const newStreak = calculateStreak(habit.last_completed, completedAt, habit.streak_count, habit.frequency);

    // Step 5: Update the habit with new streak and last_completed
    await tables.updateRow({
      databaseId: DATABASEID,
      tableId: habitsTableId,
      rowId: habitId,
      data: {
        streak_count: newStreak,
        last_completed: completedAt,
      },
    });
  },

  getHabitStatistics: async (userId: string): Promise<HabitStatistics> => {
    // Get all habits
    const habitsData = await tables.listRows({
      databaseId: DATABASEID,
      tableId: habitsTableId,
      queries: [Query.equal('user_id', userId)],
    });
    const habits = habitsData.rows as unknown as Habit[];

    // Get all completions for this user
    const completionsData = await tables.listRows({
      databaseId: DATABASEID,
      tableId: habitCompletionsTableId,
      queries: [Query.equal('user_id', userId)],
    });
    const completions = completionsData.rows as unknown as { habit_id: string }[];

    // Calculate statistics
    const totalHabits = habits.length;
    const totalCompletions = completions.length;

    // Find habit with highest streak
    const highestStreakHabit =
      habits.length > 0 ? habits.reduce((max, habit) => (habit.streak_count > max.streak_count ? habit : max)) : null;

    // Count completions per habit
    const completionCounts = new Map<string, number>();
    completions.forEach((completion) => {
      const count = completionCounts.get(completion.habit_id) || 0;
      completionCounts.set(completion.habit_id, count + 1);
    });

    // Find most completed habit
    let mostCompletedHabit: { habit: Habit; completionCount: number } | null = null;
    let maxCompletions = 0;

    habits.forEach((habit) => {
      const count = completionCounts.get(habit.$id) || 0;
      if (count > maxCompletions) {
        maxCompletions = count;
        mostCompletedHabit = { habit, completionCount: count };
      }
    });

    // Sort habits by streak (descending)
    const habitsByStreak = [...habits].sort((a, b) => b.streak_count - a.streak_count);

    return {
      totalHabits,
      totalCompletions,
      highestStreakHabit,
      mostCompletedHabit,
      habitsByStreak,
    };
  },
};

async function checkIfAlreadyCompleted(
  habitId: string,
  userId: string,
  currentDate: Date,
  frequency: string
): Promise<boolean> {
  let startDate: Date;
  let endDate: Date = new Date(currentDate);

  // Set end date to end of current period
  endDate.setHours(23, 59, 59, 999);

  // Calculate start date based on frequency
  if (frequency === 'daily') {
    startDate = new Date(currentDate);
    startDate.setHours(0, 0, 0, 0);
  } else if (frequency === 'weekly') {
    // Start of current week (Sunday)
    startDate = new Date(currentDate);
    const day = startDate.getDay();
    const diff = startDate.getDate() - day;
    startDate.setDate(diff);
    startDate.setHours(0, 0, 0, 0);
  } else if (frequency === 'monthly') {
    // Start of current month
    startDate = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1);
    startDate.setHours(0, 0, 0, 0);
  } else {
    // Default to daily
    startDate = new Date(currentDate);
    startDate.setHours(0, 0, 0, 0);
  }

  // Query for completions in the current period
  const completions = await tables.listRows({
    databaseId: DATABASEID,
    tableId: habitCompletionsTableId,
    queries: [
      Query.equal('habit_id', habitId),
      Query.equal('user_id', userId),
      Query.greaterThanEqual('completed_at', startDate.toISOString()),
      Query.lessThanEqual('completed_at', endDate.toISOString()),
    ],
  });
  return completions.total > 0;
}

function calculateStreak(
  lastCompleted: string,
  currentCompleted: string,
  currentStreak: number,
  frequency: string
): number {
  // If no previous completion (null or empty string), this is the first completion
  if (!lastCompleted || lastCompleted.trim() === '') {
    return 1;
  }

  const lastDate = new Date(lastCompleted);
  const currentDate = new Date(currentCompleted);

  if (frequency === 'daily') {
    return calculateDailyStreak(lastDate, currentDate, currentStreak);
  } else if (frequency === 'weekly') {
    return calculateWeeklyStreak(lastDate, currentDate, currentStreak);
  } else if (frequency === 'monthly') {
    return calculateMonthlyStreak(lastDate, currentDate, currentStreak);
  } else {
    // Default to daily
    return calculateDailyStreak(lastDate, currentDate, currentStreak);
  }
}

function calculateDailyStreak(lastDate: Date, currentDate: Date, currentStreak: number): number {
  lastDate.setHours(0, 0, 0, 0);
  currentDate.setHours(0, 0, 0, 0);

  const daysDifference = Math.floor((currentDate.getTime() - lastDate.getTime()) / (1000 * 60 * 60 * 24));

  if (daysDifference === 0) {
    return currentStreak; // Same day
  } else if (daysDifference === 1) {
    return currentStreak + 1; // Consecutive day
  } else {
    return 1; // Gap in days, reset streak
  }
}

function calculateWeeklyStreak(lastDate: Date, currentDate: Date, currentStreak: number): number {
  // Get the week number and year for both dates
  const lastWeek = getWeekNumber(lastDate);
  const currentWeek = getWeekNumber(currentDate);
  const lastYear = lastDate.getFullYear();
  const currentYear = currentDate.getFullYear();

  // Check if consecutive weeks
  if (lastYear === currentYear) {
    if (currentWeek === lastWeek) {
      return currentStreak; // Same week
    } else if (currentWeek === lastWeek + 1) {
      return currentStreak + 1; // Consecutive week
    }
  } else if (currentYear === lastYear + 1 && currentWeek === 1 && lastWeek === 52) {
    // Week 1 of next year after week 52 of previous year
    return currentStreak + 1;
  }

  return 1; // Gap in weeks, reset streak
}

function calculateMonthlyStreak(lastDate: Date, currentDate: Date, currentStreak: number): number {
  const lastMonth = lastDate.getMonth();
  const currentMonth = currentDate.getMonth();
  const lastYear = lastDate.getFullYear();
  const currentYear = currentDate.getFullYear();

  if (lastYear === currentYear) {
    if (currentMonth === lastMonth) {
      return currentStreak; // Same month
    } else if (currentMonth === lastMonth + 1) {
      return currentStreak + 1; // Consecutive month
    }
  } else if (currentYear === lastYear + 1 && currentMonth === 0 && lastMonth === 11) {
    // January of next year after December of previous year
    return currentStreak + 1;
  }

  return 1; // Gap in months, reset streak
}

function getWeekNumber(date: Date): number {
  const d = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
  const dayNum = d.getUTCDay() || 7;
  d.setUTCDate(d.getUTCDate() + 4 - dayNum);
  const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
  return Math.ceil(((d.getTime() - yearStart.getTime()) / 86400000 + 1) / 7);
}
