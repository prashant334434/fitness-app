import React, { useEffect } from 'react';
import { Image, ScrollView, StyleSheet, Text, View } from 'react-native';
import Animated, { interpolateColor, useAnimatedStyle, useSharedValue, withTiming } from 'react-native-reanimated';
import Svg, { Defs, LinearGradient, Rect, Stop } from 'react-native-svg';
import { ArrowLeft, MapPin, Star, Users } from 'lucide-react-native';
import { useNavigation } from '@react-navigation/native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Tap } from './ui';
import { C, F, PAD } from '../theme';
import type { Court, Event, Gym } from '../data';

/** Bottom-up dark gradient over photos so text stays legible. */
export function Shade({ from = 0.25 }: { from?: number }) {
  return (
    <Svg style={StyleSheet.absoluteFill} pointerEvents="none">
      <Defs>
        <LinearGradient id="sh" x1="0" y1="0" x2="0" y2="1">
          <Stop offset={String(from)} stopColor="#000" stopOpacity="0" />
          <Stop offset="1" stopColor="#000" stopOpacity="0.85" />
        </LinearGradient>
      </Defs>
      <Rect width="100%" height="100%" fill="url(#sh)" />
    </Svg>
  );
}

export function ScreenHeader({ title, subtitle }: { title: string; subtitle?: string }) {
  const nav = useNavigation();
  const insets = useSafeAreaInsets();
  return (
    <View style={[st.head, { paddingTop: Math.max(insets.top, 24) + 8 }]}>
      <Tap onPress={() => nav.goBack()} style={st.back} scaleTo={0.9} hitSlop={8}>
        <ArrowLeft color={C.text} size={20} strokeWidth={1.8} />
      </Tap>
      <View style={{ marginLeft: 14, flex: 1 }}>
        <Text style={st.headTitle}>{title}</Text>
        {subtitle ? <Text style={st.headSub}>{subtitle}</Text> : null}
      </View>
    </View>
  );
}

function Chip({ label, on, onPress }: { label: string; on: boolean; onPress: () => void }) {
  const v = useSharedValue(on ? 1 : 0);
  useEffect(() => {
    v.value = withTiming(on ? 1 : 0, { duration: 200 });
  }, [on, v]);
  const box = useAnimatedStyle(() => ({
    backgroundColor: interpolateColor(v.value, [0, 1], [C.bg, '#FFFFFF']),
    borderColor: interpolateColor(v.value, [0, 1], [C.border, '#FFFFFF']),
  }));
  const txt = useAnimatedStyle(() => ({ color: interpolateColor(v.value, [0, 1], ['#FFFFFF', '#111111']) }));
  return (
    <Tap onPress={onPress} scaleTo={0.93}>
      <Animated.View style={[st.chip, box]}>
        <Animated.Text style={[st.chipText, txt]}>{label}</Animated.Text>
      </Animated.View>
    </Tap>
  );
}

export function Chips({ items, value, onChange }: { items: string[]; value: string; onChange: (v: string) => void }) {
  return (
    <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ paddingHorizontal: PAD, gap: 8 }} style={{ flexGrow: 0 }}>
      {items.map(i => (
        <Chip key={i} label={i} on={i === value} onPress={() => onChange(i)} />
      ))}
    </ScrollView>
  );
}

export function Rating({ v }: { v: number }) {
  return (
    <View style={st.rating}>
      <Star size={11} color="#FBBF24" fill="#FBBF24" />
      <Text style={st.ratingText}>{v.toFixed(1)}</Text>
    </View>
  );
}

export function DateBadge({ day, month }: { day: string; month: string }) {
  return (
    <View style={st.badge}>
      <Text style={st.badgeDay}>{day}</Text>
      <Text style={st.badgeMonth}>{month}</Text>
    </View>
  );
}

export const money = (n: number) => (n === 0 ? 'Free' : `₹${n.toLocaleString('en-IN')}`);

export function EventCard({ e, onPress, width }: { e: Event; onPress: () => void; width?: number }) {
  return (
    <Tap onPress={onPress} scaleTo={0.97} style={[st.card, width ? { width } : null]}>
      <View style={{ height: width ? 150 : 180 }}>
        <Image source={{ uri: e.image }} style={StyleSheet.absoluteFill} />
        <Shade from={0.4} />
        <DateBadge day={e.day} month={e.month} />
        <View style={st.tagOnImg}>
          <Text style={st.tagText}>{e.category}</Text>
        </View>
      </View>
      <View style={st.cardBody}>
        <Text style={st.cardTitle} numberOfLines={1}>
          {e.title}
        </Text>
        <View style={st.metaRow}>
          <MapPin size={12} color={C.sub} />
          <Text style={st.meta} numberOfLines={1}>
            {e.venue} · {e.time}
          </Text>
        </View>
        <View style={[st.metaRow, { justifyContent: 'space-between', marginTop: 10 }]}>
          <View style={st.metaRow}>
            <Users size={12} color={C.blue} />
            <Text style={[st.meta, { color: C.text }]}>{e.going.toLocaleString('en-IN')} going</Text>
          </View>
          <Text style={st.price}>{money(e.price)}</Text>
        </View>
      </View>
    </Tap>
  );
}

