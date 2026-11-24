import React, { useEffect } from 'react';
import { Pressable, PressableProps, StyleProp, StyleSheet, Text, View, ViewStyle } from 'react-native';
import Animated, {
  interpolateColor,
  useAnimatedProps,
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  withTiming,
} from 'react-native-reanimated';
import Svg, { Defs, LinearGradient, Path, Stop } from 'react-native-svg';
import { ArrowLeft, Check, LucideIcon } from 'lucide-react-native';
import { C, F, PAD } from '../theme';
import { tap } from '../haptics';

const APressable = Animated.createAnimatedComponent(Pressable);

/** Pressable that springs down on touch and fires a light haptic — used for every tappable thing. */
export function Tap({
  style,
  scaleTo = 0.96,
  haptic = true,
  onPress,
  ...rest
}: PressableProps & { style?: StyleProp<ViewStyle>; scaleTo?: number; haptic?: boolean }) {
  const s = useSharedValue(1);
  const a = useAnimatedStyle(() => ({ transform: [{ scale: s.value }] }));
  return (
    <APressable
      {...rest}
      onPressIn={e => {
        s.value = withSpring(scaleTo, { damping: 15, stiffness: 400 });
        rest.onPressIn?.(e);
      }}
      onPressOut={e => {
        s.value = withSpring(1, { damping: 12, stiffness: 300 });
        rest.onPressOut?.(e);
      }}
      onPress={e => {
        if (haptic) tap();
        onPress?.(e);
      }}
      style={[style, a]}
    />
  );
}

export function Header({ onBack, onSkip }: { onBack?: () => void; onSkip?: () => void }) {
  return (
    <View style={s.header}>
      <Tap onPress={onBack} style={s.back} scaleTo={0.9} hitSlop={8}>
        <ArrowLeft color={C.text} size={20} strokeWidth={1.8} />
      </Tap>
      {onSkip ? (
        <Tap onPress={onSkip} hitSlop={12}>
          <Text style={s.skip}>Skip</Text>
        </Tap>
      ) : null}
    </View>
  );
}

const APath = Animated.createAnimatedComponent(Path);
const AGrad = Animated.createAnimatedComponent(LinearGradient);
const ARC = 'M0 60 L0 117 A50 50 0 0 0 50 167 L420 167';
const ARC_LEN = 57 + (Math.PI * 50) / 2 + 370;

/** The blue corner swoosh at the top-left; both ends grow as the user advances. */
export function ProgressArc({ progress }: { progress: number }) {
  const p = useSharedValue(progress);
  useEffect(() => {
    p.value = withTiming(progress, { duration: 650 });
  }, [progress, p]);
  const props = useAnimatedProps(() => {
    const start = 75 * (1 - p.value);
    const end = 140 + 160 * p.value;
    return { strokeDasharray: [end - start, ARC_LEN], strokeDashoffset: -start };
  });
  // fade toward the moving tip: tip x on the horizontal run = 50 + (end - 135.5)
  const grad = useAnimatedProps(() => ({ x2: Math.max(60, 50 + (140 + 160 * p.value - 135.5)) }));
  return (
    <Svg width={420} height={175} style={s.arc} pointerEvents="none">
      <Defs>
        <AGrad id="arcGrad" gradientUnits="userSpaceOnUse" x1={0} y1={0} x2={300} y2={0} animatedProps={grad}>
          <Stop offset="0" stopColor="#2F63D6" />
          <Stop offset="0.35" stopColor={C.blue} />
          <Stop offset="1" stopColor={C.blue} stopOpacity="0" />
        </AGrad>
      </Defs>
      <APath d={ARC} stroke="url(#arcGrad)" strokeWidth={3.5} fill="none" animatedProps={props} />
    </Svg>
  );
}

export function PrimaryButton({ title, onPress, disabled }: { title: string; onPress: () => void; disabled?: boolean }) {
  const o = useSharedValue(disabled ? 0.35 : 1);
  useEffect(() => {
    o.value = withTiming(disabled ? 0.35 : 1, { duration: 200 });
  }, [disabled, o]);
  const a = useAnimatedStyle(() => ({ opacity: o.value }));
  return (
    <Animated.View style={a}>
      <Tap style={s.btn} onPress={disabled ? undefined : onPress} haptic={!disabled}>
        <Text style={s.btnText}>{title}</Text>
      </Tap>
    </Animated.View>
  );
}

