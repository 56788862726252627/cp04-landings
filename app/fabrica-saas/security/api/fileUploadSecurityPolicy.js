// File Upload Security Policy — ADV-19

const ALLOWED_TYPES_DEFAULT = ['image/jpeg','image/png','image/webp','application/pdf','text/plain'];
const UNSAFE_EXTENSIONS = /\.(php|exe|sh|bat|cmd|ps1|py|rb|pl|jsp|asp|aspx|cgi)$/i;
const PATH_TRAVERSAL = /\.\.|\/\//;

export function createFileUploadSecurityPolicy(config = {}) {
  const {
    allowedTypes = ALLOWED_TYPES_DEFAULT,
    maxSizeBytes = 5 * 1024 * 1024,
    malwareScanFoundation = true,
    storageIsolated = true,
    clientId = null,
  } = config;

  function validateUpload(file = {}) {
    const { name = '', type = '', size = 0, path = '' } = file;
    const findings = [];

    if (allowedTypes.length > 0 && !allowedTypes.includes(type)) {
      findings.push({ issue: 'FILE_TYPE_NOT_ALLOWED', severity: 'HIGH' });
    }

    if (size > maxSizeBytes) {
      findings.push({ issue: 'FILE_TOO_LARGE', severity: 'MEDIUM' });
    }

    if (UNSAFE_EXTENSIONS.test(name)) {
      findings.push({ issue: 'UNSAFE_FILE_EXTENSION', severity: 'CRITICAL' });
    }

    if (PATH_TRAVERSAL.test(name) || PATH_TRAVERSAL.test(path)) {
      findings.push({ issue: 'PATH_TRAVERSAL_DETECTED', severity: 'CRITICAL' });
    }

    return Object.freeze({
      safe: findings.every(f => f.severity !== 'CRITICAL') && findings.length === 0,
      blocked: findings.some(f => f.severity === 'CRITICAL'),
      findings: Object.freeze(findings.map(f => Object.freeze(f))),
      isReal: false,
    });
  }

  return Object.freeze({
    clientId,
    allowedTypes: Object.freeze([...allowedTypes]),
    maxSizeBytes,
    malwareScanFoundation,
    storageIsolated,
    validateUpload,
    isReal: false,
  });
}

export const FILE_UPLOAD_SECURITY_VERSION = '1.0.0';
