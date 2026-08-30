/**
 * FisioNova Premium V2 Pilot — Ejercicios
 * Cards, filtros, modal, feedback, loading states
 * Demo comercial · Datos ficticios · NO producción
 */
import { useState } from 'react';
import { EJERCICIOS_MOCK, BRANDING_V2 } from './FisioNovaPilotMockData.js';

const P = BRANDING_V2.primaryColor;
const A = BRANDING_V2.accentColor;
const S = BRANDING_V2.surfaceColor;

const NIVEL_MAP = {
  básico:      { bg: `${A}18`, text: '#059669' },
  intermedio:  { bg: '#fef3c7', text: '#92400e' },
  avanzado:    { bg: '#fee2e2', text: '#dc2626' },
};
const CAT_COLORS = {
  flexibilidad: P, estabilidad: A, fuerza: '#7c3aed',
  core: '#f59e0b', respiratorio: '#0ea5e9',
};

/* ── Exercise card ────────────────────────────────────────────────────── */
function EjercicioCard({ ej, onClick }) {
  const [hover, setHover] = useState(false);
  const [done, setDone] = useState(false);
  const nivel = NIVEL_MAP[ej.nivel] || NIVEL_MAP.básico;
  const catColor = CAT_COLORS[ej.categoria] || P;

  return (
    <div
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      style={{
        background: done ? `${A}08` : '#fff',
        borderRadius: 14, overflow: 'hidden',
        border: `1.5px solid ${done ? A : hover ? P + '44' : '#e9eef5'}`,
        boxShadow: hover ? `0 8px 24px ${P}18` : '0 2px 6px rgba(0,0,0,.04)',
        transform: hover ? 'translateY(-3px)' : 'none',
        transition: 'all .22s cubic-bezier(.22,1,.36,1)',
        cursor: 'pointer',
      }}
    >
      {/* Color band */}
      <div style={{ height: 4, background: `linear-gradient(90deg, ${catColor}, ${catColor}88)` }} />

      <div style={{ padding: '16px 18px' }}>
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 10 }}>
          <span style={{ fontSize: 28 }}>{ej.icono}</span>
          <div style={{ display: 'flex', gap: 6 }}>
            <span style={{ background: nivel.bg, color: nivel.text, fontSize: 9, fontWeight: 700, borderRadius: 20, padding: '2px 8px' }}>
              {ej.nivel}
            </span>
          </div>
        </div>

        <div style={{ fontWeight: 700, fontSize: 14, color: '#0c1b33', marginBottom: 6 }}>{ej.nombre}</div>
        <div style={{ fontSize: 12, color: '#64748b', lineHeight: 1.5, marginBottom: 12 }}>{ej.descripcion}</div>

        <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginBottom: 12 }}>
          <span style={{ background: `${catColor}15`, color: catColor, fontSize: 10, fontWeight: 600, borderRadius: 6, padding: '2px 8px' }}>
            {ej.categoria}
          </span>
          <span style={{ background: '#f1f5f9', color: '#64748b', fontSize: 10, fontWeight: 600, borderRadius: 6, padding: '2px 8px' }}>
            {ej.duracion}
          </span>
        </div>

        <div style={{ display: 'flex', gap: 8 }}>
          <button
            onClick={(e) => { e.stopPropagation(); onClick(ej); }}
            style={{
              flex: 1, background: `${P}12`, color: P,
              border: `1px solid ${P}22`, borderRadius: 8,
              padding: '7px 0', fontSize: 12, fontWeight: 600, cursor: 'pointer',
              transition: 'background .15s',
            }}
            onMouseEnter={e => { e.currentTarget.style.background = `${P}22`; }}
            onMouseLeave={e => { e.currentTarget.style.background = `${P}12`; }}
          >Ver detalle</button>
          <button
            onClick={(e) => { e.stopPropagation(); setDone(!done); }}
            style={{
              background: done ? A : '#f8faff', color: done ? '#fff' : '#94a3b8',
              border: `1px solid ${done ? A : '#e2e8f0'}`, borderRadius: 8,
              padding: '7px 12px', fontSize: 12, fontWeight: 600, cursor: 'pointer',
              transition: 'all .2s',
            }}
            aria-label={done ? 'Marcar pendiente' : 'Marcar completado'}
          >{done ? '✓' : '○'}</button>
        </div>
      </div>
    </div>
  );
}

