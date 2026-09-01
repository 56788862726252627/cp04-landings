# Agent Communication — ADV-03

## Channel Profiles

| Channel | Max words | Markdown | Notes |
|---------|-----------|----------|-------|
| WEB_CHAT | 120 | Yes | Default |
| WHATSAPP | 60 | No | Plain text only |
| EMAIL | 300 | Yes | Full formatting |
| SOCIAL_DM | 50 | No | Very brief |
| VOICE | 30 | No | Spoken sentences only |

## Response Length Engine

`responseLengthEngine.js` resolves length from:
- Channel (VOICE → always SHORT)
- Intent (clarification needed → SHORT)
- User message length (≤5 words + SIMPLE → VERY_SHORT)
- Conversation stage

## Human Profile

`humanProfile.js` detects robotic phrases and over-length responses:
- Blacklist of 10 phrases ("Por supuesto, aquí tienes", etc.)
- Max 400 words check
- Max 2 exclamation marks

## Anti-Paragraph Gate

`antiParagraphGate.js` flags:
- Word count exceeding channel limit
- Too many paragraphs for channel
- Repeated CTA (≥2 times)
- Markdown lists in VOICE/WHATSAPP
- Repeated sentences

## Tone Engine

`toneEngine.js` resolves tone from:
- Vertical (dental → WARM_PROFESSIONAL, psychology → CALM, legal → TRUSTWORTHY)
- Agent type (SALES → CONSULTATIVE, SUPPORT → CALM)
- Context (negative emotion → EMPATHETIC, premium client → PREMIUM)
