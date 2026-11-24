import React, { useEffect, useRef } from 'react';
import { StyleSheet, TextStyle, View } from 'react-native';
import Animated, {
  SharedValue,
  useAnimatedReaction,
  useAnimatedRef,
  useAnimatedScrollHandler,
  useAnimatedStyle,
  useSharedValue,
  scrollTo,
} from 'react-native-reanimated';
import { scheduleOnRN, scheduleOnUI } from 'react-native-worklets';
import { C, F, PAD } from '../theme';
import { tick } from '../haptics';

const ROW = 53;
const VISIBLE = 7;
export const MONTHS = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];

function Item({ i, label, y, align }: { i: number; label: string; y: SharedValue<number>; align: TextStyle['textAlign'] }) {
  const a = useAnimatedStyle(() => {
    const d = Math.min(3, Math.abs(y.value / ROW - i));
    return {
      opacity: d < 1 ? 1 - d * 0.25 : d < 2 ? 0.75 - (d - 1) * 0.2 : 0.55 - (d - 2) * 0.4,
      transform: [{ scale: 1 - d * 0.02 }],
    };
  });
  return <Animated.Text style={[st.item, { textAlign: align }, a]}>{label}</Animated.Text>;
}

function Column({
  items,
  index,
  onIndex,
  align,
  style,
}: {
  items: string[];
  index: number;
  onIndex: (i: number) => void;
  align: TextStyle['textAlign'];
  style?: object;
}) {
  const ref = useAnimatedRef<Animated.ScrollView>();
  const y = useSharedValue(index * ROW);
  const first = useRef(true);
  const onScroll = useAnimatedScrollHandler(e => {
    y.value = e.contentOffset.y;
  });
  useAnimatedReaction(
    () => Math.min(items.length - 1, Math.max(0, Math.round(y.value / ROW))),
    (cur, prev) => {
      if (prev !== null && cur !== prev) {
        scheduleOnRN(tick);
        scheduleOnRN(onIndex, cur);
      }
    },
  );
  // external correction (e.g. Feb 31 → Feb 28)
  useEffect(() => {
    if (first.current) {
      first.current = false;
      return;
    }
    if (Math.round(y.value / ROW) !== index) scheduleOnUI(() => scrollTo(ref, 0, index * ROW, true));
  }, [index, ref, y]);

  return (
    <Animated.ScrollView
      ref={ref}
      style={style}
      onScroll={onScroll}
      scrollEventThrottle={16}
      snapToInterval={ROW}
      decelerationRate="fast"
      showsVerticalScrollIndicator={false}
      contentOffset={{ x: 0, y: index * ROW }}
      contentContainerStyle={{ paddingVertical: ROW * 3 }}
      nestedScrollEnabled>
      {items.map((l, i) => (
        <Item key={l} i={i} label={l} y={y} align={align} />
      ))}
    </Animated.ScrollView>
  );
}

export const YEARS = Array.from({ length: 63 }, (_, i) => String(1950 + i));
const DAYS = Array.from({ length: 31 }, (_, i) => String(i + 1));

export function DateWheel({
  date,
  onChange,
}: {
  date: { m: number; d: number; y: number };
  onChange: (d: { m: number; d: number; y: number }) => void;
}) {
  const latest = useRef(date);
  latest.current = date;
  const set = (patch: Partial<typeof date>) => {
    const n = { ...latest.current, ...patch };
    const dim = new Date(Number(YEARS[n.y]), n.m + 1, 0).getDate();
    if (n.d >= dim) n.d = dim - 1;
    onChange(n);
  };
  return (
    <View style={st.wrap}>
      <View style={st.pill} pointerEvents="none" />
      <View style={st.cols}>
        <Column items={MONTHS} index={date.m} onIndex={m => set({ m })} align="left" style={st.side} />
        <Column items={DAYS} index={date.d} onIndex={d => set({ d })} align="center" style={st.mid} />
        <Column items={YEARS} index={date.y} onIndex={y => set({ y })} align="right" style={st.side} />
      </View>
    </View>
  );
}

const st = StyleSheet.create({
  wrap: { height: ROW * VISIBLE, justifyContent: 'center' },
  pill: {
    position: 'absolute',
    left: PAD,
    right: PAD,
    top: ROW * 3 - 1,
    height: ROW + 2,
    borderRadius: 28,
    borderWidth: 1,
    borderColor: C.borderHi,
  },
  cols: { flexDirection: 'row', height: ROW * VISIBLE, paddingHorizontal: 30 },
  side: { flex: 1 },
  mid: { width: 60 },
  item: { height: ROW, lineHeight: ROW, color: C.text, fontFamily: F.reg, fontSize: 15 },
});
