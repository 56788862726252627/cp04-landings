import { defineConfig } from '@playwright/test';
import { fileURLToPath } from 'url';
import path from 'path';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const FIXTURES = path.join(__dirname, 'fixtures');

export default defineConfig({
  testDir: './e2e',
  timeout:  30_000,
  retries:  1,
  workers:  1,
  use: {
    headless: true,
    viewport: { width: 1280, height: 800 },
  },
  projects: [
    {
      name: 'chromium-premium',
      use: {
        browserName: 'chromium',
        baseURL: `file://${FIXTURES}/`,
      },
    },
  ],
});
