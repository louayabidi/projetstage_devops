module.exports = {
  testEnvironment: 'jsdom',
  setupFilesAfterEnv: ['./src/setupTests.js'],
  transform: {
    '^.+\\.[tj]sx?$': 'babel-jest',
    '\\.(jpg|jpeg|png|gif|svg)$': 'jest-transform-stub'
  },
  transformIgnorePatterns: [
    '/node_modules/(?!maath/)'
  ],
  moduleFileExtensions: ['js', 'jsx', 'ts', 'tsx'],
  moduleNameMapper: {
    '^components/(.*)$': '<rootDir>/src/dashboard/components/$1',
    '^assets/(.*)$': '<rootDir>/src/assets/$1',
    '^hoc/(.*)$': '<rootDir>/src/hoc/$1',
    '^utils/(.*)$': '<rootDir>/src/utils/$1',
    '^examples/(.*)$': '<rootDir>/src/dashboard/examples/$1'
  },
  moduleDirectories: ['node_modules', 'src']
};