/* ── Exercise modal ───────────────────────────────────────────────────── */
function EjercicioModal({ ej, onClose }) {
  const [reps, setReps] = useState(0);
  const [feedback, setFeedback] = useState(null);
  const catColor = CAT_COLORS[ej.categoria] || P;

  const handleComplete = () => {
    setReps(r => r + 1);
    setFeedback('completed');
    setTimeout(() => setFeedback(null), 2000);
  };

  return (
    <>
      <div
        style={{ position: 'fixed', inset: 0, background: 'rgba(12,27,51,.55)', backdropFilter: 'blur(4px)', zIndex: 100, animation: 'overlayIn .2s ease both' }}
        onClick={onClose}
        aria-hidden="true"
      />
      <div
        role="dialog" aria-modal="true" aria-label={ej.nombre}
        style={{
          position: 'fixed', top: '50%', left: '50%',
          transform: 'translate(-50%,-50%)',
          width: '90%', maxWidth: 480, zIndex: 101,
          background: '#fff', borderRadius: 20, overflow: 'hidden',
          animation: 'modalIn .35s cubic-bezier(.22,1,.36,1) both',
          boxShadow: '0 24px 64px rgba(0,0,0,.18)',
        }}
      >
        {/* Header band */}
        <div style={{ height: 6, background: `linear-gradient(90deg, ${catColor}, ${catColor}88)` }} />
        <div style={{ padding: '24px 24px 20px' }}>
          <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 16 }}>
            <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
              <span style={{ fontSize: 36 }}>{ej.icono}</span>
              <div>
                <div style={{ fontWeight: 800, fontSize: 18, color: '#0c1b33' }}>{ej.nombre}</div>
                <div style={{ fontSize: 12, color: catColor, fontWeight: 600, marginTop: 2 }}>{ej.categoria} · {ej.nivel}</div>
              </div>
            </div>
            <button
              onClick={onClose}
              style={{ background: '#f1f5f9', border: 'none', borderRadius: 8, width: 32, height: 32, cursor: 'pointer', fontSize: 14, color: '#64748b' }}
              aria-label="Cerrar"
            >✕</button>
          </div>

          {/* Description */}
          <div style={{ background: S, borderRadius: 12, padding: '14px 16px', marginBottom: 16 }}>
            <div style={{ fontSize: 14, color: '#334155', lineHeight: 1.6 }}>{ej.descripcion}</div>
          </div>

          {/* Details grid */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginBottom: 16 }}>
            <div style={{ background: S, borderRadius: 10, padding: '12px 14px' }}>
              <div style={{ fontSize: 10, color: '#94a3b8', fontWeight: 600, marginBottom: 2 }}>SERIES / REPS</div>
              <div style={{ fontSize: 15, fontWeight: 800, color: '#0c1b33' }}>{ej.duracion}</div>
            </div>
            <div style={{ background: S, borderRadius: 10, padding: '12px 14px' }}>
              <div style={{ fontSize: 10, color: '#94a3b8', fontWeight: 600, marginBottom: 2 }}>MÚSCULOS</div>
              <div style={{ fontSize: 13, fontWeight: 600, color: '#0c1b33' }}>{ej.musculos.slice(0,2).join(', ')}</div>
            </div>
          </div>

          {/* Rep counter */}
          <div style={{ textAlign: 'center', marginBottom: 16 }}>
            <div style={{ fontSize: 11, color: '#94a3b8', fontWeight: 600, marginBottom: 8 }}>SERIES COMPLETADAS</div>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 20 }}>
              <button
                onClick={() => setReps(r => Math.max(0, r - 1))}
                style={{ width: 40, height: 40, borderRadius: '50%', background: '#f1f5f9', border: 'none', cursor: 'pointer', fontSize: 20, color: '#64748b' }}
                aria-label="Restar serie"
              >−</button>
              <span style={{ fontSize: 36, fontWeight: 800, color: P, minWidth: 50, textAlign: 'center' }}>{reps}</span>
              <button
                onClick={handleComplete}
                style={{ width: 40, height: 40, borderRadius: '50%', background: `${A}18`, border: `2px solid ${A}`, cursor: 'pointer', fontSize: 20, color: A }}
                aria-label="Completar serie"
              >+</button>
            </div>
          </div>

          {/* Feedback */}
          {feedback === 'completed' && (
            <div style={{
              background: `${A}12`, border: `1px solid ${A}44`, borderRadius: 10,
              padding: '10px 14px', textAlign: 'center', marginBottom: 12,
              fontSize: 13, fontWeight: 600, color: '#059669',
              animation: 'feedbackPop .3s cubic-bezier(.22,1,.36,1)',
            }}>
              ✓ ¡Serie completada!
            </div>
          )}

          <button
            onClick={onClose}
            style={{
              width: '100%', background: `linear-gradient(135deg, ${P}, #0284c7)`, color: '#fff',
              border: 'none', borderRadius: 10, padding: 13, fontSize: 14, fontWeight: 700, cursor: 'pointer',
            }}
          >Finalizar ejercicio</button>
        </div>
      </div>
      <style>{`
        @keyframes overlayIn { from { opacity: 0; } to { opacity: 1; } }
        @keyframes modalIn { from { opacity: 0; transform: translate(-50%,-45%) scale(.95); } to { opacity: 1; transform: translate(-50%,-50%); } }
        @keyframes feedbackPop { from { opacity: 0; transform: scale(.9); } to { opacity: 1; transform: none; } }
      `}</style>
    </>
  );
}

