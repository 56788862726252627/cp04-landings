/**
 * OUTPUT · Despacho Abogados Demo · Chatbot IA simulado
 * Importa CORE ChatComponents. Sin asesoramiento jurídico real, sin dictámenes.
 * Datos 100% ficticios. Sin fetch/XHR/WebSocket. Sin secretos.
 * NO garantiza resultados. Solo orienta y facilita la reserva de consulta.
 */
import { useState } from 'react';
import {
  StepIndicator, BotBubble, UserBubble, OptionBtn,
  SensibleAlert, ConfirmacionPanel,
} from '../../core/ChatComponents.jsx';
import {
  ABOGADOS_VERTICAL, detectaSensibleAbogados, getAbogadoPorArea,
} from '../../verticals/abogados/config.js';
import { MOCK_SLOTS_ABOGADOS } from '../../verticals/abogados/mockData.js';

const STEPS = [
  { id: 'area',         label: 'Área' },
  { id: 'urgencia',     label: 'Urgencia' },
  { id: 'abogado',      label: 'Abogado' },
  { id: 'franja',       label: 'Horario' },
  { id: 'slot',         label: 'Cita' },
  { id: 'confirmacion', label: '¡Listo!' },
];

const URGENCIA_CONFIG = {
  alta:  { label: 'Alta — necesito atención urgente', emoji: '🔴', color: '#fee2e2' },
  media: { label: 'Media — en los próximos días',     emoji: '🟡', color: '#fef9c3' },
  baja:  { label: 'Baja — cuando haya disponibilidad', emoji: '🟢', color: '#d1fae5' },
};

const SEP = { height: 1, background: '#e5e7eb', margin: '12px 0' };
const BOX = { maxWidth: 560, margin: '0 auto', padding: '0 4px' };

