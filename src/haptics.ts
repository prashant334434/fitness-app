import { Platform } from 'react-native';
import { trigger } from 'react-native-haptic-feedback';

const opts = { enableVibrateFallback: false, ignoreAndroidSystemSettings: true };

/** Scale/wheel detent — the "click" of a real dial. */
export const tick = () => trigger(Platform.OS === 'android' ? 'clockTick' : 'selection', opts);
export const tap = () => trigger('impactLight', opts);
export const success = () => trigger('notificationSuccess', opts);
