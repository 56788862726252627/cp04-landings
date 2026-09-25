// Dynamic Team Builder — ADV-17
// Selects the minimum agent team needed for a given objective.
// Does not use 10 agents when 1 suffices.

const OBJECTIVE_TEAM_MAP = [
  { pattern: /^simple|^faq|^hello|^greet/i, roles: ['CHAT']                                       },
  { pattern: /book/i,                         roles: ['CHAT', 'BOOKING']                            },
  { pattern: /lead.*campaign|full.lead/i,     roles: ['LEAD', 'SALES', 'CRM', 'QA']                },
  { pattern: /lead/i,                         roles: ['LEAD', 'CRM']                               },
  { pattern: /support/i,                      roles: ['SUPPORT']                                   },
  { pattern: /content.*social|social.*camp/i, roles: ['CONTENT', 'SOCIAL', 'MEDIA', 'QA']         },
  { pattern: /content/i,                      roles: ['CONTENT', 'QA']                             },
  { pattern: /sales/i,                        roles: ['SALES', 'CRM']                              },
  { pattern: /voice/i,                        roles: ['VOICE', 'BOOKING']                          },
];

export function buildAgentTeam(objective = '', registry) {
  const match = OBJECTIVE_TEAM_MAP.find(m => m.pattern.test(objective));
  const roles  = match ? match.roles : ['CHAT'];

  const agents = roles.flatMap(role => {
    const found = registry.findByRole(role);
    return found.length ? [found[0]] : [];
  });

  return Object.freeze({
    objective,
    roles:    Object.freeze([...roles]),
    agents:   Object.freeze(agents),
    count:    agents.length,
    minimal:  true, // always select minimum team
    isReal:   false,
  });
}

export const DYNAMIC_TEAM_BUILDER_VERSION = '1.0.0';
