# Change Requests

## Types and Impact
| Type | Approval | Setup (EUR) | Monthly (EUR) | Timeline |
|------|----------|-------------|---------------|----------|
| BUG | No | 0 | 0 | 0-5 days |
| MINOR | No | 0-200 | 0 | 0-3 days |
| ADDON | Yes | 200-2000 | 0-150 | 3-14 days |
| SCOPE_CHANGE | Yes | 500-5000 | 0-200 | 7-30 days |
| URGENT | Yes | 300-1500 | 0 | 1-5 days |
| NEW_REQUIREMENT | Yes | 500-10000 | 0-500 | 14-60 days |

## Automatic Upgrade Trigger
SCOPE_CHANGE or NEW_REQUIREMENT on ESSENTIAL tier automatically flags PRO upgrade required.

## Key Policies
- **BUG**: Covered in support window and maintenance plan. setupImpact = [0,0].
- **SCOPE_CHANGE**: Always requires new estimate.
- **NEW_REQUIREMENT**: Never covered by support — requires new development contract.
- Support window covers: BUG, CONFIGURATION, TRAINING_QUESTION only.
