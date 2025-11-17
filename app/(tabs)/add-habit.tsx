import { View, ActivityIndicator, ScrollView } from 'react-native';
import { useState } from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group';
import { Text } from '@/components/ui/text';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/context/auth-context';
import { habitsApi } from '@/api/habits';
import { router } from 'expo-router';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';

const FREQUENCIES = ['daily', 'weekly', 'monthly'];
type Frequency = (typeof FREQUENCIES)[number];

const AddHabit = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [habit, setHabit] = useState({
    title: '',
    description: '',
    frequency: 'daily',
  });

  const handleChange = (key: string, value: string) => {
    setHabit((prev) => ({ ...prev, [key]: value }));
  };

  const createHabitMutation = useMutation({
    mutationFn: (habitData: {
      user_id: string;
      title: string;
      description: string;
      frequency: string;
      streak_count: number;
      last_completed: string;
    }) => habitsApi.createHabit(habitData),
    onSuccess: () => {
      // Invalidate and refetch habits list and statistics
      queryClient.invalidateQueries({ queryKey: ['habits'] });
      queryClient.invalidateQueries({ queryKey: ['habit-statistics', user?.$id] });
      setHabit({
        title: '',
        description: '',
        frequency: 'daily',
      });
      router.back();
    },
  });

  const handleSubmit = () => {
    if (!user) return;
    createHabitMutation.mutate({
      user_id: user.$id,
      title: habit.title,
      description: habit.description,
      frequency: habit.frequency,
      streak_count: 0,
      last_completed: '',
    });
  };

  return (
    <ScrollView contentContainerClassName="gap-4 flex-grow">
      <View className="px-2 flex-row items-center gap-2">
        <Button variant="ghost" size="icon" onPress={() => router.back()}>
          <MaterialCommunityIcons name="chevron-left" size={24} color="black" />
        </Button>
        <Text className="text-violet-700 text-2xl font-bold">Add Habit</Text>
      </View>
      <View className="gap-4 px-5">
        <View className="gap-1.5">
          <Label htmlFor="title">Title</Label>
          <Input
            id="title"
            placeholder="Title"
            value={habit.title}
            onChangeText={(value) => handleChange('title', value)}
          />
        </View>

        <View className="gap-1.5">
          <Label htmlFor="description">Description</Label>
          <Input
            id="description"
            placeholder="description"
            value={habit.description}
            onChangeText={(value) => handleChange('description', value)}
          />
        </View>

        <View className="mt-2">
          <ToggleGroup
            value={habit.frequency}
            onValueChange={(value) => handleChange('frequency', value as Frequency)}
            variant="outline"
            type="single"
            className="w-full rounded-full"
          >
            {FREQUENCIES?.map((value, index) => (
              <ToggleGroupItem
                key={index}
                value={value}
                className={cn(
                  'flex-1',
                  habit.frequency === value && 'bg-violet-700',
                  index === 0 && 'rounded-l-full',
                  index === FREQUENCIES.length - 1 && 'rounded-r-full'
                )}
                {...(index === 0 && { isFirst: true })}
                {...(index === FREQUENCIES.length - 1 && { isLast: true })}
              >
                <Text className={cn('capitalize', habit.frequency === value && 'text-white')}>{value}</Text>
              </ToggleGroupItem>
            ))}
          </ToggleGroup>
        </View>

        <Button
          className="bg-violet-700 rounded-full mt-2 active:bg-violet-600"
          disabled={!habit.title || !habit.description || createHabitMutation.isPending}
          onPress={handleSubmit}
        >
          {createHabitMutation.isPending ? <ActivityIndicator color="white" /> : <Text>Add Habit</Text>}
        </Button>

        {createHabitMutation.isError && (
          <Text className="text-red-500 text-center text-sm">
            {createHabitMutation.error instanceof Error
              ? createHabitMutation.error.message
              : 'An error occurred while creating the habit.'}
          </Text>
        )}
      </View>
    </ScrollView>
  );
};

export default AddHabit;
