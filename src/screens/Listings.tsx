import React, { useState } from 'react';
import { ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Animated, { Easing, FadeInDown, FadeOut, LinearTransition } from 'react-native-reanimated';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { Search } from 'lucide-react-native';
import { Chips, CourtCard, EventCard, GymCard, ScreenHeader } from '../components/cards';
import { COURTS, EVENT_CATS, EVENTS, GYM_TAGS, GYMS, SPORTS } from '../data';
import { C, F, PAD } from '../theme';
import type { Stack } from '../nav';

const ease = Easing.bezier(0.22, 1, 0.36, 1);

/** Item wrapper: staggered entrance, fade on filter-out, smooth re-flow. */
function Item({ i, children }: { i: number; children: React.ReactNode }) {
  return (
    <Animated.View
      entering={FadeInDown.delay(60 + i * 70).duration(450).easing(ease)}
      exiting={FadeOut.duration(150)}
      layout={LinearTransition.duration(300).easing(ease)}
      style={{ marginBottom: 14 }}>
      {children}
    </Animated.View>
  );
}

function Shell({ title, subtitle, children, top }: { title: string; subtitle: string; children: React.ReactNode; top?: React.ReactNode }) {
  const insets = useSafeAreaInsets();
  return (
    <View style={st.root}>
      <ScreenHeader title={title} subtitle={subtitle} />
      {top}
      <ScrollView contentContainerStyle={{ padding: PAD, paddingBottom: insets.bottom + 24 }} showsVerticalScrollIndicator={false}>
        {children}
      </ScrollView>
    </View>
  );
}

function Empty() {
  return <Text style={st.empty}>Nothing matches — try another filter.</Text>;
}

export function Gyms({ navigation }: NativeStackScreenProps<Stack, 'Gyms'>) {
  const [tag, setTag] = useState('All');
  const [q, setQ] = useState('');
  const list = GYMS.filter(
    g => (tag === 'All' || g.tags.includes(tag)) && (g.name + g.area).toLowerCase().includes(q.trim().toLowerCase()),
  );
  return (
    <Shell
      title="Gyms"
      subtitle="Day passes near you"
      top={
        <>
          <View style={st.search}>
            <Search size={16} color={C.sub} />
            <TextInput
              value={q}
              onChangeText={setQ}
              placeholder="Search gyms or areas"
              placeholderTextColor={C.dim}
              style={st.input}
            />
          </View>
          <Chips items={GYM_TAGS} value={tag} onChange={setTag} />
        </>
      }>
      {list.map((g, i) => (
        <Item key={g.id} i={i}>
          <GymCard g={g} onPress={() => navigation.navigate('Booking', { kind: 'gym', id: g.id })} />
        </Item>
      ))}
      {list.length === 0 ? <Empty /> : null}
    </Shell>
  );
}

export function Play({ navigation }: NativeStackScreenProps<Stack, 'Play'>) {
  const [sport, setSport] = useState(SPORTS[0]);
  const list = COURTS.filter(c => c.sport === sport);
  return (
    <Shell title="Play" subtitle="Book courts & turfs" top={<Chips items={SPORTS} value={sport} onChange={setSport} />}>
      {list.map((c, i) => (
        <Item key={c.id} i={i}>
          <CourtCard c={c} onPress={() => navigation.navigate('Booking', { kind: 'court', id: c.id })} />
        </Item>
      ))}
    </Shell>
  );
}

export function Events({ navigation }: NativeStackScreenProps<Stack, 'Events'>) {
  const [cat, setCat] = useState('All');
  const list = EVENTS.filter(e => cat === 'All' || e.category === cat);
  return (
    <Shell title="Events" subtitle="Races, rides & challenges" top={<Chips items={EVENT_CATS} value={cat} onChange={setCat} />}>
      {list.map((e, i) => (
        <Item key={e.id} i={i}>
          <EventCard e={e} onPress={() => navigation.navigate('EventDetails', { id: e.id })} />
        </Item>
      ))}
    </Shell>
  );
}

const st = StyleSheet.create({
  root: { flex: 1, backgroundColor: C.bg },
  search: {
    marginHorizontal: PAD,
    marginBottom: 14,
    height: 46,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: C.border,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 14,
  },
  input: { flex: 1, marginLeft: 10, color: C.text, fontFamily: F.med, fontSize: 13, padding: 0 },
  empty: { color: C.sub, fontFamily: F.med, fontSize: 13, textAlign: 'center', marginTop: 40 },
});
