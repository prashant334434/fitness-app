/**
 * Building blocks shared by the Home / Event details / Review Booking screens.
 * All geometry is in design points measured from the 390pt-wide exports.
 */
import React from 'react';
import { Image, ImageProps, ImageSourcePropType, StyleSheet, Text, View, ViewStyle, StyleProp } from 'react-native';
import { ICON, size } from '../assets/design';
import { C, T } from '../theme';
import { Tap } from './ui';

/** Renders a 4× design asset at its native design size. */
export function Ico({ icon, style, ...rest }: { icon: ImageSourcePropType; style?: ImageProps['style'] } & Omit<ImageProps, 'source' | 'src'>) {
  return <Image source={icon} style={[size(icon), style]} {...rest} />;
}

/** Section title with the white "View all ›" pill (24pt tall, 70pt wide). */
export function SectionHeader({ title, onViewAll, style }: { title: string; onViewAll?: () => void; style?: StyleProp<ViewStyle> }) {
  return (
    <View style={[s.head, style]}>
      <Text style={[T.section, s.headTitle]}>{title}</Text>
      {onViewAll ? (
        <Tap onPress={onViewAll} style={s.pill} hitSlop={8} accessibilityRole="button" accessibilityLabel={`View all ${title}`}>
          <Text style={[T.med10, s.pillText]}>View all</Text>
          <Ico icon={ICON.viewAll} style={s.pillIcon} />
        </Tap>
      ) : null}
    </View>
  );
}

/** "★ 4.1" badge used on venue artwork. */
export function RatingBadge({ value, style }: { value: number; style?: StyleProp<ViewStyle> }) {
  return (
    <View style={[s.badge, style]} accessibilityLabel={`Rated ${value}`}>
      <Ico icon={ICON.star} style={s.star} />
      <Text style={[T.semi12, s.badgeText]}>{value.toFixed(1)}</Text>
    </View>
  );
}

/** Small round separator between "1.5 km" and the area. */
export const Dot = () => <View style={s.dot} />;

export const s = StyleSheet.create({
  head: { height: 24, marginHorizontal: 18, flexDirection: 'row', justifyContent: 'space-between' },
  headTitle: { marginTop: 2 },
  pill: { width: 70, height: 24, borderRadius: 12, backgroundColor: '#FFFFFF', flexDirection: 'row', alignItems: 'center', paddingLeft: 11 },
  pillText: { color: C.ink, marginTop: 0.47 },
  pillIcon: { marginLeft: 5.2 },
  badge: {
    position: 'absolute',
    width: 40,
    height: 16,
    borderRadius: 8,
    backgroundColor: C.rating,
  },
  star: { position: 'absolute', left: 7, top: 3.25 },
  badgeText: { position: 'absolute', left: 18.8, top: 1.17, color: '#FFFFFF', fontSize: 10, lineHeight: 14 },
  dot: { width: 2.25, height: 2.25, borderRadius: 1.125, backgroundColor: C.muted, marginTop: 7.9, marginLeft: 8.42, marginRight: 7.88 },
});
