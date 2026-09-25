/**
 * OUTPUT GENERADO · Clínica Dental Málaga Demo · CRM
 * Generado por Fábrica SaaS V1.2 · create-client.mjs
 * NO editar manualmente — regenerar: npm run factory:create:clinica-dental-malaga-demo
 * Datos 100% ficticios. Sin llamadas externas reales.
 */
import { useState } from 'react';
import { MOCK_CLIENTES } from './ClinicaDentalMalagaDemoMockData.js';

const ESTADO_CONFIG = {
  nuevo:            { label: 'Nuevo',          color: '#dbeafe', text: '#1d4ed8' },
  contactado:       { label: 'Contactado',     color: '#fef9c3', text: '#a16207' },
  en_espera:        { label: 'En espera',      color: '#fde68a', text: '#92400e' },
  activo:           { label: 'Activo',         color: '#d1fae5', text: '#065f46' },
  en_tratamiento:   { label: 'En tratamiento', color: '#e0e7ff', text: '#3730a3' },
  pendiente_cita:   { label: 'Pend. cita',     color: '#fde68a', text: '#92400e' },
  completado:       { label: 'Completado',     color: '#dcfce7', text: '#166534' },
  perdido:          { label: 'Perdido',        color: '#fee2e2', text: '#991b1b' },
};

function EstadoBadge({ estado }) {
  const cfg = ESTADO_CONFIG[estado] ?? { label: estado, color: '#f3f4f6', text: '#374151' };
  return (
    <span style={{
      padding: '2px 8px', borderRadius: 12, fontSize: 11, fontWeight: 600,
      background: cfg.color, color: cfg.text,
    }}>
      {cfg.label}
    </span>
  );
}

export function ClinicaDentalMalagaDemoCrm() {
  const [expanded, setExpanded] = useState(null);
  const [filtro, setFiltro]     = useState('todos');

  const estados = ['todos', ...new Set(MOCK_CLIENTES.map(c => c.estado))];
  const lista = filtro === 'todos'
    ? MOCK_CLIENTES
    : MOCK_CLIENTES.filter(c => c.estado === filtro);

  return (
    <div style={{ padding: 20 }}>
      <div style={{ marginBottom: 16, display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 8 }}>
        <h2 style={{ margin: 0, fontSize: 16, fontWeight: 700, color: '#111827' }}>
          CRM · Pacientes · <span style={{ fontWeight: 400, color: '#6b7280', fontSize: 13 }}>Clínica Dental Málaga Demo</span>
        </h2>
        <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
          {estados.map(e => (
            <button
              key={e}
              onClick={() => setFiltro(e)}
              style={{
                padding: '4px 10px', borderRadius: 8, fontSize: 11, fontWeight: 600,
                border: '1px solid',
                borderColor: filtro === e ? '#2563eb' : '#d1d5db',
                background: filtro === e ? '#eff6ff' : '#fff',
                color: filtro === e ? '#2563eb' : '#374151',
                cursor: 'pointer',
              }}
            >
              {e === 'todos' ? 'Todos' : ESTADO_CONFIG[e]?.label ?? e}
            </button>
          ))}
        </div>
      </div>

      {lista.length === 0 && (
        <p style={{ color: '#9ca3af', textAlign: 'center', marginTop: 40 }}>
          No hay registros con este filtro.
        </p>
      )}

      {lista.map(c => (
        <div
          key={c.id}
          style={{
            background: '#fff', border: '1px solid #e5e7eb', borderRadius: 10,
            marginBottom: 10, overflow: 'hidden',
          }}
        >
          <div
            onClick={() => setExpanded(expanded === c.id ? null : c.id)}
            style={{
              padding: '12px 16px', cursor: 'pointer', display: 'flex',
              alignItems: 'center', justifyContent: 'space-between', gap: 8,
            }}
          >
            <div>
              <span style={{ fontWeight: 600, fontSize: 14, color: '#111827' }}>{c.nombre}</span>
              <span style={{ fontSize: 12, color: '#6b7280', marginLeft: 8 }}>{c.tratamiento_interes}</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <EstadoBadge estado={c.estado} />
              <span style={{ color: '#9ca3af', fontSize: 12 }}>{expanded === c.id ? '▲' : '▼'}</span>
            </div>
          </div>
          {expanded === c.id && (
            <div style={{ padding: '0 16px 14px', borderTop: '1px solid #f3f4f6' }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '6px 16px', marginTop: 10 }}>
                {[
                  ['Email', c.email],
                  ['Teléfono', c.telefono],
                  ['Origen', c.origen],
                  ['Sesiones completadas', c.sesiones_completadas],
                  ['Sesiones restantes', c.sesiones_restantes],
                ].map(([k, v]) => v !== undefined && (
                  <div key={k}>
                    <span style={{ fontSize: 11, color: '#9ca3af', display: 'block' }}>{k}</span>
                    <span style={{ fontSize: 13, color: '#374151', fontWeight: 500 }}>{String(v)}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      ))}
    </div>
  );
}
