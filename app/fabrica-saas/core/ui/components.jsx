/**
 * Factory UI — shadcn-compatible components
 * API matches shadcn/ui conventions; implementation uses inline styles + CSS vars.
 * No Tailwind required. Fully self-contained.
 */

// ─── Button ─────────────────────────────────────────────────────────────────

const BUTTON_VARIANTS = {
  default:     { background: 'var(--primary)', color: 'var(--primary-foreground)', border: 'none' },
  secondary:   { background: 'var(--secondary)', color: 'var(--secondary-foreground)', border: 'none' },
  outline:     { background: 'transparent', color: 'var(--foreground)', border: '1px solid var(--border)' },
  ghost:       { background: 'transparent', color: 'var(--foreground)', border: 'none' },
  destructive: { background: 'var(--destructive)', color: 'var(--destructive-foreground)', border: 'none' },
  link:        { background: 'transparent', color: 'var(--primary)', border: 'none', textDecoration: 'underline' },
};

const BUTTON_SIZES = {
  default: { padding: '8px 16px', fontSize: '14px', borderRadius: 'var(--radius)' },
  sm:      { padding: '5px 12px', fontSize: '12px', borderRadius: 'var(--radius-sm)' },
  lg:      { padding: '12px 24px', fontSize: '16px', borderRadius: 'var(--radius-lg)' },
  icon:    { padding: '8px', fontSize: '14px', borderRadius: 'var(--radius)', width: '36px', height: '36px' },
};

export function Button({
  children, variant = 'default', size = 'default',
  disabled = false, onClick, style, type = 'button', ...rest
}) {
  return (
    <button
      type={type}
      disabled={disabled}
      onClick={onClick}
      style={{
        display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
        gap: '6px', fontWeight: 500, cursor: disabled ? 'not-allowed' : 'pointer',
        transition: 'var(--transition)', lineHeight: 1.2, whiteSpace: 'nowrap',
        opacity: disabled ? 0.5 : 1, fontFamily: 'var(--font-sans)',
        ...BUTTON_VARIANTS[variant] ?? BUTTON_VARIANTS.default,
        ...BUTTON_SIZES[size] ?? BUTTON_SIZES.default,
        ...style,
      }}
      {...rest}
    >
      {children}
    </button>
  );
}

// ─── Card ────────────────────────────────────────────────────────────────────

export function Card({ children, style, ...rest }) {
  return (
    <div style={{
      background: 'var(--card)', color: 'var(--card-foreground)',
      border: '1px solid var(--border)', borderRadius: 'var(--radius-lg)',
      boxShadow: 'var(--shadow-sm)', ...style,
    }} {...rest}>
      {children}
    </div>
  );
}

export function CardHeader({ children, style, ...rest }) {
  return <div style={{ padding: '24px 24px 0', ...style }} {...rest}>{children}</div>;
}

export function CardTitle({ children, style, ...rest }) {
  return (
    <h3 style={{
      fontSize: '18px', fontWeight: 700, color: 'var(--card-foreground)',
      margin: 0, lineHeight: 1.3, ...style,
    }} {...rest}>{children}</h3>
  );
}

export function CardDescription({ children, style, ...rest }) {
  return (
    <p style={{
      fontSize: '14px', color: 'var(--muted-foreground)', margin: '4px 0 0', ...style,
    }} {...rest}>{children}</p>
  );
}

export function CardContent({ children, style, ...rest }) {
  return <div style={{ padding: '16px 24px', ...style }} {...rest}>{children}</div>;
}

export function CardFooter({ children, style, ...rest }) {
  return (
    <div style={{
      padding: '0 24px 24px', display: 'flex', alignItems: 'center', gap: '8px', ...style,
    }} {...rest}>{children}</div>
  );
}

// ─── Badge ───────────────────────────────────────────────────────────────────

const BADGE_VARIANTS = {
  default:     { background: 'var(--primary)', color: 'var(--primary-foreground)' },
  secondary:   { background: 'var(--secondary)', color: 'var(--secondary-foreground)' },
  outline:     { background: 'transparent', color: 'var(--foreground)', border: '1px solid var(--border)' },
  destructive: { background: 'var(--destructive)', color: 'var(--destructive-foreground)' },
  success:     { background: 'var(--success)', color: 'var(--success-foreground)' },
  warning:     { background: 'var(--warning)', color: 'var(--warning-foreground)' },
};

