// MCP Tool Selector — ADV-12

import { listTools } from '../registry/mcpRegistry.js';

const INTENT_PATTERNS = [
  { intent: 'READ_CRM',       patterns: [/crm|lead|contact|prospect|cliente/i] },
  { intent: 'READ_CALENDAR',  patterns: [/calendar|agenda|cita|disponib|horario/i] },
  { intent: 'WRITE_CALENDAR', patterns: [/reserv|book|agendar|crear cita/i] },
  { intent: 'SEND_EMAIL',     patterns: [/email|correo|send mail/i] },
  { intent: 'SEND_SMS',       patterns: [/sms|mensaje de texto/i] },
  { intent: 'SEND_WHATSAPP',  patterns: [/whatsapp|wapp/i] },
  { intent: 'WEB_SEARCH',     patterns: [/busca|search|investiga/i] },
  { intent: 'READ_FILES',     patterns: [/archivo|fichero|documento|file/i] },
  { intent: 'READ_DATABASE',  patterns: [/base de datos|database|query|consulta/i] },
  { intent: 'EXECUTE_WORKFLOW', patterns: [/workflow|flujo|automatiz|make/i] },
];

function detectIntent(text) {
  for (const { intent, patterns } of INTENT_PATTERNS) {
    if (patterns.some(p => p.test(text))) return intent;
  }
  return null;
}

export function selectTool(intentText = '', context = {}, clientId = 'global') {
  const detectedIntent = detectIntent(intentText);
  const all = [...listTools(clientId)];

  let candidates = detectedIntent
    ? all.filter(t => Array.isArray(t.requiredScopes) && t.requiredScopes.includes(detectedIntent))
    : all;

  if (context.preferReadOnly) candidates = candidates.filter(t => t.readOnly);
  if (context.excludeDestructive) candidates = candidates.filter(t => !t.destructive);

  const sorted = candidates.sort((a, b) => {
    const riskA = ['LOW','MEDIUM','HIGH','CRITICAL'].indexOf(a.riskLevel);
    const riskB = ['LOW','MEDIUM','HIGH','CRITICAL'].indexOf(b.riskLevel);
    return riskA - riskB;
  });

  const selected    = sorted[0] ?? null;
  const alternatives = sorted.slice(1, 4);

  return Object.freeze({
    selected,
    alternatives: Object.freeze(alternatives),
    detectedIntent,
    requiresApproval: selected ? selected.requiresHumanApproval : false,
    reasoning: selected
      ? `Selected ${selected.name} for intent "${detectedIntent ?? 'general"'}"`
      : 'No suitable tool found',
    isReal: false,
  });
}

export const MCP_TOOL_SELECTOR_VERSION = '1.0.0';
