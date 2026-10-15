import React, { useCallback, useEffect, useState } from 'react';
import { Keyboard, Platform, Pressable, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Tabs } from 'expo-router';
import { Image } from 'expo-image';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { Colors } from '../../constants/colors';

const CustomTabBar = React.memo(function CustomTabBar({
  state,
  descriptors,
  navigation,
}: any) {
  const insets = useSafeAreaInsets();
  const [isKeyboardVisible, setKeyboardVisible] = useState(false);

  useEffect(() => {
    const showSub = Keyboard.addListener(
      Platform.OS === 'ios' ? 'keyboardWillShow' : 'keyboardDidShow',
      () => setKeyboardVisible(true)
    );
    const hideSub = Keyboard.addListener(
      Platform.OS === 'ios' ? 'keyboardWillHide' : 'keyboardDidHide',
      () => setKeyboardVisible(false)
    );

    return () => {
      showSub.remove();
      hideSub.remove();
    };
  }, []);

  if (isKeyboardVisible) {
    return null;
  }

  return (
    <View style={[styles.container, { bottom: Math.max(insets.bottom, 16) }]}>
      {state.routes.map((route: any, index: number) => {
        const { options } = descriptors[route.key];
        const isFocused = state.index === index;

        const onPress = () => {
          Haptics.selectionAsync().catch(() => {});
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

        const color = isFocused ? Colors.primary : '#8F9B94';

        // Add button (FAB) - map it to 'tanibot' route
        if (route.name === 'tanibot') {
          return (
            <View key={route.key} style={styles.fabWrapper}>
              <Pressable
                onPress={onPress}
                onLongPress={onLongPress}
                style={({ pressed }) => [
                  styles.fab,
                  pressed && styles.fabPressed,
                  isFocused && styles.fabActive,
                ]}
              >
                <Image
                  source={require('../../assets/images/navbar/chatbot.svg')}
                  style={{ width: 52, height: 52, transform: [{ translateY: 4 }] }}
                  contentFit="contain"
                  cachePolicy="memory-disk"
                  transition={0}
                />
              </Pressable>
              <Text style={[styles.fabLabel, { color: isFocused ? Colors.primary : '#8F9B94' }]}>
                TaniBot
              </Text>
            </View>
          );
        }

        let iconName: keyof typeof Ionicons.glyphMap = 'home-outline';

        if (route.name === 'index') {
          iconName = isFocused ? 'home' : 'home-outline';
        } else if (route.name === 'tanaman') {
          iconName = isFocused ? 'leaf' : 'leaf-outline';
        } else if (route.name === 'komunitas') {
          iconName = isFocused ? 'people' : 'people-outline';
        } else if (route.name === 'profil') {
          iconName = isFocused ? 'person' : 'person-outline';
        }

        return (
          <Pressable
            key={route.key}
            onPress={onPress}
            onLongPress={onLongPress}
            style={({ pressed }) => [
              styles.tabItem,
              pressed && { transform: [{ translateY: 2 }] },
            ]}
          >
            <View style={styles.iconContainer}>
              {isFocused && <View style={styles.badgeIndicator} />}
              <Ionicons name={iconName} size={24} color={color} />
            </View>

            <Text style={[styles.tabLabel, { color }]}>
              {options.title !== undefined ? options.title : route.name}
            </Text>
          </Pressable>
        );
      })}
    </View>
  );
});

export default function TabLayout() {
  const renderTabBar = useCallback((props: any) => {
    return <CustomTabBar {...props} />;
  }, []);

  return (
    <Tabs
      tabBar={renderTabBar}
      screenOptions={{
        headerShown: false,
        lazy: false,
      }}
    >
      <Tabs.Screen name="index" options={{ title: 'Beranda' }} />
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
    borderRadius: 36,
    paddingHorizontal: 12,
    paddingVertical: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    shadowColor: '#1B4332',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.08,
    shadowRadius: 20,
    elevation: 8,
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
    backgroundColor: Colors.primary,
    borderRadius: 3,
  },
  fabWrapper: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  fab: {
    width: 60,
    height: 60,
    marginTop: -28,
    borderRadius: 30,
    backgroundColor: '#FFFFFF',
    borderWidth: 2,
    borderColor: Colors.primary,
    shadowColor: Colors.ink,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.12,
    shadowRadius: 10,
    elevation: 6,
    alignItems: 'center',
    justifyContent: 'center',
  },
  fabActive: {
    backgroundColor: '#E8F7EE',
    borderColor: Colors.primary,
    borderWidth: 3,
  },
  fabPressed: {
    transform: [{ scale: 0.95 }],
  },
  fabLabel: {
    fontSize: 12,
    fontFamily: 'Nunito_800ExtraBold',
    marginTop: 2,
  },
});