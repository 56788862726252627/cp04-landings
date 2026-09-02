# AI Model Aliases — ADV-16

Agents request aliases, not concrete model IDs. This decouples agent logic from provider specifics.

| Alias | Requirements |
|-------|-------------|
| FAST | speedClass=VERY_FAST, minQuality=BASIC |
| BALANCED | speedClass=FAST, minQuality=STANDARD |
| PREMIUM | speedClass=NORMAL, minQuality=HIGH |
| REASONING | capability=REASONING, minQuality=HIGH |
| CODING | capability=CODING, minQuality=STANDARD |
| VISION | capability=VISION, minQuality=STANDARD |
| CHEAP | costClass=VERY_LOW, minQuality=BASIC |
| LOCAL | provider=local, minQuality=BASIC |
| VOICE | capability=VOICE_PLANNING, minQuality=STANDARD |

Usage: `createAIRequestProfile({ modelAlias: 'FAST' })`
