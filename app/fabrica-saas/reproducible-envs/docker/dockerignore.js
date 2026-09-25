// .dockerignore Policy — ADV-15

const ALWAYS_EXCLUDE = Object.freeze([
  'node_modules',
  '.git',
  '.gitignore',
  '*.log',
  'npm-debug.log*',
  '.env',
  '.env.*',
  '!.env.example',
  'coverage',
  '.nyc_output',
  'dist',
  '.DS_Store',
  'Thumbs.db',
  '.vscode',
  '.idea',
  '*.tmp',
  '*.bak',
  'screenshots',
  'playwright-report',
  'test-results',
  'audit',
  '.secrets',
  '*.pem',
  '*.key',
  '*.p12',
  '*.pfx',
  'docker-compose*.override.yml',
]);

const NEVER_EXCLUDE = Object.freeze([
  'package.json',
  'package-lock.json',
  'pnpm-lock.yaml',
  'yarn.lock',
  'src',
  'public',
  'index.html',
  'vite.config.*',
]);

export function generateDockerignoreContent(config = {}) {
  const { extraExcludes = [], keepFiles = [] } = config;

  const all = [...ALWAYS_EXCLUDE, ...extraExcludes].filter(
    p => !keepFiles.includes(p),
  );

  return Object.freeze({
    content: all.join('\n') + '\n',
    rules:   Object.freeze(all),
    alwaysExclude: ALWAYS_EXCLUDE,
    neverExclude:  NEVER_EXCLUDE,
    noSecretsInContext: true,
    isReal: false,
  });
}

export function validateDockerignoreRules(rules = []) {
  const leaks = ['.env', '.secrets', '*.key', '*.pem', '*.p12'];
  const missing = leaks.filter(l =>
    !rules.some(r => r === l || r === l.replace('*.', '')),
  );
  return Object.freeze({
    valid:   missing.length === 0,
    missing: Object.freeze(missing),
    isReal:  false,
  });
}

export const DOCKERIGNORE_POLICY_VERSION = '1.0.0';