export function FisioNovaPilotEjercicios() {
  const [filter, setFilter] = useState('todos');
  const [selectedEj, setSelectedEj] = useState(null);

  const categorias = ['todos', ...new Set(EJERCICIOS_MOCK.map(e => e.categoria))];

  const filtered = filter === 'todos'
    ? EJERCICIOS_MOCK
    : EJERCICIOS_MOCK.filter(e => e.categoria === filter);

  return (
    <div style={{ padding: 24, background: S, minHeight: '100vh' }}>

      {/* Header */}
      <div style={{ marginBottom: 20, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h1 style={{ fontSize: 20, fontWeight: 800, color: '#0c1b33', marginBottom: 2 }}>Ejercicios</h1>
          <p style={{ fontSize: 12, color: '#94a3b8' }}>{filtered.length} ejercicios · Demo datos ficticios</p>
        </div>
      </div>

      {/* Category filters */}
      <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 20 }}>
        {categorias.map(cat => {
          const col = CAT_COLORS[cat] || P;
          const active = filter === cat;
          return (
            <button
              key={cat}
              onClick={() => setFilter(cat)}
              style={{
                background: active ? `linear-gradient(135deg, ${col}, ${col}cc)` : '#fff',
                color: active ? '#fff' : col,
                border: `1.5px solid ${active ? 'transparent' : col + '44'}`,
                borderRadius: 20, padding: '6px 16px', fontSize: 12, fontWeight: 600,
                cursor: 'pointer',
                boxShadow: active ? `0 3px 10px ${col}44` : 'none',
                transition: 'all .15s',
                textTransform: 'capitalize',
              }}
            >{cat === 'todos' ? 'Todos' : cat}</button>
          );
        })}
      </div>

      {/* Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 16 }}>
        {filtered.map(ej => (
          <EjercicioCard key={ej.id} ej={ej} onClick={setSelectedEj} />
        ))}
      </div>

      {/* Modal */}
      {selectedEj && (
        <EjercicioModal ej={selectedEj} onClose={() => setSelectedEj(null)} />
      )}
    </div>
  );
}
