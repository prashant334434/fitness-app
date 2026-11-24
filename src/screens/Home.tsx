import React, { useState } from 'react';
import { Image, ScrollView, StyleSheet, Text, useWindowDimensions, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Animated, {
  Extrapolation,
  interpolate,
  SharedValue,
  useAnimatedScrollHandler,
  useAnimatedStyle,
  useSharedValue,
  runOnJS,
} from 'react-native-reanimated';
import Svg, { Defs, Ellipse, LinearGradient, RadialGradient, Rect, Stop } from 'react-native-svg';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { Tap } from '../components/ui';
import { Dot, Ico, RatingBadge, SectionHeader } from '../components/kit';
import { ICON, IMG } from '../assets/design';
import { COURTS_NEAR, EXPLORE, FITNESS_EVENTS, FeedEvent, SPOTLIGHT, Spotlight, TOP_GYMS, USER, Venue } from '../feed';
import { C, T } from '../theme';
import type { Stack } from '../nav';
import { useDevScroll } from '../dev';

/* Geometry (pt) from the 390pt-wide export. */
export const DESIGN_TOP = 40; // header row starts 40pt below the top edge
const CARD_W = 236;
const CARD_GAP = 11;
const SPOT_W = 206;
const SPOT_H = 284;
const SPOT_STRIDE = 206.5;
const SPOT_SIDE_SCALE = 258 / 284;

type Nav = NativeStackScreenProps<Stack, 'Home'>['navigation'];

/* ------------------------------------------------------------------ header */

function Glow() {
  const { width } = useWindowDimensions();
  const rx = (width * 198) / 390;
  return (
    <Svg width={width} height={190} style={st.glow} pointerEvents="none">
      <Defs>
        <RadialGradient id="glow" cx={width / 2} cy={40} rx={rx} ry={150} gradientUnits="userSpaceOnUse">
          <Stop offset="0" stopColor="#19222F" />
          <Stop offset="1" stopColor={C.bg} />
        </RadialGradient>
      </Defs>
      <Ellipse cx={width / 2} cy={40} rx={rx} ry={150} fill="url(#glow)" />
    </Svg>
  );
}

function Header() {
  return (
    <View style={st.header}>
      <Ico icon={ICON.pinFilled} style={st.headerPin} />
      <Tap style={st.headerText} scaleTo={0.98} accessibilityRole="button" accessibilityLabel="Change location">
        <View style={st.row}>
          <Text style={T.label12}>Location</Text>
          <Ico icon={ICON.chevronDown} style={st.headerChevron} />
        </View>
        <Text style={[T.body12, st.address]} numberOfLines={1}>
          {USER.location}
        </Text>
      </Tap>
      <Image source={USER.avatar} style={st.avatar} accessibilityLabel="Profile" />
    </View>
  );
}

function SearchBar() {
  const w = useWindowDimensions().width - 36;
  return (
    <Tap style={st.search} scaleTo={0.98} accessibilityRole="search" accessibilityLabel="Search">
      <Svg width={w} height={44} style={StyleSheet.absoluteFill}>
        <Defs>
          <LinearGradient id="sb" x1="0" y1="0" x2="1" y2="0">
            <Stop offset="0" stopColor="#3F3313" />
            <Stop offset="0.4" stopColor="#261C36" />
            <Stop offset="1" stopColor="#182F38" />
          </LinearGradient>
        </Defs>
        <Rect x={0.5} y={0.5} width={w - 1} height={43} rx={21.5} fill="#0F1010" stroke="url(#sb)" strokeWidth={1} />
      </Svg>
      <Ico icon={ICON.search} style={st.searchIcon} />
      <Text style={[T.body12, st.searchText]}>Search by “Cricket Court”</Text>
    </Tap>
  );
}

/* ------------------------------------------------------------------ explore */

function Explore({ navigation }: { navigation: Nav }) {
  const rows = [EXPLORE.slice(0, 4), EXPLORE.slice(4)];
  return (
    <View>
      <Text style={[T.section, st.exploreTitle]}>Explore</Text>
      {rows.map((row, r) => (
        <View key={r} style={[st.tiles, { marginTop: r ? 10 : 4.16 }]}>
          {row.map(t => (
            <Tap
              key={t.key}
              scaleTo={0.94}
              accessibilityRole="button"
              accessibilityLabel={t.label}
              testID={`explore-${t.key}`}
              onPress={() => (t.route ? navigation.navigate(t.route as never) : undefined)}>
              {/* tile art (3D icon + tinted card + label) is a single design asset */}
              <Ico icon={IMG.home.tiles[t.key]} />
            </Tap>
          ))}
        </View>
      ))}
    </View>
  );
}

/* ------------------------------------------------------------------ spotlight */

function SpotCard({ item, index, x }: { item: Spotlight; index: number; x: SharedValue<number> }) {
  const a = useAnimatedStyle(() => {
    const d = Math.abs(x.value - index * SPOT_STRIDE);
    return { transform: [{ scale: interpolate(d, [0, SPOT_STRIDE], [1, SPOT_SIDE_SCALE], Extrapolation.CLAMP) }] };
  });
  const art = item.crop
    ? { position: 'absolute' as const, top: 0, width: 82 / SPOT_SIDE_SCALE, height: SPOT_H, [item.crop === 'right' ? 'right' : 'left']: 0 }
    : { width: SPOT_W, height: SPOT_H };
  return (
    <Animated.View style={[st.spot, a]}>
      <Image source={item.image} style={art} resizeMode="stretch" />
    </Animated.View>
  );
}

function SpotlightCarousel() {
  const side = (useWindowDimensions().width - SPOT_W) / 2;
  const x = useSharedValue(SPOT_STRIDE);
  const [active, setActive] = useState(1);
  const onScroll = useAnimatedScrollHandler(e => {
    x.value = e.contentOffset.x;
    const i = Math.round(e.contentOffset.x / SPOT_STRIDE);
    runOnJS(setActive)(Math.max(0, Math.min(SPOTLIGHT.length - 1, i)));
  });
  const cur = SPOTLIGHT[active];
  return (
    <View>
      <Animated.ScrollView
        horizontal
        testID="spotlight"
        onScroll={onScroll}
        scrollEventThrottle={16}
        showsHorizontalScrollIndicator={false}
        snapToInterval={SPOT_STRIDE}
        decelerationRate="fast"
        contentOffset={{ x: SPOT_STRIDE, y: 0 }}
        contentContainerStyle={[st.spotRow, { paddingHorizontal: side }]}
        style={st.spotScroll}>
        {SPOTLIGHT.map((it, i) => (
          <SpotCard key={it.id} item={it} index={i} x={x} />
        ))}
      </Animated.ScrollView>
      <Text style={[T.spotTitle, st.spotTitle]}>{cur.title}</Text>
      <Text style={[T.body10, st.spotSub]}>{cur.subtitle}</Text>
    </View>
  );
}

/* ------------------------------------------------------------------ venue cards */

function Liked({ top }: { top: number }) {
  const [on, setOn] = useState(false);
  return (
    <Tap
      onPress={() => setOn(v => !v)}
      scaleTo={0.8}
      hitSlop={10}
      style={[st.heart, { top }]}
      accessibilityRole="button"
      accessibilityState={{ selected: on }}
      accessibilityLabel="Save">
      <Ico icon={ICON.heart} style={on ? st.heartOn : null} />
    </Tap>
  );
}

/** Artwork that may be a partial crop: drawn at native size, pinned top-left. */
function Art({ src, h }: { src: Venue['image']; h: number }) {
  return (
    <View style={[st.art, { height: h }]}>
      <Ico icon={src} />
    </View>
  );
}

function VenueCard({ v, kind, onPress }: { v: Venue; kind: 'gym' | 'court'; onPress: () => void }) {
  const gym = kind === 'gym';
  return (
    <Tap style={[st.card, { height: gym ? 249 : 268 }]} scaleTo={0.98} onPress={onPress} testID={`venue-${v.id}`} accessibilityRole="button" accessibilityLabel={v.name}>
      <View style={st.art148}>
        <Art src={v.image} h={148} />
        {v.rating ? <RatingBadge value={v.rating} style={st.badge} /> : null}
        {v.cashback ? (
          <View style={st.strip}>
            <Svg width={216} height={20.5} style={StyleSheet.absoluteFill}>
              <Defs>
                <LinearGradient id="cb" x1="0" y1="0" x2="1" y2="0">
                  <Stop offset="0" stopColor="#4285F4" />
                  <Stop offset="1" stopColor="#010815" />
                </LinearGradient>
              </Defs>
              <Rect width={216} height={20.5} fill="url(#cb)" />
            </Svg>
            <Ico icon={ICON.cashback} style={st.cashIcon} />
            <Text style={[T.semi8, st.cashText]}>{v.cashback}</Text>
          </View>
        ) : null}
      </View>
      <Text style={[gym ? T.semi14 : T.med14, gym ? st.gymTitle : st.courtTitle]} numberOfLines={gym ? 1 : 2}>
        {v.name}
      </Text>
      <View style={[st.row, { marginTop: gym ? 2.81 : 6.98 }]}>
        <Text style={[T.body12, { color: C.muted }]}>{v.km} km</Text>
        <Dot />
        <Text style={[T.body12, st.area]} numberOfLines={1}>
          {v.area}
        </Text>
      </View>
      <View style={[st.priceRow, { marginTop: gym ? 13.42 : 8.57 }]}>
        <Text style={T.semi14}>
          {v.price}
          {v.unit ?? ''}
        </Text>
        <Text style={[T.body10, st.onwards]}>Onwards</Text>
      </View>
      <Liked top={9 + 148 + 12} />
    </Tap>
  );
}

function EventCard({ e, onPress }: { e: FeedEvent; onPress: () => void }) {
  return (
    <Tap style={[st.card, { height: 374 }]} scaleTo={0.98} onPress={onPress} testID={`event-${e.id}`} accessibilityRole="button" accessibilityLabel={e.title}>
      <View style={[st.art148, { height: 266 }]}>
        <Art src={e.image} h={266} />
      </View>
      <Text style={[T.body10, st.evDate]}>{e.date}</Text>
      <Text style={[T.med14, st.evTitle]} numberOfLines={1}>
        {e.title}
      </Text>
      <Text style={[T.body10, st.evVenue]} numberOfLines={1}>
        {e.venue}
      </Text>
      <Text style={[T.body11, st.evPrice]}>{e.price} onwards</Text>
      <Liked top={9 + 266 + 11} />
    </Tap>
  );
}

function Rail({ children, gap = 8 }: { children: React.ReactNode; gap?: number }) {
  return (
    <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginTop: gap }} contentContainerStyle={st.rail} snapToInterval={CARD_W + CARD_GAP} decelerationRate="fast">
      {children}
    </ScrollView>
  );
}

