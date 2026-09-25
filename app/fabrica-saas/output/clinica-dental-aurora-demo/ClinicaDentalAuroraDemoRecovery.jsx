/**
 * OUTPUT GENERADO · Clínica Dental Aurora (Demo) · Recuperación de leads
 * Generado por Fábrica SaaS V1.2 · create-client.mjs
 * NO editar manualmente — regenerar: npm run factory:create:clinica-dental-aurora-demo
 * Datos 100% ficticios. Sin llamadas externas reales.
 */
import { useState } from 'react';
import { MOCK_LEADS_ABANDONO } from './ClinicaDentalAuroraDemoMockData.js';

const ESTADO_COLOR = {
  en_proceso: { bg: '#fef9c3', text: '#a16207', label: 'En proceso' },
  recuperado: { bg: '#d1fae5', text: '#065f46', label: 'Recuperado' },
  perdido:    { bg: '#fee2e2', text: '#991b1b', label: 'Perdido' },
};

function DiasBadge({ dias }) {
  const color = dias >= 14 ? '#ef4444' : dias >= 7 ? '#f59e0b' : '#22c55e';
  return (
    <span style={{
      padding: '2px 8px', borderRadius: 12, fontSize: 11, fontWeight: 600,
      background: color + '22', color,
    }}>
      {dias}d inactivo
    </span>
  );
}

export function ClinicaDentalAuroraDemoRecovery() {
  const [leads, setLeads] = useState(MOCK_LEADS_ABANDONO.map(l => ({ ...l })));
  const [loading, setLoading] = useState(null);

  const simularAccion = (id) => {
    setLoading(id);
    setTimeout(() => {
      setLeads(prev => prev.map(l => l.id === id ? { ...l, estado: 'recuperado' } : l));
      setLoading(null);
    }, 1200);
  };

  const pendientes = leads.filter(l => l.estado !== 'recuperado' && l.estado !== 'perdido');
  const recuperados = leads.filter(l => l.estado === 'recuperado');

  return (
    <div style={{ padding: 20 }}>
      <h2 style={{ margin: '0 0 4px', fontSize: 16, fontWeight: 700, color: '#111827' }}>
        Recuperación de Leads
      </h2>
      <p style={{ margin: '0 0 16px', fontSize: 12, color: '#6b7280' }}>
        Clínica Dental Aurora (Demo) · {pendientes.length} leads pendientes · {recuperados.length} recuperados
      </p>

      {leads.map(lead => {
        const ec = ESTADO_COLOR[lead.estado] ?? { bg: '#f3f4f6', text: '#374151', label: lead.estado };
        const isLoading = loading === lead.id;
        const isRecup = lead.estado === 'recuperado';
        return (
          <div
            key={lead.id}
            style={{
              background: '#fff', border: '1px solid #e5e7eb', borderRadius: 10,
              padding: '12px 16px', marginBottom: 10,
              borderLeft: isRecup ? '3px solid #16a34a' : undefined,
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 8, flexWrap: 'wrap' }}>
              <div>
                <div style={{ fontWeight: 600, fontSize: 14, color: '#111827' }}>{lead.nombre}</div>
                <div style={{ fontSize: 12, color: '#6b7280', marginTop: 2 }}>
                  {lead.tratamiento} · {lead.email}
                </div>
                <div style={{ marginTop: 6, display: 'flex', gap: 8, flexWrap: 'wrap', alignItems: 'center' }}>
                  <DiasBadge dias={lead.dias_inactivo} />
                  <span style={{
                    padding: '2px 8px', borderRadius: 12, fontSize: 11, fontWeight: 600,
                    background: ec.bg, color: ec.text,
                  }}>
                    {ec.label}
                  </span>
                </div>
                <div style={{ fontSize: 12, color: '#374151', marginTop: 6, fontStyle: 'italic' }}>
                  💡 {lead.accion_sugerida}
                </div>
              </div>
              {!isRecup && (
                <button
                  onClick={() => simularAccion(lead.id)}
                  disabled={isLoading}
                  style={{
                    padding: '6px 14px', background: isLoading ? '#e5e7eb' : '#2563eb',
                    color: isLoading ? '#9ca3af' : '#fff', border: 'none', borderRadius: 8,
                    fontSize: 12, fontWeight: 600, cursor: isLoading ? 'not-allowed' : 'pointer',
                    flexShrink: 0,
                  }}
                >
                  {isLoading ? 'Enviando...' : 'Simular acción'}
                </button>
              )}
              {isRecup && (
                <span style={{ fontSize: 13, color: '#16a34a', fontWeight: 700 }}>✓ Recuperado</span>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}
