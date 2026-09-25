/**
 * OUTPUT GENERADO · EducaArchidona (Demo) · Tutor IA
 * Fabrica SaaS V1.8 · Education Vertical
 * Demo comercial · Sin IA real · Datos 100% ficticios · NO produccion
 * Politica: EDUCATION_AI_SAFETY_POLICY.md
 */
import { useState, useRef, useEffect } from 'react';
import { TUTOR_RESPUESTAS, ALUMNO_DEMO } from './EducaArchidonaMockData.js';

const INTENTS = [
  { label: 'Explicar concepto', key: 'explicar', icon: '💡', sample: 'Explica que es una funcion' },
  { label: 'Pedir pista',       key: 'pista',    icon: '🔍', sample: 'Dame una pista para el ejercicio' },
  { label: 'Mini quiz',         key: 'quiz',     icon: '🎯', sample: 'Hazme un quiz rapido' },
  { label: 'Resumen',           key: 'resumen',  icon: '📋', sample: 'Resume la unidad de funciones' },
];

function detectIntent(texto) {
  const t = texto.toLowerCase();
  if (t.includes('explic') || t.includes('que es') || t.includes('como') || t.includes('por que')) return 'explicar';
  if (t.includes('pista') || t.includes('ayuda') || t.includes('hint')) return 'pista';
  if (t.includes('quiz') || t.includes('pregunta') || t.includes('test')) return 'quiz';
  if (t.includes('resumen') || t.includes('resume') || t.includes('repaso')) return 'resumen';
  return 'explicar';
}

function getResponse(intent) {
  const arr = TUTOR_RESPUESTAS[intent] || TUTOR_RESPUESTAS.explicar;
  return arr[Math.floor(Math.random() * arr.length)];
}

function MensajeIA({ texto, loading }) {
  return (
    <div style={{ display: 'flex', gap: 10, marginBottom: 16 }}>
      <div style={{
        width: 36, height: 36, borderRadius: '50%',
        background: '#1d4ed8', color: '#fff',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        fontSize: 18, flexShrink: 0,
      }}>
        🤖
      </div>
      <div style={{ flex: 1 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 4 }}>
          <span style={{ fontSize: 13, fontWeight: 600, color: '#1e3a8a' }}>Tutor IA</span>
          <span style={{
            fontSize: 10, background: '#fef3c7', color: '#92400e',
            border: '1px solid #fde68a', borderRadius: 20, padding: '1px 8px',
          }}>
            Demo · Sin IA real
          </span>
        </div>
        <div style={{
          background: '#eff6ff', borderRadius: '0 12px 12px 12px',
          padding: '12px 16px', fontSize: 14, color: '#334155', lineHeight: 1.6,
        }}>
          {loading ? (
            <div style={{ display: 'flex', gap: 4, alignItems: 'center' }}>
              {[0, 1, 2].map(i => (
                <div key={i} style={{
                  width: 8, height: 8, borderRadius: '50%', background: '#93c5fd',
                  animation: `bounce .6s ${i * .15}s infinite alternate`,
                }} />
              ))}
              <style>{`@keyframes bounce { from { opacity:.3; transform:translateY(0) } to { opacity:1; transform:translateY(-4px) } }`}</style>
            </div>
          ) : texto}
        </div>
      </div>
    </div>
  );
}

function MensajeAlumno({ texto }) {
  return (
    <div style={{ display: 'flex', gap: 10, marginBottom: 16, flexDirection: 'row-reverse' }}>
      <div style={{
        width: 36, height: 36, borderRadius: '50%',
        background: '#16a34a', color: '#fff',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        fontSize: 18, flexShrink: 0,
      }}>
        {ALUMNO_DEMO.avatar}
      </div>
      <div>
        <div style={{
          background: '#dcfce7', borderRadius: '12px 0 12px 12px',
          padding: '12px 16px', fontSize: 14, color: '#166534', lineHeight: 1.6,
          maxWidth: 400,
        }}>
          {texto}
        </div>
      </div>
    </div>
  );
}

