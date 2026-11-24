/* Minimal Reanimated stand-in for unit tests: animations resolve instantly. */
const RN = require('react-native');

const chain = () => new Proxy(function () {}, { get: () => chain(), apply: () => chain() });
const lerp = (x, [i0, i1], [o0, o1]) => (i1 === i0 ? o0 : o0 + ((x - i0) / (i1 - i0)) * (o1 - o0));
function interpolate(x, input, output, extrapolate) {
  let i = 0;
  while (i < input.length - 2 && x > input[i + 1]) i++;
  let v = lerp(x, [input[i], input[i + 1]], [output[i], output[i + 1]]);
  if (extrapolate === 'clamp') v = Math.min(Math.max(v, Math.min(...output)), Math.max(...output));
  return v;
}
const safe = f => {
  try {
    return f();
  } catch {
    return {};
  }
};

const Animated = {
  View: RN.View,
  Text: RN.Text,
  Image: RN.Image,
  ScrollView: RN.ScrollView,
  FlatList: RN.FlatList,
  createAnimatedComponent: c => c,
};

module.exports = {
  __esModule: true,
  default: Animated,
  ...Animated,
  useSharedValue: v => ({ value: v }),
  useDerivedValue: f => ({ value: safe(f) }),
  useAnimatedStyle: f => safe(f),
  useAnimatedProps: f => safe(f),
  useAnimatedScrollHandler: h => e => (typeof h === 'function' ? h(e.nativeEvent) : h.onScroll?.(e.nativeEvent)),
  useAnimatedRef: () => ({ current: null }),
  withTiming: v => v,
  withSpring: v => v,
  withDelay: (_d, v) => v,
  withSequence: (...v) => v[v.length - 1],
  withRepeat: v => v,
  cancelAnimation: () => {},
  runOnJS: f => f,
  runOnUI: f => f,
  interpolate,
  interpolateColor: (_x, _i, out) => out[0],
  Extrapolation: { CLAMP: 'clamp', EXTEND: 'extend', IDENTITY: 'identity' },
  Easing: chain(),
  FadeIn: chain(),
  FadeOut: chain(),
  FadeInDown: chain(),
  FadeInUp: chain(),
  ZoomIn: chain(),
  LinearTransition: chain(),
  Layout: chain(),
};
