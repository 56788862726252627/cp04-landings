/**
 * OUTPUT GENERADO · FisioNova (Demo) · Presupuestos y Bonos V1.7
 * Fábrica SaaS V1.7 · Demo comercial · Datos ficticios
 */
import { useState } from 'react';
import { BONOS, PACIENTES } from './FisioNovaMockData.js';

const C = { primary: '#4338ca', secondary: '#059669', accent: '#7c3aed', bg: '#eef2ff', border: '#e0e7ff', text: '#1e1b4b', muted: '#6b7280', white: '#ffffff' };

// Presupuestos ficticios pendientes
const PRESUPUESTOS_PENDIENTES = [
  { id: 'ps1', paciente: 'David Molina', bono: 'Plan Recuperación Total', estado: 'enviado', importe: 499, fecha: '2026-08-27' },
  { id: 'ps2', paciente: 'Patricia Iglesias', bono: 'Bono 10 sesiones', estado: 'pendiente', importe: 540, fecha: '2026-08-26' },
  { id: 'ps3', paciente: 'Fernando Blasco', bono: 'Pack Deportista', estado: 'aceptado', importe: 350, fecha: '2026-08-25' },
  { id: 'ps4', paciente: 'Raquel Sanz', bono: 'Bono 5 sesiones', estado: 'rechazado', importe: 290, fecha: '2026-08-24' },
];

const ESTADO_PRES = {
  pendiente:  { label: 'Pendiente', bg: '#fef3c7', color: '#d97706' },
  enviado:    { label: 'Enviado', bg: '#e0e7ff', color: C.primary },
  aceptado:   { label: 'Aceptado', bg: '#d1fae5', color: '#059669' },
  rechazado:  { label: 'Rechazado', bg: '#fee2e2', color: '#dc2626' },
};

function TarjetaBono({ bono, onSelect, seleccionado }) {
  const destaca = bono.tipo === 'pack';
  return (
    <div onClick={() => onSelect(bono)} style={{
      background: destaca ? `linear-gradient(135deg, ${C.primary}, #3730a3)` : C.white,
      color: destaca ? '#fff' : C.text,
      borderRadius: '1.25rem',
      padding: '1.5rem',
      border: `2px solid ${seleccionado ? C.accent : destaca ? 'transparent' : C.border}`,
      cursor: 'pointer',
      transition: 'all 0.2s',
      position: 'relative',
      boxShadow: destaca ? '0 8px 24px rgba(67,56,202,0.35)' : 'none',
    }}>
      {destaca && <div style={{ position: 'absolute', top: '-0.5rem', right: '1rem', background: '#d97706', color: '#fff', fontSize: '0.7rem', fontWeight: 700, padding: '0.2rem 0.75rem', borderRadius: '1rem' }}>RECOMENDADO</div>}
      <div style={{ fontSize: '0.78rem', fontWeight: 700, opacity: 0.8, marginBottom: '0.5rem', textTransform: 'uppercase' }}>{bono.tipo === 'pack' ? '🎁 Pack' : bono.tipo === 'bono' ? '🎟 Bono' : '💳 Individual'}</div>
      <h3 style={{ fontWeight: 800, fontSize: '1.05rem', marginBottom: '0.75rem' }}>{bono.nombre}</h3>
      <div style={{ fontSize: '2rem', fontWeight: 900, marginBottom: '0.25rem' }}>{bono.precio}€</div>
      {bono.ahorro && <div style={{ fontSize: '0.8rem', opacity: 0.85, marginBottom: '0.75rem' }}>Ahorro: {bono.ahorro}</div>}
      <div style={{ fontSize: '0.82rem', opacity: 0.85, marginBottom: '0.5rem' }}>🗓 Válido {bono.validez}</div>
      <div style={{ fontSize: '0.82rem', opacity: 0.85 }}>📅 {bono.sesiones} {bono.sesiones === 1 ? 'sesión' : 'sesiones'}</div>
      {bono.desc && <p style={{ fontSize: '0.78rem', opacity: 0.8, marginTop: '0.75rem', lineHeight: 1.5 }}>{bono.desc}</p>}
      {seleccionado && <div style={{ marginTop: '1rem', background: 'rgba(255,255,255,0.2)', borderRadius: '0.5rem', padding: '0.5rem', fontSize: '0.8rem', textAlign: 'center', fontWeight: 700 }}>✓ Seleccionado</div>}
    </div>
  );
}

