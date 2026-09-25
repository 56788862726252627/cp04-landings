# Agency Privacy — ADV-19

> **DISCLAIMER:** Technical readiness documentation. Not legal certification. Consult legal counsel for compliance obligations.

## Privacy by Design Principles

1. **Purpose Limitation** — `DataPurposePolicy`: data declared with specific purpose; no silent reuse
2. **Data Minimization** — `DataMinimizationPolicy`: required/optional/context field classification
3. **Retention** — `PrivacyRetentionPolicy`: SESSION/SHORT/STANDARD/EXTENDED/LEGAL_HOLD
4. **Deletion** — `DataDeletionPlan`: DRY_RUN only in ADV-19; DELETE/ANONYMIZE/PSEUDONYMIZE
5. **Anonymization** — `AnonymizationPolicy`: direct + quasi-identifier classification
6. **Pseudonymization** — `PseudonymizationPolicy`: identifier separated from operational data, no key material stored

## Data Classification

6 classes: PUBLIC → INTERNAL → CONFIDENTIAL → PERSONAL → SENSITIVE → RESTRICTED

Auto-classifier detects: credentials, health data, payment data, PII, CRM, conversation, AI.

## PII Inventory

10 PII types tracked: IDENTITY, CONTACT, BUSINESS_DATA, CRM_DATA, LEAD_DATA, CONVERSATION_DATA, VOICE_METADATA, MEDIA_METADATA, ANALYTICS, CREDENTIALS_REF.

Each entry declares: purpose, source, storage, processor, retention, legal basis foundation, deletion method, access roles.

## Quality Targets

```
PRIVACY_QUALITY >= 95
DATA_MINIMIZATION = COMPLIANT
RETENTION = DEFINED
DELETION = DRY_RUN_ONLY
```
