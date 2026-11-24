/**
 * View models for the Home feed, Event details and Review Booking screens.
 * Content mirrors the design exports; `eventDetail` / `bookable` adapt the legacy
 * listing data (src/data.ts) into the same shapes so every route resolves.
 */
import type { ImageSourcePropType } from 'react-native';
import { IMG, ICON } from './assets/design';
import { COURTS, EVENTS, GYMS } from './data';
import type { Stack } from './nav';

type Img = ImageSourcePropType;

export const USER = {
  name: 'Shubham Sharma',
  phone: '+91-9876543210',
  email: 'shubham@gmail.com',
  city: 'Greater Noida',
  avatar: IMG.home.avatar as Img,
  location: 'Moti Nagar Rd, DLE Industrial area, New Delhi',
};

export type ExploreKey = keyof typeof IMG.home.tiles;
export const EXPLORE: { key: ExploreKey; label: string; route?: keyof Stack }[] = [
  { key: 'fitness', label: 'Fitness', route: 'Gyms' },
  { key: 'sports', label: 'Sports', route: 'Play' },
  { key: 'shop', label: 'Shop' },
  { key: 'events', label: 'Events', route: 'Events' },
  { key: 'activity', label: 'Activity' },
  { key: 'meals', label: 'Meals' },
  { key: 'trainer', label: 'Trainer' },
  { key: 'wellness', label: 'Wellness' },
];

/** `crop` marks artwork that only exists as the sliver visible in the export. */
export type Spotlight = { id: string; title: string; subtitle: string; image: Img; crop?: 'left' | 'right' };
export const SPOTLIGHT: Spotlight[] = [
  { id: 's1', title: 'Let’s Go Training', subtitle: 'Strength programs to kickstart your week', image: IMG.home.spotLeft, crop: 'right' },
  { id: 's2', title: 'This Diwali Edit', subtitle: 'Discover feasts, flavors & festive tables', image: IMG.home.spotCenter },
  { id: 's3', title: 'Hardcore Tutorial', subtitle: 'Sculpt with guided dumbbell routines', image: IMG.home.spotRight, crop: 'left' },
];

export type Venue = {
  id: string;
  name: string;
  km: number;
  area: string;
  price: string;
  unit?: string;
  rating?: number;
  cashback?: string;
  image: Img;
};

export const TOP_GYMS: Venue[] = [
  { id: 'g1', name: 'The Iron Office Gym', km: 1.5, area: 'Bisrakh Jalalpur, Greater Noida', price: '₹1200', unit: '/mon', rating: 4.1, image: IMG.home.gym1 },
  { id: 'g2', name: 'Elevate Your Fitness', km: 1.2, area: 'Bisrakh Jalalpur, Greater Noida', price: '₹1500', unit: '/mon', image: IMG.home.gym2 },
];

export const COURTS_NEAR: Venue[] = [
  { id: 'c1', name: 'Love All Play Badminton Arena', km: 1.5, area: 'Bisrakh Jalalpur, Greater Noida', price: '₹299', rating: 4.1, cashback: '2% Cashback on every booking', image: IMG.home.court1 },
  { id: 'c2', name: 'Youth Badminton Academy', km: 2.5, area: 'Bisrakh Jalalpur, Greater Noida', price: '₹399', image: IMG.home.court2 },
];

export type FeedEvent = { id: string; date: string; title: string; venue: string; price: string; image: Img };
export const FITNESS_EVENTS: FeedEvent[] = [
  { id: 'city-half-marathon', date: 'Sun, 29 March', title: 'Bounce Monsoon Fun', venue: 'Omaxe Club and Convention Centre', price: '₹650', image: IMG.home.event1 },
  { id: 'bounce-2', date: 'Sun, 29 March', title: 'Bounce Monsoon Fun', venue: 'Omaxe Club and Convention Centre', price: '₹650', image: IMG.home.event2 },
];

/* ---------------------------------------------------------------- event details */

export type InfoRow = { icon: Img; label: string };
export type EventDetail = {
  id: string;
  hero: Img;
  /** true when the hero art already contains the back / like / share chrome (design export) */
  heroHasChrome: boolean;
  tags: string[];
  title: string;
  when: string;
  venue: string;
  distance: string;
  gates: string;
  about: string;
  instructions: string;
  thingsToKnow: InfoRow[];
  organizer: { name: string; avatar: Img; liked: string; hosted: string; hosting: string };
  priceFrom: string;
};