export function Badge({ children, variant = 'default', style, ...rest }) {
  return (
    <span style={{
      display: 'inline-flex', alignItems: 'center', gap: '4px',
      padding: '2px 8px', fontSize: '11px', fontWeight: 600,
      borderRadius: 'var(--radius-full)', letterSpacing: '0.02em',
      lineHeight: 1.6, whiteSpace: 'nowrap',
      ...BADGE_VARIANTS[variant] ?? BADGE_VARIANTS.default,
      ...style,
    }} {...rest}>{children}</span>
  );
}

// ─── Input ───────────────────────────────────────────────────────────────────

export function Input({ style, ...rest }) {
  return (
    <input style={{
      display: 'flex', width: '100%', borderRadius: 'var(--radius)',
      border: '1px solid var(--input)', background: 'var(--background)',
      color: 'var(--foreground)', padding: '8px 12px', fontSize: '14px',
      lineHeight: 1.5, outline: 'none', boxSizing: 'border-box',
      fontFamily: 'var(--font-sans)', transition: 'var(--transition)',
      ...style,
    }} {...rest} />
  );
}

// ─── Textarea ────────────────────────────────────────────────────────────────

export function Textarea({ style, ...rest }) {
  return (
    <textarea style={{
      display: 'flex', width: '100%', borderRadius: 'var(--radius)',
      border: '1px solid var(--input)', background: 'var(--background)',
      color: 'var(--foreground)', padding: '8px 12px', fontSize: '14px',
      lineHeight: 1.5, outline: 'none', boxSizing: 'border-box', resize: 'vertical',
      fontFamily: 'var(--font-sans)', minHeight: '80px', transition: 'var(--transition)',
      ...style,
    }} {...rest} />
  );
}

// ─── Select ──────────────────────────────────────────────────────────────────

export function Select({ children, style, ...rest }) {
  return (
    <select style={{
      display: 'flex', width: '100%', borderRadius: 'var(--radius)',
      border: '1px solid var(--input)', background: 'var(--background)',
      color: 'var(--foreground)', padding: '8px 12px', fontSize: '14px',
      lineHeight: 1.5, outline: 'none', boxSizing: 'border-box', cursor: 'pointer',
      fontFamily: 'var(--font-sans)', transition: 'var(--transition)',
      ...style,
    }} {...rest}>{children}</select>
  );
}

// ─── Tabs ────────────────────────────────────────────────────────────────────

import { useState } from 'react';

export function Tabs({ children, defaultValue, value, onValueChange, style, ...rest }) {
  const [internal, setInternal] = useState(defaultValue ?? '');
  const active = value ?? internal;
  const onChange = onValueChange ?? setInternal;
  return (
    <div style={style} data-tabs-root {...rest}>
      {typeof children === 'function' ? children({ active, onChange }) : children}
    </div>
  );
}

export function TabsList({ children, style, ...rest }) {
  return (
    <div style={{
      display: 'inline-flex', alignItems: 'center', background: 'var(--muted)',
      borderRadius: 'var(--radius)', padding: '4px', gap: '2px', ...style,
    }} {...rest}>{children}</div>
  );
}

export function TabsTrigger({ children, value, active, onSelect, style, ...rest }) {
  return (
    <button
      type="button"
      onClick={() => onSelect?.(value)}
      style={{
        padding: '6px 12px', borderRadius: 'var(--radius-sm)', fontSize: '13px',
        fontWeight: active ? 600 : 500, cursor: 'pointer', border: 'none',
        background: active ? 'var(--background)' : 'transparent',
        color: active ? 'var(--foreground)' : 'var(--muted-foreground)',
        boxShadow: active ? 'var(--shadow-sm)' : 'none',
        transition: 'var(--transition)', whiteSpace: 'nowrap',
        ...style,
      }} {...rest}
    >{children}</button>
  );
}

export function TabsContent({ children, active, style, ...rest }) {
  if (!active) return null;
  return <div style={{ marginTop: '12px', ...style }} {...rest}>{children}</div>;
}

