import { View, ActivityIndicator, ScrollView } from 'react-native';
import { useState, useEffect } from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group';
import { Text } from '@/components/ui/text';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/context/auth-context';
import { habitsApi } from '@/api/habits';
import { router, useLocalSearchParams } from 'expo-router';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import { SafeAreaView } from 'react-native-safe-area-context';

const FREQUENCIES = ['daily', 'weekly', 'monthly'];
type Frequency = (typeof FREQUENCIES)[number];

const EditHabit = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const { habitId } = useLocalSearchParams<{ habitId: string }>();

  const {
    data: habit,
    isLoading: loadingHabit,
    error: habitError,
  } = useQuery({
    queryKey: ['habit', habitId],
    queryFn: async () => {
      const habits = await habitsApi.getHabits(user?.$id ?? '');
      return habits.rows.find((h) => h.$id === habitId);
    },
    enabled: !!habitId && !!user?.$id,
  });

  const [habitData, setHabitData] = useState({
    title: '',
    description: '',
    frequency: 'daily' as Frequency,
  });

  useEffect(() => {
    if (habit) {
      setHabitData({
        title: habit.title,
        description: habit.description,
        frequency: habit.frequency as Frequency,
      });
    }
  }, [habit]);

  const handleChange = (key: string, value: string) => {
    setHabitData((prev) => ({ ...prev, [key]: value }));
  };

  const updateHabitMutation = useMutation({
    mutationFn: (data: { title: string; description: string; frequency: string }) =>
      habitsApi.updateHabit(habitId!, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['habits', user?.$id] });
      queryClient.invalidateQueries({ queryKey: ['habit-statistics', user?.$id] });
      router.back();
    },
  });

  const handleSubmit = () => {
    if (!habitId) return;
    updateHabitMutation.mutate({
      title: habitData.title,
      description: habitData.description,
      frequency: habitData.frequency,
    });
  };

  if (loadingHabit) {
    return (
      <View className="flex-1 justify-center items-center">
        <ActivityIndicator size="large" color="#6200ee" />
      </View>
    );
  }

  if (habitError || !habit) {
    return (
      <View className="flex-1 justify-center items-center px-5">
        <MaterialCommunityIcons name="alert-outline" size={80} color="#dc2626" />
        <Text className="text-red-600 mt-4 text-center">
          {habitError instanceof Error ? habitError.message : 'Failed to load habit'}
        </Text>
        <Button variant="default" className="mt-4" onPress={() => router.back()}>
          <Text>Go Back</Text>
        </Button>
      </View>
    );
  }

  return (
    <SafeAreaView className="flex-1 mt-6">
      <ScrollView contentContainerClassName="gap-4 flex-grow">
        <View className="px-2 flex-row items-center gap-2">
          <Button variant="ghost" size="icon" onPress={() => router.back()}>
            <MaterialCommunityIcons name="chevron-left" size={24} color="black" />
          </Button>
          <Text className="text-violet-700 text-2xl font-bold">Edit Habit</Text>
        </View>
        <View className="gap-4 px-5">
          <View className="gap-1.5">
            <Label htmlFor="title">Title</Label>
            <Input
              id="title"
              placeholder="Title"
              value={habitData.title}
              onChangeText={(value) => handleChange('title', value)}
            />
          </View>

          <View className="gap-1.5">
            <Label htmlFor="description">Description</Label>
            <Input
              id="description"
              placeholder="description"
              value={habitData.description}
              onChangeText={(value) => handleChange('description', value)}
            />
          </View>

          <View className="mt-2">
            <ToggleGroup
              value={habitData.frequency}
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
                    habitData.frequency === value && 'bg-violet-700',
                    index === 0 && 'rounded-l-full',
                    index === FREQUENCIES.length - 1 && 'rounded-r-full'
                  )}
                  {...(index === 0 && { isFirst: true })}
                  {...(index === FREQUENCIES.length - 1 && { isLast: true })}
                >
                  <Text className={cn('capitalize', habitData.frequency === value && 'text-white')}>{value}</Text>
                </ToggleGroupItem>
              ))}
            </ToggleGroup>
          </View>

          <Button
            className="bg-violet-700 rounded-full mt-2 active:bg-violet-600"
            disabled={!habitData.title || !habitData.description || updateHabitMutation.isPending}
            onPress={handleSubmit}
          >
            {updateHabitMutation.isPending ? <ActivityIndicator color="white" /> : <Text>Update Habit</Text>}
          </Button>

          {updateHabitMutation.isError && (
            <Text className="text-red-500 text-center text-sm">
              {updateHabitMutation.error instanceof Error
                ? updateHabitMutation.error.message
                : 'An error occurred while updating the habit.'}
            </Text>
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

export default EditHabit;
