/**
 * OUTPUT · Clínica Dental Demo · Pantalla 1: Asistente IA
 * Flujo multi-paso: intención → sede → franja → financiación → huecos → confirmación.
 * Datos ficticios. Sin llamadas externas. Sin diagnósticos ni prescripciones.
 */
import { useState } from 'react';
import { Card, FicticioLabel } from '../../core/AppShell.jsx';
import { DENTAL_VERTICAL, detectaSensible } from '../../verticals/dental/config.js';
import { MOCK_SLOTS } from '../../verticals/dental/mockData.js';

const STEPS = ['intencion', 'sede', 'franja', 'financiacion', 'slots', 'confirmacion'];

function StepIndicator({ currentStep }) {
  const labels = { intencion: 'Motivo', sede: 'Sede', franja: 'Horario', financiacion: 'Financiación', slots: 'Cita', confirmacion: '¡Listo!' };
  const idx = STEPS.indexOf(currentStep);
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 0, marginBottom: 24, overflowX: 'auto' }}>
      {STEPS.filter(s => s !== 'confirmacion').map((s, i) => (
        <div key={s} style={{ display: 'flex', alignItems: 'center' }}>
          <div style={{
            width: 28, height: 28, borderRadius: '50%',
            background: i < idx ? '#16a34a' : i === idx ? '#2563eb' : '#e5e7eb',
            color: i <= idx ? '#fff' : '#9ca3af',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: 12, fontWeight: 700, flexShrink: 0,
          }}>
            {i < idx ? '✓' : i + 1}
          </div>
          <span style={{ fontSize: 11, color: i === idx ? '#2563eb' : '#9ca3af', marginLeft: 4, marginRight: 4, whiteSpace: 'nowrap', display: i > 3 ? 'none' : 'inline' }}>
            {labels[s]}
          </span>
          {i < STEPS.filter(s => s !== 'confirmacion').length - 1 && (
            <div style={{ width: 24, height: 2, background: i < idx ? '#16a34a' : '#e5e7eb', flexShrink: 0, margin: '0 4px' }} />
          )}
        </div>
      ))}
    </div>
  );
}

function SensibleWarning() {
  return (
    <div style={{
      background: '#fff7ed', border: '1px solid #fed7aa', borderRadius: 10,
      padding: '14px 16px', marginBottom: 16, display: 'flex', gap: 10, alignItems: 'flex-start',
    }}>
      <span style={{ fontSize: 20 }}>⚕️</span>
      <div>
        <div style={{ fontWeight: 700, color: '#9a3412', fontSize: 14, marginBottom: 4 }}>Información clínica</div>
        <p style={{ margin: 0, fontSize: 13, color: '#7c2d12', lineHeight: 1.5 }}>
          {DENTAL_VERTICAL.seguridad_clinica.mensaje_derivacion}
        </p>
      </div>
    </div>
  );
}

function BotBubble({ children }) {
  return (
    <div style={{ display: 'flex', gap: 10, marginBottom: 16, alignItems: 'flex-start' }}>
      <div style={{ width: 32, height: 32, background: '#2563eb', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 16, flexShrink: 0 }}>🤖</div>
      <div style={{ background: '#f1f5f9', borderRadius: '0 12px 12px 12px', padding: '12px 16px', maxWidth: '80%', fontSize: 14, color: '#374151', lineHeight: 1.6 }}>
        {children}
      </div>
    </div>
  );
}

function UserBubble({ children }) {
  return (
    <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: 16 }}>
      <div style={{ background: '#2563eb', color: '#fff', borderRadius: '12px 0 12px 12px', padding: '10px 14px', maxWidth: '70%', fontSize: 14, lineHeight: 1.5 }}>
        {children}
      </div>
    </div>
  );
}

function OptionBtn({ onClick, emoji, label, desc, color = '#f8fafc', borderColor = '#e5e7eb' }) {
  const [hover, setHover] = useState(false);
  return (
    <button
      onClick={onClick}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      style={{
        background: hover ? '#eff6ff' : color,
        border: `1px solid ${hover ? '#93c5fd' : borderColor}`,
        borderRadius: 10, padding: '12px 14px', cursor: 'pointer',
        display: 'flex', alignItems: 'flex-start', gap: 10, textAlign: 'left', width: '100%',
        transition: 'all 0.15s',
      }}
    >
      <span style={{ fontSize: 22, lineHeight: 1 }}>{emoji}</span>
      <div>
        <div style={{ fontWeight: 600, fontSize: 14, color: '#111827' }}>{label}</div>
        {desc && <div style={{ fontSize: 12, color: '#6b7280', marginTop: 2 }}>{desc}</div>}
      </div>
    </button>
  );
}

