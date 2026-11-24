import React, { useEffect, useState } from 'react';
import { Image, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Animated, {
  FadeIn,
  FadeInDown,
  FadeInUp,
  interpolateColor,
  useAnimatedProps,
  useAnimatedStyle,
  useSharedValue,
  withDelay,
  withSpring,
  withTiming,
  ZoomIn,
} from 'react-native-reanimated';
import Svg, { Circle } from 'react-native-svg';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { Check, Minus, Plus } from 'lucide-react-native';
import { PrimaryButton, Tap } from '../components/ui';
import { money, ScreenHeader } from '../components/cards';
import { COURTS, EVENTS, GYMS } from '../data';
import { C, F, PAD } from '../theme';
import { success } from '../haptics';
import type { Stack } from '../nav';

const DAYS = Array.from({ length: 10 }, (_, i) => {
  const d = new Date();
  d.setDate(d.getDate() + i);
  return d;
});
const WD = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
const MON = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
const SLOTS = Array.from({ length: 16 }, (_, i) => 6 + i);
const hh = (h: number) => `${h % 12 || 12}:00 ${h < 12 ? 'AM' : 'PM'}`;

/** Generic selectable pill with animated fill. */
function Pick({ on, disabled, onPress, children, style }: { on: boolean; disabled?: boolean; onPress: () => void; children: (on: boolean) => React.ReactNode; style?: object }) {
  const v = useSharedValue(on ? 1 : 0);
  useEffect(() => {
    v.value = withTiming(on ? 1 : 0, { duration: 180 });
  }, [on, v]);
  const a = useAnimatedStyle(() => ({
    backgroundColor: interpolateColor(v.value, [0, 1], [C.bg, '#FFFFFF']),
    borderColor: interpolateColor(v.value, [0, 1], [C.border, '#FFFFFF']),
  }));
  return (
    <Tap onPress={disabled ? undefined : onPress} haptic={!disabled} scaleTo={0.94} style={style}>
      <Animated.View style={[st.pick, a, disabled && { opacity: 0.3 }]}>{children(on)}</Animated.View>
    </Tap>
  );
}

const ACircle = Animated.createAnimatedComponent(Circle);
function Success({ lines, onDone }: { lines: [string, string][]; onDone: () => void }) {
  const insets = useSafeAreaInsets();
  const [bookingId] = useState(() => Math.floor(100000 + Math.random() * 899999));
  const p = useSharedValue(0);
  const s = useSharedValue(0);
  useEffect(() => {
    success();
    p.value = withTiming(1, { duration: 700 });
    s.value = withDelay(450, withSpring(1, { damping: 9, stiffness: 180 }));
  }, [p, s]);
  const L = 2 * Math.PI * 44;
  const ring = useAnimatedProps(() => ({ strokeDashoffset: L * (1 - p.value) }));
  const check = useAnimatedStyle(() => ({ transform: [{ scale: s.value }] }));
  return (
    <Animated.View entering={FadeIn.duration(250)} style={[StyleSheet.absoluteFill, st.success, { paddingBottom: Math.max(insets.bottom, 12) + 18 }]}>
      <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
        <View style={{ width: 100, height: 100, alignItems: 'center', justifyContent: 'center' }}>
          <Svg width={100} height={100} style={StyleSheet.absoluteFill}>
            <ACircle cx={50} cy={50} r={44} stroke={C.blue} strokeWidth={4} fill="none" strokeDasharray={L} animatedProps={ring} strokeLinecap="round" transform="rotate(-90 50 50)" />
          </Svg>
          <Animated.View style={[st.checkDot, check]}>
            <Check size={34} color="#fff" strokeWidth={3} />
          </Animated.View>
        </View>
        <Animated.Text entering={FadeInDown.delay(600).duration(400)} style={st.successTitle}>
          Booking confirmed
        </Animated.Text>
        <Animated.Text entering={FadeInDown.delay(680).duration(400)} style={st.successSub}>
          Booking ID #FT{bookingId}
        </Animated.Text>
        <Animated.View entering={FadeInDown.delay(780).duration(450)} style={st.receipt}>
          {lines.map(([k, v]) => (
            <View key={k} style={st.rLine}>
              <Text style={st.rKey}>{k}</Text>
              <Text style={st.rVal}>{v}</Text>
            </View>
          ))}
        </Animated.View>
      </View>
      <Animated.View entering={FadeInUp.delay(900).duration(400)} style={{ paddingHorizontal: PAD }}>
        <PrimaryButton title="Back to Home" onPress={onDone} />
      </Animated.View>
    </Animated.View>
  );
}

export default function Booking({ navigation, route }: NativeStackScreenProps<Stack, 'Booking'>) {
  const { kind, id } = route.params;
  const insets = useSafeAreaInsets();
  const gym = kind === 'gym' ? GYMS.find(g => g.id === id)! : null;
  const court = kind === 'court' ? COURTS.find(c => c.id === id)! : null;
  const event = kind === 'event' ? EVENTS.find(e => e.id === id)! : null;
  const item = (gym ?? court ?? event)!;

  const [day, setDay] = useState(0);
  const [slot, setSlot] = useState<number | null>(null);
  const [hours, setHours] = useState(1);
  const [pass, setPass] = useState(0);
  const [qty, setQty] = useState(1);
  const [done, setDone] = useState(false);

  const PASSES = gym ? [{ n: 'Day pass', p: gym.price }, { n: 'Week pass', p: gym.price * 5 }, { n: 'Month pass', p: gym.price * 16 }] : [];
  const total = gym ? PASSES[pass].p : court ? court.price * hours : event!.price * qty;
  const canBook = !court || slot !== null;
  const dLabel = `${WD[DAYS[day].getDay()]}, ${DAYS[day].getDate()} ${MON[DAYS[day].getMonth()]}`;

  const title = gym ? 'Get a pass' : court ? 'Book a slot' : 'Register';
  const name = 'name' in item ? item.name : item.title;
  const sub = gym ? `${gym.area} · ${gym.open}` : court ? `${court.sport} · ${court.area}` : `${event!.date} · ${event!.time}`;

  const lines: [string, string][] = [
    [event ? 'Event' : 'Venue', name],
    ...(event ? [['Date', event.date] as [string, string], ['Tickets', String(qty)] as [string, string]] : [['Date', dLabel] as [string, string]]),
    ...(court && slot !== null ? [['Time', `${hh(slot)} · ${hours} hr`] as [string, string]] : []),
    ...(gym ? [['Pass', PASSES[pass].n] as [string, string]] : []),
    ['Paid', money(total)],
  ];

  return (
    <View style={st.root}>
      <ScreenHeader title={title} />
      <ScrollView contentContainerStyle={{ paddingBottom: 130 }} showsVerticalScrollIndicator={false}>
        <Animated.View entering={FadeInDown.duration(450)} style={st.summary}>
          <Image source={{ uri: item.image }} style={st.thumb} />
          <View style={{ flex: 1, marginLeft: 12 }}>
            <Text style={st.name} numberOfLines={1}>
              {name}
            </Text>
            <Text style={st.sub} numberOfLines={1}>
              {sub}
            </Text>
          </View>
        </Animated.View>

        {!event ? (
          <Animated.View entering={FadeInDown.delay(80).duration(450)}>
            <Text style={st.h}>{gym ? 'Start date' : 'Select date'}</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ paddingHorizontal: PAD, gap: 8 }}>
              {DAYS.map((d, i) => (
                <Pick key={i} on={day === i} onPress={() => setDay(i)} style={{ width: 58 }}>
                  {on => (
                    <View style={st.dayBox}>
                      <Text style={[st.dayW, on && st.dark]}>{i === 0 ? 'Today' : WD[d.getDay()]}</Text>
                      <Text style={[st.dayN, on && st.dark]}>{d.getDate()}</Text>
                    </View>
                  )}
                </Pick>
              ))}
            </ScrollView>
          </Animated.View>
        ) : null}

        {court ? (
          <Animated.View entering={FadeInDown.delay(160).duration(450)}>
            <Text style={st.h}>Duration</Text>
            <View style={st.rowWrap}>
              {[1, 2, 3].map(h => (
                <Pick key={h} on={hours === h} onPress={() => setHours(h)} style={{ flex: 1 }}>
                  {on => <Text style={[st.pickText, on && st.dark]}>{h} hr</Text>}
                </Pick>
              ))}
            </View>
            <Text style={st.h}>Available slots</Text>
            <View style={[st.rowWrap, { flexWrap: 'wrap' }]}>
              {SLOTS.map(h => {
                const booked = (h * 7 + day * 3) % 5 === 0;
                return (
                  <Pick key={`${day}-${h}`} on={slot === h} disabled={booked} onPress={() => setSlot(h)} style={{ width: '31.3%' }}>
                    {on => <Text style={[st.pickText, on && st.dark, booked && { textDecorationLine: 'line-through' }]}>{hh(h)}</Text>}
                  </Pick>
                );
              })}
            </View>
          </Animated.View>
        ) : null}

        {gym ? (
          <Animated.View entering={FadeInDown.delay(160).duration(450)}>
            <Text style={st.h}>Choose pass</Text>
            <View style={{ paddingHorizontal: PAD, gap: 10 }}>
              {PASSES.map((p, i) => (
                <Pick key={p.n} on={pass === i} onPress={() => setPass(i)}>
                  {on => (
                    <View style={st.passRow}>
                      <Text style={[st.passName, on && st.dark]}>{p.n}</Text>
                      <Text style={[st.passPrice, on && st.dark]}>{money(p.p)}</Text>
                    </View>
                  )}
                </Pick>
              ))}
            </View>
          </Animated.View>
        ) : null}

        {event ? (
          <Animated.View entering={FadeInDown.delay(120).duration(450)}>
            <Text style={st.h}>Tickets</Text>
            <View style={st.qtyRow}>
              <View>
                <Text style={st.name}>General entry</Text>
                <Text style={st.sub}>{money(event.price)} per person</Text>
              </View>
              <View style={st.stepper}>
                <Tap style={st.stepBtn} onPress={() => setQty(q => Math.max(1, q - 1))} scaleTo={0.85}>
                  <Minus size={16} color="#fff" />
                </Tap>
                <Animated.Text key={qty} entering={ZoomIn.springify().damping(14)} style={st.qty}>
                  {qty}
                </Animated.Text>
                <Tap style={st.stepBtn} onPress={() => setQty(q => Math.min(10, q + 1))} scaleTo={0.85}>
                  <Plus size={16} color="#fff" />
                </Tap>
              </View>
            </View>
          </Animated.View>
        ) : null}
      </ScrollView>

      <View style={[st.cta, { paddingBottom: Math.max(insets.bottom, 12) + 10 }]}>
        <View style={{ marginRight: 16, minWidth: 80 }}>
          <Text style={st.sub}>Total</Text>
          <Animated.Text key={total} entering={FadeInUp.duration(250)} style={st.total}>
            {money(total)}
          </Animated.Text>
        </View>
        <View style={{ flex: 1 }}>
          <PrimaryButton title={canBook ? 'Confirm booking' : 'Pick a time slot'} disabled={!canBook} onPress={() => setDone(true)} />
        </View>
      </View>

      {done ? <Success lines={lines} onDone={() => navigation.popToTop()} /> : null}
    </View>
  );
}

