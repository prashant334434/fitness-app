import React, { useEffect, useState } from 'react';
import { Image, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Animated, { FadeIn, FadeInDown, FadeInUp, useAnimatedProps, useAnimatedStyle, useSharedValue, withDelay, withSpring, withTiming } from 'react-native-reanimated';
import Svg, { Circle, Line } from 'react-native-svg';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { Check } from 'lucide-react-native';
import { PrimaryButton, Tap } from '../components/ui';
import { Ico } from '../components/kit';
import { ICON } from '../assets/design';
import { bookable, bookingFee, COUPON, HOLD_SECONDS, USER } from '../feed';
import { C, F, PAD, T } from '../theme';
import { success } from '../haptics';
import type { Stack } from '../nav';
import { useDevScroll } from '../dev';

export const inr = (n: number) => `₹${n}`;
export const mmss = (s: number) => `${String(Math.floor(s / 60)).padStart(2, '0')}:${String(s % 60).padStart(2, '0')}`;

/** Pure pricing used by the screen (and unit-tested): fee is charged on the pre-discount amount. */
export function quote(price: number, qty: number, couponApplied: boolean) {
  const order = price * qty;
  const fee = qty ? bookingFee(order) : 0;
  const discount = couponApplied && qty ? Math.min(COUPON.off, order) : 0;
  return { order, fee, discount, total: order + fee - discount };
}

/** Counts down once per second; stops at 0. */
export function useCountdown(from: number) {
  const [left, setLeft] = useState(from);
  useEffect(() => {
    if (left <= 0) return;
    const t = setTimeout(() => setLeft(l => l - 1), 1000);
    return () => clearTimeout(t);
  }, [left]);
  return left;
}

/* ------------------------------------------------------------------ success overlay */

const ACircle = Animated.createAnimatedComponent(Circle);
function Success({ lines, onDone }: { lines: [string, string][]; onDone: () => void }) {
  const insets = useSafeAreaInsets();
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
    <Animated.View testID="booking-success" entering={FadeIn.duration(250)} style={[StyleSheet.absoluteFill, st.success, { paddingBottom: Math.max(insets.bottom, 12) + 18 }]}>
      <View style={st.successBody}>
        <View style={st.ring}>
          <Svg width={100} height={100} style={StyleSheet.absoluteFill}>
            <ACircle cx={50} cy={50} r={44} stroke={C.action} strokeWidth={4} fill="none" strokeDasharray={L} animatedProps={ring} strokeLinecap="round" transform="rotate(-90 50 50)" />
          </Svg>
          <Animated.View style={[st.checkDot, check]}>
            <Check size={34} color="#fff" strokeWidth={3} />
          </Animated.View>
        </View>
        <Animated.Text entering={FadeInDown.delay(600).duration(400)} style={st.successTitle}>
          Booking confirmed
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

/* ------------------------------------------------------------------ screen */

function Row({ label, value, top, strong }: { label: string; value: string; top: number; strong?: boolean }) {
  return (
    <View style={[st.sumRow, { top }]}>
      <Text style={strong ? T.semi14 : T.body12}>{label}</Text>
      <Text style={strong ? T.semi14 : T.med12}>{value}</Text>
    </View>
  );
}

export default function Booking({ navigation, route }: NativeStackScreenProps<Stack, 'Booking'>) {
  const { kind, id } = route.params;
  const insets = useSafeAreaInsets();
  const dev = useDevScroll();
  const item = bookable(kind, id);
  const left = useCountdown(HOLD_SECONDS);
  const [qty, setQty] = useState(1);
  const [coupon, setCoupon] = useState(false);
  const [done, setDone] = useState(false);

  if (!item) {
    return (
      <View style={[st.root, st.center]}>
        <Text style={T.body14}>This booking is no longer available.</Text>
      </View>
    );
  }
  const q = quote(item.price, qty, coupon);
  const expired = left === 0;
  const canPay = qty > 0 && !expired;
  const top = Math.max(insets.top, 40);
  const bottom = Math.max(insets.bottom, 19);

  return (
    <View style={st.root}>
      <View style={[st.header, { marginTop: top }]}>
        <Tap testID="booking-back" onPress={() => navigation.goBack()} scaleTo={0.9} style={st.back} accessibilityRole="button" accessibilityLabel="Back">
          <Ico icon={ICON.back} style={st.backIcon} />
        </Tap>
        <Text style={[T.title18, st.title]}>Review Booking</Text>
      </View>

      <ScrollView testID="booking-scroll" ref={dev.ref} onContentSizeChange={dev.onContentSizeChange} showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 30 + 48 + bottom }}>
        <Text style={[T.body12, st.timer]} testID="hold-timer">
          {expired ? (
            'Your hold has expired. Please start again.'
          ) : (
            <>
              <Text style={{ color: C.muted }}>Complete your booking in </Text>
              <Text style={[T.semi12, { color: C.action }]}>{mmss(left)}</Text>
              <Text style={{ color: C.muted }}> min</Text>
            </>
          )}
        </Text>

        <View style={st.venue}>
          <Image source={item.image} style={st.thumb} />
          <View style={st.venueText}>
            <Text style={T.body16} numberOfLines={1}>
              {item.name}
            </Text>
            <Text style={[T.body12, st.venueSub]} numberOfLines={1}>
              {item.venue}
            </Text>
          </View>
        </View>

        <View style={st.ticketCard} testID="ticket-card">
          <View style={[st.abs, st.dateRow]}>
            <Text style={T.med14}>{item.date}</Text>
            {item.time ? (
              <>
                <Text style={[T.med14, st.bar]}>|</Text>
                <Text style={[T.med14, st.time]}>{item.time}</Text>
              </>
            ) : null}
          </View>
          <View style={[st.divider, { top: 50 }]} />
          {qty ? (
            <>
              <Text style={[T.med14, st.abs, { left: 15, top: 65.58 }]}>
                {qty} x {item.ticket}
              </Text>
              <Text style={[T.med14, st.abs, { right: 12, top: 65.58 }]}>{inr(item.price * qty)}</Text>
              <Tap testID="remove-ticket" onPress={() => setQty(0)} hitSlop={10} style={[st.abs, st.remove]} accessibilityRole="button">
                <Text style={[T.body10, st.removeText]}>Remove</Text>
                <Svg width={34} height={1} style={st.dash}>
                  <Line x1={0} y1={0.5} x2={34} y2={0.5} stroke={C.hint} strokeWidth={1} strokeDasharray="2.25 1.25" />
                </Svg>
              </Tap>
            </>
          ) : (
            <Tap testID="add-ticket" onPress={() => setQty(1)} style={[st.abs, { left: 15, top: 65.58 }]} accessibilityRole="button">
              <Text style={[T.med14, { color: C.action }]}>+ Add a ticket</Text>
            </Tap>
          )}
          <View style={[st.divider, { top: 118 }]} />
          <Ico icon={ICON.mTicket} style={[st.abs, { left: 14, top: 136 }]} />
          <Text style={[T.med12, st.abs, { left: 36.74, top: 134.53 }]}>M-Ticket Entry using the QR Code in your app</Text>
        </View>

        <View style={st.coupon}>
          <Text style={[T.semi14, st.abs, { left: 14.93, top: 12.87 }]}>{COUPON.title}</Text>
          <Text style={[T.body12, st.abs, { left: 14.9, top: 34.66, color: C.muted }]}>{COUPON.subtitle}</Text>
          <Tap testID="apply-coupon" onPress={() => setCoupon(c => !c)} style={[st.apply, coupon && st.applied]} scaleTo={0.94} accessibilityRole="button" accessibilityState={{ selected: coupon }}>
            <Text style={[T.body10, st.applyText]}>{coupon ? 'Applied' : 'Apply'}</Text>
          </Tap>
        </View>

        <View style={[st.panel, { height: coupon && q.discount ? 224 : 190 }]} testID="payment-summary">
          <Text style={[T.section, st.abs, { left: 15, top: 14.95 }]}>Payment summary</Text>
          <View style={[st.divider, { top: 49, backgroundColor: C.ink }]} />
          <Row label="Order Amount" value={inr(q.order)} top={71.6} />
          <Row label="Booking Fee (inc. of GST)" value={inr(q.fee)} top={106.35} />
          {q.discount ? <Row label="Coupon discount" value={`-${inr(q.discount)}`} top={141.1} /> : null}
          <View style={[st.divider, st.inset, { top: q.discount ? 174.25 : 139.5, backgroundColor: C.ink }]} />
          <Row label="Grand Total" value={inr(q.total)} top={q.discount ? 190.62 : 155.87} strong />
        </View>

        <View style={[st.panel, { height: 175 }]} testID="invoice">
          <Text style={[T.semi16, st.abs, { left: 15, top: 15.12, letterSpacing: 0 }]}>Invoice details</Text>
          <View style={[st.divider, { top: 49, backgroundColor: C.ink }]} />
          <Ico icon={ICON.person} style={[st.abs, { left: 16, top: 65 }]} />
          <Text style={[T.body12, st.abs, { left: 38, top: 65.6 }]}>{USER.name}</Text>
          <Tap style={[st.abs, { right: 16, top: 66 }]} hitSlop={12} accessibilityRole="button" accessibilityLabel="Edit invoice details">
            <Ico icon={ICON.edit} />
          </Tap>
          {[
            { icon: ICON.phone, text: USER.phone, top: 93.22, iconTop: 93, iconLeft: 17 },
            { icon: ICON.mail, text: USER.email, top: 118.97, iconTop: 119, iconLeft: 16 },
            { icon: ICON.pinSmall, text: USER.city, top: 145, iconTop: 144, iconLeft: 17 },
          ].map(r => (
            <React.Fragment key={r.text}>
              <Ico icon={r.icon} style={[st.abs, { left: r.iconLeft, top: r.iconTop }]} />
              <Text style={[T.body10, st.abs, { left: 38, top: r.top, color: C.muted }]}>{r.text}</Text>
            </React.Fragment>
          ))}
        </View>

        <View style={st.note}>
          <Text style={[T.body10, st.noteText]}>Information mentioned above will be used for generating the invoice and sending out the tickets.</Text>
        </View>
      </ScrollView>

      <View style={[st.footer, { paddingBottom: bottom }]}>
        <Tap testID="pay-now" style={[st.pay, !canPay && st.payOff]} scaleTo={0.97} onPress={canPay ? () => setDone(true) : undefined} haptic={canPay} accessibilityRole="button" accessibilityState={{ disabled: !canPay }}>
          <Text style={T.bold15}>{inr(q.total)}</Text>
          <Text style={[T.label12, st.payLabel]}>Pay now</Text>
        </Tap>
      </View>

      {done ? (
        <Success
          lines={[
            ['Booking', item.name],
            ['When', [item.date, item.time].filter(Boolean).join(' · ')],
            ['Tickets', String(qty)],
            ['Paid', inr(q.total)],
          ]}
          onDone={() => navigation.popToTop()}
        />
      ) : null}
    </View>
  );
}

