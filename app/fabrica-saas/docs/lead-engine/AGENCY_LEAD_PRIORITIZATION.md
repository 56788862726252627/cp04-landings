# Lead Prioritization — ADV-08

## Sort Order

`prioritizeLeads(leads, filters?)` sorts by:
1. `opportunityScore` DESC (primary)
2. `confidence` DESC (tiebreaker)
3. `dataQualityScore` DESC (secondary tiebreaker)

## Available Filters

| Filter | Type | Example |
|---|---|---|
| `vertical` | string | `'dental'` |
| `location` | string | `'Málaga'` |
| `service` | string | `'BOOKING'` |
| `temperature` | enum | `'HOT'` |
| `minScore` | number | `60` |
| `minDataQuality` | number | `40` |

## Output Shape

```js
{
  ranked: [...],   // all leads sorted
  hot:    [...],   // temperature === 'HOT'
  warm:   [...],   // temperature === 'WARM'
  cold:   [...],   // temperature === 'COLD'
  nurture:[...],   // temperature === 'NURTURE'
  total:  N,
  isReal: false,
}
```

## Segmentation (6 segments)

`segmentLeads(leads)` assigns each lead to exactly one segment:

| Segment | Criteria (simplified) |
|---|---|
| `HIGH_PRIORITY` | score≥75 AND quality≥60 |
| `FAST_WIN` | score≥60 AND ease≥55 AND temp HOT/WARM |
| `HIGH_VALUE_LONGER_CYCLE` | value≥60 AND fit≥50 AND score≥55 |
| `NURTURE` | score<60 OR temp NURTURE |
| `RESEARCH_REQUIRED` | quality<35 |
| `LOW_PRIORITY` | everything else |

Segments are evaluated in order; the first match wins.

## Fast Win Detection

`detectFastWins(leads)` applies stricter criteria for quick-close opportunities:
- `opportunityScore ≥ 60`
- `easeScore ≥ 55`
- `fitScore ≥ 55`
- `dataQualityScore ≥ 40`
- Has contact (email or phone)
- Has a recommended service
- Temperature: HOT or WARM

## High Value Detection

`detectHighValueOpportunities(leads)` finds high-revenue potential leads:
- `valueScore ≥ 60`
- `fitScore ≥ 50`
- `opportunityScore ≥ 55`
- `dataQualityScore ≥ 35`

Sorted by composite: `value*0.5 + fit*0.3 + score*0.2`.

## Next Best Action

`recommendNextBestAction(lead)` returns one of:

| Action | Triggers when |
|---|---|
| `RESEARCH_MORE` | dataQuality < 35 |
| `QUALIFY` | quality OK, WARM temperature |
| `PREPARE_OUTREACH` | quality OK, HOT temperature |
| `NURTURE` | NURTURE temperature |
| `DEFER` | COLD temperature |
| `IGNORE` | very low score + very low quality |
| `MANUAL_REVIEW` | confidence < 40 |

**Note:** "NO real outreach will be triggered — recommendation only."
