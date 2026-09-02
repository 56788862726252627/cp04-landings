# ADV-11 Conversation Flows

## VoiceBookingFlow (SIMULATION_ONLY)
8 steps: COLLECT_DATE → COLLECT_TIME → COLLECT_SERVICE → CHECK_AVAILABILITY → COLLECT_NAME → COLLECT_PHONE → CONFIRM → CONFIRMED

## VoiceBusinessInfoFlow
- Detects: HOURS, LOCATION, SERVICES, PRICES, CONTACT, GENERAL
- All responses grounded on verified facts only
- If no fact: honest "No tengo esa información verificada"

## VoiceSupportFlow
5 steps: UNDERSTAND → CLARIFY → SOLVE → VERIFY → ESCALATE → CLOSE
- Max 2 attempts before escalation to human

## VoiceLeadQualificationFlow
BANT: IDENTIFY_NEED → BUDGET_CHECK → TIMELINE_CHECK → AUTHORITY_CHECK → QUALIFY_RESULT
- Scoring: HOT/WARM/COLD/DISQUALIFIED

## VoiceSalesBehavior
- Consultative only, no high pressure
- Objection types: PRICE, TIME, COMPETITOR, NOT_READY, NEED_MORE_INFO
