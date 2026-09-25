// Dashboard Experience Engine — ADV-07

export const DASHBOARD_WIDGET = Object.freeze({
  METRIC_CARD:     'METRIC_CARD',
  AGENDA:          'AGENDA',
  QUICK_ACTIONS:   'QUICK_ACTIONS',
  STATUS_LIST:     'STATUS_LIST',
  CHART:           'CHART',
  CALENDAR:        'CALENDAR',
  NOTIFICATION:    'NOTIFICATION',
  PIPELINE:        'PIPELINE',
  SEARCH:          'SEARCH',
  RECENT_ACTIVITY: 'RECENT_ACTIVITY',
});

export const DASHBOARD_PATTERN = Object.freeze({
  BOOKING_FIRST:  'BOOKING_FIRST',
  CRM_FIRST:      'CRM_FIRST',
  SERVICE_FIRST:  'SERVICE_FIRST',
  STANDARD:       'STANDARD',
  ANALYTICS:      'ANALYTICS',
});

const VERTICAL_DASHBOARD_CONFIGS = Object.freeze({
  veterinary: {
    pattern:  DASHBOARD_PATTERN.BOOKING_FIRST,
    widgets: [
      { type: DASHBOARD_WIDGET.AGENDA,          priority: 1, label: 'Citas de hoy' },
      { type: DASHBOARD_WIDGET.METRIC_CARD,     priority: 2, label: 'Pacientes activos', value: '—', isReal: false },
      { type: DASHBOARD_WIDGET.METRIC_CARD,     priority: 3, label: 'Citas esta semana', value: '—', isReal: false },
      { type: DASHBOARD_WIDGET.QUICK_ACTIONS,   priority: 4, label: 'Acciones rápidas' },
      { type: DASHBOARD_WIDGET.STATUS_LIST,     priority: 5, label: 'Próximas vacunaciones' },
      { type: DASHBOARD_WIDGET.NOTIFICATION,    priority: 6, label: 'Recordatorios' },
    ],
  },
  legal: {
    pattern: DASHBOARD_PATTERN.CRM_FIRST,
    widgets: [
      { type: DASHBOARD_WIDGET.STATUS_LIST,     priority: 1, label: 'Expedientes activos' },
      { type: DASHBOARD_WIDGET.METRIC_CARD,     priority: 2, label: 'Plazos próximos', value: '—', isReal: false },
      { type: DASHBOARD_WIDGET.METRIC_CARD,     priority: 3, label: 'Clientes activos', value: '—', isReal: false },
      { type: DASHBOARD_WIDGET.PIPELINE,        priority: 4, label: 'Estado expedientes' },
      { type: DASHBOARD_WIDGET.RECENT_ACTIVITY, priority: 5, label: 'Actividad reciente' },
      { type: DASHBOARD_WIDGET.NOTIFICATION,    priority: 6, label: 'Alertas y plazos' },
    ],
  },
  beauty: {
    pattern: DASHBOARD_PATTERN.SERVICE_FIRST,
    widgets: [
      { type: DASHBOARD_WIDGET.AGENDA,          priority: 1, label: 'Agenda del día' },
      { type: DASHBOARD_WIDGET.METRIC_CARD,     priority: 2, label: 'Reservas hoy', value: '—', isReal: false },
      { type: DASHBOARD_WIDGET.METRIC_CARD,     priority: 3, label: 'Ingresos del mes', value: '—', isReal: false },
      { type: DASHBOARD_WIDGET.QUICK_ACTIONS,   priority: 4, label: 'Nueva reserva' },
      { type: DASHBOARD_WIDGET.STATUS_LIST,     priority: 5, label: 'Clientes frecuentes' },
      { type: DASHBOARD_WIDGET.NOTIFICATION,    priority: 6, label: 'Recordatorios' },
    ],
  },
  padel: {
    pattern: DASHBOARD_PATTERN.BOOKING_FIRST,
    widgets: [
      { type: DASHBOARD_WIDGET.CALENDAR,        priority: 1, label: 'Ocupación de pistas' },
      { type: DASHBOARD_WIDGET.METRIC_CARD,     priority: 2, label: 'Reservas activas', value: '—', isReal: false },
      { type: DASHBOARD_WIDGET.METRIC_CARD,     priority: 3, label: 'Pistas disponibles', value: '—', isReal: false },
      { type: DASHBOARD_WIDGET.QUICK_ACTIONS,   priority: 4, label: 'Nueva reserva' },
      { type: DASHBOARD_WIDGET.STATUS_LIST,     priority: 5, label: 'Lista de espera' },
    ],
  },
  default: {
    pattern: DASHBOARD_PATTERN.STANDARD,
    widgets: [
      { type: DASHBOARD_WIDGET.METRIC_CARD,     priority: 1, label: 'Actividad hoy', value: '—', isReal: false },
      { type: DASHBOARD_WIDGET.RECENT_ACTIVITY, priority: 2, label: 'Actividad reciente' },
      { type: DASHBOARD_WIDGET.QUICK_ACTIONS,   priority: 3, label: 'Acciones rápidas' },
      { type: DASHBOARD_WIDGET.NOTIFICATION,    priority: 4, label: 'Notificaciones' },
    ],
  },
});

export function buildDashboardConfig(vertical = 'default', roles = ['STAFF']) {
  const config = VERTICAL_DASHBOARD_CONFIGS[vertical] ?? VERTICAL_DASHBOARD_CONFIGS.default;
  const isAdmin = roles.includes('ADMIN') || roles.includes('MANAGER');
  const widgets = isAdmin
    ? config.widgets
    : config.widgets.filter(w => w.type !== DASHBOARD_WIDGET.CHART);
  return Object.freeze({ ...config, widgets, vertical, roles, isReal: false });
}

export function evaluateDashboardRelevance(vertical = 'default', widgets = []) {
  const config = VERTICAL_DASHBOARD_CONFIGS[vertical] ?? VERTICAL_DASHBOARD_CONFIGS.default;
  const expected = new Set(config.widgets.map(w => w.type));
  const actual = new Set(widgets.map(w => w.type));
  const relevant = [...actual].filter(t => expected.has(t));
  const score = expected.size > 0 ? Math.round((relevant.length / expected.size) * 100) : 0;
  return Object.freeze({ score, relevant: relevant.length, expected: expected.size, isReal: false });
}

export const DASHBOARD_EXPERIENCE_ENGINE_VERSION = '1.0.0';
