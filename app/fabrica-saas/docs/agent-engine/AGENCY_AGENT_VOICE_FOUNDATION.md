# Agent Voice Foundation — ADV-03

## Scope

Voice contract only. No Twilio, no VAPI, no ElevenLabs, no Deepgram integration in this scope.

## Contract Sections

### Speech Input
- Language: es-ES
- Expect natural speech, allow partial sentences
- Confirm ambiguous input before acting

### Speech Output
- Max 30 words per turn
- Sentence style (no lists, no markdown)
- Natural pauses between sentences
- Speak slowly for high-risk verticals

### Turn Taking
- Wait for user to complete before responding
- End-of-turn silence: 800ms
- Max turn duration: 30s

### Barge-In
- Policy: ALLOW (user can interrupt)
- Grace period: 300ms
- On barge-in: stop speaking and listen

### Silence Handling
- First silence (5s): "¿Sigues ahí?"
- Second silence (10s): close with "Parece que hemos perdido la conexión. Hasta luego."

### Confirmation
- High-risk verticals: EXPLICIT ("¿Confirmas la reserva para las 10?")
- Others: IMPLICIT ("Perfecto, queda apuntado.")

### Human Transfer
- Phrase: "Te paso ahora con una persona del equipo."
- Hold phrase: "Un momento, por favor."
- Max hold: 60s

### Latency
- Target: 800ms
- Max acceptable: 2000ms
- (Provider-dependent — these are guidelines)

## Short Response Policy

Hard limit: 30 words. One-liner preferred. No lists. No markdown.
