/* eslint-env jest */
/* Native-module mocks so screens render under react-test-renderer. */
require('react-native-gesture-handler/jestSetup');

jest.mock('react-native-worklets', () => require('react-native-worklets/lib/module/mock'));
jest.mock('react-native-reanimated', () => require('./reanimated'));
jest.mock('react-native-safe-area-context', () => require('react-native-safe-area-context/jest/mock').default);
jest.mock('react-native-haptic-feedback', () => ({ trigger: jest.fn() }));

/* The RN preset maps image requires to stubs without dimensions; give every design
   asset its real pixel size so `size()` resolves exactly as on device. */
jest.mock('react-native/Libraries/Image/resolveAssetSource', () => {
  const { readSize } = require('./imageSize');
  return src => (src && src.testUri ? { uri: src.testUri, ...readSize(src.testUri) } : src);
});
