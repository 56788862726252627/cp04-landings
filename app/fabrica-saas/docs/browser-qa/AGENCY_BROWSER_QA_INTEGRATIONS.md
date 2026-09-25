# Browser QA Integration Bridges — ADV-06

ADV-06 connects to four prior factory modules via dedicated bridge files. All bridges are pure-JS adapters — they transform QA results into the format expected by each target system.

## ADV-01: Observability Bridge

**File**: `browser-qa/observabilityBridge.js`

Emits structured events to the ADV-01 observability pipeline after each QA run.

10 event types:
```
BROWSER_QA_STARTED, PHASE_STARTED, PHASE_COMPLETED, PHASE_FAILED,
BROWSER_QA_COMPLETED, BROWSER_QA_FAILED, SCORE_CALCULATED,
RELEASE_GATE_EVALUATED, PERFORMANCE_METRIC, SCREENSHOT_CAPTURED
```

**Security**: `sanitizePayload` redacts fields matching: `secret`, `password`, `token`, `key`, `credential`, `apiKey`, `privateKey` before emission.

**Usage**: `createBrowserQALogger(emitFn)` → returns logger with `.phase()`, `.score()`, `.release()` methods.

## ADV-02: CI/CD Bridge

**File**: `browser-qa/cicdBridge.js`

Generates CI pipeline YAML specs and selects which CI jobs to run for a given file diff.

```js
generateCIYamlSpec({ phases, parallel, onFailure })
// → { jobs: [...], triggers: [...], artifacts: [...] }

selectCIJobsForDiff(changedFiles)
// → string[] of CI job names to activate
```

Maps test phase names to job identifiers. Parallel execution groups: `[RENDER+CONSOLE+NETWORK]`, `[FORMS+CONTROLS]`, `[RESPONSIVE+MOBILE_NAV]`, `[ACCESSIBILITY+KEYBOARD]`.

## ADV-04: Post-Deploy QA Bridge

**File**: `browser-qa/postDeployQABridge.js`

Runs after a deploy completes. 6 gates evaluated:

| Gate ID | Blocking | Trigger |
|---------|---------|---------|
| SMOKE_PASS | Yes | Smoke suite must have 0 failures |
| RENDER_PASS | Yes | RENDER phase score = PASS |
| CONSOLE_CLEAN | Yes | CONSOLE phase score = PASS |
| NETWORK_CLEAN | Yes | NETWORK phase score = PASS |
| PERFORMANCE_OK | No | Core Web Vitals within budget |
| VISUAL_STABLE | No | No visual regression vs baseline |

If blocking gate fails → deploy state = `BLOCKED`; ADV-01 event emitted: `DEPLOY_BLOCKED`.

## ADV-05: Smart E2E Selector

**File**: `browser-qa/smartE2ESelector.js`

Selects which QA phases to run based on which files changed in the commit.

```js
FILE_TO_TEST_MAP = {
  'components/':  ['RENDER','CONSOLE','CONTROLS','VISUAL'],
  'styles/':      ['RESPONSIVE','VISUAL'],
  'forms/':       ['FORMS','ACCESSIBILITY'],
  'router/':      ['ROUTES','CRITICAL_FLOWS'],
  ...
}
```

Always-run phases regardless of diff:
```
ALWAYS_RUN = ['SMOKE', 'RENDER', 'CONSOLE']
```

Returns a deduplicated list of phase names — CI only runs what's needed.

## Integration Summary

```
ADV-06 Browser QA Engine
       │
       ├── observabilityBridge.js ──→ ADV-01 (event stream)
       ├── cicdBridge.js ──────────→ ADV-02 (YAML + job selection)
       ├── postDeployQABridge.js ──→ ADV-04 (deploy gates)
       └── smartE2ESelector.js ────→ ADV-05 (phase selection by diff)
```
