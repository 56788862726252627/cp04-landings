/**
 * Factory Base UI Primitives V2
 * Headless, accessible UI components. No external UI library dependency.
 * Drawer/Dialog/Popover/Combobox/Autocomplete/Tooltip/NavigationMenu/Toast/ScrollArea
 */
import { useState, useRef, useEffect, useCallback, useId } from 'react';

// ─── Portal helper ─────────────────────────────────────────────��──────────────

function useEscapeKey(onEscape) {
  useEffect(() => {
    const handler = (e) => { if (e.key === 'Escape') onEscape?.(); };
    document.addEventListener('keydown', handler);
    return () => document.removeEventListener('keydown', handler);
  }, [onEscape]);
}

function useFocusTrap(ref, active) {
  useEffect(() => {
    if (!active || !ref.current) return;
    const el = ref.current;
    const focusable = el.querySelectorAll(
      'a[href],button:not([disabled]),textarea,input,select,[tabindex]:not([tabindex="-1"])'
    );
    const first = focusable[0];
    const last  = focusable[focusable.length - 1];
    first?.focus();
    const trap = (e) => {
      if (e.key !== 'Tab') return;
      if (e.shiftKey) { if (document.activeElement === first) { last?.focus(); e.preventDefault(); } }
      else            { if (document.activeElement === last)  { first?.focus(); e.preventDefault(); } }
    };
    el.addEventListener('keydown', trap);
    return () => el.removeEventListener('keydown', trap);
  }, [active, ref]);
}

// ─── 1. Drawer ────────────────────────────────────────────────────────────────

export function Drawer({ open, onClose, children, side = 'right', width = 400, title }) {
  const ref = useRef(null);
  useEscapeKey(open ? onClose : undefined);
  useFocusTrap(ref, open);

  if (!open) return null;
  const sideStyle = side === 'left'
    ? { left: 0, right: 'auto' }
    : { right: 0, left: 'auto' };

  return (
    <>
      <div
        role="presentation"
        onClick={onClose}
        style={{
          position: 'fixed', inset: 0, background: 'rgba(0,0,0,.4)', zIndex: 200,
          cursor: 'pointer',
        }}
      />
      <div
        ref={ref}
        role="dialog"
        aria-modal="true"
        aria-label={title ?? 'Panel'}
        style={{
          position: 'fixed', top: 0, bottom: 0, width,
          background: '#fff', zIndex: 201, overflowY: 'auto',
          display: 'flex', flexDirection: 'column',
          boxShadow: '0 0 48px rgba(0,0,0,.15)',
          ...sideStyle,
        }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '16px 20px', borderBottom: '1px solid #f1f5f9' }}>
          {title && <span style={{ fontWeight: 600, fontSize: 16 }}>{title}</span>}
          <button onClick={onClose} aria-label="Cerrar" style={{ marginLeft: 'auto', background: 'none', border: 'none', fontSize: 20, cursor: 'pointer', color: '#64748b' }}>×</button>
        </div>
        <div style={{ flex: 1, padding: 20 }}>{children}</div>
      </div>
    </>
  );
}

// ─── 2. Dialog ────────────────────────────────────────────────────────────────

export function Dialog({ open, onClose, children, title, size = 'md', ...rest }) {
  const ref = useRef(null);
  useEscapeKey(open ? onClose : undefined);
  useFocusTrap(ref, open);

  const sizes = { sm: 400, md: 560, lg: 720, xl: 900, full: '95vw' };

  if (!open) return null;
  return (
    <>
      <div
        role="presentation"
        onClick={onClose}
        style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,.5)', zIndex: 300, display: 'flex', alignItems: 'center', justifyContent: 'center' }}
      />
      <div
        ref={ref}
        role="dialog"
        aria-modal="true"
        aria-labelledby={title ? 'dialog-title' : undefined}
        style={{
          position: 'fixed', top: '50%', left: '50%',
          transform: 'translate(-50%, -50%)',
          width: sizes[size] ?? sizes.md, maxWidth: '95vw', maxHeight: '90vh',
          background: '#fff', borderRadius: 16, zIndex: 301, overflowY: 'auto',
          boxShadow: '0 24px 80px rgba(0,0,0,.2)',
        }}
        {...rest}
      >
        {title && (
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '20px 24px', borderBottom: '1px solid #f1f5f9' }}>
            <span id="dialog-title" style={{ fontWeight: 700, fontSize: 18 }}>{title}</span>
            <button onClick={onClose} aria-label="Cerrar diálogo" style={{ background: 'none', border: 'none', fontSize: 22, cursor: 'pointer', color: '#64748b' }}>×</button>
          </div>
        )}
        <div style={{ padding: '20px 24px' }}>{children}</div>
      </div>
    </>
  );
}

