/**
 * OUTPUT · Clínica Dental Demo · Pantalla 2: CRM simulado
 * Tabla de pacientes potenciales con estado, prioridad, valor estimado (ficticio),
 * origen y próxima acción. Sin envíos reales, sin datos de personas reales.
 */
import { useState } from 'react';
import { Card, Badge, FicticioLabel } from '../../core/AppShell.jsx';
import { MOCK_PACIENTES } from '../../verticals/dental/mockData.js';

const ESTADOS = ['todos', 'nuevo', 'pendiente', 'en_seguimiento', 'cita_agendada', 'perdido'];
const ESTADO_LABELS = {
  todos: 'Todos',
  nuevo: 'Nuevo',
  pendiente: 'Pendiente',
  en_seguimiento: 'En seguimiento',
  cita_agendada: 'Cita agendada',
  perdido: 'Perdido',
};

function PrioridadDot({ color }) {
  const c = { red: '#ef4444', yellow: '#f59e0b', gray: '#9ca3af' }[color] || '#9ca3af';
  return <span style={{ display: 'inline-block', width: 8, height: 8, borderRadius: '50%', background: c, marginRight: 6 }} />;
}

function Avatar({ nombre }) {
  const initials = nombre.split(' ').slice(0, 2).map(n => n[0]).join('');
  const colors = ['#2563eb', '#7c3aed', '#059669', '#dc2626', '#d97706'];
  const color = colors[nombre.charCodeAt(0) % colors.length];
  return (
    <div style={{ width: 36, height: 36, borderRadius: '50%', background: color, color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, fontSize: 13, flexShrink: 0 }}>
      {initials}
    </div>
  );
}

