# AI Routing Policy — ADV-16

## Selection Factors

Routing weighs: capability match, quality, cost appropriateness, latency, privacy, provider health, client policy, task risk.

**Never selects exclusively by price.**

## Quality Floor

- CRITICAL tasks: must use PREMIUM or HIGH quality model
- HIGH risk: `highRiskPolicy.evaluate()` must return `safe: true`

## Client Policy

- Each client has an isolated `AIClientRoutingProfile`
- Client A config cannot affect Client B requests (`assertClientBoundary()`)

## Vertical Presets

| Vertical | Mode | Quality |
|----------|------|---------|
| PADEL | BALANCED | STANDARD |
| CLINIC | QUALITY_FIRST | HIGH |
| LEGAL | QUALITY_FIRST | CRITICAL |
| BEAUTY | BALANCED | STANDARD |
| VETERINARY | BALANCED | STANDARD |
| EDUCATION | QUALITY_FIRST | HIGH |
| GENERIC | BALANCED | STANDARD |
