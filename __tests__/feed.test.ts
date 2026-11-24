import { bookable, bookingFee, COUPON, eventDetail, EXPLORE, FITNESS_EVENTS, HOLD_SECONDS } from '../src/feed';
import { inr, mmss, quote } from '../src/screens/Booking';
import { COURTS, EVENTS, GYMS } from '../src/data';

describe('pricing', () => {
  it('matches the design payment summary (₹1000 → ₹33 fee → ₹1033)', () => {
    expect(quote(1000, 1, false)).toEqual({ order: 1000, fee: 33, discount: 0, total: 1033 });
  });

  it('applies the coupon after the fee', () => {
    expect(quote(1000, 1, true)).toEqual({ order: 1000, fee: 33, discount: COUPON.off, total: 933 });
  });

  it('never discounts more than the order value', () => {
    expect(quote(50, 1, true).discount).toBe(50);
  });

  it('is zero when the ticket is removed, coupon or not', () => {
    expect(quote(1000, 0, true)).toEqual({ order: 0, fee: 0, discount: 0, total: 0 });
  });

  it('rounds the 3.3% fee to whole rupees', () => {
    expect(bookingFee(699)).toBe(23);
    expect(bookingFee(0)).toBe(0);
  });

  it('formats rupees without separators, as in the design', () => {
    expect(inr(1033)).toBe('₹1033');
  });
});

describe('hold timer format', () => {
  it.each([
    [HOLD_SECONDS, '09:59'],
    [60, '01:00'],
    [5, '00:05'],
    [0, '00:00'],
  ])('%i s → %s', (s, out) => expect(mmss(s)).toBe(out));
});

describe('route adapters', () => {
  it('resolves the designed event', () => {
    const d = eventDetail('city-half-marathon')!;
    expect(d.title).toBe('India’s Biggest City Half Marathon');
    expect(d.when).toBe('Sat, 14 Mar, 7:00 AM');
    expect(d.thingsToKnow).toHaveLength(5);
    expect(d.heroHasChrome).toBe(true);
  });

  it('resolves every Home feed event and every legacy listing event', () => {
    for (const e of [...FITNESS_EVENTS, ...EVENTS]) expect(eventDetail(e.id)).toBeDefined();
    const legacy = eventDetail(EVENTS[0].id)!;
    expect(legacy.heroHasChrome).toBe(false); // remote art → app draws its own chrome
    expect(legacy.title).toBe(EVENTS[0].title);
  });

  it('returns undefined for unknown ids instead of throwing', () => {
    expect(eventDetail('nope')).toBeUndefined();
    expect(bookable('event', 'nope')).toBeUndefined();
  });

  it('builds the designed booking', () => {
    expect(bookable('event', 'boulderbox')).toMatchObject({
      name: 'Boulderbox',
      venue: 'BoulderBox - Climbing Centre, Delhi',
      date: 'September 10',
      time: '7:00 AM',
      price: 1000,
    });
  });

  it('splits an event date/time for booking', () => {
    expect(bookable('event', 'city-half-marathon')).toMatchObject({ date: 'Sat, 14 Mar', time: '7:00 AM', price: 699 });
  });

  it('adapts every gym and court from the listings', () => {
    for (const g of GYMS) expect(bookable('gym', g.id)?.price).toBe(g.price);
    for (const c of COURTS) expect(bookable('court', c.id)?.price).toBe(c.price);
  });

  it('has 8 explore tiles in design order', () => {
    expect(EXPLORE.map(e => e.label)).toEqual(['Fitness', 'Sports', 'Shop', 'Events', 'Activity', 'Meals', 'Trainer', 'Wellness']);
  });
});
