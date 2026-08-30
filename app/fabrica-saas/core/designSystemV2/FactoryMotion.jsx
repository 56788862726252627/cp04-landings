/**
 * Factory Motion Foundation V2
 * 13 motion wrappers built on motion/react (Framer Motion).
 * All wrappers respect prefers-reduced-motion automatically.
 */
import { useEffect, useReducer, useRef } from 'react';
import { motion, AnimatePresence as MotionAnimatePresence, useInView, useSpring as useMotionSpring, useTransform } from 'motion/react';
import {
  MOTION_DURATION, MOTION_EASING, MOTION_DISTANCE, MOTION_SPRING, STAGGER_DELAYS,
} from './tokens.js';

// ─── Reduced-motion hook ──────────────────────────────────────────────────────

function useReducedMotion() {
  const [reduced, setReduced] = useReducer(
    (_, e) => e.matches,
    typeof window !== 'undefined'
      ? window.matchMedia('(prefers-reduced-motion: reduce)').matches
      : false,
  );
  useEffect(() => {
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)');
    mq.addEventListener('change', setReduced);
    return () => mq.removeEventListener('change', setReduced);
  }, []);
  return reduced;
}

// ─── 1. FactoryMotion — generic wrapper ──────────────────────────────────────

export function FactoryMotion({
  children,
  initial,
  animate,
  exit,
  transition,
  style,
  className,
  as = 'div',
  ...rest
}) {
  const reduced = useReducedMotion();
  const Tag = motion[as] ?? motion.div;
  return (
    <Tag
      initial={reduced ? false : initial}
      animate={reduced ? animate : animate}
      exit={reduced ? undefined : exit}
      transition={reduced ? { duration: 0 } : transition}
      style={style}
      className={className}
      {...rest}
    >
      {children}
    </Tag>
  );
}

// ─── 2. MotionButton ─────────────────────────────────────────────────────────

export function MotionButton({
  children,
  hoverScale = 1.03,
  tapScale = 0.97,
  className,
  style,
  onClick,
  disabled,
  type = 'button',
  ...rest
}) {
  const reduced = useReducedMotion();
  return (
    <motion.button
      type={type}
      className={className}
      style={style}
      onClick={onClick}
      disabled={disabled}
      whileHover={reduced || disabled ? {} : { scale: hoverScale }}
      whileTap={reduced || disabled ? {} : { scale: tapScale }}
      transition={{ type: 'spring', ...MOTION_SPRING.stiff }}
      {...rest}
    >
      {children}
    </motion.button>
  );
}

// ─── 3. MotionCard ────────────────────────────────────────────────────────────

export function MotionCard({
  children,
  hoverY = -4,
  hoverShadow = '0 16px 48px rgba(0,0,0,.12)',
  className,
  style,
  ...rest
}) {
  const reduced = useReducedMotion();
  return (
    <motion.div
      className={className}
      style={style}
      whileHover={reduced ? {} : {
        y: hoverY,
        boxShadow: hoverShadow,
      }}
      transition={{ type: 'spring', ...MOTION_SPRING.gentle }}
      {...rest}
    >
      {children}
    </motion.div>
  );
}

// ─── 4. Reveal — scroll-triggered entrance ───────────────────────────────────

export function Reveal({
  children,
  direction = 'up',
  distance = MOTION_DISTANCE.lg,
  duration = MOTION_DURATION.normal,
  delay = 0,
  once = true,
  threshold = 0.1,
  className,
  style,
}) {
  const reduced = useReducedMotion();
  const ref = useRef(null);
  const inView = useInView(ref, { once, amount: threshold });

  const dirMap = {
    up:    { y: distance },
    down:  { y: -distance },
    left:  { x: distance },
    right: { x: -distance },
    scale: { scale: 0.92 },
    none:  {},
  };

  return (
    <motion.div
      ref={ref}
      className={className}
      style={style}
      initial={reduced ? false : { opacity: 0, ...dirMap[direction] }}
      animate={inView ? { opacity: 1, x: 0, y: 0, scale: 1 } : { opacity: 0, ...dirMap[direction] }}
      transition={{
        duration: reduced ? 0 : duration / 1000,
        delay: reduced ? 0 : delay / 1000,
        ease: MOTION_EASING.smooth,
      }}
    >
      {children}
    </motion.div>
  );
}

// ─── 5. Stagger — animated children list ─────────────────────────────────────

export function Stagger({
  children,
  staggerDelay = STAGGER_DELAYS.normal,
  direction = 'up',
  distance = MOTION_DISTANCE.md,
  once = true,
  threshold = 0.05,
  className,
  style,
}) {
  const reduced = useReducedMotion();
  const ref = useRef(null);
  const inView = useInView(ref, { once, amount: threshold });

  const container = {
    hidden: {},
    show: { transition: { staggerChildren: reduced ? 0 : staggerDelay } },
  };

  const dirMap = { up: { y: distance }, down: { y: -distance }, left: { x: distance }, right: { x: -distance } };

  const item = {
    hidden: reduced ? {} : { opacity: 0, ...dirMap[direction] },
    show:   { opacity: 1, x: 0, y: 0, transition: { ease: MOTION_EASING.smooth, duration: 0.3 } },
  };

  return (
    <motion.div
      ref={ref}
      className={className}
      style={style}
      variants={container}
      initial="hidden"
      animate={inView ? 'show' : 'hidden'}
    >
      {Array.isArray(children)
        ? children.map((child, i) => (
            <motion.div key={i} variants={item}>{child}</motion.div>
          ))
        : <motion.div variants={item}>{children}</motion.div>
      }
    </motion.div>
  );
}

