/**
 * OUTPUT GENERADO · EducaArchidona (Demo) · Motor de Ejercicios
 * Fabrica SaaS V1.8 · Education Vertical
 * Demo comercial · Datos 100% ficticios · NO produccion
 */
import { useState } from 'react';
import { EJERCICIOS } from './EducaArchidonaMockData.js';

export function EducaArchidonaEjercicios() {
  const [idx,        setIdx]        = useState(0);
  const [seleccion,  setSeleccion]  = useState(null);
  const [respuesta,  setRespuesta]  = useState(null); // true/false/null
  const [mostrarPista, setMostrarPista] = useState(false);
  const [puntos,     setPuntos]     = useState(0);
  const [completados, setCompletados] = useState([]);

  const ejercicio = EJERCICIOS[idx];
  const totalCompletados = completados.length;

  const handleResponder = (opcionIdx) => {
    if (respuesta !== null) return;
    setSeleccion(opcionIdx);
    const correcto = opcionIdx === ejercicio.respuesta_correcta;
    setRespuesta(correcto);
    if (correcto && !completados.includes(idx)) {
      setPuntos(p => p + ejercicio.puntos);
      setCompletados(c => [...c, idx]);
    }
  };

  const handleVF = (valor) => {
    if (respuesta !== null) return;
    setSeleccion(valor);
    const correcto = valor === ejercicio.respuesta_correcta;
    setRespuesta(correcto);
    if (correcto && !completados.includes(idx)) {
      setPuntos(p => p + ejercicio.puntos);
      setCompletados(c => [...c, idx]);
    }
  };

  const handleSiguiente = () => {
    if (idx < EJERCICIOS.length - 1) {
      setIdx(idx + 1);
      setSeleccion(null);
      setRespuesta(null);
      setMostrarPista(false);
    }
  };

  const handleReiniciar = () => {
    setIdx(0);
    setSeleccion(null);
    setRespuesta(null);
    setMostrarPista(false);
    setPuntos(0);
    setCompletados([]);
  };

  const bgColor = respuesta === null ? '#fff'
    : respuesta ? '#f0fdf4'
    : '#fef2f2';

  const borderColor = respuesta === null ? '#e2e8f0'
    : respuesta ? '#86efac'
    : '#fca5a5';

  return (
    <div style={{ padding: 24, background: '#eff6ff', minHeight: '100vh' }}>

      {/* Header stats */}
      <div style={{
        display: 'flex', gap: 16, marginBottom: 24, flexWrap: 'wrap',
      }}>
        <div style={{ background: '#1d4ed8', color: '#fff', borderRadius: 12, padding: '12px 20px', fontWeight: 700 }}>
          ✏️ Ejercicio {idx + 1} / {EJERCICIOS.length}
        </div>
        <div style={{ background: '#fff', borderRadius: 12, padding: '12px 20px', fontWeight: 700, color: '#16a34a', border: '2px solid #bbf7d0' }}>
          ⭐ {puntos} puntos
        </div>
        <div style={{ background: '#fff', borderRadius: 12, padding: '12px 20px', fontWeight: 700, color: '#7c3aed', border: '2px solid #ede9fe' }}>
          ✅ {totalCompletados} completados
        </div>
      </div>

      {/* Navegacion entre ejercicios */}
      <div style={{ display: 'flex', gap: 8, marginBottom: 20, flexWrap: 'wrap' }}>
        {EJERCICIOS.map((e, i) => (
          <button
            key={e.id}
            onClick={() => { setIdx(i); setSeleccion(null); setRespuesta(null); setMostrarPista(false); }}
            style={{
              width: 36, height: 36, borderRadius: '50%', border: '2px solid',
              borderColor: completados.includes(i) ? '#16a34a' : i === idx ? '#1d4ed8' : '#e2e8f0',
              background:  completados.includes(i) ? '#f0fdf4' : i === idx ? '#eff6ff' : '#fff',
              color:       completados.includes(i) ? '#16a34a' : i === idx ? '#1d4ed8' : '#94a3b8',
              fontWeight: 700, cursor: 'pointer', fontSize: 13,
            }}
            aria-current={i === idx}
          >
            {completados.includes(i) ? '✓' : i + 1}
          </button>
        ))}
      </div>

      {/* Tarjeta de ejercicio */}
      <div style={{
        background: bgColor, borderRadius: 20, padding: 32,
        border: `2px solid ${borderColor}`,
        boxShadow: '0 4px 20px rgba(0,0,0,.07)',
        maxWidth: 700, margin: '0 auto',
        transition: 'background .3s, border-color .3s',
      }}>
        {/* Cabecera */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 20 }}>
          <span style={{ fontSize: 24 }}>
            {ejercicio.tipo === 'opcion-multiple' ? '📋' : '⚖️'}
          </span>
          <div>
            <div style={{ fontSize: 12, color: '#94a3b8' }}>
              {ejercicio.materia} ·
              {ejercicio.tipo === 'opcion-multiple' ? ' Opcion multiple' : ' Verdadero o Falso'} ·
              {ejercicio.puntos} pts
            </div>
            <div style={{
              fontSize: 10, padding: '2px 8px', borderRadius: 4, display: 'inline-block', marginTop: 2,
              background: ejercicio.dificultad === 'alta' ? '#fee2e2' : '#fef3c7',
              color:      ejercicio.dificultad === 'alta' ? '#dc2626' : '#d97706',
            }}>
              {ejercicio.dificultad.toUpperCase()}
            </div>
          </div>
        </div>

        {/* Enunciado */}
        <div style={{
          fontSize: 18, fontWeight: 600, color: '#1e3a8a', marginBottom: 28, lineHeight: 1.5,
        }}>
          {ejercicio.enunciado}
        </div>

        {/* Opciones */}
        {ejercicio.tipo === 'opcion-multiple' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {ejercicio.opciones.map((op, i) => {
              const esCorrecta = i === ejercicio.respuesta_correcta;
              const esSeleccionada = i === seleccion;
              let bg = '#f8fafc', border = '#e2e8f0', color = '#334155';
              if (respuesta !== null) {
                if (esCorrecta) { bg = '#f0fdf4'; border = '#86efac'; color = '#166534'; }
                else if (esSeleccionada) { bg = '#fef2f2'; border = '#fca5a5'; color = '#991b1b'; }
              } else if (esSeleccionada) {
                bg = '#eff6ff'; border = '#93c5fd'; color = '#1e3a8a';
              }
              return (
                <button
                  key={i}
                  onClick={() => handleResponder(i)}
                  disabled={respuesta !== null}
                  style={{
                    padding: '14px 18px', borderRadius: 12, border: `2px solid ${border}`,
                    background: bg, color, textAlign: 'left', fontSize: 15, fontWeight: 500,
                    cursor: respuesta !== null ? 'default' : 'pointer',
                    transition: 'all .15s',
                    display: 'flex', alignItems: 'center', gap: 10,
                  }}
                  aria-pressed={esSeleccionada}
                >
                  <span style={{
                    width: 28, height: 28, borderRadius: '50%', border: `2px solid ${border}`,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: 13, fontWeight: 700, flexShrink: 0,
                    background: esSeleccionada || (respuesta !== null && esCorrecta) ? border : 'transparent',
                  }}>
                    {respuesta !== null && esCorrecta ? '✓' : String.fromCharCode(65 + i)}
                  </span>
                  {op}
                </button>
              );
            })}
          </div>
        )}

        {ejercicio.tipo === 'verdadero-falso' && (
          <div style={{ display: 'flex', gap: 16 }}>
            {[true, false].map(val => {
              const esCorrecta = val === ejercicio.respuesta_correcta;
              const esSeleccionada = seleccion === val;
              let bg = '#f8fafc', border = '#e2e8f0', color = '#334155';
              if (respuesta !== null) {
                if (esCorrecta) { bg = '#f0fdf4'; border = '#86efac'; color = '#166534'; }
                else if (esSeleccionada) { bg = '#fef2f2'; border = '#fca5a5'; color = '#991b1b'; }
              } else if (esSeleccionada) {
                bg = '#eff6ff'; border = '#93c5fd'; color = '#1e3a8a';
              }
              return (
                <button
                  key={String(val)}
                  onClick={() => handleVF(val)}
                  disabled={respuesta !== null}
                  style={{
                    flex: 1, padding: '20px 0', borderRadius: 14, border: `2px solid ${border}`,
                    background: bg, color, fontSize: 18, fontWeight: 700, cursor: respuesta !== null ? 'default' : 'pointer',
                    transition: 'all .15s',
                  }}
                  aria-pressed={esSeleccionada}
                >
                  {val ? '✓ Verdadero' : '✗ Falso'}
                </button>
              );
            })}
          </div>
        )}

        {/* Feedback */}
        {respuesta !== null && (
          <div style={{
            marginTop: 20, padding: '16px 18px', borderRadius: 12,
            background: respuesta ? '#dcfce7' : '#fee2e2',
            border: `1px solid ${respuesta ? '#86efac' : '#fca5a5'}`,
          }}>
            <div style={{ fontWeight: 700, color: respuesta ? '#166534' : '#991b1b', marginBottom: 6 }}>
              {respuesta ? '✅ Correcto!' : '❌ Incorrecto'}
            </div>
            <div style={{ fontSize: 13, color: respuesta ? '#166534' : '#991b1b', lineHeight: 1.6 }}>
              {ejercicio.explicacion}
            </div>
          </div>
        )}

        {/* Pista */}
        {!mostrarPista && respuesta === null && (
          <button
            onClick={() => setMostrarPista(true)}
            style={{
              marginTop: 16, background: 'none', border: '1px dashed #cbd5e1',
              borderRadius: 8, padding: '8px 16px', cursor: 'pointer',
              color: '#64748b', fontSize: 13,
            }}
          >
            💡 Ver pista
          </button>
        )}
        {mostrarPista && respuesta === null && (
          <div style={{
            marginTop: 16, padding: '12px 16px', borderRadius: 10,
            background: '#fefce8', border: '1px solid #fde68a',
          }}>
            <span style={{ fontSize: 13, color: '#92400e' }}>💡 {ejercicio.pista}</span>
          </div>
        )}

        {/* Acciones */}
        <div style={{ display: 'flex', gap: 12, marginTop: 24, justifyContent: 'flex-end' }}>
          {respuesta !== null && idx < EJERCICIOS.length - 1 && (
            <button
              onClick={handleSiguiente}
              style={{
                background: '#1d4ed8', color: '#fff', border: 'none',
                borderRadius: 10, padding: '10px 24px', fontWeight: 600, cursor: 'pointer', fontSize: 14,
              }}
            >
              Siguiente ejercicio →
            </button>
          )}
          {respuesta !== null && idx === EJERCICIOS.length - 1 && (
            <button
              onClick={handleReiniciar}
              style={{
                background: '#16a34a', color: '#fff', border: 'none',
                borderRadius: 10, padding: '10px 24px', fontWeight: 600, cursor: 'pointer', fontSize: 14,
              }}
            >
              🔄 Reiniciar ejercicios
            </button>
          )}
        </div>
      </div>

      {/* Progreso general */}
      {completados.length > 0 && (
        <div style={{ marginTop: 24, textAlign: 'center', color: '#64748b', fontSize: 13 }}>
          Has completado {completados.length} de {EJERCICIOS.length} ejercicios · {puntos} puntos acumulados
        </div>
      )}
    </div>
  );
}