// ─── 3. Popover ───────────────────────────────────────────────────────────────

export function Popover({ trigger, children, placement = 'bottom', offset = 8 }) {
  const [open, setOpen] = useState(false);
  const trigRef = useRef(null);
  const popRef  = useRef(null);
  const id = useId();

  useEscapeKey(open ? () => setOpen(false) : undefined);

  useEffect(() => {
    if (!open) return;
    const close = (e) => {
      if (!trigRef.current?.contains(e.target) && !popRef.current?.contains(e.target)) {
        setOpen(false);
      }
    };
    document.addEventListener('mousedown', close);
    return () => document.removeEventListener('mousedown', close);
  }, [open]);

  const placements = {
    bottom: { top: '100%', left: '50%', transform: `translateX(-50%) translateY(${offset}px)` },
    top:    { bottom: '100%', left: '50%', transform: `translateX(-50%) translateY(-${offset}px)` },
    left:   { right: '100%', top: '50%',  transform: `translateY(-50%) translateX(-${offset}px)` },
    right:  { left: '100%',  top: '50%',  transform: `translateY(-50%) translateX(${offset}px)` },
  };

  return (
    <div style={{ position: 'relative', display: 'inline-flex' }}>
      <div
        ref={trigRef}
        aria-expanded={open}
        aria-haspopup="true"
        aria-controls={id}
        onClick={() => setOpen(o => !o)}
      >
        {trigger}
      </div>
      {open && (
        <div
          ref={popRef}
          id={id}
          role="dialog"
          style={{
            position: 'absolute', zIndex: 500,
            background: '#fff', borderRadius: 12,
            boxShadow: '0 8px 32px rgba(0,0,0,.12)',
            border: '1px solid #e2e8f0', padding: 16,
            minWidth: 200,
            ...placements[placement],
          }}
        >
          {children}
        </div>
      )}
    </div>
  );
}

// ─── 4. Tooltip ───────────────────────────────────────────────────────────────

export function Tooltip({ children, content, placement = 'top', delay = 300 }) {
  const [visible, setVisible] = useState(false);
  const timer = useRef(null);
  const id = useId();

  const show = () => { timer.current = setTimeout(() => setVisible(true), delay); };
  const hide = () => { clearTimeout(timer.current); setVisible(false); };

  const placements = {
    top:    { bottom: 'calc(100% + 6px)', left: '50%', transform: 'translateX(-50%)' },
    bottom: { top: 'calc(100% + 6px)',    left: '50%', transform: 'translateX(-50%)' },
    left:   { right: 'calc(100% + 6px)', top: '50%',  transform: 'translateY(-50%)' },
    right:  { left: 'calc(100% + 6px)',  top: '50%',  transform: 'translateY(-50%)' },
  };

  return (
    <span
      style={{ position: 'relative', display: 'inline-flex' }}
      onMouseEnter={show}
      onMouseLeave={hide}
      onFocus={show}
      onBlur={hide}
      aria-describedby={visible ? id : undefined}
    >
      {children}
      {visible && content && (
        <div
          id={id}
          role="tooltip"
          style={{
            position: 'absolute', zIndex: 600,
            background: '#1e293b', color: '#fff',
            fontSize: 12, padding: '6px 10px', borderRadius: 8,
            whiteSpace: 'nowrap', pointerEvents: 'none',
            ...placements[placement],
          }}
        >
          {content}
        </div>
      )}
    </span>
  );
}

// ─── 5. NavigationMenu ────────────────────────────────────────────────────────

