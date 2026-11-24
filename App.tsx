import React from 'react';
import { Linking, LogBox, Platform, Settings, StatusBar } from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { DarkTheme, LinkingOptions, NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { C } from './src/theme';
import type { Stack as S } from './src/nav';
import Welcome from './src/screens/Welcome';
import Onboarding from './src/screens/Onboarding';
import Personalizing from './src/screens/Personalizing';
import Home from './src/screens/Home';
import { Events, Gyms, Play } from './src/screens/Listings';
import EventDetails from './src/screens/EventDetails';
import Booking from './src/screens/Booking';

const Stack = createNativeStackNavigator<S>();

/** Deep links, e.g. fitapp-rn://event/city-half-marathon or fitapp-rn://booking/event/boulderbox */
export const linking: LinkingOptions<S> = {
  prefixes: ['fitapp-rn://'],
  config: {
    screens: {
      Welcome: 'welcome',
      Onboarding: 'onboarding',
      Home: 'home',
      Gyms: 'gyms',
      Play: 'play',
      Events: 'events',
      EventDetails: 'event/:id',
      Booking: 'booking/:kind/:id',
    },
  },
  async getInitialURL() {
    const url = await Linking.getInitialURL();
    if (url) return url;
    // Dev-only: `xcrun simctl launch <udid> <bundle> -devDeepLink fitapp-rn://home` opens a screen
    // directly (used by scripts/visual-diff.sh) without the iOS "Open in…" prompt.
    return __DEV__ && Platform.OS === 'ios' ? Settings.get('devDeepLink') ?? null : null;
  },
};

if (__DEV__ && Platform.OS === 'ios' && Settings.get('quietLogBox')) LogBox.ignoreAllLogs();
const theme = { ...DarkTheme, colors: { ...DarkTheme.colors, background: C.bg, card: C.bg } };

export default function App() {
  return (
    <GestureHandlerRootView style={{ flex: 1, backgroundColor: C.bg }}>
      <SafeAreaProvider>
        <StatusBar barStyle="light-content" />
        <NavigationContainer theme={theme} linking={linking}>
          <Stack.Navigator
            screenOptions={{
              headerShown: false,
              animation: 'slide_from_right',
              contentStyle: { backgroundColor: C.bg },
              gestureEnabled: true,
            }}>
            <Stack.Screen name="Welcome" component={Welcome} options={{ animation: 'fade' }} />
            <Stack.Screen name="Onboarding" component={Onboarding} />
            <Stack.Screen name="Personalizing" component={Personalizing} options={{ animation: 'fade' }} />
            <Stack.Screen name="Home" component={Home} options={{ animation: 'fade' }} />
            <Stack.Screen name="Gyms" component={Gyms} />
            <Stack.Screen name="Play" component={Play} />
            <Stack.Screen name="Events" component={Events} />
            <Stack.Screen name="EventDetails" component={EventDetails} options={{ animation: 'fade_from_bottom' }} />
            <Stack.Screen name="Booking" component={Booking} options={{ animation: 'slide_from_bottom' }} />
          </Stack.Navigator>
        </NavigationContainer>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}
