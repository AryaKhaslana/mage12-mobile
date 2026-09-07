import { Tabs } from 'expo-router';
import React from 'react';
import { MaterialIcons } from '@expo/vector-icons';

export default function TabLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false, // Hilangkan header atas bawaan
        tabBarActiveTintColor: '#3FA86B', // Warna Primary aktif
        tabBarInactiveTintColor: '#5C5A4F', // Warna Muted tidak aktif
        tabBarStyle: {
          backgroundColor: '#FFFFFF',
          borderTopWidth: 2,
          borderTopColor: '#123924', // Garis tegas Neobrutalism
          height: 64,
          paddingBottom: 8,
          paddingTop: 8,
        },
        tabBarLabelStyle: {
          fontFamily: 'System', // Nanti bisa diganti Plus Jakarta Sans kalau font udah di-load
          fontSize: 10,
          fontWeight: 'bold',
        }
      }}>
      
      {/* 1. Menu Home */}
      <Tabs.Screen
        name="index"
        options={{
          title: 'Home',
          tabBarIcon: ({ color }) => <MaterialIcons size={24} name="home" color={color} />,
        }}
      />
      
      {/* 2. Menu Tanaman */}
      <Tabs.Screen
        name="tanaman"
        options={{
          title: 'Tanaman',
          tabBarIcon: ({ color }) => <MaterialIcons size={24} name="yard" color={color} />,
        }}
      />

      {/* 3. Menu Komunitas */}
      <Tabs.Screen
        name="komunitas"
        options={{
          title: 'Komunitas',
          tabBarIcon: ({ color }) => <MaterialIcons size={24} name="forum" color={color} />,
        }}
      />

      {/* 4. Menu Profil */}
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