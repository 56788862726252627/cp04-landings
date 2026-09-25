# Agency Recovery Testing — ADV-18

## Core Policy

> A backup is NOT considered good just by existing. It must be:
> 1. `integrityValidated: true`
> 2. `dryRunValidated: true`

`RestoreTestPolicy.evaluate()` returns `{ trusted: false }` if either condition fails.

## Recovery Drill

Fixture-based drills simulate restores without touching real data.

```js
const drill = createRecoveryDrill({
  scope:  ['CONFIG', 'BUSINESS_TRUTH'],
  status: 'PLANNED',
  clientId: 'client-a',
});
// Run simulation → set status: 'PASSED' | 'WARNING' | 'FAILED'
```

## Stale Test Detection

If `lastTestedAt` is more than 7 days ago (`maxAgeHours: 168`), the backup is flagged `RESTORE_TEST_STALE`.

If `lastTestedAt` is null → `NEVER_TESTED`.

## Frequency Recommendation

Run integrity + dry-run validation:
- After every backup completion
- Before any production deploy
- Monthly for all client backups
