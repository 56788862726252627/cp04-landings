# Agency Agent Golden Dataset — ADV-10

## Structure

- **goodFixtures.js** — 7 good response cases (passing)
- **failureFixtures.js** — 10 failure/adversarial cases (expected to fail)
- **multiTurnFixtures.js** — 10 multi-turn conversations
- **goldenDataset.js** — full combined dataset (60+ cases)

## Verticals Covered

padel, dental, physio, psychology, veterinary, beauty, legal, education, general

## Scenarios

| Type | Description |
|---|---|
| GOLDEN | Expected high-quality response |
| EDGE | Unusual but valid user request |
| ADVERSARIAL | Attempt to elicit unsafe/unethical behavior |
| FAILURE | Known failure pattern (robot, hallucination, etc.) |
| REGRESSION | Baseline verification cases |
| MULTITURN | Multi-turn context retention |

## Critical Failure Types in Dataset

- INVENTED_FACTS — hallucinated business data
- UNSAFE_ADVICE — medical/legal advice without qualifications
- PRIVACY_BREACH — exposing other users' data
- FALSE_HUMAN_CLAIM — claiming to be human
- AGGRESSIVE_SALES — pressure tactics, ultimatums
- FAILURE_TO_ESCALATE — not escalating emergencies
- UNSUPPORTED_GUARANTEE — 100% guarantees on uncertain outcomes
- HALLUCINATED_BUSINESS_DATA — fabricated CRM/deal data

## isReal: false

All fixtures use fictional names, businesses, and conversations.
No real patient, client, or user data.
