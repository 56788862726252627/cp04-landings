/**
 * CORE · mockData
 * Funciones base para generar datos ficticios.
 * Reutilizable en todos los verticales. No genera datos reales ni contacta servicios externos.
 */

export function pickRandom(arr) {
  return arr[Math.floor(Math.random() * arr.length)];
}

export function formatDateEs(d) {
  return d.toLocaleDateString('es-ES', { weekday: 'short', day: '2-digit', month: 'short' });
}

export function formatTime(h, m = 0) {
  return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`;
}

export function generateFutureSlots(count = 3, startHour = 10, sedeNombre = 'Sede Centro') {
  const slots = [];
  const today = new Date();
  for (let i = 0; i < count; i++) {
    const d = new Date(today);
    d.setDate(d.getDate() + i + 1);
    const hour = startHour + (i % 3) * 2;
    slots.push({
      id: `slot_${i + 1}`,
      fecha: formatDateEs(d),
      hora: formatTime(hour),
      sede: sedeNombre,
      disponible: true,
    });
  }
  return slots;
}

export function isInsideWorkingHours(hour, sede) {
  const h = sede?.horario_inicio ?? 9;
  const end = sede?.horario_fin ?? 20;
  return hour >= h && hour < end;
}
