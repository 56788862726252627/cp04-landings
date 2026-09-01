// Speedup Calculator — ADV-05
// Computes actual speedup from fixture measurements. Does not invent numbers.

export const SPEEDUP_GRADE = Object.freeze({
  A: 'A', // >= 30% speedup
  B: 'B', // >= 22%
  C: 'C', // >= 15%
  D: 'D', // < 15%
});

export function calculateTerminalSpeedup(params = {}) {
  const {
    legacyCommands    = 0,
    optimizedCommands = 0,
    legacyConfirmations    = 0,
    optimizedConfirmations = 0,
    legacyValidationMinutes    = 0,
    optimizedValidationMinutes = 0,
    legacyWallClockMinutes     = 0,
    optimizedWallClockMinutes  = 0,
  } = params;

  if (legacyCommands === 0 && legacyWallClockMinutes === 0) {
    return { valid: false, error: 'baseline measurements required — cannot compute speedup from zero', isReal: false };
  }

  function pct(before, after) {
    if (before === 0) return 0;
    return Math.round((1 - after / before) * 100);
  }

  const commandReductionPercent      = pct(legacyCommands, optimizedCommands);
  const confirmationReductionPercent = pct(legacyConfirmations, optimizedConfirmations);
  const validationReductionPercent   = pct(legacyValidationMinutes, optimizedValidationMinutes);
  const wallClockReductionPercent    = pct(legacyWallClockMinutes, optimizedWallClockMinutes);

  const weightedSpeedup = Math.round(
    commandReductionPercent * 0.35
    + confirmationReductionPercent * 0.25
    + validationReductionPercent * 0.25
    + wallClockReductionPercent * 0.15
  );

  const grade = weightedSpeedup >= 30 ? SPEEDUP_GRADE.A
    : weightedSpeedup >= 22 ? SPEEDUP_GRADE.B
    : weightedSpeedup >= 15 ? SPEEDUP_GRADE.C : SPEEDUP_GRADE.D;

  return {
    valid: true,
    commandReductionPercent,
    confirmationReductionPercent,
    validationReductionPercent,
    wallClockReductionPercent,
    totalEstimatedSpeedupPercent: weightedSpeedup,
    grade,
    meetsTarget: weightedSpeedup >= 15,
    isReal: false,
  };
}

export const SPEEDUP_CALCULATOR_VERSION = '1.0.0';
