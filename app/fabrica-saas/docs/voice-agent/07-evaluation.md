# ADV-11 Voice Evaluation

## VoiceEvaluationDimensions (extends ADV-10)
6 new dimensions (total weight = 100):
- VOICE_NATURALNESS: 20
- TURN_TAKING: 15
- INTERRUPTION_HANDLING: 15
- ORAL_BREVITY: 15
- VOICE_BUSINESS_FIT: 15
- CALL_RESOLUTION: 20

## VoiceHumannessScore
Scoring: starts 100, -15 per anti-pattern violation, -20 if too long
Grades: GOOD (>=80), ACCEPTABLE (>=50), POOR (<50)

## VoiceCallQualityScore
5 dimensions: TASK_COMPLETION(30), ACCURACY(25), NATURALNESS(20), LATENCY(10), SAFETY(15)
Overall = weighted average → GOOD/ACCEPTABLE/POOR

## Simulated Call Dataset
50 calls across 7 verticals: PADEL_CLUB, DENTAL_CLINIC, GYM, PHYSIO, EDUCATION, MULTI
