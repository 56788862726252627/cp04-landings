// Backup Secret Exclusion Policy — ADV-18
// Secrets must NEVER appear in backups. Detection triggers BLOCKED.

const SECRET_PATTERNS = [
  { pattern: /\.env($|\.)/i,              reason: 'ENV_FILE' },
  { pattern: /api[_-]?key/i,             reason: 'API_KEY' },
  { pattern: /secret[_-]?key/i,          reason: 'SECRET_KEY' },
  { pattern: /access[_-]?token/i,        reason: 'ACCESS_TOKEN' },
  { pattern: /bearer\s+[a-z0-9]/i,       reason: 'BEARER_TOKEN' },
  { pattern: /password/i,                reason: 'PASSWORD' },
  { pattern: /private[_-]?key/i,         reason: 'PRIVATE_KEY' },
  { pattern: /oauth[_-]?secret/i,        reason: 'OAUTH_SECRET' },
  { pattern: /credentials?\.(json|yaml|yml|toml)/i, reason: 'CREDENTIALS_FILE' },
  { pattern: /-----BEGIN .* PRIVATE KEY-----/, reason: 'PEM_PRIVATE_KEY' },
  { pattern: /stripe[_-]?(secret|sk_)/i, reason: 'STRIPE_SECRET' },
  { pattern: /supabase[_-]?service[_-]?role/i, reason: 'SUPABASE_SERVICE_ROLE' },
];

export function createBackupSecretExclusionPolicy() {
  return Object.freeze({
    inspect(pathOrContent = '') {
      if (typeof pathOrContent !== 'string') {
        return Object.freeze({ safe: true, blocked: false, reasons: Object.freeze([]), isReal: false });
      }
      const reasons = SECRET_PATTERNS
        .filter(p => p.pattern.test(pathOrContent))
        .map(p => p.reason);

      return Object.freeze({
        safe:    reasons.length === 0,
        blocked: reasons.length > 0,
        reasons: Object.freeze(reasons),
        isReal:  false,
      });
    },

    inspectItems(items = []) {
      const detected = [];
      for (const item of items) {
        const check = this.inspect(item?.pathOrLogicalName ?? item?.type ?? '');
        if (check.blocked) detected.push({ item: item?.pathOrLogicalName ?? item?.type, reasons: check.reasons });
      }
      return Object.freeze({
        safe:     detected.length === 0,
        blocked:  detected.length > 0,
        detected: Object.freeze(detected),
        isReal:   false,
      });
    },

    isReal: false,
  });
}

export const BACKUP_SECRET_EXCLUSION_VERSION = '1.0.0';