const HALF_MARATHON =
  'A half marathon is a road-running event covering exactly \\(21.0975\\) kilometers (or \\(13.1\\) miles). It is exactly half the distance of a standard marathon. As one of the most popular race distances globally, it serves as a massive milestone for runners of every level.';

const THINGS: InfoRow[] = [
  { icon: ICON.language, label: 'Event will be in Hindi, English' },
  { icon: ICON.users, label: 'Ticket needed for ages 15 and above' },
  { icon: ICON.ticket, label: 'Entry allowed for ages 15 and above' },
  { icon: ICON.kid, label: 'Kid friendly' },
  { icon: ICON.noPets, label: 'Pets not allowed' },
];

const ORGANIZER = {
  name: 'Game Of Life Sports Pvt Ltd',
  avatar: IMG.event.organizer as Img,
  liked: '47%',
  hosted: '13',
  hosting: '2 Years',
};

const DETAILS: Record<string, EventDetail> = {
  'city-half-marathon': {
    id: 'city-half-marathon',
    hero: IMG.event.hero,
    heroHasChrome: true,
    tags: ['Marathon', 'Spots', 'Fitness Events'],
    title: 'India’s Biggest City Half Marathon',
    when: 'Sat, 14 Mar, 7:00 AM',
    venue: 'Jawaharlal Nehru Stadium, Delhi',
    distance: '34.2 km away',
    gates: 'Gates open at 5 AM',
    about: HALF_MARATHON,
    instructions: HALF_MARATHON,
    thingsToKnow: THINGS,
    organizer: ORGANIZER,
    priceFrom: '₹699',
  },
};

export function eventDetail(id: string): EventDetail | undefined {
  if (DETAILS[id]) return DETAILS[id];
  const feed = FITNESS_EVENTS.find(e => e.id === id);
  if (feed) {
    return { ...DETAILS['city-half-marathon'], id, hero: feed.image, heroHasChrome: false, title: feed.title, venue: feed.venue, priceFrom: feed.price };
  }
  const e = EVENTS.find(x => x.id === id);
  if (!e) return undefined;
  return {
    id,
    hero: { uri: e.image },
    heroHasChrome: false,
    tags: [e.category, 'Fitness Events'],
    title: e.title,
    when: `${e.date}, ${e.time}`,
    venue: e.venue,
    distance: e.address,
    gates: `Reporting 30 min before ${e.time}`,
    about: e.about,
    instructions: e.about,
    thingsToKnow: THINGS,
    organizer: { ...ORGANIZER, name: e.host },
    priceFrom: e.price ? `₹${e.price}` : 'Free',
  };
}

/* ---------------------------------------------------------------- booking */

export type Bookable = {
  name: string;
  venue: string;
  image: Img;
  date: string;
  time: string;
  ticket: string;
  price: number;
};

/** Booking fee incl. GST, as shown in the design (₹33 on ₹1000). */
export const bookingFee = (amount: number) => Math.round(amount * 0.033);
export const COUPON = { title: 'Flat ₹100 OFF', subtitle: 'Exclusive offer on OBSESS', off: 100 };
export const HOLD_SECONDS = 10 * 60 - 1;

const BOULDERBOX: Bookable = {
  name: 'Boulderbox',
  venue: 'BoulderBox - Climbing Centre, Delhi',
  image: IMG.booking.thumb,
  date: 'September 10',
  time: '7:00 AM',
  ticket: 'Regular Ticket',
  price: 1000,
};

export function bookable(kind: 'gym' | 'court' | 'event', id: string): Bookable | undefined {
  if (id === 'boulderbox') return BOULDERBOX;
  if (kind === 'event') {
    const d = eventDetail(id);
    if (!d) return undefined;
    const price = Number(d.priceFrom.replace(/[^\d]/g, '')) || 0;
    const parts = d.when.split(', ');
    const time = parts.length > 1 ? parts.pop()! : '';
    return { name: d.title, venue: d.venue, image: d.hero, date: parts.join(', '), time, ticket: 'Regular Ticket', price };
  }
  const g = kind === 'gym' ? GYMS.find(x => x.id === id) : undefined;
  const c = kind === 'court' ? COURTS.find(x => x.id === id) : undefined;
  const v = g ?? c;
  if (!v) return undefined;
  return { name: v.name, venue: v.area, image: { uri: v.image }, date: 'Today', time: g ? g.open : '6:00 AM', ticket: g ? 'Day Pass' : 'Court · 1 hr', price: v.price };
}
