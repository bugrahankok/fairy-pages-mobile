import React from 'react';
import { Tabs } from 'expo-router';
import { View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

export default function TabLayout() {
  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: '#a855f7',
        tabBarInactiveTintColor: '#9ca3af',
        headerShown: false,
        tabBarStyle: {
          backgroundColor: '#fff',
          borderTopWidth: 1,
          borderTopColor: '#f3f4f6',
          paddingBottom: 5,
          paddingTop: 5,
          height: 60,
        },
        tabBarLabelStyle: {
          fontSize: 11,
          fontWeight: '500',
        },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: 'Discover',
          tabBarIcon: ({ color, focused }) => (
            <Ionicons name={focused ? 'home' : 'home-outline'} size={24} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="library"
        options={{
          title: 'Library',
          tabBarIcon: ({ color, focused }) => (
            <Ionicons name={focused ? 'book' : 'book-outline'} size={24} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="create"
        options={{
          title: '',
          tabBarIcon: ({ focused }) => (
            <View className="w-14 h-14 rounded-full bg-purple-500 items-center justify-center -mt-5 shadow-lg">
              <Ionicons name="add" size={32} color="#fff" />
            </View>
          ),
        }}
      />
      <Tabs.Screen
        name="two"
        options={{
          title: 'Favorites',
          tabBarIcon: ({ color, focused }) => (
            <Ionicons name={focused ? 'heart' : 'heart-outline'} size={24} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: 'Profile',
          tabBarIcon: ({ color, focused }) => (
            <Ionicons name={focused ? 'person' : 'person-outline'} size={24} color={color} />
          ),
        }}
      />
    </Tabs>
  );
}
