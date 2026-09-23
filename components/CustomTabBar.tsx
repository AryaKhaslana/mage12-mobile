import { Pressable, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Svg, { Circle, Line, Path, Rect } from 'react-native-svg';

export default function CustomTabBar({ state, descriptors, navigation }: any) {
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

        const color = isFocused ? '#123924' : '#5C5A4F';

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
                <Svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#FFFFFF" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                  <Line x1="12" y1="5" x2="12" y2="19" />
                  <Line x1="5" y1="12" x2="19" y2="12" />
                </Svg>
              </Pressable>
              <Text style={styles.fabLabel}>Add</Text>
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
              {route.name === 'index' && (
                <Svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2.3" strokeLinecap="round" strokeLinejoin="round">
                  <Path d="M3 10.5L12 3l9 7.5V20a1.5 1.5 0 0 1-1.5 1.5H4.5A1.5 1.5 0 0 1 3 20v-9.5z" />
                  <Line x1="9" y1="15" x2="15" y2="15" />
                </Svg>
              )}

              {route.name === 'tanaman' && (
                <>
                  <Svg width="24" height="24" viewBox="0 0 24 24" fill={color}>
                    <Path fillRule="evenodd" clipRule="evenodd" d="M3 6.5C3 5.12 4.12 4 5.5 4h4.08a2 2 0 0 1 1.42.59l1.41 1.41H18.5C19.88 6 21 7.12 21 8.5v9.5c0 1.38-1.12 2.5-2.5 2.5h-13C4.12 20.5 3 19.38 3 18V6.5zm7 7a1 1 0 0 1 1-1h4a1 1 0 1 1 0 2h-4a1 1 0 0 1-1-1z" />
                  </Svg>
                  {isFocused && <View style={styles.badgeIndicator} />}
                </>
              )}

              {route.name === 'komunitas' && (
                <Svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2.3" strokeLinecap="round" strokeLinejoin="round">
                  <Path d="M12 3a5.5 5.5 0 0 0-5.5 5.5c0 3.5-1.5 5-2.5 6.5h16c-1-1.5-2.5-3-2.5-6.5A5.5 5.5 0 0 0 12 3z" />
                  <Path d="M10 18.5a2 2 0 0 0 4 0" />
                </Svg>
              )}

              {route.name === 'profil' && (
                <Svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2.3" strokeLinecap="round" strokeLinejoin="round">
                  <Rect x="3.5" y="3.5" width="17" height="17" rx="6" />
                  <Circle cx="12" cy="10" r="2.8" />
                  <Path d="M6.8 17.5c.6-2.2 2.7-3.5 5.2-3.5s4.6 1.3 5.2 3.5" />
                </Svg>
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
  },
  tabLabel: {
    fontSize: 12,
    fontFamily: 'Nunito_800ExtraBold',
    marginTop: 2,
  },
  badgeIndicator: {
    position: 'absolute',
    top: 4,
    right: 4,
    width: 10,
    height: 10,
    backgroundColor: '#FFB627',
    borderWidth: 1.5,
    borderColor: '#123924',
    borderRadius: 5,
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

