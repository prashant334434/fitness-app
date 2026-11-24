import React, { memo, useEffect } from 'react';
import { StyleSheet, Text, useWindowDimensions, View } from 'react-native';
import { GestureDetector, usePanGesture } from 'react-native-gesture-handler';
import Animated, {
  cancelAnimation,
  SharedValue,
  useAnimatedReaction,
  useAnimatedStyle,
  useSharedValue,
  withSpring,
} from 'react-native-reanimated';
import { scheduleOnRN } from 'react-native-worklets';
import Svg, { Circle, Defs, Line, LinearGradient, Path, Rect, Stop, Text as SvgText } from 'react-native-svg';
import { C, F } from '../theme';
import { tick } from '../haptics';

/* ------------------------------------------------------------------ *
 * Shared physics: `pos` is a float tick index. Dragging moves it 1:1, *
 * release projects the fling a little further, then a spring that     *
 * inherits the finger velocity carries it into the nearest detent.    *
 * ------------------------------------------------------------------ */
const MOMENTUM = 0.22; // seconds of fling projected past release ("keeps moving a little")

function useTickScale(count: number, index: number, onIndex: (i: number) => void) {
  const pos = useSharedValue(index);
  const max = count - 1;

  // controlled from outside (unit switch, initial value) → glide there
  useEffect(() => {
    if (Math.round(pos.value) !== index) pos.value = withSpring(index, { damping: 22, stiffness: 140 });
  }, [index, pos]);

  // one haptic click + live value per detent crossed
  useAnimatedReaction(
    () => Math.min(max, Math.max(0, Math.round(pos.value))),
    (cur, prev) => {
      if (prev !== null && cur !== prev) {
        scheduleOnRN(tick);
        scheduleOnRN(onIndex, cur);
      }
    },
  );

  const grab = () => {
    'worklet';
    cancelAnimation(pos); // touching a spinning dial stops it, like a real one
  };
  const move = (delta: number) => {
    'worklet';
    const out = pos.value < 0 || pos.value > max;
    pos.value += out ? delta * 0.3 : delta; // rubber-band past the ends
  };
  const release = (velocity: number) => {
    'worklet';
    const target = Math.min(max, Math.max(0, Math.round(pos.value + velocity * MOMENTUM)));
    pos.value = withSpring(target, { velocity, damping: 24, stiffness: 110, mass: 1 });
  };
  return { pos, grab, move, release };
}

/* ============================== WEIGHT DIAL ============================== */

/** `every`: draw a tick every N detents (detents stay fine, the face stays readable). */
export type DialCfg = { count: number; every: number; major: number; medium: number; label: (i: number) => string };

const R = 350; // tick outer radius
const CY = 470; // dial centre, from top of the component
const H = 250;
const D = R * 2;

const DialTicks = memo(({ cfg }: { cfg: DialCfg }) => {
  const els: React.ReactElement[] = [];
  for (let i = 0; i < cfg.count; i += cfg.every) {
    const a = (i * Math.PI) / 180;
    const isMajor = i % cfg.major === 0;
    const isMed = !isMajor && i % cfg.medium === 0;
    const len = isMajor ? 62 : isMed ? 46 : 32;
    const sin = Math.sin(a);
    const cos = Math.cos(a);
    els.push(
      <Line
        key={i}
        x1={R + (R - len) * sin}
        y1={R - (R - len) * cos}
        x2={R + R * sin}
        y2={R - R * cos}
        stroke={isMajor ? '#FFFFFF' : isMed ? '#6E6E6E' : '#4D4D4D'}
        strokeWidth={isMajor ? 3.2 : isMed ? 3.4 : 2.6}
        strokeLinecap="round"
      />,
    );
    if (isMajor) {
      const lr = R - len - 14;
      const x = R + lr * sin;
      const y = R - lr * cos;
      els.push(
        <SvgText
          key={'l' + i}
          x={x}
          y={y + 4}
          fill="#fff"
          fontSize={12}
          fontFamily={F.med}
          textAnchor="middle"
          transform={`rotate(${i} ${x} ${y})`}>
          {cfg.label(i)}
        </SvgText>,
      );
    }
  }
  return (
    <Svg width={D} height={D}>
      {els}
    </Svg>
  );
});

