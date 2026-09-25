/**
 * OUTPUT GENERADO · EducaArchidona (Demo) · Panel Admin
 * Fabrica SaaS V1.8 · Education Vertical
 * Demo comercial · Datos 100% ficticios · NO produccion
 */
import { useState } from 'react';
import { ETAPAS, MATERIAS } from './EducaArchidonaMockData.js';

const USUARIOS_DEMO = [
  { nombre: 'Alex Garcia Moreno',   rol: 'alumno',   curso: '3 ESO B',   activo: true  },
  { nombre: 'Sofia Martinez Lopez', rol: 'alumno',   curso: '3 ESO B',   activo: true  },
  { nombre: 'D. Miguel Ruiz Torres',rol: 'profesor', curso: 'Matematicas', activo: true },
  { nombre: 'Da. Ana Perez Gomez',  rol: 'profesor', curso: 'Lengua',    activo: true  },
  { nombre: 'Familia Garcia',       rol: 'familia',  curso: '3 ESO B',   activo: true  },
];

const STATS_SISTEMA = [
  { icon: '🧑‍🎓', label: 'Alumnos',   value: 124, color: '#1d4ed8' },
  { icon: '👩‍🏫', label: 'Profesores', value: 18,  color: '#16a34a' },
  { icon: '👨‍👩‍👧', label: 'Familias',  value: 98,  color: '#f59e0b' },
  { icon: '📚', label: 'Materias',  value: MATERIAS.length, color: '#7c3aed' },
];

const ROL_COLOR = {
  alumno:   { bg: '#eff6ff', color: '#1d4ed8', border: '#bfdbfe' },
  profesor: { bg: '#f0fdf4', color: '#16a34a', border: '#bbf7d0' },
  familia:  { bg: '#fff7ed', color: '#f59e0b', border: '#fed7aa' },
  admin:    { bg: '#faf5ff', color: '#7c3aed', border: '#ede9fe' },
};