export function NavigationMenu({ items = [], orientation = 'horizontal', className, style }) {
  const [activeItem, setActiveItem] = useState(null);

  return (
    <nav
      aria-label="Navegación principal"
      className={className}
      style={{
        display: 'flex',
        flexDirection: orientation === 'vertical' ? 'column' : 'row',
        gap: 4,
        ...style,
      }}
    >
      {items.map(item => (
        <div key={item.id} style={{ position: 'relative' }}>
          <button
            aria-expanded={item.children ? activeItem === item.id : undefined}
            aria-haspopup={item.children ? 'true' : undefined}
            onClick={() => {
              if (item.onClick) item.onClick();
              if (item.children) setActiveItem(a => a === item.id ? null : item.id);
            }}
            style={{
              padding: '8px 14px', borderRadius: 8, border: 'none',
              background: activeItem === item.id ? '#f1f5f9' : 'transparent',
              cursor: 'pointer', fontSize: 14, fontWeight: 500, color: '#334155',
              display: 'flex', alignItems: 'center', gap: 6,
            }}
          >
            {item.icon && <span>{item.icon}</span>}
            {item.label}
            {item.children && <span style={{ fontSize: 10, opacity: .6 }}>▼</span>}
          </button>
          {item.children && activeItem === item.id && (
            <div style={{
              position: 'absolute', top: 'calc(100% + 4px)', left: 0,
              background: '#fff', borderRadius: 12, border: '1px solid #e2e8f0',
              boxShadow: '0 8px 24px rgba(0,0,0,.10)', padding: 8, zIndex: 400,
              minWidth: 180,
            }}>
              {item.children.map(child => (
                <button
                  key={child.id}
                  onClick={() => { child.onClick?.(); setActiveItem(null); }}
                  style={{
                    width: '100%', padding: '8px 12px', borderRadius: 8, border: 'none',
                    background: 'transparent', cursor: 'pointer', fontSize: 13,
                    textAlign: 'left', color: '#334155', display: 'flex', gap: 8,
                  }}
                >
                  {child.icon && <span>{child.icon}</span>}
                  {child.label}
                </button>
              ))}
            </div>
          )}
        </div>
      ))}
    </nav>
  );
}

// ─── 6. Combobox ──────────────────────────────────────────────────────────────

