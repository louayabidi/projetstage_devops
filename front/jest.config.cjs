module.exports = {
  testEnvironment: 'jsdom',
  setupFilesAfterEnv: ['./src/setupTests.js'],
  transform: {
    '^.+\\.[tj]sx?$': 'babel-jest',
    '\\.(jpg|jpeg|png|gif|svg)$': 'jest-transform-stub',
  },
  transformIgnorePatterns: [
  '/node_modules/(?!maath|react-github-btn|react-leaflet|@react-leaflet/.*)'
  ],
  moduleFileExtensions: ['js', 'jsx', 'ts', 'tsx'],
  moduleNameMapper: {
  // Mock packages
  '^react-github-btn$': '<rootDir>/src/__mocks__/react-github-btn.js',
  '\\.(css|less|scss|sass)$': 'identity-obj-proxy',
  // Mock static files
  '^assets/(.*)\\.(jpg|jpeg|png|gif|svg)$': 'jest-transform-stub',
  '^dashboard-assets/(.*)\\.(jpg|jpeg|png|gif|svg)$': 'jest-transform-stub',

  // Specific theme mapping first
  '^assets/theme/(.*)$': '<rootDir>/src/dashboard/assets/theme/$1',
  '^variables/(.*)$': '<rootDir>/src/dashboard/variables/$1',

  // General assets mapping
  '^assets/(.*)$': '<rootDir>/src/assets/$1',
  '^dashboard-assets/(.*)$': '<rootDir>/src/dashboard/assets/$1',

  // Layouts
  '^layouts/(.*)$': '<rootDir>/src/dashboard/layouts/$1',

  // Components, HOCs, utils
  '^components/(.*)$': '<rootDir>/src/dashboard/components/$1',
  '^hoc/(.*)$': '<rootDir>/src/hoc/$1',
  '^utils/(.*)$': '<rootDir>/src/utils/$1',
  '^examples/(.*)$': '<rootDir>/src/dashboard/examples/$1',

  // CSS / SASS
  '\\.(css|less|scss|sass)$': 'identity-obj-proxy',
},

  moduleDirectories: ['node_modules', 'src'],
};
