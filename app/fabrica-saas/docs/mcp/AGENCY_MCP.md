# MCP Avanzado — ADV-12

Model Context Protocol (MCP) layer para la Fábrica SaaS de Agencia IA.

## Constraints
- `NO_REAL_MCP_CREDENTIALS=SI` — transports simulated only
- `NO_REAL_EXTERNAL_WRITE=SI` — no side effects on external systems
- `NO_REAL_SPEND=SI` — all cost estimates = 0 EUR
- `NO_REAL_SECRETS=SI` — only env var names stored
- `FACTORY_AGENCY_SCOPE_ONLY=SI`

## Modules (52)
| Layer | Modules |
|-------|---------|
| core | 6 |
| registry | 1 |
| discovery | 1 |
| selection | 1 |
| validation | 4 |
| policies | 11 |
| auth | 2 |
| execution | 3 |
| planning | 2 |
| workflow | 1 |
| health | 1 |
| bridges | 10 |
| quality | 2 |
| config | 2 |
| fixtures | 5 |

## Bridges
ADV-01 Observability · ADV-03 Agent Engine · ADV-04 Production Pipeline · ADV-08 Lead Engine · ADV-09 CRM · ADV-10 Agent Evaluation · ADV-10b Business Truth · ADV-11 Voice Agent · Make · AI Router
