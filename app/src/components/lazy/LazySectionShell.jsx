export default function LazySectionShell({ title = "Sección", subtitle = "Carga diferida preparada.", children }) {
  return (
    <section className="cp04-lazy-section-shell">
      <div className="cp04-lazy-section-shell__header">
        <span className="eyebrow">Carga optimizada</span>
        <h2>{title}</h2>
        <p>{subtitle}</p>
      </div>
      {children ? (
        <div className="cp04-lazy-section-shell__content">{children}</div>
      ) : null}
    </section>
  );
}
