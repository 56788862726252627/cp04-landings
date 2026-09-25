/**
 * FisioNova Premium V2 Pilot — CRM Pacientes (master-detail)
 * Demo comercial · Datos ficticios · NO producción
 */
import { useState } from 'react';
import { PACIENTES_MOCK, EVOLUCION_MOCK, BRANDING_V2 } from './FisioNovaPilotMockData.js';

const P = BRANDING_V2.primaryColor;
const A = BRANDING_V2.accentColor;
const S = BRANDING_V2.surfaceColor;

const ESTADO_MAP = {
  activo: { bg: `${A}18`, text: '#059669' },
  alta:   { bg: '#fef3c7', text: '#92400e' },
};

function SearchBar({ value, onChange }) {
  return (
    <div style={{ position: 'relative' }}>
      <span style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: '#94a3b8', fontSize: 14 }}>🔍</span>
      <input
        value={value}
        onChange={e => onChange(e.target.value)}
        placeholder="Buscar paciente..."
        style={{
          width: '100%', padding: '10px 14px 10px 36px', borderRadius: 10, boxSizing: 'border-box',
          border: '1.5px solid #e2e8f0', fontSize: 13, outline: 'none', background: '#fff',
        }}
        onFocus={e => { e.target.style.borderColor = P; e.target.style.boxShadow = `0 0 0 3px ${P}18`; }}
        onBlur={e => { e.target.style.borderColor = '#e2e8f0'; e.target.style.boxShadow = ''; }}
        aria-label="Buscar paciente"
      />
    </div>
  );
}

function PacienteListItem({ p, selected, onClick }) {
  const [hover, setHover] = useState(false);
  const col = ESTADO_MAP[p.estado] || ESTADO_MAP.activo;
  return (
    <div
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      onClick={() => onClick(p)}
      role="button" tabIndex={0}
      onKeyDown={e => { if (e.key === 'Enter') onClick(p); }}
      style={{
        display: 'flex', alignItems: 'center', gap: 12, padding: '12px 14px',
        borderRadius: 10, cursor: 'pointer',
        background: selected ? `${P}12` : hover ? `${P}06` : 'transparent',
        border: `1.5px solid ${selected ? P + '44' : 'transparent'}`,
        transition: 'background .15s, border-color .15s',
      }}
      aria-selected={selected}
    >
      <div style={{
        width: 40, height: 40, borderRadius: '50%', flexShrink: 0,
        background: selected ? `linear-gradient(135deg, ${P}, #0284c7)` : `${P}18`,
        display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18,
      }}>{p.foto}</div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontWeight: 700, fontSize: 13, color: '#0c1b33', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
          {p.nombre}
        </div>
        <div style={{ fontSize: 11, color: '#94a3b8' }}>{p.edad} años · {p.sesiones} sesiones</div>
      </div>
      <span style={{ background: col.bg, color: col.text, fontSize: 9, fontWeight: 700, borderRadius: 20, padding: '2px 7px' }}>
        {p.estado}
      </span>
    </div>
  );
}

