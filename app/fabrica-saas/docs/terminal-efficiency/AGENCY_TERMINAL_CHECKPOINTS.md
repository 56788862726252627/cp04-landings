# Agency Terminal Checkpoints — ADV-05

## 9 checkpoints
1. AUDIT_DONE
2. IMPLEMENTATION_DONE
3. TARGETED_TESTS_PASS
4. FULL_TESTS_PASS
5. LINT_PASS
6. BUILD_PASS
7. PR_CREATED
8. CI_PASS
9. MERGED

## Resume rule
- Detect last checkpoint reached
- Verify headSha matches (stale check)
- Continue from that point
- Never restart from zero if checkpoint is valid
