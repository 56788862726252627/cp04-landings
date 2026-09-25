# Factory AI Router V2

Source: `fabrica-saas/core/aiRouterV2.js`

## Tier System

| Tier | Label | Model | Context Profile | Use Cases |
|------|-------|-------|-----------------|-----------|
| 0 | Stub | null | nano | Placeholders, demo mode |
| 1 | Micro | haiku | micro | Single section, headline copy |
| 2 | Standard | sonnet | standard | Full section, landing page |
| 3 | Premium | sonnet | premium | Multi-section, styled app |
| 4 | Expert | opus | full | Complete app, regulated vertical |

## Auto-Selection Logic

```
regulated=true OR fullApp=true  → Tier 4
8+ sections                     → Tier 3
4-7 sections + budget=high      → Tier 3
4-7 sections + budget=low       → Tier 2
1-3 sections + budget=high      → Tier 2
1-3 sections + budget=low       → Tier 1
```

## Context Compression

```js
import { compressContextForAI } from '...';

const compressed = compressContextForAI(experience);
// → 'preset:clinical-premium | layout:wide | density:comfortable | colorMode:light | ...'
```

Pipe-separated key:value pairs for token-efficient LLM prompting.

## Context Profiles (9)

nano(512) → micro(1024) → minimal(1500) → standard(2048) → premium(4096) →
app(8192) → dashboard(4096) → sector-expert(3000) → full(16384)

See `FACTORY_CONTEXT_POLICY.md` for usage guidance.