/** Static fine-tick ring that turns at a slower rate for a bit of depth. */
const FineRing = memo(() => {
  const r1 = 388;
  const r2 = 402;
  const els = [];
  for (let i = -40; i <= 24; i += 2.2) {
    const a = (i * Math.PI) / 180;
    els.push(
      <Line
        key={i}
        x1={r2 + r1 * Math.sin(a)}
        y1={r2 - r1 * Math.cos(a)}
        x2={r2 + r2 * Math.sin(a)}
        y2={r2 - r2 * Math.cos(a)}
        stroke="#3A3A3A"
        strokeWidth={1}
      />,
    );
  }
  return (
    <Svg width={r2 * 2} height={r2 * 2}>
      {els}
    </Svg>
  );
});

function arcPath(cx: number, cy: number, r: number, a0: number, a1: number) {
  const p = (a: number) => [cx + r * Math.sin((a * Math.PI) / 180), cy - r * Math.cos((a * Math.PI) / 180)];
  const [x0, y0] = p(a0);
  const [x1, y1] = p(a1);
  return `M${x0} ${y0} A${r} ${r} 0 0 1 ${x1} ${y1}`;
}

export function WeightDial({ cfg, index, onIndex }: { cfg: DialCfg; index: number; onIndex: (i: number) => void }) {
  const { width: W } = useWindowDimensions();
  const cx = W / 2;
  const { pos, grab, move, release } = useTickScale(cfg.count, index, onIndex);
  const lastAngle = useSharedValue(0);

  const angleAt = (x: number, y: number) => {
    'worklet';
    return (Math.atan2(x - cx, CY - y) * 180) / Math.PI;
  };

  const pan = usePanGesture({
    minDistance: 0,
    onBegin: e => {
      grab();
      lastAngle.value = angleAt(e.x, e.y);
    },
    onUpdate: e => {
      const a = angleAt(e.x, e.y);
      let d = a - lastAngle.value;
      if (d > 180) d -= 360;
      if (d < -180) d += 360;
      lastAngle.value = a;
      move(-d); // 1° per tick; clockwise turn brings smaller values under the pointer
    },
    onDeactivate: e => {
      const rx = e.x - cx;
      const ry = e.y - CY;
      const omega = ((rx * e.velocityY - ry * e.velocityX) / (rx * rx + ry * ry)) * (180 / Math.PI);
      release(-omega);
    },
    onFinalize: e => {
      if (e.canceled) release(0); // touched but never dragged: settle on nearest detent
    },
  });

  const dialStyle = useAnimatedStyle(() => ({ transform: [{ rotate: `${-pos.value}deg` }] }));
  const ringStyle = useAnimatedStyle(() => ({ transform: [{ rotate: `${-pos.value * 0.35}deg` }] }));

  return (
    <GestureDetector gesture={pan}>
      <View style={{ height: H, overflow: 'hidden' }}>
        {/* static decoration: outer/inner arcs, markers, knob */}
        <Svg width={W} height={H} style={StyleSheet.absoluteFill}>
          <Path d={arcPath(cx, CY, 425, -40, 15.5)} stroke="#3A3A3A" strokeWidth={1.2} fill="none" />
          <Path d={arcPath(cx, CY, 383, -3, 45)} stroke="#3A3A3A" strokeWidth={1.2} fill="none" />
          <Path d={`M${cx - 105} ${CY - 437} l-6 14 h12 z`} fill="#4A4A4A" />
          <Circle cx={cx + 119} cy={CY - 409} r={4.5} stroke="#777" strokeWidth={1.2} fill={C.bg} />
          <Line x1={cx + 122} y1={CY - 413} x2={cx + 131} y2={CY - 425} stroke="#555" strokeWidth={1} />
          <Circle cx={cx + 133} cy={CY - 433} r={6} stroke="#666" strokeWidth={1.2} fill="#222" />
          <Circle cx={cx + 133} cy={CY - 433} r={3.5} fill="#666" />
        </Svg>
        <Animated.View style={[{ position: 'absolute', left: cx - 402, top: CY - 402 }, ringStyle]}>
          <FineRing />
        </Animated.View>
        <Animated.View style={[{ position: 'absolute', left: cx - R, top: CY - R }, dialStyle]}>
          <DialTicks cfg={cfg} />
        </Animated.View>
        {/* fixed pointer */}
        <Svg width={20} height={120} style={{ position: 'absolute', left: cx - 10, top: CY - R - 18 }} pointerEvents="none">
          <Path d="M2 2 H18 L10 14 Z" fill={C.blue} stroke={C.blue} strokeWidth={2} strokeLinejoin="round" />
          <Rect x={9} y={18} width={2} height={100} rx={1} fill={C.blue} />
        </Svg>
      </View>
    </GestureDetector>
  );
}

