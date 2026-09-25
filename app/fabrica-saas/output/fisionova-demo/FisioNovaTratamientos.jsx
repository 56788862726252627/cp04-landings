/**
 * OUTPUT GENERADO · FisioNova (Demo) · Tratamientos V1.7
 * Fábrica SaaS V1.7 · Demo comercial · Datos ficticios
 */
import { useState } from 'react';
import { SERVICIOS } from './FisioNovaMockData.js';

const C = { primary: '#4338ca', secondary: '#059669', accent: '#7c3aed', bg: '#eef2ff', border: '#e0e7ff', text: '#1e1b4b', muted: '#6b7280', white: '#ffffff' };

// Protocolos de tratamiento ficticios
const PROTOCOLOS = [
  { id: 'pr1', nombre: 'Protocolo Rodilla Post-ACL', sesiones: 16, fases: ['Fase 1 · Control del dolor (S1-S2)', 'Fase 2 · Movilidad articular (S3-S6)', 'Fase 3 · Fuerza muscular (S7-S12)', 'Fase 4 · Readaptación funcional (S13-S16)'], servicio: 'rehabilitacion', activos: 3 },
  { id: 'pr2', nombre: 'Protocolo Dolor Lumbar Crónico', sesiones: 12, fases: ['Fase 1 · Educación del dolor (S1-S2)', 'Fase 2 · Terapia manual (S3-S6)', 'Fase 3 · Estabilización core (S7-S10)', 'Fase 4 · Mantenimiento (S11-S12)'], servicio: 'dolor-cronico', activos: 5 },
  { id: 'pr3', nombre: 'Protocolo Hombro Deportivo', sesiones: 10, fases: ['Fase 1 · Reducción inflamación (S1-S2)', 'Fase 2 · Movilidad (S3-S5)', 'Fase 3 · Fortalecimiento (S6-S8)', 'Fase 4 · Vuelta al deporte (S9-S10)'], servicio: 'deportiva', activos: 4 },
  { id: 'pr4', nombre: 'Protocolo Suelo Pélvico Postparto', sesiones: 8, fases: ['Fase 1 · Evaluación y educación (S1-S2)', 'Fase 2 · Activación y conciencia (S3-S5)', 'Fase 3 · Progresión funcional (S6-S8)'], servicio: 'suelo-pelvico', activos: 2 },
];

