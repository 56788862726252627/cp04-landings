# ADV-11 Identity Honesty & Safety

## HonestIdentityPolicy
CRITICAL RULE: Agent MUST NEVER claim to be human when sincerely asked.

- 6 regex patterns to detect identity questions
- 3 pre-approved honest responses
- isFalseHumanClaim() blocks any attempt to claim HUMAN status

## VoiceSafetyPolicy
Blocked categories:
- SECRET_EXPOSURE (API keys, tokens, passwords)
- PAYMENT_EXECUTION
- FALSE_HUMAN_CLAIM
- PROHIBITED_DISCLOSURE
- CROSS_CLIENT_DATA_LEAK
- OUTBOUND_REAL_ACTION

## VoicePrivacyPolicy
- minimum data only
- no health/payment storage
- SESSION_ONLY retention by default
- client isolation enforced
