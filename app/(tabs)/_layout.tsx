import { Tabs } from 'expo-router';
import CustomTabBar from '../../components/CustomTabBar';

export default function TabLayout() {
  return (
    <Tabs
      tabBar={props => <CustomTabBar {...props} />}
      screenOptions={{ headerShown: false }}
    >
      <Tabs.Screen name="index" options={{ title: 'Home' }} />
      <Tabs.Screen name="tanaman" options={{ title: 'Tanaman' }} />
      <Tabs.Screen name="tanibot" options={{ title: 'Add' }} />
      <Tabs.Screen name="komunitas" options={{ title: 'Komunitas' }} />
      <Tabs.Screen name="profil" options={{ title: 'Profil' }} />
    </Tabs>
  );
}