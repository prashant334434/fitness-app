import React, { useState } from 'react';
import { Image, ScrollView, Share, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { ChevronLeft, Heart, Upload } from 'lucide-react-native';
import { Tap } from '../components/ui';
import { Ico } from '../components/kit';
import { ICON } from '../assets/design';
import { eventDetail, EventDetail, InfoRow } from '../feed';
import { C, T } from '../theme';
import type { Stack } from '../nav';
import { useDevScroll } from '../dev';

/* Geometry (pt) from the 390 × 1790 export. */
const HERO_H = 424;
export const CTA_H = 66; // 19 top + 48 button; bottom = max(18, safe-area)

/** Back / like / share. When the hero art already contains the chrome these are hit areas only. */
function HeroChrome({ d, liked, onBack, onLike, onShare }: { d: EventDetail; liked: boolean; onBack: () => void; onLike: () => void; onShare: () => void }) {
  const chrome = !d.heroHasChrome;
  return (
    <>
      <Tap testID="hero-back" onPress={onBack} scaleTo={0.9} style={[st.heroBtn, { left: 18 }, chrome && st.glass]} accessibilityRole="button" accessibilityLabel="Back">
        {chrome ? <ChevronLeft color="#fff" size={22} strokeWidth={2} /> : null}
      </Tap>
      <Tap testID="hero-like" onPress={onLike} scaleTo={0.9} style={[st.heroBtn, { left: 282 }, chrome && st.glass]} accessibilityRole="button" accessibilityLabel="Like" accessibilityState={{ selected: liked }}>
        {chrome || liked ? <Heart color={liked ? '#EF4444' : '#fff'} fill={liked ? '#EF4444' : 'transparent'} size={18} strokeWidth={2} /> : null}
      </Tap>
      <Tap testID="hero-share" onPress={onShare} scaleTo={0.9} style={[st.heroBtn, { left: 332 }, chrome && st.glass]} accessibilityRole="button" accessibilityLabel="Share">
        {chrome ? <Upload color="#fff" size={17} strokeWidth={2} /> : null}
      </Tap>
    </>
  );
}

function LinkCard({ icon, title, sub, iconTop, onPress, style }: { icon: any; title: string; sub: string; iconTop: number; onPress?: () => void; style?: object }) {
  return (
    <Tap style={[st.linkCard, style]} scaleTo={0.98} onPress={onPress} accessibilityRole="button" accessibilityLabel={title}>
      <Ico icon={icon} style={[st.abs, { left: 14, top: iconTop }]} />
      <Text style={[T.body14, st.linkTitle]} numberOfLines={1}>
        {title}
      </Text>
      <Text style={[T.body12, st.linkSub]} numberOfLines={1}>
        {sub}
      </Text>
      <Ico icon={ICON.chevron} style={[st.abs, { left: 331, top: 23 }]} />
    </Tap>
  );
}

const CLAMP_LINES = 4;

/**
 * Cuts laid-out lines back to the last whole word and appends "...", the way the
 * design truncates ("…as a massive..."), instead of the platform's mid-word "mil…".
 */
export function clampToWords(lines: string[], max = CLAMP_LINES) {
  if (lines.length <= max) return null;
  const head = lines.slice(0, max - 1).join('');
  const last = lines[max - 1].replace(/\s+\S*$/, '').replace(/[\s,.;:]+$/, '');
  return `${head}${last}...`;
}

/** Paragraph clamped to 4 lines with a "Read more ›" toggle. */
function Clamp({ title, body, testID }: { title: string; body: string; testID: string }) {
  const [open, setOpen] = useState(false);
  const [short, setShort] = useState<string | null>(null);
  return (
    <View testID={testID}>
      <Text style={[T.section, st.h]}>{title}</Text>
      {/* invisible full-length layout pass that tells us where the lines break */}
      <Text
        style={[T.para12, st.para, st.measure]}
        onTextLayout={e => setShort(clampToWords(e.nativeEvent.lines.map(l => l.text)))}
        accessibilityElementsHidden
        importantForAccessibility="no-hide-descendants">
        {body}
      </Text>
      <Text style={[T.para12, st.para]} numberOfLines={open ? undefined : CLAMP_LINES} testID={`${testID}-body`}>
        {open || !short ? body : short}
      </Text>
      <Tap onPress={() => setOpen(o => !o)} style={st.readMore} hitSlop={8} accessibilityRole="button">
        <Text style={T.body12}>{open ? 'Read less' : 'Read more'}</Text>
        <Ico icon={ICON.readMore} style={[st.readIcon, open && st.flip]} />
      </Tap>
    </View>
  );
}

function Things({ rows }: { rows: InfoRow[] }) {
  return (
    <View style={st.things} testID="things-to-know">
      <Text style={[T.section, st.thingsTitle]}>Thing’s to know</Text>
      {rows.map((r, i) => (
        <View key={r.label}>
          {i ? <View style={st.thingsDivider} /> : null}
          <View style={st.thingRow}>
            <View style={st.thingIcon}>
              <Ico icon={r.icon} />
            </View>
            <Text style={[T.body12, st.thingText]}>{r.label}</Text>
          </View>
        </View>
      ))}
    </View>
  );
}

function Stat({ label, value, last }: { label: string; value: string; last?: boolean }) {
  return (
    <View style={st.stat}>
      <Text style={[T.body10, { color: C.faint }]}>{label}</Text>
      <Text style={[T.semi12, st.statValue]}>{value}</Text>
      {last ? null : <View style={st.statDivider} />}
    </View>
  );
}

function MoreRow({ icon, label, divider }: { icon: any; label: string; divider?: boolean }) {
  return (
    <>
      {divider ? <View style={st.moreDivider} /> : null}
      <Tap style={st.moreRow} scaleTo={0.98} accessibilityRole="button" accessibilityLabel={label}>
        <View style={st.moreIcon}>
          <Ico icon={icon} />
        </View>
        <Text style={[T.body12, st.moreText]}>{label}</Text>
        <Ico icon={ICON.chevron} style={st.moreChevron} />
      </Tap>
    </>
  );
}

export default function EventDetails({ navigation, route }: NativeStackScreenProps<Stack, 'EventDetails'>) {
  const insets = useSafeAreaInsets();
  const dev = useDevScroll();
  const d = eventDetail(route.params.id);
  const [liked, setLiked] = useState(false);
  if (!d) {
    return (
      <View style={[st.root, st.center]}>
        <Text style={T.body14}>This event is no longer available.</Text>
      </View>
    );
  }
  const bottom = Math.max(18, insets.bottom);
  return (
    <View style={st.root}>
      <ScrollView testID="event-scroll" ref={dev.ref} onContentSizeChange={dev.onContentSizeChange} showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: CTA_H + bottom + 30 }}>
        <View style={st.hero}>
          <Image source={d.hero} style={st.heroImg} resizeMode="cover" accessibilityIgnoresInvertColors />
          <HeroChrome
            d={d}
            liked={liked}
            onBack={() => navigation.goBack()}
            onLike={() => setLiked(v => !v)}
            onShare={() => Share.share({ message: `${d.title} · ${d.when} · ${d.venue}` })}
          />
        </View>

        <View style={st.tags}>
          {d.tags.map(t => (
            <View key={t} style={st.tag}>
              <Text style={T.body12}>{t}</Text>
            </View>
          ))}
        </View>
        <Text style={[T.title18, st.title]}>{d.title}</Text>
        <Text style={[T.body14, st.when]}>{d.when}</Text>

        <LinkCard icon={ICON.pin} iconTop={18} title={d.venue} sub={d.distance} style={{ marginTop: 14.8 }} />
        <LinkCard icon={ICON.clock} iconTop={20} title={d.gates} sub="View full schedule & timeline" style={{ marginTop: 10 }} />

        <View style={{ marginTop: 29.5 }}>
          <Clamp title="About the event" body={d.about} testID="about" />
        </View>
        <Things rows={d.thingsToKnow} />
        <View style={{ marginTop: 55.25 }}>
          <Clamp title="Instructions" body={d.instructions} testID="instructions" />
        </View>

        <Text style={[T.section, st.h, { marginTop: 31.32 }]}>Organized by</Text>
        <View style={st.org} testID="organizer">
          <View style={st.orgLeft}>
            <Image source={d.organizer.avatar} style={st.orgAvatar} />
            <Text style={[T.semi12, st.orgName]}>{d.organizer.name}</Text>
          </View>
          <View style={st.orgLine} />
          <View style={st.stats}>
            <Stat label="Liked (<100 rating)" value={d.organizer.liked} />
            <Stat label="Hosted events" value={d.organizer.hosted} />
            <Stat label="Hosting" value={d.organizer.hosting} last />
          </View>
        </View>

        <Text style={[T.section, st.h, st.moreHead]}>More</Text>
        <View style={st.more}>
          <MoreRow icon={ICON.faq} label="Frequently asked questions" />
          <MoreRow icon={ICON.terms} label="Terms and conditions" divider />
        </View>
      </ScrollView>

      <View style={[st.cta, { height: CTA_H + bottom }]} testID="event-cta">
        <View style={st.ctaPrice}>
          <Text style={T.semi16}>{d.priceFrom}</Text>
          <Text style={[T.body12, st.ctaOnwards]}>onwards</Text>
        </View>
        <Tap
          testID="book-tickets"
          style={st.book}
          scaleTo={0.96}
          onPress={() => navigation.navigate('Booking', { kind: 'event', id: d.id })}
          accessibilityRole="button">
          <Text style={[T.cta14, st.bookText]}>Book tickets</Text>
        </Tap>
      </View>
    </View>
  );
}

