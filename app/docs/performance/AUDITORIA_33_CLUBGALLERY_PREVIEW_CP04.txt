import { cp04GalleryAssets } from "../data/visualAssets.js";

export default function ClubGallery() {
  const featured = cp04GalleryAssets?.[0];
  const sideItems = cp04GalleryAssets?.slice(1) || [];

  return (
    <section className="cp04-gallery-module" aria-label="Galería del club">
      <div className="section-kicker">GALERÍA</div>
      <h2>Galería del club</h2>
      <p>Galería visual del club.</p>

      <div className="cp04-gallery-grid">
        {featured ? (
          <article className="cp04-gallery-card cp04-gallery-card-featured">
            <img src={featured.src} alt={featured.title} loading="lazy" />
            <div className="cp04-gallery-caption">{featured.title}</div>
          </article>
        ) : null}

        <div className="cp04-gallery-side">
          {sideItems.map((item) => (
            <article className="cp04-gallery-card" key={item.id}>
              <img src={item.src} alt={item.title} loading="lazy" />
              <div className="cp04-gallery-caption">{item.title}</div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
