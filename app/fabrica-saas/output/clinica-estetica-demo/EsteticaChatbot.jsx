/**
 * OUTPUT · Clínica Estética Demo · Chatbot IA simulado
 * Importa CORE ChatComponents. Sin diagnósticos, sin promesas de resultado.
 * Datos 100% ficticios. Sin fetch/XHR/WebSocket. Sin secretos.
 */
import { useState } from 'react';
import {
  StepIndicator, BotBubble, UserBubble, OptionBtn,
  SensibleAlert, ConfirmacionPanel,
} from '../../core/ChatComponents.jsx';
import {
  ESTETICA_VERTICAL, detectaSensibleEstetica,
} from '../../verticals/estetica/config.js';
import { MOCK_SLOTS_ESTETICA } from '../../verticals/estetica/mockData.js';

const STEPS = [
  { id: 'tratamiento',  label: 'Tratamiento' },
  { id: 'zona',         label: 'Zona' },
  { id: 'centro',       label: 'Centro' },
  { id: 'profesional',  label: 'Profesional' },
  { id: 'franja',       label: 'Horario' },
  { id: 'pack',         label: 'Pack' },
  { id: 'slot',         label: 'Sesión' },
  { id: 'confirmacion', label: '¡Listo!' },
];

const SEP = { height: 1, background: '#e5e7eb', margin: '12px 0' };
const BOX = { maxWidth: 560, margin: '0 auto', padding: '0 4px' };