const st = StyleSheet.create({
  root: { flex: 1, backgroundColor: C.bg },
  center: { alignItems: 'center', justifyContent: 'center' },
  abs: { position: 'absolute' },

  hero: { height: HERO_H, borderBottomLeftRadius: 38, borderBottomRightRadius: 38, overflow: 'hidden' },
  heroImg: { width: 390, height: HERO_H },
  heroBtn: { position: 'absolute', top: 41, width: 40, height: 40, borderRadius: 12, alignItems: 'center', justifyContent: 'center' },
  glass: { borderWidth: 1, borderColor: C.glass, backgroundColor: 'rgba(0,0,0,0.12)' },

  tags: { flexDirection: 'row', gap: 10, marginTop: 20, marginLeft: 18 },
  tag: { height: 28, borderRadius: 14, backgroundColor: C.surface, paddingHorizontal: 13, paddingTop: 5.6 },
  title: { marginTop: 10.26, marginLeft: 18 },
  when: { marginTop: 5.61, marginLeft: 18, color: C.cream },

  linkCard: { marginHorizontal: 18, height: 60, borderRadius: 16, backgroundColor: C.surface },
  linkTitle: { position: 'absolute', left: 48.8, top: 9.62, right: 50 },
  linkSub: { position: 'absolute', left: 48.8, top: 31.6, color: C.muted },

  h: { marginLeft: 18 },
  para: { marginTop: 9.57, marginHorizontal: 18 },
  measure: { position: 'absolute', opacity: 0, left: 0, right: 0, top: 0 },
  readMore: { flexDirection: 'row', marginTop: 5.52, marginLeft: 18, alignSelf: 'flex-start' },
  readIcon: { marginLeft: 3.48, marginTop: 4.4 },
  flip: { transform: [{ rotate: '-90deg' }] },

  things: { marginTop: 31.4, marginHorizontal: 18, borderRadius: 15, backgroundColor: C.surface, paddingTop: 14.92, paddingBottom: 13.4 },
  thingsTitle: { marginLeft: 15, marginBottom: 12.43 },
  thingRow: { height: 16, flexDirection: 'row', alignItems: 'center' },
  thingIcon: { width: 18, marginLeft: 16, alignItems: 'center' },
  thingText: { marginLeft: 11, flex: 1 },
  thingsDivider: { height: 1, marginLeft: 15, marginRight: 15.25, backgroundColor: C.divider, marginTop: 11.94, marginBottom: 10.37 },

  org: { marginTop: 9.41, marginHorizontal: 18, height: 188, borderRadius: 24, backgroundColor: C.surface, flexDirection: 'row' },
  orgLeft: { width: 167, alignItems: 'center', paddingTop: 38.5 },
  orgAvatar: { width: 70, height: 70, borderRadius: 35, marginLeft: 1 },
  orgName: { marginTop: 10.71, lineHeight: 14.9, textAlign: 'center', width: 140 },
  orgLine: { width: 1, marginTop: 20, height: 148, backgroundColor: C.divider },
  stats: { marginTop: 20 },
  stat: { marginLeft: 19, width: 147, height: 57, paddingTop: 0.34 },
  statValue: { marginTop: 5.34 },
  statDivider: { position: 'absolute', left: 0, right: 0, top: 45, height: 1, backgroundColor: C.divider },

  moreHead: { marginTop: 29.95 },
  more: { marginTop: 10.05, marginHorizontal: 18, height: 92, borderRadius: 24, backgroundColor: C.surface, paddingTop: 16.35 },
  moreRow: { height: 16, flexDirection: 'row', alignItems: 'center' },
  moreIcon: { width: 20, marginLeft: 14.5, alignItems: 'center' },
  moreText: { marginLeft: 6.5, flex: 1 },
  moreChevron: { marginRight: 14, marginTop: 3.3 },
  moreDivider: { height: 1, marginHorizontal: 15, backgroundColor: C.divider, marginTop: 14.65, marginBottom: 13.35 },

  cta: { position: 'absolute', left: 0, right: 0, bottom: 0, backgroundColor: C.footer, flexDirection: 'row', paddingTop: 19, paddingHorizontal: 18, justifyContent: 'space-between' },
  ctaPrice: { flexDirection: 'row', alignItems: 'baseline', marginTop: 14.12 },
  ctaOnwards: { color: C.muted, marginLeft: 4.95 },
  book: { width: 139, height: 48, borderRadius: 24, backgroundColor: C.action, alignItems: 'center', justifyContent: 'center' },
  bookText: { color: '#FFFFFF' },
});
