import { MaterialIcons } from '@expo/vector-icons';
import { Tabs } from 'expo-router';
import { Text, View } from 'react-native';
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
        name="tanibot"
        options={{
          title: 'Tanibot',
          tabBarIcon: ({ color }) => (
            <View style={{
              width: 88,
              height: 88,
              borderRadius: 40,
              backgroundColor: '#b1f1c8',
              borderWidth: 2,
              borderColor: '#123924',
              alignItems: 'center',
              justifyContent: 'center',
              // top: -12, // Move up so it pops out of the tab bar
            }}>
              <MaterialIcons name="smart-toy" size={32} color="#123924" />
            </View>
          ),
          tabBarLabel: ({ focused }) => (
            <Text style={{ 
              fontFamily: 'Nunito_700Bold', 
              fontSize: 10, 
              color: focused ? '#3FA86B' : '#5C5A4F',
              // marginTop: -12, 
            }}>
              Tanibot
            </Text>
          ),
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