export function DentalCrm() {
  const [filtro, setFiltro] = useState('todos');
  const [expandedId, setExpandedId] = useState(null);

  const pacientes = filtro === 'todos'
    ? MOCK_PACIENTES
    : MOCK_PACIENTES.filter(p => p.estado === filtro);

  const stats = {
    total: MOCK_PACIENTES.length,
    nuevos: MOCK_PACIENTES.filter(p => p.estado === 'nuevo').length,
    agendados: MOCK_PACIENTES.filter(p => p.estado === 'cita_agendada').length,
    valor: MOCK_PACIENTES.filter(p => p.valor_estimado !== '–').reduce((_, p) => p, null),
  };

  return (
    <div>
      <div style={{ marginBottom: 20 }}>
        <h2 style={{ fontSize: 20, fontWeight: 800, color: '#111827', margin: '0 0 4px' }}>📋 CRM simulado</h2>
        <p style={{ margin: 0, fontSize: 14, color: '#6b7280' }}>Pacientes potenciales · Datos ficticios · Sin envíos reales</p>
      </div>

      {/* Resumen */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: 12, marginBottom: 20 }}>
        {[
          { label: 'Total leads', value: stats.total, icon: '👥', color: '#2563eb' },
          { label: 'Nuevos', value: stats.nuevos, icon: '🆕', color: '#7c3aed' },
          { label: 'Citas agendadas', value: stats.agendados, icon: '📅', color: '#059669' },
          { label: 'Pipeline estimado', value: '9.300 €', icon: '💰', color: '#d97706' },
        ].map(s => (
          <div key={s.label} style={{ background: '#fff', borderRadius: 10, border: '1px solid #e5e7eb', padding: '14px 16px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
              <span style={{ fontSize: 12, color: '#6b7280' }}>{s.label}</span>
              <span style={{ fontSize: 18 }}>{s.icon}</span>
            </div>
            <div style={{ fontSize: 22, fontWeight: 800, color: s.color }}>{s.value}</div>
            {s.label === 'Pipeline estimado' && <FicticioLabel />}
          </div>
        ))}
      </div>

      {/* Filtros */}
      <div style={{ display: 'flex', gap: 8, marginBottom: 16, flexWrap: 'wrap' }}>
        {ESTADOS.map(e => (
          <button
            key={e}
            onClick={() => setFiltro(e)}
            style={{
              padding: '6px 14px', borderRadius: 20, border: 'none', cursor: 'pointer', fontSize: 13, fontWeight: 600,
              background: filtro === e ? '#2563eb' : '#f3f4f6',
              color: filtro === e ? '#fff' : '#374151',
            }}
          >
            {ESTADO_LABELS[e]} {e !== 'todos' && `(${MOCK_PACIENTES.filter(p => p.estado === e).length})`}
          </button>
        ))}
      </div>

      {/* Tabla / lista de pacientes */}
      <Card padding="0">
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 14 }}>
            <thead>
              <tr style={{ background: '#f9fafb', borderBottom: '1px solid #e5e7eb' }}>
                <th style={TH}>Paciente</th>
                <th style={TH}>Tratamiento</th>
                <th style={TH}>Sede</th>
                <th style={TH}>Origen</th>
                <th style={TH}>Estado</th>
                <th style={TH}>Prioridad</th>
                <th style={TH}>Valor est.</th>
                <th style={TH}>Próxima acción</th>
              </tr>
            </thead>
            <tbody>
              {pacientes.map(p => (
                <>
                  <tr
                    key={p.id}
                    onClick={() => setExpandedId(expandedId === p.id ? null : p.id)}
                    style={{ borderBottom: '1px solid #f3f4f6', cursor: 'pointer', background: expandedId === p.id ? '#f0f9ff' : '#fff' }}
                  >
                    <td style={TD}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                        <Avatar nombre={p.nombre} />
                        <div>
                          <div style={{ fontWeight: 600, color: '#111827' }}>{p.nombre}</div>
                          <div style={{ fontSize: 12, color: '#9ca3af' }}>{p.fecha_contacto}</div>
                        </div>
                      </div>
                    </td>
                    <td style={TD}>{p.tratamiento}</td>
                    <td style={TD}><span style={{ fontSize: 12 }}>{p.sede}</span></td>
                    <td style={TD}><span style={{ fontSize: 12 }}>{p.origen}</span></td>
                    <td style={TD}><Badge color={p.estado_color}>{p.estado_label}</Badge></td>
                    <td style={TD}>
                      <PrioridadDot color={p.prioridad_color} />
                      <span style={{ textTransform: 'capitalize', fontSize: 12 }}>{p.prioridad}</span>
                    </td>
                    <td style={TD}>
                      <span style={{ fontWeight: 700 }}>{p.valor_estimado}</span>
                      {p.valor_estimado !== '–' && <FicticioLabel />}
                    </td>
                    <td style={{ ...TD, fontSize: 12 }}>{p.proxima_accion}</td>
                  </tr>
                  {expandedId === p.id && (
                    <tr key={`${p.id}-detail`} style={{ background: '#f0f9ff' }}>
                      <td colSpan={8} style={{ padding: '12px 20px' }}>
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 12, fontSize: 13 }}>
                          <div><span style={{ color: '#6b7280' }}>Email:</span> <span style={{ fontFamily: 'monospace' }}>{p.email}</span> <FicticioLabel /></div>
                          <div><span style={{ color: '#6b7280' }}>Teléfono:</span> {p.telefono} <FicticioLabel /></div>
                          <div><span style={{ color: '#6b7280' }}>Próxima acción:</span> <strong>{p.proxima_accion}</strong></div>
                        </div>
                        <div style={{ marginTop: 10, display: 'flex', gap: 8 }}>
                          {['Marcar contactado', 'Agendar cita', 'Enviar presupuesto'].map(a => (
                            <button
                              key={a}
                              style={{ padding: '6px 12px', background: '#f3f4f6', border: '1px solid #e5e7eb', borderRadius: 6, cursor: 'pointer', fontSize: 12, color: '#374151' }}
                              onClick={e => { e.stopPropagation(); alert(`[DEMO FICTICIA] Acción simulada: "${a}" — No se ha enviado nada.`); }}
                            >
                              {a}
                            </button>
                          ))}
                        </div>
                      </td>
                    </tr>
                  )}
                </>
              ))}
            </tbody>
          </table>
          {pacientes.length === 0 && (
            <div style={{ padding: '32px', textAlign: 'center', color: '#9ca3af', fontSize: 14 }}>
              Sin pacientes con este estado.
            </div>
          )}
        </div>
      </Card>

      <div style={{ marginTop: 12, fontSize: 12, color: '#9ca3af', textAlign: 'center' }}>
        Todos los datos son ficticios · No representan personas reales · Demo interna Fábrica SaaS
      </div>
    </div>
  );
}

const TH = {
  padding: '10px 14px',
  textAlign: 'left',
  fontSize: 12,
  fontWeight: 700,
  color: '#6b7280',
  textTransform: 'uppercase',
  letterSpacing: '0.04em',
  whiteSpace: 'nowrap',
};

const TD = {
  padding: '12px 14px',
  color: '#374151',
  verticalAlign: 'middle',
};
