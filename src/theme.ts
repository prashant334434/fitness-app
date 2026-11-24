import type { TextStyle } from 'react-native';

export const C = {
  bg: '#0F0F0F',
  card: '#151515',
  cardHi: '#1B1B1B',
  border: '#262626',
  borderHi: '#3A3A3A',
  text: '#FFFFFF',
  sub: '#9A9A9A',
  dim: '#5C5C5C',
  blue: '#3B82F6',
  blueDim: '#1E3A6E',
  green: '#22C55E',

  /* tokens sampled from the Home / Event / Booking design exports */
  surface: '#1B1B1B', // filled cards
  footer: '#1C1C1C', // sticky CTA bar
  outline: '#272727', // outlined cards (gym / court / event tiles)
  divider: '#323232',
  muted: 'rgba(255,255,255,0.7)', // secondary copy — #B7B7B7 on bg, #BBBBBB on surface
  faint: 'rgba(255,255,255,0.6)',
  hint: 'rgba(255,255,255,0.5)',
  action: '#4285F4', // CTAs, timer, links
  rating: '#34A853',
  gold: '#FFE392', // event date on cards
  cream: '#FFF1CE', // event date on details
  ink: '#242424', // dark text on light surfaces
  inkSoft: '#6B6B6B',
  note: '#131E16', // green info note
  glass: 'rgba(255,255,255,0.5)', // hairline on the hero buttons
  backBorder: '#878787',
};

export const F = {
  head: 'Lexend-SemiBold',
  headBold: 'Lexend-Bold',
  headMed: 'Lexend-Medium',
  reg: 'Montserrat-Regular',
  med: 'Montserrat-Medium',
  semi: 'Montserrat-SemiBold',
  bold: 'Montserrat-Bold',
};

export const PAD = 18;

/**
 * The exports render Montserrat ~1.6% wider than CoreText/Skia do with the same file
 * (measured on 30+ strings, 8–16pt, all weights): a constant 0.0085em of tracking.
 * Lexend needs none.
 */
export const MONTSERRAT_TRACKING = 0.0085;

/**
 * Text style with an explicit line box. Every size/line-height pair below was solved
 * from the 4× exports so that each glyph's baseline lands on the design's baseline;
 * scripts/visual-diff.py verifies the result on device.
 */
const t = (fontFamily: string, fontSize: number, lineHeight: number, color: string = C.text): TextStyle => ({
  fontFamily,
  fontSize,
  lineHeight,
  color,
  ...(fontFamily.startsWith('Montserrat') ? { letterSpacing: +(fontSize * MONTSERRAT_TRACKING).toFixed(3) } : null),
});

export const T = {
  section: t(F.head, 16, 20),
  title18: t(F.head, 18, 24),
  cta14: t(F.head, 14, 18),
  label12: t(F.head, 12, 16),
  spotTitle: t(F.headMed, 14, 18),

  body14: t(F.reg, 14, 18),
  body12: t(F.reg, 12, 16),
  para12: t(F.reg, 12, 18, C.muted),
  body10: t(F.reg, 10, 14),
  body11: t(F.reg, 11, 14),
  body16: t(F.reg, 16, 20),
  med14: t(F.med, 14, 18),
  med12: t(F.med, 12, 16),
  med10: t(F.med, 10, 14),
  semi16: t(F.semi, 16, 20),
  semi14: t(F.semi, 14, 18),
  semi12: t(F.semi, 12, 16),
  semi8: t(F.semi, 8, 10),
  bold15: t(F.bold, 15, 20),
};
