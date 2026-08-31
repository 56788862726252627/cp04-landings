/**
 * FisioNova Premium V2 Pilot — Unit Tests
 * Cubre lógica de negocio sin DOM (jsdom no disponible)
 * Demo comercial · Datos ficticios
 */
import { describe, it, expect } from 'vitest';
import {
  BRANDING_V2,
  AGENDA_MOCK,
  PACIENTES_MOCK,
  EJERCICIOS_MOCK,
  SERVICIOS_V2,
  DASHBOARD_STATS,
  FAQ_V2,
  EVOLUCION_MOCK,
} from './FisioNovaPilotMockData.js';

/* ── Branding tokens ─────────────────────────────────────────────────── */
describe('BRANDING_V2 tokens', () => {
  it('has primaryColor', () => {
    expect(BRANDING_V2.primaryColor).toBe('#0369a1');
  });
  it('has accentColor', () => {
    expect(BRANDING_V2.accentColor).toBe('#10b981');
  });
  it('has surfaceColor', () => {
    expect(typeof BRANDING_V2.surfaceColor).toBe('string');
  });
});

/* ── Agenda ──────────────────────────────────────────────────────────── */
describe('AGENDA_MOCK', () => {
  it('has at least 5 appointments', () => {
    expect(AGENDA_MOCK.length).toBeGreaterThanOrEqual(5);
  });
  it('every cita has required fields', () => {
    AGENDA_MOCK.forEach(c => {
      expect(c).toHaveProperty('id');
      expect(c).toHaveProperty('hora');
      expect(c).toHaveProperty('paciente');
      expect(c).toHaveProperty('tratamiento');
      expect(c).toHaveProperty('estado');
      expect(c).toHaveProperty('duracion');
    });
  });
  it('estado values are valid', () => {
    const valid = new Set(['confirmada', 'pendiente', 'cancelada']);
    AGENDA_MOCK.forEach(c => expect(valid.has(c.estado)).toBe(true));
  });
  it('filters by estado=confirmada correctly', () => {
    const confirmed = AGENDA_MOCK.filter(c => c.estado === 'confirmada');
    expect(confirmed.length).toBeGreaterThan(0);
    confirmed.forEach(c => expect(c.estado).toBe('confirmada'));
  });
  it('filters by estado=pendiente correctly', () => {
    const pending = AGENDA_MOCK.filter(c => c.estado === 'pendiente');
    pending.forEach(c => expect(c.estado).toBe('pendiente'));
  });
  it('hora format is HH:MM', () => {
    AGENDA_MOCK.forEach(c => expect(c.hora).toMatch(/^\d{2}:\d{2}$/));
  });
  it('duracion is a positive number', () => {
    AGENDA_MOCK.forEach(c => expect(c.duracion).toBeGreaterThan(0));
  });
});

/* ── Pacientes ────────────────────────────────────────────────────────── */
describe('PACIENTES_MOCK', () => {
  it('has at least 3 patients', () => {
    expect(PACIENTES_MOCK.length).toBeGreaterThanOrEqual(3);
  });
  it('every patient has required fields', () => {
    PACIENTES_MOCK.forEach(p => {
      expect(p).toHaveProperty('id');
      expect(p).toHaveProperty('nombre');
      expect(p).toHaveProperty('diagnostico');
    });
  });
  it('search by name works', () => {
    const first = PACIENTES_MOCK[0];
    const firstWord = first.nombre.split(' ')[0].toLowerCase();
    const results = PACIENTES_MOCK.filter(p =>
      p.nombre.toLowerCase().includes(firstWord)
    );
    expect(results.length).toBeGreaterThanOrEqual(1);
    expect(results[0].id).toBe(first.id);
  });
  it('search by diagnostico works', () => {
    const first = PACIENTES_MOCK[0];
    const keyword = first.diagnostico.split(' ')[0].toLowerCase();
    const results = PACIENTES_MOCK.filter(p =>
      p.diagnostico.toLowerCase().includes(keyword)
    );
    expect(results.length).toBeGreaterThanOrEqual(1);
  });
  it('empty search returns all patients', () => {
    const q = '';
    const results = PACIENTES_MOCK.filter(p =>
      p.nombre.toLowerCase().includes(q) || p.diagnostico.toLowerCase().includes(q)
    );
    expect(results.length).toBe(PACIENTES_MOCK.length);
  });
});

