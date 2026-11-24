import React, { useCallback, useEffect, useState } from 'react';
import { BackHandler, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Animated, { Easing, FadeInDown, withTiming } from 'react-native-reanimated';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { Mars, Transgender, Venus } from 'lucide-react-native';
import { Header, OptionRow, PrimaryButton, ProgressArc, Segmented, Tap, ValueBox } from '../components/ui';
import { DialCfg, HeightRuler, RulerCfg, WeightDial } from '../components/scales';
import { DateWheel, YEARS } from '../components/DateWheel';
import { LIST_STEPS } from '../data';
import { C, F, PAD } from '../theme';
import type { Profile, Stack } from '../nav';

const KG: DialCfg = { count: 341, every: 2, major: 20, medium: 10, label: i => String(30 + i / 2) };
const LB: DialCfg = { count: 341, every: 2, major: 20, medium: 10, label: i => String(60 + i) };
const CM: RulerCfg = { count: 151, major: 5, label: i => String(100 + i) };
const ftIn = (inches: number) => `${Math.floor(inches / 12)}'${inches % 12}"`;
const FT: RulerCfg = { count: 61, major: 3, label: i => ftIn(36 + i) };

type Scale = { unit: 0 | 1; idx: number };
const weightVal = (w: Scale) => (w.unit === 0 ? 30 + w.idx / 2 : 60 + w.idx);
const toggleWeight = (w: Scale): Scale =>
  w.unit === 0
    ? { unit: 1, idx: Math.min(340, Math.max(0, Math.round(weightVal(w) * 2.20462) - 60)) }
    : { unit: 0, idx: Math.min(340, Math.max(0, Math.round((weightVal(w) / 2.20462) * 2) - 60)) };
const toggleHeight = (h: Scale): Scale =>
  h.unit === 0
    ? { unit: 1, idx: Math.min(60, Math.max(0, Math.round((100 + h.idx) / 2.54) - 36)) }
    : { unit: 0, idx: Math.min(150, Math.max(0, Math.round((36 + h.idx) * 2.54) - 100)) };

const STEPS = ['gender', 'age', 'weight', 'height', 'goal', 'target', 'when', 'activity', 'experience', 'days'] as const;
const TITLES: Record<string, string> = {
  gender: 'What best describes you?',
  age: 'What’s your age?',
  weight: 'What’s your current weight?',
  height: 'What’s your height?',
  target: 'What’s your target weight?',
};
const GENDERS = [
  { label: 'Male', Icon: Mars },
  { label: 'Female', Icon: Venus },
  { label: 'Other', Icon: Transgender },
];

const TODAY = new Date();
function ageOf(d: { m: number; d: number; y: number }) {
  const y = Number(YEARS[d.y]);
  let a = TODAY.getFullYear() - y;
  if (TODAY.getMonth() < d.m || (TODAY.getMonth() === d.m && TODAY.getDate() < d.d + 1)) a--;
  return a;
}

/* direction-aware slide for step changes */
const ease = Easing.bezier(0.22, 1, 0.36, 1);
const enter = (dir: number) => () => {
  'worklet';
  return {
    initialValues: { opacity: 0, transform: [{ translateX: 70 * dir }] },
    animations: {
      opacity: withTiming(1, { duration: 320 }),
      transform: [{ translateX: withTiming(0, { duration: 480, easing: ease }) }],
    },
  };
};
const exit = (dir: number) => () => {
  'worklet';
  return {
    initialValues: { opacity: 1, transform: [{ translateX: 0 }] },
    animations: {
      opacity: withTiming(0, { duration: 180 }),
      transform: [{ translateX: withTiming(-50 * dir, { duration: 260 }) }],
    },
  };
};

export default function Onboarding({ navigation }: NativeStackScreenProps<Stack, 'Onboarding'>) {
  const insets = useSafeAreaInsets();
  const [step, setStep] = useState(0);
  const [dir, setDir] = useState(1);
  const [gender, setGender] = useState<number | null>(null);
  const [dob, setDob] = useState({ m: 3, d: 3, y: 45 });
  const [weight, setWeight] = useState<Scale>({ unit: 0, idx: 45 });
  const [target, setTarget] = useState<Scale | null>(null);
  const [height, setHeight] = useState<Scale>({ unit: 0, idx: 75 });
  const [picks, setPicks] = useState<Record<string, number>>({});

  const key = STEPS[step];
  const list = LIST_STEPS.find(l => l.key === key);
  const tgt = target ?? weight;

  const finish = () => {
    const profile: Profile = {
      gender: gender === null ? undefined : GENDERS[gender].label,
      age: ageOf(dob),
      weight: `${weightVal(weight)} ${weight.unit ? 'lbs' : 'kg'}`,
      target: `${weightVal(tgt)} ${tgt.unit ? 'lbs' : 'kg'}`,
      height: height.unit ? ftIn(36 + height.idx) : `${100 + height.idx} cm`,
      goal: LIST_STEPS[0].options[picks.goal ?? 0].label,
      days: LIST_STEPS[4].options[picks.days ?? 2].label,
    };
    navigation.replace('Personalizing', { profile });
  };
  const go = (d: number) => {
    const n = step + d;
    if (n < 0) return;
    if (n >= STEPS.length) return finish();
    setDir(d);
    setStep(n);
  };
  const back = useCallback(() => {
    if (step === 0) return false;
    setDir(-1);
    setStep(s => s - 1);
    return true;
  }, [step]);
  useEffect(() => {
    const sub = BackHandler.addEventListener('hardwareBackPress', back);
    return () => sub.remove();
  }, [back]);

  const canNext = key === 'gender' ? gender !== null : list ? picks[key] !== undefined : true;

  const weightStep = (w: Scale, set: (f: (s: Scale) => Scale) => void) => (
    <>
      <Segmented options={['Kg', 'Lbs']} value={w.unit} onChange={u => u !== w.unit && set(toggleWeight)} />
      <View style={{ marginTop: 51 }}>
        <WeightDial cfg={w.unit ? LB : KG} index={w.idx} onIndex={idx => set(s => ({ ...s, idx }))} />
      </View>
      <View style={{ marginTop: 25 }}>
        <ValueBox value={String(weightVal(w))} unit={w.unit ? 'lbs' : 'kg'} />
      </View>
    </>
  );

  let body: React.ReactNode;
  if (key === 'gender') {
    body = (
      <View style={st.genderRow}>
        {GENDERS.map(({ label, Icon }, i) => (
          <Tap key={label} onPress={() => setGender(i)} style={st.genderItem} scaleTo={0.92}>
            <View style={[st.genderCard, gender === i && st.genderOn]}>
              <Icon color={C.text} size={22} strokeWidth={2} />
            </View>
            <Text style={st.genderLabel}>{label}</Text>
          </Tap>
        ))}
      </View>
    );
  } else if (key === 'age') {
    body = (
      <View style={{ marginTop: 76 }}>
        <DateWheel date={dob} onChange={setDob} />
        <View style={{ marginTop: 40 }}>
          <ValueBox value={String(ageOf(dob))} unit="years" />
        </View>
      </View>
    );
  } else if (key === 'weight') {
    body = <View style={{ marginTop: 71 }}>{weightStep(weight, setWeight)}</View>;
  } else if (key === 'target') {
    body = <View style={{ marginTop: 71 }}>{weightStep(tgt, f => setTarget(t => f(t ?? weight)))}</View>;
  } else if (key === 'height') {
    body = (
      <View style={{ marginTop: 71, flex: 1 }}>
        <Segmented options={['CM', 'Feet']} value={height.unit} onChange={u => u !== height.unit && setHeight(toggleHeight(height))} />
        <View style={{ flex: 1, marginTop: 20 }}>
          <HeightRuler
            cfg={height.unit ? FT : CM}
            index={height.idx}
            onIndex={idx => setHeight(h => ({ ...h, idx }))}
            value={height.unit ? ftIn(36 + height.idx) : String(100 + height.idx)}
            unit={height.unit ? 'ft' : 'cm'}
          />
        </View>
      </View>
    );
  } else if (list) {
    body = (
      <ScrollView style={{ marginTop: 60 }} contentContainerStyle={{ paddingHorizontal: PAD, paddingBottom: 20 }} showsVerticalScrollIndicator={false}>
        {list.options.map((o, i) => (
          <Animated.View key={o.label} entering={FadeInDown.delay(120 + i * 45).duration(420).easing(ease)}>
            <OptionRow label={o.label} Icon={o.Icon} selected={picks[key] === i} onPress={() => setPicks(p => ({ ...p, [key]: i }))} />
          </Animated.View>
        ))}
      </ScrollView>
    );
  }

  return (
    <View style={[st.root, { paddingBottom: Math.max(insets.bottom, 12) + 18 }]}>
      <ProgressArc progress={step / (STEPS.length - 1)} />
      <View style={{ marginTop: Math.max(0, insets.top - 32) }}>
        <Header onBack={() => back() || navigation.goBack()} onSkip={() => go(1)} />
      </View>
      <View style={{ flex: 1 }}>
        <Animated.View key={step} style={StyleSheet.absoluteFill} entering={enter(dir)} exiting={exit(dir)}>
          <Text style={st.title}>{TITLES[key] ?? list?.title}</Text>
          <View style={{ flex: 1 }}>
            {key === 'gender' ? <View style={st.genderWrap}>{body}</View> : body}
          </View>
        </Animated.View>
      </View>
      <View style={{ paddingHorizontal: PAD }}>
        {key === 'gender' ? <Text style={st.private}>Your data is private and secure</Text> : null}
        <PrimaryButton title="Next" onPress={() => go(1)} disabled={!canNext} />
      </View>
    </View>
  );
}

const st = StyleSheet.create({
  root: { flex: 1, backgroundColor: C.bg },
  title: { marginTop: 22, textAlign: 'center', color: C.text, fontFamily: F.head, fontSize: 20, lineHeight: 26 },
  genderWrap: { flex: 1, justifyContent: 'center', paddingBottom: 40 },
  genderRow: { flexDirection: 'row', justifyContent: 'center' },
  genderItem: { width: 114, alignItems: 'center' },
  genderCard: {
    width: 64,
    height: 64,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#333',
    alignItems: 'center',
    justifyContent: 'center',
  },
  genderOn: { borderColor: C.blue, backgroundColor: 'rgba(59,130,246,0.1)' },
  genderLabel: { marginTop: 14, color: C.text, fontFamily: F.semi, fontSize: 15 },
  private: { textAlign: 'center', color: '#CFCFCF', fontFamily: F.reg, fontSize: 12, marginBottom: 18 },
});
