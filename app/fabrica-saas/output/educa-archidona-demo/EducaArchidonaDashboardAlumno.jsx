/**
 * OUTPUT GENERADO · EducaArchidona (Demo) · Dashboard Alumno
 * Fabrica SaaS V1.8 · Education Vertical
 * Demo comercial · Datos 100% ficticios · NO produccion
 */
import { useState, useEffect } from 'react';
import {
  ALUMNO_DEMO, PROGRESO_MATERIAS, TAREAS_PENDIENTES,
  PROXIMOS_EXAMENES, INSIGNIAS,
} from './EducaArchidonaMockData.js';

/* ── progress ring SVG ────────────────────────────────────────── */
function ProgressRing({ value, color = '#1d4ed8', size = 80, stroke = 8 }) {
  const [animated, setAnimated] = useState(0);
  const r = (size - stroke) / 2;
  const circ = 2 * Math.PI * r;
  useEffect(() => {
    const t = setTimeout(() => setAnimated(value), 100);
    return () => clearTimeout(t);
  }, [value]);
  const dash = circ * (1 - animated / 100);
  return (
    <svg width={size} height={size} role="img" aria-label={`Progreso ${value}%`}>
      <circle cx={size/2} cy={size/2} r={r} fill="none" stroke="#e2e8f0" strokeWidth={stroke} />
      <circle cx={size/2} cy={size/2} r={r} fill="none" stroke={color} strokeWidth={stroke}
        strokeDasharray={circ} strokeDashoffset={dash}
        strokeLinecap="round"
        style={{ transform: 'rotate(-90deg)', transformOrigin: '50% 50%', transition: 'stroke-dashoffset 1s ease' }}
      />
      <text x="50%" y="50%" textAnchor="middle" dy=".35em"
        style={{ fontSize: size * 0.22, fontWeight: 700, fill: color }}>
        {animated}%
      </text>
    </svg>
  );
}

/* ── metric card ──────────────────────────────────────────────── */
function MetricCard({ icon, label, value, color = '#1d4ed8', sub }) {
  return (
    <div style={{
      background: '#fff', borderRadius: 14, padding: '20px 18px',
      boxShadow: '0 2px 12px rgba(0,0,0,.06)', textAlign: 'center',
      borderTop: `4px solid ${color}`,
    }}>
      <div style={{ fontSize: 28, marginBottom: 6 }}>{icon}</div>
      <div style={{ fontSize: 26, fontWeight: 800, color }}>{value}</div>
      <div style={{ fontSize: 12, color: '#64748b', marginTop: 2 }}>{label}</div>
      {sub && <div style={{ fontSize: 11, color: '#94a3b8', marginTop: 4 }}>{sub}</div>}
    </div>
  );
}

