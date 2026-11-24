#!/usr/bin/env python3
"""
Pixel-diff the running iOS app against the 4x design exports in design/refs.

Requirements: Xcode simulator with the debug app installed on a 390pt-wide device
(iPhone 16e), Metro running, ffmpeg on PATH. No Python packages needed.

    python3 scripts/visual-diff.py                 # all screens, all scroll stops
    python3 scripts/visual-diff.py home            # one screen
    UDID=<sim-udid> python3 scripts/visual-diff.py

For each stop it writes design/diff/<screen>-<scroll>.png with three panels
(design | app | difference ×4) and prints the share of pixels whose max channel
difference exceeds TOL. Exit code is 1 if any stop is above MAX_MISMATCH.
"""
import os, subprocess, sys, time

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
UDID = os.environ.get('UDID', 'booted')
BUNDLE = 'org.reactjs.native.example.FitnessApp'
SCALE = 3  # iPhone 16e is @3x; refs are @4x
W = 390 * SCALE
TOL = int(os.environ.get('TOL', 40))
# 4×→3× resampling + text anti-aliasing leave a ~1.3–2.8% floor on aligned screens;
# real layout drift (1pt+) measured 5–13%, so 3% separates the two.
MAX_MISMATCH = float(os.environ.get('MAX_MISMATCH', 3.0))  # percent

# screen → (deep link, ref file, design-y offset of screen-y 0 at scroll 0, scroll stops, bottom overlay pt)
# The last stop of each screen is its maximum scroll offset on a 390×844 device.
# Status bar (top 47pt) is never compared. On the 16e the safe-area top is 47pt while the design
# reserves 40pt, so screens that respect the safe area sit 7pt lower than the export.
SCREENS = {
    'home': ('fitapp-rn://home', 'home.png', -7, [0, 700, 1207], 0),
    'event': ('fitapp-rn://event/city-half-marathon', 'event-details.png', 0, [0, 480, 961], 100),
    'booking': ('fitapp-rn://booking/event/boulderbox', 'review-booking.png', -7, [0, 274], 112),
}
STATUS_PT = 47
SCREEN_PT = 844


def sh(*a, **k):
    return subprocess.run(a, check=True, capture_output=True, **k).stdout


def raw(png, w, scale_from=None):
    vf = f'scale={w}:-1:flags=lanczos' if scale_from else 'null'
    out = sh('ffmpeg', '-loglevel', 'error', '-i', png, '-vf', vf, '-f', 'rawvideo', '-pix_fmt', 'rgb24', '-')
    return out


def capture(link, scroll, dest):
    subprocess.run(['xcrun', 'simctl', 'terminate', UDID, BUNDLE], capture_output=True)
    sh('xcrun', 'simctl', 'launch', UDID, BUNDLE, '-devDeepLink', link, '-devScrollY', str(scroll), '-quietLogBox', 'YES')
    time.sleep(float(os.environ.get('SETTLE', 6)))
    sh('xcrun', 'simctl', 'io', UDID, 'screenshot', dest)


def write_png(path, rgb, w, h):
    subprocess.run(['ffmpeg', '-loglevel', 'error', '-y', '-f', 'rawvideo', '-pix_fmt', 'rgb24', '-s', f'{w}x{h}', '-i', '-', path], input=rgb, check=True)


def compare(name):
    link, ref, off, stops, bottom = SCREENS[name]
    ref_path = os.path.join(ROOT, 'design', 'refs', ref)
    d = raw(ref_path, W, scale_from=4)
    dh = len(d) // (W * 3)
    worst = 0.0
    for s in stops:
        shot = os.path.join(ROOT, 'design', 'diff', f'.{name}-{s}.png')
        capture(link, s, shot)
        a = raw(shot, W)
        y0, y1 = STATUS_PT * SCALE, (SCREEN_PT - bottom) * SCALE
        rows = []
        bad = total = 0
        for y in range(y0, y1):
            dy = y + (off + s) * SCALE
            if dy < 0 or dy >= dh:
                continue
            ar = a[y * W * 3:(y + 1) * W * 3]
            dr = d[dy * W * 3:(dy + 1) * W * 3]
            diff = bytearray(W * 3)
            for i in range(0, W * 3, 3):
                m = max(abs(ar[i] - dr[i]), abs(ar[i + 1] - dr[i + 1]), abs(ar[i + 2] - dr[i + 2]))
                total += 1
                if m > TOL:
                    bad += 1
                v = min(255, m * 4)
                diff[i] = v
                diff[i + 1] = v // 3
                diff[i + 2] = 0
            rows.append(bytes(dr) + bytes(ar) + bytes(diff))
        pct = 100.0 * bad / max(1, total)
        worst = max(worst, pct)
        out = os.path.join(ROOT, 'design', 'diff', f'{name}-{s}.png')
        write_png(out, b''.join(rows), W * 3, len(rows))
        print(f'{name:8s} scroll {s:5d}pt  mismatch {pct:5.2f}%  → {os.path.relpath(out, ROOT)}')
    return worst


if __name__ == '__main__':
    os.makedirs(os.path.join(ROOT, 'design', 'diff'), exist_ok=True)
    names = sys.argv[1:] or list(SCREENS)
    worst = max(compare(n) for n in names)
    sys.exit(1 if worst > MAX_MISMATCH else 0)
