# Agency Fast vs Final Validation — ADV-05

## FAST mode (during development)
- Targeted tests for affected modules
- Lint on changed directories only
- No full build unless UI/bundle changed
- Used for: iteration, quick fixes, lint corrections

## FINAL mode (before commit/PR)
- Full test suite (all *.test.mjs)
- Lint 0 errors on full scope
- Build
- Secret scan
- Quality gate pass

## Rule
FAST mode NEVER replaces FINAL mode before merge.