export function EducaArchidonaDashboardAlumno() {
  const promedioProgreso = Math.round(
    PROGRESO_MATERIAS.reduce((a, m) => a + m.progreso, 0) / PROGRESO_MATERIAS.length
  );
  const tareasUrgentes = TAREAS_PENDIENTES.filter(t => t.urgente).length;

  return (
    <div style={{ padding: 24, background: '#eff6ff', minHeight: '100vh' }}>
      {/* Header alumno */}
      <div style={{
        background: 'linear-gradient(135deg, #1d4ed8, #1e40af)',
        borderRadius: 16, padding: '24px 28px', color: '#fff', marginBottom: 24,
        display: 'flex', alignItems: 'center', gap: 20, flexWrap: 'wrap',
      }}>
        <div style={{ fontSize: 48 }}>{ALUMNO_DEMO.avatar}</div>
        <div>
          <div style={{ fontSize: 20, fontWeight: 700 }}>
            {ALUMNO_DEMO.nombre} {ALUMNO_DEMO.apellidos}
          </div>
          <div style={{ opacity: .8, fontSize: 14 }}>
            {ALUMNO_DEMO.curso} {ALUMNO_DEMO.grupo} · {ALUMNO_DEMO.etapa.toUpperCase()}
          </div>
          <div style={{ display: 'flex', gap: 12, marginTop: 8, flexWrap: 'wrap' }}>
            <span style={{ background: '#ffffff20', borderRadius: 20, padding: '3px 12px', fontSize: 12 }}>
              🔥 Racha: {ALUMNO_DEMO.racha} dias
            </span>
            <span style={{ background: '#ffffff20', borderRadius: 20, padding: '3px 12px', fontSize: 12 }}>
              ⭐ {ALUMNO_DEMO.puntos} puntos
            </span>
            <span style={{ background: '#ffffff20', borderRadius: 20, padding: '3px 12px', fontSize: 12 }}>
              🏅 {ALUMNO_DEMO.nivel}
            </span>
          </div>
        </div>
        <div style={{ marginLeft: 'auto' }}>
          <ProgressRing value={promedioProgreso} color="#60a5fa" size={90} />
          <div style={{ textAlign: 'center', fontSize: 11, opacity: .75, marginTop: 4 }}>
            Progreso global
          </div>
        </div>
      </div>

      {/* Metricas rapidas */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(140px, 1fr))', gap: 14, marginBottom: 24 }}>
        <MetricCard icon="📚" label="Materias" value={PROGRESO_MATERIAS.length} color="#1d4ed8" />
        <MetricCard icon="✅" label="Tareas pendientes" value={TAREAS_PENDIENTES.length} color="#f59e0b" sub={`${tareasUrgentes} urgentes`} />
        <MetricCard icon="📝" label="Proximos examenes" value={PROXIMOS_EXAMENES.length} color="#7c3aed" />
        <MetricCard icon="🏅" label="Insignias" value={INSIGNIAS.filter(i => i.desbloqueada).length + '/' + INSIGNIAS.length} color="#16a34a" />
      </div>

      {/* Progreso por materia */}
      <div style={{ background: '#fff', borderRadius: 16, padding: 24, marginBottom: 20, boxShadow: '0 2px 12px rgba(0,0,0,.05)' }}>
        <h3 style={{ margin: '0 0 20px', color: '#1e3a8a', fontSize: 16, fontWeight: 700 }}>
          Progreso por materia
        </h3>
        {PROGRESO_MATERIAS.map((m, i) => (
          <div key={i} style={{ marginBottom: 16 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
              <span style={{ fontSize: 14, fontWeight: 500, color: '#334155' }}>{m.materia}</span>
              <div style={{ display: 'flex', gap: 16, fontSize: 13, color: '#64748b' }}>
                <span>{m.progreso}%</span>
                <span style={{ fontWeight: 600, color: m.nota >= 7 ? '#16a34a' : m.nota >= 5 ? '#f59e0b' : '#dc2626' }}>
                  Nota: {m.nota}
                </span>
                <span>{m.horas}h</span>
              </div>
            </div>
            <div style={{ background: '#f1f5f9', borderRadius: 99, height: 8, overflow: 'hidden' }}>
              <div style={{
                width: `${m.progreso}%`, height: '100%',
                background: m.color, borderRadius: 99,
                transition: 'width 1s ease',
              }} />
            </div>
          </div>
        ))}
      </div>

      {/* Tareas + examenes */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20, marginBottom: 20 }}>

        {/* Tareas */}
        <div style={{ background: '#fff', borderRadius: 16, padding: 20, boxShadow: '0 2px 12px rgba(0,0,0,.05)' }}>
          <h3 style={{ margin: '0 0 16px', color: '#1e3a8a', fontSize: 15, fontWeight: 700 }}>
            Tareas pendientes
          </h3>
          {TAREAS_PENDIENTES.map(t => (
            <div key={t.id} style={{
              padding: '10px 14px', borderRadius: 10, marginBottom: 8,
              background: t.urgente ? '#fef2f2' : '#f8fafc',
              border: `1px solid ${t.urgente ? '#fecaca' : '#e2e8f0'}`,
              display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start',
            }}>
              <div>
                <div style={{ fontSize: 13, fontWeight: 600, color: '#334155' }}>{t.titulo}</div>
                <div style={{ fontSize: 11, color: '#64748b', marginTop: 2 }}>
                  {t.materia} · Entrega: {t.fecha}
                </div>
              </div>
              {t.urgente && (
                <span style={{
                  background: '#dc2626', color: '#fff',
                  fontSize: 10, padding: '2px 6px', borderRadius: 4, whiteSpace: 'nowrap',
                }}>
                  Urgente
                </span>
              )}
            </div>
          ))}
        </div>

        {/* Examenes */}
        <div style={{ background: '#fff', borderRadius: 16, padding: 20, boxShadow: '0 2px 12px rgba(0,0,0,.05)' }}>
          <h3 style={{ margin: '0 0 16px', color: '#1e3a8a', fontSize: 15, fontWeight: 700 }}>
            Proximos examenes
          </h3>
          {PROXIMOS_EXAMENES.map((ex, i) => (
            <div key={i} style={{
              padding: '10px 14px', borderRadius: 10, marginBottom: 8,
              background: '#faf5ff', border: '1px solid #ede9fe',
            }}>
              <div style={{ fontWeight: 600, fontSize: 13, color: '#334155' }}>{ex.materia}</div>
              <div style={{ fontSize: 12, color: '#64748b', marginTop: 2 }}>{ex.tema}</div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 4 }}>
                <span style={{ fontSize: 11, color: '#7c3aed' }}>📅 {ex.fecha}</span>
                <span style={{
                  fontSize: 10, padding: '2px 6px', borderRadius: 4, fontWeight: 600,
                  background: ex.dificultad === 'alta' ? '#fee2e2' : '#fef3c7',
                  color:      ex.dificultad === 'alta' ? '#dc2626' : '#d97706',
                }}>
                  {ex.dificultad.toUpperCase()}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Insignias */}
      <div style={{ background: '#fff', borderRadius: 16, padding: 20, boxShadow: '0 2px 12px rgba(0,0,0,.05)' }}>
        <h3 style={{ margin: '0 0 16px', color: '#1e3a8a', fontSize: 15, fontWeight: 700 }}>
          Mis insignias
        </h3>
        <div style={{ display: 'flex', gap: 14, flexWrap: 'wrap' }}>
          {INSIGNIAS.map(ins => (
            <div key={ins.id} style={{
              textAlign: 'center', padding: '14px 18px', borderRadius: 12,
              background: ins.desbloqueada ? '#eff6ff' : '#f8fafc',
              border: `2px solid ${ins.desbloqueada ? '#bfdbfe' : '#e2e8f0'}`,
              opacity: ins.desbloqueada ? 1 : .5,
              minWidth: 90,
            }}>
              <div style={{ fontSize: 28 }}>{ins.icon}</div>
              <div style={{ fontSize: 12, fontWeight: 600, color: ins.desbloqueada ? '#1e3a8a' : '#94a3b8', marginTop: 4 }}>
                {ins.nombre}
              </div>
              <div style={{ fontSize: 10, color: '#94a3b8', marginTop: 2, lineHeight: 1.4 }}>
                {ins.desc}
              </div>
              {!ins.desbloqueada && (
                <div style={{ fontSize: 10, color: '#94a3b8', marginTop: 4 }}>🔒 Bloqueada</div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
