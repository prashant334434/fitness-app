import {
  Activity,
  Armchair,
  Bike,
  CalendarCheck,
  CalendarDays,
  Clock,
  Crown,
  Dumbbell,
  Flame,
  Flower2,
  Footprints,
  HeartPulse,
  LucideIcon,
  PersonStanding,
  Sprout,
  Timer,
  TrendingUp,
  Trophy,
  Zap,
} from 'lucide-react-native';

const img = (id: string, w = 900) => `https://images.unsplash.com/photo-${id}?w=${w}&q=70&auto=format&fit=crop`;

type Opt = { label: string; Icon: LucideIcon };
export const LIST_STEPS: { key: string; title: string; options: Opt[] }[] = [
  {
    key: 'goal',
    title: 'What’s your primary goal?',
    options: [
      { label: 'Fat loss', Icon: Flame },
      { label: 'Muscle gain / bodybuilding', Icon: Dumbbell },
      { label: 'Strength training', Icon: Zap },
      { label: 'Running', Icon: Footprints },
      { label: 'Cycling', Icon: Bike },
      { label: 'Sports performance', Icon: Trophy },
      { label: 'Yoga / Flexibility', Icon: Flower2 },
      { label: 'Endurance / Hybrid Training', Icon: HeartPulse },
      { label: 'Event Preparation', Icon: CalendarCheck },
    ],
  },
  {
    key: 'when',
    title: 'When do you want results?',
    options: [
      { label: 'In 30 days', Icon: CalendarDays },
      { label: 'In 60 days', Icon: CalendarDays },
      { label: 'In 90 days', Icon: CalendarDays },
      { label: 'In 6 months+', Icon: Timer },
      { label: 'No deadline / lifestyle change', Icon: Clock },
    ],
  },
  {
    key: 'activity',
    title: 'Daily activity level?',
    options: [
      { label: 'Mostly Sitting (Desk job)', Icon: Armchair },
      { label: 'Lightly Active (Walks, chores)', Icon: PersonStanding },
      { label: 'Moderately Active', Icon: Activity },
      { label: 'Highly Active', Icon: Zap },
    ],
  },
  {
    key: 'experience',
    title: 'What’s your fitness experience?',
    options: [
      { label: 'Beginner', Icon: Sprout },
      { label: 'Intermediate', Icon: TrendingUp },
      { label: 'Advanced', Icon: Zap },
      { label: 'Athlete / Highly experienced', Icon: Crown },
    ],
  },
  {
    key: 'days',
    title: 'Training days/week?',
    options: [
      { label: '2 Days', Icon: CalendarDays },
      { label: '3 Days', Icon: CalendarDays },
      { label: '4 Days', Icon: CalendarDays },
      { label: '6+ Days', Icon: CalendarDays },
    ],
  },
];

export type Gym = {
  id: string;
  name: string;
  area: string;
  km: number;
  rating: number;
  tags: string[];
  price: number;
  image: string;
  open: string;
};
export const GYMS: Gym[] = [
  { id: 'g1', name: 'Iron Republic', area: 'Indiranagar', km: 1.2, rating: 4.8, tags: ['Strength', '24/7'], price: 299, image: img('1534438327276-14e5300c3a48'), open: 'Open 24 hours' },
  { id: 'g2', name: 'Pulse Athletic Club', area: 'Koramangala', km: 2.4, rating: 4.6, tags: ['CrossFit', 'Cardio'], price: 349, image: img('1540497077202-7c8a3999166f'), open: '5:00 AM – 11:00 PM' },
  { id: 'g3', name: 'The Forge', area: 'HSR Layout', km: 3.1, rating: 4.7, tags: ['Strength', 'CrossFit'], price: 399, image: img('1517836357463-d25dfeac3438'), open: '6:00 AM – 10:00 PM' },
  { id: 'g4', name: 'Stillwater Yoga', area: 'Domlur', km: 1.8, rating: 4.9, tags: ['Yoga'], price: 249, image: img('1544367567-0f2fcb009e0b'), open: '6:00 AM – 9:00 PM' },
  { id: 'g5', name: 'Zone Fitness', area: 'Whitefield', km: 6.5, rating: 4.4, tags: ['Cardio', '24/7'], price: 199, image: img('1593079831268-3381b0db4a77'), open: 'Open 24 hours' },
];
export const GYM_TAGS = ['All', 'Strength', 'CrossFit', 'Cardio', 'Yoga', '24/7'];

