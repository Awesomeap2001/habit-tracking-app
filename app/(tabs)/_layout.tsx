import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import { Tabs } from 'expo-router';
import React from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function TabsLayout() {
  return (
    <SafeAreaView className="flex-1 mt-6">
      <Tabs
        screenOptions={{
          tabBarActiveTintColor: '#6200ee',
          tabBarInactiveTintColor: '#666666',
          headerTitleAlign: 'center',
          headerShadowVisible: false,
          tabBarStyle: { shadowOpacity: 0, elevation: 0, borderTopWidth: 0 },
        }}
      >
        <Tabs.Screen
          name="index"
          options={{
            title: "Today's Habits",
            headerShown: false,
            tabBarIcon: ({ color, size }) => <MaterialCommunityIcons name="calendar" color={color} size={size} />,
          }}
        />
        <Tabs.Screen
          name="statistics"
          options={{
            title: 'Statistics',
            headerShown: false,
            tabBarIcon: ({ color, size }) => <MaterialCommunityIcons name="chart-line" color={color} size={size} />,
          }}
        />
        <Tabs.Screen
          name="add-habit"
          options={{
            title: 'Add Habit',
            headerShown: false,
            tabBarIcon: ({ color, size }) => <MaterialCommunityIcons name="plus-circle" color={color} size={size} />,
          }}
        />
      </Tabs>
    </SafeAreaView>
  );
}
