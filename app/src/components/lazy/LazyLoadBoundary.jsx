import { Suspense } from "react";

function LazyFallback({ label = "Cargando sección optimizada..." }) {
  return (
    <div className="cp04-lazy-fallback" role="status" aria-live="polite">
      <span className="cp04-lazy-fallback__dot" />
      <span>{label}</span>
    </div>
  );
}

export default function LazyLoadBoundary({ children, label }) {
  return (
    <Suspense fallback={<LazyFallback label={label} />}>
      {children}
    </Suspense>
  );
}
