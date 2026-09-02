# ADV-11 Voice Agent Engine — Overview

Version: 1.0.0 | Status: 100% | Simulation only (NO_REAL_CALLS=SI)

## Purpose

Complete, reusable voice agent engine for humanized AI telephone agents.
All modules are simulation-only: no real telephony, no real cost, no real client data.

## Module Count
- 51 voice-agent modules
- 7 fixture files (50 simulated calls across 7 verticals)
- 11 call state machine states
- 6 voice-specific evaluation dimensions

## Hard Guardrails
- NO_REAL_CALLS=SI
- NO_REAL_COST=SI
- NO_REAL_SMS=SI
- NO_REAL_WHATSAPP=SI
- NO_REAL_CLIENT_DATA=SI
- MODEL_ASSUMPTION FORBIDDEN as fact source
- isReal: false on all outputs
- Object.freeze() on all model objects