/* ============================== HEIGHT RULER ============================= */

export type RulerCfg = { count: number; major: number; label: (i: number) => string };

const SP = 12; // pt per tick

const RulerTicks = memo(({ cfg, pos }: { cfg: RulerCfg; pos: SharedValue<number> }) => {
  const els = [];
  for (let i = 0; i < cfg.count; i++) {
    const major = i % cfg.major === 0;
    els.push(
      <View key={i} style={[st.tick, { top: i * SP }, major ? st.major : st.minor]} />,
      major ? <RulerLabel key={'l' + i} i={i} text={cfg.label(i)} pos={pos} /> : null,
    );
  }
  return <>{els}</>;
});

/** Labels brighten as they approach the pointer. */
function RulerLabel({ i, text, pos }: { i: number; text: string; pos: SharedValue<number> }) {
  const a = useAnimatedStyle(() => {
    const d = Math.abs(pos.value - i);
    return { opacity: Math.max(0.35, 1 - d / 22) };
  });
  return <Animated.Text style={[st.label, { top: i * SP - 9 }, a]}>{text}</Animated.Text>;
}

export function HeightRuler({
  cfg,
  index,
  onIndex,
  value,
  unit,
}: {
  cfg: RulerCfg;
  index: number;
  onIndex: (i: number) => void;
  value: string;
  unit: string;
}) {
  const { width: W } = useWindowDimensions();
  const { pos, grab, move, release } = useTickScale(cfg.count, index, onIndex);
  const h = useSharedValue(400);

  const pan = usePanGesture({
    minDistance: 0,
    onBegin: grab,
    onUpdate: e => move(-e.changeY / SP),
    onDeactivate: e => release(-e.velocityY / SP),
    onFinalize: e => {
      if (e.canceled) release(0);
    },
  });

  const track = useAnimatedStyle(() => ({ transform: [{ translateY: h.value / 2 - pos.value * SP }] }));

  return (
    <GestureDetector gesture={pan}>
      <View style={{ flex: 1, overflow: 'hidden' }} onLayout={e => (h.value = e.nativeEvent.layout.height)}>
        <Animated.View style={track}>
          <RulerTicks cfg={cfg} pos={pos} />
        </Animated.View>
        {/* edge fades */}
        <Svg style={StyleSheet.absoluteFill} pointerEvents="none">
          <Defs>
            <LinearGradient id="rulerFade" x1="0" y1="0" x2="0" y2="1">
              <Stop offset="0" stopColor={C.bg} stopOpacity="1" />
              <Stop offset="0.2" stopColor={C.bg} stopOpacity="0" />
              <Stop offset="0.8" stopColor={C.bg} stopOpacity="0" />
              <Stop offset="1" stopColor={C.bg} stopOpacity="1" />
            </LinearGradient>
          </Defs>
          <Rect width="100%" height="100%" fill="url(#rulerFade)" />
        </Svg>
        {/* fixed pointer + live readout */}
        <View style={st.center} pointerEvents="none">
          <View style={st.readout}>
            <Text style={st.big}>{value}</Text>
            <Text style={st.unit}>{unit}</Text>
          </View>
          <Svg width={W * 0.6} height={2}>
            <Defs>
              <LinearGradient id="rulerPointer" x1="0" y1="0" x2="1" y2="0">
                <Stop offset="0" stopColor={C.blue} />
                <Stop offset="0.6" stopColor={C.blue} stopOpacity="0.7" />
                <Stop offset="1" stopColor={C.blue} stopOpacity="0" />
              </LinearGradient>
            </Defs>
            <Rect width="100%" height={1.5} fill="url(#rulerPointer)" />
          </Svg>
        </View>
      </View>
    </GestureDetector>
  );
}

const st = StyleSheet.create({
  tick: { position: 'absolute', height: 1, backgroundColor: '#fff' },
  major: { left: 0, width: 50 },
  minor: { left: 4.5, width: 17, opacity: 0.85 },
  label: { position: 'absolute', left: 60, color: '#fff', fontFamily: F.med, fontSize: 13, lineHeight: 18 },
  center: { position: 'absolute', left: 0, right: 0, top: '50%', marginTop: -46 },
  readout: { flexDirection: 'row', alignItems: 'flex-end', marginLeft: 168, height: 46 },
  big: { color: C.text, fontFamily: F.semi, fontSize: 30, lineHeight: 36 },
  unit: { color: C.sub, fontFamily: F.med, fontSize: 13, marginLeft: 3, marginBottom: 4 },
});
