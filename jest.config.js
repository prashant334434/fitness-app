module.exports = {
  preset: '@react-native/jest-preset',
  setupFiles: ['<rootDir>/jest/setup.js'],
  moduleNameMapper: {
    // the package's react-native condition points at untranspiled .mjs
    '^lucide-react-native$': '<rootDir>/node_modules/lucide-react-native/dist/cjs/lucide-react-native.js',
  },
  testPathIgnorePatterns: ['/node_modules/', '/ios/', '/android/'],
  transformIgnorePatterns: [
    'node_modules/(?!((jest-)?react-native|@react-native(-community)?|@react-navigation|react-native-.*|lucide-react-native)/)',
  ],
};