export function EducaArchidonaAdmin() {
  const [seccion, setSeccion] = useState('dashboard');

  return (
    <div style={{ padding: 24, background: '#faf5ff', minHeight: '100vh' }}>

      {/* Header admin */}
      <div style={{
        background: 'linear-gradient(135deg, #4c1d95, #7c3aed)',
        borderRadius: 16, padding: '20px 24px', color: '#fff', marginBottom: 24,
      }}>
        <div style={{ fontSize: 32, marginBottom: 6 }}>⚙️</div>
        <div style={{ fontWeight: 700, fontSize: 18 }}>Panel de Administracion</div>
        <div style={{ opacity: .8, fontSize: 13 }}>EducaArchidona · Demo V1.8</div>
      </div>

      {/* Navegacion */}
      <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 20 }}>
        {[
          { id: 'dashboard', label: '📊 Dashboard' },
          { id: 'usuarios',  label: '👥 Usuarios' },
          { id: 'cursos',    label: '📚 Cursos y materias' },
          { id: 'sistema',   label: '🔧 Sistema' },
        ].map(s => (
          <button
            key={s.id}
            onClick={() => setSeccion(s.id)}
            style={{
              padding: '8px 18px', borderRadius: 20, border: '2px solid',
              borderColor: seccion === s.id ? '#7c3aed' : '#e2e8f0',
              background:  seccion === s.id ? '#7c3aed' : '#fff',
              color:       seccion === s.id ? '#fff'    : '#334155',
              fontWeight: 600, fontSize: 13, cursor: 'pointer',
            }}
            aria-pressed={seccion === s.id}
          >
            {s.label}
          </button>
        ))}
      </div>

      {/* Dashboard */}
      {seccion === 'dashboard' && (
        <div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(140px, 1fr))', gap: 14, marginBottom: 24 }}>
            {STATS_SISTEMA.map((s, i) => (
              <div key={i} style={{
                background: '#fff', borderRadius: 14, padding: '18px 14px', textAlign: 'center',
                boxShadow: '0 2px 8px rgba(0,0,0,.05)', borderTop: `4px solid ${s.color}`,
              }}>
                <div style={{ fontSize: 24 }}>{s.icon}</div>
                <div style={{ fontSize: 28, fontWeight: 800, color: s.color }}>{s.value}</div>
                <div style={{ fontSize: 11, color: '#64748b' }}>{s.label}</div>
              </div>
            ))}
          </div>

          {/* Etapas overview */}
          <div style={{ background: '#fff', borderRadius: 16, padding: 24, boxShadow: '0 2px 12px rgba(0,0,0,.05)', marginBottom: 20 }}>
            <h3 style={{ margin: '0 0 16px', color: '#4c1d95', fontSize: 15, fontWeight: 700 }}>
              Etapas educativas
            </h3>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: 12 }}>
              {ETAPAS.map(e => (
                <div key={e.id} style={{
                  background: '#faf5ff', borderRadius: 12, padding: '14px 16px',
                  border: '1px solid #ede9fe',
                }}>
                  <div style={{ fontSize: 24, marginBottom: 6 }}>{e.icon}</div>
                  <div style={{ fontWeight: 700, color: e.color }}>{e.nombre}</div>
                  <div style={{ fontSize: 12, color: '#64748b', marginTop: 4 }}>
                    {e.cursos.length} cursos · {e.normativa}
                  </div>
                  <div style={{ fontSize: 10, color: '#16a34a', marginTop: 4 }}>✓ {e.verificationStatus}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Actividad reciente demo */}
          <div style={{ background: '#fff', borderRadius: 16, padding: 24, boxShadow: '0 2px 12px rgba(0,0,0,.05)' }}>
            <h3 style={{ margin: '0 0 14px', color: '#4c1d95', fontSize: 15, fontWeight: 700 }}>
              Actividad reciente (demo)
            </h3>
            {[
              { icon: '🧑‍🎓', msg: 'Alex G. completo ejercicio de Matematicas',          hace: 'hace 5 min' },
              { icon: '👩‍🏫', msg: 'Prof. Ruiz subio nueva tarea a 3 ESO B',             hace: 'hace 12 min' },
              { icon: '🤖', msg: 'Tutor IA atendio 3 consultas de alumnos',             hace: 'hace 18 min' },
              { icon: '👨‍👩‍👧', msg: 'Familia Garcia consulto progreso de su hijo/a',    hace: 'hace 1h' },
            ].map((a, i) => (
              <div key={i} style={{
                display: 'flex', gap: 10, padding: '10px 0',
                borderBottom: i < 3 ? '1px solid #f1f5f9' : 'none',
                alignItems: 'center',
              }}>
                <span style={{ fontSize: 20 }}>{a.icon}</span>
                <span style={{ flex: 1, fontSize: 13, color: '#334155' }}>{a.msg}</span>
                <span style={{ fontSize: 11, color: '#94a3b8' }}>{a.hace}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Usuarios */}
      {seccion === 'usuarios' && (
        <div style={{ background: '#fff', borderRadius: 16, padding: 24, boxShadow: '0 2px 12px rgba(0,0,0,.05)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
            <h3 style={{ margin: 0, color: '#4c1d95', fontSize: 15, fontWeight: 700 }}>
              Usuarios del sistema (demo: {USUARIOS_DEMO.length})
            </h3>
            <span style={{
              background: '#7c3aed', color: '#fff', borderRadius: 8,
              padding: '6px 14px', fontSize: 12, fontWeight: 600, cursor: 'pointer',
            }}>
              + Nuevo usuario
            </span>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {USUARIOS_DEMO.map((u, i) => {
              const cfg = ROL_COLOR[u.rol] || ROL_COLOR.alumno;
              return (
                <div key={i} style={{
                  display: 'flex', alignItems: 'center', gap: 14,
                  padding: '12px 16px', borderRadius: 12,
                  background: cfg.bg, border: `1px solid ${cfg.border}`,
                }}>
                  <div style={{
                    width: 38, height: 38, borderRadius: '50%',
                    background: cfg.color, color: '#fff',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontWeight: 700, fontSize: 14, flexShrink: 0,
                  }}>
                    {u.nombre.charAt(0)}
                  </div>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontWeight: 600, fontSize: 14, color: '#334155' }}>{u.nombre}</div>
                    <div style={{ fontSize: 12, color: '#64748b' }}>{u.curso}</div>
                  </div>
                  <span style={{
                    fontSize: 11, padding: '3px 10px', borderRadius: 20, fontWeight: 700,
                    background: cfg.color, color: '#fff',
                  }}>
                    {u.rol.charAt(0).toUpperCase() + u.rol.slice(1)}
                  </span>
                  <span style={{
                    fontSize: 11, color: u.activo ? '#16a34a' : '#dc2626',
                    fontWeight: 600,
                  }}>
                    {u.activo ? '● Activo' : '○ Inactivo'}
                  </span>
                </div>
              );
            })}
          </div>
          <p style={{ fontSize: 11, color: '#94a3b8', marginTop: 12 }}>
            Demo: usuarios ficticios. En produccion: gestion real con RLS por rol.
          </p>
        </div>
      )}

      {/* Cursos y materias */}
      {seccion === 'cursos' && (
        <div style={{ background: '#fff', borderRadius: 16, padding: 24, boxShadow: '0 2px 12px rgba(0,0,0,.05)' }}>
          <h3 style={{ margin: '0 0 16px', color: '#4c1d95', fontSize: 15, fontWeight: 700 }}>
            Materias por etapa ({MATERIAS.length} total)
          </h3>
          {ETAPAS.map(e => {
            const mats = MATERIAS.filter(m => m.etapa === e.id);
            return (
              <div key={e.id} style={{ marginBottom: 20 }}>
                <div style={{ fontWeight: 700, color: e.color, marginBottom: 8, fontSize: 14 }}>
                  {e.icon} {e.nombre} ({mats.length} materias)
                </div>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                  {mats.map(m => (
                    <span key={m.id} style={{
                      background: '#f8fafc', border: '1px solid #e2e8f0',
                      borderRadius: 8, padding: '4px 10px', fontSize: 12, color: '#475569',
                    }}>
                      {m.icon} {m.nombre}
                      <span style={{
                        marginLeft: 4, fontSize: 9, fontWeight: 700, color: '#16a34a',
                      }}>
                        {m.verificationStatus}
                      </span>
                    </span>
                  ))}
                </div>
              </div>
            );
          })}
          <div style={{
            background: '#f0fdf4', borderRadius: 10, padding: '12px 16px', marginTop: 8,
            fontSize: 12, color: '#166534',
          }}>
            ✓ Todas las materias verificadas contra Decretos 101/102/103-2023 (BOJA 90, 15 mayo 2023)
          </div>
        </div>
      )}

      {/* Sistema */}
      {seccion === 'sistema' && (
        <div style={{ background: '#fff', borderRadius: 16, padding: 24, boxShadow: '0 2px 12px rgba(0,0,0,.05)' }}>
          <h3 style={{ margin: '0 0 16px', color: '#4c1d95', fontSize: 15, fontWeight: 700 }}>
            Configuracion del sistema
          </h3>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
            {[
              { label: 'Version plataforma', value: 'V1.8 Demo', icon: '🏷️' },
              { label: 'Vertical',           value: 'Educacion',  icon: '🎓' },
              { label: 'Normativa base',     value: 'Andalucia 2023', icon: '📋' },
              { label: 'Modo',               value: 'Demo (sin produccion)', icon: '🔒' },
              { label: 'Datos reales',        value: 'NO', icon: '🚫' },
              { label: 'IA real',             value: 'NO (mock)', icon: '🤖' },
              { label: 'Pagos activados',     value: 'NO', icon: '💳' },
              { label: 'RGPD compliant',      value: 'SI (diseno)', icon: '✅' },
            ].map((c, i) => (
              <div key={i} style={{
                display: 'flex', gap: 10, padding: '12px 14px',
                background: '#faf5ff', borderRadius: 10, border: '1px solid #ede9fe',
                alignItems: 'center',
              }}>
                <span style={{ fontSize: 20 }}>{c.icon}</span>
                <div>
                  <div style={{ fontSize: 11, color: '#64748b' }}>{c.label}</div>
                  <div style={{ fontWeight: 700, color: '#4c1d95', fontSize: 13 }}>{c.value}</div>
                </div>
              </div>
            ))}
          </div>
          <div style={{
            marginTop: 20, background: '#fef3c7', borderRadius: 10, padding: '12px 16px',
            fontSize: 12, color: '#92400e',
          }}>
            ⚠️ Esta es una demo comercial de Fabrica SaaS V1.8. No hay datos reales, no hay produccion activa.
            Todos los datos son ficticios y generados en codigo.
          </div>
        </div>
      )}
    </div>
  );
}
