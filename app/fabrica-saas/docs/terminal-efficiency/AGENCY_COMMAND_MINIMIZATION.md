# Agency Command Minimization — ADV-05

## Batching strategy
1. READ_BATCH — parallel: status + diff + log + file reads
2. VALIDATION_BATCH — fail-fast: tests → lint → build
3. GIT_WRITE_BATCH — sequential: add → commit → push
4. HUMAN_BATCH — pause and wait

## Anti-patterns eliminated
- Separate git status before and after every action
- Running full suite 5 times per improvement
- Building after docs-only changes
- Asking confirmation for already-authorized actions
- Re-reading files already in context
