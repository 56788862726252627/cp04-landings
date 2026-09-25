/**
 * OUTPUT GENERADO · EducaArchidona (Demo) · Progreso
 * Fabrica SaaS V1.8 · Education Vertical
 * Demo comercial · Datos 100% ficticios · NO produccion
 */
import { useEffect, useState } from 'react';
import { PROGRESO_MATERIAS, ALUMNO_DEMO, PROXIMOS_EXAMENES } from './EducaArchidonaMockData.js';

function AnimatedBar({ value, color, delay = 0 }) {
  const [w, setW] = useState(0);
  useEffect(() => {
    const t = setTimeout(() => setW(value), 100 + delay);
    return () => clearTimeout(t);
  }, [value, delay]);
  return (
    <div style={{ background: '#f1f5f9', borderRadius: 99, height: 14, overflow: 'hidden' }}>
      <div style={{
        width: `${w}%`, height: '100%', background: color, borderRadius: 99,
        transition: 'width 1s ease', position: 'relative', overflow: 'hidden',
      }}>
        <div style={{
          position: 'absolute', right: 4, top: '50%', transform: 'translateY(-50%)',
          color: '#fff', fontSize: 9, fontWeight: 700,
        }}>{w}%</div>
      </div>
    </div>
  );
}

export function EducaArchidonaProgreso() {
  const totalHoras = PROGRESO_MATERIAS.reduce((a, m) => a + m.horas, 0);
  const mediaGlobal = (PROGRESO_MATERIAS.reduce((a, m) => a + m.nota, 0) / PROGRESO_MATERIAS.length).toFixed(1);
  const mediaProgreso = Math.round(PROGRESO_MATERIAS.reduce((a, m) => a + m.progreso, 0) / PROGRESO_MATERIAS.length);

  return (
    <div style={{ padding: 24, background: '#eff6ff', minHeight: '100vh' }}>

      {/* Resumen global */}
      <div style={{
        display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(150px, 1fr))',
        gap: 14, marginBottom: 24,
      }}>
        {[
          { icon: '📊', label: 'Progreso global', value: `${mediaProgreso}%`, color: '#1d4ed8' },
          { icon: '📝', label: 'Nota media',       value: mediaGlobal,         color: '#16a34a' },
          { icon: '⏱️', label: 'Horas estudiadas', value: `${totalHoras}h`,    color: '#f59e0b' },
          { icon: '📚', label: 'Materias',         value: PROGRESO_MATERIAS.length, color: '#7c3aed' },
        ].map((m, i) => (
          <div key={i} style={{
            background: '#fff', borderRadius: 14, padding: '18px 16px', textAlign: 'center',
            boxShadow: '0 2px 12px rgba(0,0,0,.05)', borderTop: `4px solid ${m.color}`,
          }}>
            <div style={{ fontSize: 24, marginBottom: 4 }}>{m.icon}</div>
            <div style={{ fontSize: 28, fontWeight: 800, color: m.color }}>{m.value}</div>
            <div style={{ fontSize: 12, color: '#64748b', marginTop: 2 }}>{m.label}</div>
          </div>
        ))}
      </div>

      {/* Barras de progreso por materia */}
      <div style={{ background: '#fff', borderRadius: 16, padding: 24, marginBottom: 20, boxShadow: '0 2px 12px rgba(0,0,0,.05)' }}>
        <h3 style={{ margin: '0 0 20px', color: '#1e3a8a', fontSize: 16, fontWeight: 700 }}>
          Progreso por materia — {ALUMNO_DEMO.curso} {ALUMNO_DEMO.grupo}
        </h3>
        {PROGRESO_MATERIAS.map((m, i) => (
          <div key={i} style={{ marginBottom: 20 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
              <div style={{ fontWeight: 600, fontSize: 14, color: '#334155' }}>{m.materia}</div>
              <div style={{ display: 'flex', gap: 20, fontSize: 13 }}>
                <span style={{ color: '#64748b' }}>📚 {m.horas}h</span>
                <span style={{
                  fontWeight: 700,
                  color: m.nota >= 8 ? '#16a34a' : m.nota >= 6 ? '#f59e0b' : '#dc2626',
                }}>
                  Nota: {m.nota}
                </span>
              </div>
            </div>
            <AnimatedBar value={m.progreso} color={m.color} delay={i * 80} />
          </div>
        ))}
      </div>

      {/* Evolucion simulada */}
      <div style={{ background: '#fff', borderRadius: 16, padding: 24, marginBottom: 20, boxShadow: '0 2px 12px rgba(0,0,0,.05)' }}>
        <h3 style={{ margin: '0 0 16px', color: '#1e3a8a', fontSize: 16, fontWeight: 700 }}>
          Evolucion por evaluacion (demo)
        </h3>
        <div style={{ display: 'flex', gap: 0, alignItems: 'flex-end', height: 120 }}>
          {[
            { label: '1a Eval', nota: 6.2, color: '#f59e0b' },
            { label: '2a Eval', nota: 7.0, color: '#3b82f6' },
            { label: 'Actual',  nota: Number(mediaGlobal), color: '#16a34a' },
          ].map((ev, i) => (
            <div key={i} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4 }}>
              <span style={{ fontWeight: 700, fontSize: 14, color: ev.color }}>{ev.nota}</span>
              <div style={{
                width: '60%', height: `${ev.nota * 10}px`, background: ev.color,
                borderRadius: '4px 4px 0 0', transition: 'height 1s ease',
              }} />
              <span style={{ fontSize: 11, color: '#64748b' }}>{ev.label}</span>
            </div>
          ))}
        </div>
        <p style={{ fontSize: 11, color: '#94a3b8', marginTop: 8, textAlign: 'center' }}>
          Tendencia positiva. Datos de demo ficticios.
        </p>
      </div>

      {/* Proximos examenes en vista progreso */}
      <div style={{ background: '#fff', borderRadius: 16, padding: 24, boxShadow: '0 2px 12px rgba(0,0,0,.05)' }}>
        <h3 style={{ margin: '0 0 16px', color: '#1e3a8a', fontSize: 16, fontWeight: 700 }}>
          Proximos examenes
        </h3>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {PROXIMOS_EXAMENES.map((ex, i) => (
            <div key={i} style={{
              display: 'flex', alignItems: 'center', gap: 14,
              padding: '12px 16px', borderRadius: 12,
              background: '#faf5ff', border: '1px solid #ede9fe',
            }}>
              <div style={{ fontSize: 24 }}>📝</div>
              <div style={{ flex: 1 }}>
                <div style={{ fontWeight: 600, color: '#334155' }}>{ex.materia}</div>
                <div style={{ fontSize: 12, color: '#64748b' }}>{ex.tema}</div>
              </div>
              <div style={{ textAlign: 'right' }}>
                <div style={{ fontSize: 13, fontWeight: 600, color: '#7c3aed' }}>{ex.fecha}</div>
                <div style={{
                  fontSize: 10, padding: '2px 6px', borderRadius: 4, marginTop: 2,
                  background: ex.dificultad === 'alta' ? '#fee2e2' : '#fef3c7',
                  color:      ex.dificultad === 'alta' ? '#dc2626' : '#d97706',
                }}>
                  {ex.dificultad.toUpperCase()}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
