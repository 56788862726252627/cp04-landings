// Multi-Tenant Fixtures — ADV-18 (client isolation tests)

export const MULTI_TENANT_FIXTURES = Object.freeze({
  clientA: Object.freeze({
    clientId: 'client-a',
    catalog: Object.freeze([
      { backupId: 'bk-full-001', scope: ['CONFIG', 'DATA'], status: 'COMPLETED', restoreReady: true },
      { backupId: 'bk-config-001', scope: ['CONFIG'], status: 'COMPLETED', restoreReady: true },
      { backupId: 'bk-bt-001', scope: ['BUSINESS_TRUTH'], status: 'COMPLETED', restoreReady: true },
    ]),
    restorePoints: Object.freeze([
      { restorePointId: 'rp-001', backupId: 'bk-full-001', verified: true, status: 'VERIFIED' },
    ]),
  }),

  clientB: Object.freeze({
    clientId: 'client-b',
    catalog: Object.freeze([
      { backupId: 'bk-crm-001', scope: ['CRM'], status: 'COMPLETED', restoreReady: true },
      { backupId: 'bk-leads-001', scope: ['LEADS'], status: 'COMPLETED', restoreReady: true },
    ]),
    restorePoints: Object.freeze([
      { restorePointId: 'rp-004', backupId: 'bk-crm-001', verified: false, status: 'AVAILABLE' },
    ]),
  }),

  crossTenantAttempts: Object.freeze([
    {
      id:            'cross-001',
      name:          'Client A attempts to access Client B backup',
      requestingClientId: 'client-a',
      targetClientId:    'client-b',
      targetBackupId:    'bk-crm-001',
      blocked:       true,
      reason:        'CLIENT_MISMATCH',
      isReal:        false,
    },
    {
      id:            'cross-002',
      name:          'Client B attempts to restore from Client A restore point',
      requestingClientId: 'client-b',
      targetClientId:    'client-a',
      targetRestorePointId: 'rp-001',
      blocked:       true,
      reason:        'CLIENT_MISMATCH',
      isReal:        false,
    },
    {
      id:            'cross-003',
      name:          'Agent attempts cross-client backup read (blocked)',
      requestingClientId: 'client-a',
      targetClientId:    'client-b',
      operation:     'READ_CATALOG',
      blocked:       true,
      reason:        'CROSS_CLIENT_ACCESS_FORBIDDEN',
      isReal:        false,
    },
    {
      id:            'cross-004',
      name:          'Cross-client restore attempt (blocked)',
      requestingClientId: 'client-b',
      targetClientId:    'client-a',
      operation:     'RESTORE',
      blocked:       true,
      reason:        'CROSS_CLIENT_RESTORE_FORBIDDEN',
      isReal:        false,
    },
  ]),
});
