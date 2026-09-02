// Social Seasonality Engine — maps months to seasonal content opportunities

export const SEASON = Object.freeze({
  PRIMAVERA: 'PRIMAVERA', // March–May
  VERANO:    'VERANO',    // June–August
  OTONO:     'OTONO',     // September–November
  INVIERNO:  'INVIERNO',  // December–February
});

const MONTH_SEASON = Object.freeze({
  1: SEASON.INVIERNO, 2: SEASON.INVIERNO, 3: SEASON.PRIMAVERA,
  4: SEASON.PRIMAVERA, 5: SEASON.PRIMAVERA, 6: SEASON.VERANO,
  7: SEASON.VERANO,    8: SEASON.VERANO,    9: SEASON.OTONO,
  10: SEASON.OTONO,   11: SEASON.OTONO,    12: SEASON.INVIERNO,
});

const SEASONAL_THEMES = Object.freeze({
  PRIMAVERA: Object.freeze(['vuelta a la actividad', 'energía renovada', 'torneos de primavera', 'salud y bienestar']),
  VERANO:    Object.freeze(['vacaciones activas', 'intensivos de verano', 'hydratación y salud', 'campus deportivo']),
  OTONO:     Object.freeze(['vuelta a la rutina', 'inscripciones nuevos alumnos', 'temporada indoor', 'retos otoñales']),
  INVIERNO:  Object.freeze(['promociones navideñas', 'propósitos de año nuevo', 'bonos regalo', 'campeonatos invernales']),
});

const LOCAL_HOLIDAYS_ES = Object.freeze({
  1:  ['Año Nuevo', 'Reyes Magos'],
  2:  ['Carnaval'],
  3:  ['Día del Padre'],
  4:  ['Semana Santa', 'Día del Libro'],
  5:  ['Día de la Madre', 'Día del Trabajador'],
  6:  ['San Juan'],
  7:  ['Verano'],
  8:  ['Agosto — baja actividad'],
  9:  ['Vuelta al cole', 'Fiestas patronales'],
  10: ['Día de la Hispanidad'],
  11: ['Todos los Santos'],
  12: ['Navidad', 'Noche Buena', 'Fin de Año'],
});

export function getSeasonForMonth(month) {
  if (!MONTH_SEASON[month]) throw new Error(`Invalid month: ${month}`);
  return MONTH_SEASON[month];
}

export function getSeasonalContext(month) {
  if (!MONTH_SEASON[month]) throw new Error(`Invalid month: ${month}`);
  const season  = MONTH_SEASON[month];
  const themes  = SEASONAL_THEMES[season];
  const holidays = LOCAL_HOLIDAYS_ES[month] ?? [];
  return Object.freeze({ month, season, themes, holidays, isReal: false });
}

export function generateSeasonalContentAngle(month, sector = 'default') {
  const ctx = getSeasonalContext(month);
  const sectorBoost = sector === 'padel' && ctx.season === SEASON.VERANO
    ? 'torneo verano intensivo' : null;
  return Object.freeze({
    month,
    season:        ctx.season,
    primaryTheme:  ctx.themes[0],
    holidays:      ctx.holidays,
    sectorAngle:   sectorBoost,
    isReal:        false,
  });
}
