import { PlaywrightTestConfig } from '@playwright/test';
import baseConfig from './playwright.config';

const config: PlaywrightTestConfig = {
  ...baseConfig,
  use: {
    ...baseConfig.use,
    // Enable coverage collection
    launchOptions: {
      args: ['--enable-precise-memory-info', '--js-flags=--expose-gc'],
    },
  },
  reporter: [
    ['list'],
    ['html', { open: 'never' }],
    ['json', { outputFile: 'test-results/coverage/coverage.json' }],
    ['junit', { outputFile: 'test-results/coverage/junit.xml' }],
  ],
  // Coverage configuration
  coverage: {
    enabled: true,
    directory: 'test-results/coverage',
    reporter: [
      ['text', { file: 'coverage.txt' }],
      ['html', { directory: 'coverage-report' }],
      ['json', { file: 'coverage.json' }],
      ['cobertura', { file: 'cobertura.xml' }],
    ],
    exclude: [
      'node_modules/**',
      'test-results/**',
      'tests/**',
      '**/*.config.ts',
      '**/*.d.ts',
    ],
    include: [
      'src/**/*.ts',
      'src/**/*.tsx',
      'src/**/*.js',
      'src/**/*.jsx',
    ],
    threshold: {
      statements: 80,
      branches: 70,
      functions: 80,
      lines: 80,
    },
  },
};

export default config; 