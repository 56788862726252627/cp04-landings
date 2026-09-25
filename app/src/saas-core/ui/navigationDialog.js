// CORE: DOM-only focus management; no routes, roles, data or integrations.
export function attachNavigationDialog({ panel, trigger, background, onClose }) {
  if (!panel) return undefined;
  const doc = panel.ownerDocument;
  const view = doc.defaultView;
  const media = view.matchMedia("(max-width: 980px)");
  if (!media.matches) {
    onClose();
    return undefined;
  }
  const previousOverflow = doc.body.style.overflow;
  const previousInert = background.filter(Boolean).map(element => [element, element.inert]);
  previousInert.forEach(([element]) => { element.inert = true; });
  doc.body.style.overflow = "hidden";
  const focusable = () => [...panel.querySelectorAll(
    'button:not(:disabled), a[href], input:not(:disabled), select:not(:disabled), textarea:not(:disabled), [tabindex="0"]'
  )].filter(element => element.getClientRects().length && !element.closest("[inert]"));
  // An existing tutorial or nested modal owns focus while above this drawer.
  const foregroundDialog = () => [...doc.querySelectorAll('[role="dialog"][aria-modal="true"]')]
    .find(element => element !== panel && !panel.contains(element) && element.getClientRects().length);
  const focusStart = () => {
    if (!foregroundDialog()) (panel.querySelector('[aria-current="page"]') || focusable()[0] || panel).focus();
  };
  focusStart();
  function keydown(event) {
    if (foregroundDialog()) return;
    if (event.key === "Escape") {
      event.preventDefault();
      onClose();
    }
    if (event.key !== "Tab") return;
    const items = focusable();
    const first = items[0];
    const last = items.at(-1);
    if (!first) { event.preventDefault(); return; }
    if (!panel.contains(doc.activeElement) ||
        (event.shiftKey && doc.activeElement === first) ||
        (!event.shiftKey && doc.activeElement === last)) {
      event.preventDefault();
      (event.shiftKey ? last : first).focus();
    }
  }
  function focusin(event) {
    if (foregroundDialog()) return;
    if (!panel.contains(event.target)) focusStart();
  }
  function resize(event) { if (!event.matches) onClose(); }
  doc.addEventListener("keydown", keydown);
  doc.addEventListener("focusin", focusin);
  media.addEventListener("change", resize);
  return () => {
    doc.removeEventListener("keydown", keydown);
    doc.removeEventListener("focusin", focusin);
    media.removeEventListener("change", resize);
    doc.body.style.overflow = previousOverflow;
    previousInert.forEach(([element, inert]) => { element.inert = inert; });
    if (trigger?.getClientRects().length) trigger.focus({ preventScroll: true });
    else panel.querySelector('[aria-current="page"]')?.focus({ preventScroll: true });
  };
}
