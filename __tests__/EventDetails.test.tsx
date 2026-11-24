import React from 'react';
import { act } from 'react-test-renderer';
import EventDetails, { clampToWords } from '../src/screens/EventDetails';
import { eventDetail } from '../src/feed';
import { EVENTS } from '../src/data';
import { allText, byId, getText, hasText, makeNav, press, pressText, render, styleOf, textOf } from '../jest/testUtils';
import { C, F } from '../src/theme';

const ID = 'city-half-marathon';
const setup = (id = ID) => {
  const navigation = makeNav();
  const r = render(<EventDetails navigation={navigation} route={{ key: 'e', name: 'EventDetails', params: { id } } as any} />);
  return { r, navigation };
};

/** Feeds the hidden measuring <Text> the line breaks the device would report. */
function layout(r: ReturnType<typeof setup>['r'], testID: string, lines: string[]) {
  const section = byId(r, testID);
  const measurer = section.find(n => typeof n.props.onTextLayout === 'function');
  act(() => measurer.props.onTextLayout({ nativeEvent: { lines: lines.map(text => ({ text })) } }));
}

const LINES = [
  'A half marathon is a road-running event covering exactly ',
  '\\(21.0975\\) kilometers (or \\(13.1\\) miles). It is exactly half the ',
  'distance of a standard marathon. As one of the most ',
  'popular race distances globally, it serves as a massive ',
  'milestone for runners of every level.',
];

describe('clampToWords', () => {
  it('ends on the last whole word of line 4 with "..." like the design', () => {
    expect(clampToWords(LINES)).toBe(LINES.slice(0, 3).join('') + 'popular race distances globally, it serves as a massive...');
  });
  it('drops trailing punctuation before the ellipsis', () => {
    expect(clampToWords(['a ', 'b ', 'c ', 'one, two, ', 'x'])).toBe('a b c one, two...');
  });
  it('leaves short copy alone', () => {
    expect(clampToWords(LINES.slice(0, 4))).toBeNull();
  });
});

describe('EventDetails', () => {
  it('renders the designed content', () => {
    const { r } = setup();
    const d = eventDetail(ID)!;
    for (const t of [...d.tags, d.title, d.when, d.venue, d.distance, d.gates, 'View full schedule & timeline', 'About the event', 'Thing’s to know', 'Instructions', 'Organized by', d.organizer.name, 'More', 'Frequently asked questions', 'Terms and conditions', 'Book tickets', d.priceFrom, 'onwards']) {
      expect(hasText(r, t)).toBe(true);
    }
    for (const row of d.thingsToKnow) expect(hasText(r, row.label)).toBe(true);
    for (const v of ['47%', '13', '2 Years']) expect(hasText(r, v)).toBe(true);
  });

  it('applies the design type scale and colours', () => {
    const { r } = setup();
    expect(styleOf(getText(r, 'India’s Biggest City Half Marathon'))).toMatchObject({ fontFamily: F.head, fontSize: 18, lineHeight: 24 });
    expect(styleOf(getText(r, 'Sat, 14 Mar, 7:00 AM'))).toMatchObject({ fontFamily: F.reg, fontSize: 14, color: C.cream });
    expect(styleOf(getText(r, '34.2 km away'))).toMatchObject({ fontSize: 12, color: C.muted });
    expect(styleOf(byId(r, 'event-cta'))).toMatchObject({ backgroundColor: C.footer });
    expect(styleOf(byId(r, 'book-tickets'))).toMatchObject({ width: 139, height: 48, borderRadius: 24, backgroundColor: C.action });
  });

  it('spaces the 5 "Thing’s to know" rows with 4 dividers', () => {
    const { r } = setup();
    const card = byId(r, 'things-to-know');
    expect(card.findAll(n => typeof n.type === 'string' && styleOf(n).backgroundColor === C.divider && styleOf(n).height === 1)).toHaveLength(4);
    expect(styleOf(card)).toMatchObject({ borderRadius: 15, backgroundColor: C.surface });
  });

  it('clamps About at a word boundary and expands on Read more', () => {
    const { r } = setup();
    layout(r, 'about', LINES);
    const body = () => textOf(byId(r, 'about-body'));
    expect(body().endsWith('as a massive...')).toBe(true);
    expect(byId(r, 'about-body').props.numberOfLines).toBe(4);
    pressText(r, 'Read more');
    expect(body()).toBe(eventDetail(ID)!.about);
    expect(byId(r, 'about-body').props.numberOfLines).toBeUndefined();
    expect(allText(r, 'Read less')).toHaveLength(1);
  });

  it('books tickets for this event', () => {
    const { r, navigation } = setup();
    press(byId(r, 'book-tickets'));
    expect(navigation.navigate).toHaveBeenCalledWith('Booking', { kind: 'event', id: ID });
  });

  it('goes back and toggles like from the hero', () => {
    const { r, navigation } = setup();
    press(byId(r, 'hero-back'));
    expect(navigation.goBack).toHaveBeenCalled();
    expect(byId(r, 'hero-like').props.accessibilityState).toEqual({ selected: false });
    press(byId(r, 'hero-like'));
    expect(byId(r, 'hero-like').props.accessibilityState).toEqual({ selected: true });
  });

  it('uses the art’s own chrome for the designed hero, and draws chrome for remote heroes', () => {
    const designed = setup().r;
    expect(styleOf(byId(designed, 'hero-back')).borderWidth).toBeUndefined();
    const remote = setup(EVENTS[0].id).r;
    expect(styleOf(byId(remote, 'hero-back'))).toMatchObject({ borderWidth: 1, borderColor: C.glass });
  });

  it('shows a fallback for unknown events', () => {
    const { r } = setup('missing');
    expect(hasText(r, 'This event is no longer available.')).toBe(true);
  });
});