function PersonalizeBanner({ onStart, onSkip }: { onStart: () => void; onSkip: () => void }) {
  return (
    <View style={st.banner} testID="personalize-banner">
      <Svg width="100%" height={117} style={StyleSheet.absoluteFill}>
        <Defs>
          <LinearGradient id="bn" x1="0" y1="0" x2="1" y2="0">
            <Stop offset="0" stopColor="#E1F3D5" />
            <Stop offset="0.25" stopColor="#E5F8DA" />
            <Stop offset="0.46" stopColor="#E0F0D6" />
            <Stop offset="0.514" stopColor="#D3EED5" />
            <Stop offset="0.57" stopColor="#C7E5CD" />
            <Stop offset="0.605" stopColor="#C2DFCB" />
            <Stop offset="1" stopColor="#9CADC5" />
          </LinearGradient>
        </Defs>
        <Rect width="100%" height={117} fill="url(#bn)" />
      </Svg>
      <Image source={IMG.home.banner} style={st.bannerArt} />
      <Text style={[T.semi12, st.bannerTitle]}>Personalize your fitness journey</Text>
      <Text style={[T.body10, st.bannerSub]}>Get gym recommendations based on your goals, budget & workout style.</Text>
      <View style={st.bannerActions}>
        <Tap onPress={onStart} hitSlop={8} accessibilityRole="button">
          <Text style={[T.med10, { color: C.action }]}>Personalize now</Text>
        </Tap>
        <Tap onPress={onSkip} hitSlop={8} accessibilityRole="button" style={st.bannerSkip}>
          <Text style={[T.med10, { color: C.inkSoft }]}>Skip</Text>
        </Tap>
      </View>
    </View>
  );
}

