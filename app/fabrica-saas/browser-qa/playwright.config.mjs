import { defineConfig, devices } from '@playwright/test';
import { fileURLToPath } from 'url';
import { dirname, resolve } from 'path';

const __dirname = dirname(fileURLToPath(import.meta.url));
const FIXTURE_PATH = resolve(__dirname, 'fixtures/nexoVet.html');
const FIXTURE_URL  = `file://${FIXTURE_PATH}`;

export default defineConfig({
  testDir:    resolve(__dirname, 'e2e'),
  timeout:    30_000,
  retries:    1,
  workers:    1,
  reporter:   [['list'], ['json', { outputFile: 'browser-qa/test-results/report.json' }]],
  outputDir:  resolve(__dirname, 'test-results'),
  use: {
    baseURL:          FIXTURE_URL,
    headless:         true,
    screenshot:       'only-on-failure',
    video:            'off',
    trace:            'off',
    actionTimeout:    10_000,
    navigationTimeout:15_000,
  },
  projects: [
    {
      name:  'chromium',
      use:   { ...devices['Desktop Chrome'] },
    },
  ],
});
