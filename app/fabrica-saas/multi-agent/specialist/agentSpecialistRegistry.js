// Agent Specialist Registry — ADV-17

import { createSpecialistAgentDefinition } from './specialistAgentDefinition.js';

export function createAgentSpecialistRegistry(specialists = []) {
  const map = new Map(specialists.map(s => [s.id, s]));

  return Object.freeze({
    count: specialists.length,

    findById(id) {
      return map.get(id) ?? null;
    },

    findByRole(role) {
      return specialists.filter(s => s.role === role);
    },

    findByCapability(capability) {
      return specialists.filter(s => s.capabilities.includes(capability));
    },

    findCapable(requiredCapabilities = []) {
      return specialists.filter(s =>
        requiredCapabilities.every(c => s.capabilities.includes(c))
      );
    },

    register(specialist) {
      map.set(specialist.id, specialist);
      return specialist;
    },

    snapshot() {
      return Object.freeze({
        count:    map.size,
        agents:   Object.freeze([...map.values()]),
        isReal:   false,
      });
    },

    isReal: false,
  });
}

export function buildDefaultRegistry(overrides = []) {
  const defaults = [
    createSpecialistAgentDefinition({ id: 'chat-1',       role: 'CHAT',       capabilities: ['CHAT','MULTILINGUAL'],                     memoryScope: 'TURN',    writeScope: 'NONE'    }),
    createSpecialistAgentDefinition({ id: 'sales-1',      role: 'SALES',      capabilities: ['CHAT','SALES'],                            memoryScope: 'SESSION', writeScope: 'CRM'     }),
    createSpecialistAgentDefinition({ id: 'support-1',    role: 'SUPPORT',    capabilities: ['CHAT','CUSTOMER_SUPPORT'],                  memoryScope: 'SESSION', writeScope: 'LOCAL'   }),
    createSpecialistAgentDefinition({ id: 'booking-1',    role: 'BOOKING',    capabilities: ['BOOKING','STRUCTURED_EXTRACTION'],          memoryScope: 'TASK',    writeScope: 'BOOKING' }),
    createSpecialistAgentDefinition({ id: 'lead-1',       role: 'LEAD',       capabilities: ['RESEARCH','STRUCTURED_EXTRACTION'],         memoryScope: 'TASK',    writeScope: 'CRM'     }),
    createSpecialistAgentDefinition({ id: 'crm-1',        role: 'CRM',        capabilities: ['STRUCTURED_EXTRACTION'],                   memoryScope: 'TASK',    writeScope: 'CRM'     }),
    createSpecialistAgentDefinition({ id: 'research-1',   role: 'RESEARCH',   capabilities: ['RESEARCH','CHAT'],                         memoryScope: 'TASK',    writeScope: 'NONE'    }),
    createSpecialistAgentDefinition({ id: 'content-1',    role: 'CONTENT',    capabilities: ['CONTENT','CHAT'],                          memoryScope: 'TASK',    writeScope: 'NONE'    }),
    createSpecialistAgentDefinition({ id: 'media-1',      role: 'MEDIA',      capabilities: ['CONTENT','VISION'],                        memoryScope: 'TASK',    writeScope: 'NONE'    }),
    createSpecialistAgentDefinition({ id: 'social-1',     role: 'SOCIAL',     capabilities: ['CONTENT','SOCIAL'],                        memoryScope: 'TASK',    writeScope: 'NONE'    }),
    createSpecialistAgentDefinition({ id: 'voice-1',      role: 'VOICE',      capabilities: ['VOICE_PLANNING','CHAT'],                   memoryScope: 'TURN',    writeScope: 'NONE'    }),
    createSpecialistAgentDefinition({ id: 'qa-1',         role: 'QA',         capabilities: ['REASONING','STRUCTURED_EXTRACTION'],        memoryScope: 'TASK',    writeScope: 'NONE'    }),
    createSpecialistAgentDefinition({ id: 'ops-1',        role: 'OPERATIONS', capabilities: ['REASONING'],                               memoryScope: 'SESSION', writeScope: 'EXTERNAL', riskLevel: 'HIGH' }),
  ];
  return createAgentSpecialistRegistry([...defaults, ...overrides]);
}

export const AGENT_SPECIALIST_REGISTRY_VERSION = '1.0.0';
