import React, { useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Animated, {
  Easing,
  FadeInDown,
  interpolate,
  useAnimatedScrollHandler,
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  Extrapolation,
} from 'react-native-reanimated';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { ArrowLeft, CalendarDays, Heart, MapPin, Share2, ShieldCheck } from 'lucide-react-native';
import { PrimaryButton, Tap } from '../components/ui';
import { money, Shade } from '../components/cards';
import { EVENTS } from '../data';
import { C, F, PAD } from '../theme';
import type { Stack } from '../nav';

const HERO = 360;
const ease = Easing.bezier(0.22, 1, 0.36, 1);
const enter = (i: number) => FadeInDown.delay(150 + i * 70).duration(500).easing(ease);
const AVATARS = ['#F97316', '#22C55E', '#A855F7', '#EAB308'];

function InfoRow({ Icon, title, sub }: { Icon: any; title: string; sub: string }) {
  return (
    <View style={st.info}>
      <View style={st.infoIcon}>
        <Icon size={18} color={C.blue} />
      </View>
      <View style={{ marginLeft: 12, flex: 1 }}>
        <Text style={st.infoTitle}>{title}</Text>
        <Text style={st.infoSub}>{sub}</Text>
      </View>
    </View>
  );
}

export default function EventDetails({ navigation, route }: NativeStackScreenProps<Stack, 'EventDetails'>) {
  const e = EVENTS.find(x => x.id === route.params.id)!;
  const insets = useSafeAreaInsets();
  const y = useSharedValue(0);
  const [liked, setLiked] = useState(false);
  const heart = useSharedValue(1);

  const onScroll = useAnimatedScrollHandler(ev => {
    y.value = ev.contentOffset.y;
  });
  const hero = useAnimatedStyle(() => ({
    transform: [
      { translateY: interpolate(y.value, [-HERO, 0, HERO], [-HERO / 2, 0, HERO * 0.5]) },
      { scale: interpolate(y.value, [-HERO, 0], [2, 1], Extrapolation.CLAMP) },
    ],
  }));
  const bar = useAnimatedStyle(() => ({ opacity: interpolate(y.value, [HERO - 140, HERO - 80], [0, 1], Extrapolation.CLAMP) }));
  const heartStyle = useAnimatedStyle(() => ({ transform: [{ scale: heart.value }] }));
  const fill = Math.min(1, e.going / (e.going + e.spots));
  const top = Math.max(insets.top, 24) + 8;

  return (
    <View style={st.root}>
      <Animated.ScrollView onScroll={onScroll} scrollEventThrottle={16} showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 120 }}>
        <Animated.View style={[{ height: HERO }, hero]}>
          <Animated.Image source={{ uri: e.image }} style={StyleSheet.absoluteFill} />
          <Shade from={0.3} />
        </Animated.View>
        <View style={st.sheet}>
          <Animated.View entering={enter(0)} style={st.catRow}>
            <View style={st.cat}>
              <Text style={st.catText}>{e.category}</Text>
            </View>
            <Text style={st.host}>by {e.host}</Text>
          </Animated.View>
          <Animated.Text entering={enter(1)} style={st.title}>
            {e.title}
          </Animated.Text>
          <Animated.View entering={enter(2)} style={{ marginTop: 18, gap: 12 }}>
            <InfoRow Icon={CalendarDays} title={e.date} sub={`Starts ${e.time} · Reporting 30 min prior`} />
            <InfoRow Icon={MapPin} title={e.venue} sub={e.address} />
          </Animated.View>

          <Animated.View entering={enter(3)} style={st.going}>
            <View style={{ flexDirection: 'row' }}>
              {AVATARS.map((c, i) => (
                <View key={c} style={[st.av, { backgroundColor: c, marginLeft: i ? -10 : 0 }]}>
                  <Text style={st.avText}>{'RKSM'[i]}</Text>
                </View>
              ))}
            </View>
            <View style={{ flex: 1, marginLeft: 12 }}>
              <Text style={st.infoTitle}>{e.going.toLocaleString('en-IN')} going</Text>
              <View style={st.bar}>
                <View style={[st.barFill, { width: `${fill * 100}%` }]} />
              </View>
              <Text style={[st.infoSub, { marginTop: 6 }]}>Only {e.spots} spots left</Text>
            </View>
          </Animated.View>

          <Animated.View entering={enter(4)}>
            <Text style={st.h2}>About</Text>
            <Text style={st.body}>{e.about}</Text>
            <Text style={st.h2}>What’s included</Text>
            <View style={st.tags}>
              {e.highlights.map(h => (
                <View key={h} style={st.tag}>
                  <ShieldCheck size={13} color={C.blue} />
                  <Text style={st.tagText}>{h}</Text>
                </View>
              ))}
            </View>
          </Animated.View>
        </View>
      </Animated.ScrollView>

      {/* collapsing top bar */}
      <Animated.View style={[st.topBg, { height: top + 52 }, bar]} pointerEvents="none">
        <Text style={[st.topTitle, { marginTop: top + 10 }]} numberOfLines={1}>
          {e.title}
        </Text>
      </Animated.View>
      <View style={[st.topBar, { top }]}>
        <Tap style={st.round} onPress={() => navigation.goBack()} scaleTo={0.9}>
          <ArrowLeft size={20} color="#fff" strokeWidth={1.8} />
        </Tap>
        <View style={{ flexDirection: 'row', gap: 10 }}>
          <Tap style={st.round} scaleTo={0.9}>
            <Share2 size={17} color="#fff" strokeWidth={1.8} />
          </Tap>
          <Tap
            style={st.round}
            scaleTo={0.9}
            onPress={() => {
              setLiked(l => !l);
              heart.value = 0.6;
              heart.value = withSpring(1, { damping: 6, stiffness: 300 });
            }}>
            <Animated.View style={heartStyle}>
              <Heart size={17} color={liked ? '#EF4444' : '#fff'} fill={liked ? '#EF4444' : 'transparent'} strokeWidth={1.8} />
            </Animated.View>
          </Tap>
        </View>
      </View>

      {/* sticky CTA */}
      <View style={[st.cta, { paddingBottom: Math.max(insets.bottom, 12) + 10 }]}>
        <View style={{ marginRight: 16 }}>
          <Text style={st.infoSub}>Entry</Text>
          <Text style={st.ctaPrice}>{money(e.price)}</Text>
        </View>
        <View style={{ flex: 1 }}>
          <PrimaryButton title={e.price ? 'Register now' : 'Join for free'} onPress={() => navigation.navigate('Booking', { kind: 'event', id: e.id })} />
        </View>
      </View>
    </View>
  );
}

