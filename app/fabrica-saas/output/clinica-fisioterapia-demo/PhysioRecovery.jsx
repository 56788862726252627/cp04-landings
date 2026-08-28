/**
 * OUTPUT · Clínica Fisioterapia Demo · Pantalla 3: Recuperación de leads
 * Reutiliza CORE (Card, Badge, FicticioLabel). Datos ficticios de fisioterapia.
 * No envía nada. No llama a servicios externos. Solo demo interna.
 */
import { useState } from 'react';
import { Card, Badge, FicticioLabel } from '../../core/AppShell.jsx';
import { MOCK_LEADS_ABANDONO_FISIO } from '../../verticals/fisioterapia/mockData.js';

const TIPO_ICONS = {
  Email: '📧', Recordatorio: '🔔', Oferta: '🎁',
  Notificación: '📱', Seguimiento: '📞', Llamada: '☎️',
};

const ESTADO_COLORS = { simulado: 'green', pendiente: 'yellow', cancelado: 'gray' };

function StepBadge({ estado }) {
  const labels = { simulado: 'Simulado ✓', pendiente: 'Pendiente', cancelado: 'Cancelado' };
  return <Badge color={ESTADO_COLORS[estado] || 'gray'}>{labels[estado] || estado}</Badge>;
}

function SecuenciaStep({ step, isLast }) {
  return (
    <div style={{ display: 'flex', gap: 12, alignItems: 'flex-start' }}>
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
        <div style={{
          width: 32, height: 32, borderRadius: '50%',
          background: step.estado === 'simulado' ? '#dcfce7' : step.estado === 'pendiente' ? '#fef3c7' : '#f3f4f6',
          border: `2px solid ${step.estado === 'simulado' ? '#16a34a' : step.estado === 'pendiente' ? '#d97706' : '#d1d5db'}`,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: 14, fontWeight: 700, color: step.estado === 'simulado' ? '#15803d' : '#374151', flexShrink: 0,
        }}>
          {step.estado === 'simulado' ? '✓' : step.paso}
        </div>
        {!isLast && <div style={{ width: 2, height: 32, background: '#e5e7eb', marginTop: 4 }} />}
      </div>
      <div style={{ flex: 1, paddingBottom: isLast ? 0 : 16 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 8 }}>
          <div>
            <div style={{ fontWeight: 600, fontSize: 14, color: '#111827' }}>
              {TIPO_ICONS[step.tipo] || '📨'} {step.tipo}
            </div>
            <div style={{ fontSize: 13, color: '#4b5563', marginTop: 2 }}>"{step.asunto}"</div>
            <div style={{ fontSize: 12, color: '#9ca3af', marginTop: 2 }}>Envío: {step.delay}</div>
          </div>
          <StepBadge estado={step.estado} />
        </div>
      </div>
    </div>
  );
}

function LeadCard({ lead }) {
  const [expanded, setExpanded] = useState(false);
  const [simulated, setSimulated] = useState(lead.estado_recuperacion === 'recuperado');

  const colorMap  = { en_proceso: 'blue', recuperado: 'green', perdido: 'gray' };
  const labelMap  = { en_proceso: 'En proceso', recuperado: 'Recuperado ✓', perdido: 'Perdido' };

  return (
    <Card padding="0" style={{ marginBottom: 16 }}>
      <div
        style={{ padding: '16px 20px', cursor: 'pointer', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 12 }}
        onClick={() => setExpanded(e => !e)}
      >
        <div style={{ flex: 1 }}>
          <div style={{ display: 'flex', gap: 10, alignItems: 'center', flexWrap: 'wrap' }}>
            <span style={{ fontWeight: 700, fontSize: 15, color: '#111827' }}>{lead.nombre}</span>
            <Badge color={colorMap[lead.estado_recuperacion] || 'gray'}>{labelMap[lead.estado_recuperacion] || lead.estado_recuperacion}</Badge>
            <FicticioLabel />
          </div>
          <div style={{ marginTop: 6, fontSize: 13, color: '#6b7280' }}>
            🩺 {lead.servicio} · Abandono en: {lead.paso_abandono}
          </div>
          <div style={{ fontSize: 12, color: '#9ca3af', marginTop: 2 }}>Fecha detección: {lead.fecha}</div>
        </div>
        <div style={{ display: 'flex', gap: 10, alignItems: 'center', flexShrink: 0 }}>
          <span style={{ fontSize: 12, color: '#9ca3af' }}>{lead.secuencia.length} pasos</span>
          <span style={{ fontSize: 20 }}>{expanded ? '▲' : '▼'}</span>
        </div>
      </div>

      {expanded && (
        <div style={{ borderTop: '1px solid #f3f4f6', padding: '16px 20px' }}>
          <h4 style={{ margin: '0 0 12px', fontSize: 14, fontWeight: 700, color: '#111827' }}>
            Secuencia de recuperación simulada
          </h4>
          {lead.secuencia.map((step, idx) => (
            <SecuenciaStep key={step.paso} step={step} isLast={idx === lead.secuencia.length - 1} />
          ))}

          <div style={{ padding: '12px 14px', background: '#fff7ed', border: '1px solid #fed7aa', borderRadius: 8, marginTop: 12, marginBottom: 12, fontSize: 13, color: '#92400e' }}>
            ⚠️ Esta secuencia es una simulación visual. <strong>No se ha enviado ningún email, SMS ni notificación real.</strong> Demo interna · No conectado a sistemas reales.
          </div>

          <div style={{ display: 'flex', gap: 10 }}>
            {!simulated && (
              <button
                onClick={() => setSimulated(true)}
                style={{ padding: '8px 16px', background: '#2563eb', color: '#fff', border: 'none', borderRadius: 8, cursor: 'pointer', fontWeight: 700, fontSize: 13 }}
              >
                ▶ Simular envío completo
              </button>
            )}
            {simulated && (
              <div style={{ padding: '8px 16px', background: '#dcfce7', border: '1px solid #86efac', borderRadius: 8, fontSize: 13, color: '#15803d', fontWeight: 700 }}>
                ✓ Secuencia simulada completada · Sin envíos reales
              </div>
            )}
          </div>
        </div>
      )}
    </Card>
  );
}

