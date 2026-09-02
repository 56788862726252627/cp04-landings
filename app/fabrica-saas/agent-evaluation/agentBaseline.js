// Agent Engine V1 Baseline — ADV-10

export const AGENT_ENGINE_V1_BASELINE = Object.freeze({
  version:    'agent-engine-v1',
  createdAt:  '2026-09-02',
  dimensions: Object.freeze({
    NATURALNESS:      72,
    USEFULNESS:       78,
    CLARITY:          80,
    BREVITY:          70,
    HUMANNESS:        68,
    GROUNDING:        82,
    SAFETY:           95,
    TOOL_USE:         75,
    ESCALATION:       80,
    CONSISTENCY:      74,
    SALES_QUALITY:    71,
  }),
  overall:        76,
  criticalFailureCount: 0,
  latencyFixtureMs:  1200,
  tokenFixture:   Object.freeze({ input: 800, output: 250 }),
  note:           'Fixture baseline — not derived from real production traffic.',
  isReal: false,
});

export function createAgentBaseline(fields = {}) {
  return Object.freeze({
    version:    fields.version ?? 'v1',
    dimensions: Object.freeze({ ...(fields.dimensions ?? {}) }),
    overall:    fields.overall ?? 0,
    createdAt:  fields.createdAt ?? new Date().toISOString(),
    note:       fields.note ?? 'Fixture baseline',
    isReal: false,
  });
}

export const BASELINE_VERSION = '1.0.0';
