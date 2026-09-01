# Agency Terminal Efficiency — ADV-05

## Purpose
Reduce manual commands, confirmations, and idle time by ≥ 50 / 90 / 15% respectively.
Speed gains never compromise security, coverage, or rollback.

## Core Principle
> Fast mode during development. Full mode before merge. Human gate for anything destructive.

## Modules
| Module | Role |
|---|---|
| safeCommandPolicy | Classifies every command SAFE_AUTO / SAFE_WITH_SCOPE / HUMAN_REQUIRED / BLOCKED |
| commandBatcher | Groups safe commands into minimal round-trip batches |
| validationPlanner | Selects FAST vs FULL validation based on change impact |
| changeImpactAnalyzer | Classifies file changes LOW→CRITICAL |
| validationResultCache | Memoizes non-sensitive results (5min TTL) |
| terminalCheckpoint | 9-point resume tracker |
| terminalWorkflowRunner | End-to-end orchestrator |
| speedupCalculator | Reports actual speedup — never invented |

## Targets
- COMMAND_REDUCTION ≥ 50%
- CONFIRMATION_REDUCTION ≥ 90%
- WALL_CLOCK_SPEEDUP ≥ 15% (target ~22%)