export function OptionRow({
  label,
  Icon,
  selected,
  onPress,
}: {
  label: string;
  Icon: LucideIcon;
  selected: boolean;
  onPress: () => void;
}) {
  const v = useSharedValue(selected ? 1 : 0);
  useEffect(() => {
    v.value = withTiming(selected ? 1 : 0, { duration: 220 });
  }, [selected, v]);
  const row = useAnimatedStyle(() => ({
    borderColor: interpolateColor(v.value, [0, 1], [C.border, C.blue]),
    backgroundColor: interpolateColor(v.value, [0, 1], [C.bg, 'rgba(59,130,246,0.08)']),
  }));
  const dot = useAnimatedStyle(() => ({
    backgroundColor: interpolateColor(v.value, [0, 1], ['transparent', C.blue]),
    borderColor: interpolateColor(v.value, [0, 1], [C.borderHi, C.blue]),
  }));
  const chk = useAnimatedStyle(() => ({ transform: [{ scale: v.value }], opacity: v.value }));
  return (
    <Tap onPress={onPress} scaleTo={0.98}>
      <Animated.View style={[s.row, row]}>
        <Icon color={C.text} size={18} strokeWidth={1.6} />
        <Text style={s.rowText}>{label}</Text>
        <Animated.View style={[s.radio, dot]}>
          <Animated.View style={chk}>
            <Check color="#fff" size={11} strokeWidth={3} />
          </Animated.View>
        </Animated.View>
      </Animated.View>
    </Tap>
  );
}

/** Two-option pill toggle (Kg/Lbs, CM/Feet) with a sliding thumb. */
export function Segmented({ options, value, onChange }: { options: [string, string]; value: 0 | 1; onChange: (v: 0 | 1) => void }) {
  const x = useSharedValue(value);
  useEffect(() => {
    x.value = withSpring(value, { damping: 18, stiffness: 220 });
  }, [value, x]);
  const thumb = useAnimatedStyle(() => ({ transform: [{ translateX: x.value * 54 }] }));
  return (
    <View style={s.seg}>
      <Animated.View style={[s.segThumb, thumb]} />
      {options.map((o, i) => (
        <Tap key={o} style={s.segItem} onPress={() => onChange(i as 0 | 1)} scaleTo={0.92}>
          <Text style={s.segText}>{o}</Text>
        </Tap>
      ))}
    </View>
  );
}

/** Rounded box showing the live value, e.g. "52.5 kg" / "29 years". */
export function ValueBox({ value, unit }: { value: string; unit: string }) {
  return (
    <View style={s.valueBox}>
      <Text style={s.valueNum}>{value}</Text>
      <Text style={s.valueUnit}>{unit}</Text>
    </View>
  );
}

export const s = StyleSheet.create({
  header: {
    height: 40,
    marginTop: 40,
    paddingHorizontal: PAD,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    zIndex: 2,
  },
  back: {
    width: 40,
    height: 40,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: C.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  skip: { color: C.text, fontFamily: F.med, fontSize: 14, opacity: 0.85 },
  arc: { position: 'absolute', left: 0, top: 0 },
  btn: { height: 44, borderRadius: 14, backgroundColor: '#fff', alignItems: 'center', justifyContent: 'center' },
  btnText: { color: '#111', fontFamily: F.semi, fontSize: 15 },
  row: {
    height: 46,
    borderRadius: 12,
    borderWidth: 1,
    paddingHorizontal: 14,
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  rowText: { flex: 1, color: C.text, fontFamily: F.med, fontSize: 13, marginLeft: 12 },
  radio: { width: 16, height: 16, borderRadius: 8, borderWidth: 1, alignItems: 'center', justifyContent: 'center' },
  seg: {
    alignSelf: 'center',
    width: 120,
    height: 44,
    borderRadius: 22,
    borderWidth: 1,
    borderColor: '#444',
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 7,
  },
  segThumb: {
    position: 'absolute',
    left: 7,
    width: 52,
    height: 28,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#555',
    backgroundColor: '#1A1A1A',
  },
  segItem: { width: 54, height: 28, alignItems: 'center', justifyContent: 'center' },
  segText: { color: C.text, fontFamily: F.semi, fontSize: 13 },
  valueBox: {
    alignSelf: 'center',
    minWidth: 140,
    height: 75,
    paddingHorizontal: 22,
    borderRadius: 28,
    borderWidth: 2.5,
    borderColor: '#262626',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  valueNum: { color: C.text, fontFamily: F.semi, fontSize: 29 },
  valueUnit: { color: C.sub, fontFamily: F.med, fontSize: 12, marginLeft: 4, marginTop: 10 },
});
