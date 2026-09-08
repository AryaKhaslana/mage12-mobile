import { Tabs } from 'expo-router';
import React from 'react';
import { MaterialIcons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export default function TabLayout() {
  const insets = useSafeAreaInsets();

  return (
    <Tabs
      screenOptions={{
        headerShown: false, 
        tabBarActiveTintColor: '#3FA86B', 
        tabBarInactiveTintColor: '#5C5A4F', 
        tabBarStyle: {
          backgroundColor: '#FFFFFF',
          borderTopWidth: 2,
          borderTopColor: '#123924',
          // Tinggi dasar 64 ditambah dengan tinggi tombol navigasi bawaan HP
          height: 64 + insets.bottom, 
          // Padding bawah didorong minimal 8px atau seukuran tombol navigasi HP
          paddingBottom: Math.max(insets.bottom, 8), 
          paddingTop: 8,
        },
        tabBarLabelStyle: {
          fontFamily: 'Nunito_700Bold', // Memakai font Nunito dari root layout
          fontSize: 10,
        }
      }}>
      
      <Tabs.Screen
        name="index"
        options={{
          title: 'Home',
          tabBarIcon: ({ color }) => <MaterialIcons size={24} name="home" color={color} />,
        }}
      />
      
      <Tabs.Screen
        name="tanaman"
        options={{
          title: 'Tanaman',
          tabBarIcon: ({ color }) => <MaterialIcons size={24} name="yard" color={color} />,
        }}
      />

      <Tabs.Screen
        name="komunitas"
        options={{
          title: 'Komunitas',
          tabBarIcon: ({ color }) => <MaterialIcons size={24} name="forum" color={color} />,
        }}
      />

      <Tabs.Screen
        name="profil"
        options={{
          title: 'Profil',
          tabBarIcon: ({ color }) => <MaterialIcons size={24} name="person" color={color} />,
        }}
      />
    </Tabs>
  );
}