export function PhysioRecovery() {
  const recuperados = MOCK_LEADS_ABANDONO_FISIO.filter(l => l.estado_recuperacion === 'recuperado').length;
  const total = MOCK_LEADS_ABANDONO_FISIO.length;

  return (
    <div>
      <div style={{ marginBottom: 20 }}>
        <h2 style={{ fontSize: 20, fontWeight: 800, color: '#111827', margin: '0 0 4px' }}>🔄 Recuperación de leads</h2>
        <p style={{ margin: 0, fontSize: 14, color: '#6b7280' }}>Secuencias de recuperación fisioterapia · Sin envíos reales · Datos ficticios</p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: 12, marginBottom: 20 }}>
        {[
          { label: 'Abandonos detectados', value: total, icon: '⚠️' },
          { label: 'Recuperados',          value: recuperados, icon: '✅', color: '#059669' },
          { label: 'Tasa recuperación',    value: `${Math.round((recuperados / total) * 100)}%`, icon: '📈', color: '#2563eb', ficticio: true },
          { label: 'Valor recuperado est.',value: '570 €', icon: '💰', color: '#d97706', ficticio: true },
        ].map(s => (
          <div key={s.label} style={{ background: '#fff', borderRadius: 10, border: '1px solid #e5e7eb', padding: '14px 16px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
              <span style={{ fontSize: 12, color: '#6b7280' }}>{s.label}</span>
              <span style={{ fontSize: 18 }}>{s.icon}</span>
            </div>
            <div style={{ fontSize: 22, fontWeight: 800, color: s.color || '#111827' }}>{s.value}</div>
            {s.ficticio && <FicticioLabel />}
          </div>
        ))}
      </div>

      {MOCK_LEADS_ABANDONO_FISIO.map(lead => (
        <LeadCard key={lead.id} lead={lead} />
      ))}

      <Card title="Caso de prueba: Abandono y recuperación de lead" padding="16px" style={{ background: '#f0f9ff', border: '1px solid #bae6fd' }}>
        <p style={{ margin: '0 0 12px', fontSize: 13, color: '#0369a1', lineHeight: 1.6 }}>
          Caso de prueba obligatorio <strong>#6 — Abandono y recuperación</strong>.<br />
          El sistema detecta abandono en la selección de profesional y activa una secuencia escalonada de recuperación (inmediato → 12h → 3 días).
          <strong> Ningún paso envía mensajes reales.</strong>
        </p>
        <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', fontSize: 13 }}>
          <span style={{ padding: '4px 10px', background: '#dbeafe', borderRadius: 20, color: '#1d4ed8', fontWeight: 600 }}>Abandono detectado ✓</span>
          <span style={{ padding: '4px 10px', background: '#dcfce7', borderRadius: 20, color: '#15803d', fontWeight: 600 }}>Sin envíos externos ✓</span>
          <span style={{ padding: '4px 10px', background: '#f3f4f6', borderRadius: 20, color: '#374151', fontWeight: 600 }}>Datos ficticios ✓</span>
        </div>
      </Card>
    </div>
  );
}