function PacienteDetail({ p }) {
  const [tab, setTab] = useState('historia');
  const col = ESTADO_MAP[p.estado] || ESTADO_MAP.activo;
  const s = EVOLUCION_MOCK.sesiones;

  return (
    <div style={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      {/* Header */}
      <div style={{
        background: `linear-gradient(135deg, ${P}, #0284c7)`,
        borderRadius: '14px 14px 0 0', padding: '20px 24px', color: '#fff',
        display: 'flex', gap: 16, alignItems: 'center',
      }}>
        <div style={{
          width: 56, height: 56, borderRadius: '50%',
          background: 'rgba(255,255,255,.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 28,
        }}>{p.foto}</div>
        <div style={{ flex: 1 }}>
          <div style={{ fontWeight: 800, fontSize: 18 }}>{p.nombre}</div>
          <div style={{ fontSize: 12, opacity: .8, marginTop: 2 }}>{p.diagnostico}</div>
        </div>
        <div style={{
          background: col.bg, color: col.text,
          fontSize: 11, fontWeight: 700, borderRadius: 20, padding: '4px 12px',
        }}>{p.estado}</div>
      </div>

      {/* Quick stats */}
      <div style={{
        display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 0,
        background: `${P}08`, borderTop: 'none',
      }}>
        {[
          { label: 'Edad', value: `${p.edad}a` },
          { label: 'Sesiones', value: p.sesiones },
          { label: 'Última visita', value: p.ultima.slice(5) },
          { label: 'Estado', value: p.estado },
        ].map(({ label, value }, i) => (
          <div key={i} style={{
            padding: '14px 12px', textAlign: 'center',
            borderRight: i < 3 ? `1px solid ${P}18` : 'none',
          }}>
            <div style={{ fontSize: 15, fontWeight: 800, color: P }}>{value}</div>
            <div style={{ fontSize: 10, color: '#94a3b8', marginTop: 2 }}>{label}</div>
          </div>
        ))}
      </div>

      {/* Tabs */}
      <div style={{ display: 'flex', borderBottom: `1px solid ${P}18`, background: '#fff' }}>
        {[
          { key: 'historia', label: 'Historia' },
          { key: 'evolucion', label: 'Evolución' },
          { key: 'citas', label: 'Citas' },
        ].map(t => (
          <button
            key={t.key}
            onClick={() => setTab(t.key)}
            style={{
              flex: 1, padding: '12px 8px', border: 'none', background: 'none',
              fontSize: 13, fontWeight: tab === t.key ? 700 : 500,
              color: tab === t.key ? P : '#94a3b8',
              cursor: 'pointer',
              borderBottom: `2.5px solid ${tab === t.key ? P : 'transparent'}`,
              transition: 'color .15s, border-color .15s',
            }}
          >{t.label}</button>
        ))}
      </div>

      {/* Content */}
      <div style={{ flex: 1, overflow: 'auto', padding: 20, background: '#fff', borderRadius: '0 0 14px 14px' }}>

        {tab === 'historia' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {[
              { label: 'Diagnóstico', value: p.diagnostico, icon: '🩺' },
              { label: 'Fisioterapeuta', value: 'Dra. Ana García', icon: '👩‍⚕️' },
              { label: 'Total sesiones', value: `${p.sesiones} realizadas`, icon: '📋' },
              { label: 'Última visita', value: p.ultima, icon: '📅' },
            ].map(({ label, value, icon }) => (
              <div key={label} style={{
                display: 'flex', gap: 12, padding: '12px 14px', background: S, borderRadius: 10,
              }}>
                <span style={{ fontSize: 18 }}>{icon}</span>
                <div>
                  <div style={{ fontSize: 10, color: '#94a3b8', fontWeight: 600, marginBottom: 2 }}>{label}</div>
                  <div style={{ fontSize: 14, fontWeight: 600, color: '#0c1b33' }}>{value}</div>
                </div>
              </div>
            ))}
            <div style={{ padding: '14px', background: '#fef3c7', borderRadius: 10, border: '1px solid #fde68a' }}>
              <div style={{ fontSize: 11, fontWeight: 700, color: '#92400e', marginBottom: 4 }}>⚠ Nota clínica</div>
              <div style={{ fontSize: 12, color: '#78350f' }}>Paciente de demo. Sin datos clínicos reales. RGPD: datos 100% ficticios.</div>
            </div>
          </div>
        )}

        {tab === 'evolucion' && (
          <div>
            <div style={{ fontWeight: 700, fontSize: 14, color: '#0c1b33', marginBottom: 14 }}>
              Evolución del dolor (EVA 0-10)
            </div>
            <div style={{ display: 'flex', gap: 6, alignItems: 'flex-end', height: 120, marginBottom: 16 }}>
              {s.map((sess, i) => (
                <div key={i} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4 }}>
                  <div style={{ fontSize: 9, fontWeight: 700, color: sess.dolor > 5 ? '#f87171' : A }}>{sess.dolor}</div>
                  <div style={{
                    width: '100%', borderRadius: '4px 4px 0 0',
                    height: `${(sess.dolor / 10) * 100}px`,
                    background: sess.dolor > 5 ? 'linear-gradient(180deg,#f87171,#fca5a5)' : sess.dolor > 3 ? 'linear-gradient(180deg,#fb923c,#fdba74)' : `linear-gradient(180deg,${A},#6ee7b7)`,
                    transition: `height .6s ${i * .06}s cubic-bezier(.22,1,.36,1)`,
                  }} />
                  <div style={{ fontSize: 8, color: '#94a3b8' }}>S{sess.num}</div>
                </div>
              ))}
            </div>
            <div style={{ display: 'flex', gap: 12, fontSize: 11, color: '#64748b', background: S, borderRadius: 10, padding: 14 }}>
              <span>🔴 Alto (6-10)</span>
              <span>🟠 Medio (3-5)</span>
              <span style={{ color: A }}>🟢 Bajo (0-2)</span>
            </div>
          </div>
        )}

        {tab === 'citas' && (
          <div style={{ fontSize: 13, color: '#64748b', textAlign: 'center', padding: '24px 0' }}>
            <div style={{ fontSize: 32, marginBottom: 8 }}>📅</div>
            <div style={{ fontWeight: 600, marginBottom: 4 }}>Historial de citas</div>
            <div style={{ fontSize: 12 }}>Módulo de historial de citas demo. Sin datos reales.</div>
          </div>
        )}
      </div>
    </div>
  );
}

