import React from 'react';
import { StatusBar } from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { DarkTheme, NavigationContainer } from '@react-navigation/native';
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
const theme = { ...DarkTheme, colors: { ...DarkTheme.colors, background: C.bg, card: C.bg } };

export default function App() {
  return (
    <GestureHandlerRootView style={{ flex: 1, backgroundColor: C.bg }}>
      <SafeAreaProvider>
        <StatusBar barStyle="light-content" />
        <NavigationContainer theme={theme}>
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
