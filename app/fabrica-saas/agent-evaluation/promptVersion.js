// Agent Prompt Version — ADV-10

import { createHash } from 'node:crypto';

export const PROMPT_STATUS = Object.freeze({
  DRAFT:    'DRAFT',
  STAGING:  'STAGING',
  PROMOTED: 'PROMOTED',
  RETIRED:  'RETIRED',
});

export function createAgentPromptVersion(fields = {}) {
  const content = fields.content ?? '';
  const hash    = content ? createHash('sha256').update(content).digest('hex').slice(0, 16) : '';
  return Object.freeze({
    version:         fields.version ?? '1.0.0',
    agentType:       fields.agentType ?? '',
    vertical:        fields.vertical ?? 'general',
    hash,
    evaluationScore: fields.evaluationScore ?? null,
    status:          fields.status ?? PROMPT_STATUS.DRAFT,
    createdAt:       fields.createdAt ?? new Date().toISOString(),
    isReal: false,
  });
}

export const PROMPT_VERSION_SCHEMA_VERSION = '1.0.0';
