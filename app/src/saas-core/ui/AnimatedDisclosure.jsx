import { useEffect, useRef, useState } from 'react';
import { useReducedMotion } from './experienceMotion.js';

export default function AnimatedDisclosure({ open, children, id, returnFocusSelector }) {
  const reduced = useReducedMotion();
  const ref = useRef(null);
  const [snapshot, setSnapshot] = useState({ children, mounted: open });
  // Retain only the previous render for the short, inert exit transition.
  if (open && (!snapshot.mounted || snapshot.children !== children)) {
    setSnapshot({ children, mounted: true });
  }
  useEffect(() => {
    if (open) return;
    if (ref.current?.contains(document.activeElement)) document.querySelector(returnFocusSelector)?.focus();
    const timer = window.setTimeout(() => setSnapshot(s => ({ ...s, mounted: false })), reduced ? 0 : 160);
    return () => window.clearTimeout(timer);
  }, [open, reduced, returnFocusSelector]);
  if (!snapshot.mounted) return null;
  return <div ref={ref} id={id} className="saas-disclosure" data-open={open} inert={!open} aria-hidden={!open || undefined}>
    {open ? children : snapshot.children}
  </div>;
}