const st = StyleSheet.create({
  root: { flex: 1, backgroundColor: C.bg },
  sheet: {
    marginTop: -28,
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    backgroundColor: C.bg,
    padding: PAD,
    paddingTop: 24,
  },
  catRow: { flexDirection: 'row', alignItems: 'center' },
  cat: { backgroundColor: 'rgba(59,130,246,0.15)', borderRadius: 10, paddingHorizontal: 10, paddingVertical: 4 },
  catText: { color: C.blue, fontFamily: F.semi, fontSize: 11 },
  host: { color: C.sub, fontFamily: F.med, fontSize: 12, marginLeft: 10 },
  title: { color: C.text, fontFamily: F.head, fontSize: 24, lineHeight: 30, marginTop: 12 },
  info: { flexDirection: 'row', alignItems: 'center' },
  infoIcon: {
    width: 44,
    height: 44,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: C.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  infoTitle: { color: C.text, fontFamily: F.semi, fontSize: 14 },
  infoSub: { color: C.sub, fontFamily: F.med, fontSize: 12, marginTop: 2 },
  going: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 20,
    padding: 14,
    borderRadius: 18,
    backgroundColor: C.card,
    borderWidth: 1,
    borderColor: C.border,
  },
  av: { width: 30, height: 30, borderRadius: 15, borderWidth: 2, borderColor: C.card, alignItems: 'center', justifyContent: 'center' },
  avText: { color: '#fff', fontFamily: F.bold, fontSize: 11 },
  bar: { height: 5, borderRadius: 3, backgroundColor: '#262626', marginTop: 8, overflow: 'hidden' },
  barFill: { height: 5, borderRadius: 3, backgroundColor: C.blue },
  h2: { color: C.text, fontFamily: F.head, fontSize: 16, marginTop: 24, marginBottom: 8 },
  body: { color: '#BDBDBD', fontFamily: F.reg, fontSize: 13, lineHeight: 21 },
  tags: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  tag: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: C.border,
    paddingHorizontal: 10,
    paddingVertical: 7,
  },
  tagText: { color: C.text, fontFamily: F.med, fontSize: 12 },
  topBg: { position: 'absolute', left: 0, right: 0, top: 0, backgroundColor: C.bg, borderBottomWidth: 1, borderColor: C.border },
  topTitle: { color: C.text, fontFamily: F.head, fontSize: 15, marginHorizontal: 70, textAlign: 'center' },
  topBar: { position: 'absolute', left: PAD, right: PAD, flexDirection: 'row', justifyContent: 'space-between' },
  round: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(15,15,15,0.6)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.12)',
    alignItems: 'center',
    justifyContent: 'center',
  },
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
  ctaPrice: { color: C.text, fontFamily: F.bold, fontSize: 18 },
});