export function EsteticaChatbot() {
  const [step, setStep]               = useState('tratamiento');
  const [intencion, setIntencion]     = useState(null);
  const [zona, setZona]               = useState(null);
  const [centro, setCentro]           = useState(null);
  const [profesional, setProfesional] = useState(null);
  const [franja, setFranja]           = useState(null);
  const [pack, setPack]               = useState(null);
  const [slot, setSlot]               = useState(null);
  const [pregunta, setPregunta]       = useState('');

  const stepsVisible = STEPS.filter(s => {
    if (s.id === 'zona') return intencion?.mostrar_zona === true;
    if (s.id === 'pack') return intencion?.mostrar_pack === true;
    return true;
  });

  const reset = () => {
    setStep('tratamiento'); setIntencion(null); setZona(null);
    setCentro(null); setProfesional(null); setFranja(null);
    setPack(null); setSlot(null); setPregunta('');
  };

  const elegirTratamiento = (int) => {
    setIntencion(int);
    if (int.flujo_corto) { setStep('confirmacion'); return; }
    if (int.sensible)    { setStep('centro'); return; }
    if (int.mostrar_zona){ setStep('zona'); return; }
    setStep('centro');
  };

  const elegirZona = (z) => { setZona(z); setStep('centro'); };
  const elegirCentro = (c) => { setCentro(c); setStep('profesional'); };
  const elegirProfesional = (p) => { setProfesional(p); setStep('franja'); };
  const elegirFranja = (f) => {
    setFranja(f);
    setStep(intencion?.mostrar_pack ? 'pack' : 'slot');
  };
  const elegirPack = (pk) => { setPack(pk); setStep('slot'); };
  const elegirSlot = (s) => { setSlot(s); setStep('confirmacion'); };

  return (
    <div style={{ padding: 20 }}>
      <StepIndicator steps={stepsVisible} currentStep={step} />
      <div style={BOX}>

        {/* TRATAMIENTO */}
        {step === 'tratamiento' && (
          <>
            <BotBubble icon="✨">
              ¡Hola! Soy el asistente virtual de <strong>Clínica Estética Demo</strong>.<br />
              ¿En qué tratamiento estás interesada/o?
            </BotBubble>
            <div style={SEP} />
            {ESTETICA_VERTICAL.intenciones.map(int => (
              <div key={int.id} style={{ marginBottom: 8 }}>
                <OptionBtn
                  onClick={() => elegirTratamiento(int)}
                  emoji={int.emoji}
                  label={int.label}
                  desc={int.descripcion}
                />
              </div>
            ))}
            <div style={{ marginTop: 12 }}>
              <input
                value={pregunta}
                onChange={e => {
                  setPregunta(e.target.value);
                  if (detectaSensibleEstetica(e.target.value)) {
                    setIntencion(ESTETICA_VERTICAL.intenciones.find(i => i.id === 'consulta_inicial'));
                    setStep('centro');
                  }
                }}
                placeholder="O escribe tu consulta..."
                style={{
                  width: '100%', boxSizing: 'border-box', padding: '10px 14px',
                  border: '1px solid #d1d5db', borderRadius: 8, fontSize: 14, color: '#374151',
                }}
              />
            </div>
          </>
        )}

        {/* ZONA (solo depilación láser) */}
        {step === 'zona' && (
          <>
            <UserBubble>{intencion.label}</UserBubble>
            <BotBubble icon="💡">
              ¿En qué zona quieres el tratamiento de depilación láser?
            </BotBubble>
            {ESTETICA_VERTICAL.zonas_depilacion.map(z => (
              <div key={z.id} style={{ marginBottom: 8 }}>
                <OptionBtn
                  onClick={() => elegirZona(z)}
                  emoji="📍"
                  label={z.label}
                  desc={`~${z.sesiones_estimadas} sesiones estimadas`}
                />
              </div>
            ))}
          </>
        )}

        {/* DERIVACIÓN SENSIBLE */}
        {step === 'centro' && intencion?.sensible && (
          <SensibleAlert
            titulo="Consulta especializada requerida"
            mensaje={intencion.mensaje_derivacion_especifico || ESTETICA_VERTICAL.seguridad_clinica.mensaje_derivacion}
            color="orange"
          />
        )}

        {/* CENTRO */}
        {step === 'centro' && (
          <>
            {zona && <UserBubble>Zona: {zona.label}</UserBubble>}
            {!intencion?.sensible && <UserBubble>{intencion?.label}</UserBubble>}
            <BotBubble icon="📍">¿Qué centro prefieres?</BotBubble>
            {ESTETICA_VERTICAL.centros.map(c => (
              <div key={c.id} style={{ marginBottom: 8 }}>
                <OptionBtn
                  onClick={() => elegirCentro(c)}
                  emoji="🏢"
                  label={c.nombre}
                  desc={c.horario}
                />
              </div>
            ))}
          </>
        )}

        {/* PROFESIONAL */}
        {step === 'profesional' && (
          <>
            <UserBubble>{centro?.nombre}</UserBubble>
            <BotBubble icon="👩">¿Alguna preferencia de profesional?</BotBubble>
            {ESTETICA_VERTICAL.profesionales.map(p => (
              <div key={p.id} style={{ marginBottom: 8 }}>
                <OptionBtn
                  onClick={() => elegirProfesional(p)}
                  emoji={p.id === 'cualquiera' ? '🎲' : '👩‍⚕️'}
                  label={p.nombre}
                  desc={p.especialidad}
                />
              </div>
            ))}
          </>
        )}

        {/* FRANJA HORARIA */}
        {step === 'franja' && (
          <>
            <UserBubble>{profesional?.nombre}</UserBubble>
            <BotBubble icon="🕐">¿Qué horario te viene mejor?</BotBubble>
            {ESTETICA_VERTICAL.franjas_horarias.map(f => (
              <div key={f.id} style={{ marginBottom: 8 }}>
                <OptionBtn
                  onClick={() => elegirFranja(f)}
                  emoji="⏰"
                  label={f.label}
                  desc={f.rango}
                />
              </div>
            ))}
          </>
        )}

        {/* PACK */}
        {step === 'pack' && (
          <>
            <UserBubble>{franja?.label}</UserBubble>
            <BotBubble icon="🎁">
              ¿Te interesa reservar un pack de sesiones? Puedes ahorrar hasta un 16% (precios ficticios).
            </BotBubble>
            {ESTETICA_VERTICAL.packs.map(pk => (
              <div key={pk.id} style={{ marginBottom: 8 }}>
                <OptionBtn
                  onClick={() => elegirPack(pk)}
                  emoji={pk.destacado ? '⭐' : '📦'}
                  label={`${pk.label} — ${pk.precio}`}
                  desc={pk.descripcion}
                  borderColor={pk.destacado ? '#a855f7' : '#e5e7eb'}
                />
              </div>
            ))}
            <div style={{ marginBottom: 8 }}>
              <OptionBtn
                onClick={() => elegirPack(null)}
                emoji="➡️"
                label="Continuar sin pack"
                desc="Puedes contratar un pack más adelante"
              />
            </div>
          </>
        )}

        {/* SLOT */}
        {step === 'slot' && (
          <>
            {pack && <UserBubble>{pack.label}</UserBubble>}
            <BotBubble icon="📅">
              Estos son los próximos huecos disponibles (ficticios):
            </BotBubble>
            {MOCK_SLOTS_ESTETICA.filter(s => s.disponible).map(s => (
              <div key={s.id} style={{ marginBottom: 8 }}>
                <OptionBtn
                  onClick={() => elegirSlot(s)}
                  emoji="🗓️"
                  label={`${s.fecha} · ${s.hora}`}
                  desc={`${s.centro} · ${s.profesional}`}
                />
              </div>
            ))}
          </>
        )}

        {/* CONFIRMACIÓN */}
        {step === 'confirmacion' && (
          <>
            {intencion?.flujo_corto && intencion.id === 'precio_pack' && (
              <>
                <BotBubble icon="🎁">{intencion.mensaje_flujo_corto}</BotBubble>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginBottom: 16 }}>
                  {ESTETICA_VERTICAL.packs.map(pk => (
                    <div key={pk.id} style={{
                      background: pk.destacado ? '#faf5ff' : '#f9fafb',
                      border: `1px solid ${pk.destacado ? '#d8b4fe' : '#e5e7eb'}`,
                      borderRadius: 10, padding: '12px 14px',
                    }}>
                      <div style={{ fontWeight: 700, fontSize: 14, color: '#111827' }}>
                        {pk.destacado ? '⭐ ' : ''}{pk.label} — {pk.precio}
                      </div>
                      <div style={{ fontSize: 12, color: '#6b7280', marginTop: 2 }}>{pk.descripcion}</div>
                    </div>
                  ))}
                </div>
                <ConfirmacionPanel
                  titulo="¡Consulta completada!"
                  detalle="Para contratar cualquier pack habla con nuestro equipo. Precios ficticios · Demo interna."
                  onReset={reset}
                  resetLabel="Nueva consulta demo"
                />
              </>
            )}
            {intencion?.flujo_corto && intencion.id === 'cambio_cancelacion' && (
              <ConfirmacionPanel
                titulo="Mensaje registrado (simulación)"
                detalle={intencion.mensaje_flujo_corto}
                onReset={reset}
                resetLabel="Nueva consulta demo"
              />
            )}
            {!intencion?.flujo_corto && slot && (
              <ConfirmacionPanel
                titulo="¡Sesión reservada! (simulación)"
                detalle={`Tratamiento: ${intencion?.label}${zona ? ` · ${zona.label}` : ''}\nCentro: ${slot.centro}\nProfesional: ${slot.profesional}\nFecha: ${slot.fecha} a las ${slot.hora}${pack ? `\nPack: ${pack.label}` : ''}`}
                onReset={reset}
                resetLabel="Nueva consulta demo"
              />
            )}
            {!intencion?.flujo_corto && !slot && (
              <ConfirmacionPanel
                titulo="Consulta registrada (simulación)"
                detalle="Nuestro equipo se pondrá en contacto contigo pronto."
                onReset={reset}
                resetLabel="Nueva consulta demo"
              />
            )}
          </>
        )}

      </div>
    </div>
  );
}
