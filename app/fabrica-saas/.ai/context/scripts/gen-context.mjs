#!/usr/bin/env node
/**
 * Repomix context generator for Fábrica SaaS
 * Usage: node gen-context.mjs [profile]
 * Profiles: core | generator | client | design | tests | architecture | all
 */
import { execSync } from 'node:child_process';
import { existsSync, mkdirSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dir = dirname(fileURLToPath(import.meta.url));
const ROOT = resolve(__dir, '../../../../');
const PRESETS_DIR = resolve(__dir, '../presets');
const OUT_DIR = resolve(__dir, '../generated');

if (!existsSync(OUT_DIR)) mkdirSync(OUT_DIR, { recursive: true });

const PROFILES = {
  core:         `${PRESETS_DIR}/factory-core.json`,
  generator:    `${PRESETS_DIR}/generator.json`,
  client:       `${PRESETS_DIR}/client-current.json`,
  design:       `${PRESETS_DIR}/design-system.json`,
  tests:        `${PRESETS_DIR}/tests.json`,
  architecture: `${PRESETS_DIR}/architecture.json`,
};

const arg = process.argv[2] || 'all';
const targets = arg === 'all' ? Object.keys(PROFILES) : [arg];

for (const name of targets) {
  const configPath = PROFILES[name];
  if (!configPath || !existsSync(configPath)) {
    console.error(`Unknown profile: ${name}. Available: ${Object.keys(PROFILES).join(', ')}`);
    process.exit(1);
  }
  console.log(`\n[repomix] Generating context: ${name}...`);
  try {
    execSync(`npx repomix --config "${configPath}"`, { cwd: ROOT, stdio: 'inherit' });
    console.log(`[repomix] ✓ ${name} done`);
  } catch (e) {
    console.error(`[repomix] ✗ ${name} failed:`, e.message);
  }
}
console.log('\n[repomix] Context generation complete.');
console.log(`Output: ${OUT_DIR}/`);