export function FisioNovaPilotPacientes() {
  const [search, setSearch] = useState('');
  const [selected, setSelected] = useState(PACIENTES_MOCK[0]);

  const filtered = PACIENTES_MOCK.filter(p =>
    p.nombre.toLowerCase().includes(search.toLowerCase()) ||
    p.diagnostico.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div style={{ display: 'flex', height: '100vh', background: S }}>

      {/* Sidebar */}
      <div style={{
        width: 300, flexShrink: 0, background: '#fff',
        borderRight: `1px solid ${P}18`,
        display: 'flex', flexDirection: 'column',
      }}>
        <div style={{ padding: '20px 16px', borderBottom: `1px solid ${P}12` }}>
          <div style={{ fontWeight: 800, fontSize: 16, color: '#0c1b33', marginBottom: 12 }}>
            Pacientes <span style={{ color: A, fontWeight: 700, fontSize: 13 }}>{filtered.length}</span>
          </div>
          <SearchBar value={search} onChange={setSearch} />
        </div>
        <div style={{ flex: 1, overflow: 'auto', padding: '8px' }}>
          {filtered.map(p => (
            <PacienteListItem
              key={p.id} p={p}
              selected={selected?.id === p.id}
              onClick={setSelected}
            />
          ))}
          {filtered.length === 0 && (
            <div style={{ padding: '24px 16px', textAlign: 'center', color: '#94a3b8', fontSize: 13 }}>
              Sin resultados para &ldquo;{search}&rdquo;
            </div>
          )}
        </div>
        <div style={{ padding: 12, borderTop: `1px solid ${P}12` }}>
          <button style={{
            width: '100%', background: `linear-gradient(135deg, ${P}, #0284c7)`, color: '#fff',
            border: 'none', borderRadius: 10, padding: '10px', fontSize: 13, fontWeight: 600, cursor: 'pointer',
          }}>+ Nuevo paciente</button>
        </div>
      </div>

      {/* Detail */}
      <div style={{ flex: 1, padding: 20, overflow: 'auto' }}>
        {selected ? (
          <PacienteDetail p={selected} />
        ) : (
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%', color: '#94a3b8', fontSize: 14 }}>
            Selecciona un paciente
          </div>
        )}
      </div>
    </div>
  );
}
