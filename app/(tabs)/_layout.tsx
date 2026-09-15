import { MaterialIcons } from '@expo/vector-icons';
import { Tabs } from 'expo-router';
import { Text, View, Pressable } from 'react-native';
import * as Haptics from 'expo-haptics';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export default function TabLayout() {
  const insets = useSafeAreaInsets();

  return (
    <Tabs
      screenOptions={{
        headerShown: false, 
        tabBarActiveTintColor: '#123924', 
        tabBarInactiveTintColor: '#8A887D',
        tabBarShowLabel: false, // Kita sembunyikan label bawaan, bikin custom UI
        tabBarStyle: {
          backgroundColor: '#FFFFFF',
          borderTopWidth: 2,
          borderTopColor: '#123924',
          height: 72 + insets.bottom, 
          paddingBottom: insets.bottom, 
          paddingTop: 12,
          boxShadow: '0px -4px 0px rgba(18,57,36,0.05)',
        }
      }}>
      
      <Tabs.Screen
        name="index"
        options={{
          title: 'Home',
          tabBarIcon: ({ color, focused }) => (
            <View style={{ alignItems: 'center', justifyContent: 'center' }}>
              <View style={{ padding: 8, borderRadius: 16, backgroundColor: focused ? '#E8F5E9' : 'transparent', borderWidth: focused ? 2 : 0, borderColor: '#123924' }}>
                <MaterialIcons size={24} name="home" color={focused ? '#3FA86B' : color} />
              </View>
              {focused && <Text style={{ fontFamily: 'Nunito_800ExtraBold', fontSize: 10, color: '#123924', marginTop: 4 }}>Beranda</Text>}
            </View>
          ),
        }}
        listeners={{ tabPress: () => Haptics.selectionAsync() }}
      />
      
      <Tabs.Screen
        name="tanaman"
        options={{
          title: 'Tanaman',
          tabBarIcon: ({ color, focused }) => (
            <View style={{ alignItems: 'center', justifyContent: 'center' }}>
              <View style={{ padding: 8, borderRadius: 16, backgroundColor: focused ? '#E8F5E9' : 'transparent', borderWidth: focused ? 2 : 0, borderColor: '#123924' }}>
                <MaterialIcons size={24} name="yard" color={focused ? '#3FA86B' : color} />
              </View>
              {focused && <Text style={{ fontFamily: 'Nunito_800ExtraBold', fontSize: 10, color: '#123924', marginTop: 4 }}>Kebun</Text>}
            </View>
          ),
        }}
        listeners={{ tabPress: () => Haptics.selectionAsync() }}
      />

      <Tabs.Screen
        name="tanibot"
        options={{
          title: 'Tanibot',
          tabBarIcon: ({ focused }) => (
            <View style={{
              width: 64,
              height: 64,
              borderRadius: 32,
              backgroundColor: '#FFB627',
              borderWidth: 3,
              borderColor: '#123924',
              alignItems: 'center',
              justifyContent: 'center',
              top: -24, // Floating ke atas!
              boxShadow: '4px 4px 0px #123924', // Neobrutalism shadow
              transform: [{ scale: focused ? 1.1 : 1 }]
            }}>
              <MaterialIcons name="smart-toy" size={32} color="#123924" />
            </View>
          ),
        }}
        listeners={{ tabPress: () => Haptics.selectionAsync() }}
      />

      <Tabs.Screen
        name="komunitas"
        options={{
          title: 'Komunitas',
          tabBarIcon: ({ color, focused }) => (
            <View style={{ alignItems: 'center', justifyContent: 'center' }}>
              <View style={{ padding: 8, borderRadius: 16, backgroundColor: focused ? '#E8F5E9' : 'transparent', borderWidth: focused ? 2 : 0, borderColor: '#123924' }}>
                <MaterialIcons size={24} name="forum" color={focused ? '#3FA86B' : color} />
              </View>
              {focused && <Text style={{ fontFamily: 'Nunito_800ExtraBold', fontSize: 10, color: '#123924', marginTop: 4 }}>Sosial</Text>}
            </View>
          ),
        }}
        listeners={{ tabPress: () => Haptics.selectionAsync() }}
      />

      <Tabs.Screen
        name="profil"
        options={{
          title: 'Profil',
          tabBarIcon: ({ color, focused }) => (
            <View style={{ alignItems: 'center', justifyContent: 'center' }}>
              <View style={{ padding: 8, borderRadius: 16, backgroundColor: focused ? '#E8F5E9' : 'transparent', borderWidth: focused ? 2 : 0, borderColor: '#123924' }}>
                <MaterialIcons size={24} name="person" color={focused ? '#3FA86B' : color} />
              </View>
              {focused && <Text style={{ fontFamily: 'Nunito_800ExtraBold', fontSize: 10, color: '#123924', marginTop: 4 }}>Profil</Text>}
            </View>
          ),
        }}
        listeners={{ tabPress: () => Haptics.selectionAsync() }}
      />
    </Tabs>
  );
}