// Terminal Efficiency Metrics — ADV-05
// Measures and reports efficiency gains.

export const METRIC_CATEGORY = Object.freeze({
  COMMANDS:      'COMMANDS',
  CONFIRMATIONS: 'CONFIRMATIONS',
  VALIDATION:    'VALIDATION',
  BUILD:         'BUILD',
  CACHE:         'CACHE',
  PARALLEL:      'PARALLEL',
});

export function createEfficiencyMetrics(baselineParams = {}) {
  const {
    commandsBefore       = 0,
    confirmationsBefore  = 0,
    validationTimeBefore = 0,
    estimatedWallClockBefore = 0,
  } = baselineParams;

  let commandsAfter       = 0;
  let confirmationsAfter  = 0;
  let validationTimeAfter = 0;
  let cacheHits           = 0;
  let skippedRuns         = 0;
  let parallelizedOps     = 0;
  let actualWallClockAfter = 0;

  function record(category, value = 1) {
    if (category === METRIC_CATEGORY.COMMANDS)       commandsAfter += value;
    if (category === METRIC_CATEGORY.CONFIRMATIONS)  confirmationsAfter += value;
    if (category === METRIC_CATEGORY.VALIDATION)     validationTimeAfter += value;
    if (category === METRIC_CATEGORY.CACHE)          cacheHits += value;
    if (category === METRIC_CATEGORY.PARALLEL)       parallelizedOps += value;
  }

  function recordSkip() { skippedRuns++; }
  function setWallClock(ms) { actualWallClockAfter = ms; }

  function report() {
    const commandReduction    = commandsBefore > 0 ? Math.round((1 - commandsAfter / commandsBefore) * 100) : 0;
    const confirmReduction    = confirmationsBefore > 0 ? Math.round((1 - confirmationsAfter / confirmationsBefore) * 100) : 0;
    const validationReduction = validationTimeBefore > 0 ? Math.round((1 - validationTimeAfter / validationTimeBefore) * 100) : 0;
    const wallClockReduction  = estimatedWallClockBefore > 0 ? Math.round((1 - actualWallClockAfter / estimatedWallClockBefore) * 100) : 0;

    return {
      commandsBefore,       commandsAfter,       commandReductionPercent:    commandReduction,
      confirmationsBefore,  confirmationsAfter,  confirmationReductionPercent: confirmReduction,
      validationTimeBefore, validationTimeAfter, validationTimeReductionPercent: validationReduction,
      estimatedWallClockBefore, actualWallClockAfter, wallClockReductionPercent: wallClockReduction,
      cacheHits, skippedRuns, parallelizedOps,
      meetsCommandTarget:     commandReduction >= 50,
      meetsConfirmTarget:     confirmReduction >= 90,
      meetsSpeedupTarget:     wallClockReduction >= 15,
      isReal: false,
    };
  }

  return Object.freeze({ record, recordSkip, setWallClock, report });
}

export const TERMINAL_EFFICIENCY_METRICS_VERSION = '1.0.0';
