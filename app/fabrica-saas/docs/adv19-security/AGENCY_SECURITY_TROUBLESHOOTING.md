# Agency Security Troubleshooting — ADV-19

## Security Gate BLOCKED

**SECRET_LEAK** → Remove plaintext secrets from code/logs/prompts. Use secret references only.

**CROSS_CLIENT_ACCESS** → Ensure `clientId` is consistently propagated. Check isolation evaluator.

**PRIVILEGE_ESCALATION** → Review role grant logic. No self-grants. No tenant switching.

**CRITICAL_INJECTION_BYPASS** → Check prompt injection patterns. Ensure guardrails not disabled.

**MISSING_AUTH_ON_PROTECTED** → Ensure `authRequired=true` in APISecurityPolicy. Check token validation.

## Privacy Gate BLOCKED

**PURPOSE_VIOLATION** → Check `DataPurposePolicy.checkUse()`. Verify use is in `allowedUses`.

**MARKETING_TRACKER_BEFORE_CONSENT** → Set tracker `activeByDefault=false`. Check `evaluateDefaultConsent()`.

**DSAR_WITHOUT_IDENTITY** → Run `DSARIdentityVerificationPolicy` before processing DSAR. Email alone insufficient.

**CONSENT_BYPASS** → Check `ConsentRecord.status` before using data for non-essential purposes.

## CMP Gate BLOCKED

**NON_ESSENTIAL_DEFAULT_ON** → Set `activeByDefault=false` for PREFERENCES/ANALYTICS/MARKETING.

**UNKNOWN_TRACKER_ACTIVE** → Classify all trackers before activation. UNKNOWN → BLOCKED.

**FORCED_ACCEPT** → Add REJECT action to cookie banner. Equal prominence with ACCEPT.

## GDPR Technical Gate BLOCKED

**NO_DATA_MAPPING** → Create `DSARDataMap` with all data sources.

**NO_RIGHTS_FOUNDATION** → Implement `evaluateRight()` for all 6 right types.

**NO_AUDIT_TRAIL** → Add `createSecurityAuditEntry()` to all security-relevant operations.

## Secret Leak Detected

1. Remove plaintext from source
2. Use `validateSecretReference()` to check references
3. Use `scanForLeaks()` on log outputs
4. Check `PrivacyLoggingPolicy.validateLogEntry()`

All fixes are ADV-19 technical foundations only. No real secret rotation performed.
