# Agency Safe Autonomy — ADV-05

## What auto-runs (SAFE_AUTO)
- git status / diff / log / branch
- node --test, npm run lint, npm run build
- npx eslint, find, grep, rg, ls, cat, pwd

## What needs scope confirmation (SAFE_WITH_SCOPE)
- git add <explicit files>
- git commit
- git push to feature/factory-* only
- gh pr create / view / edit

## What ALWAYS requires a human
- OAuth / MFA setup
- New secrets / credentials
- Billing / payment actions
- DNS / domain changes
- Real production deploy
- Outbound communications
- Meta / advertising spend

## What is BLOCKED regardless
- git reset --hard
- git clean -fd
- force push
- rm -rf
- DROP TABLE / TRUNCATE
- Printing secrets to stdout
