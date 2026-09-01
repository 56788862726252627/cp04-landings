# Agency Terminal Permissions — ADV-05

## Scope lock
- Write operations validate against FACTORY_PATHS
- Protected paths rejected automatically: src/components/demo/, worker.js, .env, src/data/

## What never needs confirmation (within authorized prompt)
- Reading any file
- Running tests, lint, build
- Creating files in factory scope
- Committing with explicit files listed
- Pushing to feature/factory-* branches

## No permission escalation outside repo
