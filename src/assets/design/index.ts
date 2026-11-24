/**
 * Artwork and icons extracted 1:1 from the 4× design exports (1560px = 390pt).
 * Each file is rendered at exactly ¼ of its pixel size, so `size(src)` gives the
 * design-space dimensions. Swap a file for production artwork of the same size and
 * the layout stays untouched.
 */
import { Image, ImageSourcePropType } from 'react-native';

export const IMG = {
  home: {
    avatar: require('./home/photo-avatar.jpg'),
    tiles: {
      fitness: require('./home/tile-fitness.png'),
      sports: require('./home/tile-sports.png'),
      shop: require('./home/tile-shop.png'),
      events: require('./home/tile-events.png'),
      activity: require('./home/tile-activity.png'),
      meals: require('./home/tile-meals.png'),
      trainer: require('./home/tile-trainer.png'),
      wellness: require('./home/tile-wellness.png'),
    },
    spotLeft: require('./home/photo-spot-left.jpg'),
    spotCenter: require('./home/photo-spot-center.jpg'),
    spotRight: require('./home/photo-spot-right.jpg'),
    gym1: require('./home/photo-gym-1.jpg'),
    gym2: require('./home/photo-gym-2.jpg'),
    banner: require('./home/photo-banner.jpg'),
    court1: require('./home/photo-court-1.jpg'),
    court2: require('./home/photo-court-2.jpg'),
    event1: require('./home/photo-event-1.jpg'),
    event2: require('./home/photo-event-2.jpg'),
  },
  event: {
    hero: require('./event/photo-hero.jpg'),
    organizer: require('./event/photo-organizer.jpg'),
  },
  booking: {
    thumb: require('./booking/photo-thumb.jpg'),
  },
};

export const ICON = {
  pinFilled: require('./home/ic-pin.png'),
  search: require('./home/ic-search.png'),
  chevronDown: require('./home/ic-chevron-down.png'),
  heart: require('./home/ic-heart.png'),
  star: require('./home/ic-star.png'),
  viewAll: require('./home/ic-viewall-chevron.png'),
  cashback: require('./home/ic-cashback.png'),
  pin: require('./event/ic-pin.png'),
  clock: require('./event/ic-clock.png'),
  chevron: require('./event/ic-chevron.png'),
  readMore: require('./event/ic-readmore.png'),
  language: require('./event/ic-language.png'),
  users: require('./event/ic-users.png'),
  ticket: require('./event/ic-ticket.png'),
  kid: require('./event/ic-kid.png'),
  noPets: require('./event/ic-nopets.png'),
  faq: require('./event/ic-faq.png'),
  terms: require('./event/ic-terms.png'),
  back: require('./booking/ic-back.png'),
  mTicket: require('./booking/ic-ticket.png'),
  person: require('./booking/ic-person.png'),
  phone: require('./booking/ic-phone.png'),
  mail: require('./booking/ic-mail.png'),
  pinSmall: require('./booking/ic-pin.png'),
  edit: require('./booking/ic-edit.png'),
};

/** Design-space size (pt) of a 4× asset. */
export function size(src: ImageSourcePropType) {
  const r = Image.resolveAssetSource(src);
  return { width: (r?.width ?? 0) / 4, height: (r?.height ?? 0) / 4 };
}