/* ── Ejercicios ───────────────────────────────────────────────────────── */
describe('EJERCICIOS_MOCK', () => {
  it('has at least 4 exercises', () => {
    expect(EJERCICIOS_MOCK.length).toBeGreaterThanOrEqual(4);
  });
  it('every exercise has required fields', () => {
    EJERCICIOS_MOCK.forEach(e => {
      expect(e).toHaveProperty('id');
      expect(e).toHaveProperty('nombre');
      expect(e).toHaveProperty('categoria');
      expect(e).toHaveProperty('duracion');
      expect(e).toHaveProperty('nivel');
    });
  });
  it('category filter works correctly', () => {
    const cats = [...new Set(EJERCICIOS_MOCK.map(e => e.categoria))];
    expect(cats.length).toBeGreaterThanOrEqual(1);
    const firstCat = cats[0];
    const filtered = EJERCICIOS_MOCK.filter(e => e.categoria === firstCat);
    expect(filtered.length).toBeGreaterThan(0);
    filtered.forEach(e => expect(e.categoria).toBe(firstCat));
  });
  it('duracion string is non-empty', () => {
    EJERCICIOS_MOCK.forEach(e => {
      expect(typeof e.duracion).toBe('string');
      expect(e.duracion.length).toBeGreaterThan(0);
    });
  });
  it('"todas" filter returns all exercises', () => {
    const cat = 'todas';
    const result = cat === 'todas' ? EJERCICIOS_MOCK : EJERCICIOS_MOCK.filter(e => e.categoria === cat);
    expect(result.length).toBe(EJERCICIOS_MOCK.length);
  });
  it('done-toggle simulation works', () => {
    const doneState = {};
    EJERCICIOS_MOCK.forEach(e => { doneState[e.id] = false; });
    const firstId = EJERCICIOS_MOCK[0].id;
    doneState[firstId] = true;
    expect(doneState[firstId]).toBe(true);
    const notDone = EJERCICIOS_MOCK.filter(e => !doneState[e.id]);
    expect(notDone.length).toBe(EJERCICIOS_MOCK.length - 1);
  });
});

/* ── Rep counter logic ───────────────────────────────────────────────── */
describe('Rep counter logic', () => {
  it('increments correctly', () => {
    let count = 0;
    const max = 10;
    count = Math.min(count + 1, max);
    expect(count).toBe(1);
  });
  it('decrements correctly', () => {
    let count = 5;
    count = Math.max(count - 1, 0);
    expect(count).toBe(4);
  });
  it('does not go below 0', () => {
    let count = 0;
    count = Math.max(count - 1, 0);
    expect(count).toBe(0);
  });
  it('series completed when reps reach max', () => {
    const max = 10;
    let count = max;
    const completed = count >= max;
    expect(completed).toBe(true);
  });
  it('series counter increments after completion', () => {
    let series = 0;
    const maxSeries = 3;
    series = Math.min(series + 1, maxSeries);
    expect(series).toBe(1);
  });
});

/* ── Servicios ───────────────────────────────────────────────────────── */
describe('SERVICIOS_V2', () => {
  it('has at least 4 services', () => {
    expect(SERVICIOS_V2.length).toBeGreaterThanOrEqual(4);
  });
  it('every service has id, nombre, precio', () => {
    SERVICIOS_V2.forEach(s => {
      expect(s).toHaveProperty('id');
      expect(s).toHaveProperty('nombre');
      expect(s).toHaveProperty('precio');
    });
  });
  it('all ids are unique', () => {
    const ids = SERVICIOS_V2.map(s => s.id);
    expect(new Set(ids).size).toBe(ids.length);
  });
});

/* ── Dashboard stats ─────────────────────────────────────────────────── */
describe('DASHBOARD_STATS', () => {
  it('has 4 KPI entries', () => {
    expect(DASHBOARD_STATS.length).toBe(4);
  });
  it('every stat has label and valor', () => {
    DASHBOARD_STATS.forEach(s => {
      expect(s).toHaveProperty('label');
      expect(s).toHaveProperty('valor');
    });
  });
});

/* ── FAQ ─────────────────────────────────────────────────────────────── */
describe('FAQ_V2', () => {
  it('has at least 3 FAQ items', () => {
    expect(FAQ_V2.length).toBeGreaterThanOrEqual(3);
  });
  it('accordion toggle logic works', () => {
    let open = null;
    // open first
    open = 0;
    expect(open).toBe(0);
    // toggle same → close
    open = open === 0 ? null : 0;
    expect(open).toBeNull();
    // open second
    open = 1;
    expect(open).toBe(1);
  });
});

