# Agency CRM Privacy Policy — ADV-09

## Data Categories

| Category | Legal Basis | Retention |
|----------|-------------|-----------|
| BUSINESS_PUBLIC | Legitimate Interest | 1095 days |
| CONTACT_BUSINESS | Legitimate Interest | 730 days |
| DEAL_COMMERCIAL | Contract | 2555 days |
| ACTIVITY_LOG | Legitimate Interest | 365 days |
| INTERNAL_NOTES | Legitimate Interest | 365 days |

## Key Principles

- **No sensitive personal data**: Only public B2B contact info
- **PII minimization**: `observabilityBridge` strips all contact fields before emitting events
- **Purpose limitation**: B2B commercial prospecting and client management only
- **Data subject rights**: Access, rectification, erasure, portability
- **No international transfers** (default)
- **Retention enforcement**: `evaluateRetentionEligibility()` flags expired records for purge

## Disclaimer

This module provides a policy scaffold. Legal review required before production use.
