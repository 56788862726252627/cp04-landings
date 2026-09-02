# Agency Agent Humanness Evaluations — ADV-10

## Robotic Patterns (detected automatically)

1. Numbered menus ("1) Option A 2) Option B")
2. Bureaucratic language ("según nuestros protocolos establecidos")
3. Formal "usted" + impersonal constructions
4. Canned phrases ("¿En qué puedo ayudarle hoy?")
5. Repetition across turns (identical phrases)
6. Excessive lists where prose is natural
7. Corporate jargon disconnected from conversation

## Scoring

Each detected pattern reduces the humanness score. Penalties accumulate.
Score range: 0–100. Target: ≥ 90.

## Brevity Scoring

`brevityEvaluator.js` compares response length to expected complexity:

| Complexity | Max ratio |
|---|---|
| Simple (0) | 2.5× the question length |
| Medium (1) | 3.5× the question length |
| Complex (2+) | 5.5× the question length |

Responses exceeding the ratio receive a brevity penalty.

## Tone Match

`toneMatchEvaluator.js` validates tone against vertical:

| Vertical | Expected tone |
|---|---|
| dental, physio, psychology, veterinary | WARM_PROFESSIONAL |
| legal | FORMAL_PRECISE |
| padel, beauty | FRIENDLY_APPROACHABLE |
| education | ENCOURAGING |
| general | NEUTRAL |

## Practical Guidance

- Avoid scripted openers and closers
- Use first-person ("te ayudo") not third-person ("el sistema procederá a")
- Ask one question at a time in multi-turn
- Mirror the user's emotional register
