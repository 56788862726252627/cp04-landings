/**
 * OUTPUT GENERADO · Clínica Dental Málaga Demo · Dashboard
 * Generado por Fábrica SaaS V1.2 · create-client.mjs
 * NO editar manualmente — regenerar: npm run factory:create:clinica-dental-malaga-demo
 * Datos 100% ficticios. Sin llamadas externas reales.
 */
import { MOCK_METRICAS } from './ClinicaDentalMalagaDemoMockData.js';

const ACCENT = "#0d9488";

function MetricCard({ label, value, sub, accent }) {
  return (
    <div style={{
      background: '#fff', border: '1px solid #e5e7eb', borderRadius: 10,
      padding: '16px 20px', borderTop: '3px solid ' + (accent ?? ACCENT),
    }}>
      <div style={{ fontSize: 11, color: '#6b7280', marginBottom: 4 }}>{label}</div>
      <div style={{ fontSize: 22, fontWeight: 800, color: '#111827' }}>{value}</div>
      {sub && <div style={{ fontSize: 11, color: '#9ca3af', marginTop: 2 }}>{sub}</div>}
    </div>
  );
}

function BarChart({ data, labelKey = 'sede', valueKey = 'consultas', color: c = ACCENT }) {
  const max = Math.max(...data.map(d => d[valueKey] ?? 0), 1);
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
      {data.map((d, i) => (
        <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <span style={{ width: 90, fontSize: 12, color: '#374151', flexShrink: 0 }}>{d[labelKey]}</span>
          <div style={{ flex: 1, background: '#f3f4f6', borderRadius: 4, height: 10, overflow: 'hidden' }}>
            <div style={{ width: ((d[valueKey] ?? 0) / max * 100) + '%', background: c, height: '100%', borderRadius: 4 }} />
          </div>
          <span style={{ fontSize: 12, color: '#6b7280', width: 28, textAlign: 'right' }}>{d[valueKey]}</span>
        </div>
      ))}
    </div>
  );
}

export function ClinicaDentalMalagaDemoDashboard() {
  const m = MOCK_METRICAS;
  return (
    <div style={{ padding: 20 }}>
      <h2 style={{ margin: '0 0 16px', fontSize: 16, fontWeight: 700, color: '#111827' }}>
        Dashboard · Dental · <span style={{ fontWeight: 400, color: '#6b7280', fontSize: 13 }}>Clínica Dental Málaga Demo</span>
      </h2>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(160px, 1fr))', gap: 12, marginBottom: 20 }}>
        <MetricCard label="Consultas este mes" value={m.consultas_mes} sub="(ficticio)" />
        <MetricCard label="Tasa conversión" value={m.tasa_conversion + '%'} sub="(ficticio)" accent="#16a34a" />
        <MetricCard label="Valor pipeline" value={m.valor_pipeline} sub="estimado ficticio" accent="#7c3aed" />
        <MetricCard label="Ingresos mes" value={m.ingresos_mes} sub="(ficticio)" accent="#ea580c" />
      </div>

      {m.por_sede && m.por_sede.length > 0 && (
        <div style={{ background: '#fff', border: '1px solid #e5e7eb', borderRadius: 10, padding: '16px 20px', marginBottom: 16 }}>
          <div style={{ fontSize: 13, fontWeight: 600, color: '#374151', marginBottom: 12 }}>
            Consultas por sede (ficticio)
          </div>
          <BarChart data={m.por_sede} labelKey="sede" valueKey="consultas" />
        </div>
      )}

      <p style={{ fontSize: 11, color: '#9ca3af', marginTop: 8 }}>
        Todos los datos mostrados son ficticios y solo sirven para demostración del prototipo.
      </p>
    </div>
  );
}