export type Court = { id: string; name: string; sport: string; area: string; km: number; price: number; image: string; rating: number };
export const SPORTS = ['Badminton', 'Football', 'Tennis', 'Basketball'];
export const COURTS: Court[] = [
  { id: 'c1', name: 'Smash Arena', sport: 'Badminton', area: 'Indiranagar', km: 1.5, price: 400, rating: 4.7, image: img('1626224583764-f87db24ac4ea') },
  { id: 'c2', name: 'Shuttle Hub', sport: 'Badminton', area: 'HSR Layout', km: 3.4, price: 350, rating: 4.5, image: img('1626224583764-f87db24ac4ea') },
  { id: 'c3', name: 'Turf Park 5s', sport: 'Football', area: 'Koramangala', km: 2.2, price: 1200, rating: 4.6, image: img('1574629810360-7efbbe195018') },
  { id: 'c4', name: 'Floodlight Field', sport: 'Football', area: 'Bellandur', km: 5.9, price: 1500, rating: 4.4, image: img('1431324155629-1a6deb1dec8d') },
  { id: 'c5', name: 'Clay Court Club', sport: 'Tennis', area: 'Cubbon Park', km: 4.1, price: 800, rating: 4.8, image: img('1554068865-24cecd4e34b8') },
  { id: 'c6', name: 'Baseline Courts', sport: 'Tennis', area: 'Jayanagar', km: 6.3, price: 700, rating: 4.5, image: img('1595435934249-5df7ed86e1c0') },
  { id: 'c7', name: 'Hoops Central', sport: 'Basketball', area: 'Indiranagar', km: 1.1, price: 600, rating: 4.6, image: img('1546519638-68e109498ffc') },
  { id: 'c8', name: 'Outdoor Court 3', sport: 'Basketball', area: 'Ulsoor', km: 2.8, price: 300, rating: 4.2, image: img('1519861531473-9200262188bf') },
];

export type Event = {
  id: string;
  title: string;
  category: string;
  date: string;
  day: string;
  month: string;
  time: string;
  venue: string;
  address: string;
  price: number;
  going: number;
  spots: number;
  image: string;
  host: string;
  about: string;
  highlights: string[];
};
export const EVENTS: Event[] = [
  {
    id: 'e1',
    title: 'City Half Marathon 2026',
    category: 'Running',
    date: 'Sun, 7 Dec',
    day: '07',
    month: 'DEC',
    time: '5:30 AM',
    venue: 'Kanteerava Stadium',
    address: 'Kasturba Rd, Bengaluru',
    price: 1499,
    going: 2840,
    spots: 160,
    image: img('1452626038306-9aae5e071dd3', 1200),
    host: 'Runners Collective',
    about:
      'A flat, fast 21.1 km loop through the heart of the city with timing chips, hydration every 2.5 km and a finisher medal. Pacers for 1:45, 2:00 and 2:15 finishes.',
    highlights: ['Timing chip', 'Finisher medal', 'Pacers', 'Post-race breakfast'],
  },
  {
    id: 'e2',
    title: 'Sunrise Riders 60K',
    category: 'Cycling',
    date: 'Sat, 13 Dec',
    day: '13',
    month: 'DEC',
    time: '6:00 AM',
    venue: 'Nandi Hills Base',
    address: 'Nandi Hills, Chikkaballapur',
    price: 799,
    going: 412,
    spots: 38,
    image: img('1517649763962-0c623066013b', 1200),
    host: 'Spoke & Chain',
    about:
      'A group climb to watch the sunrise above the clouds, followed by a fast descent and coffee. Support vehicle and mechanic on route.',
    highlights: ['Support vehicle', 'Mechanic on route', 'Coffee stop'],
  },
  {
    id: 'e3',
    title: 'Hybrid Fitness Challenge',
    category: 'Hybrid',
    date: 'Sat, 20 Dec',
    day: '20',
    month: 'DEC',
    time: '8:00 AM',
    venue: 'The Forge',
    address: 'HSR Layout, Bengaluru',
    price: 999,
    going: 186,
    spots: 14,
    image: img('1581009146145-b5ef050c2e1e', 1200),
    host: 'The Forge',
    about:
      '8 × 1 km runs, each followed by a functional station: sled push, wall balls, rowing and more. Solo and doubles categories.',
    highlights: ['Solo & doubles', 'Live leaderboard', 'Recovery zone'],
  },
  {
    id: 'e4',
    title: 'Sunset Run Club',
    category: 'Running',
    date: 'Wed, 3 Dec',
    day: '03',
    month: 'DEC',
    time: '6:15 PM',
    venue: 'Cubbon Park',
    address: 'Gate 2, Cubbon Park',
    price: 0,
    going: 96,
    spots: 54,
    image: img('1513593771513-7b58b6c4af38', 1200),
    host: 'Runners Collective',
    about: 'An easy, social 5 km run at conversational pace. All levels welcome — we finish together.',
    highlights: ['All levels', 'Free', '5 km'],
  },
];
export const EVENT_CATS = ['All', 'Running', 'Cycling', 'Hybrid'];
