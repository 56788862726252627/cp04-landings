# Handoff Process

## Components
- **technicalHandoff** — repo notes, hosting, DB ownership, automation ownership, credential policy
- **clientHandoff** — delivery manifest reference, data ownership, maintenance plan selection
- **trainingChecklist** (7 items) — admin panel demo, booking, CRM, notifications, Make dashboard, Q&A
- **acceptanceChecklist** (6 items) — panel reviewed, booking confirmed, notifications verified, limitations accepted, support plan explained, credentials managed
- **pendingClientActions** — confirm domain, activate third-party accounts, provide content, designate technical contact
- **supportContact** — email channel, response time per plan

## Completion Logic
```js
const done = completeHandoff({ ...handoff,
  acceptanceChecklist: handoff.acceptanceChecklist.map(c => ({ ...c, done: true })),
  trainingChecklist: handoff.trainingChecklist.map(c => ({ ...c, done: true }))
});
// done.handoffComplete === true, done.completedAt set
```

## Policy
"NINGUNA credencial de produccion se almacena en sistemas de la agencia."
