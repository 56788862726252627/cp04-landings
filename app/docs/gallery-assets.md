# Gallery And Asset Notes

## Gallery Configuration

The homepage gallery is prepared for real club photos through public frontend variables:

- `VITE_CP04_PUBLIC_GALLERY_PISTAS`
- `VITE_CP04_PUBLIC_GALLERY_RECEPCION`
- `VITE_CP04_PUBLIC_GALLERY_CAFETERIA`
- `VITE_CP04_PUBLIC_GALLERY_TORNEOS`
- `VITE_CP04_PUBLIC_GALLERY_INSTALACIONES`

Use real image URLs or public paths only when the photos are approved for publication. Until then, the UI shows premium abstract fallbacks labelled as pending images.

## Candidate Assets To Archive

These files appear inherited or currently unused by the app and can be archived after manual confirmation:

- `src/App.css`: not imported by the current React entrypoint.
- `src/assets/vite.svg`: Vite template asset, not referenced.
- `src/assets/react.svg`: React template asset, not referenced.
- `src/assets/hero.png`: not referenced by current source.
- `public/icons.svg`: template social icons, not referenced by current UI.

Do not remove `public/favicon.svg` or `public/og-image.svg`; both are currently referenced by `index.html`.
