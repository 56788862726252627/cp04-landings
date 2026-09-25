/**
 * CORE · ChatComponents
 * Componentes UI reutilizables para el flujo de chatbot multi-paso.
 * Sin lógica de negocio ni datos de vertical. Solo presentación.
 * Usados por DentalChatbot → puede importarlos; PhysioChatbot → los importa.
 */
import { useState } from 'react';

export function StepIndicator({ steps, currentStep }) {
  const visibleSteps = steps.filter(s => s.id !== 'confirmacion');
  const idx = visibleSteps.findIndex(s => s.id === currentStep);
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 0, marginBottom: 24, overflowX: 'auto' }}>
      {visibleSteps.map((s, i) => (
        <div key={s.id} style={{ display: 'flex', alignItems: 'center' }}>
          <div style={{
            width: 28, height: 28, borderRadius: '50%',
            background: i < idx ? '#16a34a' : i === idx ? '#2563eb' : '#e5e7eb',
            color: i <= idx ? '#fff' : '#9ca3af',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: 12, fontWeight: 700, flexShrink: 0,
          }}>
            {i < idx ? '✓' : i + 1}
          </div>
          <span style={{
            fontSize: 11, color: i === idx ? '#2563eb' : '#9ca3af',
            marginLeft: 4, marginRight: 4, whiteSpace: 'nowrap',
            display: i > 3 ? 'none' : 'inline',
          }}>
            {s.label}
          </span>
          {i < visibleSteps.length - 1 && (
            <div style={{ width: 24, height: 2, background: i < idx ? '#16a34a' : '#e5e7eb', flexShrink: 0, margin: '0 4px' }} />
          )}
        </div>
      ))}
    </div>
  );
}

export function BotBubble({ children, icon = '🤖' }) {
  return (
    <div style={{ display: 'flex', gap: 10, marginBottom: 16, alignItems: 'flex-start' }}>
      <div style={{
        width: 32, height: 32, background: '#2563eb', borderRadius: '50%',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        fontSize: 16, flexShrink: 0,
      }}>
        {icon}
      </div>
      <div style={{
        background: '#f1f5f9', borderRadius: '0 12px 12px 12px',
        padding: '12px 16px', maxWidth: '80%', fontSize: 14, color: '#374151', lineHeight: 1.6,
      }}>
        {children}
      </div>
    </div>
  );
}

export function UserBubble({ children }) {
  return (
    <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: 16 }}>
      <div style={{
        background: '#2563eb', color: '#fff',
        borderRadius: '12px 0 12px 12px',
        padding: '10px 14px', maxWidth: '70%', fontSize: 14, lineHeight: 1.5,
      }}>
        {children}
      </div>
    </div>
  );
}

export function OptionBtn({ onClick, emoji, label, desc, color = '#f8fafc', borderColor = '#e5e7eb' }) {
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
        display: 'flex', alignItems: 'flex-start', gap: 10,
        textAlign: 'left', width: '100%', transition: 'all 0.15s',
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

export function SensibleAlert({ titulo, mensaje, color = 'orange' }) {
  const paleta = {
    orange: { bg: '#fff7ed', border: '#fed7aa', title: '#9a3412', body: '#7c2d12', icon: '⚕️' },
    red:    { bg: '#fef2f2', border: '#fca5a5', title: '#991b1b', body: '#7f1d1d', icon: '🚨' },
  };
  const c = paleta[color] || paleta.orange;
  return (
    <div style={{
      background: c.bg, border: `1px solid ${c.border}`,
      borderRadius: 10, padding: '14px 16px', marginBottom: 16,
      display: 'flex', gap: 10, alignItems: 'flex-start',
    }}>
      <span style={{ fontSize: 20 }}>{c.icon}</span>
      <div>
        <div style={{ fontWeight: 700, color: c.title, fontSize: 14, marginBottom: 4 }}>{titulo}</div>
        <p style={{ margin: 0, fontSize: 13, color: c.body, lineHeight: 1.5 }}>{mensaje}</p>
      </div>
    </div>
  );
}

export function ConfirmacionPanel({ titulo, detalle, onReset, resetLabel = 'Nueva consulta demo' }) {
  return (
    <div style={{ textAlign: 'center', padding: '24px 0' }}>
      <div style={{ fontSize: 48, marginBottom: 12 }}>✅</div>
      <h3 style={{ color: '#15803d', fontWeight: 800, fontSize: 18, margin: '0 0 8px' }}>{titulo}</h3>
      <div style={{ color: '#6b7280', fontSize: 14, margin: '0 0 16px', lineHeight: 1.7 }}>{detalle}</div>
      <p style={{ fontSize: 12, color: '#9ca3af', margin: '0 0 20px', background: '#f9fafb', padding: 12, borderRadius: 8 }}>
        ⚠️ DEMO INTERNA — No se ha enviado ningún email ni SMS. No se ha creado ninguna cita real. Datos ficticios.
      </p>
      <button
        onClick={onReset}
        style={{ padding: '10px 24px', background: '#2563eb', color: '#fff', border: 'none', borderRadius: 8, cursor: 'pointer', fontWeight: 700, fontSize: 14 }}
      >
        {resetLabel}
      </button>
    </div>
  );
}
