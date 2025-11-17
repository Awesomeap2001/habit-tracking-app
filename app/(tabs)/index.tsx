import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Text } from '@/components/ui/text';
import { useAuth } from '@/context/auth-context';
import { habitsApi } from '@/api/habits';
import { Habit } from '@/types/database.type';
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import { router } from 'expo-router';
import { ActivityIndicator, Alert, ScrollView, View } from 'react-native';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Swipeable } from 'react-native-gesture-handler';
import React, { useRef } from 'react';
import { cn } from '@/lib/utils';

export default function Index() {
  const { user, signOut } = useAuth();
  const queryClient = useQueryClient();

  const {
    data,
    isLoading: loading,
    error,
  } = useQuery({
    queryKey: ['habits', user?.$id],
    queryFn: () => {
      return habitsApi.getHabits(user?.$id ?? '');
    },
    enabled: !!user?.$id,
  });

  const swipeableComponentsRef = useRef<Map<string, Swipeable>>(new Map());

  const deleteHabitMutation = useMutation({
    mutationFn: (habitId: string) => habitsApi.deleteHabit(habitId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['habits', user?.$id] });
      queryClient.invalidateQueries({ queryKey: ['habit-statistics', user?.$id] });
    },
    onError: (error: Error, habitId: string) => {
      Alert.alert('Error', error instanceof Error ? error.message : 'Something went wrong');
      closeSwipeForHabit(habitId);
    },
  });

  const completeHabitMutation = useMutation({
    mutationFn: (habitId: string) => {
      if (!user?.$id) throw new Error('User not authenticated');
      return habitsApi.completeHabit(habitId, user.$id);
    },
    onSuccess: (_, habitId) => {
      queryClient.invalidateQueries({ queryKey: ['habits', user?.$id] });
      queryClient.invalidateQueries({ queryKey: ['habit-statistics', user?.$id] });
      closeSwipeForHabit(habitId);
    },
    onError: (error: Error, habitId: string) => {
      Alert.alert('Error', error instanceof Error ? error.message : 'Something went wrong');
      closeSwipeForHabit(habitId);
    },
  });

  const closeSwipeForHabit = (habitId: string) => {
    const swipeableComponent = swipeableComponentsRef.current.get(habitId);
    if (swipeableComponent) {
      swipeableComponent.close();
    }
  };

  return (
    <View className="flex-1 gap-4">
      <View className="flex-row items-center justify-between px-5">
        <Text className="text-violet-700 text-2xl font-bold">Your Habits</Text>
        <Button variant="destructive" size="sm" onPress={signOut}>
          <Text>Sign out</Text>
        </Button>
      </View>

      {/* Habit List */}
      <ScrollView contentContainerClassName="gap-4 flex-grow px-5" showsVerticalScrollIndicator={false}>
        {loading ? (
          <View className="flex-1 justify-center items-center">
            <ActivityIndicator className="text-violet-700" size="large" />
          </View>
        ) : error ? (
          <View className="flex-1 justify-center items-center pb-10">
            <MaterialCommunityIcons name="alert-outline" size={80} color="#dc2626" />
            <Text className="text-red-600">{error instanceof Error ? error.message : 'Something went wrong'}</Text>
          </View>
        ) : data?.rows?.length === 0 ? (
          <View className="flex-1 justify-center items-center pb-10">
            <MaterialCommunityIcons name="calendar-blank-outline" size={80} />
            <Text className="text-foreground text-center">No habits found.</Text>
            <Text className="text-muted-foreground text-center">Add a habit to get started.</Text>
            <Button
              variant="default"
              size="sm"
              className="mt-2 bg-violet-700 active:bg-violet-800"
              onPress={() => router.push('/add-habit')}
            >
              <Text className="text-white">Add Habit</Text>
            </Button>
          </View>
        ) : (
          data?.rows?.map((habit) => (
            <HabitCard
              key={habit.$id.toString()}
              habit={habit}
              onDelete={deleteHabitMutation.mutate}
              onComplete={completeHabitMutation.mutate}
              swipeableComponentsRef={swipeableComponentsRef}
            />
          ))
        )}
      </ScrollView>
    </View>
  );
}

interface HabitCardProps {
  habit: Habit;
  onDelete: (habitId: string) => void;
  onComplete: (habitId: string) => void;
  swipeableComponentsRef: React.MutableRefObject<Map<string, Swipeable>>;
}

const HabitCard = ({ habit, onDelete, onComplete, swipeableComponentsRef }: HabitCardProps) => {
  const { $id, title, description, frequency, streak_count, isCompletedToday } = habit;

  const renderDeleteAction = () => (
    <View className="bg-red-100 rounded-xl justify-center items-start flex-1 p-4">
      <MaterialCommunityIcons name="delete-outline" size={32} color="red" />
    </View>
  );

  const renderCompleteAction = () => (
    <View
      className={`rounded-xl justify-center items-end flex-1 p-4 ${isCompletedToday ? 'bg-gray-200' : 'bg-green-100'}`}
    >
      {isCompletedToday ? (
        <>
          <MaterialCommunityIcons name="check-circle" size={32} color="gray" />
          <Text className="text-gray-600 font-semibold mt-1">Completed</Text>
        </>
      ) : (
        <>
          <MaterialCommunityIcons name="check-circle-outline" size={32} color="green" />
          <Text className="text-green-600 font-semibold mt-1">Complete</Text>
        </>
      )}
    </View>
  );

  const handleSwipeAction = (direction: 'left' | 'right') => {
    if (direction === 'left') {
      onDelete($id);
    } else if (direction === 'right') {
      // Only allow completion if not already completed today
      if (!isCompletedToday) {
        onComplete($id);
      } else {
        swipeableComponentsRef.current.get($id)?.close();
      }
    }
  };

  const registerSwipeableComponent = (swipeableRef: Swipeable | null) => {
    if (swipeableRef) {
      swipeableComponentsRef.current.set($id, swipeableRef);
    } else {
      swipeableComponentsRef.current.delete($id);
    }
  };

  return (
    <Swipeable
      ref={registerSwipeableComponent}
      overshootRight={false}
      overshootLeft={false}
      renderLeftActions={renderDeleteAction}
      renderRightActions={renderCompleteAction}
      onSwipeableOpen={handleSwipeAction}
    >
      <Card className={cn('bg-violet-50 border-violet-700/10 py-4', isCompletedToday && 'opacity-50')}>
        <CardContent className="px-4">
          <Text variant="h4">{title || 'No title'}</Text>
          <Text variant="muted">{description || 'No description'}</Text>

          <View className="flex-row gap-2 justify-between items-center mt-2">
            <Text
              variant="small"
              className="flex-row items-center gap-1 bg-yellow-500/10 px-2.5 py-1.5 text-orange-500 rounded-full"
            >
              <MaterialCommunityIcons name="fire" color="coral" size={16} /> {streak_count || 0} day streak
            </Text>
            <Text
              variant="small"
              className="bg-violet-700/10 text-violet-700 font-bold px-2.5 py-1.5 rounded-full capitalize"
            >
              {frequency || 'No frequency'}
            </Text>
          </View>
        </CardContent>
      </Card>
    </Swipeable>
  );
};
