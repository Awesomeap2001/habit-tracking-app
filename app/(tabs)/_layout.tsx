import FontAwesome5 from '@expo/vector-icons/FontAwesome5';
import { Tabs } from 'expo-router';
import React from 'react';

export default function TabsLayout() {
  return (
    <Tabs screenOptions={{ tabBarActiveTintColor: 'coral' }}>
      <Tabs.Screen
        name="index"
        options={{
          headerShown: false,
          tabBarIcon: ({ color, size }) => <FontAwesome5 name="home" color={color} size={size} />,
        }}
      />
      <Tabs.Screen
        name="login"
        options={{
          headerShown: false,
          tabBarIcon: ({ color, size }) => <FontAwesome5 name="user" color={color} size={size} />,
        }}
      />
    </Tabs>
  );
}