export function FisioNovaPresupuestos() {
  const [tab, setTab] = useState('bonos');
  const [bonoSeleccionado, setBonoSeleccionado] = useState(null);
  const [pacienteSeleccionado, setPacienteSeleccionado] = useState('');
  const [enviado, setEnviado] = useState(false);

  const handleEnviar = () => {
    if (!bonoSeleccionado || !pacienteSeleccionado) return;
    setEnviado(true);
    setTimeout(() => setEnviado(false), 3000);
  };

  return (
    <div style={{ padding: '1.5rem', maxWidth: '1100px', margin: '0 auto' }}>
      <div style={{ marginBottom: '1.5rem' }}>
        <h1 style={{ fontSize: '1.5rem', fontWeight: 800, color: C.text }}>Presupuestos & Bonos</h1>
        <p style={{ color: C.muted, fontSize: '0.9rem' }}>Gestión comercial y bonos de sesiones (demo ficticio)</p>
      </div>

      {/* Tabs */}
      <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1.5rem' }}>
        {[{ id: 'bonos', label: '🎟 Catálogo bonos' }, { id: 'presupuestos', label: '📋 Presupuestos' }, { id: 'nuevo', label: '➕ Nuevo presupuesto' }].map(t => (
          <button key={t.id} onClick={() => setTab(t.id)}
            style={{ padding: '0.6rem 1.25rem', borderRadius: '0.75rem', border: `1.5px solid ${tab === t.id ? C.primary : C.border}`, background: tab === t.id ? C.primary : C.white, color: tab === t.id ? '#fff' : C.muted, fontWeight: 700, cursor: 'pointer', fontSize: '0.85rem' }}>
            {t.label}
          </button>
        ))}
      </div>

      {/* Catálogo bonos */}
      {tab === 'bonos' && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: '1.25rem' }}>
          {BONOS.map(b => <TarjetaBono key={b.id} bono={b} onSelect={setBonoSeleccionado} seleccionado={bonoSeleccionado?.id === b.id} />)}
        </div>
      )}

      {/* Presupuestos pendientes */}
      {tab === 'presupuestos' && (
        <div style={{ background: C.white, borderRadius: '1rem', border: `1.5px solid ${C.border}`, overflow: 'hidden' }}>
          <div style={{ padding: '1rem 1.25rem', borderBottom: `1px solid ${C.border}`, background: C.bg }}>
            <div style={{ display: 'grid', gridTemplateColumns: '2fr 2fr 1fr 1fr 1fr', gap: '1rem', fontSize: '0.75rem', fontWeight: 700, color: C.muted, textTransform: 'uppercase' }}>
              <span>Paciente</span><span>Bono</span><span>Importe</span><span>Fecha</span><span>Estado</span>
            </div>
          </div>
          {PRESUPUESTOS_PENDIENTES.map((p, i) => {
            const est = ESTADO_PRES[p.estado] ?? {};
            return (
              <div key={p.id} style={{ padding: '1rem 1.25rem', borderBottom: i < PRESUPUESTOS_PENDIENTES.length - 1 ? `1px solid ${C.border}` : 'none', display: 'grid', gridTemplateColumns: '2fr 2fr 1fr 1fr 1fr', gap: '1rem', alignItems: 'center' }}>
                <span style={{ fontWeight: 600, color: C.text, fontSize: '0.9rem' }}>{p.paciente}</span>
                <span style={{ fontSize: '0.85rem', color: C.muted }}>{p.bono}</span>
                <span style={{ fontWeight: 800, color: C.primary }}>{p.importe}€</span>
                <span style={{ fontSize: '0.82rem', color: C.muted }}>{p.fecha.slice(5)}</span>
                <span style={{ background: est.bg, color: est.color, fontSize: '0.72rem', fontWeight: 700, padding: '0.2rem 0.6rem', borderRadius: '1rem', display: 'inline-block' }}>{est.label}</span>
              </div>
            );
          })}
        </div>
      )}

      {/* Nuevo presupuesto */}
      {tab === 'nuevo' && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '1.5rem' }}>
          <div>
            <h2 style={{ fontWeight: 700, color: C.text, marginBottom: '1rem', fontSize: '1rem' }}>1. Selecciona paciente</h2>
            <select value={pacienteSeleccionado} onChange={e => setPacienteSeleccionado(e.target.value)}
              style={{ width: '100%', padding: '0.75rem 1rem', borderRadius: '0.75rem', border: `1.5px solid ${C.border}`, fontSize: '0.9rem', background: C.white }}>
              <option value="">— Seleccionar paciente —</option>
              {PACIENTES.map(p => <option key={p.id} value={p.id}>{p.nombre}</option>)}
            </select>

            <h2 style={{ fontWeight: 700, color: C.text, margin: '1.5rem 0 1rem', fontSize: '1rem' }}>2. Elige bono o pack</h2>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              {BONOS.map(b => (
                <div key={b.id} onClick={() => setBonoSeleccionado(b)}
                  style={{ padding: '1rem', borderRadius: '0.875rem', border: `2px solid ${bonoSeleccionado?.id === b.id ? C.primary : C.border}`, background: bonoSeleccionado?.id === b.id ? C.bg : C.white, cursor: 'pointer', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div>
                    <div style={{ fontWeight: 700, color: C.text, fontSize: '0.9rem' }}>{b.nombre}</div>
                    <div style={{ fontSize: '0.78rem', color: C.muted }}>{b.sesiones} sesiones · {b.validez}</div>
                  </div>
                  <div style={{ fontWeight: 900, color: C.primary, fontSize: '1.1rem' }}>{b.precio}€</div>
                </div>
              ))}
            </div>
          </div>

          <div>
            <h2 style={{ fontWeight: 700, color: C.text, marginBottom: '1rem', fontSize: '1rem' }}>3. Resumen del presupuesto</h2>
            <div style={{ background: C.white, borderRadius: '1rem', padding: '1.5rem', border: `1.5px solid ${C.border}` }}>
              {bonoSeleccionado
                ? (
                  <>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', marginBottom: '1.5rem' }}>
                      {[
                        { l: 'Paciente', v: PACIENTES.find(p => p.id === pacienteSeleccionado)?.nombre ?? '—' },
                        { l: 'Bono / Pack', v: bonoSeleccionado.nombre },
                        { l: 'Sesiones', v: bonoSeleccionado.sesiones },
                        { l: 'Validez', v: bonoSeleccionado.validez },
                        { l: 'Importe total', v: `${bonoSeleccionado.precio}€`, bold: true },
                      ].map(({ l, v, bold }) => (
                        <div key={l} style={{ display: 'flex', justifyContent: 'space-between', padding: '0.5rem 0', borderBottom: `1px solid ${C.border}` }}>
                          <span style={{ fontSize: '0.85rem', color: C.muted }}>{l}</span>
                          <span style={{ fontSize: '0.9rem', fontWeight: bold ? 900 : 600, color: bold ? C.primary : C.text }}>{v}</span>
                        </div>
                      ))}
                    </div>
                    {enviado
                      ? <div style={{ background: '#d1fae5', color: '#059669', fontWeight: 700, padding: '1rem', borderRadius: '0.75rem', textAlign: 'center' }}>✅ Presupuesto enviado (simulado)</div>
                      : <button onClick={handleEnviar} disabled={!pacienteSeleccionado}
                          style={{ width: '100%', padding: '0.875rem', borderRadius: '0.75rem', background: pacienteSeleccionado ? C.primary : '#cbd5e1', color: '#fff', fontWeight: 800, border: 'none', cursor: pacienteSeleccionado ? 'pointer' : 'not-allowed', fontSize: '1rem' }}>
                          Enviar presupuesto (demo) →
                        </button>
                    }
                  </>
                )
                : <p style={{ color: C.muted, textAlign: 'center', padding: '2rem 0' }}>Selecciona un bono para ver el resumen</p>
              }
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
