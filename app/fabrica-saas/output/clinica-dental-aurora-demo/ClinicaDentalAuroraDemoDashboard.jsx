/**
 * OUTPUT GENERADO · Clínica Dental Aurora (Demo) · Dashboard V1.5
 * Generado por Fábrica SaaS V1.5 · create-client.mjs
 * NO editar manualmente — regenerar: npm run factory:create:clinica-dental-aurora-demo
 * Datos 100% ficticios. Sin llamadas externas reales.
 */
import { MOCK_METRICAS, MOCK_LEADS_ABANDONO } from './ClinicaDentalAuroraDemoMockData.js';
import { HeroSection, MetricGrid, StatCard, Card, TimelineItem } from '../../core/AppShell.jsx';

const ACCENT = "#0c7873";

function BarChart({ data, labelKey = 'sede', valueKey = 'consultas', color: c = ACCENT }) {
  const max = Math.max(...data.map(d => d[valueKey] ?? 0), 1);
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
      {data.map((d, i) => (
        <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <span style={{ width: 100, fontSize: 12, color: '#374151', flexShrink: 0 }}>{d[labelKey]}</span>
          <div style={{ flex: 1, background: '#f1f5f9', borderRadius: 4, height: 10, overflow: 'hidden' }}>
            <div style={{ width: ((d[valueKey] ?? 0) / max * 100) + '%', background: c, height: '100%', borderRadius: 4 }} />
          </div>
          <span style={{ fontSize: 12, color: '#64748b', width: 28, textAlign: 'right' }}>{d[valueKey]}</span>
        </div>
      ))}
    </div>
  );
}

const TIMELINE_ITEMS = [
  { icon: '🦷', title: 'Nueva cita confirmada', sub: 'Ana García · Ortodoncia', date: 'Hoy 09:15', color: ACCENT },
  { icon: '💼', title: 'Presupuesto aceptado', sub: 'Carlos López · Implante x2 · 3.600 €', date: 'Hoy 10:32', color: '#059669' },
  { icon: '🔄', title: 'Lead recuperado', sub: 'María Rodríguez via WhatsApp', date: 'Hoy 11:00', color: '#d97706' },
  { icon: '📅', title: 'Cita cancelada por paciente', sub: 'Pedro Moreno · Revisión 16:30', date: 'Hoy 14:20', color: '#dc2626' },
  { icon: '✅', title: 'Tratamiento completado', sub: 'Laura Sánchez · Endodoncia', date: 'Ayer 17:00', color: '#7c3aed' },
];

export function ClinicaDentalAuroraDemoDashboard() {
  const m = MOCK_METRICAS;
  const leadsActivos = MOCK_LEADS_ABANDONO.filter(l => l.estado !== 'recuperado').slice(0, 3);
  return (
    <div>
      <HeroSection
        color={ACCENT}
        badge="📊 Resumen del mes"
        title="Dashboard · Clínica Dental Aurora (Demo)"
        subtitle="Vista ejecutiva de actividad, ingresos y leads activos. Datos 100% ficticios."
      />

      <MetricGrid cols={4}>
        <StatCard label="Citas hoy" value={m.citas_hoy ?? 12} icon="📅" color={ACCENT} sub="programadas" trend="+3" trendUp={true} />
        <StatCard label="Nuevos pacientes" value={m.nuevos_pacientes ?? 8} icon="👥" color="#059669" sub="este mes" trend="+12%" trendUp={true} />
        <StatCard label="Ingresos mes" value={m.ingresos_mes} icon="💰" color="#7c3aed" sub="estimado" />
        <StatCard label="Tasa conversión" value={m.tasa_conversion + '%'} icon="📈" color="#d97706" sub="leads → cita" trend="+2%" trendUp={true} />
      </MetricGrid>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20, marginBottom: 20 }}>
        {m.por_sede && m.por_sede.length > 0 && (
          <Card title="Actividad por sede" subtitle="Consultas este mes (ficticio)">
            <BarChart data={m.por_sede} labelKey="sede" valueKey="consultas" />
          </Card>
        )}

        <Card title="Actividad reciente" subtitle="Últimas acciones del sistema">
          {TIMELINE_ITEMS.map((item, i) => (
            <TimelineItem key={i} {...item} last={i === TIMELINE_ITEMS.length - 1} />
          ))}
        </Card>
      </div>

      {leadsActivos.length > 0 && (
        <Card title="Leads activos" subtitle="Requieren atención inmediata (ficticio)" style={{ marginBottom: 16 }}>
          {leadsActivos.map(lead => (
            <div key={lead.id} style={{
              display: 'flex', alignItems: 'center', justifyContent: 'space-between',
              padding: '10px 0', borderBottom: '1px solid #f1f5f9',
            }}>
              <div>
                <div style={{ fontWeight: 600, fontSize: 13, color: '#0f172a' }}>{lead.nombre}</div>
                <div style={{ fontSize: 12, color: '#64748b', marginTop: 2 }}>{lead.email} · {lead.fuente ?? 'web'}</div>
              </div>
              <span style={{
                padding: '3px 10px', borderRadius: 20, fontSize: 11, fontWeight: 700,
                background: '#fef3c7', color: '#92400e',
              }}>Pendiente</span>
            </div>
          ))}
        </Card>
      )}

      <p style={{ fontSize: 11, color: '#94a3b8', marginTop: 8, textAlign: 'center' }}>
        Todos los datos mostrados son 100% ficticios. Prototipo generado por Fábrica SaaS V1.5.
      </p>
    </div>
  );
}
