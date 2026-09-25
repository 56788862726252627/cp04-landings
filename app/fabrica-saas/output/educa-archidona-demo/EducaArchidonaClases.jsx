/**
 * OUTPUT GENERADO · EducaArchidona (Demo) · Visor de Clases
 * Fabrica SaaS V1.8 · Education Vertical
 * Demo comercial · Datos 100% ficticios · NO produccion
 */
import { useState } from 'react';
import { LECCIONES, VIDEO_LECCIONES } from './EducaArchidonaMockData.js';

/* ── video placeholder (sin video real) ───────────────────────── */
function VideoPlaceholder({ titulo, duracion, materia }) {
  const [playing, setPlaying] = useState(false);
  return (
    <div
      style={{
        background: 'linear-gradient(135deg, #1e3a8a, #1d4ed8)',
        borderRadius: 14, aspectRatio: '16/9', position: 'relative',
        display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
        cursor: 'pointer', overflow: 'hidden',
      }}
      onClick={() => setPlaying(!playing)}
      role="button"
      tabIndex={0}
      onKeyDown={e => e.key === 'Enter' && setPlaying(!playing)}
      aria-label={`${playing ? 'Pausar' : 'Reproducir'} video: ${titulo}`}
    >
      <div style={{
        width: 64, height: 64, borderRadius: '50%',
        background: playing ? '#ef444490' : '#ffffff30',
        border: '3px solid #fff',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        fontSize: 28,
        transition: 'all .2s',
      }}>
        {playing ? '⏸' : '▶'}
      </div>
      <div style={{ color: '#fff', marginTop: 16, fontWeight: 600, fontSize: 15 }}>{titulo}</div>
      <div style={{ color: '#93c5fd', fontSize: 12, marginTop: 4 }}>
        {materia} · {duracion} min
      </div>
      {playing && (
        <div style={{
          position: 'absolute', bottom: 12, left: '50%', transform: 'translateX(-50%)',
          background: '#000000aa', borderRadius: 6, padding: '4px 12px',
          color: '#fff', fontSize: 11,
        }}>
          Demo · Sin video real · Contenido ficticio
        </div>
      )}
    </div>
  );
}

