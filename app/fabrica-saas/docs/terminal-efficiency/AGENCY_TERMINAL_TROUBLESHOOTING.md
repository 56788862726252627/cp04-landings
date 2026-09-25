# Agency Terminal Troubleshooting — ADV-05

## Test fails — deterministic
Fix the code. Do NOT retry without change. Do NOT skip.

## Network error during push (TRANSIENT)
Retry once after 1s. If it fails again, report and stop.

## Out-of-scope write blocked
Confirm the file is correct. Never force-write to protected paths.

## Stale checkpoint after new commit
Invalidate checkpoint. Re-run from TARGETED_TESTS.

## Cache returns wrong result
Check headSha match. Invalidate the cache key. Rerun.

## Human gate triggered unexpectedly
Verify the action category. If it's truly HUMAN_REQUIRED, stop and inform user.
Do NOT auto-approve OAuth, billing, or destructive actions.