export function AbogadosChatbot() {
  const [step, setStep]           = useState('area');
  const [intencion, setIntencion] = useState(null);
  const [urgencia, setUrgencia]   = useState(null);
  const [abogado, setAbogado]     = useState(null);
  const [franja, setFranja]       = useState(null);
  const [slot, setSlot]           = useState(null);
  const [pregunta, setPregunta]   = useState('');

  const stepsVisible = STEPS.filter(s => {
    if (s.id === 'urgencia') return intencion && !intencion.flujo_corto;
    if (s.id === 'abogado')  return intencion && !intencion.flujo_corto;
    if (s.id === 'franja')   return intencion && !intencion.flujo_corto;
    if (s.id === 'slot')     return intencion && !intencion.flujo_corto;
    return true;
  });

  const reset = () => {
    setStep('area'); setIntencion(null); setUrgencia(null);
    setAbogado(null); setFranja(null); setSlot(null); setPregunta('');
  };

  const elegirArea = (int) => {
    setIntencion(int);
    if (int.flujo_corto) { setStep('confirmacion'); return; }
    setStep('urgencia');
  };

  const elegirUrgencia = (u) => {
    setUrgencia(u);
    if (intencion?.sensible) { setStep('abogado'); return; }
    setStep('abogado');
  };

  const elegirAbogado = (a) => { setAbogado(a); setStep('franja'); };
  const elegirFranja  = (f) => { setFranja(f); setStep('slot'); };
  const elegirSlot    = (s) => { setSlot(s); setStep('confirmacion'); };

  const abogadosSugeridos = () => {
    if (!intencion?.area_practica) return ABOGADOS_VERTICAL.abogados;
    const especialista = getAbogadoPorArea(intencion.area_practica);
    if (!especialista) return ABOGADOS_VERTICAL.abogados;
    return [
      especialista,
      ...ABOGADOS_VERTICAL.abogados.filter(a => a.id !== especialista.id),
    ];
  };

  return (
    <div style={{ padding: 20 }}>
      <StepIndicator steps={stepsVisible} currentStep={step} />
      <div style={BOX}>

        {/* ÁREA / INTENCIÓN */}
        {step === 'area' && (
          <>
            <BotBubble icon="⚖️">
              Hola, soy el asistente virtual de <strong>Despacho Abogados Demo</strong>.<br />
              <em style={{ fontSize: 12, color: '#6b7280' }}>
                No ofrezco asesoramiento jurídico real. Solo oriento y facilito la reserva de consulta.
              </em>
              <br /><br />
              ¿En qué área jurídica necesitas ayuda?
            </BotBubble>
            <div style={SEP} />
            {ABOGADOS_VERTICAL.intenciones.map(int => (
              <div key={int.id} style={{ marginBottom: 8 }}>
                <OptionBtn
                  onClick={() => elegirArea(int)}
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
                  if (detectaSensibleAbogados(e.target.value)) {
                    const penal = ABOGADOS_VERTICAL.intenciones.find(i => i.id === 'derecho_penal');
                    if (penal) { setIntencion(penal); setStep('urgencia'); }
                  }
                }}
                placeholder="O describe tu situación brevemente..."
                style={{
                  width: '100%', boxSizing: 'border-box', padding: '10px 14px',
                  border: '1px solid #d1d5db', borderRadius: 8, fontSize: 14, color: '#374151',
                }}
              />
            </div>
            <p style={{ fontSize: 11, color: '#9ca3af', marginTop: 8 }}>
              ⚠️ {ABOGADOS_VERTICAL.seguridad_juridica.aviso_demo}
            </p>
          </>
        )}

        {/* URGENCIA */}
        {step === 'urgencia' && (
          <>
            <UserBubble>{intencion?.label}</UserBubble>

            {/* Alerta especial para penal ANTES de continuar */}
            {intencion?.sensible && (
              <SensibleAlert
                titulo="Asunto penal — atención especializada"
                mensaje={intencion.mensaje_derivacion_especifico}
                color="red"
              />
            )}

            <BotBubble icon="⏱️">
              ¿Cuál es el nivel de urgencia de tu asunto?
            </BotBubble>
            {Object.entries(URGENCIA_CONFIG).map(([id, cfg]) => (
              <div key={id} style={{ marginBottom: 8 }}>
                <OptionBtn
                  onClick={() => elegirUrgencia(id)}
                  emoji={cfg.emoji}
                  label={cfg.label}
                />
              </div>
            ))}
          </>
        )}

        {/* ABOGADO */}
        {step === 'abogado' && (
          <>
            <UserBubble>{URGENCIA_CONFIG[urgencia]?.label ?? urgencia}</UserBubble>
            <BotBubble icon="👨‍⚖️">
              {intencion?.area_practica
                ? `Te sugerimos un especialista en ${intencion.label.toLowerCase()}. ¿Tienes preferencia?`
                : '¿Tienes preferencia de abogado?'}
            </BotBubble>
            {abogadosSugeridos().map(a => (
              <div key={a.id} style={{ marginBottom: 8 }}>
                <OptionBtn
                  onClick={() => elegirAbogado(a)}
                  emoji={a.id === 'cualquiera' ? '🎲' : '👨‍⚖️'}
                  label={a.nombre}
                  desc={a.area_label}
                  borderColor={
                    intencion?.area_practica && a.area === intencion.area_practica
                      ? '#a855f7'
                      : '#e5e7eb'
                  }
                />
              </div>
            ))}
          </>
        )}

        {/* FRANJA HORARIA */}
        {step === 'franja' && (
          <>
            <UserBubble>{abogado?.nombre}</UserBubble>
            <BotBubble icon="🕐">¿Qué horario te viene mejor?</BotBubble>
            {ABOGADOS_VERTICAL.franjas_horarias.map(f => (
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

        {/* SLOT */}
        {step === 'slot' && (
          <>
            <UserBubble>{franja?.label}</UserBubble>
            <BotBubble icon="📅">
              Estas son las próximas citas disponibles (ficticias):
            </BotBubble>
            {MOCK_SLOTS_ABOGADOS.filter(s => s.disponible).map(s => (
              <div key={s.id} style={{ marginBottom: 8 }}>
                <OptionBtn
                  onClick={() => elegirSlot(s)}
                  emoji="🗓️"
                  label={`${s.fecha} · ${s.hora}`}
                  desc={`${s.despacho} · ${s.abogado}`}
                />
              </div>
            ))}
          </>
        )}

        {/* CONFIRMACIÓN */}
        {step === 'confirmacion' && (
          <>
            {/* Flujo corto: honorarios */}
            {intencion?.flujo_corto && intencion.mostrar_honorarios && (
              <>
                <BotBubble icon="💶">{intencion.mensaje_flujo_corto}</BotBubble>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginBottom: 16 }}>
                  {ABOGADOS_VERTICAL.honorarios_demo.map(h => (
                    <div key={h.id} style={{
                      background: h.destacado ? '#f0fdf4' : '#f9fafb',
                      border: `1px solid ${h.destacado ? '#86efac' : '#e5e7eb'}`,
                      borderRadius: 10, padding: '12px 14px',
                    }}>
                      <div style={{ fontWeight: 700, fontSize: 14, color: '#111827' }}>
                        {h.destacado ? '⭐ ' : ''}{h.label} — {h.precio}
                      </div>
                      <div style={{ fontSize: 12, color: '#6b7280', marginTop: 2 }}>{h.descripcion}</div>
                    </div>
                  ))}
                </div>
                <ConfirmacionPanel
                  titulo="Consulta de honorarios completada"
                  detalle="Para un presupuesto personalizado contacta directamente con el despacho. Precios ficticios · Demo interna."
                  onReset={reset}
                  resetLabel="Nueva consulta demo"
                />
              </>
            )}

            {/* Flujo corto: cambio/cancelación */}
            {intencion?.flujo_corto && !intencion.mostrar_honorarios && (
              <ConfirmacionPanel
                titulo="Solicitud registrada (simulación)"
                detalle={intencion.mensaje_flujo_corto}
                onReset={reset}
                resetLabel="Nueva consulta demo"
              />
            )}

            {/* Flujo completo con slot */}
            {!intencion?.flujo_corto && slot && (
              <ConfirmacionPanel
                titulo="¡Consulta reservada! (simulación)"
                detalle={`Área: ${intencion?.label}\nUrgencia: ${URGENCIA_CONFIG[urgencia]?.label ?? urgencia}\nAbogado: ${slot.abogado}\nDespacho: ${slot.despacho}\nFecha: ${slot.fecha} a las ${slot.hora}`}
                onReset={reset}
                resetLabel="Nueva consulta demo"
              />
            )}

            {/* Flujo completo sin slot (edge case) */}
            {!intencion?.flujo_corto && !slot && (
              <ConfirmacionPanel
                titulo="Consulta registrada (simulación)"
                detalle="Nuestro equipo se pondrá en contacto contigo para confirmar fecha y horario."
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
