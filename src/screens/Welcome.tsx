import React, { useEffect } from 'react';
import { StyleSheet, useWindowDimensions, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Animated, { Easing, FadeInDown, useAnimatedStyle, useSharedValue, withTiming } from 'react-native-reanimated';
import Svg, { Defs, LinearGradient, Rect, Stop } from 'react-native-svg';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { PrimaryButton } from '../components/ui';
import { C, F, PAD } from '../theme';
import type { Stack } from '../nav';

const ease = Easing.bezier(0.22, 1, 0.36, 1);

export default function Welcome({ navigation }: NativeStackScreenProps<Stack, 'Welcome'>) {
  const { height: H } = useWindowDimensions();
  const insets = useSafeAreaInsets();
  const zoom = useSharedValue(1.15);
  useEffect(() => {
    zoom.value = withTiming(1, { duration: 2600, easing: Easing.out(Easing.cubic) });
  }, [zoom]);
  const img = useAnimatedStyle(() => ({ transform: [{ scale: zoom.value }] }));
  const imgH = H * 0.76;

  return (
    <View style={st.root}>
      <Animated.Image source={require('../assets/welcome.jpg')} style={[{ width: '100%', height: imgH }, img]} resizeMode="cover" />
      <Svg style={[StyleSheet.absoluteFill, { height: imgH + 2 }]} pointerEvents="none">
        <Defs>
          <LinearGradient id="w" x1="0" y1="0" x2="0" y2="1">
            <Stop offset="0" stopColor={C.bg} stopOpacity="0.25" />
            <Stop offset="0.5" stopColor={C.bg} stopOpacity="0.1" />
            <Stop offset="0.82" stopColor={C.bg} stopOpacity="0.85" />
            <Stop offset="1" stopColor={C.bg} stopOpacity="1" />
          </LinearGradient>
        </Defs>
        <Rect width="100%" height="100%" fill="url(#w)" />
      </Svg>

      <View style={[st.bottom, { paddingBottom: Math.max(insets.bottom, 12) + 18 }]}>
        <Animated.Text entering={FadeInDown.delay(350).duration(700).easing(ease)} style={st.title}>
          Let’s build your{'\n'}personal fitness plan
        </Animated.Text>
        <Animated.Text entering={FadeInDown.delay(500).duration(700).easing(ease)} style={st.sub}>
          Takes only 60 seconds. Build only for you.
        </Animated.Text>
        <Animated.View entering={FadeInDown.delay(700).duration(700).easing(ease)} style={{ marginTop: 58 }}>
          <PrimaryButton title="Start" onPress={() => navigation.navigate('Onboarding')} />
        </Animated.View>
      </View>
    </View>
  );
}

const st = StyleSheet.create({
  root: { flex: 1, backgroundColor: C.bg, overflow: 'hidden' },
  bottom: { position: 'absolute', left: PAD, right: PAD, bottom: 0 },
  title: { color: C.text, fontFamily: F.head, fontSize: 27, lineHeight: 36, textAlign: 'center' },
  sub: { color: '#DADADA', fontFamily: 'Montserrat-Italic', fontSize: 13, textAlign: 'center', marginTop: 14 },
});
