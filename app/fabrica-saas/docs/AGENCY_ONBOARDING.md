# Onboarding Schema

## Required Fields
businessName, businessType, contactRole, sector, location, mainProblems, businessGoals

## Optional Fields (improve qualification)
budgetRange, desiredTimeline, decisionMaker, currentTools, teamSize, legalConstraints, integrationNeeds

## Field Status
- PROVIDED — explicitly provided by client
- INFERRED/DEFAULTED — system inferred from another field
- MISSING_REQUIRED — blocks progression

## Sector Inference
If `sector` is missing, system infers from `businessType` (veterinary, dental, fisio, legal, educacion, etc.)

## Usage
```js
import { validateOnboarding } from './lifecycle/onboardingSchema.js';
const result = validateOnboarding(rawData);
// result.valid, result.data, result.fieldStatus, result.missingRequired, result.warnings
```
