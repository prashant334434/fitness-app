import React from 'react';
import { act } from 'react-test-renderer';
import Home from '../src/screens/Home';
import { EXPLORE, FITNESS_EVENTS, SPOTLIGHT } from '../src/feed';
import { byId, getText, hasText, makeNav, press, pressText, render, styleOf } from '../jest/testUtils';
import { C, F } from '../src/theme';

const setup = () => {
  const navigation = makeNav();
  const r = render(<Home navigation={navigation} route={{ key: 'h', name: 'Home' } as any} />);
  return { r, navigation };
};

describe('Home', () => {
  it('renders every section of the design in order', () => {
    const { r } = setup();
    for (const t of ['Location', 'Search by “Cricket Court”', 'Explore', 'In The Spotlight', 'Top Recommended Gym’s', 'Personalize your fitness journey', 'Badminton Courts Near You', 'Fitness Events']) {
      expect(hasText(r, t)).toBe(true);
    }
  });

  it('uses the design typography for section titles and cards', () => {
    const { r } = setup();
    expect(styleOf(getText(r, 'Explore'))).toMatchObject({ fontFamily: F.head, fontSize: 16, lineHeight: 20, color: C.text });
    expect(styleOf(getText(r, 'The Iron Office Gym'))).toMatchObject({ fontFamily: F.semi, fontSize: 14, lineHeight: 18 });
    expect(styleOf(getText(r, 'Love All Play Badminton Arena'))).toMatchObject({ fontFamily: F.med, fontSize: 14, lineHeight: 19.75 });
    expect(styleOf(getText(r, 'Sun, 29 March'))).toMatchObject({ fontFamily: F.reg, fontSize: 10, color: C.gold });
  });

  it('lays out venue and event cards at the measured sizes', () => {
    const { r } = setup();
    expect(styleOf(byId(r, 'venue-g1'))).toMatchObject({ width: 236, height: 249, borderRadius: 24, borderWidth: 1, borderColor: C.outline });
    expect(styleOf(byId(r, 'venue-c1'))).toMatchObject({ width: 236, height: 268 });
    expect(styleOf(byId(r, `event-${FITNESS_EVENTS[0].id}`))).toMatchObject({ width: 236, height: 374 });
  });

  it('shows rating and cashback only where the data has them', () => {
    const { r } = setup();
    expect(r.root.findAll(n => n.props.accessibilityLabel === 'Rated 4.1' && typeof n.type === 'string')).toHaveLength(2);
    expect(hasText(r, '2% Cashback on every booking')).toBe(true);
  });

  it('routes the explore tiles that have a destination', () => {
    const { r, navigation } = setup();
    for (const t of EXPLORE) press(byId(r, `explore-${t.key}`));
    expect(navigation.navigate.mock.calls.map((c: any[]) => c[0])).toEqual(['Gyms', 'Play', 'Events']);
  });

  it('opens event details and the "View all" lists', () => {
    const { r, navigation } = setup();
    press(byId(r, `event-${FITNESS_EVENTS[0].id}`));
    expect(navigation.navigate).toHaveBeenLastCalledWith('EventDetails', { id: FITNESS_EVENTS[0].id });
    press(r.root.find(n => n.props.accessibilityLabel === 'View all Fitness Events' && n.props.onPress));
    expect(navigation.navigate).toHaveBeenLastCalledWith('Events');
  });

  it('toggles a saved heart', () => {
    const { r } = setup();
    const heart = () => r.root.findAll(n => n.props.accessibilityLabel === 'Save' && n.props.onPress)[0];
    expect(heart().props.accessibilityState).toEqual({ selected: false });
    press(heart());
    expect(heart().props.accessibilityState).toEqual({ selected: true });
  });

  it('dismisses the personalize banner on Skip and starts onboarding on CTA', () => {
    const { r, navigation } = setup();
    pressText(r, 'Personalize now');
    expect(navigation.navigate).toHaveBeenLastCalledWith('Onboarding');
    pressText(r, 'Skip');
    expect(hasText(r, 'Personalize your fitness journey')).toBe(false);
  });

  it('updates the spotlight caption to the centred card', () => {
    const { r } = setup();
    expect(hasText(r, SPOTLIGHT[1].title)).toBe(true);
    act(() => byId(r, 'spotlight').props.onScroll({ nativeEvent: { contentOffset: { x: 0, y: 0 } } }));
    expect(hasText(r, SPOTLIGHT[0].title)).toBe(true);
    expect(hasText(r, SPOTLIGHT[0].subtitle)).toBe(true);
  });
});
