/**
 * OUTPUT · Clínica Fisioterapia Demo · Pantalla 1: Asistente IA
 * Flujo multi-paso: intención → centro → profesional → franja → [bonos] → slots → confirmación.
 * Reutiliza CORE/ChatComponents: StepIndicator, BotBubble, UserBubble, OptionBtn, SensibleAlert.
 * Datos ficticios. Sin llamadas externas. Sin diagnósticos ni promesas de resultado clínico.
 */
import { useState } from 'react';
import { Card, FicticioLabel } from '../../core/AppShell.jsx';
import { StepIndicator, BotBubble, UserBubble, OptionBtn, SensibleAlert, ConfirmacionPanel } from '../../core/ChatComponents.jsx';
import { FISIO_VERTICAL, detectaSensibleFisio } from '../../verticals/fisioterapia/config.js';
import { MOCK_SLOTS_FISIO } from '../../verticals/fisioterapia/mockData.js';

const STEPS = [
  { id: 'intencion',   label: 'Motivo'      },
  { id: 'centro',      label: 'Centro'      },
  { id: 'profesional', label: 'Profesional' },
  { id: 'franja',      label: 'Horario'     },
  { id: 'bonos',       label: 'Bono'        },
  { id: 'slots',       label: 'Sesión'      },
  { id: 'confirmacion', label: '¡Listo!'    },
];

const VISIBLE_STEPS_DEFAULT   = STEPS.filter(s => !['bonos'].includes(s.id));
const VISIBLE_STEPS_CON_BONOS = STEPS;

