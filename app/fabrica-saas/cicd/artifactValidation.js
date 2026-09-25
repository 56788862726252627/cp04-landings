// Artifact Validation — ADV-02 CI/CD Automatizado
// validateBuildArtifact(): verifica que el build output sea válido y seguro.

import { existsSync, statSync, readdirSync } from 'node:fs';
import { join } from 'node:path';

export const ARTIFACT_STATUS = Object.freeze({
  VALID:   'VALID',
  INVALID: 'INVALID',
  WARNING: 'WARNING',
});

const DEFAULT_REQUIRED_PATTERNS = ['index.html', 'assets'];
const DEV_FILE_PATTERNS = [/\.map$/, /node_modules/, /\.env/, /\.secret/];

const SIZE_LIMITS = {
  WARNING_MB: 10,
  FAIL_MB:    50,
};

function mbFromBytes(bytes) { return bytes / (1024 * 1024); }

/**
 * Validate a build artifact directory.
 * distPath: absolute path to the dist folder.
 * options: { requiredPatterns, maxSizeMb, allowSourceMaps }
 */
export function validateBuildArtifact(distPath, options = {}) {
  const errors   = [];
  const warnings = [];
  const checks   = [];

  if (!distPath) return { valid: false, status: ARTIFACT_STATUS.INVALID, errors: ['distPath required'] };

  // 1. Directory exists
  const exists = existsSync(distPath);
  checks.push({ check: 'dist_exists', pass: exists });
  if (!exists) {
    errors.push(`Artifact directory not found: ${distPath}`);
    return { valid: false, status: ARTIFACT_STATUS.INVALID, errors, warnings, checks };
  }

  // 2. Required files/folders
  const required = options.requiredPatterns ?? DEFAULT_REQUIRED_PATTERNS;
  const presentItems = readdirSync(distPath);
  const missingFiles = [];
  for (const req of required) {
    const found = presentItems.some(item => item.includes(req) || item === req);
    if (!found) missingFiles.push(req);
    checks.push({ check: `required:${req}`, pass: found });
  }
  if (missingFiles.length > 0) errors.push(`Missing required: ${missingFiles.join(', ')}`);

  // 3. index.html entrypoint check
  const indexExists = existsSync(join(distPath, 'index.html'));
  checks.push({ check: 'index_html_exists', pass: indexExists });
  if (!indexExists) errors.push('index.html not found in dist');

  // 4. No accidental dev files
  const devFiles = presentItems.filter(item =>
    DEV_FILE_PATTERNS.some(p => p.test(item))
  );
  checks.push({ check: 'no_dev_files', pass: devFiles.length === 0 });
  if (devFiles.length > 0) warnings.push(`Dev files in artifact: ${devFiles.join(', ')}`);

  // 5. Size check (top-level items only for speed)
  let totalBytes = 0;
  for (const item of presentItems) {
    try {
      const st = statSync(join(distPath, item));
      if (st.isFile()) totalBytes += st.size;
    } catch { /* skip */ }
  }
  const sizeMb = mbFromBytes(totalBytes);
  const maxSizeMb = options.maxSizeMb ?? SIZE_LIMITS.FAIL_MB;
  const sizeOk    = sizeMb < maxSizeMb;
  checks.push({ check: 'size_under_limit', pass: sizeOk, sizeMb: parseFloat(sizeMb.toFixed(2)) });
  if (!sizeOk)      errors.push(`Artifact too large: ${sizeMb.toFixed(1)}MB > ${maxSizeMb}MB`);
  if (sizeMb > SIZE_LIMITS.WARNING_MB) warnings.push(`Artifact size ${sizeMb.toFixed(1)}MB is large`);

  const valid  = errors.length === 0;
  const status = valid && warnings.length === 0 ? ARTIFACT_STATUS.VALID
    : valid                                      ? ARTIFACT_STATUS.WARNING
    : ARTIFACT_STATUS.INVALID;

  return {
    valid,
    status,
    errors,
    warnings,
    checks,
    missingFiles,
    sizeMb: parseFloat(sizeMb.toFixed(2)),
    fileCount: presentItems.length,
    message: valid ? 'Artifact valid' : `Artifact invalid: ${errors.join('; ')}`,
  };
}

/**
 * Validate artifact from a file list (for testing without real FS).
 * files: string[] — list of file paths relative to dist
 */
export function validateArtifactFromList(files = [], options = {}) {
  const required = options.requiredPatterns ?? DEFAULT_REQUIRED_PATTERNS;
  const missingFiles = required.filter(req => !files.some(f => f.includes(req)));
  const devFiles = files.filter(f => DEV_FILE_PATTERNS.some(p => p.test(f)));
  const hasIndex = files.some(f => f === 'index.html' || f.endsWith('/index.html'));
  const errors   = [];
  const warnings = [];

  if (missingFiles.length > 0) errors.push(`Missing required: ${missingFiles.join(', ')}`);
  if (!hasIndex)                errors.push('index.html not found');
  if (devFiles.length > 0)     warnings.push(`Dev files in artifact: ${devFiles.join(', ')}`);

  return {
    valid:        errors.length === 0,
    status:       errors.length > 0 ? ARTIFACT_STATUS.INVALID : warnings.length > 0 ? ARTIFACT_STATUS.WARNING : ARTIFACT_STATUS.VALID,
    errors,
    warnings,
    missingFiles,
    fileCount:    files.length,
  };
}

export const ARTIFACT_VALIDATION_VERSION = '1.0.0';
