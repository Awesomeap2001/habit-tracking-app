import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Text } from '@/components/ui/text';
import { useAuth } from '@/context/auth-context';
import { DATABASEID, habitsTableId, tables } from '@/lib/appwrite';
import useFetch from '@/services/useFetch';
import { Habit } from '@/types/database.type';
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import { router } from 'expo-router';
import { ActivityIndicator, ScrollView, View } from 'react-native';
import { Query } from 'react-native-appwrite';

export default function Index() {
  const { user, signOut } = useAuth();

  const fetchHabits = async () => {
    const data = await tables.listRows({
      databaseId: DATABASEID,
      tableId: habitsTableId,
      queries: [Query.equal('user_id', user?.$id ?? '')],
    });
    return data;
  };

  const { data, loading, error } = useFetch(fetchHabits, true);

  return (
    <View className="flex-1 gap-4">
      <View className="flex-row items-center justify-between px-5">
        <Text className="text-violet-700 text-2xl font-bold">Today's Habits</Text>
        <Button variant="destructive" size="sm" onPress={signOut}>
          <Text>Sign out</Text>
        </Button>
      </View>

      {/* Habit List */}
      <ScrollView contentContainerClassName="gap-4 flex-1 gap-4 px-5">
        {loading ? (
          <View className="flex-1 justify-center items-center">
            <ActivityIndicator className="text-violet-700" size="large" />
          </View>
        ) : error ? (
          <View className="flex-1 justify-center items-center pb-10">
            <MaterialCommunityIcons name="alert-outline" size={80} color="#dc2626" />
            <Text className="text-red-600">{error || 'Something went wrong'}</Text>
          </View>
        ) : data?.rows?.length === 0 ? (
          <View className="flex-1 justify-center items-center pb-10">
            <MaterialCommunityIcons name="calendar-blank-outline" size={80} />
            <Text className="text-foreground">No habits found.</Text>
            <Text className="text-muted-foreground">Add a habit to get started.</Text>
            <Button variant="default" size="sm" className="mt-2" onPress={() => router.push('/add-habit')}>
              <Text>Add Habit</Text>
            </Button>
          </View>
        ) : (
          data?.rows?.map((habit: Habit) => <HabitCard {...habit} />)
        )}
      </ScrollView>
    </View>
  );
}

const HabitCard = ({ $id, title, description, frequency, streak_count, last_completed }: Habit) => {
  return (
    <Card key={$id.toString()}>
      <CardContent>
        <Text variant="h4">{title || 'No title'}</Text>
        <Text variant="muted">{description || 'No description'}</Text>

        <View className="flex-row gap-2 justify-between items-center mt-3">
          <Text variant="small">
            <MaterialCommunityIcons name="fire" color="coral" size={16} /> {streak_count || 0} day streak
          </Text>
          <Text variant="small">{frequency || 'No frequency'}</Text>
        </View>
      </CardContent>
    </Card>
  );
};
