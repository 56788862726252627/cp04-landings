/**
 * OUTPUT · Clínica Fisioterapia Demo · Pantalla 4: Dashboard de métricas
 * Reutiliza CORE (Card, StatCard, FicticioLabel). Datos ficticios de fisioterapia.
 * CSS puro para gráficas. Sin librerías de charting ni llamadas externas.
 */
import { Card, StatCard, FicticioLabel } from '../../core/AppShell.jsx';
import { MOCK_METRICAS_FISIO } from '../../verticals/fisioterapia/mockData.js';

function BarChart({ data, valueKey, labelKey, color = '#2563eb' }) {
  const max = Math.max(...data.map(d => d[valueKey]));
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
      {data.map(d => (
        <div key={d[labelKey]}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4, fontSize: 13 }}>
            <span style={{ color: '#374151' }}>{d[labelKey]}</span>
            <span style={{ fontWeight: 700, color }}>{d[valueKey]}%</span>
          </div>
          <div style={{ height: 8, background: '#f3f4f6', borderRadius: 4, overflow: 'hidden' }}>
            <div style={{ height: '100%', width: `${(d[valueKey] / max) * 100}%`, background: color, borderRadius: 4, transition: 'width 0.4s ease' }} />
          </div>
        </div>
      ))}
    </div>
  );
}

function DonutSimple({ pct, color = '#2563eb', label }) {
  const r = 40;
  const circ = 2 * Math.PI * r;
  const dash = (pct / 100) * circ;
  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8 }}>
      <svg width={100} height={100} viewBox="0 0 100 100">
        <circle cx="50" cy="50" r={r} fill="none" stroke="#f3f4f6" strokeWidth="12" />
        <circle cx="50" cy="50" r={r} fill="none" stroke={color} strokeWidth="12"
          strokeDasharray={`${dash} ${circ - dash}`} strokeLinecap="round" transform="rotate(-90 50 50)" />
        <text x="50" y="56" textAnchor="middle" fontSize="16" fontWeight="800" fill={color}>{pct}%</text>
      </svg>
      <span style={{ fontSize: 12, color: '#6b7280', textAlign: 'center' }}>{label}</span>
    </div>
  );
}

function TrendBadge({ value, positive = true }) {
  return (
    <span style={{ fontSize: 11, padding: '2px 7px', borderRadius: 20, fontWeight: 700, background: positive ? '#dcfce7' : '#fee2e2', color: positive ? '#15803d' : '#991b1b' }}>
      {positive ? '↑' : '↓'} {value}
    </span>
  );
}

export function PhysioDashboard() {
  const m = MOCK_METRICAS_FISIO;

  return (
    <div>
      <div style={{ marginBottom: 20 }}>
        <h2 style={{ fontSize: 20, fontWeight: 800, color: '#111827', margin: '0 0 4px' }}>📊 Dashboard de métricas</h2>
        <p style={{ margin: 0, fontSize: 14, color: '#6b7280' }}>
          Métricas simuladas · Agosto 2026 <FicticioLabel /> · Solo datos ficticios de demo
        </p>
      </div>

      {/* KPIs */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 16, marginBottom: 24 }}>
        <StatCard label="Consultas del mes"   value={m.consultas_mes}              icon="💬" color="#2563eb" sub="Total de consultas" />
        <StatCard label="Precalificadas"       value={`${m.precalificadas_pct}%`}  icon="✅" color="#7c3aed" sub="Del total de consultas" />
        <StatCard label="Sesiones agendadas"   value={`${m.con_cita_pct}%`}        icon="📅" color="#059669" sub="Del total de consultas" />
        <StatCard label="Leads recuperados"    value={m.oportunidades_recuperadas}  icon="🔄" color="#d97706" sub="Este mes" />
        <StatCard label="Pipeline estimado"    value={m.valor_pipeline}             icon="💰" color="#dc2626" sub="Valor en negociación" />
      </div>

      {/* Gráficas */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 20, marginBottom: 24 }}>
        <Card title="Consultas por origen">
          <BarChart data={m.por_origen} valueKey="pct" labelKey="origen" color="#2563eb" />
          <div style={{ marginTop: 12, fontSize: 11, color: '#9ca3af' }}>Distribución porcentual · <FicticioLabel /></div>
        </Card>

        <Card title="Consultas por servicio">
          <BarChart data={m.por_servicio} valueKey="pct" labelKey="servicio" color="#7c3aed" />
          <div style={{ marginTop: 12, fontSize: 11, color: '#9ca3af' }}>Distribución porcentual · <FicticioLabel /></div>
        </Card>

        <Card title="Consultas por centro">
          <BarChart data={m.por_centro} valueKey="pct" labelKey="centro" color="#059669" />
          <div style={{ marginTop: 12, fontSize: 11, color: '#9ca3af' }}>Distribución porcentual · <FicticioLabel /></div>
        </Card>

        <Card title="Tasas de conversión">
          <div style={{ display: 'flex', justifyContent: 'space-around', padding: '10px 0' }}>
            <DonutSimple pct={m.precalificadas_pct} color="#7c3aed" label="Precalificación" />
            <DonutSimple pct={m.con_cita_pct} color="#059669" label="Sesión agendada" />
          </div>
          <div style={{ marginTop: 8, fontSize: 11, color: '#9ca3af', textAlign: 'center' }}>
            <FicticioLabel /> Datos simulados de demo
          </div>
        </Card>
      </div>

      {/* Métricas específicas fisio */}
      <Card title="Métrica específica fisioterapia" subtitle="Tasa de conversión primera valoración → bono/sesión regular">
        <div style={{ display: 'flex', alignItems: 'center', gap: 20, padding: '8px 0' }}>
          <div style={{ fontSize: 32, fontWeight: 800, color: '#059669' }}>{m.tasa_conversion_primera_valoracion}%</div>
          <div>
            <div style={{ fontSize: 13, color: '#374151' }}>De las primeras valoraciones gratuitas generan</div>
            <div style={{ fontSize: 13, color: '#374151' }}>un bono o sesión regular posterior.</div>
            <FicticioLabel />
          </div>
        </div>
      </Card>

      {/* Comparativa */}
      <Card title="Comparativa vs mes anterior" subtitle="Datos ficticios de demo — no representan resultados reales" style={{ marginTop: 20 }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: 16 }}>
          {[
            { label: 'Consultas',       actual: 38, anterior: 29, positive: true },
            { label: 'Precalificadas',  actual: '71%', anterior: '63%', positive: true },
            { label: 'Sesiones agend.', actual: '47%', anterior: '44%', positive: true },
            { label: 'Recuperaciones',  actual: 6, anterior: 4, positive: true },
          ].map(item => (
            <div key={item.label} style={{ padding: '12px 14px', background: '#f9fafb', borderRadius: 8 }}>
              <div style={{ fontSize: 12, color: '#6b7280', marginBottom: 6 }}>{item.label}</div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <span style={{ fontSize: 18, fontWeight: 800, color: '#111827' }}>{item.actual}</span>
                <TrendBadge value={`vs ${item.anterior}`} positive={item.positive} />
              </div>
              <FicticioLabel />
            </div>
          ))}
        </div>
      </Card>

      <div style={{ marginTop: 16, padding: '12px 16px', background: '#fef9c3', border: '1px solid #fde047', borderRadius: 8, fontSize: 12, color: '#713f12', textAlign: 'center' }}>
        📊 Todas las métricas y valores son <strong>datos ficticios</strong> generados para demo interna de la Fábrica SaaS.<br />
        No representan el rendimiento real de ninguna clínica, negocio ni proyecto.
      </div>
    </div>
  );
}