/* ------------------------------------------------------------------ screen */

export default function Home({ navigation }: NativeStackScreenProps<Stack, 'Home'>) {
  const insets = useSafeAreaInsets();
  const dev = useDevScroll();
  const [showBanner, setShowBanner] = useState(true);
  return (
    <View style={st.root}>
      <ScrollView
        testID="home-scroll"
        ref={dev.ref}
        onContentSizeChange={dev.onContentSizeChange}
        contentContainerStyle={{ paddingTop: Math.max(insets.top, DESIGN_TOP), paddingBottom: 22 + insets.bottom }}
        showsVerticalScrollIndicator={false}>
        <Glow />
        <Header />
        <SearchBar />
        <Explore navigation={navigation} />
        <Text style={[T.section, st.spotHead]}>In The Spotlight</Text>
        <SpotlightCarousel />

        <SectionHeader title="Top Recommended Gym’s" onViewAll={() => navigation.navigate('Gyms')} style={{ marginTop: 32.29 }} />
        <Rail>
          {TOP_GYMS.map(g => (
            <VenueCard key={g.id} v={g} kind="gym" onPress={() => navigation.navigate('Gyms')} />
          ))}
        </Rail>

        {showBanner ? (
          <PersonalizeBanner onStart={() => navigation.navigate('Onboarding')} onSkip={() => setShowBanner(false)} />
        ) : null}

        <SectionHeader title="Badminton Courts Near You" onViewAll={() => navigation.navigate('Play')} style={{ marginTop: showBanner ? 35 : 28 }} />
        <Rail gap={10}>
          {COURTS_NEAR.map(c => (
            <VenueCard key={c.id} v={c} kind="court" onPress={() => navigation.navigate('Play')} />
          ))}
        </Rail>

        <SectionHeader title="Fitness Events" onViewAll={() => navigation.navigate('Events')} style={{ marginTop: 32 }} />
        <Rail gap={10}>
          {FITNESS_EVENTS.map(e => (
            <EventCard key={e.id} e={e} onPress={() => navigation.navigate('EventDetails', { id: e.id })} />
          ))}
        </Rail>
      </ScrollView>
    </View>
  );
}

