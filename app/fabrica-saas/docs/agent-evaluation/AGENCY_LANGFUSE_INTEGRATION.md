# Agency Langfuse Integration — ADV-10

## Status: Dry-Run Only

Langfuse is abstracted as an optional telemetry provider. No real API calls are made.

## Provider Abstraction

```
EvaluationTelemetryProvider
  └── LocalEvaluationProvider   (default — stores locally)
  └── NoopEvaluationProvider    (drops all events)
  └── LangfuseProviderFoundation (dry-run, no export)
```

## LangfuseEvaluationAdapter

- `sendTrace(trace)` → returns `{ sent: false, dryRun: true }`
- `sendScore(score)` → returns `{ sent: false, dryRun: true }`

## AgentTrace → Langfuse Format

`langfuseDashboardBridge.js` maps `AgentTrace` fields to Langfuse trace format:
- `traceId` → `id`
- `agentType` + `vertical` → `name`
- All metadata fields → `metadata` object

## Activating Real Langfuse (Future)

1. Set `LANGFUSE_PUBLIC_KEY` and `LANGFUSE_SECRET_KEY` env vars
2. Replace `LangfuseProviderFoundation` with a real HTTP client
3. Never send PII — `redactionPolicy.js` must run before export

## Privacy Guardrails

- Redaction applied before any telemetry event
- `isReal: false` on all fixture/evaluation objects
- No real conversation data stored or exported
