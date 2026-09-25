# Release Policy — ADV-06

## Channel Requirements

| Channel | Min Score | Blocking Phases Must Pass | Human Sign-off |
|---------|-----------|--------------------------|----------------|
| INTERNAL | 0 | None | No |
| STAGING | 50 | RENDER, CONSOLE | No |
| BETA | 70 | RENDER, CONSOLE, NETWORK | No |
| PRODUCTION | 85 | RENDER, CONSOLE, NETWORK, CONTROLS | **Always** |

## Blocking Phases

A FAIL on any blocking phase overrides the score gate:

```
BLOCKING_PHASES = ['RENDER', 'CONSOLE', 'NETWORK', 'CONTROLS']
```

Even with score = 90, if CONSOLE = FAIL → channel INTERNAL only.

## Release Decision Flow

```
1. Run QA suite → calculate score
2. Check blocking phases → if any FAIL → channel = INTERNAL
3. Check score → find highest channel where score ≥ minimum
4. If channel = PRODUCTION → require human sign-off
5. Emit release gate record with: score, grade, channel, blockers[]
```

## Integration with ADV-04 Post-Deploy

After deploy to a channel, `postDeployQABridge` runs 6 gates:

| Gate | Blocking |
|------|---------|
| SMOKE_PASS | Yes |
| RENDER_PASS | Yes |
| CONSOLE_CLEAN | Yes |
| NETWORK_CLEAN | Yes |
| PERFORMANCE_OK | No |
| VISUAL_STABLE | No |

If any blocking post-deploy gate fails → deploy marked BLOCKED, incident recorded in ADV-01 observability.

## Guardrails

```
NO_PRODUCTION_DEPLOY = true      ← ADV-06 itself never auto-deploys
NO_EXTERNAL_SPEND = true
FIXTURE_MODE_ONLY = true
```

Production deploys are always manual. The policy engine only outputs a recommendation and structured gate record — never triggers a deploy.
