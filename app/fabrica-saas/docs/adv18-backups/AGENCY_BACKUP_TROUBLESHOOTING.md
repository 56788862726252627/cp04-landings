# Agency Backup Troubleshooting — ADV-18

## Common Blocked States

### SECRET_INCLUDED
**Cause:** Backup contains a file with a secret pattern (`.env`, `api-key`, etc.)  
**Fix:** Remove the secret path from backup scope. Never include secrets.

### CHECKSUM_MISMATCH
**Cause:** Backup was modified after creation, or checksum was computed incorrectly.  
**Fix:** Re-run backup. If persists, investigate storage integrity.

### CLIENT_MISMATCH
**Cause:** Restore attempt targets a backup from a different client.  
**Fix:** Verify `clientId` matches. Cross-client restore is forbidden.

### MISSING_REQUIRED_ITEM
**Cause:** A required backup item is missing or not restorable.  
**Fix:** Re-run backup ensuring all required scopes are included.

### CORRUPTION_DETECTED
**Cause:** `manifest.corrupted === true` or integrity check failed.  
**Fix:** Discard backup. Restore from next available valid backup.

### RESTORE_TEST_STALE
**Cause:** Last restore test was more than 7 days ago.  
**Fix:** Run `simulateRestore()` + integrity check to refresh.

## Expiry Issues

If backup state is `EXPIRED`: Create a new backup. Do not attempt to restore expired backups.

## Human Approval Pending

If `status: PENDING` on a human approval request: wait for authorized human to approve. System cannot auto-approve real restore/delete operations.
