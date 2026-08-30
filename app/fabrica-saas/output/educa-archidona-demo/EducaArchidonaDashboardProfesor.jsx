/**
 * OUTPUT GENERADO · EducaArchidona (Demo) · Dashboard Profesor
 * Fabrica SaaS V1.8 · Education Vertical
 * Demo comercial · Datos 100% ficticios · NO produccion
 */
import { useState } from 'react';
import { GRUPO_PROFESOR } from './EducaArchidonaMockData.js';

export function EducaArchidonaDashboardProfesor() {
  const [vistaActiva, setVistaActiva] = useState('grupo');
  const g = GRUPO_PROFESOR;

  return (
    <div style={{ padding: 24, background: '#f0fdf4', minHeight: '100vh' }}>

      {/* Header profesor */}
      <div style={{
        background: 'linear-gradient(135deg, #166534, #16a34a)',
        borderRadius: 16, padding: '24px 28px', color: '#fff', marginBottom: 24,
      }}>
        <div style={{ fontSize: 36, marginBottom: 8 }}>👩‍🏫</div>
        <div style={{ fontSize: 20, fontWeight: 700 }}>{g.profesor}</div>
        <div style={{ opacity: .85, fontSize: 14 }}>{g.materia} · {g.nombre}</div>
        <div style={{ display: 'flex', gap: 20, marginTop: 12, flexWrap: 'wrap' }}>
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: 28, fontWeight: 800 }}>{g.numAlumnos}</div>
            <div style={{ fontSize: 12, opacity: .8 }}>Alumnos</div>
          </div>
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: 28, fontWeight: 800 }}>{g.mediaGrupo}</div>
            <div style={{ fontSize: 12, opacity: .8 }}>Media grupo</div>
          </div>
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: 28, fontWeight: 800 }}>{g.tareas.length}</div>
            <div style={{ fontSize: 12, opacity: .8 }}>Tareas activas</div>
          </div>
        </div>
      </div>

      {/* Navegacion */}
      <div style={{ display: 'flex', gap: 8, marginBottom: 20 }}>
        {[
          { id: 'grupo',   label: '📊 Vista grupo' },
          { id: 'alumnos', label: '👥 Alumnos' },
          { id: 'tareas',  label: '📝 Tareas' },
        ].map(v => (
          <button
            key={v.id}
            onClick={() => setVistaActiva(v.id)}
            style={{
              padding: '8px 18px', borderRadius: 20, border: '2px solid',
              borderColor: vistaActiva === v.id ? '#16a34a' : '#e2e8f0',
              background:  vistaActiva === v.id ? '#16a34a' : '#fff',
              color:       vistaActiva === v.id ? '#fff'    : '#334155',
              fontWeight: 600, fontSize: 13, cursor: 'pointer',
            }}
            aria-pressed={vistaActiva === v.id}
          >
            {v.label}
          </button>
        ))}
      </div>

      {/* Vista: Grupo */}
      {vistaActiva === 'grupo' && (
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>
          {/* Distribucion */}
          <div style={{ background: '#fff', borderRadius: 16, padding: 24, boxShadow: '0 2px 12px rgba(0,0,0,.05)' }}>
            <h3 style={{ margin: '0 0 16px', color: '#166534', fontSize: 15, fontWeight: 700 }}>
              Distribucion de notas
            </h3>
            {[
              { rango: 'Excelente (9-10)', count: 1, color: '#16a34a' },
              { rango: 'Notable (7-8)',    count: 3, color: '#3b82f6' },
              { rango: 'Bien (6-7)',       count: 1, color: '#f59e0b' },
              { rango: 'Suficiente (5-6)', count: 0, color: '#94a3b8' },
              { rango: 'Insuficiente (<5)',count: 1, color: '#dc2626' },
            ].map((r, i) => (
              <div key={i} style={{ marginBottom: 12 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                  <span style={{ fontSize: 12, color: '#64748b' }}>{r.rango}</span>
                  <span style={{ fontSize: 12, fontWeight: 700, color: r.color }}>{r.count}</span>
                </div>
                <div style={{ background: '#f1f5f9', borderRadius: 99, height: 8 }}>
                  <div style={{
                    width: `${(r.count / g.alumnos.length) * 100}%`,
                    height: '100%', background: r.color, borderRadius: 99,
                  }} />
                </div>
              </div>
            ))}
            <div style={{ marginTop: 16, padding: '10px 14px', background: '#f0fdf4', borderRadius: 10, border: '1px solid #bbf7d0' }}>
              <span style={{ fontSize: 13, color: '#166534', fontWeight: 600 }}>
                Media del grupo: {g.mediaGrupo}
              </span>
            </div>
          </div>

          {/* Asistencia */}
          <div style={{ background: '#fff', borderRadius: 16, padding: 24, boxShadow: '0 2px 12px rgba(0,0,0,.05)' }}>
            <h3 style={{ margin: '0 0 16px', color: '#166534', fontSize: 15, fontWeight: 700 }}>
              Asistencia media
            </h3>
            {g.alumnos.map((al, i) => (
              <div key={i} style={{ marginBottom: 10 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                  <span style={{ fontSize: 12, color: '#334155' }}>{al.nombre}</span>
                  <span style={{
                    fontSize: 12, fontWeight: 700,
                    color: al.asistencia >= 95 ? '#16a34a' : al.asistencia >= 90 ? '#f59e0b' : '#dc2626',
                  }}>
                    {al.asistencia}%
                  </span>
                </div>
                <div style={{ background: '#f1f5f9', borderRadius: 99, height: 6 }}>
                  <div style={{
                    width: `${al.asistencia}%`, height: '100%', borderRadius: 99,
                    background: al.asistencia >= 95 ? '#16a34a' : al.asistencia >= 90 ? '#f59e0b' : '#dc2626',
                  }} />
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Vista: Alumnos */}
      {vistaActiva === 'alumnos' && (
        <div style={{ background: '#fff', borderRadius: 16, padding: 24, boxShadow: '0 2px 12px rgba(0,0,0,.05)' }}>
          <h3 style={{ margin: '0 0 16px', color: '#166534', fontSize: 15, fontWeight: 700 }}>
            {g.nombre} · {g.numAlumnos} alumnos (mostrando {g.alumnos.length} en demo)
          </h3>
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 14 }}>
              <thead>
                <tr style={{ background: '#f0fdf4' }}>
                  {['Alumno', 'Progreso', 'Nota', 'Asistencia', 'Estado'].map(h => (
                    <th key={h} style={{ padding: '10px 14px', textAlign: 'left', color: '#166534', fontWeight: 700, fontSize: 12 }}>
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {g.alumnos.map((al, i) => (
                  <tr key={i} style={{ borderBottom: '1px solid #f1f5f9' }}>
                    <td style={{ padding: '12px 14px', fontWeight: 600, color: '#334155' }}>{al.nombre}</td>
                    <td style={{ padding: '12px 14px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        <div style={{ flex: 1, background: '#f1f5f9', borderRadius: 99, height: 6 }}>
                          <div style={{ width: `${al.progreso}%`, height: '100%', background: '#16a34a', borderRadius: 99 }} />
                        </div>
                        <span style={{ fontSize: 12, color: '#64748b', width: 36 }}>{al.progreso}%</span>
                      </div>
                    </td>
                    <td style={{ padding: '12px 14px', fontWeight: 700,
                      color: al.nota >= 7 ? '#16a34a' : al.nota >= 5 ? '#f59e0b' : '#dc2626'
                    }}>
                      {al.nota}
                    </td>
                    <td style={{ padding: '12px 14px', color: al.asistencia >= 95 ? '#16a34a' : '#f59e0b' }}>
                      {al.asistencia}%
                    </td>
                    <td style={{ padding: '12px 14px' }}>
                      <span style={{
                        fontSize: 11, padding: '2px 8px', borderRadius: 4,
                        background: al.nota >= 5 ? '#dcfce7' : '#fee2e2',
                        color: al.nota >= 5 ? '#166534' : '#991b1b',
                      }}>
                        {al.nota >= 5 ? 'En seguimiento' : 'Atencion requerida'}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p style={{ fontSize: 11, color: '#94a3b8', marginTop: 12 }}>
            Demo: solo {g.alumnos.length} alumnos de {g.numAlumnos}. Datos ficticios.
          </p>
        </div>
      )}

      {/* Vista: Tareas */}
      {vistaActiva === 'tareas' && (
        <div style={{ background: '#fff', borderRadius: 16, padding: 24, boxShadow: '0 2px 12px rgba(0,0,0,.05)' }}>
          <h3 style={{ margin: '0 0 16px', color: '#166534', fontSize: 15, fontWeight: 700 }}>
            Seguimiento de tareas
          </h3>
          {g.tareas.map((t, i) => (
            <div key={i} style={{
              padding: '16px 18px', borderRadius: 12, marginBottom: 12,
              border: '1px solid #bbf7d0', background: '#f0fdf4',
            }}>
              <div style={{ fontWeight: 700, color: '#166534', marginBottom: 10 }}>{t.titulo}</div>
              <div style={{ display: 'flex', gap: 20, flexWrap: 'wrap' }}>
                <div style={{ textAlign: 'center' }}>
                  <div style={{ fontSize: 22, fontWeight: 800, color: '#16a34a' }}>{t.entregados}</div>
                  <div style={{ fontSize: 11, color: '#64748b' }}>Entregados</div>
                </div>
                <div style={{ textAlign: 'center' }}>
                  <div style={{ fontSize: 22, fontWeight: 800, color: t.pendientes > 0 ? '#f59e0b' : '#94a3b8' }}>
                    {t.pendientes}
                  </div>
                  <div style={{ fontSize: 11, color: '#64748b' }}>Pendientes</div>
                </div>
                <div style={{ textAlign: 'center' }}>
                  <div style={{ fontSize: 22, fontWeight: 800, color: '#1d4ed8' }}>{t.media}</div>
                  <div style={{ fontSize: 11, color: '#64748b' }}>Nota media</div>
                </div>
              </div>
              <div style={{ marginTop: 12, background: '#e2e8f0', borderRadius: 99, height: 8 }}>
                <div style={{
                  width: `${(t.entregados / g.numAlumnos) * 100}%`,
                  height: '100%', background: '#16a34a', borderRadius: 99,
                }} />
              </div>
              <div style={{ fontSize: 11, color: '#64748b', marginTop: 4 }}>
                {t.entregados}/{g.numAlumnos} alumnos entregados
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
