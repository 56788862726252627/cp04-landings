/**
 * OUTPUT · Despacho Abogados Demo · CRM de expedientes
 * Diferenciador: expediente, fase, urgencia, actuación pendiente.
 * Datos ficticios. Sin fetch. Sin secretos. Sin llamadas externas.
 */
import { useState } from 'react';
import { MOCK_CLIENTES_ABOGADOS } from '../../verticals/abogados/mockData.js';
import { ABOGADOS_VERTICAL } from '../../verticals/abogados/config.js';

const ESTADO_CONFIG = {
  nuevo:               { label: 'Nuevo',             color: '#dbeafe', text: '#1d4ed8' },
  contactado:          { label: 'Contactado',         color: '#fef9c3', text: '#a16207' },
  consulta_realizada:  { label: 'Consulta realizada', color: '#fde68a', text: '#92400e' },
  expediente_abierto:  { label: 'Expediente abierto', color: '#d1fae5', text: '#065f46' },
  en_proceso:          { label: 'En proceso',         color: '#e0e7ff', text: '#3730a3' },
  resolucion:          { label: 'Resolución',         color: '#dcfce7', text: '#166534' },
  cerrado:             { label: 'Cerrado',            color: '#f3f4f6', text: '#374151' },
  perdido:             { label: 'Perdido',            color: '#fee2e2', text: '#991b1b' },
};

const URGENCIA_CONFIG = {
  alta:  { label: 'Urgente', color: '#fee2e2', text: '#991b1b', icon: '🔴' },
  media: { label: 'Media',   color: '#fef9c3', text: '#a16207', icon: '🟡' },
  baja:  { label: 'Baja',    color: '#d1fae5', text: '#065f46', icon: '🟢' },
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

function UrgenciaBadge({ urgencia }) {
  const cfg = URGENCIA_CONFIG[urgencia] || { label: urgencia, color: '#f3f4f6', text: '#374151', icon: '•' };
  return (
    <span style={{
      background: cfg.color, color: cfg.text,
      borderRadius: 6, padding: '2px 8px', fontSize: 11, fontWeight: 700,
    }}>
      {cfg.icon} {cfg.label}
    </span>
  );
}

function FaseBadge({ fase }) {
  const faseCfg = ABOGADOS_VERTICAL.fases_expediente.find(f => f.id === fase);
  return (
    <span style={{
      background: '#f0f9ff', color: '#0369a1',
      borderRadius: 6, padding: '2px 8px', fontSize: 11, fontWeight: 600,
    }}>
      {faseCfg ? `Fase ${faseCfg.orden}: ${faseCfg.label}` : fase}
    </span>
  );
}

export function AbogadosCrm() {
  const [expandido, setExpandido] = useState(null);
  const [filtro, setFiltro] = useState('todos');

  const estados = ['todos', ...Object.keys(ESTADO_CONFIG)];
  const clientes = filtro === 'todos'
    ? MOCK_CLIENTES_ABOGADOS
    : MOCK_CLIENTES_ABOGADOS.filter(c => c.estado === filtro);

  return (
    <div style={{ padding: 20 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
        <h2 style={{ margin: 0, fontSize: 18, fontWeight: 700, color: '#111827' }}>
          CRM · Expedientes
        </h2>
        <span style={{ fontSize: 12, color: '#9ca3af', background: '#f3f4f6', padding: '4px 10px', borderRadius: 20 }}>
          {clientes.length} expediente{clientes.length !== 1 ? 's' : ''}
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
              borderLeft: c.urgencia === 'alta' ? '3px solid #ef4444' : '1px solid #e5e7eb',
            }}
            onClick={() => setExpandido(expandido === c.id ? null : c.id)}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 8 }}>
              <div>
                <div style={{ fontWeight: 600, fontSize: 14, color: '#111827' }}>{c.nombre}</div>
                <div style={{ fontSize: 12, color: '#6b7280', marginTop: 2 }}>
                  {c.numero_expediente} · {c.area_label}
                </div>
                <div style={{ fontSize: 12, color: '#374151', marginTop: 2 }}>
                  {c.asunto}
                </div>
              </div>
              <div style={{ display: 'flex', gap: 6, alignItems: 'center', flexWrap: 'wrap' }}>
                <UrgenciaBadge urgencia={c.urgencia} />
                <EstadoBadge estado={c.estado} />
              </div>
            </div>

            {expandido === c.id && (
              <div style={{ marginTop: 12, paddingTop: 12, borderTop: '1px solid #f3f4f6' }}>
                <div style={{ marginBottom: 10 }}>
                  <FaseBadge fase={c.fase} />
                </div>
                {c.actuacion_pendiente && (
                  <div style={{
                    background: '#fffbeb', border: '1px solid #fde68a',
                    borderRadius: 8, padding: '8px 12px', marginBottom: 10,
                  }}>
                    <div style={{ fontSize: 11, color: '#92400e', fontWeight: 700 }}>
                      📌 Próxima actuación
                    </div>
                    <div style={{ fontSize: 13, color: '#78350f', marginTop: 2 }}>
                      {c.actuacion_pendiente}
                    </div>
                    {c.fecha_proxima_actuacion && (
                      <div style={{ fontSize: 11, color: '#a16207', marginTop: 2 }}>
                        🗓️ {c.fecha_proxima_actuacion}
                      </div>
                    )}
                  </div>
                )}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, fontSize: 13 }}>
                  {[
                    ['Abogado', c.abogado],
                    ['Email', c.email],
                    ['Teléfono', c.telefono],
                    ['Origen', c.origen],
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
                  ⚠️ Datos ficticios · Demo interna · No conectado a sistemas reales · Expediente: {c.numero_expediente}
                </p>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