export function Combobox({
  options = [],
  value,
  onChange,
  placeholder = 'Seleccionar...',
  searchable = true,
  className,
  style,
}) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState('');
  const id = useId();
  const ref = useRef(null);

  useEscapeKey(open ? () => setOpen(false) : undefined);

  useEffect(() => {
    if (!open) return;
    const close = (e) => { if (!ref.current?.contains(e.target)) setOpen(false); };
    document.addEventListener('mousedown', close);
    return () => document.removeEventListener('mousedown', close);
  }, [open]);

  const filtered = searchable && query
    ? options.filter(o => o.label.toLowerCase().includes(query.toLowerCase()))
    : options;

  const selected = options.find(o => o.value === value);

  return (
    <div ref={ref} style={{ position: 'relative', ...style }} className={className}>
      <button
        type="button"
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-controls={id}
        onClick={() => setOpen(o => !o)}
        style={{
          width: '100%', padding: '10px 14px', borderRadius: 10, border: '2px solid #e2e8f0',
          background: '#fff', cursor: 'pointer', textAlign: 'left', fontSize: 14,
          display: 'flex', justifyContent: 'space-between', alignItems: 'center',
        }}
      >
        <span style={{ color: selected ? '#334155' : '#94a3b8' }}>
          {selected?.label ?? placeholder}
        </span>
        <span style={{ fontSize: 10, opacity: .5 }}>▼</span>
      </button>
      {open && (
        <div
          id={id}
          role="listbox"
          style={{
            position: 'absolute', top: 'calc(100% + 4px)', left: 0, right: 0, zIndex: 500,
            background: '#fff', borderRadius: 10, border: '1px solid #e2e8f0',
            boxShadow: '0 8px 24px rgba(0,0,0,.10)', overflow: 'hidden',
          }}
        >
          {searchable && (
            <div style={{ padding: '8px 10px', borderBottom: '1px solid #f1f5f9' }}>
              <input
                autoFocus
                value={query}
                onChange={e => setQuery(e.target.value)}
                placeholder="Buscar..."
                style={{
                  width: '100%', padding: '6px 10px', borderRadius: 8, border: '1px solid #e2e8f0',
                  fontSize: 13, outline: 'none',
                }}
                aria-label="Filtrar opciones"
              />
            </div>
          )}
          <div style={{ maxHeight: 240, overflowY: 'auto' }}>
            {filtered.map(opt => (
              <div
                key={opt.value}
                role="option"
                aria-selected={opt.value === value}
                onClick={() => { onChange(opt.value); setOpen(false); setQuery(''); }}
                style={{
                  padding: '10px 14px', cursor: 'pointer', fontSize: 14,
                  background: opt.value === value ? '#eff6ff' : 'transparent',
                  color: opt.value === value ? '#1d4ed8' : '#334155',
                  fontWeight: opt.value === value ? 600 : 400,
                }}
              >
                {opt.label}
              </div>
            ))}
            {filtered.length === 0 && (
              <div style={{ padding: '12px 14px', color: '#94a3b8', fontSize: 13, textAlign: 'center' }}>
                Sin resultados
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

// ─── 7. Autocomplete ─────────────────────────────────────────────────────────

export function Autocomplete({
  options = [],
  value,
  onChange,
  onSelect,
  placeholder = 'Buscar...',
  className,
  style,
}) {
  const [open, setOpen] = useState(false);
  const [focused, setFocused] = useState(-1);
  const ref = useRef(null);
  const id = useId();

  const filtered = value
    ? options.filter(o => o.toLowerCase().includes(value.toLowerCase()))
    : options;

  const select = (opt) => {
    onChange?.(opt);
    onSelect?.(opt);
    setOpen(false);
    setFocused(-1);
  };

  const handleKey = (e) => {
    if (!open || filtered.length === 0) return;
    if (e.key === 'ArrowDown') { e.preventDefault(); setFocused(f => Math.min(f + 1, filtered.length - 1)); }
    if (e.key === 'ArrowUp')   { e.preventDefault(); setFocused(f => Math.max(f - 1, 0)); }
    if (e.key === 'Enter' && focused >= 0) select(filtered[focused]);
    if (e.key === 'Escape') setOpen(false);
  };

  return (
    <div ref={ref} style={{ position: 'relative', ...style }} className={className}>
      <input
        value={value}
        onChange={e => { onChange?.(e.target.value); setOpen(true); }}
        onKeyDown={handleKey}
        onFocus={() => setOpen(true)}
        onBlur={() => setTimeout(() => setOpen(false), 150)}
        placeholder={placeholder}
        aria-autocomplete="list"
        aria-controls={open ? id : undefined}
        aria-activedescendant={focused >= 0 ? `${id}-${focused}` : undefined}
        style={{
          width: '100%', padding: '10px 14px', borderRadius: 10, border: '2px solid #e2e8f0',
          fontSize: 14, outline: 'none',
        }}
      />
      {open && filtered.length > 0 && (
        <div
          id={id}
          role="listbox"
          style={{
            position: 'absolute', top: 'calc(100% + 4px)', left: 0, right: 0, zIndex: 500,
            background: '#fff', borderRadius: 10, border: '1px solid #e2e8f0',
            boxShadow: '0 8px 24px rgba(0,0,0,.10)', maxHeight: 200, overflowY: 'auto',
          }}
        >
          {filtered.map((opt, i) => (
            <div
              key={opt}
              id={`${id}-${i}`}
              role="option"
              aria-selected={i === focused}
              onMouseDown={() => select(opt)}
              style={{
                padding: '9px 14px', cursor: 'pointer', fontSize: 14,
                background: i === focused ? '#eff6ff' : 'transparent',
                color: i === focused ? '#1d4ed8' : '#334155',
              }}
            >
              {opt}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ─── 8. Toast hook ────────────────────────────────────────────────────────────
// eslint-disable-next-line react-refresh/only-export-components
export function useToast(autoDismiss = 4000) {
  const [toasts, setToasts] = useState([]);
  const idRef = useRef(0);

  const removeToast = useCallback((id) => {
    setToasts(t => t.filter(x => x.id !== id));
  }, []);

  const addToast = useCallback(({ message, type = 'info' }) => {
    const id = ++idRef.current;
    setToasts(t => [...t, { id, message, type, onClose: () => removeToast(id) }]);
    if (autoDismiss > 0) setTimeout(() => removeToast(id), autoDismiss);
    return id;
  }, [autoDismiss, removeToast]);

  return { toasts, addToast, removeToast };
}

// ─── 9. ScrollArea ────────────────────────────────────────────────────────────

export function ScrollArea({
  children,
  height,
  maxHeight,
  className,
  style,
}) {
  return (
    <div
      className={className}
      style={{
        height, maxHeight,
        overflowY: 'auto',
        overflowX: 'hidden',
        scrollbarWidth: 'thin',
        scrollbarColor: '#cbd5e1 transparent',
        ...style,
      }}
    >
      {children}
    </div>
  );
}

// PRIMITIVES_VERSION exported from index.js to avoid react-refresh warning
