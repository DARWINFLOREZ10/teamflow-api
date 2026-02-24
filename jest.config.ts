import type { Config } from 'jest';

const config: Config = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  roots: ['<rootDir>/tests'],
  setupFiles: ['<rootDir>/tests/setupEnv.ts'],
  globalTeardown: '<rootDir>/tests/teardown.ts',
  collectCoverageFrom: ['src/**/*.ts', '!src/server.ts'],
  clearMocks: true,
  forceExit: true
};

export default config;
