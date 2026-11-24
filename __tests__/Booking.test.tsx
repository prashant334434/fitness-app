import React from 'react';
import { Text } from 'react-native';
import { act } from 'react-test-renderer';
import Booking from '../src/screens/Booking';
import { byId, getText, hasText, makeNav, press, pressText, render, styleOf, textOf } from '../jest/testUtils';
import { C, F } from '../src/theme';

const setup = (kind: 'event' | 'gym' | 'court' = 'event', id = 'boulderbox') => {
  const navigation = makeNav();
  const r = render(<Booking navigation={navigation} route={{ key: 'b', name: 'Booking', params: { kind, id } } as any} />);
  return { r, navigation };
};
const total = (r: ReturnType<typeof setup>['r']) =>
  textOf(byId(r, 'pay-now').findAll(n => n.type === Text && /^₹\d+$/.test(textOf(n)))[0]);

describe('Review Booking', () => {
  beforeEach(() => jest.useFakeTimers());
  afterEach(() => jest.useRealTimers());

  it('renders the designed booking', () => {
    const { r } = setup();
    for (const t of ['Review Booking', 'Boulderbox', 'BoulderBox - Climbing Centre, Delhi', 'September 10', '|', '7:00 AM', '1 x Regular Ticket', 'Remove', 'M-Ticket Entry using the QR Code in your app', 'Flat ₹100 OFF', 'Exclusive offer on OBSESS', 'Apply', 'Payment summary', 'Order Amount', 'Booking Fee (inc. of GST)', '₹33', 'Grand Total', 'Invoice details', 'Shubham Sharma', '+91-9876543210', 'shubham@gmail.com', 'Greater Noida', 'Pay now']) {
      expect(hasText(r, t)).toBe(true);
    }
    expect(textOf(byId(r, 'hold-timer'))).toBe('Complete your booking in 09:59 min');
    expect(total(r)).toBe('₹1033');
  });

  it('matches the design styling of key elements', () => {
    const { r } = setup();
    expect(styleOf(getText(r, 'Review Booking'))).toMatchObject({ fontFamily: F.head, fontSize: 18, textAlign: 'center' });
    expect(styleOf(byId(r, 'booking-back'))).toMatchObject({ width: 40, height: 40, borderRadius: 12, borderWidth: 1, borderColor: C.backBorder });
    expect(styleOf(byId(r, 'pay-now'))).toMatchObject({ height: 48, borderRadius: 24, backgroundColor: C.action });
    expect(styleOf(byId(r, 'apply-coupon'))).toMatchObject({ width: 70.5, height: 30, borderRadius: 15, backgroundColor: C.action });
    expect(styleOf(byId(r, 'ticket-card'))).toMatchObject({ height: 168, borderRadius: 21, backgroundColor: C.surface });
    const timerValue = byId(r, 'hold-timer').find(n => textOf(n) === '09:59');
    expect(styleOf(timerValue)).toMatchObject({ fontFamily: F.semi, color: C.action });
  });

  it('counts the hold down every second and expires at zero', () => {
    const { r } = setup();
    act(() => jest.advanceTimersByTime(1000));
    expect(textOf(byId(r, 'hold-timer'))).toContain('09:58');
    for (let i = 0; i < 598; i++) act(() => jest.advanceTimersByTime(1000));
    expect(textOf(byId(r, 'hold-timer'))).toBe('Your hold has expired. Please start again.');
    expect(byId(r, 'pay-now').props.accessibilityState).toEqual({ disabled: true });
  });

  it('applies and removes the coupon', () => {
    const { r } = setup();
    press(byId(r, 'apply-coupon'));
    expect(hasText(r, 'Applied')).toBe(true);
    expect(hasText(r, 'Coupon discount')).toBe(true);
    expect(hasText(r, '-₹100')).toBe(true);
    expect(total(r)).toBe('₹933');
    expect(styleOf(byId(r, 'payment-summary')).height).toBe(224);
    press(byId(r, 'apply-coupon'));
    expect(total(r)).toBe('₹1033');
    expect(styleOf(byId(r, 'payment-summary')).height).toBe(190);
  });

  it('disables payment when the ticket is removed and re-enables when added back', () => {
    const { r } = setup();
    press(byId(r, 'remove-ticket'));
    expect(total(r)).toBe('₹0');
    expect(byId(r, 'pay-now').props.accessibilityState).toEqual({ disabled: true });
    expect(byId(r, 'pay-now').props.onPress).toBeUndefined();
    press(byId(r, 'add-ticket'));
    expect(total(r)).toBe('₹1033');
    expect(byId(r, 'pay-now').props.accessibilityState).toEqual({ disabled: false });
  });

  it('confirms the booking and returns home', () => {
    const { r, navigation } = setup();
    press(byId(r, 'pay-now'));
    expect(byId(r, 'booking-success')).toBeTruthy();
    expect(hasText(r, 'Booking confirmed')).toBe(true);
    expect(hasText(r, 'September 10 · 7:00 AM')).toBe(true);
    pressText(r, 'Back to Home');
    expect(navigation.popToTop).toHaveBeenCalled();
  });

  it('goes back from the header', () => {
    const { r, navigation } = setup();
    press(byId(r, 'booking-back'));
    expect(navigation.goBack).toHaveBeenCalled();
  });

  it('prices legacy gym bookings through the same summary', () => {
    const { r } = setup('gym', 'g1');
    expect(hasText(r, '1 x Day Pass')).toBe(true);
    expect(total(r)).toBe('₹309'); // 299 + 10 fee
  });

  it('shows a fallback for unknown bookings', () => {
    const { r } = setup('event', 'missing');
    expect(hasText(r, 'This booking is no longer available.')).toBe(true);
  });
});