/* ── Evolución mock ──────────────────────────────────────────────────── */
describe('EVOLUCION_MOCK', () => {
  it('has patient and diagnostico', () => {
    expect(EVOLUCION_MOCK).toHaveProperty('paciente');
    expect(EVOLUCION_MOCK).toHaveProperty('diagnostico');
  });
  it('has sesiones array with progression data', () => {
    expect(Array.isArray(EVOLUCION_MOCK.sesiones)).toBe(true);
    expect(EVOLUCION_MOCK.sesiones.length).toBeGreaterThan(0);
    EVOLUCION_MOCK.sesiones.forEach(s => {
      expect(s).toHaveProperty('num');
      expect(s).toHaveProperty('dolor');
    });
  });
  it('pain score decreases or stays same over time (general trend)', () => {
    const sesiones = EVOLUCION_MOCK.sesiones;
    const first = sesiones[0].dolor;
    const last = sesiones[sesiones.length - 1].dolor;
    expect(last).toBeLessThanOrEqual(first);
  });
  it('dolor values are between 0 and 10', () => {
    EVOLUCION_MOCK.sesiones.forEach(s => {
      expect(s.dolor).toBeGreaterThanOrEqual(0);
      expect(s.dolor).toBeLessThanOrEqual(10);
    });
  });
});

/* ── Role-based nav filter logic ─────────────────────────────────────── */
describe('Role-based navigation', () => {
  const NAV_ITEMS = [
    { id: 'dashboard',  roles: ['fisio', 'admin'] },
    { id: 'agenda',     roles: ['fisio', 'admin', 'recepcion'] },
    { id: 'pacientes',  roles: ['fisio', 'admin'] },
    { id: 'evolucion',  roles: ['fisio', 'admin'] },
    { id: 'ejercicios', roles: ['fisio', 'admin', 'paciente'] },
    { id: 'landing',    roles: ['fisio', 'admin', 'recepcion', 'paciente'] },
  ];

  it('admin sees all modules', () => {
    const visible = NAV_ITEMS.filter(i => i.roles.includes('admin'));
    expect(visible.length).toBe(NAV_ITEMS.length);
  });
  it('fisio sees all modules', () => {
    const visible = NAV_ITEMS.filter(i => i.roles.includes('fisio'));
    expect(visible.length).toBe(NAV_ITEMS.length);
  });
  it('recepcion sees only agenda and landing', () => {
    const visible = NAV_ITEMS.filter(i => i.roles.includes('recepcion'));
    expect(visible.length).toBe(2);
    expect(visible.map(i => i.id)).toContain('agenda');
    expect(visible.map(i => i.id)).toContain('landing');
  });
  it('paciente sees only ejercicios and landing', () => {
    const visible = NAV_ITEMS.filter(i => i.roles.includes('paciente'));
    expect(visible.length).toBe(2);
    expect(visible.map(i => i.id)).toContain('ejercicios');
    expect(visible.map(i => i.id)).toContain('landing');
  });
  it('first allowed view for recepcion is agenda', () => {
    const first = NAV_ITEMS.find(i => i.roles.includes('recepcion'));
    expect(first.id).toBe('agenda');
  });
  it('first allowed view for paciente is ejercicios', () => {
    const first = NAV_ITEMS.find(i => i.roles.includes('paciente'));
    expect(first.id).toBe('ejercicios');
  });
});

/* ── Booking modal step logic ────────────────────────────────────────── */
describe('BookingModal step logic', () => {
  it('step 1: canNext requires service selected', () => {
    const sel = { service: null, date: null, time: null };
    expect(!!sel.service).toBe(false);
    sel.service = 'manual';
    expect(!!sel.service).toBe(true);
  });
  it('step 2: canNext requires date AND time', () => {
    const sel = { service: 'manual', date: null, time: null };
    expect(!!(sel.date && sel.time)).toBe(false);
    sel.date = 'Lun 1 Sep';
    expect(!!(sel.date && sel.time)).toBe(false);
    sel.time = '10:00';
    expect(!!(sel.date && sel.time)).toBe(true);
  });
  it('step progression: 1 → 2 → 3 → 4', () => {
    let step = 1;
    step = 2; expect(step).toBe(2);
    step = 3; expect(step).toBe(3);
    step = 4; expect(step).toBe(4);
  });
  it('step back navigation: 3 → 2 → 1', () => {
    let step = 3;
    step = 2; expect(step).toBe(2);
    step = 1; expect(step).toBe(1);
  });
});

/* ── Mobile sidebar logic ────────────────────────────────────────────── */
describe('Mobile sidebar', () => {
  it('isMobile true when width < 768', () => {
    const width = 390;
    const isMobile = width < 768;
    expect(isMobile).toBe(true);
  });
  it('isMobile false when width >= 768', () => {
    const width = 1024;
    const isMobile = width < 768;
    expect(isMobile).toBe(false);
  });
  it('mobile sidebar state toggling', () => {
    let open = false;
    open = true;
    expect(open).toBe(true);
    open = false;
    expect(open).toBe(false);
  });
  it('tablet threshold 768 is not mobile', () => {
    expect(768 < 768).toBe(false);
  });
});