const st = StyleSheet.create({
  root: { flex: 1, backgroundColor: C.bg },
  center: { alignItems: 'center', justifyContent: 'center' },
  abs: { position: 'absolute' },

  header: { height: 40 },
  back: { position: 'absolute', left: 18, top: 0, width: 40, height: 40, borderRadius: 12, borderWidth: 1, borderColor: C.backBorder },
  backIcon: { position: 'absolute', left: 13, top: 11 },
  title: { marginTop: 8.26, textAlign: 'center' },

  timer: { marginTop: 19.35, textAlign: 'center' },

  venue: { marginTop: 7.65, marginHorizontal: 18, height: 86, borderRadius: 28, backgroundColor: C.surface, flexDirection: 'row', alignItems: 'flex-start' },
  thumb: { marginLeft: 12, marginTop: 12, width: 77, height: 62, borderRadius: 12 },
  venueText: { marginLeft: 9.8, marginTop: 22.14, flex: 1, marginRight: 14 },
  venueSub: { marginTop: 2.21, color: C.muted },

  ticketCard: { marginTop: 30, marginHorizontal: 18, height: 168, borderRadius: 21, backgroundColor: C.surface, overflow: 'hidden' },
  dateRow: { left: 14.93, top: 15.87, flexDirection: 'row' },
  bar: { marginLeft: 11.06 },
  time: { marginLeft: 11.49 },
  divider: { position: 'absolute', left: 0, right: 0, height: 1, backgroundColor: C.divider },
  inset: { left: 14.5, right: 14.5 },
  remove: { right: 12, top: 89.23, alignItems: 'flex-end' },
  removeText: { fontSize: 8, lineHeight: 10, color: C.hint },
  dash: { marginTop: 2.77 },

  coupon: { marginTop: 30, marginHorizontal: 18, height: 64, borderRadius: 16, backgroundColor: C.surface },
  apply: { position: 'absolute', right: 15.25, top: 17, width: 70.5, height: 30, borderRadius: 15, backgroundColor: C.action, alignItems: 'center', paddingTop: 8.34 },
  applied: { backgroundColor: C.rating },
  applyText: { color: '#FFFFFF' },

  panel: { marginTop: 30, marginHorizontal: 18, borderRadius: 18, backgroundColor: C.surface },
  sumRow: { position: 'absolute', left: 15, right: 15, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'baseline' },

  note: { marginTop: 15, marginHorizontal: 18, height: 58, borderRadius: 18, backgroundColor: C.note, paddingTop: 11.13, paddingHorizontal: 14.86 },
  noteText: { lineHeight: 18 },

  footer: { position: 'absolute', left: 0, right: 0, bottom: 0, paddingTop: 30, paddingHorizontal: 18, backgroundColor: C.bg },
  pay: { height: 48, borderRadius: 24, backgroundColor: C.action, flexDirection: 'row', alignItems: 'baseline', justifyContent: 'center', paddingTop: 14.3 },
  payOff: { opacity: 0.4 },
  payLabel: { marginLeft: 7.2 },

  success: { backgroundColor: C.bg, paddingTop: 60 },
  successBody: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  ring: { width: 100, height: 100, alignItems: 'center', justifyContent: 'center' },
  checkDot: { width: 70, height: 70, borderRadius: 35, backgroundColor: C.action, alignItems: 'center', justifyContent: 'center' },
  successTitle: { color: C.text, fontFamily: F.head, fontSize: 22, marginTop: 24 },
  receipt: { marginTop: 28, alignSelf: 'stretch', marginHorizontal: PAD, padding: 16, borderRadius: 18, backgroundColor: C.surface, borderWidth: 1, borderColor: C.border, gap: 10 },
  rLine: { flexDirection: 'row', justifyContent: 'space-between' },
  rKey: { color: C.sub, fontFamily: F.med, fontSize: 13 },
  rVal: { color: C.text, fontFamily: F.semi, fontSize: 13, flexShrink: 1, textAlign: 'right', marginLeft: 12 },
});
