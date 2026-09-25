/**
 * OUTPUT GENERADO · Clínica Dental Málaga Demo · Chatbot IA simulado
 * Generado por Fábrica SaaS V1.2 · create-client.mjs
 * NO editar manualmente — regenerar: npm run factory:create:clinica-dental-malaga-demo
 * Sin asesoramiento profesional real. Datos 100% ficticios. Sin llamadas externas.
 */
import { useState } from 'react';
import {
  StepIndicator, BotBubble, UserBubble, OptionBtn,
  SensibleAlert, ConfirmacionPanel,
} from '../../core/ChatComponents.jsx';
import { DENTAL_VERTICAL, detectaSensible } from '../../verticals/dental/config.js';
import { MOCK_SEDES, MOCK_PROFESIONALES, MOCK_SLOTS } from './ClinicaDentalMalagaDemoMockData.js';

const STEPS_ALL = [
  { id: 'servicio',    label: 'Tratamiento' },
  { id: 'sede', label: 'Sede' },
  { id: 'profesional', label: 'Profesional' },
  { id: 'franja',      label: 'Horario' },
  { id: 'slot',        label: 'Cita' },
  { id: 'confirmacion', label: '¡Listo!' },
];
const STEPS = STEPS_ALL.filter(Boolean);

const SEP = { height: 1, background: '#e5e7eb', margin: '12px 0' };
const BOX = { maxWidth: 560, margin: '0 auto', padding: '0 4px' };

export function ClinicaDentalMalagaDemoChatbot() {
  const [step, setStep]               = useState('servicio');
  const [intencion, setIntencion]     = useState(null);
  const [sede, setSede]               = useState(null);
  const [profesional, setProfesional] = useState(null);
  const [franja, setFranja]           = useState(null);
  const [slot, setSlot]               = useState(null);
  const [pregunta, setPregunta]       = useState('');

  const reset = () => {
    setStep('servicio'); setIntencion(null); setSede(null);
    setProfesional(null); setFranja(null); setSlot(null); setPregunta('');
  };

  const elegirServicio = (int) => {
    setIntencion(int);
    if (int.flujo_corto) { setStep('confirmacion'); return; }
    setStep("sede");
  };

  const elegirSede = (s) => {
    setSede(s);
    setStep("profesional");
  };

  const elegirProfesional = (p) => { setProfesional(p); setStep('franja'); };

  const elegirFranja = (f) => { setFranja(f); setStep('slot'); };
  const elegirSlot   = (s) => { setSlot(s); setStep('confirmacion'); };

  return (
    <div style={{ padding: 20 }}>
      <StepIndicator steps={STEPS} currentStep={step} />
      <div style={BOX}>

        {step === 'servicio' && (
          <>
            <BotBubble icon="🦷">
              ¡Hola! Soy el asistente virtual de <strong>Clínica Dental Málaga Demo</strong>.<br />
              <em style={{ fontSize: 12, color: '#6b7280' }}>
                Solo orientamos y facilitamos la reserva. Sin asesoramiento profesional real.
                Datos demo 100% ficticios. Sin llamadas externas.
              </em>
              <br /><br />¿En qué podemos ayudarte hoy?
            </BotBubble>
            <div style={SEP} />
            {DENTAL_VERTICAL.intenciones.map(int => (
              <div key={int.id} style={{ marginBottom: 8 }}>
                <OptionBtn onClick={() => elegirServicio(int)} emoji={int.emoji} label={int.label} desc={int.descripcion} />
              </div>
            ))}
            <div style={{ marginTop: 12 }}>
              <input
                value={pregunta}
                onChange={e => {
                  setPregunta(e.target.value);
                  if (detectaSensible(e.target.value)) {
                    const primera = DENTAL_VERTICAL.intenciones.find(i => i.sensible);
                    if (primera) { setIntencion(primera); setStep("sede"); }
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

        {step === 'sede' && (
          <>
            <UserBubble>{intencion?.label}</UserBubble>
            {intencion?.sensible && (
              <SensibleAlert
                titulo="Consulta especializada"
                mensaje={intencion.mensaje_derivacion_especifico ?? 'Te derivaremos con el especialista adecuado.'}
                color="orange"
              />
            )}
            <BotBubble icon="📍">¿Qué sede prefieres?</BotBubble>
            {MOCK_SEDES.map(s => (
              <div key={s.id} style={{ marginBottom: 8 }}>
                <OptionBtn onClick={() => elegirSede(s)} emoji="🏢" label={s.nombre} desc={s.horario} />
              </div>
            ))}
          </>
        )}

        {step === 'profesional' && (
          <>
            <UserBubble>{sede?.nombre}</UserBubble>
            <BotBubble icon="👤">¿Alguna preferencia de profesional?</BotBubble>
            {MOCK_PROFESIONALES.map(p => (
              <div key={p.id} style={{ marginBottom: 8 }}>
                <OptionBtn
                  onClick={() => elegirProfesional(p)}
                  emoji={p.id === 'cualquiera' ? '🎲' : '👤'}
                  label={p.nombre}
                  desc={p.especialidad ?? 'Sin preferencia'}
                />
              </div>
            ))}
          </>
        )}

        {step === 'franja' && (
          <>
            <UserBubble>{profesional?.nombre}</UserBubble>
            <BotBubble icon="🕐">¿Qué horario te viene mejor?</BotBubble>
            {DENTAL_VERTICAL.franjas_horarias.map(f => (
              <div key={f.id} style={{ marginBottom: 8 }}>
                <OptionBtn onClick={() => elegirFranja(f)} emoji="⏰" label={f.label} desc={f.rango} />
              </div>
            ))}
          </>
        )}

        {step === 'slot' && (
          <>
            <UserBubble>{franja?.label}</UserBubble>
            <BotBubble icon="📅">Próximas citas disponibles (ficticias):</BotBubble>
            {MOCK_SLOTS.filter(s => s.disponible).map(s => (
              <div key={s.id} style={{ marginBottom: 8 }}>
                <OptionBtn
                  onClick={() => elegirSlot(s)}
                  emoji="🗓️"
                  label={s.fecha + ' · ' + s.hora}
                  desc={s.sede + ' · ' + (s.profesional ?? 'Disponible')}
                />
              </div>
            ))}
          </>
        )}

        {step === 'confirmacion' && intencion?.flujo_corto && (
          <ConfirmacionPanel
            titulo="Consulta registrada (simulación)"
            detalle={intencion.mensaje_flujo_corto}
            onReset={reset}
            resetLabel="Nueva consulta demo"
          />
        )}

        {step === 'confirmacion' && !intencion?.flujo_corto && slot && (
          <ConfirmacionPanel
            titulo="¡Cita reservada! (simulación)"
            detalle={
              'Tratamiento: ' + (intencion?.label ?? '') +
              '\nSede: ' + (slot.sede ?? '') +
              '\nProfesional: ' + (slot.profesional ?? '') +
              '\nFecha: ' + slot.fecha + ' a las ' + slot.hora
            }
            onReset={reset}
            resetLabel="Nueva consulta demo"
          />
        )}

        {step === 'confirmacion' && !intencion?.flujo_corto && !slot && (
          <ConfirmacionPanel
            titulo="Consulta registrada (simulación)"
            detalle="Nos pondremos en contacto para confirmar disponibilidad."
            onReset={reset}
            resetLabel="Nueva consulta demo"
          />
        )}

      </div>
    </div>
  );
}