// ─── 6. AnimatedMetric — number counter ──────────────────────────────────────

export function AnimatedMetric({
  value,
  suffix = '',
  prefix = '',
  className,
  style,
}) {
  const reduced = useReducedMotion();
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, amount: 0.5 });
  const springVal = useMotionSpring(0, { stiffness: 80, damping: 20, mass: 1 });

  useEffect(() => {
    if (inView && !reduced) springVal.set(value);
    else if (inView) springVal.set(value);
  }, [inView, value, reduced, springVal]);

  return (
    <motion.span ref={ref} className={className} style={style}>
      {prefix}
      <motion.span>{useTransform(springVal, v => Math.round(v).toLocaleString('es'))}</motion.span>
      {suffix}
    </motion.span>
  );
}

// ─── 7. PageTransition ───────────────────────────────────────────────────────

export function PageTransition({ children, mode = 'fade', className }) {
  const reduced = useReducedMotion();
  const variants = {
    fade:    { initial: { opacity: 0 }, animate: { opacity: 1 }, exit: { opacity: 0 } },
    slide:   { initial: { opacity: 0, x: 32 }, animate: { opacity: 1, x: 0 }, exit: { opacity: 0, x: -32 } },
    rise:    { initial: { opacity: 0, y: 16 }, animate: { opacity: 1, y: 0 }, exit: { opacity: 0, y: -16 } },
    scale:   { initial: { opacity: 0, scale: .96 }, animate: { opacity: 1, scale: 1 }, exit: { opacity: 0, scale: 1.02 } },
  };
  const v = variants[mode] ?? variants.fade;
  return (
    <motion.div
      className={className}
      initial={reduced ? false : v.initial}
      animate={v.animate}
      exit={reduced ? undefined : v.exit}
      transition={{ duration: reduced ? 0 : 0.25, ease: MOTION_EASING.smooth }}
    >
      {children}
    </motion.div>
  );
}

// ─── 8. LayoutTransition ─────────────────────────────────────────────────────

export function LayoutTransition({ children, layoutId, className, style }) {
  const reduced = useReducedMotion();
  return (
    <motion.div
      layout={!reduced}
      layoutId={layoutId}
      className={className}
      style={style}
      transition={{ type: 'spring', ...MOTION_SPRING.gentle }}
    >
      {children}
    </motion.div>
  );
}

// ─── 9. AnimatedPresence re-export ───────────────────────────────────────────

export { MotionAnimatePresence as AnimatedPresence };

// ─── 10. MotionProgress ──────────────────────────────────────────────────────

export function MotionProgress({
  value,
  color = '#6366f1',
  height = 8,
  radius = 99,
  background = '#e2e8f0',
  className,
  style,
}) {
  const reduced = useReducedMotion();
  return (
    <div
      className={className}
      style={{ background, borderRadius: radius, height, overflow: 'hidden', ...style }}
      role="progressbar"
      aria-valuenow={value}
      aria-valuemin={0}
      aria-valuemax={100}
    >
      <motion.div
        style={{ height: '100%', background: color, borderRadius: radius, width: '0%' }}
        animate={{ width: `${value}%` }}
        transition={reduced ? { duration: 0 } : { duration: 0.8, ease: MOTION_EASING.decelerate, delay: 0.1 }}
      />
    </div>
  );
}

// ─── 11. MotionTabs ──────────────────────────────────────────────────────────

export function MotionTabs({
  tabs,
  activeTab,
  onTabChange,
  indicatorColor = '#6366f1',
  className,
  style,
}) {
  const reduced = useReducedMotion();
  return (
    <div
      className={className}
      style={{ display: 'flex', position: 'relative', ...style }}
      role="tablist"
    >
      {tabs.map(tab => (
        <button
          key={tab.id}
          role="tab"
          aria-selected={activeTab === tab.id}
          onClick={() => onTabChange(tab.id)}
          style={{
            position: 'relative', padding: '8px 16px', background: 'none',
            border: 'none', cursor: 'pointer', fontWeight: activeTab === tab.id ? 600 : 400,
            color: activeTab === tab.id ? indicatorColor : '#64748b',
            transition: 'color .2s',
            zIndex: 1,
          }}
        >
          {tab.label}
          {activeTab === tab.id && (
            <motion.div
              layoutId="tab-indicator"
              style={{
                position: 'absolute', bottom: 0, left: 0, right: 0, height: 2,
                background: indicatorColor, borderRadius: 99,
              }}
              transition={reduced ? { duration: 0 } : { type: 'spring', ...MOTION_SPRING.stiff }}
            />
          )}
        </button>
      ))}
    </div>
  );
}

