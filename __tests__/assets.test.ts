import { ICON, IMG, size } from '../src/assets/design';

type Tree = { [k: string]: unknown };
const flatten = (t: Tree, prefix = ''): [string, unknown][] =>
  Object.entries(t).flatMap(([k, v]) =>
    v && typeof v === 'object' && !('testUri' in (v as object)) ? flatten(v as Tree, `${prefix}${k}.`) : [[`${prefix}${k}`, v] as [string, unknown]],
  );

const all = [...flatten(IMG as unknown as Tree, 'IMG.'), ...flatten(ICON as unknown as Tree, 'ICON.')];

describe('design assets', () => {
  it.each(all)('%s is a whole-point 4× export', (_name, src) => {
    const { width, height } = size(src as number);
    expect(width).toBeGreaterThan(0);
    expect(height).toBeGreaterThan(0);
    // ¼-pt granularity keeps every edge on the 3× / 4× device pixel grid
    expect((width * 4) % 1).toBe(0);
    expect((height * 4) % 1).toBe(0);
  });

  it('keeps the measured design sizes the layout depends on', () => {
    expect(size(IMG.event.hero)).toEqual({ width: 390, height: 424 });
    expect(size(IMG.home.spotCenter)).toEqual({ width: 206, height: 284 });
    expect(size(IMG.home.gym1)).toEqual({ width: 216, height: 148 });
    expect(size(IMG.home.court1)).toEqual({ width: 216, height: 127.5 });
    expect(size(IMG.home.event1)).toEqual({ width: 216, height: 266 });
    expect(size(IMG.home.tiles.fitness)).toEqual({ width: 80.25, height: 89 });
    expect(size(IMG.booking.thumb)).toEqual({ width: 77, height: 62 });
  });
});
