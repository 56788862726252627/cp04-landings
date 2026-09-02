# Agency CRM Troubleshooting — ADV-09

## Common Issues

### "isReal is not false"
All CRM model factories must return `isReal: false`. Never omit it. If a function returns an object without `isReal: false`, it is missing the guard.

### Stage transition returns `allowed: false`
Check `ALLOWED_FORWARD` in `stageTransitionPolicy.js`. Not all forward transitions are allowed — some require passing through intermediate stages.

### Qualification score is 0
Ensure `createQualificationProfile()` receives boolean flags (not strings). `budgetConfirmed: true`, not `budgetConfirmed: 'yes'`.

### Forecast shows $0 weighted value
`pipelineForecast` uses `opportunity.dealValueEstimate.acvCentral` and `opportunity.dealValueEstimate.probability`. Ensure these are set on the opportunity before building the forecast.

### Tasks not showing OVERDUE
`getTaskStatusCurrent()` compares `dueAt` (ISO string) against `Date.now()`. Ensure `dueAt` is a valid ISO date string.

### Import errors from barrel `index.js`
The barrel re-exports all modules. If a symbol name conflicts between two modules, use direct imports from the module file instead.
