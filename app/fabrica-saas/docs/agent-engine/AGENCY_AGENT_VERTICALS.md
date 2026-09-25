# Agent Verticals — ADV-03

## 12 Verticals + DEFAULT

| Vertical | Risk | Tone | Key restriction |
|----------|------|------|-----------------|
| dental | MEDIUM | WARM_PROFESSIONAL | No diagnosis, no medication |
| physio | MEDIUM | CALM | No diagnosis, no prescription |
| psychology | HIGH | CALM | No therapy, no diagnosis, crisis escalation |
| speech_therapy | MEDIUM | FRIENDLY | No diagnosis |
| sports | LOW | FRIENDLY | No injury diagnosis |
| padel | LOW | FRIENDLY | None |
| veterinary | MEDIUM | WARM_PROFESSIONAL | No diagnosis, no dosages |
| hairdresser | LOW | FRIENDLY | None |
| beauty | LOW | PREMIUM | None |
| legal | HIGH | TRUSTWORTHY | No legal advice, no opinions |
| fertility | HIGH | CALM | No diagnosis, no prognosis |
| education | LOW | FRIENDLY | No official certifications |
| DEFAULT | LOW | WARM_PROFESSIONAL | None |

## Config Hierarchy

```
CORE_CONFIG (agentGenerator)
    ↓
VERTICAL_CONFIG (verticalAdapters)
    ↓
CLIENT_CONFIG (clientOverrides)
```

Each layer only overrides fields it explicitly sets.
No layer can contaminate another client's config.

## Allowed Override Fields

`BRAND_TONE`, `BUSINESS_NAME`, `SERVICES`, `OPENING_HOURS`, `LOCATION`,
`PRICING_POLICY`, `SALES_STYLE`, `FORBIDDEN_CLAIMS`, `HUMAN_CONTACT`, `BOOKING_POLICY`
