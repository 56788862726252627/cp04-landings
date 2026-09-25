# Agent Evaluation Model — ADV-03

## 12 Evaluation Dimensions

| Dimension | Weight | What it measures |
|-----------|--------|-----------------|
| RELEVANCE | 12% | Does the response address the user's intent? |
| CLARITY | 10% | Are sentences clear and appropriately short? |
| BREVITY | 8% | Within channel word limit? |
| NATURALNESS | 10% | Free of robotic phrases? |
| HELPFULNESS | 12% | Does it actually help the user? |
| TRUST | 10% | No overconfident/unverifiable claims? |
| TONE | 8% | Appropriate tone for agent type? |
| GOAL_ALIGNMENT | 10% | Does it move toward the agent's purpose? |
| SALES_QUALITY | 8% | Soft CTA, no pressure? |
| NON_PRESSURE | 6% | No pressure language? |
| SAFETY | 6% | No diagnosis/legal advice in high-risk verticals? |
| NEXT_ACTION | — | Has a clear next step? (not weighted in total) |

## Grade Scale

| Score | Grade | Meaning |
|-------|-------|---------|
| 85–100 | A | Excellent — ready to use |
| 70–84 | B | Good — minor improvements possible |
| 55–69 | C | Acceptable — needs review |
| 40–54 | D | Weak — significant improvements needed |
| 0–39 | F | Fail — do not use |

## Automatic Flags

- `RESPONSE_TOO_LONG` — Word count > channel limit
- `ROBOTIC_PHRASING` — Blacklisted phrase detected
- `PRESSURE_DETECTED` — Pressure language found
- `SAFETY_RISK` — Diagnosis/advice in restricted vertical
- `OVERCONFIDENT_CLAIM` — "Garantizado", "sin duda", etc.

## Anti-Paragraph Gate

`antiParagraphGate.js` runs separately:
- Detects excessive paragraphs for channel
- Detects repeated CTA
- Detects markdown in WHATSAPP/VOICE
- Detects over-explanation

## Humanness QA

`humannessQA.js` detects 8 humanness issues:
ROBOTIC_PHRASING, OVERFORMAL_STYLE, OVERENTHUSIASM,
FAKE_EMPATHY, GENERIC_FILLER, REPEATED_CTA, SALES_PRESSURE, KNOW_IT_ALL_TONE
