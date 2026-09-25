# Agency Agent Engine — ADV-03

## Purpose

Generates fully configured AI agents adapted to sector, business, client, and channel.
No agent is hardcoded. Every config is derived from the business brief.

## Architecture

```
Input: { businessProfile, vertical, agentType, channel, clientOverrides }
         ↓
  agentGenerator.js
         ↓
  ┌──────────────────────────────────────┐
  │  CORE CONFIG                         │
  │  agentDefinition + humanProfile      │
  ├──────────────────────────────────────┤
  │  POLICIES                            │
  │  salesPolicy + trustPolicy           │
  │  memoryPolicy + toolPolicy           │
  │  psychologyPolicy + escalationEngine │
  ├──────────────────────────────────────┤
  │  VERTICAL ADAPTATION                 │
  │  verticalAdapters + toneEngine       │
  │  purposeEngine + channelProfiles     │
  ├──────────────────────────────────────┤
  │  CLIENT LAYER                        │
  │  clientOverrides (CORE→VERTICAL→CLI) │
  └──────────────────────────────────────┘
         ↓
  promptContract + runtimeConfig
         ↓
  Output: frozen AgentObject
```

## 6 Agent Types

| Type | Primary goal |
|------|-------------|
| CHAT_AGENT | Inform and assist |
| SALES_AGENT | Consultative selling |
| SUPPORT_AGENT | Resolve issues |
| BOOKING_AGENT | Guide to reservation |
| LEAD_AGENT | Qualify and nurture |
| VOICE_AGENT_FOUNDATION | Phone/voice channel |

## Key Principles

- **CONSULTATIVE_SELLING**: No pressure, no manipulation, no false urgency.
- **HONEST_AND_HUMBLE**: Admit uncertainty. Never invent.
- **LEAST_PRIVILEGE**: Each agent gets only the tools it needs.
- **EASY_EXIT**: Human escalation always available.
- **NO_DARK_PATTERNS**: Prohibited list enforced by `psychologyPolicy.js`.

## isReal = false

Every generated agent carries `meta.isReal = false`.
No real API calls. No real data. No real messages.
