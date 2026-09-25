/**
 * OUTPUT · Clínica Estética Demo · CRM de clientes
 * Datos ficticios. Sin fetch. Sin secretos. Sin llamadas externas.
 */
import { useState } from 'react';
import { MOCK_CLIENTES_ESTETICA } from '../../verticals/estetica/mockData.js';

const ESTADO_CONFIG = {
  nuevo:          { label: 'Nuevo',          color: '#dbeafe', text: '#1d4ed8' },
  contactado:     { label: 'Contactado',     color: '#fef9c3', text: '#a16207' },
  pendiente_cita: { label: 'Pend. cita',     color: '#fde68a', text: '#92400e' },
  cita_agendada:  { label: 'Cita agendada',  color: '#d1fae5', text: '#065f46' },
  en_tratamiento: { label: 'En tratamiento', color: '#e0e7ff', text: '#3730a3' },
  completado:     { label: 'Completado',     color: '#dcfce7', text: '#166534' },
  perdido:        { label: 'Perdido',        color: '#fee2e2', text: '#991b1b' },
};

function EstadoBadge({ estado }) {
  const cfg = ESTADO_CONFIG[estado] || { label: estado, color: '#f3f4f6', text: '#374151' };
  return (
    <span style={{
      background: cfg.color, color: cfg.text,
      borderRadius: 6, padding: '2px 8px', fontSize: 11, fontWeight: 700,
    }}>
      {cfg.label}
    </span>
  );
}

function SesionesBadge({ completadas, restantes }) {
  if (restantes === 0 && completadas === 0) return null;
  return (
    <span style={{
      background: '#f3e8ff', color: '#7e22ce',
      borderRadius: 6, padding: '2px 8px', fontSize: 11, fontWeight: 600,
    }}>
      {completadas} / {completadas + restantes} sesiones
    </span>
  );
}

export function EsteticaCrm() {
  const [expandido, setExpandido] = useState(null);
  const [filtro, setFiltro] = useState('todos');

  const estados = ['todos', ...Object.keys(ESTADO_CONFIG)];
  const clientes = filtro === 'todos'
    ? MOCK_CLIENTES_ESTETICA
    : MOCK_CLIENTES_ESTETICA.filter(c => c.estado === filtro);

  return (
    <div style={{ padding: 20 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
        <h2 style={{ margin: 0, fontSize: 18, fontWeight: 700, color: '#111827' }}>
          CRM · Clientes Estética
        </h2>
        <span style={{ fontSize: 12, color: '#9ca3af', background: '#f3f4f6', padding: '4px 10px', borderRadius: 20 }}>
          {clientes.length} cliente{clientes.length !== 1 ? 's' : ''}
        </span>
      </div>

      <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginBottom: 16 }}>
        {estados.map(e => (
          <button
            key={e}
            onClick={() => setFiltro(e)}
            style={{
              padding: '4px 12px', borderRadius: 16, fontSize: 12, fontWeight: 600,
              border: 'none', cursor: 'pointer',
              background: filtro === e ? '#2563eb' : '#f3f4f6',
              color: filtro === e ? '#fff' : '#374151',
            }}
          >
            {ESTADO_CONFIG[e]?.label || 'Todos'}
          </button>
        ))}
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
        {clientes.map(c => (
          <div
            key={c.id}
            style={{
              background: '#fff', border: '1px solid #e5e7eb',
              borderRadius: 10, padding: '14px 16px', cursor: 'pointer',
            }}
            onClick={() => setExpandido(expandido === c.id ? null : c.id)}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 8 }}>
              <div>
                <div style={{ fontWeight: 600, fontSize: 14, color: '#111827' }}>{c.nombre}</div>
                <div style={{ fontSize: 12, color: '#6b7280', marginTop: 2 }}>{c.tratamiento_interes}</div>
              </div>
              <div style={{ display: 'flex', gap: 6, alignItems: 'center', flexWrap: 'wrap' }}>
                <SesionesBadge completadas={c.sesiones_completadas} restantes={c.sesiones_restantes} />
                <EstadoBadge estado={c.estado} />
              </div>
            </div>

            {expandido === c.id && (
              <div style={{ marginTop: 12, paddingTop: 12, borderTop: '1px solid #f3f4f6' }}>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, fontSize: 13 }}>
                  {[
                    ['Email', c.email],
                    ['Teléfono', c.telefono],
                    ['Pack', c.pack_contratado ?? '—'],
                    ['Origen', c.origen],
                    ['Última sesión', c.ultima_sesion ?? '—'],
                    ['Próxima sesión', c.proxima_sesion ?? '—'],
                  ].map(([k, v]) => (
                    <div key={k}>
                      <span style={{ color: '#9ca3af', fontSize: 11 }}>{k}</span>
                      <div style={{ color: '#374151', fontWeight: 500 }}>{v}</div>
                    </div>
                  ))}
                </div>
                <p style={{
                  marginTop: 10, fontSize: 11, color: '#9ca3af',
                  background: '#f9fafb', padding: 8, borderRadius: 6,
                }}>
                  ⚠️ Datos ficticios · Demo interna · No conectado a sistemas reales
                </p>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
