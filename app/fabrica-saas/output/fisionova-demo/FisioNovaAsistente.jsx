/**
 * OUTPUT GENERADO · FisioNova (Demo) · Asistente IA V1.7
 * Fábrica SaaS V1.7 · Demo comercial · Datos ficticios
 *
 * AVISO LEGAL DEMO:
 * Este asistente es 100% ficticio. No proporciona diagnósticos médicos reales.
 * Los mensajes son respuestas pregrabadas para demostración comercial.
 * En un sistema real, requiere integración con LLM y validación clínica.
 */
import { useState, useRef, useEffect } from 'react';

const C = { primary: '#4338ca', secondary: '#059669', accent: '#7c3aed', bg: '#eef2ff', border: '#e0e7ff', text: '#1e1b4b', muted: '#6b7280', white: '#ffffff' };

// Respuestas pregrabadas (NO diagnóstico médico real)
const RESPUESTAS_DEMO = {
  'dolor': 'Para el dolor musculoesquelético, lo más importante es identificar el origen: mecánico, inflamatorio o neuropático. Te recomiendo una valoración presencial donde evaluemos movilidad, fuerza y postura. Mientras tanto, aplica RICE (reposo relativo, hielo, compresión, elevación) si es una lesión aguda. ¿Puedo ayudarte a concertar una cita? (demo)',
  'espalda': 'El dolor de espalda es una de las consultas más frecuentes. En la mayoría de casos (90%+) es de origen mecánico y responde muy bien a la fisioterapia. Nuestro protocolo incluye: evaluación postural, terapia manual y ejercicio terapéutico progresivo. Tiempo estimado de recuperación: 4-8 semanas según intensidad. (demo)',
  'hombro': 'El dolor de hombro puede tener múltiples causas: manguito rotador, bursitis, inestabilidad glenohumeral... Es clave una valoración específica con tests ortopédicos. ¿Tienes dolor en reposo o solo en movimiento? ¿Se irradia al brazo? Cuéntame más para orientarte mejor. (demo)',
  'rodilla': 'Para el dolor de rodilla, los factores más relevantes son: localización exacta del dolor, si hay inflamación visible, si apareció tras una caída o de forma progresiva, y la actividad física habitual. Nuestro equipo está especializado en patología de rodilla deportiva y degenerativa. (demo)',
  'cita': 'Puedo ayudarte a concertar tu primera cita. Disponemos de horarios de lunes a viernes de 8:00 a 21:00 y sábados de 9:00 a 15:00. La primera valoración (30 min, sin coste) incluye exploración completa y plan de tratamiento personalizado. ¿Qué zona horaria te viene mejor? (demo ficticio)',
  'precio': 'Nuestras tarifas (demo ficticio): Sesión individual 60-80€ según especialidad. Bono 5 sesiones desde 290€ (ahorro 13%). Bono 10 sesiones desde 540€ (ahorro 17%). La primera valoración es gratuita. ¿Te envío información de bonos por email? (demo)',
  'ejercicio': 'El ejercicio terapéutico es una parte fundamental de cualquier proceso de recuperación. Te diseñamos un plan progresivo adaptado a tu lesión, nivel físico y objetivos. Disponemos de sala equipada y app con vídeos guiados. (demo ficticio)',
  'seguro': 'Trabajamos con los principales seguros médicos (dato demo). Para confirmar la cobertura de tu póliza específica, te recomiendo contactar directamente o enviarnos el nombre de tu seguro. El proceso de autorización suele tardar 24-48h. (demo)',
};

const SUGERENCIAS = [
  'Tengo dolor de espalda baja',
  '¿Cuánto cuestan las sesiones?',
  'Me duele el hombro al levantar el brazo',
  'Quiero pedir una primera cita',
  'Tengo dolor en la rodilla tras correr',
  '¿Aceptáis seguros médicos?',
];

function encontrarRespuesta(texto) {
  const lower = texto.toLowerCase();
  for (const [clave, resp] of Object.entries(RESPUESTAS_DEMO)) {
    if (lower.includes(clave)) return resp;
  }
  return `Gracias por tu consulta. Para darte la mejor orientación sobre "${texto}", necesitaría más detalles o una valoración presencial. ¿Te gustaría que un fisioterapeuta especializado te contactara en las próximas 24h? Todo lo que comentas aquí es orientativo — el diagnóstico real requiere exploración física. (demo ficticio)`;
}

