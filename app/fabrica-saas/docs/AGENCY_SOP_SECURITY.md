# Security SOP

## Data Classification
| Level | Examples |
|-------|---------|
| RESTRICTED | health, medical, financial, payment, password, token, secret, credential |
| CONFIDENTIAL | email, phone, address, name, personal, PII |
| INTERNAL | config, setting, admin |
| PUBLIC | hero text, public content |

## Credential Policy
- Agency does NOT store client production credentials
- Client owns all production credentials
- Rotation policy required
- Access review schedule required

## Mandatory Gates
- no_secrets_in_code
- least_privilege_applied
- demo_data_clean
- credential_plan_valid

## Incident Trigger
- RESTRICTED data found → HUMAN_REVIEW before production
- Secrets in code → immediate BLOCKED