// ─── 12. MotionDrawer ────────────────────────────────────────────────────────

export function MotionDrawer({
  open,
  onClose,
  children,
  side = 'right',
  width = 400,
  title,
}) {
  const reduced = useReducedMotion();
  const slideDir = { right: { x: '100%' }, left: { x: '-100%' }, bottom: { y: '100%' } };
  const initial = slideDir[side] ?? slideDir.right;

  return (
    <MotionAnimatePresence>
      {open && (
        <>
          <motion.div
            key="overlay"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: reduced ? 0 : 0.2 }}
            onClick={onClose}
            style={{
              position: 'fixed', inset: 0, background: 'rgba(0,0,0,.4)',
              zIndex: 200, cursor: 'pointer',
            }}
            aria-hidden="true"
          />
          <motion.div
            key="drawer"
            role="dialog"
            aria-modal="true"
            aria-label={title}
            initial={reduced ? {} : initial}
            animate={{ x: 0, y: 0 }}
            exit={reduced ? {} : initial}
            transition={{ type: 'spring', ...MOTION_SPRING.medium }}
            style={{
              position: 'fixed', top: 0, [side === 'left' ? 'left' : 'right']: 0,
              bottom: 0, width, background: '#fff', zIndex: 201,
              boxShadow: side === 'left' ? '4px 0 24px rgba(0,0,0,.12)' : '-4px 0 24px rgba(0,0,0,.12)',
              overflowY: 'auto', display: 'flex', flexDirection: 'column',
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '16px 20px', borderBottom: '1px solid #f1f5f9' }}>
              {title && <span style={{ fontWeight: 600, fontSize: 16 }}>{title}</span>}
              <button
                onClick={onClose}
                aria-label="Cerrar panel"
                style={{ background: 'none', border: 'none', fontSize: 20, cursor: 'pointer', color: '#64748b', marginLeft: 'auto' }}
              >
                ×
              </button>
            </div>
            <div style={{ flex: 1, padding: 20 }}>{children}</div>
          </motion.div>
        </>
      )}
    </MotionAnimatePresence>
  );
}

// ─── 13. MotionToast ─────────────────────────────────────────────────────────

export function MotionToast({
  toasts = [],
  position = 'bottom-right',
}) {
  const reduced = useReducedMotion();
  const posStyle = {
    'top-right':    { top: 24, right: 24 },
    'top-left':     { top: 24, left: 24 },
    'bottom-right': { bottom: 24, right: 24 },
    'bottom-left':  { bottom: 24, left: 24 },
    'top-center':   { top: 24, left: '50%', transform: 'translateX(-50%)' },
    'bottom-center':{ bottom: 24, left: '50%', transform: 'translateX(-50%)' },
  };

  const TYPE_STYLES = {
    success: { background: '#f0fdf4', border: '1px solid #86efac', color: '#166534', icon: '✅' },
    error:   { background: '#fef2f2', border: '1px solid #fca5a5', color: '#991b1b', icon: '❌' },
    warning: { background: '#fffbeb', border: '1px solid #fde68a', color: '#92400e', icon: '⚠️' },
    info:    { background: '#eff6ff', border: '1px solid #bfdbfe', color: '#1e3a8a', icon: 'ℹ️' },
  };

  return (
    <div
      role="region"
      aria-live="polite"
      aria-label="Notificaciones"
      style={{
        position: 'fixed', zIndex: 9999,
        display: 'flex', flexDirection: 'column', gap: 8,
        pointerEvents: 'none',
        ...posStyle[position],
      }}
    >
      <MotionAnimatePresence>
        {toasts.map(t => {
          const ts = TYPE_STYLES[t.type] ?? TYPE_STYLES.info;
          return (
            <motion.div
              key={t.id}
              role="alert"
              initial={reduced ? {} : { opacity: 0, y: 16, scale: .96 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={reduced ? {} : { opacity: 0, y: -8, scale: .96 }}
              transition={{ type: 'spring', ...MOTION_SPRING.stiff }}
              style={{
                pointerEvents: 'auto',
                minWidth: 280, maxWidth: 400,
                padding: '12px 16px', borderRadius: 12,
                display: 'flex', gap: 10, alignItems: 'flex-start',
                boxShadow: '0 8px 24px rgba(0,0,0,.12)',
                ...ts,
              }}
            >
              <span style={{ flexShrink: 0, fontSize: 16 }}>{ts.icon}</span>
              <div style={{ flex: 1, fontSize: 14, lineHeight: 1.5 }}>{t.message}</div>
              {t.onClose && (
                <button
                  onClick={t.onClose}
                  aria-label="Cerrar notificación"
                  style={{ background: 'none', border: 'none', cursor: 'pointer', opacity: .6, fontSize: 16, flexShrink: 0 }}
                >
                  ×
                </button>
              )}
            </motion.div>
          );
        })}
      </MotionAnimatePresence>
    </div>
  );
}

export const FACTORY_MOTION_VERSION = '2.0.0';
