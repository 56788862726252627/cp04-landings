/**
 * OUTPUT · Despacho Abogados Demo · Dashboard
 * Diferenciadores: facturación, expedientes activos, tareas próximas, campañas.
 * Sin fetch. Sin secretos. Datos 100% ficticios.
 */
import { MOCK_METRICAS_ABOGADOS, MOCK_TAREAS_PROXIMAS } from '../../verticals/abogados/mockData.js';
import { ABOGADOS_VERTICAL } from '../../verticals/abogados/config.js';

const URGENCIA_COLOR = { alta: '#ef4444', media: '#f59e0b', baja: '#22c55e' };

function MetricCard({ icon, label, value, sub, accent = '#2563eb' }) {
  return (
    <div style={{
      background: '#fff', border: '1px solid #e5e7eb',
      borderRadius: 10, padding: '14px 16px',
    }}>
      <div style={{ fontSize: 22, marginBottom: 4 }}>{icon}</div>
      <div style={{ fontSize: 22, fontWeight: 800, color: accent }}>{value}</div>
      <div style={{ fontSize: 12, color: '#374151', fontWeight: 600 }}>{label}</div>
      {sub && <div style={{ fontSize: 11, color: '#9ca3af', marginTop: 2 }}>{sub}</div>}
    </div>
  );
}

function BarChart({ datos, campo, labelKey, label, color = '#2563eb' }) {
  const max = Math.max(...datos.map(d => d[campo]), 1);
  return (
    <div>
      <div style={{ fontSize: 13, fontWeight: 700, color: '#374151', marginBottom: 10 }}>{label}</div>
      {datos.map((d, i) => {
        const pct = Math.round((d[campo] / max) * 100);
        return (
          <div key={i} style={{ marginBottom: 8 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, marginBottom: 3 }}>
              <span style={{ color: '#374151' }}>{d[labelKey]}</span>
              <span style={{ color: '#6b7280', fontWeight: 600 }}>{d[campo]}</span>
            </div>
            <div style={{ background: '#f3f4f6', borderRadius: 4, height: 8 }}>
              <div style={{ width: `${pct}%`, background: color, borderRadius: 4, height: 8, transition: 'width 0.4s' }} />
            </div>
          </div>
        );
      })}
    </div>
  );
}

function CampanaCard({ campana }) {
  return (
    <div style={{
      background: campana.activa ? '#f0fdf4' : '#f9fafb',
      border: `1px solid ${campana.activa ? '#86efac' : '#e5e7eb'}`,
      borderRadius: 10, padding: '12px 14px',
      display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 10,
    }}>
      <div>
        <div style={{ fontWeight: 700, fontSize: 13, color: '#111827' }}>
          {campana.activa ? '🟢 ' : '⚫ '}{campana.titulo}
        </div>
        <div style={{ fontSize: 12, color: '#6b7280', marginTop: 2 }}>{campana.descripcion}</div>
      </div>
      {campana.activa && (
        <div style={{ textAlign: 'right', flexShrink: 0 }}>
          <div style={{ fontSize: 18, fontWeight: 800, color: '#16a34a' }}>{campana.leads_generados}</div>
          <div style={{ fontSize: 10, color: '#9ca3af' }}>leads</div>
        </div>
      )}
    </div>
  );
}