export function EducaArchidonaTutorIA() {
  const [mensajes, setMensajes] = useState([
    { tipo: 'ia', texto: `Hola ${ALUMNO_DEMO.nombre}! Soy tu asistente de estudio. Puedo explicarte conceptos, darte pistas o preparar un repaso. ¿En que te ayudo hoy?` },
  ]);
  const [input,  setInput]   = useState('');
  const [loading, setLoading] = useState(false);
  const endRef = useRef(null);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [mensajes, loading]);

  const enviar = (texto) => {
    if (!texto.trim() || loading) return;
    const textoCopy = texto.trim();
    setInput('');
    setMensajes(m => [...m, { tipo: 'alumno', texto: textoCopy }]);
    setLoading(true);
    setTimeout(() => {
      const intent = detectIntent(textoCopy);
      const resp = getResponse(intent);
      setMensajes(m => [...m, { tipo: 'ia', texto: resp }]);
      setLoading(false);
    }, 1100);
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      enviar(input);
    }
  };

  return (
    <div style={{ padding: 24, background: '#eff6ff', minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>

      {/* Header */}
      <div style={{
        background: 'linear-gradient(135deg, #1e3a8a, #1d4ed8)',
        borderRadius: 16, padding: '20px 24px', color: '#fff', marginBottom: 16,
        display: 'flex', alignItems: 'center', gap: 16,
      }}>
        <div style={{ fontSize: 40 }}>🤖</div>
        <div>
          <div style={{ fontWeight: 700, fontSize: 18 }}>Tutor IA Educativo</div>
          <div style={{ opacity: .8, fontSize: 13 }}>
            Disponible 24/7 · Materia actual: Matematicas 3 ESO
          </div>
        </div>
        <div style={{ marginLeft: 'auto', display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 4 }}>
          <span style={{
            background: '#fef3c7', color: '#92400e',
            border: '1px solid #fde68a',
            borderRadius: 20, padding: '4px 12px', fontSize: 11, fontWeight: 700,
          }}>
            Demo · Sin IA real
          </span>
          <span style={{
            background: '#dcfce7', color: '#166534',
            border: '1px solid #bbf7d0',
            borderRadius: 20, padding: '4px 12px', fontSize: 11,
          }}>
            ● Activo
          </span>
        </div>
      </div>

      {/* Aviso de seguridad */}
      <div style={{
        background: '#fefce8', border: '1px solid #fde68a', borderRadius: 10,
        padding: '10px 16px', marginBottom: 16, fontSize: 12, color: '#92400e',
        display: 'flex', gap: 8, alignItems: 'center',
      }}>
        <span style={{ fontSize: 16 }}>⚠️</span>
        <span>
          Este asistente es una demo con respuestas predefinidas. No da respuestas de examenes activos.
          No almacena datos. Siempre identificado como IA.
        </span>
      </div>

      {/* Sugerencias rapidas */}
      <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 16 }}>
        {INTENTS.map(intent => (
          <button
            key={intent.key}
            onClick={() => enviar(intent.sample)}
            disabled={loading}
            style={{
              background: '#fff', border: '1px solid #bfdbfe',
              borderRadius: 20, padding: '6px 14px', fontSize: 12,
              color: '#1d4ed8', cursor: loading ? 'not-allowed' : 'pointer',
              display: 'flex', gap: 4, alignItems: 'center',
            }}
          >
            {intent.icon} {intent.label}
          </button>
        ))}
      </div>

      {/* Chat */}
      <div style={{
        flex: 1, background: '#fff', borderRadius: 16, padding: 20,
        boxShadow: '0 2px 12px rgba(0,0,0,.05)', marginBottom: 16,
        minHeight: 300, maxHeight: 420, overflowY: 'auto',
      }}>
        {mensajes.map((m, i) => (
          m.tipo === 'ia'
            ? <MensajeIA key={i} texto={m.texto} />
            : <MensajeAlumno key={i} texto={m.texto} />
        ))}
        {loading && <MensajeIA loading />}
        <div ref={endRef} />
      </div>

      {/* Input */}
      <div style={{ display: 'flex', gap: 10 }}>
        <input
          value={input}
          onChange={e => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Escribe tu pregunta (Enter para enviar)..."
          disabled={loading}
          style={{
            flex: 1, padding: '12px 18px', borderRadius: 12,
            border: '2px solid #bfdbfe', fontSize: 14,
            outline: 'none', background: '#fff',
          }}
          aria-label="Mensaje al tutor IA"
        />
        <button
          onClick={() => enviar(input)}
          disabled={!input.trim() || loading}
          style={{
            background: input.trim() && !loading ? '#1d4ed8' : '#e2e8f0',
            color: input.trim() && !loading ? '#fff' : '#94a3b8',
            border: 'none', borderRadius: 12, padding: '12px 24px',
            fontWeight: 700, cursor: input.trim() && !loading ? 'pointer' : 'not-allowed',
            fontSize: 14, transition: 'background .15s',
          }}
          aria-label="Enviar mensaje"
        >
          Enviar ↑
        </button>
      </div>

      {/* Politica visible */}
      <div style={{ marginTop: 12, fontSize: 11, color: '#94a3b8', textAlign: 'center' }}>
        El tutor IA nunca da respuestas de examenes activos · Sin almacenamiento de conversacion ·
        Siempre identificado como asistente IA · Politica: EDUCATION_AI_SAFETY_POLICY.md
      </div>
    </div>
  );
}
