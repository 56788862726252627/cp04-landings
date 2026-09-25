// Data / DB Bridge — ADV-04
// ProductionDataPlan: reusable contract for data layer configuration.
// Compatible with Supabase/Postgres. Never connects real data in tests.

export const DB_PROVIDER = Object.freeze({
  SUPABASE:  'SUPABASE',
  POSTGRES:  'POSTGRES',
  SQLITE:    'SQLITE',
  MOCK:      'MOCK',
});

export const SEED_STRATEGY = Object.freeze({
  FIXTURES:  'FIXTURES',
  MIGRATION: 'MIGRATION',
  EMPTY:     'EMPTY',
  RESTORE:   'RESTORE',
});

export const BACKUP_POLICY = Object.freeze({
  DAILY_AUTO:   'DAILY_AUTO',
  WEEKLY_AUTO:  'WEEKLY_AUTO',
  MANUAL:       'MANUAL',
  NONE:         'NONE',
});

/**
 * Create a ProductionDataPlan.
 * Defines schema, migrations, fixtures, backup, retention, isolation strategy.
 * Never contains real credentials or sensitive data.
 */
export function createProductionDataPlan(params = {}) {
  if (!params.projectId) return { valid: false, error: 'projectId required' };
  if (!params.vertical)  return { valid: false, error: 'vertical required' };

  const provider      = params.provider      ?? DB_PROVIDER.SUPABASE;
  const seedStrategy  = params.seedStrategy  ?? SEED_STRATEGY.FIXTURES;
  const backupPolicy  = params.backupPolicy  ?? BACKUP_POLICY.DAILY_AUTO;
  const modules       = params.modules ?? [];

  const schema = modules.map(m => ({
    entity:      m,
    tableName:   m.toLowerCase().replace(/\s+/g, '_'),
    rls:         true,
    tenantField: 'client_id',
  }));

  return Object.freeze({
    valid:           true,
    projectId:       params.projectId,
    vertical:        params.vertical,
    provider,
    schema,
    migrations:      [],
    fixtures:        params.fixtures ?? `fixtures/${params.vertical}-seed.sql`,
    backupPolicy,
    retention:       params.retention ?? '90_DAYS',
    clientIsolation: 'RLS_TENANT_FIELD',
    seedStrategy,
    secretsRequired: ['SUPABASE_URL', 'SUPABASE_ANON_KEY', 'SUPABASE_SERVICE_KEY'],
    isReal:          false,
    disclaimer:      'No real DB connection — schema design only.',
  });
}

export const DATA_DB_BRIDGE_VERSION = '1.0.0';
