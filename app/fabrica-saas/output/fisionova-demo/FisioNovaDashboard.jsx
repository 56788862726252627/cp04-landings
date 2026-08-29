/**
 * OUTPUT GENERADO · FisioNova (Demo) · Dashboard Analytics V1.7
 * Fábrica SaaS V1.7 · Demo comercial · Datos ficticios
 */
import { useState } from 'react';
import { DASHBOARD_STATS, ACTIVIDAD_RECIENTE, CITAS_HOY } from './FisioNovaMockData.js';

const C = { primary: '#4338ca', secondary: '#059669', accent: '#7c3aed', bg: '#eef2ff', border: '#e0e7ff', text: '#1e1b4b', muted: '#6b7280', white: '#ffffff' };

function StatCard({ label, valor, meta, color = C.primary, icon, subLabel }) {
  const pct = meta ? Math.round((typeof valor === 'number' ? valor : parseFloat(valor)) / meta * 100) : null;
  return (
    <div style={{ background: C.white, borderRadius: '1rem', padding: '1.25rem', border: `1.5px solid ${C.border}` }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.75rem' }}>
        <span style={{ fontSize: '0.78rem', fontWeight: 600, color: C.muted, textTransform: 'uppercase' }}>{label}</span>
        <span style={{ fontSize: '1.5rem' }}>{icon}</span>
      </div>
      <div style={{ fontSize: '2.25rem', fontWeight: 900, color, lineHeight: 1 }}>{typeof valor === 'number' ? valor : valor}</div>
      {subLabel && <div style={{ fontSize: '0.78rem', color: C.muted, marginTop: '0.25rem' }}>{subLabel}</div>}
      {meta && (
        <div style={{ marginTop: '0.75rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.72rem', color: C.muted, marginBottom: '0.3rem' }}>
            <span>Meta: {meta}</span><span>{pct}%</span>
          </div>
          <div style={{ height: '4px', background: '#e0e7ff', borderRadius: '999px' }}>
            <div style={{ height: '100%', width: `${Math.min(100, pct)}%`, background: color, borderRadius: '999px', transition: 'width 0.6s ease' }} />
          </div>
        </div>
      )}
    </div>
  );
}

function BarChart({ data, title, color = C.primary }) {
  const max = Math.max(...data.map(d => d.val), 1);
  return (
    <div style={{ background: C.white, borderRadius: '1rem', padding: '1.25rem', border: `1.5px solid ${C.border}` }}>
      <h3 style={{ fontSize: '0.9rem', fontWeight: 700, color: C.text, marginBottom: '1.25rem' }}>{title}</h3>
      <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'flex-end', height: '100px' }}>
        {data.map((d, i) => (
          <div key={i} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.35rem' }}>
            <span style={{ fontSize: '0.68rem', fontWeight: 700, color }}>{d.val}</span>
            <div style={{ width: '100%', background: `${color}20`, borderRadius: '0.25rem 0.25rem 0 0', height: `${(d.val / max) * 80}px`, position: 'relative', overflow: 'hidden' }}>
              <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, background: color, height: '100%', borderRadius: '0.25rem 0.25rem 0 0', animation: 'growUp 0.6s ease forwards' }} />
            </div>
            <span style={{ fontSize: '0.65rem', color: C.muted }}>{d.label}</span>
          </div>
        ))}
      </div>
      <style>{`@keyframes growUp { from { height: 0 } to { height: 100% } }`}</style>
    </div>
  );
}

function DonutChart({ pct, label, color = C.primary, size = 100 }) {
  const r = (size - 16) / 2;
  const circ = 2 * Math.PI * r;
  const dash = (pct / 100) * circ;
  return (
    <div style={{ textAlign: 'center' }}>
      <svg width={size} height={size}>
        <circle cx={size/2} cy={size/2} r={r} fill="none" stroke="#e0e7ff" strokeWidth="12" />
        <circle cx={size/2} cy={size/2} r={r} fill="none" stroke={color} strokeWidth="12"
          strokeDasharray={`${dash} ${circ}`} strokeLinecap="round"
          transform={`rotate(-90 ${size/2} ${size/2})`} style={{ transition: 'stroke-dasharray 0.8s ease' }} />
        <text x={size/2} y={size/2 - 4} textAnchor="middle" fontSize="16" fontWeight="900" fill={color}>{pct}%</text>
        <text x={size/2} y={size/2 + 14} textAnchor="middle" fontSize="9" fill={C.muted}>{label}</text>
      </svg>
    </div>
  );
}

