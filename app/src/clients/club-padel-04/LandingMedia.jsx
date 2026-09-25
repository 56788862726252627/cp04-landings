import { useEffect, useMemo, useState } from 'react';
import MediaExperience from '../../saas-core/media/MediaExperience.jsx';
import { LANDING_EXPERIENCE } from './landingExperience.js';
import { commitRotation, planRotation } from '../../saas-core/media/mediaContract.js';
import EditorialMedia from '../../saas-core/media/EditorialMedia.jsx';
import { EDUCATIONAL_CATALOG, EDUCATIONAL_PREVIEW_ENABLED } from './educationalCatalog.js';

export function LandingHeroBackground() {
  return <div className="cp04-hero-backdrop" aria-hidden="true" />;
}

const STRIP_LABELS = ['El club desde otra perspectiva', 'Pista y paisaje', 'Una pausa en el ritmo', 'El entorno del club', 'Tu próxima visita'];

function TechnicalLandingMedia({ blocked = false }) {
  const catalog = LANDING_EXPERIENCE.catalog;
  const [active, setActive] = useState(() => {
    try {
      const planned = planRotation(catalog, window.localStorage, LANDING_EXPERIENCE.namespace);
      return Math.max(0, catalog.findIndex(item => item.order === planned.order));
    } catch {
      return 0;
    }
  });
  const activeItem = catalog[active] || catalog[0];
  const activeConfig = useMemo(() => ({ ...LANDING_EXPERIENCE, catalog: activeItem ? [activeItem] : [] }), [activeItem]);
  useEffect(() => {
    if (!activeItem) return;
    try {
      commitRotation({ key: 'saas-media:' + LANDING_EXPERIENCE.namespace + ':index', order: activeItem.order }, window.localStorage);
    } catch { /* Storage disabled: the current visit remains functional. */ }
  }, [activeItem]);

  return <section className="cp04-landing-media" aria-labelledby="cp04-landing-media-title">
    <div className="cp04-landing-media-heading">
      <span className="cp04-landing-media-kicker">El entorno del club</span>
      <h2 id="cp04-landing-media-title">Una experiencia que empieza antes de entrar en pista</h2>
      <p>Explora distintas vistas del espacio y descubre el ritmo de Club Pádel 04.</p>
    </div>
    <div className="cp04-landing-media-strips" role="list" aria-label="Vistas audiovisuales del club">
      {catalog.map((item, index) => (
        <div
          className="cp04-landing-media-strip"
          role="listitem"
          key={item.id}
          data-active={index === active}
        >
          {index === active
            ? <MediaExperience key={activeItem.id} config={{ ...activeConfig, eyebrow: '', showCaption: false }} blocked={blocked} />
            : <button type="button" className="cp04-landing-media-strip-select" onClick={() => setActive(index)} aria-pressed="false" aria-label={'Activar vista ' + (index + 1)}>
                <span aria-hidden="true"></span>
                <strong>{STRIP_LABELS[index % STRIP_LABELS.length]}</strong>
                <span className="cp04-landing-media-strip-arrow" aria-hidden="true">↗</span>
              </button>}
        </div>
      ))}
    </div>
  </section>;
}

export default function LandingMedia({ blocked = false }) {
  if (!EDUCATIONAL_PREVIEW_ENABLED) return <TechnicalLandingMedia blocked={blocked} />;
  return <EditorialMedia catalog={EDUCATIONAL_CATALOG} blocked={blocked}
    label="Pádel, paso a paso"
    disclosure="Serie educativa provisional con imágenes y voz generadas por IA. Contenido pendiente de revisión visual y editorial; no son grabaciones de jugadores ni competiciones reales." />;
}
