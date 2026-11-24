import React, { useEffect } from 'react';
import { Image, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Animated, { Easing, FadeInDown, useAnimatedProps, useSharedValue, withDelay, withTiming } from 'react-native-reanimated';
import Svg, { Circle } from 'react-native-svg';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { Bell, CalendarDays, ChevronRight, Dumbbell, Flame, Footprints, Timer, Trophy } from 'lucide-react-native';
import { Tap } from '../components/ui';
import { EventCard, Rating, Shade } from '../components/cards';
import { EVENTS, GYMS } from '../data';
import { C, F, PAD } from '../theme';
import type { Stack } from '../nav';

const ACircle = Animated.createAnimatedComponent(Circle);
const WEEK = ['M', 'T', 'W', 'T', 'F', 'S', 'S'];
const enter = (i: number) => FadeInDown.delay(80 + i * 90).duration(500).easing(Easing.bezier(0.22, 1, 0.36, 1));

function Ring({ value }: { value: number }) {
  const R = 30;
  const L = 2 * Math.PI * R;
  const p = useSharedValue(0);
  useEffect(() => {
    p.value = withDelay(400, withTiming(value, { duration: 1200, easing: Easing.out(Easing.cubic) }));
  }, [p, value]);
  const props = useAnimatedProps(() => ({ strokeDashoffset: L * (1 - p.value) }));
  return (
    <View style={{ width: 76, height: 76, alignItems: 'center', justifyContent: 'center' }}>
      <Svg width={76} height={76} style={StyleSheet.absoluteFill}>
        <Circle cx={38} cy={38} r={R} stroke="#222" strokeWidth={7} fill="none" />
        <ACircle
          cx={38}
          cy={38}
          r={R}
          stroke={C.blue}
          strokeWidth={7}
          fill="none"
          strokeLinecap="round"
          strokeDasharray={L}
          animatedProps={props}
          transform="rotate(-90 38 38)"
        />
      </Svg>
      <Flame size={18} color={C.blue} />
    </View>
  );
}

function Tile({ title, sub, image, Icon, onPress, tall }: { title: string; sub: string; image: string; Icon: any; onPress: () => void; tall?: boolean }) {
  return (
    <Tap onPress={onPress} scaleTo={0.96} style={[st.tile, { height: tall ? 232 : 110 }]}>
      <Image source={{ uri: image }} style={StyleSheet.absoluteFill} />
      <Shade from={0} />
      <View style={st.tileIcon}>
        <Icon size={16} color="#fff" />
      </View>
      <View style={st.tileText}>
        <Text style={st.tileTitle}>{title}</Text>
        <Text style={st.tileSub}>{sub}</Text>
      </View>
    </Tap>
  );
}

export default function Home({ navigation, route }: NativeStackScreenProps<Stack, 'Home'>) {
  const insets = useSafeAreaInsets();
  const profile = route.params?.profile;
  const days = parseInt(profile?.days ?? '4', 10) || 4;
  const hour = new Date().getHours();
  const greet = hour < 12 ? 'Good morning' : hour < 17 ? 'Good afternoon' : 'Good evening';
  const today = (new Date().getDay() + 6) % 7;

  return (
    <ScrollView style={st.root} contentContainerStyle={{ paddingTop: Math.max(insets.top, 24) + 8, paddingBottom: insets.bottom + 32 }} showsVerticalScrollIndicator={false}>
      <Animated.View entering={enter(0)} style={st.top}>
        <View style={st.avatar}>
          <Text style={st.avatarText}>A</Text>
        </View>
        <View style={{ flex: 1, marginLeft: 12 }}>
          <Text style={st.greet}>{greet}</Text>
          <Text style={st.name}>Alex</Text>
        </View>
        <Tap style={st.iconBtn} scaleTo={0.9}>
          <Bell size={18} color="#fff" strokeWidth={1.8} />
          <View style={st.bellDot} />
        </Tap>
      </Animated.View>

      {/* today */}
      <Animated.View entering={enter(1)} style={st.today}>
        <View style={st.rowBetween}>
          <View>
            <Text style={st.kicker}>TODAY’S PLAN</Text>
            <Text style={st.todayTitle}>{profile?.goal ?? 'Strength training'}</Text>
            <Text style={st.todaySub}>
              {profile ? `${profile.weight} → ${profile.target}` : 'Upper body · 45 min'}
            </Text>
          </View>
          <Ring value={0.62} />
        </View>
        <View style={st.stats}>
          {[
            { Icon: Flame, v: '412', u: 'kcal' },
            { Icon: Footprints, v: '6,240', u: 'steps' },
            { Icon: Timer, v: '42', u: 'min' },
          ].map(({ Icon, v, u }) => (
            <View key={u} style={st.stat}>
              <Icon size={14} color={C.sub} />
              <Text style={st.statV}>
                {v} <Text style={st.statU}>{u}</Text>
              </Text>
            </View>
          ))}
        </View>
        <View style={st.week}>
          {WEEK.map((d, i) => {
            const planned = i % Math.max(1, Math.round(7 / days)) === 0;
            return (
              <View key={i} style={{ alignItems: 'center' }}>
                <Text style={[st.weekD, i === today && { color: C.text }]}>{d}</Text>
                <View style={[st.weekDot, planned && st.weekPlanned, i === today && st.weekToday]} />
              </View>
            );
          })}
        </View>
      </Animated.View>

      {/* explore bento */}
      <Animated.View entering={enter(2)}>
        <Text style={st.section}>Explore</Text>
        <View style={st.bento}>
          <View style={{ flex: 1 }}>
            <Tile tall title="Gyms" sub={`${GYMS.length} near you`} Icon={Dumbbell} image={GYMS[0].image} onPress={() => navigation.navigate('Gyms')} />
          </View>
          <View style={{ flex: 1, gap: 12 }}>
            <Tile title="Play" sub="Book a court" Icon={Trophy} image={'https://images.unsplash.com/photo-1554068865-24cecd4e34b8?w=600&q=70&auto=format&fit=crop'} onPress={() => navigation.navigate('Play')} />
            <Tile title="Events" sub={`${EVENTS.length} this month`} Icon={CalendarDays} image={EVENTS[1].image} onPress={() => navigation.navigate('Events')} />
          </View>
        </View>
      </Animated.View>

      {/* events */}
      <Animated.View entering={enter(3)}>
        <View style={[st.rowBetween, { paddingHorizontal: PAD }]}>
          <Text style={[st.section, { paddingHorizontal: 0 }]}>Upcoming events</Text>
          <Tap onPress={() => navigation.navigate('Events')} style={st.seeAll} hitSlop={8}>
            <Text style={st.seeAllText}>See all</Text>
            <ChevronRight size={14} color={C.sub} />
          </Tap>
        </View>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          snapToInterval={272}
          decelerationRate="fast"
          contentContainerStyle={{ paddingHorizontal: PAD, gap: 12 }}>
          {EVENTS.map(e => (
            <EventCard key={e.id} e={e} width={260} onPress={() => navigation.navigate('EventDetails', { id: e.id })} />
          ))}
        </ScrollView>
      </Animated.View>

      {/* gyms */}
      <Animated.View entering={enter(4)}>
        <View style={[st.rowBetween, { paddingHorizontal: PAD }]}>
          <Text style={[st.section, { paddingHorizontal: 0 }]}>Gyms near you</Text>
          <Tap onPress={() => navigation.navigate('Gyms')} style={st.seeAll} hitSlop={8}>
            <Text style={st.seeAllText}>See all</Text>
            <ChevronRight size={14} color={C.sub} />
          </Tap>
        </View>
        <View style={{ paddingHorizontal: PAD, gap: 10 }}>
          {GYMS.slice(0, 3).map(g => (
            <Tap key={g.id} style={st.gymRow} scaleTo={0.97} onPress={() => navigation.navigate('Booking', { kind: 'gym', id: g.id })}>
              <Image source={{ uri: g.image }} style={st.gymImg} />
              <View style={{ flex: 1, marginLeft: 12 }}>
                <Text style={st.gymName}>{g.name}</Text>
                <Text style={st.gymMeta}>
                  {g.area} · {g.km} km
                </Text>
              </View>
              <Rating v={g.rating} />
            </Tap>
          ))}
        </View>
      </Animated.View>
    </ScrollView>
  );
}

const st = StyleSheet.create({
  root: { flex: 1, backgroundColor: C.bg },
  top: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: PAD },
  avatar: { width: 44, height: 44, borderRadius: 22, backgroundColor: C.blue, alignItems: 'center', justifyContent: 'center' },
  avatarText: { color: '#fff', fontFamily: F.headBold, fontSize: 18 },
  greet: { color: C.sub, fontFamily: F.med, fontSize: 12 },
  name: { color: C.text, fontFamily: F.head, fontSize: 20 },
  iconBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: C.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  bellDot: { position: 'absolute', top: 10, right: 11, width: 7, height: 7, borderRadius: 4, backgroundColor: C.blue },
  today: {
    margin: PAD,
    marginTop: 22,
    padding: 18,
    borderRadius: 22,
    backgroundColor: C.card,
    borderWidth: 1,
    borderColor: C.border,
  },
  kicker: { color: C.blue, fontFamily: F.bold, fontSize: 10, letterSpacing: 1.2 },
  todayTitle: { color: C.text, fontFamily: F.head, fontSize: 18, marginTop: 6, maxWidth: 220 },
  todaySub: { color: C.sub, fontFamily: F.med, fontSize: 12, marginTop: 4 },
  rowBetween: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  stats: { flexDirection: 'row', marginTop: 18, gap: 8 },
  stat: { flex: 1, flexDirection: 'row', alignItems: 'center', gap: 6, backgroundColor: C.bg, borderRadius: 12, padding: 10 },
  statV: { color: C.text, fontFamily: F.semi, fontSize: 13 },
  statU: { color: C.sub, fontFamily: F.med, fontSize: 10 },
  week: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 18, paddingHorizontal: 4 },
  weekD: { color: C.dim, fontFamily: F.semi, fontSize: 11 },
  weekDot: { width: 6, height: 6, borderRadius: 3, backgroundColor: '#2A2A2A', marginTop: 8 },
  weekPlanned: { backgroundColor: C.blueDim },
  weekToday: { backgroundColor: C.blue, width: 18 },
  section: { color: C.text, fontFamily: F.head, fontSize: 17, paddingHorizontal: PAD, marginTop: 14, marginBottom: 12 },
  bento: { flexDirection: 'row', gap: 12, paddingHorizontal: PAD, marginBottom: 12 },
  tile: { borderRadius: 18, overflow: 'hidden', backgroundColor: C.card },
  tileIcon: {
    position: 'absolute',
    top: 12,
    left: 12,
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'rgba(15,15,15,0.7)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  tileText: { position: 'absolute', left: 14, bottom: 12 },
  tileTitle: { color: '#fff', fontFamily: F.head, fontSize: 17 },
  tileSub: { color: '#D0D0D0', fontFamily: F.med, fontSize: 11, marginTop: 2 },
  seeAll: { flexDirection: 'row', alignItems: 'center', marginTop: 2 },
  seeAllText: { color: C.sub, fontFamily: F.med, fontSize: 12 },
  gymRow: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 10,
    borderRadius: 16,
    backgroundColor: C.card,
    borderWidth: 1,
    borderColor: C.border,
  },
  gymImg: { width: 56, height: 56, borderRadius: 12 },
  gymName: { color: C.text, fontFamily: F.head, fontSize: 14 },
  gymMeta: { color: C.sub, fontFamily: F.med, fontSize: 12, marginTop: 3 },
});