function TareaRow({ tarea }) {
  return (
    <div style={{
      background: '#fff', border: '1px solid #e5e7eb', borderRadius: 8, padding: '10px 14px',
      borderLeft: `3px solid ${URGENCIA_COLOR[tarea.urgencia] ?? '#e5e7eb'}`,
    }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', gap: 6 }}>
        <div>
          <div style={{ fontWeight: 600, fontSize: 13, color: '#111827' }}>{tarea.tarea}</div>
          <div style={{ fontSize: 11, color: '#6b7280', marginTop: 2 }}>
            {tarea.expediente} · {tarea.abogado}
          </div>
        </div>
        <div style={{ fontSize: 12, color: '#374151', fontWeight: 600 }}>🗓️ {tarea.fecha}</div>
      </div>
    </div>
  );
}

export function AbogadosDashboard() {
  const m = MOCK_METRICAS_ABOGADOS;

  return (
    <div style={{ padding: 20 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
        <h2 style={{ margin: 0, fontSize: 18, fontWeight: 700, color: '#111827' }}>Dashboard · Abogados</h2>
        <span style={{ fontSize: 11, color: '#9ca3af', background: '#f3f4f6', padding: '3px 8px', borderRadius: 12 }}>
          Datos ficticios · agosto 2026
        </span>
      </div>

      {/* Métricas principales */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 10, marginBottom: 20 }}>
        <MetricCard icon="💬" label="Consultas / mes"       value={m.consultas_mes}               accent="#2563eb" />
        <MetricCard icon="📂" label="Expedientes activos"   value={m.expedientes_activos}          accent="#7c3aed" />
        <MetricCard icon="✅" label="Conversión consulta"   value={`${m.tasa_conversion_consulta}%`} accent="#16a34a" />
        <MetricCard icon="🔄" label="Leads recuperados"     value={m.oportunidades_recuperadas}    accent="#0891b2" />
        <MetricCard icon="💰" label="Pipeline total"        value={m.valor_pipeline}              accent="#9333ea" sub="ficticio" />
        <MetricCard icon="💳" label="Facturación / mes"     value={m.facturacion_mes}             accent="#d97706" sub="ficticio" />
      </div>

      {/* Gráficos */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 20 }}>
        <div style={{ background: '#fff', border: '1px solid #e5e7eb', borderRadius: 10, padding: 16 }}>
          <BarChart datos={m.por_area} campo="casos" labelKey="area" label="Casos por área" color="#7c3aed" />
        </div>
        <div style={{ background: '#fff', border: '1px solid #e5e7eb', borderRadius: 10, padding: 16 }}>
          <BarChart datos={m.por_abogado} campo="expedientes" labelKey="abogado" label="Expedientes por abogado" color="#2563eb" />
        </div>
      </div>

      <div style={{ background: '#fff', border: '1px solid #e5e7eb', borderRadius: 10, padding: 16, marginBottom: 20 }}>
        <BarChart datos={m.por_fase} campo="casos" labelKey="fase" label="Casos por fase procesal" color="#0891b2" />
      </div>

      {/* Tareas próximas — diferenciador abogados */}
      <div style={{ background: '#fff', border: '1px solid #e5e7eb', borderRadius: 10, padding: 16, marginBottom: 20 }}>
        <div style={{ fontWeight: 700, fontSize: 14, color: '#374151', marginBottom: 12 }}>
          📌 Próximas actuaciones (simuladas)
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          {MOCK_TAREAS_PROXIMAS.map(t => (
            <TareaRow key={t.id} tarea={t} />
          ))}
        </div>
        <p style={{ margin: '12px 0 0', fontSize: 11, color: '#9ca3af' }}>
          ⚠️ Actuaciones ficticias · Expedientes de demostración · No conectado a juzgados reales
        </p>
      </div>

      {/* Campañas — diferenciador activo en abogados */}
      <div style={{ background: '#fff', border: '1px solid #e5e7eb', borderRadius: 10, padding: 16 }}>
        <div style={{ fontWeight: 700, fontSize: 14, color: '#374151', marginBottom: 12 }}>
          🎯 Campañas de captación (simuladas)
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          {ABOGADOS_VERTICAL.campanas.map(c => (
            <CampanaCard key={c.id} campana={c} />
          ))}
        </div>
        <p style={{ margin: '12px 0 0', fontSize: 11, color: '#9ca3af' }}>
          ⚠️ Campañas ficticias · Solo para demostración del módulo · Sin envíos reales
        </p>
      </div>
    </div>
  );
}