export function FisioNovaDashboard() {
  const [periodo, setPeriodo] = useState('semana');

  const citasSemana = [
    { label: 'Lun', val: 8 }, { label: 'Mar', val: 11 }, { label: 'Mié', val: 9 },
    { label: 'Jue', val: 10 }, { label: 'Vie', val: 12 }, { label: 'Sáb', val: 5 },
  ];
  const nuevos7dias = [
    { label: 'L', val: 1 }, { label: 'M', val: 2 }, { label: 'X', val: 0 },
    { label: 'J', val: 1 }, { label: 'V', val: 1 }, { label: 'S', val: 0 },
  ];

  const distribución = [
    { label: 'Deportiva', pct: 35, color: C.primary },
    { label: 'Rehab.', pct: 28, color: C.secondary },
    { label: 'Manual', pct: 22, color: C.accent },
    { label: 'Otros', pct: 15, color: '#d97706' },
  ];

  return (
    <div style={{ padding: '1.5rem', maxWidth: '1200px', margin: '0 auto' }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h1 style={{ fontSize: '1.5rem', fontWeight: 800, color: C.text }}>Dashboard</h1>
          <p style={{ color: C.muted, fontSize: '0.9rem' }}>Resumen operativo · Todos los datos son ficticios (demo)</p>
        </div>
        <div style={{ display: 'flex', gap: '0.5rem' }}>
          {['hoy', 'semana', 'mes'].map(p => (
            <button key={p} onClick={() => setPeriodo(p)}
              style={{ padding: '0.5rem 1rem', borderRadius: '0.5rem', border: `1.5px solid ${periodo === p ? C.primary : C.border}`, background: periodo === p ? C.primary : C.white, color: periodo === p ? '#fff' : C.muted, fontWeight: 600, cursor: 'pointer', fontSize: '0.82rem', textTransform: 'capitalize' }}>
              {p === 'hoy' ? 'Hoy' : p === 'semana' ? 'Semana' : 'Mes'}
            </button>
          ))}
        </div>
      </div>

      {/* KPIs principales */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '1rem', marginBottom: '1.5rem' }}>
        <StatCard label="Citas hoy" valor={DASHBOARD_STATS.citasHoy.valor} meta={DASHBOARD_STATS.citasHoy.meta} color={C.primary} icon="📅" />
        <StatCard label="Pacientes activos" valor={DASHBOARD_STATS.pacientesActivos.valor} meta={DASHBOARD_STATS.pacientesActivos.meta} color={C.secondary} icon="👥" />
        <StatCard label="Ocupación semana" valor={`${DASHBOARD_STATS.ocupacionSemana.valor}%`} color={C.accent} icon="📊" subLabel="Meta: 90%" />
        <StatCard label="Ingresos (demo)" valor={DASHBOARD_STATS.ingresosDemo.valor} color="#d97706" icon="💶" subLabel="Esta semana · Dato ficticio" />
        <StatCard label="Tasa recuperación" valor={`${DASHBOARD_STATS.tasaRecuperacion.valor}%`} color={C.secondary} icon="✅" subLabel="Últimos 90 días" />
        <StatCard label="Nuevos pacientes" valor={DASHBOARD_STATS.nuevosPacientes.valor} color={C.primary} icon="🆕" subLabel="Esta semana" />
        <StatCard label="Cancelaciones" valor={DASHBOARD_STATS.cancelaciones.valor} color="#dc2626" icon="❌" subLabel="Esta semana" />
        <StatCard label="Leads pendientes" valor={DASHBOARD_STATS.leadsNuevos.valor} color={C.accent} icon="🎯" subLabel="Sin contactar" />
      </div>

      {/* Gráficos */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '1.25rem', marginBottom: '1.5rem' }}>
        <BarChart data={citasSemana} title="📅 Citas por día — esta semana" color={C.primary} />
        <BarChart data={nuevos7dias} title="🆕 Nuevos pacientes — últimos 7 días" color={C.secondary} />

        {/* Distribución por servicio */}
        <div style={{ background: C.white, borderRadius: '1rem', padding: '1.25rem', border: `1.5px solid ${C.border}` }}>
          <h3 style={{ fontSize: '0.9rem', fontWeight: 700, color: C.text, marginBottom: '1.25rem' }}>🩺 Distribución por servicio</h3>
          <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center', flexWrap: 'wrap' }}>
            {distribución.map(d => <DonutChart key={d.label} pct={d.pct} label={d.label} color={d.color} size={90} />)}
          </div>
        </div>

        {/* Estado de hoy */}
        <div style={{ background: C.white, borderRadius: '1rem', padding: '1.25rem', border: `1.5px solid ${C.border}` }}>
          <h3 style={{ fontSize: '0.9rem', fontWeight: 700, color: C.text, marginBottom: '1rem' }}>📋 Estado citas de hoy</h3>
          {[
            { label: 'Confirmadas', val: CITAS_HOY.filter(c => c.estado === 'confirmada').length, color: C.secondary },
            { label: 'Completadas', val: CITAS_HOY.filter(c => c.estado === 'completada').length, color: C.primary },
            { label: 'Pendientes', val: CITAS_HOY.filter(c => c.estado === 'pendiente').length, color: '#d97706' },
            { label: 'No presentados', val: CITAS_HOY.filter(c => c.estado === 'noShow').length, color: '#dc2626' },
          ].map(({ label, val, color }) => (
            <div key={label} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0.5rem 0', borderBottom: `1px solid ${C.border}` }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <div style={{ width: '0.5rem', height: '0.5rem', borderRadius: '50%', background: color }} />
                <span style={{ fontSize: '0.85rem', color: C.text }}>{label}</span>
              </div>
              <span style={{ fontWeight: 800, color }}>{val}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Actividad reciente */}
      <div style={{ background: C.white, borderRadius: '1rem', padding: '1.25rem', border: `1.5px solid ${C.border}` }}>
        <h3 style={{ fontSize: '0.9rem', fontWeight: 700, color: C.text, marginBottom: '1rem' }}>🔔 Actividad reciente (demo)</h3>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0' }}>
          {ACTIVIDAD_RECIENTE.map((a, i) => (
            <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '1rem', padding: '0.75rem 0', borderBottom: i < ACTIVIDAD_RECIENTE.length - 1 ? `1px solid ${C.border}` : 'none' }}>
              <span style={{ fontSize: '1.25rem' }}>{a.icon}</span>
              <div style={{ flex: 1 }}>
                <p style={{ fontSize: '0.85rem', color: C.text }}>{a.texto}</p>
              </div>
              <span style={{ fontSize: '0.75rem', color: C.muted, flexShrink: 0 }}>{a.hace}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
