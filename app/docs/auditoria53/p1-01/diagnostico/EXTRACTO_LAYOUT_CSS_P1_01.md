# EXTRACTO CSS Y LAYOUT · P1-01

## Líneas 170 a 280
```jsx

const PROTECTED_SECTIONS = ["Gestión", "Admin", "Soporte"];

const globalStyles = `
  @import url('https://fonts.googleapis.com/css2?family=Syne:wght@700;800;900&family=DM+Sans:wght@300;400;500;700;800&display=swap');
  * { box-sizing: border-box; }
  html { background: ${T.bg}; }
  body { margin: 0; min-width: 320px; background: radial-gradient(circle at 20% 0%, rgba(182,255,0,.12), transparent 30%), radial-gradient(circle at 86% 12%, rgba(47,107,255,.22), transparent 36%), linear-gradient(145deg, #05080d 0%, #08111f 48%, #05080d 100%); color: ${T.text}; font-family: ${T.fontBody}; }
  body::before { content: ""; position: fixed; inset: 0; pointer-events: none; background-image: linear-gradient(rgba(255,255,255,.035) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,.035) 1px, transparent 1px); background-size: 56px 56px; mask-image: linear-gradient(to bottom, rgba(0,0,0,.6), transparent 72%); }
  input, select, textarea { background: rgba(5,8,13,.72); border: 1px solid ${T.line}; color: ${T.text}; border-radius: 14px; padding: 13px 15px; width: 100%; outline: none; min-height: 46px; box-shadow: inset 0 1px 0 rgba(255,255,255,.03); transition: border-color .18s ease, box-shadow .18s ease, background .18s ease; }
  textarea { min-height: 118px; resize: vertical; }
  input::placeholder, textarea::placeholder { color: rgba(154,168,189,.72); }
  input:focus, select:focus, textarea:focus { background: rgba(11,17,29,.94); border-color: ${T.accent}; box-shadow: 0 0 0 4px rgba(182,255,0,.16), 0 18px 40px rgba(0,0,0,.22); }
  button:focus-visible { outline: 3px solid rgba(182,255,0,.9); outline-offset: 3px; }
  h1, h2, h3 { text-wrap: balance; }
  p { margin-top: 0; }
  code { color: ${T.accent}; background: rgba(182,255,0,.08); border: 1px solid rgba(182,255,0,.18); border-radius: 8px; padding: 2px 7px; }
  .cp04-layout { min-height: 100vh; display: grid; grid-template-columns: 292px minmax(0,1fr); }
  .cp04-main { min-width: 0; }
  .cp04-sidebar { position: sticky; top: 0; height: 100vh; padding: 24px; border-right: 1px solid ${T.line}; background: linear-gradient(180deg, rgba(10,16,28,.96), rgba(5,8,13,.90)); overflow: auto; backdrop-filter: blur(18px); }
  .cp04-mobilebar { display: none; }
  .cp04-overlay { display: none; }
  .cp04-sidebar-close { display: none; }
  .cp04-grid-2 { display: grid; grid-template-columns: repeat(2, minmax(0,1fr)); gap: 24px; }
  .cp04-grid-3 { display: grid; grid-template-columns: repeat(3, minmax(0,1fr)); gap: 20px; }
  .cp04-card { position: relative; overflow: hidden; background: linear-gradient(150deg, rgba(17,26,43,.94), rgba(8,13,15,.94)); border: 1px solid rgba(255,255,255,.11); border-radius: 26px; padding: 24px; box-shadow: 0 22px 70px rgba(0,0,0,.30), inset 0 1px 0 rgba(255,255,255,.05); }
  .cp04-card::before { content: ""; position: absolute; inset: 0; pointer-events: none; background: radial-gradient(circle at 16% 0%, rgba(182,255,0,.08), transparent 32%); }
  .cp04-card > * { position: relative; }
  .cp04-btn { display: inline-flex; align-items: center; justify-content: center; gap: 8px; min-height: 44px; transition: transform .18s ease, box-shadow .18s ease, filter .18s ease, border-color .18s ease; }
  .cp04-btn:hover:not(:disabled) { transform: translateY(-1px); filter: brightness(1.04); box-shadow: 0 14px 32px rgba(0,0,0,.24); }
  .cp04-badge { display: inline-flex; align-items: center; max-width: 100%; white-space: nowrap; line-height: 1; }
  .cp04-table-wrap { overflow-x: auto; }
  .cp04-table { width: 100%; min-width: 620px; border-collapse: collapse; }
  .cp04-table th, .cp04-table td { padding: 16px 18px; border-bottom: 1px solid ${T.line}; text-align: left; }
  .cp04-table th { color: ${T.textDim}; font-size: .78rem; text-transform: uppercase; letter-spacing: .08em; }
  .cp04-gallery { display: grid; grid-template-columns: 1.15fr .85fr; gap: 20px; align-items: stretch; }
  .cp04-gallery-side { display: grid; grid-template-columns: 1fr; gap: 20px; }
  .cp04-gallery-item { min-height: 230px; border-radius: 28px; overflow: hidden; position: relative; border: 1px solid ${T.line}; background: radial-gradient(circle at 20% 18%, rgba(182,255,0,.26), transparent 28%), linear-gradient(135deg, rgba(47,107,255,.18), rgba(17,26,43,.96)); }
  .cp04-gallery-item.featured { min-height: 480px; }
  .cp04-gallery-item img { width: 100%; height: 100%; object-fit: cover; display: block; }
  .cp04-gallery-fallback { position: absolute; inset: 0; background: linear-gradient(135deg, rgba(182,255,0,.18), rgba(47,107,255,.12)), repeating-linear-gradient(90deg, rgba(255,255,255,.10) 0 1px, transparent 1px 34px); }
  .cp04-gallery-caption { position: absolute; left: 18px; right: 18px; bottom: 18px; padding: 14px 16px; border-radius: 18px; background: rgba(5,8,13,.74); border: 1px solid rgba(255,255,255,.12); backdrop-filter: blur(14px); }
  @media (max-width: 1180px) { .cp04-grid-3 { grid-template-columns: repeat(2, minmax(0,1fr)); } }
  @media (max-width: 980px) { .cp04-layout { grid-template-columns: 1fr; padding-top: 66px; } .cp04-mobilebar { position: fixed; z-index: 60; top: 0; left: 0; right: 0; height: 66px; display: flex; align-items: center; justify-content: space-between; gap: 16px; padding: 12px 16px; border-bottom: 1px solid ${T.line}; background: rgba(7,10,14,.88); backdrop-filter: blur(18px); } .cp04-menu-button { background: linear-gradient(135deg, ${T.accent}, ${T.accent2}); color: #06100a; border: 0; border-radius: 14px; padding: 10px 14px; font-family: ${T.fontDisplay}; font-weight: 900; cursor: pointer; } .cp04-sidebar-close { display: block; } .cp04-sidebar { position: fixed; z-index: 80; inset: 0 auto 0 0; width: min(88vw, 340px); height: 100dvh; visibility: hidden; transform: translateX(-105%); transition: transform .22s ease, visibility .22s ease; border-right: 1px solid ${T.line}; border-bottom: 0; box-shadow: 24px 0 80px rgba(0,0,0,.45); } .cp04-sidebar[data-open="true"] { visibility: visible; transform: translateX(0); } .cp04-overlay { display: block; position: fixed; z-index: 70; inset: 0; background: rgba(0,0,0,.62); border: 0; padding: 0; cursor: pointer; } .cp04-grid-2, .cp04-grid-3, .cp04-gallery { grid-template-columns: 1fr; } .cp04-gallery-item.featured { min-height: 340px; } }
  @media (max-width: 640px) { .cp04-card { border-radius: 22px; padding: 19px; } .cp04-table th, .cp04-table td { padding: 13px 14px; } .cp04-gallery-item, .cp04-gallery-item.featured { min-height: 245px; border-radius: 22px; } }
`;


const GALLERY_FORCE_STYLES = `
.cp04-gallery-card {
  position: relative;
  overflow: hidden;
  border-radius: 24px;
  background: rgba(8,13,15,.94);
  min-height: 220px;
}

.cp04-gallery-card img,
.cp04-gallery-img {
  display: block;
  width: 100%;
  height: 100%;
  min-height: inherit;
  object-fit: cover;
  object-position: center;
  border-radius: inherit;
}

.cp04-gallery-card::before {
  display: none !important;
}

.cp04-gallery-card .cp04-gallery-label,
.cp04-gallery-label {
  position: absolute;
  left: 18px;
  right: 18px;
  bottom: 16px;
  z-index: 3;
  padding: 14px 16px;
  border-radius: 16px;
  background: rgba(6,10,16,.88);
  backdrop-filter: blur(8px);
}

.cp04-gallery-label strong {
  display: block;
  white-space: normal;
  overflow-wrap: anywhere;
  line-height: 1.15;
}

.cp04-gallery-label span {
  display: block;
  margin-top: 4px;
  white-space: normal;
  overflow-wrap: anywhere;
  line-height: 1.2;
}
`;

function calcTimeEnd(time, mins) {
  const [h, m] = time.split(":").map(Number);
  const total = h * 60 + m + mins;
  return `${String(Math.floor(total / 60) % 24).padStart(2, "0")}:${String(total % 60).padStart(2, "0")}`;
}

function priceFor(courtName, duration) {
  const court = COURTS.find((c) => c.name === courtName);
  return court?.[`price${duration}`] || 0;
}
```