export function PhysioChatbot() {
  const [step, setStep] = useState('intencion');
  const [sel, setSel] = useState({ intencion: null, centro: null, profesional: null, franja: null, bono: null, slot: null });
  const [history, setHistory] = useState([]);
  const [textoLibre, setTextoLibre] = useState('');
  const [sensibleDetectado, setSensibleDetectado] = useState(false);
  const [flujoCorto, setFlujoCorto] = useState(false);

  const { intenciones, centros, profesionales, franjas_horarias, bonos } = FISIO_VERTICAL;
  const stepsVisible = sel.intencion?.mostrar_bonos ? VISIBLE_STEPS_CON_BONOS : VISIBLE_STEPS_DEFAULT;

  function addHistory(type, text) {
    setHistory(h => [...h, { type, text }]);
  }

  function selIntencion(int) {
    setSel(s => ({ ...s, intencion: int }));
    addHistory('user', `${int.emoji} ${int.label}`);

    if (int.flujo_corto) {
      addHistory('bot', int.mensaje_flujo_corto);
      setFlujoCorto(true);
      setStep('confirmacion');
      return;
    }

    if (int.sensible) {
      const msgEsp = int.mensaje_derivacion_especifico || FISIO_VERTICAL.seguridad_clinica.mensaje_derivacion;
      addHistory('bot', `ℹ️ ${msgEsp}`);
    }
    addHistory('bot', '¿En cuál de nuestros centros prefieres tu sesión?');
    setStep('centro');
  }

  function selCentro(centro) {
    setSel(s => ({ ...s, centro }));
    addHistory('user', `📍 ${centro.nombre}`);
    addHistory('bot', `${centro.nombre} seleccionado. Horario habitual: ${centro.horario}. ¿Con qué profesional prefieres trabajar?`);
    setStep('profesional');
  }

  function selProfesional(prof) {
    setSel(s => ({ ...s, profesional: prof }));
    addHistory('user', `👤 ${prof.nombre} — ${prof.especialidad}`);
    addHistory('bot', `Perfecto. ¿Qué franja horaria te viene mejor?`);
    setStep('franja');
  }

  function selFranja(franja) {
    setSel(s => ({ ...s, franja }));
    addHistory('user', `🕐 ${franja.label}`);
    if (sel.intencion?.mostrar_bonos) {
      addHistory('bot', 'Puedes reservar tu sesión con un bono o pago individual. Selecciona la opción que prefieras (precios ficticios):');
      setStep('bonos');
    } else {
      addHistory('bot', 'Aquí tienes los próximos huecos disponibles (ficticios):');
      setStep('slots');
    }
  }

  function selBono(bono) {
    setSel(s => ({ ...s, bono }));
    addHistory('user', `💳 ${bono.label} — ${bono.precio}`);
    addHistory('bot', 'Bono registrado (ficticio). Aquí tienes los próximos huecos:');
    setStep('slots');
  }

  function selSlot(slot) {
    setSel(s => ({ ...s, slot }));
    addHistory('user', `📅 ${slot.fecha} · ${slot.hora} — ${slot.centro}`);
    addHistory('bot', '¡Sesión simulada reservada! (Esto es una demo. No se ha creado ninguna sesión real ni se ha enviado nada.)');
    setStep('confirmacion');
  }

  function handleTextoLibre(e) {
    e.preventDefault();
    if (!textoLibre.trim()) return;
    const sensible = detectaSensibleFisio(textoLibre);
    setSensibleDetectado(sensible);
    addHistory('user', textoLibre);
    if (sensible) {
      addHistory('bot', FISIO_VERTICAL.seguridad_clinica.mensaje_derivacion);
    } else {
      addHistory('bot', 'Recibido. Nuestro equipo revisará tu consulta. ¿Quieres solicitar una sesión de valoración inicial gratuita?');
    }
    setTextoLibre('');
  }

  function reset() {
    setStep('intencion');
    setSel({ intencion: null, centro: null, profesional: null, franja: null, bono: null, slot: null });
    setHistory([]);
    setTextoLibre('');
    setSensibleDetectado(false);
    setFlujoCorto(false);
  }

  return (
    <div>
      <div style={{ marginBottom: 20 }}>
        <h2 style={{ fontSize: 20, fontWeight: 800, color: '#111827', margin: '0 0 4px' }}>🤖 Asistente IA</h2>
        <p style={{ margin: 0, fontSize: 14, color: '#6b7280' }}>Flujo de captación fisioterapia · Datos ficticios</p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0,1fr) minmax(0,320px)', gap: 20, alignItems: 'start' }}>
        <Card padding="0">
          <div style={{ padding: '20px', borderBottom: '1px solid #f3f4f6' }}>
            <StepIndicator steps={stepsVisible} currentStep={step} />

            {history.length > 0 && (
              <div style={{ marginBottom: 20 }}>
                {history.map((h, i) => (
                  h.type === 'bot'
                    ? <BotBubble key={i}>{h.text}</BotBubble>
                    : <UserBubble key={i}>{h.text}</UserBubble>
                ))}
              </div>
            )}

            {sensibleDetectado && (
              <SensibleAlert
                titulo="Información sobre síntomas graves"
                mensaje={FISIO_VERTICAL.seguridad_clinica.mensaje_derivacion}
              />
            )}

            {/* PASO: selección de intención */}
            {step === 'intencion' && (
              <div>
                <BotBubble>¡Hola! Soy el asistente de la Clínica Fisioterapia Demo. ¿En qué puedo ayudarte?</BotBubble>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
                  {intenciones.map(int => (
                    <OptionBtn key={int.id} emoji={int.emoji} label={int.label} desc={int.descripcion} onClick={() => selIntencion(int)} />
                  ))}
                </div>
              </div>
            )}

            {/* PASO: selección de centro */}
            {step === 'centro' && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                {centros.map(c => (
                  <OptionBtn key={c.id} emoji="📍" label={c.nombre} desc={`Horario: ${c.horario}`} onClick={() => selCentro(c)} />
                ))}
              </div>
            )}

            {/* PASO: selección de profesional */}
            {step === 'profesional' && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                {profesionales.map(p => (
                  <OptionBtn key={p.id} emoji="👤" label={p.nombre} desc={p.especialidad} onClick={() => selProfesional(p)} />
                ))}
              </div>
            )}

            {/* PASO: selección de franja */}
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

            {/* PASO: selección de bono */}
            {step === 'bonos' && (
              <div>
                <div style={{ marginBottom: 12, padding: '10px 14px', background: '#eff6ff', borderRadius: 8, fontSize: 13, color: '#1d4ed8' }}>
                  💳 Tarifas y bonos de sesiones (precios ficticios de demo)
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                  {bonos.map(b => (
                    <OptionBtn key={b.id} emoji="💳" label={`${b.label} — ${b.precio}`} desc={b.descripcion} onClick={() => selBono(b)} />
                  ))}
                </div>
              </div>
            )}

            {/* PASO: slots */}
            {step === 'slots' && (
              <div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                  {MOCK_SLOTS_FISIO.map(slot => (
                    <button
                      key={slot.id}
                      onClick={() => selSlot(slot)}
                      style={{
                        background: '#f0fdf4', border: '1px solid #86efac', borderRadius: 10,
                        padding: '14px 16px', cursor: 'pointer',
                        display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                      }}
                    >
                      <div>
                        <div style={{ fontWeight: 700, fontSize: 15, color: '#15803d' }}>📅 {slot.fecha} · {slot.hora}</div>
                        <div style={{ fontSize: 13, color: '#4b5563', marginTop: 2 }}>📍 {slot.centro} · 👤 {slot.profesional}</div>
                      </div>
                      <span style={{ fontSize: 11, background: '#dcfce7', color: '#15803d', padding: '3px 10px', borderRadius: 20, fontWeight: 700 }}>Reservar</span>
                    </button>
                  ))}
                </div>
                <div style={{ marginTop: 8, fontSize: 12, color: '#9ca3af' }}>
                  <FicticioLabel /> Huecos ficticios de demo
                </div>
              </div>
            )}

            {/* CONFIRMACIÓN */}
            {step === 'confirmacion' && !flujoCorto && (
              <ConfirmacionPanel
                titulo="Sesión simulada reservada"
                detalle={
                  <>
                    {sel.slot?.fecha} a las {sel.slot?.hora}<br />
                    Centro: {sel.centro?.nombre} · Profesional: {sel.profesional?.nombre}<br />
                    Motivo: {sel.intencion?.label}
                    {sel.bono && <><br />Bono seleccionado: {sel.bono.label}</>}
                  </>
                }
                onReset={reset}
                resetLabel="Nueva consulta demo"
              />
            )}

            {step === 'confirmacion' && flujoCorto && (
              <div style={{ textAlign: 'center', padding: '24px 0' }}>
                <div style={{ fontSize: 48, marginBottom: 12 }}>📞</div>
                <h3 style={{ color: '#2563eb', fontWeight: 800, fontSize: 18, margin: '0 0 8px' }}>Gestión de cita (demo)</h3>
                <p style={{ color: '#6b7280', fontSize: 14, margin: '0 0 20px' }}>
                  Para modificar o cancelar, contacta con el centro.<br />
                  <strong>Esta es una demo. No hay contacto real configurado.</strong>
                </p>
                <button onClick={reset} style={{ padding: '10px 24px', background: '#2563eb', color: '#fff', border: 'none', borderRadius: 8, cursor: 'pointer', fontWeight: 700, fontSize: 14 }}>
                  Volver al inicio
                </button>
              </div>
            )}
          </div>

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

        {/* Panel lateral */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <Card title="Estado de la consulta" padding="16px">
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10, fontSize: 13 }}>
              {[
                { label: 'Motivo',       value: sel.intencion   ? `${sel.intencion.emoji} ${sel.intencion.label}` : '—' },
                { label: 'Centro',       value: sel.centro?.nombre || '—' },
                { label: 'Profesional',  value: sel.profesional?.nombre || '—' },
                { label: 'Franja',       value: sel.franja?.label || '—' },
                { label: 'Bono',         value: sel.bono?.label || '—', show: !!sel.intencion?.mostrar_bonos },
              ].filter(r => r.show !== false).map(r => (
                <div key={r.label} style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ color: '#6b7280' }}>{r.label}</span>
                  <span style={{ fontWeight: 600 }}>{r.value}</span>
                </div>
              ))}
            </div>
          </Card>

          <Card title="Casos de prueba" padding="16px">
            <div style={{ fontSize: 12, display: 'flex', flexDirection: 'column', gap: 8 }}>
              {[
                { id: 'primera_valoracion',    emoji: '🩺', label: 'Primera valoración' },
                { id: 'dolor_lumbar',          emoji: '🦴', label: 'Dolor lumbar (sensible)' },
                { id: 'rehabilitacion_deportiva', emoji: '🏃', label: 'Rehabilitación deportiva' },
                { id: 'precio_bonos',          emoji: '💰', label: 'Precios y bonos' },
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
              🚫 No diagnostica<br />
              🚫 No prescribe<br />
              🚫 No promete resultados clínicos<br />
              ✅ Deriva a profesional ante síntomas graves
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