function MensajeAviso() {
  return (
    <div style={{ background: '#fef3c7', border: '1.5px solid #fbbf24', borderRadius: '0.75rem', padding: '0.875rem 1rem', marginBottom: '1rem' }}>
      <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'flex-start' }}>
        <span style={{ fontSize: '1rem', flexShrink: 0 }}>⚠️</span>
        <div>
          <p style={{ fontSize: '0.82rem', color: '#92400e', fontWeight: 700, marginBottom: '0.25rem' }}>Asistente en modo DEMO</p>
          <p style={{ fontSize: '0.78rem', color: '#92400e', lineHeight: 1.4 }}>
            Las respuestas son <strong>orientativas y pregrabadas</strong>. Este asistente no realiza diagnósticos médicos reales. Para cualquier problema de salud, consulta siempre con un profesional sanitario cualificado.
          </p>
        </div>
      </div>
    </div>
  );
}

export function FisioNovaAsistente() {
  const [mensajes, setMensajes] = useState([
    { id: 0, tipo: 'bot', texto: '¡Hola! Soy el asistente virtual de FisioNova. Puedo orientarte sobre nuestros servicios, tarifas, cómo funciona la fisioterapia y ayudarte a solicitar una cita. ¿En qué puedo ayudarte hoy? (demo ficticio — sin diagnóstico real)', ts: '09:00' },
  ]);
  const [input, setInput] = useState('');
  const [cargando, setCargando] = useState(false);
  const [modoRapido, setModoRapido] = useState(true);
  const bottomRef = useRef(null);
  const idRef = useRef(1);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [mensajes, cargando]);

  const enviar = (texto) => {
    if (!texto.trim()) return;
    const ahora = new Date().toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' });
    const nuevoId = idRef.current;
    idRef.current += 2;
    setMensajes(prev => [...prev, { id: nuevoId, tipo: 'user', texto, ts: ahora }]);
    setInput('');
    setCargando(true);
    // Simular latencia de IA (fijo para evitar Math.random en render)
    setTimeout(() => {
      const respuesta = encontrarRespuesta(texto);
      const botTs = new Date().toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' });
      setMensajes(prev => [...prev, { id: nuevoId + 1, tipo: 'bot', texto: respuesta, ts: botTs }]);
      setCargando(false);
    }, 1100);
  };

  const handleKey = e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); enviar(input); } };

  return (
    <div style={{ padding: '1.5rem', maxWidth: '800px', margin: '0 auto', display: 'flex', flexDirection: 'column', height: 'calc(100vh - 8rem)', minHeight: '500px' }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem', flexShrink: 0 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <div style={{ width: '2.75rem', height: '2.75rem', borderRadius: '50%', background: `linear-gradient(135deg, ${C.primary}, ${C.accent})`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.25rem' }}>🤖</div>
          <div>
            <h1 style={{ fontSize: '1.1rem', fontWeight: 800, color: C.text }}>Asistente FisioNova IA</h1>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
              <div style={{ width: '0.5rem', height: '0.5rem', borderRadius: '50%', background: C.secondary }} />
              <span style={{ fontSize: '0.75rem', color: C.secondary, fontWeight: 600 }}>Activo · Modo demo</span>
            </div>
          </div>
        </div>
        <div style={{ display: 'flex', gap: '0.5rem' }}>
          <button onClick={() => setMensajes([{ id: 0, tipo: 'bot', texto: 'Conversación reiniciada. ¿En qué puedo ayudarte? (demo)', ts: new Date().toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' }) }])}
            style={{ padding: '0.4rem 0.875rem', borderRadius: '0.5rem', border: `1.5px solid ${C.border}`, background: C.white, color: C.muted, cursor: 'pointer', fontSize: '0.8rem' }}>
            Reiniciar
          </button>
        </div>
      </div>

      {/* Aviso */}
      <div style={{ flexShrink: 0 }}>
        <MensajeAviso />
      </div>

      {/* Chat */}
      <div style={{ flex: 1, overflowY: 'auto', background: C.bg, borderRadius: '1rem', padding: '1.25rem', display: 'flex', flexDirection: 'column', gap: '1rem', marginBottom: '1rem', border: `1.5px solid ${C.border}` }}>
        {mensajes.map(m => (
          <div key={m.id} style={{ display: 'flex', justifyContent: m.tipo === 'user' ? 'flex-end' : 'flex-start', gap: '0.75rem', alignItems: 'flex-end' }}>
            {m.tipo === 'bot' && (
              <div style={{ width: '2rem', height: '2rem', borderRadius: '50%', background: `linear-gradient(135deg, ${C.primary}, ${C.accent})`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.9rem', flexShrink: 0 }}>🤖</div>
            )}
            <div style={{ maxWidth: '80%' }}>
              <div style={{ background: m.tipo === 'user' ? C.primary : C.white, color: m.tipo === 'user' ? '#fff' : C.text, borderRadius: m.tipo === 'user' ? '1rem 1rem 0 1rem' : '0 1rem 1rem 1rem', padding: '0.875rem 1rem', fontSize: '0.9rem', lineHeight: 1.5, border: m.tipo === 'bot' ? `1.5px solid ${C.border}` : 'none' }}>
                {m.texto}
              </div>
              <div style={{ fontSize: '0.68rem', color: C.muted, marginTop: '0.25rem', textAlign: m.tipo === 'user' ? 'right' : 'left' }}>{m.ts}</div>
            </div>
            {m.tipo === 'user' && (
              <div style={{ width: '2rem', height: '2rem', borderRadius: '50%', background: '#e0e7ff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.85rem', flexShrink: 0 }}>👤</div>
            )}
          </div>
        ))}
        {cargando && (
          <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'flex-end' }}>
            <div style={{ width: '2rem', height: '2rem', borderRadius: '50%', background: `linear-gradient(135deg, ${C.primary}, ${C.accent})`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.9rem' }}>🤖</div>
            <div style={{ background: C.white, borderRadius: '0 1rem 1rem 1rem', padding: '0.875rem 1.25rem', border: `1.5px solid ${C.border}`, display: 'flex', gap: '0.3rem' }}>
              {[0,1,2].map(i => <div key={i} style={{ width: '0.5rem', height: '0.5rem', borderRadius: '50%', background: C.primary, animation: `bounce 1s ${i * 0.2}s ease-in-out infinite` }} />)}
            </div>
          </div>
        )}
        <div ref={bottomRef} />
        <style>{`@keyframes bounce { 0%,80%,100%{transform:scale(0.8);opacity:0.6} 40%{transform:scale(1.2);opacity:1} }`}</style>
      </div>

      {/* Sugerencias rápidas */}
      {modoRapido && (
        <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', marginBottom: '0.75rem', flexShrink: 0 }}>
          {SUGERENCIAS.slice(0, 4).map(s => (
            <button key={s} onClick={() => { enviar(s); setModoRapido(false); }}
              style={{ padding: '0.4rem 0.875rem', borderRadius: '2rem', border: `1.5px solid ${C.border}`, background: C.white, color: C.primary, fontSize: '0.78rem', fontWeight: 600, cursor: 'pointer', flexShrink: 0, transition: 'all 0.15s' }}>
              {s}
            </button>
          ))}
        </div>
      )}

      {/* Input */}
      <div style={{ display: 'flex', gap: '0.75rem', flexShrink: 0 }}>
        <textarea value={input} onChange={e => setInput(e.target.value)} onKeyDown={handleKey}
          placeholder="Escribe tu consulta... (Intro para enviar)"
          rows={2} style={{ flex: 1, padding: '0.75rem 1rem', borderRadius: '0.75rem', border: `1.5px solid ${C.border}`, fontSize: '0.9rem', resize: 'none', fontFamily: 'inherit', outline: 'none', transition: 'border-color 0.2s' }}
          onFocus={e => { e.target.style.borderColor = C.primary; }}
          onBlur={e => { e.target.style.borderColor = C.border; }} />
        <button onClick={() => enviar(input)} disabled={!input.trim() || cargando}
          style={{ width: '3.5rem', background: input.trim() && !cargando ? C.primary : '#cbd5e1', color: '#fff', border: 'none', borderRadius: '0.75rem', cursor: input.trim() && !cargando ? 'pointer' : 'not-allowed', fontSize: '1.25rem', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          ➤
        </button>
      </div>
      <p style={{ fontSize: '0.72rem', color: C.muted, textAlign: 'center', marginTop: '0.5rem' }}>
        Demo comercial · Respuestas pregrabadas · No reemplaza valoración médica real
      </p>
    </div>
  );
}
