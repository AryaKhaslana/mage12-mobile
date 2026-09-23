import { MaterialIcons } from '@expo/vector-icons';
import { Image } from 'expo-image';
import { Tabs } from 'expo-router';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

function CustomTabBar({ state, descriptors, navigation }: any) {
  const insets = useSafeAreaInsets();

  return (
    <View style={[styles.container, { bottom: Math.max(insets.bottom, 16) }]}>
      {state.routes.map((route: any, index: number) => {
        const { options } = descriptors[route.key];
        const isFocused = state.index === index;

        const onPress = () => {
          const event = navigation.emit({
            type: 'tabPress',
            target: route.key,
            canPreventDefault: true,
          });

          if (!isFocused && !event.defaultPrevented) {
            navigation.navigate(route.name);
          }
        };

        const onLongPress = () => {
          navigation.emit({
            type: 'tabLongPress',
            target: route.key,
          });
        };

        const color = isFocused ? '#1F5C3D' : '#5C5A4F';

        // Add button (FAB) - map it to 'tanibot' route
        if (route.name === 'tanibot') {
          return (
            <View key={route.key} style={styles.fabWrapper}>
              <Pressable
                onPress={onPress}
                onLongPress={onLongPress}
                style={({ pressed }) => [
                  styles.fab,
                  pressed && styles.fabPressed
                ]}
              >
                <MaterialIcons name="smart-toy" size={28} color="#FFFFFF" />
              </Pressable>
              <Text style={styles.fabLabel}>TaniBot</Text>
            </View>
          );
        }

        // Other Tabs
        return (
          <Pressable
            key={route.key}
            onPress={onPress}
            onLongPress={onLongPress}
            style={({ pressed }) => [
              styles.tabItem,
              pressed && { transform: [{ translateY: 2 }] }
            ]}
          >
            <View style={styles.iconContainer}>
              {isFocused && <View style={styles.badgeIndicator} />}
              
              {route.name === 'index' && (
                <Image 
                  source={isFocused ? require('../../assets/images/navbar/home-active.svg') : require('../../assets/images/navbar/home.svg')} 
                  style={{ width: 24, height: 24 }} 
                  contentFit="contain" 
                />
              )}

              {route.name === 'tanaman' && (
                <Image 
                  source={isFocused ? require('../../assets/images/navbar/plant-active.svg') : require('../../assets/images/navbar/plant.svg')} 
                  style={{ width: 24, height: 24 }} 
                  contentFit="contain" 
                />
              )}

              {route.name === 'komunitas' && (
                <Image 
                  source={isFocused ? require('../../assets/images/navbar/community-active.svg') : require('../../assets/images/navbar/community.svg')} 
                  style={{ width: 24, height: 24 }} 
                  contentFit="contain" 
                />
              )}

              {route.name === 'profil' && (
                <Image 
                  source={isFocused ? require('../../assets/images/navbar/user-active.svg') : require('../../assets/images/navbar/user.svg')} 
                  style={{ width: 24, height: 24 }} 
                  contentFit="contain" 
                />
              )}
            </View>

            <Text style={[styles.tabLabel, { color }]}>
              {options.title !== undefined ? options.title : route.name}
            </Text>
          </Pressable>
        );
      })}
    </View>
  );
}

export default function TabLayout() {
  return (
    <Tabs
      tabBar={props => <CustomTabBar {...props} />}
      screenOptions={{ headerShown: false }}
    >
      <Tabs.Screen name="index" options={{ title: 'Home' }} />
      <Tabs.Screen name="tanaman" options={{ title: 'Tanaman' }} />
      <Tabs.Screen name="tanibot" options={{ title: 'TaniBot' }} />
      <Tabs.Screen name="komunitas" options={{ title: 'Komunitas' }} />
      <Tabs.Screen name="profil" options={{ title: 'Profil' }} />
    </Tabs>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    left: 16,
    right: 16,
    backgroundColor: '#FFFFFF',
    borderRadius: 28,
    borderWidth: 2.5,
    borderColor: '#123924',
    paddingHorizontal: 12,
    paddingVertical: 10,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    boxShadow: '5px 5px 0px #123924',
  },
  tabItem: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 4,
  },
  iconContainer: {
    width: 36,
    height: 36,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  tabLabel: {
    fontSize: 12,
    fontFamily: 'Nunito_800ExtraBold',
    marginTop: 2,
  },
  badgeIndicator: {
    position: 'absolute',
    top: -4,
    alignSelf: 'center',
    width: 6,
    height: 6,
    backgroundColor: '#FFB627',
    borderRadius: 3,
  },
  fabWrapper: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  fab: {
    width: 56,
    height: 56,
    marginTop: -32,
    borderRadius: 28,
    backgroundColor: '#3FA86B',
    borderWidth: 2.5,
    borderColor: '#123924',
    boxShadow: '3px 3px 0px #123924',
    alignItems: 'center',
    justifyContent: 'center',
  },
  fabPressed: {
    boxShadow: '0px 0px 0px #123924',
    transform: [{ translateX: 2 }, { translateY: 2 }],
  },
  fabLabel: {
    fontSize: 12,
    fontFamily: 'Nunito_800ExtraBold',
    color: 'transparent',
    marginTop: 2,
  }
});