export function EducaArchidonaClases() {
  const [leccionActiva, setLeccionActiva] = useState(LECCIONES[0].id);
  const leccion = LECCIONES.find(l => l.id === leccionActiva) || LECCIONES[0];

  const tipoIcon = { video: '🎬', texto: '📄', ejercicio: '✏️' };
  const tipoLabel = { video: 'Videoleccion', texto: 'Lectura', ejercicio: 'Ejercicio' };

  return (
    <div style={{ padding: 24, background: '#eff6ff', minHeight: '100vh' }}>
      <div style={{ display: 'grid', gridTemplateColumns: '300px 1fr', gap: 20 }}>

        {/* Sidebar: lista de lecciones */}
        <div style={{ background: '#fff', borderRadius: 16, padding: 20, boxShadow: '0 2px 12px rgba(0,0,0,.05)', height: 'fit-content' }}>
          <h3 style={{ margin: '0 0 16px', color: '#1e3a8a', fontSize: 15, fontWeight: 700 }}>
            Unidad 4 · Funciones
          </h3>
          {LECCIONES.map(l => (
            <div
              key={l.id}
              onClick={() => setLeccionActiva(l.id)}
              role="button"
              tabIndex={0}
              onKeyDown={e => e.key === 'Enter' && setLeccionActiva(l.id)}
              style={{
                padding: '10px 14px', borderRadius: 10, marginBottom: 6,
                background: leccionActiva === l.id ? '#eff6ff' : 'transparent',
                border: `1px solid ${leccionActiva === l.id ? '#bfdbfe' : 'transparent'}`,
                cursor: 'pointer', transition: 'all .15s',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <span style={{ fontSize: 18 }}>{tipoIcon[l.tipo]}</span>
                <div style={{ flex: 1 }}>
                  <div style={{
                    fontSize: 13, fontWeight: 500,
                    color: leccionActiva === l.id ? '#1d4ed8' : '#334155',
                  }}>
                    {l.titulo}
                  </div>
                  <div style={{ fontSize: 11, color: '#94a3b8', marginTop: 2 }}>
                    {tipoLabel[l.tipo]} · {l.duracion} min
                  </div>
                </div>
                {l.completada && (
                  <span style={{ color: '#16a34a', fontSize: 16 }}>✅</span>
                )}
              </div>
            </div>
          ))}
        </div>

        {/* Visor principal */}
        <div>
          {/* Leccion header */}
          <div style={{
            background: '#fff', borderRadius: 16, padding: 24,
            boxShadow: '0 2px 12px rgba(0,0,0,.05)', marginBottom: 16,
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 16 }}>
              <span style={{ fontSize: 28 }}>{tipoIcon[leccion.tipo]}</span>
              <div>
                <h2 style={{ margin: 0, fontSize: 20, color: '#1e3a8a', fontWeight: 700 }}>
                  {leccion.titulo}
                </h2>
                <div style={{ fontSize: 13, color: '#64748b', marginTop: 2 }}>
                  {leccion.materia} · Unidad {leccion.unidad} · {leccion.duracion} min ·
                  <span style={{
                    marginLeft: 6, padding: '1px 8px', borderRadius: 4, fontSize: 11,
                    background: leccion.dificultad === 'alta' ? '#fee2e2' : leccion.dificultad === 'media' ? '#fef3c7' : '#f0fdf4',
                    color:      leccion.dificultad === 'alta' ? '#dc2626' : leccion.dificultad === 'media' ? '#d97706' : '#16a34a',
                  }}>
                    {leccion.dificultad}
                  </span>
                </div>
              </div>
              {leccion.completada && (
                <div style={{ marginLeft: 'auto', background: '#f0fdf4', borderRadius: 20, padding: '6px 14px', color: '#16a34a', fontWeight: 600, fontSize: 13 }}>
                  ✅ Completada · {leccion.puntuacion}/10
                </div>
              )}
            </div>

            {/* Tags */}
            <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
              {leccion.tags.map(tag => (
                <span key={tag} style={{
                  background: '#eff6ff', color: '#1d4ed8',
                  border: '1px solid #bfdbfe',
                  borderRadius: 6, padding: '2px 10px', fontSize: 12,
                }}>
                  #{tag}
                </span>
              ))}
            </div>
          </div>

          {/* Contenido segun tipo */}
          {leccion.tipo === 'video' && (
            <div style={{ background: '#fff', borderRadius: 16, padding: 24, boxShadow: '0 2px 12px rgba(0,0,0,.05)', marginBottom: 16 }}>
              <VideoPlaceholder
                titulo={leccion.titulo}
                duracion={leccion.duracion}
                materia={leccion.materia}
              />
            </div>
          )}

          {leccion.tipo === 'texto' && (
            <div style={{ background: '#fff', borderRadius: 16, padding: 28, boxShadow: '0 2px 12px rgba(0,0,0,.05)', marginBottom: 16 }}>
              <div style={{ lineHeight: 1.8, color: '#334155', fontSize: 15 }}>
                <p><strong>Dominio y Recorrido de una funcion</strong></p>
                <p>El <strong>dominio</strong> de una funcion f(x) es el conjunto de todos los valores de x para los cuales la funcion esta definida. Por ejemplo, para f(x) = 1/(x-3), el dominio excluye x = 3 porque ese valor hace el denominador igual a cero.</p>
                <p>El <strong>recorrido</strong> (o imagen) es el conjunto de todos los valores que puede tomar f(x). Para una funcion lineal f(x) = 2x + 1, el recorrido es todos los numeros reales.</p>
                <div style={{ background: '#eff6ff', borderRadius: 10, padding: '14px 18px', margin: '16px 0', border: '1px solid #bfdbfe' }}>
                  <strong>Ejemplo practico:</strong><br/>
                  f(x) = raiz cuadrada de x → Dominio: x ≥ 0 (no existen raices de negativos en R)<br/>
                  f(x) = x^2 → Recorrido: y ≥ 0 (el cuadrado siempre es positivo)
                </div>
                <p style={{ color: '#94a3b8', fontSize: 12, fontStyle: 'italic' }}>
                  Contenido de ejemplo. Demo educativa ficticia. No sustituye al temario oficial.
                </p>
              </div>
            </div>
          )}

          {leccion.tipo === 'ejercicio' && (
            <div style={{ background: '#fff', borderRadius: 16, padding: 28, boxShadow: '0 2px 12px rgba(0,0,0,.05)', marginBottom: 16 }}>
              <div style={{ textAlign: 'center', padding: '32px 0' }}>
                <div style={{ fontSize: 48, marginBottom: 12 }}>✏️</div>
                <h3 style={{ color: '#1e3a8a', marginBottom: 8 }}>Ejercicios interactivos</h3>
                <p style={{ color: '#64748b', marginBottom: 20 }}>
                  Accede a los ejercicios desde la pestana "Ejercicios" para una experiencia completa con puntuacion y retroalimentacion.
                </p>
                <span style={{
                  background: '#1d4ed8', color: '#fff', borderRadius: 10, padding: '10px 24px',
                  fontSize: 14, fontWeight: 600, cursor: 'pointer',
                }}>
                  Ir a Ejercicios →
                </span>
              </div>
            </div>
          )}

          {/* Videolecciones de referencia */}
          <div style={{ background: '#fff', borderRadius: 16, padding: 20, boxShadow: '0 2px 12px rgba(0,0,0,.05)' }}>
            <h3 style={{ margin: '0 0 16px', color: '#1e3a8a', fontSize: 15, fontWeight: 700 }}>
              Videos de repaso
            </h3>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: 12 }}>
              {VIDEO_LECCIONES.map(v => (
                <div key={v.id} style={{
                  background: 'linear-gradient(135deg, #1e3a8a, #1d4ed8)',
                  borderRadius: 12, padding: '18px 14px', color: '#fff', cursor: 'pointer',
                }}>
                  <div style={{ fontSize: 24, marginBottom: 8 }}>🎬</div>
                  <div style={{ fontWeight: 600, fontSize: 13, marginBottom: 4 }}>{v.titulo}</div>
                  <div style={{ fontSize: 11, opacity: .75 }}>{v.materia} · {v.duracion}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
