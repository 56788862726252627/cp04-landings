/**
 * OUTPUT GENERADO · EducaArchidona (Demo) · Portal de Familias
 * Fabrica SaaS V1.8 · Education Vertical
 * Demo comercial · Datos 100% ficticios · NO produccion
 * Privacidad: EDUCATION_CHILD_PRIVACY_ARCHITECTURE.md
 */
import { useState } from 'react';
import {
  ALUMNO_DEMO, PROGRESO_MATERIAS, TAREAS_PENDIENTES,
  PROXIMOS_EXAMENES, CALENDARIO_EVENTOS,
} from './EducaArchidonaMockData.js';

export function EducaArchidonaDashboardFamilia() {
  const [seccion, setSeccion] = useState('resumen');

  return (
    <div style={{ padding: 24, background: '#fff7ed', minHeight: '100vh' }}>

      {/* Header familia */}
      <div style={{
        background: 'linear-gradient(135deg, #92400e, #f59e0b)',
        borderRadius: 16, padding: '24px 28px', color: '#fff', marginBottom: 24,
      }}>
        <div style={{ fontSize: 36, marginBottom: 8 }}>👨‍👩‍👧</div>
        <div style={{ fontSize: 18, fontWeight: 700 }}>
          Familia de {ALUMNO_DEMO.nombre} {ALUMNO_DEMO.apellidos}
        </div>
        <div style={{ opacity: .85, fontSize: 14 }}>
          {ALUMNO_DEMO.curso} {ALUMNO_DEMO.grupo} · Curso 2026/27
        </div>
        <div style={{
          marginTop: 12, background: '#ffffff20', borderRadius: 10, padding: '8px 14px', display: 'inline-block',
          fontSize: 12,
        }}>
          🔒 Solo lectura · Acceso a datos academicos de su hijo/a
        </div>
      </div>

      {/* Aviso privacidad */}
      <div style={{
        background: '#fef3c7', border: '1px solid #fde68a', borderRadius: 10,
        padding: '10px 16px', marginBottom: 20, fontSize: 12, color: '#92400e',
        display: 'flex', gap: 8, alignItems: 'flex-start',
      }}>
        <span>🔒</span>
        <span>
          Este portal es de solo lectura. Solo accede a los datos academicos de su hijo/a.
          Las conversaciones del Tutor IA no son accesibles (politica de confidencialidad educativa).
          Datos de demo ficticios. RGPD compliant.
        </span>
      </div>

      {/* Navegacion */}
      <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 20 }}>
        {[
          { id: 'resumen',   label: '📊 Resumen' },
          { id: 'progreso',  label: '📈 Progreso' },
          { id: 'tareas',    label: '📝 Tareas' },
          { id: 'calendario',label: '📅 Calendario' },
        ].map(s => (
          <button
            key={s.id}
            onClick={() => setSeccion(s.id)}
            style={{
              padding: '8px 18px', borderRadius: 20, border: '2px solid',
              borderColor: seccion === s.id ? '#f59e0b' : '#e2e8f0',
              background:  seccion === s.id ? '#f59e0b' : '#fff',
              color:       seccion === s.id ? '#fff'    : '#334155',
              fontWeight: 600, fontSize: 13, cursor: 'pointer',
            }}
            aria-pressed={seccion === s.id}
          >
            {s.label}
          </button>
        ))}
      </div>

      {/* Resumen */}
      {seccion === 'resumen' && (
        <div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(140px, 1fr))', gap: 14, marginBottom: 20 }}>
            {[
              { icon: '📊', label: 'Progreso global', value: '78%',   color: '#f59e0b' },
              { icon: '📝', label: 'Nota media',       value: '7.8',   color: '#16a34a' },
              { icon: '🔥', label: 'Racha de estudio', value: `${ALUMNO_DEMO.racha}d`, color: '#dc2626' },
              { icon: '⭐', label: 'Puntos',           value: ALUMNO_DEMO.puntos, color: '#7c3aed' },
            ].map((m, i) => (
              <div key={i} style={{
                background: '#fff', borderRadius: 12, padding: '16px 14px', textAlign: 'center',
                boxShadow: '0 2px 8px rgba(0,0,0,.05)', borderTop: `3px solid ${m.color}`,
              }}>
                <div style={{ fontSize: 22 }}>{m.icon}</div>
                <div style={{ fontSize: 24, fontWeight: 800, color: m.color }}>{m.value}</div>
                <div style={{ fontSize: 11, color: '#64748b' }}>{m.label}</div>
              </div>
            ))}
          </div>

          {/* Proximos eventos urgentes */}
          <div style={{ background: '#fff', borderRadius: 16, padding: 20, boxShadow: '0 2px 12px rgba(0,0,0,.05)' }}>
            <h3 style={{ margin: '0 0 14px', color: '#92400e', fontSize: 15, fontWeight: 700 }}>
              Proximos examenes
            </h3>
            {PROXIMOS_EXAMENES.map((ex, i) => (
              <div key={i} style={{
                padding: '10px 14px', borderRadius: 10, marginBottom: 8,
                background: '#fff7ed', border: '1px solid #fed7aa',
                display: 'flex', justifyContent: 'space-between', alignItems: 'center',
              }}>
                <div>
                  <div style={{ fontWeight: 600, fontSize: 13, color: '#334155' }}>{ex.materia}</div>
                  <div style={{ fontSize: 11, color: '#64748b' }}>{ex.tema}</div>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <div style={{ fontWeight: 600, color: '#f59e0b', fontSize: 13 }}>{ex.fecha}</div>
                  <div style={{
                    fontSize: 10, padding: '1px 6px', borderRadius: 4, marginTop: 2,
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
      )}

      {/* Progreso */}
      {seccion === 'progreso' && (
        <div style={{ background: '#fff', borderRadius: 16, padding: 24, boxShadow: '0 2px 12px rgba(0,0,0,.05)' }}>
          <h3 style={{ margin: '0 0 20px', color: '#92400e', fontSize: 15, fontWeight: 700 }}>
            Progreso academico — {ALUMNO_DEMO.curso} {ALUMNO_DEMO.grupo}
          </h3>
          {PROGRESO_MATERIAS.map((m, i) => (
            <div key={i} style={{ marginBottom: 18 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
                <span style={{ fontWeight: 600, fontSize: 14, color: '#334155' }}>{m.materia}</span>
                <span style={{
                  fontWeight: 700,
                  color: m.nota >= 7 ? '#16a34a' : m.nota >= 5 ? '#f59e0b' : '#dc2626',
                }}>
                  Nota: {m.nota} · {m.progreso}%
                </span>
              </div>
              <div style={{ background: '#f1f5f9', borderRadius: 99, height: 10 }}>
                <div style={{
                  width: `${m.progreso}%`, height: '100%', background: m.color, borderRadius: 99,
                  transition: 'width 1s ease',
                }} />
              </div>
            </div>
          ))}
          <div style={{
            marginTop: 20, padding: '12px 16px', background: '#fef3c7',
            borderRadius: 10, fontSize: 12, color: '#92400e',
          }}>
            💡 Las notas son indicativas de progreso en la plataforma, no calificaciones oficiales del centro.
          </div>
        </div>
      )}

      {/* Tareas */}
      {seccion === 'tareas' && (
        <div style={{ background: '#fff', borderRadius: 16, padding: 24, boxShadow: '0 2px 12px rgba(0,0,0,.05)' }}>
          <h3 style={{ margin: '0 0 16px', color: '#92400e', fontSize: 15, fontWeight: 700 }}>
            Tareas pendientes de su hijo/a
          </h3>
          {TAREAS_PENDIENTES.map(t => (
            <div key={t.id} style={{
              padding: '12px 16px', borderRadius: 12, marginBottom: 10,
              background: t.urgente ? '#fef2f2' : '#f8fafc',
              border: `1px solid ${t.urgente ? '#fecaca' : '#e2e8f0'}`,
              display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start',
            }}>
              <div>
                <div style={{ fontWeight: 600, fontSize: 13, color: '#334155' }}>{t.titulo}</div>
                <div style={{ fontSize: 11, color: '#64748b', marginTop: 2 }}>
                  {t.materia} · Entrega: {t.fecha}
                </div>
              </div>
              {t.urgente && (
                <span style={{
                  background: '#dc2626', color: '#fff',
                  fontSize: 10, padding: '2px 6px', borderRadius: 4,
                }}>
                  Urgente
                </span>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Calendario */}
      {seccion === 'calendario' && (
        <div style={{ background: '#fff', borderRadius: 16, padding: 24, boxShadow: '0 2px 12px rgba(0,0,0,.05)' }}>
          <h3 style={{ margin: '0 0 16px', color: '#92400e', fontSize: 15, fontWeight: 700 }}>
            Calendario academico
          </h3>
          {CALENDARIO_EVENTOS.map((ev, i) => (
            <div key={i} style={{
              padding: '10px 14px', borderRadius: 10, marginBottom: 8,
              background: '#fff7ed', border: '1px solid #fed7aa',
              display: 'flex', gap: 12, alignItems: 'center',
            }}>
              <div style={{ fontSize: 22 }}>
                {ev.tipo === 'examen' ? '📋' : ev.tipo === 'evaluacion' ? '🎯' : '📝'}
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ fontWeight: 600, fontSize: 13, color: '#334155' }}>{ev.titulo}</div>
                <div style={{ fontSize: 11, color: '#64748b' }}>{ev.materia} · {ev.fecha}</div>
              </div>
              <span style={{
                fontSize: 11, padding: '2px 8px', borderRadius: 4, fontWeight: 600,
                background: ev.tipo === 'examen' ? '#fee2e2' : ev.tipo === 'evaluacion' ? '#faf5ff' : '#eff6ff',
                color:      ev.tipo === 'examen' ? '#dc2626' : ev.tipo === 'evaluacion' ? '#7c3aed' : '#1d4ed8',
              }}>
                {ev.tipo.charAt(0).toUpperCase() + ev.tipo.slice(1)}
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
