import React, { useCallback, useRef } from 'react';
import { Platform, ScrollView, Settings } from 'react-native';

/**
 * Dev-only: honours `-devScrollY <pt>` passed via `xcrun simctl launch`, so
 * scripts/visual-diff.py can capture any part of a long screen. No-op in release.
 */
export function useDevScroll() {
  const ref = useRef<React.ComponentRef<typeof ScrollView>>(null);
  const done = useRef(false);
  const onContentSizeChange = useCallback(() => {
    if (!__DEV__ || Platform.OS !== 'ios' || done.current) return;
    const y = Number(Settings.get('devScrollY'));
    if (y > 0) {
      done.current = true;
      ref.current?.scrollTo({ y, animated: false });
    }
  }, []);
  return { ref, onContentSizeChange };
}