const st = StyleSheet.create({
  root: { flex: 1, backgroundColor: C.bg },
  row: { flexDirection: 'row', alignItems: 'flex-start' },
  glow: { position: 'absolute', top: 0, left: 0 },

  header: { height: 45 },
  headerPin: { position: 'absolute', left: 21, top: 11 },
  headerText: { position: 'absolute', left: 50, top: 5.75, width: 217 },
  headerChevron: { marginLeft: 2.36, marginTop: 5.25 },
  address: { marginTop: 1.85 },
  avatar: { position: 'absolute', right: 18, top: 0, width: 45, height: 45, borderRadius: 22.5 },

  search: { marginTop: 30, marginHorizontal: 18, height: 44 },
  searchIcon: { position: 'absolute', left: 16, top: 12 },
  searchText: { position: 'absolute', left: 46.94, top: 13.66 },

  exploreTitle: { marginTop: 29.84, marginLeft: 18 },
  tiles: { flexDirection: 'row', justifyContent: 'space-between', marginHorizontal: 18 },

  spotHead: { marginTop: 29.92, marginLeft: 18 },
  spotScroll: { marginTop: 14.75, height: SPOT_H },
  spotRow: { gap: SPOT_STRIDE - SPOT_W, alignItems: 'flex-end' },
  spot: { width: SPOT_W, height: SPOT_H, borderRadius: 14, overflow: 'hidden', transformOrigin: 'bottom' },
  spotTitle: { marginTop: 8.03, textAlign: 'center' },
  spotSub: { marginTop: 2.68, textAlign: 'center', color: C.muted },

  rail: { paddingHorizontal: 18, gap: CARD_GAP },
  card: { width: CARD_W, borderRadius: 24, borderWidth: 1, borderColor: C.outline, padding: 9 },
  art148: { height: 148, borderRadius: 14, overflow: 'hidden', backgroundColor: '#000' },
  art: { overflow: 'hidden' },
  badge: { left: 167, top: 10.75 },
  strip: { position: 'absolute', left: 0, right: 0, bottom: 0, height: 20.5 },
  cashIcon: { position: 'absolute', left: 6, top: 4.5 },
  cashText: { position: 'absolute', left: 24, top: 5.56, color: '#FFFFFF' },
  gymTitle: { marginTop: 10.79, width: 170 },
  courtTitle: { marginTop: 9.87, width: 150, lineHeight: 19.75 },
  area: { flex: 1, color: C.muted },
  priceRow: { flexDirection: 'row', alignItems: 'baseline' },
  onwards: { color: C.muted, marginLeft: 6 },
  heart: { position: 'absolute', left: 9 + 199 },
  heartOn: { tintColor: '#EF4444' },

  evDate: { marginTop: 12.34, color: C.gold },
  evTitle: { marginTop: 3.44 },
  evVenue: { marginTop: 4.56, color: C.muted, width: 169 },
  evPrice: { marginTop: 5.38, color: C.muted },

  banner: { marginTop: 28, marginHorizontal: 18, height: 117, borderRadius: 18, overflow: 'hidden' },
  bannerArt: { position: 'absolute', right: 0, top: 0, width: 140, height: 117 },
  bannerTitle: { position: 'absolute', left: 14.87, top: 21.21, color: C.ink },
  bannerSub: { position: 'absolute', left: 14.98, top: 42.34, width: 200, lineHeight: 12, color: C.inkSoft },
  bannerActions: { position: 'absolute', left: 14.95, top: 84.73, flexDirection: 'row' },
  bannerSkip: { marginLeft: 15.02 },
});
