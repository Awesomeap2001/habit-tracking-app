import { View, KeyboardAvoidingView, ScrollView, Platform, ActivityIndicator } from 'react-native';
import React, { useState } from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group';
import { Text } from '@/components/ui/text';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/context/auth-context';
import { DATABASEID, habitsTableId, tables } from '@/lib/appwrite';
import { router } from 'expo-router';

const FREQUENCIES = ['daily', 'weekly', 'monthly'];
type Frequency = (typeof FREQUENCIES)[number];

const AddHabit = () => {
  const { user } = useAuth();
  const [habit, setHabit] = useState({
    title: '',
    description: '',
    frequency: 'daily',
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleChange = (key: string, value: string) => {
    setHabit((prev) => ({ ...prev, [key]: value }));
  };

  const handleSubmit = async () => {
    if (!user) return;
    try {
      setIsLoading(true);
      setError(null);

      await tables.createRow({
        databaseId: DATABASEID,
        tableId: habitsTableId,
        rowId: 'unique()',
        data: {
          user_id: user.$id,
          title: habit.title,
          description: habit.description,
          frequency: habit.frequency,
          streak_count: 0,
          last_completed: new Date().toISOString(),
        },
      });

      setHabit({
        title: '',
        description: '',
        frequency: 'daily',
      });

      router.back();
    } catch (error) {
      console.log(error);
      if (error instanceof Error) setError(error.message);
      else setError('An error occurred while creating the habit.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <View className="flex-1 px-5 gap-4 py-8">
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
        disabled={!habit.title || !habit.description || isLoading}
        onPress={handleSubmit}
      >
        {isLoading ? <ActivityIndicator color="white" /> : <Text>Add Habit</Text>}
      </Button>

      {error && <Text className="text-red-500 text-center text-sm">{error}</Text>}
    </View>
  );
};

export default AddHabit;