const st = StyleSheet.create({
  root: { flex: 1, backgroundColor: C.bg },
  summary: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: PAD,
    padding: 10,
    borderRadius: 18,
    backgroundColor: C.card,
    borderWidth: 1,
    borderColor: C.border,
  },
  thumb: { width: 64, height: 64, borderRadius: 12 },
  name: { color: C.text, fontFamily: F.head, fontSize: 15 },
  sub: { color: C.sub, fontFamily: F.med, fontSize: 12, marginTop: 3 },
  h: { color: C.text, fontFamily: F.head, fontSize: 15, marginTop: 24, marginBottom: 12, paddingHorizontal: PAD },
  pick: { borderRadius: 14, borderWidth: 1, minHeight: 44, alignItems: 'center', justifyContent: 'center' },
  pickText: { color: C.text, fontFamily: F.semi, fontSize: 12 },
  dark: { color: '#111' },
  dayBox: { height: 70, alignItems: 'center', justifyContent: 'center' },
  dayW: { color: C.sub, fontFamily: F.med, fontSize: 11 },
  dayN: { color: C.text, fontFamily: F.bold, fontSize: 18, marginTop: 4 },
  rowWrap: { flexDirection: 'row', gap: 8, paddingHorizontal: PAD },
  passRow: { flexDirection: 'row', justifyContent: 'space-between', alignSelf: 'stretch', paddingHorizontal: 16, height: 54, alignItems: 'center' },
  passName: { color: C.text, fontFamily: F.semi, fontSize: 14 },
  passPrice: { color: C.text, fontFamily: F.bold, fontSize: 14 },
  qtyRow: {
    marginHorizontal: PAD,
    padding: 16,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: C.border,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  stepper: { flexDirection: 'row', alignItems: 'center', gap: 14 },
  stepBtn: { width: 34, height: 34, borderRadius: 17, borderWidth: 1, borderColor: C.borderHi, alignItems: 'center', justifyContent: 'center' },
  qty: { color: C.text, fontFamily: F.bold, fontSize: 18, minWidth: 18, textAlign: 'center' },
  cta: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: PAD,
    paddingTop: 14,
    backgroundColor: C.bg,
    borderTopWidth: 1,
    borderColor: C.border,
  },
  total: { color: C.text, fontFamily: F.bold, fontSize: 18 },
  success: { backgroundColor: C.bg, paddingTop: 60 },
  checkDot: { width: 70, height: 70, borderRadius: 35, backgroundColor: C.blue, alignItems: 'center', justifyContent: 'center' },
  successTitle: { color: C.text, fontFamily: F.head, fontSize: 22, marginTop: 24 },
  successSub: { color: C.sub, fontFamily: F.med, fontSize: 12, marginTop: 6 },
  receipt: {
    marginTop: 28,
    alignSelf: 'stretch',
    marginHorizontal: PAD,
    padding: 16,
    borderRadius: 18,
    backgroundColor: C.card,
    borderWidth: 1,
    borderColor: C.border,
    gap: 10,
  },
  rLine: { flexDirection: 'row', justifyContent: 'space-between' },
  rKey: { color: C.sub, fontFamily: F.med, fontSize: 13 },
  rVal: { color: C.text, fontFamily: F.semi, fontSize: 13, flexShrink: 1, textAlign: 'right', marginLeft: 12 },
});
