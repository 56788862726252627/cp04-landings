// Recovery Drill Fixtures — ADV-18

export const RECOVERY_DRILL_FIXTURES = Object.freeze([
  {
    id:       'drill-001',
    name:     'Full backup health drill (PASSED)',
    scope:    Object.freeze(['FULL']),
    status:   'PASSED',
    clientId: 'client-a',
    findings: Object.freeze([]),
    restoreSimulated: true,
    isReal:   false,
  },
  {
    id:       'drill-002',
    name:     'Config-only restore drill (PASSED)',
    scope:    Object.freeze(['CONFIG']),
    status:   'PASSED',
    clientId: 'client-a',
    findings: Object.freeze([]),
    restoreSimulated: true,
    isReal:   false,
  },
  {
    id:       'drill-003',
    name:     'CRM restore drill (WARNING - stale backup)',
    scope:    Object.freeze(['CRM']),
    status:   'WARNING',
    clientId: 'client-b',
    findings: Object.freeze([
      { severity: 'WARN', message: 'Backup is 8 days old — approaching retention limit' },
    ]),
    restoreSimulated: true,
    isReal:   false,
  },
  {
    id:       'drill-004',
    name:     'Integrity check drill (FAILED — corrupted)',
    scope:    Object.freeze(['DATA']),
    status:   'FAILED',
    clientId: 'client-a',
    findings: Object.freeze([
      { severity: 'CRITICAL', message: 'Checksum mismatch detected in data export' },
    ]),
    restoreSimulated: false,
    isReal:   false,
  },
]);
