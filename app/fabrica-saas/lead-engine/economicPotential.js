// Economic Potential — ADV-08

export const ECONOMIC_POTENTIAL_LEVEL = Object.freeze({
  VERY_HIGH: 'VERY_HIGH',
  HIGH:      'HIGH',
  MEDIUM:    'MEDIUM',
  LOW:       'LOW',
});

const TICKET_RANGES = Object.freeze({
  VERY_HIGH: { min: 5000,  max: 20000 },
  HIGH:      { min: 2000,  max: 7000  },
  MEDIUM:    { min: 800,   max: 2500  },
  LOW:       { min: 200,   max: 1000  },
});

export function estimateEconomicPotential(lead = {}) {
  const valueScore = lead.valueScore ?? 0;
  const fitScore   = lead.fitScore   ?? 0;

  const composite = valueScore * 0.6 + fitScore * 0.4;

  const level = composite >= 70 ? ECONOMIC_POTENTIAL_LEVEL.VERY_HIGH
    : composite >= 50 ? ECONOMIC_POTENTIAL_LEVEL.HIGH
    : composite >= 30 ? ECONOMIC_POTENTIAL_LEVEL.MEDIUM
    : ECONOMIC_POTENTIAL_LEVEL.LOW;

  const ticketRange = TICKET_RANGES[level];

  return Object.freeze({
    level,
    ticketRange,
    composite:  Math.round(composite),
    disclaimer: 'Illustrative estimate only — not a price commitment.',
    isReal: false,
  });
}

export const ECONOMIC_POTENTIAL_VERSION = '1.0.0';
