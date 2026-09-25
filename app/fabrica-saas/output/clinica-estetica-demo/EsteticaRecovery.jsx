/**
 * OUTPUT · Clínica Estética Demo · Recuperación de leads
 * Simulación de recuperación de oportunidades abandonadas.
 * Sin fetch. Sin secretos. Datos 100% ficticios.
 */
import { useState } from 'react';
import { MOCK_LEADS_ABANDONO_ESTETICA } from '../../verticals/estetica/mockData.js';

const ESTADO_LEAD = {
  en_proceso:  { label: 'En proceso',  color: '#fef9c3', text: '#a16207', icon: '⏳' },
  recuperado:  { label: 'Recuperado',  color: '#d1fae5', text: '#065f46', icon: '✅' },
  perdido:     { label: 'Perdido',     color: '#fee2e2', text: '#991b1b', icon: '❌' },
};

function LeadBadge({ estado }) {
  const cfg = ESTADO_LEAD[estado] || { label: estado, color: '#f3f4f6', text: '#374151', icon: '•' };
  return (
    <span style={{
      background: cfg.color, color: cfg.text,
      borderRadius: 6, padding: '2px 8px', fontSize: 11, fontWeight: 700,
    }}>
      {cfg.icon} {cfg.label}
    </span>
  );
}

export function EsteticaRecovery() {
  const [leads, setLeads] = useState(MOCK_LEADS_ABANDONO_ESTETICA);
  const [accionada, setAccionada] = useState(null);

  const recuperados  = leads.filter(l => l.estado === 'recuperado').length;
  const total        = leads.length;
  const tasa         = total > 0 ? Math.round((recuperados / total) * 100) : 0;

  const simularAccion = (id) => {
    setAccionada(id);
    setTimeout(() => {
      setLeads(prev => prev.map(l => l.id === id ? { ...l, estado: 'recuperado' } : l));
      setAccionada(null);
    }, 1200);
  };

  return (
    <div style={{ padding: 20 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
        <h2 style={{ margin: 0, fontSize: 18, fontWeight: 700, color: '#111827' }}>
          Recuperación de Leads
        </h2>
        <div style={{
          background: '#f0fdf4', border: '1px solid #bbf7d0',
          borderRadius: 8, padding: '6px 14px', textAlign: 'center',
        }}>
          <div style={{ fontSize: 18, fontWeight: 800, color: '#16a34a' }}>{tasa}%</div>
          <div style={{ fontSize: 10, color: '#6b7280' }}>tasa recuperación</div>
        </div>
      </div>

      <div style={{
        display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 10, marginBottom: 20,
      }}>
        {[
          { label: 'Leads totales',    value: total,        icon: '👥' },
          { label: 'En proceso',       value: leads.filter(l => l.estado === 'en_proceso').length, icon: '⏳' },
          { label: 'Recuperados',      value: recuperados,  icon: '✅' },
        ].map(m => (
          <div key={m.label} style={{
            background: '#fff', border: '1px solid #e5e7eb',
            borderRadius: 10, padding: '12px 14px', textAlign: 'center',
          }}>
            <div style={{ fontSize: 20 }}>{m.icon}</div>
            <div style={{ fontSize: 20, fontWeight: 800, color: '#111827' }}>{m.value}</div>
            <div style={{ fontSize: 11, color: '#9ca3af' }}>{m.label}</div>
          </div>
        ))}
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
        {leads.map(l => (
          <div key={l.id} style={{
            background: '#fff', border: '1px solid #e5e7eb',
            borderRadius: 10, padding: '14px 16px',
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 8 }}>
              <div>
                <div style={{ fontWeight: 600, fontSize: 14, color: '#111827' }}>{l.nombre}</div>
                <div style={{ fontSize: 12, color: '#6b7280', marginTop: 2 }}>
                  {l.tratamiento} · {l.dias_inactivo}d sin actividad
                </div>
                <div style={{ fontSize: 12, color: '#374151', marginTop: 4 }}>
                  💡 {l.accion_sugerida}
                </div>
              </div>
              <LeadBadge estado={l.estado} />
            </div>

            {l.estado === 'en_proceso' && (
              <button
                onClick={() => simularAccion(l.id)}
                disabled={accionada === l.id}
                style={{
                  marginTop: 12, padding: '7px 16px',
                  background: accionada === l.id ? '#e5e7eb' : '#2563eb',
                  color: accionada === l.id ? '#9ca3af' : '#fff',
                  border: 'none', borderRadius: 7, cursor: accionada === l.id ? 'default' : 'pointer',
                  fontSize: 12, fontWeight: 700,
                }}
              >
                {accionada === l.id ? 'Procesando...' : 'Simular acción de recuperación'}
              </button>
            )}
          </div>
        ))}
      </div>

      <p style={{ marginTop: 16, fontSize: 11, color: '#9ca3af', textAlign: 'center' }}>
        ⚠️ Simulación demo · Las acciones no envían emails ni mensajes reales · Datos ficticios
      </p>
    </div>
  );
}
