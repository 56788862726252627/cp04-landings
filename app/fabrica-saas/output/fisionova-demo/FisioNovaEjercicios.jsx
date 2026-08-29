/**
 * OUTPUT GENERADO · FisioNova (Demo) · Biblioteca de Ejercicios V1.7
 * Fábrica SaaS V1.7 · Demo comercial · Datos ficticios
 */
import { useState, useMemo } from 'react';
import { EJERCICIOS } from './FisioNovaMockData.js';

const C = { primary: '#4338ca', secondary: '#059669', accent: '#7c3aed', bg: '#eef2ff', border: '#e0e7ff', text: '#1e1b4b', muted: '#6b7280', white: '#ffffff' };

const NIVEL_COLOR = {
  'Básico':      { bg: '#d1fae5', color: '#059669' },
  'Intermedio':  { bg: '#fef3c7', color: '#d97706' },
  'Avanzado':    { bg: '#fce7f3', color: '#be185d' },
};

const ZONAS = ['Todas', 'Tren inferior', 'Core', 'Core lateral', 'Hombro', 'Brazo', 'Tobillo · Pie', 'Cadera · Glúteo', 'Glúteos · Core', 'Posterior de muslo', 'Core profundo', 'Core anti-rotacional'];
const NIVELES = ['Todos', 'Básico', 'Intermedio', 'Avanzado'];

// Simulated video poster colors per zone
const ZONE_COLOR = {
  'Tren inferior': '#4338ca', 'Core': '#059669', 'Core lateral': '#7c3aed',
  'Hombro': '#dc2626', 'Brazo': '#d97706', 'Tobillo · Pie': '#0891b2',
  'Cadera · Glúteo': '#be185d', 'Glúteos · Core': '#059669',
  'Posterior de muslo': '#4338ca', 'Core profundo': '#7c3aed', 'Core anti-rotacional': '#dc2626',
};

function VideoPlaceholder({ zona }) {
  const color = ZONE_COLOR[zona] ?? C.primary;
  return (
    <div style={{ height: '140px', background: `linear-gradient(135deg, ${color}20 0%, ${color}40 100%)`, borderRadius: '0.75rem 0.75rem 0 0', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', position: 'relative', overflow: 'hidden' }}>
      <div style={{ position: 'absolute', top: '0.5rem', right: '0.5rem', background: 'rgba(0,0,0,0.5)', color: '#fff', borderRadius: '0.25rem', fontSize: '0.65rem', padding: '0.15rem 0.4rem' }}>DEMO</div>
      <div style={{ fontSize: '2.5rem', marginBottom: '0.5rem' }}>▶️</div>
      <div style={{ fontSize: '0.72rem', color: color, fontWeight: 700 }}>Video ejercicio (demo)</div>
      <div style={{ position: 'absolute', bottom: '0.5rem', left: '0.5rem', background: `${color}20`, borderRadius: '0.25rem', fontSize: '0.65rem', color, padding: '0.15rem 0.4rem', fontWeight: 600 }}>{zona}</div>
    </div>
  );
}

function TarjetaEjercicio({ ej, favorito, onToggleFav, onSelect }) {
  const nivel = NIVEL_COLOR[ej.nivel] ?? {};
  return (
    <div style={{ background: C.white, borderRadius: '1rem', border: `1.5px solid ${C.border}`, overflow: 'hidden', transition: 'box-shadow 0.2s', cursor: 'pointer' }}>
      <div onClick={() => onSelect(ej)}>
        <VideoPlaceholder zona={ej.zona} nombre={ej.nombre} />
        <div style={{ padding: '1rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.5rem' }}>
            <h3 style={{ fontWeight: 700, color: C.text, fontSize: '0.95rem', flex: 1 }}>{ej.nombre}</h3>
            <button onClick={e => { e.stopPropagation(); onToggleFav(ej.id); }}
              style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '1.2rem', padding: 0, marginLeft: '0.5rem' }}>
              {favorito ? '❤️' : '🤍'}
            </button>
          </div>
          <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '0.75rem', flexWrap: 'wrap' }}>
            <span style={{ ...nivel, fontSize: '0.72rem', fontWeight: 700, padding: '0.15rem 0.5rem', borderRadius: '1rem' }}>{ej.nivel}</span>
            <span style={{ background: C.bg, color: C.primary, fontSize: '0.72rem', fontWeight: 600, padding: '0.15rem 0.5rem', borderRadius: '1rem' }}>{ej.zona}</span>
          </div>
          <p style={{ fontSize: '0.82rem', color: C.muted, marginBottom: '0.75rem' }}>{ej.objetivo}</p>
          <div style={{ display: 'flex', gap: '1rem', fontSize: '0.78rem', color: C.text }}>
            <span>🔁 {ej.series} series × {ej.reps}</span>
            <span>⏱ {ej.duracion}</span>
          </div>
        </div>
      </div>
    </div>
  );
}