// ─── Alert ───────────────────────────────────────────────────────────────────

const ALERT_VARIANTS = {
  default:     { background: 'var(--background)', border: '1px solid var(--border)' },
  destructive: { background: '#fef2f2', border: '1px solid #fecaca', color: 'var(--destructive)' },
  warning:     { background: '#fffbeb', border: '1px solid #fde68a' },
  success:     { background: '#f0fdf4', border: '1px solid #bbf7d0' },
  info:        { background: '#f0f9ff', border: '1px solid #bae6fd' },
};

export function Alert({ children, variant = 'default', style, ...rest }) {
  return (
    <div style={{
      borderRadius: 'var(--radius)', padding: '12px 16px', fontSize: '14px',
      display: 'flex', gap: '10px', alignItems: 'flex-start',
      ...ALERT_VARIANTS[variant] ?? ALERT_VARIANTS.default,
      ...style,
    }} {...rest}>{children}</div>
  );
}

export function AlertTitle({ children, style, ...rest }) {
  return (
    <div style={{ fontWeight: 700, marginBottom: '2px', fontSize: '14px', ...style }} {...rest}>{children}</div>
  );
}

export function AlertDescription({ children, style, ...rest }) {
  return <div style={{ fontSize: '13px', opacity: 0.9, ...style }} {...rest}>{children}</div>;
}

// ─── Separator ───────────────────────────────────────────────────────────────

export function Separator({ orientation = 'horizontal', style, ...rest }) {
  return (
    <div
      style={orientation === 'horizontal'
        ? { borderTop: '1px solid var(--border)', margin: '12px 0', ...style }
        : { borderLeft: '1px solid var(--border)', alignSelf: 'stretch', ...style }
      } {...rest}
    />
  );
}

// ─── Skeleton ────────────────────────────────────────────────────────────────

export function Skeleton({ style, ...rest }) {
  return (
    <div style={{
      background: 'linear-gradient(90deg, var(--muted) 25%, #e8ecf0 50%, var(--muted) 75%)',
      backgroundSize: '200% 100%',
      animation: 'skeleton-shimmer 1.5s ease-in-out infinite',
      borderRadius: 'var(--radius)', ...style,
    }} {...rest} />
  );
}

// ─── Table ───────────────────────────────────────────────────────────────────

export function Table({ children, style, ...rest }) {
  return (
    <div style={{ overflowX: 'auto', ...style }}>
      <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '14px' }} {...rest}>
        {children}
      </table>
    </div>
  );
}

export function TableHeader({ children, ...rest }) {
  return <thead {...rest}>{children}</thead>;
}

export function TableBody({ children, ...rest }) {
  return <tbody {...rest}>{children}</tbody>;
}

export function TableRow({ children, style, ...rest }) {
  return (
    <tr style={{
      borderBottom: '1px solid var(--border)',
      transition: 'background var(--transition)', ...style,
    }} {...rest}>{children}</tr>
  );
}

export function TableHead({ children, style, ...rest }) {
  return (
    <th style={{
      padding: '10px 12px', textAlign: 'left', fontWeight: 600, fontSize: '12px',
      color: 'var(--muted-foreground)', letterSpacing: '0.04em',
      borderBottom: '1px solid var(--border)', ...style,
    }} {...rest}>{children}</th>
  );
}

export function TableCell({ children, style, ...rest }) {
  return (
    <td style={{
      padding: '10px 12px', color: 'var(--foreground)', verticalAlign: 'middle', ...style,
    }} {...rest}>{children}</td>
  );
}

// ─── Tooltip (simple hover) ──────────────────────────────────────────────────

export function Tooltip({ children, content, style, ...rest }) {
  return (
    <span
      title={content}
      style={{ position: 'relative', cursor: 'help', ...style }}
      {...rest}
    >
      {children}
    </span>
  );
}

// ─── Label ───────────────────────────────────────────────────────────────────

export function Label({ children, htmlFor, style, ...rest }) {
  return (
    <label
      htmlFor={htmlFor}
      style={{
        fontSize: '13px', fontWeight: 600, color: 'var(--foreground)',
        display: 'block', marginBottom: '4px', ...style,
      }} {...rest}
    >{children}</label>
  );
}