export function DentalChatbot() {
  const [step, setStep] = useState('intencion');
  const [sel, setSel] = useState({ intencion: null, sede: null, franja: null, financiacion: null, slot: null });
  const [history, setHistory] = useState([]);
  const [textoLibre, setTextoLibre] = useState('');
  const [sensibleDetectado, setSensibleDetectado] = useState(false);

  const { intenciones, sedes, franjas_horarias, opciones_financiacion } = DENTAL_VERTICAL;

  function addHistory(type, text) {
    setHistory(h => [...h, { type, text }]);
  }

  function selIntencion(int) {
    setSel(s => ({ ...s, intencion: int }));
    addHistory('user', `${int.emoji} ${int.label}`);
    if (int.sensible) {
      addHistory('bot', int.mensaje_urgencia || 'Te atenderemos con prioridad. Por favor, llama directamente a la clínica.');
      addHistory('bot', 'También puedo ayudarte a reservar una cita de urgencia.');
    } else {
      addHistory('bot', `Entendido. ¿En cuál de nuestras sedes prefieres tu cita?`);
    }
    setStep('sede');
  }

  function selSede(sede) {
    setSel(s => ({ ...s, sede }));
    addHistory('user', `📍 ${sede.nombre}`);
    addHistory('bot', `Sede ${sede.nombre} seleccionada. Horario habitual: ${sede.horario}. ¿Qué franja horaria te viene mejor?`);
    setStep('franja');
  }

  function selFranja(franja) {
    setSel(s => ({ ...s, franja }));
    addHistory('user', `🕐 ${franja.label}`);
    if (sel.intencion?.financiacion) {
      addHistory('bot', `Perfecto. Para ${sel.intencion.label} ofrecemos opciones de financiación. ¿Te gustaría conocerlas? Todos los datos son ficticios para esta demo.`);
      setStep('financiacion');
    } else {
      addHistory('bot', `Aquí tienes los próximos huecos disponibles (ficticios):`);
      setStep('slots');
    }
  }

  function selFinanciacion(opcion) {
    setSel(s => ({ ...s, financiacion: opcion }));
    addHistory('user', `💳 ${opcion.label}`);
    addHistory('bot', `Opción de financiación registrada (ficticio). Aquí tienes los huecos disponibles:`);
    setStep('slots');
  }

  function selSlot(slot) {
    setSel(s => ({ ...s, slot }));
    addHistory('user', `📅 ${slot.fecha} a las ${slot.hora} — ${slot.sede}`);
    addHistory('bot', `¡Cita simulada reservada! (Esto es una demo. No se ha enviado nada, no se ha creado ninguna cita real.)`);
    setStep('confirmacion');
  }

  function handleTextoLibre(e) {
    e.preventDefault();
    if (!textoLibre.trim()) return;
    const sensible = detectaSensible(textoLibre);
    setSensibleDetectado(sensible);
    addHistory('user', textoLibre);
    if (sensible) {
      addHistory('bot', DENTAL_VERTICAL.seguridad_clinica.mensaje_derivacion);
    } else {
      addHistory('bot', 'Recibido. Un miembro del equipo revisará tu consulta. ¿Quieres reservar una cita mientras tanto?');
    }
    setTextoLibre('');
  }

  function reset() {
    setStep('intencion');
    setSel({ intencion: null, sede: null, franja: null, financiacion: null, slot: null });
    setHistory([]);
    setTextoLibre('');
    setSensibleDetectado(false);
  }

  return (
    <div>
      <div style={{ marginBottom: 20 }}>
        <h2 style={{ fontSize: 20, fontWeight: 800, color: '#111827', margin: '0 0 4px' }}>🤖 Asistente IA</h2>
        <p style={{ margin: 0, fontSize: 14, color: '#6b7280' }}>Flujo de captación simulado · Datos ficticios</p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0,1fr) minmax(0,320px)', gap: 20, alignItems: 'start' }}>
        {/* Panel principal del chatbot */}
        <Card padding="0">
          <div style={{ padding: '20px', borderBottom: '1px solid #f3f4f6' }}>
            <StepIndicator currentStep={step} />

            {/* Historial de conversación */}
            {history.length > 0 && (
              <div style={{ marginBottom: 20 }}>
                {history.map((h, i) => (
                  h.type === 'bot'
                    ? <BotBubble key={i}>{h.text}</BotBubble>
                    : <UserBubble key={i}>{h.text}</UserBubble>
                ))}
              </div>
            )}

            {sensibleDetectado && <SensibleWarning />}

            {/* Paso: selección de intención */}
            {step === 'intencion' && (
              <div>
                <BotBubble>¡Hola! Soy el asistente de la Clínica Dental Demo. ¿En qué puedo ayudarte hoy?</BotBubble>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
                  {intenciones.map(int => (
                    <OptionBtn key={int.id} emoji={int.emoji} label={int.label} desc={int.descripcion} onClick={() => selIntencion(int)} />
                  ))}
                </div>
              </div>
            )}

            {/* Paso: selección de sede */}
            {step === 'sede' && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                {sedes.map(sede => (
                  <OptionBtn key={sede.id} emoji="📍" label={sede.nombre} desc={`Horario: ${sede.horario}`} onClick={() => selSede(sede)} />
                ))}
              </div>
            )}

            {/* Paso: selección de franja */}
            {step === 'franja' && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                {franjas_horarias.map(f => (
                  <OptionBtn key={f.id} emoji="🕐" label={f.label} onClick={() => selFranja(f)} />
                ))}
                <div style={{ marginTop: 8, padding: '10px 14px', background: '#fef3c7', borderRadius: 8, fontSize: 12, color: '#92400e' }}>
                  ⏰ Consulta fuera del horario habitual: el equipo te contactará al día siguiente. (Caso de prueba: fuera de horario)
                </div>
              </div>
            )}

            {/* Paso: financiación */}
            {step === 'financiacion' && (
              <div>
                <div style={{ marginBottom: 12, padding: '10px 14px', background: '#eff6ff', borderRadius: 8, fontSize: 13, color: '#1d4ed8' }}>
                  💳 Opciones de financiación disponibles para {sel.intencion?.label} (datos ficticios de demo)
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                  {opciones_financiacion.map(op => (
                    <OptionBtn key={op.id} emoji="💳" label={op.label} desc={op.descripcion} onClick={() => selFinanciacion(op)} />
                  ))}
                </div>
              </div>
            )}

            {/* Paso: huecos disponibles */}
            {step === 'slots' && (
              <div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                  {MOCK_SLOTS.map(slot => (
                    <button
                      key={slot.id}
                      onClick={() => selSlot(slot)}
                      style={{
                        background: '#f0fdf4', border: '1px solid #86efac',
                        borderRadius: 10, padding: '14px 16px', cursor: 'pointer',
                        display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                        textAlign: 'left',
                      }}
                    >
                      <div>
                        <div style={{ fontWeight: 700, fontSize: 15, color: '#15803d' }}>📅 {slot.fecha} · {slot.hora}</div>
                        <div style={{ fontSize: 13, color: '#4b5563', marginTop: 2 }}>📍 {slot.sede}</div>
                      </div>
                      <span style={{ fontSize: 11, background: '#dcfce7', color: '#15803d', padding: '3px 10px', borderRadius: 20, fontWeight: 700 }}>Reservar</span>
                    </button>
                  ))}
                </div>
                <FicticioLabel /> <span style={{ fontSize: 12, color: '#9ca3af' }}>Huecos ficticios de demo</span>
              </div>
            )}

            {/* Confirmación */}
            {step === 'confirmacion' && (
              <div style={{ textAlign: 'center', padding: '24px 0' }}>
                <div style={{ fontSize: 48, marginBottom: 12 }}>✅</div>
                <h3 style={{ color: '#15803d', fontWeight: 800, fontSize: 18, margin: '0 0 8px' }}>Cita simulada reservada</h3>
                <p style={{ color: '#6b7280', fontSize: 14, margin: '0 0 16px' }}>
                  {sel.slot?.fecha} a las {sel.slot?.hora} · {sel.slot?.sede}<br />
                  Tratamiento: {sel.intencion?.label} · Sede: {sel.sede?.nombre}
                  {sel.financiacion && <><br />Financiación: {sel.financiacion.label}</>}
                </p>
                <p style={{ fontSize: 12, color: '#9ca3af', margin: '0 0 20px', background: '#f9fafb', padding: 12, borderRadius: 8 }}>
                  ⚠️ DEMO INTERNA — No se ha enviado ningún email ni SMS. No se ha creado ninguna cita real. Datos ficticios.
                </p>
                <button onClick={reset} style={{ padding: '10px 24px', background: '#2563eb', color: '#fff', border: 'none', borderRadius: 8, cursor: 'pointer', fontWeight: 700, fontSize: 14 }}>
                  Nueva consulta demo
                </button>
              </div>
            )}
          </div>

          {/* Área de texto libre (siempre visible) */}
          {step !== 'confirmacion' && (
            <form onSubmit={handleTextoLibre} style={{ padding: '16px 20px', display: 'flex', gap: 10, alignItems: 'center', background: '#f8fafc' }}>
              <input
                type="text"
                value={textoLibre}
                onChange={e => setTextoLibre(e.target.value)}
                placeholder="O escribe tu consulta libremente..."
                style={{ flex: 1, padding: '10px 14px', border: '1px solid #e5e7eb', borderRadius: 8, fontSize: 14, outline: 'none', background: '#fff' }}
              />
              <button type="submit" style={{ padding: '10px 16px', background: '#2563eb', color: '#fff', border: 'none', borderRadius: 8, cursor: 'pointer', fontWeight: 700, fontSize: 14 }}>
                Enviar
              </button>
            </form>
          )}
        </Card>

        {/* Panel lateral: estado y resumen */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <Card title="Estado de la consulta" padding="16px">
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10, fontSize: 13 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: '#6b7280' }}>Motivo</span>
                <span style={{ fontWeight: 600 }}>{sel.intencion ? `${sel.intencion.emoji} ${sel.intencion.label}` : '—'}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: '#6b7280' }}>Sede</span>
                <span style={{ fontWeight: 600 }}>{sel.sede?.nombre || '—'}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: '#6b7280' }}>Franja</span>
                <span style={{ fontWeight: 600 }}>{sel.franja?.label || '—'}</span>
              </div>
              {sel.intencion?.financiacion && (
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ color: '#6b7280' }}>Financiación</span>
                  <span style={{ fontWeight: 600 }}>{sel.financiacion?.label || 'Pendiente'}</span>
                </div>
              )}
              {sel.intencion && (
                <div style={{ marginTop: 8, padding: '8px 10px', background: '#eff6ff', borderRadius: 6, fontSize: 12, color: '#1d4ed8' }}>
                  {sel.intencion.financiacion && sel.intencion.rango_precio && (
                    <div>💰 Rango estimado: {sel.intencion.rango_precio}</div>
                  )}
                </div>
              )}
            </div>
          </Card>

          <Card title="Casos de prueba" padding="16px">
            <div style={{ fontSize: 12, display: 'flex', flexDirection: 'column', gap: 8 }}>
              {[
                { id: 'implantes_cirugia', label: 'Implantes + financiación', emoji: '🦷' },
                { id: 'primera_visita', label: 'Primera visita', emoji: '👋' },
                { id: 'urgencia', label: 'Urgencia (caso sensible)', emoji: '🚨' },
                { id: 'consulta_general', label: 'Consulta general', emoji: '💬' },
              ].map(c => (
                <button
                  key={c.id}
                  onClick={() => { reset(); setTimeout(() => selIntencion(intenciones.find(i => i.id === c.id)), 50); }}
                  style={{ background: '#f8fafc', border: '1px solid #e5e7eb', borderRadius: 6, padding: '8px 10px', cursor: 'pointer', textAlign: 'left', fontSize: 12, color: '#374151' }}
                >
                  {c.emoji} {c.label}
                </button>
              ))}
            </div>
          </Card>

          <Card padding="16px">
            <div style={{ fontSize: 11, color: '#9ca3af', lineHeight: 1.6 }}>
              <strong style={{ color: '#374151' }}>Seguridad clínica activa:</strong><br />
              🚫 No diagnóstica<br />
              🚫 No prescribe<br />
              🚫 No da consejos médicos<br />
              ✅ Deriva a profesional si detecta consulta sensible
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