export function GymCard({ g, onPress }: { g: Gym; onPress: () => void }) {
  return (
    <Tap onPress={onPress} scaleTo={0.97} style={st.card}>
      <View style={{ height: 160 }}>
        <Image source={{ uri: g.image }} style={StyleSheet.absoluteFill} />
        <Shade />
        <View style={st.tagRow}>
          {g.tags.map(t => (
            <View key={t} style={[st.tagOnImg, st.tagInline]}>
              <Text style={st.tagText}>{t}</Text>
            </View>
          ))}
        </View>
        <View style={st.imgBottom}>
          <Text style={st.cardTitleLg}>{g.name}</Text>
          <Rating v={g.rating} />
        </View>
      </View>
      <View style={[st.cardBody, st.rowBetween]}>
        <View style={{ flex: 1 }}>
          <Text style={st.meta}>
            {g.area} · {g.km} km
          </Text>
          <Text style={[st.meta, { marginTop: 3, marginLeft: 0 }]}>{g.open}</Text>
        </View>
        <View style={{ alignItems: 'flex-end' }}>
          <Text style={st.price}>
            {money(g.price)}
            <Text style={st.per}> /day</Text>
          </Text>
          <View style={st.bookPill}>
            <Text style={st.bookText}>Get pass</Text>
          </View>
        </View>
      </View>
    </Tap>
  );
}

export function CourtCard({ c, onPress }: { c: Court; onPress: () => void }) {
  return (
    <Tap onPress={onPress} scaleTo={0.97} style={[st.card, st.courtCard]}>
      <Image source={{ uri: c.image }} style={st.courtImg} />
      <View style={{ flex: 1, marginLeft: 14, justifyContent: 'center' }}>
        <Text style={st.cardTitle} numberOfLines={1}>
          {c.name}
        </Text>
        <Text style={[st.meta, { marginLeft: 0, marginTop: 4 }]}>
          {c.area} · {c.km} km
        </Text>
        <View style={[st.rowBetween, { marginTop: 12 }]}>
          <Text style={st.price}>
            {money(c.price)}
            <Text style={st.per}> /hr</Text>
          </Text>
          <Rating v={c.rating} />
        </View>
      </View>
    </Tap>
  );
}

export const st = StyleSheet.create({
  head: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: PAD, paddingBottom: 16 },
  back: {
    width: 40,
    height: 40,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: C.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headTitle: { color: C.text, fontFamily: F.head, fontSize: 20 },
  headSub: { color: C.sub, fontFamily: F.reg, fontSize: 12, marginTop: 2 },
  chip: { height: 34, paddingHorizontal: 16, borderRadius: 17, borderWidth: 1, justifyContent: 'center' },
  chipText: { fontFamily: F.semi, fontSize: 12 },
  card: { backgroundColor: C.card, borderRadius: 18, borderWidth: 1, borderColor: C.border, overflow: 'hidden' },
  cardBody: { padding: 14 },
  cardTitle: { color: C.text, fontFamily: F.head, fontSize: 15 },
  cardTitleLg: { color: C.text, fontFamily: F.head, fontSize: 18, flex: 1 },
  metaRow: { flexDirection: 'row', alignItems: 'center', marginTop: 6 },
  meta: { color: C.sub, fontFamily: F.med, fontSize: 12, marginLeft: 5 },
  price: { color: C.text, fontFamily: F.bold, fontSize: 14 },
  per: { color: C.sub, fontFamily: F.med, fontSize: 11 },
  rating: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.55)',
    borderRadius: 10,
    paddingHorizontal: 7,
    paddingVertical: 3,
    gap: 4,
  },
  ratingText: { color: C.text, fontFamily: F.semi, fontSize: 11 },
  badge: {
    position: 'absolute',
    left: 12,
    top: 12,
    width: 44,
    paddingVertical: 6,
    borderRadius: 12,
    backgroundColor: 'rgba(15,15,15,0.85)',
    alignItems: 'center',
  },
  badgeDay: { color: C.text, fontFamily: F.bold, fontSize: 16, lineHeight: 18 },
  badgeMonth: { color: C.blue, fontFamily: F.bold, fontSize: 9, letterSpacing: 1 },
  tagOnImg: {
    position: 'absolute',
    right: 12,
    top: 12,
    backgroundColor: 'rgba(59,130,246,0.9)',
    borderRadius: 10,
    paddingHorizontal: 9,
    paddingVertical: 4,
  },
  tagRow: { position: 'absolute', left: 12, top: 12, flexDirection: 'row', gap: 6 },
  tagInline: { position: 'relative', right: 0, top: 0, backgroundColor: 'rgba(15,15,15,0.75)' },
  tagText: { color: C.text, fontFamily: F.semi, fontSize: 10 },
  imgBottom: { position: 'absolute', left: 14, right: 14, bottom: 12, flexDirection: 'row', alignItems: 'center' },
  rowBetween: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  bookPill: { marginTop: 6, backgroundColor: '#fff', borderRadius: 12, paddingHorizontal: 12, paddingVertical: 5 },
  bookText: { color: '#111', fontFamily: F.semi, fontSize: 11 },
  courtCard: { flexDirection: 'row', padding: 10 },
  courtImg: { width: 96, height: 96, borderRadius: 12 },
});
