import { View, ScrollView, ActivityIndicator } from 'react-native';
import React from 'react';
import { useAuth } from '@/context/auth-context';
import { habitsApi } from '@/api/habits';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent } from '@/components/ui/card';
import { Text } from '@/components/ui/text';
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';

export default function Statistics() {
  const { user } = useAuth();

  const {
    data: statistics,
    isLoading,
    error,
  } = useQuery({
    queryKey: ['habit-statistics', user?.$id],
    queryFn: () => habitsApi.getHabitStatistics(user?.$id ?? ''),
    enabled: !!user?.$id,
  });

  return (
    <View className="flex-1 gap-4">
      <View className="flex-row items-center justify-between px-5">
        <Text className="text-violet-700 text-2xl font-bold">Your Statistics</Text>
      </View>

      {isLoading ? (
        <View className="flex-1 justify-center items-center">
          <ActivityIndicator size="large" color="#6200ee" />
        </View>
      ) : error ? (
        <View className="flex-1 justify-center items-center px-5">
          <MaterialCommunityIcons name="alert-circle-outline" size={80} color="#dc2626" />
          <Text className="text-red-600 mt-4 text-center">
            {error instanceof Error ? error.message : 'Failed to load statistics'}
          </Text>
        </View>
      ) : !statistics || statistics.totalHabits === 0 ? (
        <View className="flex-1 justify-center items-center px-5">
          <MaterialCommunityIcons name="chart-line" size={80} color="#9ca3af" />
          <Text className="text-foreground text-center mt-4 text-lg font-semibold">No habits yet</Text>
          <Text className="text-muted-foreground text-center mt-2">Create some habits to see your statistics</Text>
        </View>
      ) : (
        <ScrollView contentContainerClassName="gap-4 px-5 py-4" showsVerticalScrollIndicator={false}>
          {/* Statistics Cards */}
          <View className="gap-4">
            <View className="flex-row gap-3">
              <Card className="flex-1 bg-violet-50 border-violet-700/10 py-4">
                <CardContent className="px-4">
                  <View className="flex-row items-center gap-2 mb-2">
                    <MaterialCommunityIcons name="format-list-checks" size={24} color="#6200ee" />
                    <Text variant="small" className="text-muted-foreground shrink">
                      Total Habits
                    </Text>
                  </View>
                  <Text variant="h3" className="text-violet-700 font-bold">
                    {statistics.totalHabits}
                  </Text>
                </CardContent>
              </Card>

              <Card className="flex-1 bg-green-50 border-green-700/10 py-4">
                <CardContent className="px-4">
                  <View className="flex-row items-center gap-2 mb-2">
                    <MaterialCommunityIcons name="check-circle" size={24} color="#16a34a" />
                    <Text variant="small" className="text-muted-foreground shrink">
                      Total Completions
                    </Text>
                  </View>
                  <Text variant="h3" className="text-green-700 font-bold">
                    {statistics.totalCompletions}
                  </Text>
                </CardContent>
              </Card>
            </View>

            {/* Highest Streak Habit */}
            {statistics.highestStreakHabit && (
              <View className="relative">
                <View className="absolute top-0 right-0 bg-yellow-500 px-3 py-1 rounded-bl-lg rounded-tr-lg z-10">
                  <View className="flex-row items-center gap-1">
                    <MaterialCommunityIcons name="trophy" size={16} color="white" />
                    <Text className="text-white font-bold text-xs">HIGHEST STREAK</Text>
                  </View>
                </View>
                <Card className="bg-yellow-50/80 border-yellow-500 border-2 py-4 mt-4">
                  <CardContent className="px-4">
                    <Text variant="h3" className="text-yellow-700 font-bold mb-1">
                      {statistics.highestStreakHabit.title}
                    </Text>
                    {statistics.highestStreakHabit.description && (
                      <Text variant="muted" className="mb-2">
                        {statistics.highestStreakHabit.description}
                      </Text>
                    )}
                    <View className="flex-row gap-2 justify-between items-center mt-2">
                      <Text
                        variant="small"
                        className="flex-row items-center gap-1 bg-orange-500/20 px-2.5 py-1.5 text-orange-600 rounded-full"
                      >
                        <MaterialCommunityIcons name="fire" color="#f97316" size={16} />{' '}
                        {statistics.highestStreakHabit.streak_count} day streak
                      </Text>
                      <Text
                        variant="small"
                        className="bg-yellow-700/10 text-yellow-700 font-bold px-2.5 py-1.5 rounded-full capitalize"
                      >
                        {statistics.highestStreakHabit.frequency || 'No frequency'}
                      </Text>
                    </View>
                  </CardContent>
                </Card>
              </View>
            )}

            {/* Most Completed Habit */}
            {statistics.mostCompletedHabit && (
              <View className="relative">
                <View className="absolute top-0 right-0 bg-blue-500 px-3 py-1 rounded-bl-lg rounded-tr-lg z-10">
                  <View className="flex-row items-center gap-1">
                    <MaterialCommunityIcons name="star" size={16} color="white" />
                    <Text className="text-white font-bold text-xs">MOST COMPLETED</Text>
                  </View>
                </View>
                <Card className="bg-blue-50/80 border-blue-500 border-2 py-4 mt-4">
                  <CardContent className="px-4">
                    <Text variant="h3" className="text-blue-700 font-bold mb-1">
                      {statistics.mostCompletedHabit.habit.title}
                    </Text>
                    {statistics.mostCompletedHabit.habit.description && (
                      <Text variant="muted" className="mb-2">
                        {statistics.mostCompletedHabit.habit.description}
                      </Text>
                    )}
                    <View className="flex-row gap-2 justify-between items-center mt-2">
                      <Text
                        variant="small"
                        className="flex-row items-center gap-1 bg-blue-500/20 px-2.5 py-1.5 text-blue-600 rounded-full"
                      >
                        <MaterialCommunityIcons name="check-all" color="#2563eb" size={16} />{' '}
                        {statistics.mostCompletedHabit.completionCount} completions
                      </Text>
                      <Text
                        variant="small"
                        className="bg-blue-700/10 text-blue-700 font-bold px-2.5 py-1.5 rounded-full capitalize"
                      >
                        {statistics.mostCompletedHabit.habit.frequency || 'No frequency'}
                      </Text>
                    </View>
                  </CardContent>
                </Card>
              </View>
            )}

            {/* All Habits by Streak */}
            <View className="gap-3 mt-2">
              <Text variant="h4" className="text-violet-700 font-bold">
                All Habits by Streak
              </Text>
              {statistics.habitsByStreak.map((habit) => (
                <Card key={habit.$id} className="bg-violet-50 border-violet-700/10 py-4">
                  <CardContent className="px-4">
                    <Text variant="h4">{habit.title || 'No title'}</Text>
                    <Text variant="muted">{habit.description || 'No description'}</Text>

                    <View className="flex-row gap-2 justify-between items-center mt-2">
                      <Text
                        variant="small"
                        className="flex-row items-center gap-1 bg-yellow-500/10 px-2.5 py-1.5 text-orange-500 rounded-full"
                      >
                        <MaterialCommunityIcons name="fire" color="coral" size={16} /> {habit.streak_count || 0} day
                        streak
                      </Text>
                      <Text
                        variant="small"
                        className="bg-violet-700/10 text-violet-700 font-bold px-2.5 py-1.5 rounded-full capitalize"
                      >
                        {habit.frequency || 'No frequency'}
                      </Text>
                    </View>
                  </CardContent>
                </Card>
              ))}
            </View>
          </View>
        </ScrollView>
      )}
    </View>
  );
}