function ModalEjercicio({ ej, onClose }) {
  if (!ej) return null;
  const nivel = NIVEL_COLOR[ej.nivel] ?? {};
  return (
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', zIndex: 50, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem' }} onClick={onClose}>
      <div style={{ background: C.white, borderRadius: '1.25rem', maxWidth: '500px', width: '100%', overflow: 'hidden', boxShadow: '0 10px 40px rgba(0,0,0,0.3)' }} onClick={e => e.stopPropagation()}>
        <VideoPlaceholder zona={ej.zona} nombre={ej.nombre} />
        <div style={{ padding: '1.5rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1rem' }}>
            <h2 style={{ fontWeight: 800, fontSize: '1.2rem', color: C.text, flex: 1 }}>{ej.nombre}</h2>
            <button onClick={onClose} style={{ background: C.bg, border: 'none', borderRadius: '50%', width: '2rem', height: '2rem', cursor: 'pointer', color: C.muted }}>✕</button>
          </div>
          <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1rem', flexWrap: 'wrap' }}>
            <span style={{ ...nivel, fontSize: '0.78rem', fontWeight: 700, padding: '0.25rem 0.75rem', borderRadius: '1rem' }}>{ej.nivel}</span>
            <span style={{ background: C.bg, color: C.primary, fontSize: '0.78rem', fontWeight: 600, padding: '0.25rem 0.75rem', borderRadius: '1rem' }}>{ej.zona}</span>
          </div>
          <p style={{ color: C.muted, fontSize: '0.9rem', lineHeight: 1.5, marginBottom: '1.25rem' }}><strong>Objetivo:</strong> {ej.objetivo}</p>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '0.75rem', marginBottom: '1.25rem' }}>
            {[{ l: 'Series', v: ej.series }, { l: 'Repeticiones', v: ej.reps }, { l: 'Duración', v: ej.duracion }].map(({ l, v }) => (
              <div key={l} style={{ background: C.bg, borderRadius: '0.75rem', padding: '0.75rem', textAlign: 'center' }}>
                <div style={{ fontSize: '0.7rem', color: C.muted, marginBottom: '0.25rem' }}>{l}</div>
                <div style={{ fontWeight: 800, color: C.primary }}>{v}</div>
              </div>
            ))}
          </div>
          <div style={{ display: 'flex', gap: '0.4rem', flexWrap: 'wrap', marginBottom: '1.5rem' }}>
            {ej.tags.map(t => <span key={t} style={{ background: C.bg, color: C.primary, fontSize: '0.72rem', padding: '0.2rem 0.6rem', borderRadius: '1rem', fontWeight: 600 }}>#{t}</span>)}
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
            <button style={{ padding: '0.75rem', borderRadius: '0.6rem', background: C.primary, color: '#fff', fontWeight: 700, border: 'none', cursor: 'pointer' }}>
              Asignar a paciente (demo)
            </button>
            <button style={{ padding: '0.75rem', borderRadius: '0.6rem', background: C.white, color: C.text, fontWeight: 600, border: `1.5px solid ${C.border}`, cursor: 'pointer' }}>
              Ver guía completa (demo)
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export function FisioNovaEjercicios() {
  const [busqueda, setBusqueda] = useState('');
  const [filtroZona, setFiltroZona] = useState('Todas');
  const [filtroNivel, setFiltroNivel] = useState('Todos');
  const [favoritos, setFavoritos] = useState(new Set(['e2', 'e8']));
  const [mostrarFavs, setMostrarFavs] = useState(false);
  const [ejercicioActivo, setEjercicioActivo] = useState(null);

  const toggleFav = id => setFavoritos(prev => {
    const next = new Set(prev);
    next.has(id) ? next.delete(id) : next.add(id);
    return next;
  });

  const ejerciciosFiltrados = useMemo(() => EJERCICIOS.filter(e => {
    if (mostrarFavs && !favoritos.has(e.id)) return false;
    if (filtroZona !== 'Todas' && e.zona !== filtroZona) return false;
    if (filtroNivel !== 'Todos' && e.nivel !== filtroNivel) return false;
    if (busqueda && !e.nombre.toLowerCase().includes(busqueda.toLowerCase()) && !e.tags.some(t => t.includes(busqueda.toLowerCase()))) return false;
    return true;
  }), [busqueda, filtroZona, filtroNivel, mostrarFavs, favoritos]);

  return (
    <div style={{ padding: '1.5rem', maxWidth: '1100px', margin: '0 auto' }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h1 style={{ fontSize: '1.5rem', fontWeight: 800, color: C.text }}>Biblioteca de Ejercicios</h1>
          <p style={{ color: C.muted, fontSize: '0.9rem' }}>{EJERCICIOS.length} ejercicios terapéuticos · Video on-demand (demo)</p>
        </div>
        <button style={{ background: C.primary, color: '#fff', fontWeight: 700, padding: '0.7rem 1.5rem', borderRadius: '0.75rem', border: 'none', cursor: 'pointer' }}>
          + Nuevo ejercicio (demo)
        </button>
      </div>

      {/* Filtros */}
      <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap', marginBottom: '1.5rem', alignItems: 'center' }}>
        <input value={busqueda} onChange={e => setBusqueda(e.target.value)} placeholder="Buscar ejercicio o tag..."
          style={{ flex: 1, minWidth: '180px', padding: '0.6rem 1rem', borderRadius: '0.5rem', border: `1.5px solid ${C.border}`, fontSize: '0.85rem' }} />
        <select value={filtroNivel} onChange={e => setFiltroNivel(e.target.value)}
          style={{ padding: '0.6rem 0.75rem', borderRadius: '0.5rem', border: `1.5px solid ${C.border}`, fontSize: '0.85rem', background: C.white }}>
          {NIVELES.map(n => <option key={n}>{n}</option>)}
        </select>
        <select value={filtroZona} onChange={e => setFiltroZona(e.target.value)}
          style={{ padding: '0.6rem 0.75rem', borderRadius: '0.5rem', border: `1.5px solid ${C.border}`, fontSize: '0.85rem', background: C.white }}>
          {ZONAS.map(z => <option key={z}>{z}</option>)}
        </select>
        <button onClick={() => setMostrarFavs(!mostrarFavs)}
          style={{ padding: '0.6rem 1rem', borderRadius: '0.5rem', border: `1.5px solid ${mostrarFavs ? '#dc2626' : C.border}`, background: mostrarFavs ? '#fee2e2' : C.white, color: mostrarFavs ? '#dc2626' : C.muted, fontWeight: 600, cursor: 'pointer', fontSize: '0.85rem' }}>
          {mostrarFavs ? '❤️ Solo favoritos' : '🤍 Favoritos'}
        </button>
      </div>

      {ejerciciosFiltrados.length === 0
        ? <p style={{ textAlign: 'center', color: C.muted, padding: '3rem 0' }}>Sin resultados para los filtros seleccionados</p>
        : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: '1.25rem' }}>
            {ejerciciosFiltrados.map(ej => (
              <TarjetaEjercicio key={ej.id} ej={ej} favorito={favoritos.has(ej.id)} onToggleFav={toggleFav} onSelect={setEjercicioActivo} />
            ))}
          </div>
        )
      }

      <ModalEjercicio ej={ejercicioActivo} onClose={() => setEjercicioActivo(null)} />
    </div>
  );
}