function TarjetaServicio({ s, activo, onClick }) {
  return (
    <div onClick={onClick} style={{ background: C.white, borderRadius: '1rem', padding: '1.25rem', border: `1.5px solid ${activo ? C.primary : C.border}`, cursor: 'pointer', transition: 'all 0.2s', boxShadow: activo ? '0 4px 16px rgba(67,56,202,0.15)' : 'none' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.75rem' }}>
        <span style={{ fontSize: '2rem' }}>{s.icono}</span>
        <div style={{ textAlign: 'right' }}>
          {s.popular && <span style={{ background: C.secondary, color: '#fff', fontSize: '0.65rem', fontWeight: 700, padding: '0.15rem 0.5rem', borderRadius: '1rem', display: 'block', marginBottom: '0.25rem' }}>POPULAR</span>}
          <span style={{ fontWeight: 800, color: C.secondary, fontSize: '0.9rem' }}>{s.precio}</span>
        </div>
      </div>
      <h3 style={{ fontWeight: 700, color: C.text, marginBottom: '0.4rem', fontSize: '0.95rem' }}>{s.nombre}</h3>
      <p style={{ fontSize: '0.82rem', color: C.muted, lineHeight: 1.5, marginBottom: '0.75rem' }}>{s.desc}</p>
      <div style={{ display: 'flex', gap: '0.75rem', fontSize: '0.78rem', color: C.muted }}>
        <span>⏱ {s.duracion}</span>
        <span>🏷 {s.tags.slice(0,2).join(', ')}</span>
      </div>
    </div>
  );
}

function ModalProtocolo({ protocolo, onClose }) {
  if (!protocolo) return null;
  return (
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.4)', zIndex: 50, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem' }} onClick={onClose}>
      <div style={{ background: C.white, borderRadius: '1.25rem', maxWidth: '520px', width: '100%', padding: '2rem', boxShadow: '0 10px 40px rgba(0,0,0,0.2)' }} onClick={e => e.stopPropagation()}>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1.25rem' }}>
          <h2 style={{ fontWeight: 800, color: C.text }}>{protocolo.nombre}</h2>
          <button onClick={onClose} style={{ background: C.bg, border: 'none', borderRadius: '50%', width: '2rem', height: '2rem', cursor: 'pointer' }}>✕</button>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem', marginBottom: '1.5rem' }}>
          {[{ l: 'Sesiones', v: protocolo.sesiones }, { l: 'Pacientes activos', v: protocolo.activos }].map(({ l, v }) => (
            <div key={l} style={{ background: C.bg, borderRadius: '0.75rem', padding: '0.875rem', textAlign: 'center' }}>
              <div style={{ fontSize: '0.7rem', color: C.muted, marginBottom: '0.25rem' }}>{l}</div>
              <div style={{ fontWeight: 800, fontSize: '1.5rem', color: C.primary }}>{v}</div>
            </div>
          ))}
        </div>
        <h3 style={{ fontWeight: 700, fontSize: '0.9rem', color: C.text, marginBottom: '0.75rem' }}>Fases del tratamiento</h3>
        {protocolo.fases.map((f, i) => (
          <div key={i} style={{ display: 'flex', gap: '0.75rem', padding: '0.6rem 0', borderBottom: `1px solid ${C.border}` }}>
            <div style={{ width: '1.5rem', height: '1.5rem', borderRadius: '50%', background: C.primary, color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.7rem', fontWeight: 800, flexShrink: 0 }}>{i+1}</div>
            <span style={{ fontSize: '0.85rem', color: C.text }}>{f}</span>
          </div>
        ))}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem', marginTop: '1.5rem' }}>
          <button style={{ padding: '0.7rem', borderRadius: '0.6rem', background: C.primary, color: '#fff', fontWeight: 700, border: 'none', cursor: 'pointer' }}>Asignar protocolo (demo)</button>
          <button style={{ padding: '0.7rem', borderRadius: '0.6rem', background: C.white, color: C.text, fontWeight: 600, border: `1.5px solid ${C.border}`, cursor: 'pointer' }}>Editar (demo)</button>
        </div>
      </div>
    </div>
  );
}

export function FisioNovaTratamientos() {
  const [tab, setTab] = useState('servicios');
  const [servicioActivo, setServicioActivo] = useState(null);
  const [protocoloActivo, setProtocoloActivo] = useState(null);
  const svc = SERVICIOS.find(s => s.id === servicioActivo);

  return (
    <div style={{ padding: '1.5rem', maxWidth: '1100px', margin: '0 auto' }}>
      <div style={{ marginBottom: '1.5rem' }}>
        <h1 style={{ fontSize: '1.5rem', fontWeight: 800, color: C.text }}>Tratamientos</h1>
        <p style={{ color: C.muted, fontSize: '0.9rem' }}>Catálogo de servicios y protocolos clínicos (demo ficticio)</p>
      </div>

      {/* Tabs */}
      <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1.5rem', borderBottom: `2px solid ${C.border}`, paddingBottom: '0' }}>
        {[{ id: 'servicios', label: '🩺 Servicios' }, { id: 'protocolos', label: '📋 Protocolos' }].map(t => (
          <button key={t.id} onClick={() => setTab(t.id)}
            style={{ padding: '0.6rem 1.25rem', borderRadius: '0.5rem 0.5rem 0 0', border: 'none', background: tab === t.id ? C.primary : 'transparent', color: tab === t.id ? '#fff' : C.muted, fontWeight: 700, cursor: 'pointer', fontSize: '0.9rem' }}>
            {t.label}
          </button>
        ))}
      </div>

      {tab === 'servicios' && (
        <>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '1.25rem' }}>
            {SERVICIOS.map(s => <TarjetaServicio key={s.id} s={s} activo={servicioActivo === s.id} onClick={() => setServicioActivo(servicioActivo === s.id ? null : s.id)} />)}
          </div>
          {svc && (
            <div style={{ marginTop: '1.5rem', background: C.white, borderRadius: '1rem', padding: '1.5rem', border: `1.5px solid ${C.primary}` }}>
              <h2 style={{ fontWeight: 800, color: C.text, marginBottom: '1rem' }}>{svc.nombre}</h2>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '0.75rem' }}>
                {[{ l: 'Duración', v: svc.duracion }, { l: 'Precio', v: svc.precio }, { l: 'Tags', v: svc.tags.join(', ') }].map(({ l, v }) => (
                  <div key={l} style={{ background: C.bg, borderRadius: '0.75rem', padding: '0.875rem' }}>
                    <div style={{ fontSize: '0.7rem', color: C.muted, marginBottom: '0.25rem' }}>{l}</div>
                    <div style={{ fontWeight: 700, color: C.text }}>{v}</div>
                  </div>
                ))}
              </div>
              <button style={{ marginTop: '1rem', background: C.primary, color: '#fff', fontWeight: 700, padding: '0.7rem 1.5rem', borderRadius: '0.6rem', border: 'none', cursor: 'pointer' }}>
                Reservar para paciente (demo)
              </button>
            </div>
          )}
        </>
      )}

      {tab === 'protocolos' && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '1.25rem' }}>
          {PROTOCOLOS.map(p => (
            <div key={p.id} onClick={() => setProtocoloActivo(p)} style={{ background: C.white, borderRadius: '1rem', padding: '1.25rem', border: `1.5px solid ${C.border}`, cursor: 'pointer', transition: 'all 0.2s' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.75rem' }}>
                <span style={{ background: `${C.primary}15`, color: C.primary, fontSize: '0.72rem', fontWeight: 700, padding: '0.2rem 0.6rem', borderRadius: '1rem' }}>{p.sesiones} sesiones</span>
                <span style={{ background: `${C.secondary}15`, color: C.secondary, fontSize: '0.72rem', fontWeight: 700, padding: '0.2rem 0.6rem', borderRadius: '1rem' }}>{p.activos} activos</span>
              </div>
              <h3 style={{ fontWeight: 700, color: C.text, marginBottom: '0.75rem' }}>{p.nombre}</h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
                {p.fases.slice(0,2).map((f, i) => (
                  <div key={i} style={{ display: 'flex', gap: '0.5rem', fontSize: '0.78rem', color: C.muted }}>
                    <span style={{ color: C.primary, fontWeight: 700 }}>·</span>{f}
                  </div>
                ))}
                {p.fases.length > 2 && <span style={{ fontSize: '0.75rem', color: C.primary }}>+{p.fases.length - 2} fases más…</span>}
              </div>
            </div>
          ))}
        </div>
      )}

      <ModalProtocolo protocolo={protocoloActivo} onClose={() => setProtocoloActivo(null)} />
    </div>
  );
}
