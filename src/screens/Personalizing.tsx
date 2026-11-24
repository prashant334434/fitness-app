import React, { useEffect, useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import Animated, {
  Easing,
  FadeInDown,
  useAnimatedProps,
  useAnimatedReaction,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated';
import { scheduleOnRN } from 'react-native-worklets';
import Svg, { Circle, Defs, LinearGradient, Stop } from 'react-native-svg';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { Check } from 'lucide-react-native';
import { C, F } from '../theme';
import { success } from '../haptics';
import type { Stack } from '../nav';

const ACircle = Animated.createAnimatedComponent(Circle);
const R = 70;
const LEN = 2 * Math.PI * R;
const LINES = ['Analysing your body metrics', 'Matching workouts to your goal', 'Finding gyms & events near you'];
const DURATION = 2600;

export default function Personalizing({ navigation, route }: NativeStackScreenProps<Stack, 'Personalizing'>) {
  const p = useSharedValue(0);
  const [pct, setPct] = useState(0);

  useEffect(() => {
    p.value = withTiming(1, { duration: DURATION, easing: Easing.inOut(Easing.cubic) });
    const t = setTimeout(() => {
      success();
      navigation.replace('Home', { profile: route.params.profile });
    }, DURATION + 350);
    return () => clearTimeout(t);
  }, [navigation, p, route.params.profile]);

  useAnimatedReaction(
    () => Math.round(p.value * 100),
    v => scheduleOnRN(setPct, v),
  );
  const ring = useAnimatedProps(() => ({ strokeDashoffset: LEN * (1 - p.value) }));

  return (
    <View style={st.root}>
      <View style={st.ring}>
        <Svg width={180} height={180} viewBox="0 0 180 180">
          <Defs>
            <LinearGradient id="r" x1="0" y1="0" x2="1" y2="1">
              <Stop offset="0" stopColor="#7DB2FF" />
              <Stop offset="1" stopColor={C.blue} />
            </LinearGradient>
          </Defs>
          <Circle cx={90} cy={90} r={R} stroke="#1E1E1E" strokeWidth={8} fill="none" />
          <ACircle
            cx={90}
            cy={90}
            r={R}
            stroke="url(#r)"
            strokeWidth={8}
            fill="none"
            strokeLinecap="round"
            strokeDasharray={LEN}
            animatedProps={ring}
            transform="rotate(-90 90 90)"
          />
        </Svg>
        <Text style={st.pct}>{pct}%</Text>
      </View>
      <Text style={st.title}>Personalizing your plan</Text>
      <View style={{ marginTop: 28 }}>
        {LINES.map((l, i) => {
          const done = pct >= (i + 1) * 30;
          return (
            <Animated.View key={l} entering={FadeInDown.delay(300 + i * 650).duration(400)} style={st.line}>
              <View style={[st.dot, done && st.dotOn]}>{done ? <Check size={11} color="#fff" strokeWidth={3} /> : null}</View>
              <Text style={[st.lineText, done && { color: C.text }]}>{l}</Text>
            </Animated.View>
          );
        })}
      </View>
    </View>
  );
}

const st = StyleSheet.create({
  root: { flex: 1, backgroundColor: C.bg, alignItems: 'center', justifyContent: 'center' },
  ring: { width: 180, height: 180, alignItems: 'center', justifyContent: 'center' },
  pct: { position: 'absolute', color: C.text, fontFamily: F.semi, fontSize: 30 },
  title: { marginTop: 30, color: C.text, fontFamily: F.head, fontSize: 20 },
  line: { flexDirection: 'row', alignItems: 'center', marginBottom: 14 },
  dot: {
    width: 18,
    height: 18,
    borderRadius: 9,
    borderWidth: 1,
    borderColor: C.borderHi,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  dotOn: { backgroundColor: C.blue, borderColor: C.blue },
  lineText: { color: C.sub, fontFamily: F.med, fontSize: 13 },
});
