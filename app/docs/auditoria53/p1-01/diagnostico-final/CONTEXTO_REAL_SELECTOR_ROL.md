# CONTEXTO REAL DEL SELECTOR DE ROL

Referencia principal detectada en línea: 809

```jsx
                const bloqueada = cerrada || pasada || fueraHorario;
                const disabled = ocupada || bloqueada || estado === "loading";
                const label = cerrada
                  ? "Cerrado"
                  : pasada
                    ? "Pasada"
                    : fueraHorario
                      ? "No disponible"
                      : ocupada
                        ? "Ocupado"
                        : "Libre";
                const danger = ocupada || pasada;
                const borderColor = cerrada || fueraHorario ? T.warning : danger ? T.danger : T.accent;
                const background = cerrada || fueraHorario
                  ? "rgba(255,184,77,.12)"
                  : danger
                    ? "rgba(255,80,80,.13)"
                    : "rgba(185,245,0,.12)";

                return (
                  <button
                    key={clave}
                    type="button"
                    disabled={disabled}
                    onClick={() => {
                      if (disabled) return;
                      onSelectSlot({ fecha, pista, hora });
                    }}
                    title={label}
                    style={{
                      cursor: disabled ? "not-allowed" : "pointer",
                      border: `1px solid ${borderColor}`,
                      background,
                      color: cerrada || fueraHorario ? T.warning : danger ? T.danger : T.accent,
                      borderRadius: 14,
                      padding: "10px 8px",
                      fontWeight: 900,
                      opacity: disabled ? .72 : 1
                    }}
                  >
                    <div>{hora}</div>
                    <small style={{ color: cerrada || fueraHorario ? T.warning : danger ? T.danger : T.textDim }}>
                      {label}
                    </small>
                  </button>
                );
              })}
            </div>
          </div>
        ))}
      </div>
    </Card>
  );
}


function SectionTitle({ eyebrow, title, desc }) {
  return <div style={{ marginBottom: 30 }}>{eyebrow && <div style={{ color: T.accent, fontWeight: 900, letterSpacing: ".18em", fontSize: ".76rem", textTransform: "uppercase", marginBottom: 10 }}>{eyebrow}</div>}<h2 style={{ fontFamily: T.fontDisplay, fontSize: "clamp(2rem,4vw,3.1rem)", lineHeight: .96, margin: 0, letterSpacing: "-.055em" }}>{title}</h2>{desc && <p style={{ color: T.textDim, lineHeight: 1.75, maxWidth: 760, marginTop: 14, fontSize: "1.02rem" }}>{desc}</p>}</div>;
}

function Badge({ status }) {
  const lang = useLang();
  const tx = key => t(key, lang);
  const map = { confirmed: [tx("badge.confirmed"), T.accent], pending: [tx("badge.pending"), T.warning], completed: [tx("badge.completed"), T.textDim] };
  const [label, color] = map[status] || map.pending;
  return <span className="cp04-badge" style={{ color, background: "rgba(255,255,255,.07)", border: `1px solid ${color}44`, borderRadius: 999, padding: "7px 11px", fontSize: ".74rem", fontWeight: 900 }}>{label}</span>;
}

function FieldError({ children }) {
  if (!children) return null;
  return <div style={{ color: T.danger, fontSize: ".82rem", marginTop: 6 }}>{children}</div>;
}

function PanelList({ items }) {
  return <div style={{ display: "grid", gap: 10 }}>{items.map((item) => <div key={item} style={{ display: "flex", alignItems: "flex-start", gap: 10, color: T.textDim, lineHeight: 1.55 }}><span style={{ width: 8, height: 8, borderRadius: "50%", background: T.accent, marginTop: 8, flex: "0 0 auto" }} /><span>{item}</span></div>)}</div>;
}

function RolePanel({ eyebrow, title, desc, items, action }) {
  return <Card><div style={{ color: T.accent, fontWeight: 900, letterSpacing: ".14em", fontSize: ".72rem", textTransform: "uppercase", marginBottom: 10 }}>{eyebrow}</div><h3 style={{ fontFamily: T.fontDisplay, fontSize: "1.45rem", letterSpacing: "-.04em", margin: "0 0 10px" }}>{title}</h3><p style={{ color: T.textDim, lineHeight: 1.65, marginBottom: 18 }}>{desc}</p><PanelList items={items} />{action && <div style={{ marginTop: 20 }}>{action}</div>}</Card>;
}

function GalleryItem({ item, featured = false }) {
  return <div className={`cp04-gallery-item${featured ? " featured" : ""}`}>{item.src ? <img src={item.src} alt={`${item.title} de Club Pádel 04`} loading="lazy" /> : <div className="cp04-gallery-fallback" aria-hidden="true" />}<div className="cp04-gallery-caption"><strong style={{ display: "block", fontFamily: T.fontDisplay, letterSpacing: "-.03em" }}>{item.title}</strong><span style={{ color: T.textDim, fontSize: ".88rem" }}>{item.src ? "" : item.label}</span></div></div>;
}

function Gallery() {
  const lang = useLang();
  const tx = key => t(key, lang);
  const [featured, ...rest] = GALLERY;
  return <section style={{ marginTop: 42 }}><SectionTitle eyebrow={tx("home.galeria_eyebrow")} title={tx("home.galeria")} desc={tx("home.galeria_desc")} /><div className="cp04-gallery"><GalleryItem item={featured} featured /><div className="cp04-gallery-side">{rest.map((item) => <GalleryItem key={item.key} item={item} />)}</div></div></section>;
}

function IntegrationMatrix({ compact = false }) {
  const colorFor = (status) => status === "Preparada" ? T.accent : status === "Pendiente de credenciales" ? T.warning : T.textDim;
  return <div style={{ display: "grid", gap: 12 }}>{INTEGRATIONS.map((item) => <Card key={item.name} style={{ padding: compact ? 18 : 22 }}><div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 14, flexWrap: "wrap" }}><div><h3 style={{ margin: 0, fontFamily: T.fontDisplay, letterSpacing: "-.035em" }}>{item.name}</h3><p style={{ color: T.textDim, marginTop: 8, lineHeight: 1.6 }}>{item.detail}</p></div><span className="cp04-badge" style={{ color: colorFor(item.status), border: `1px solid ${colorFor(item.status)}55`, borderRadius: 999, padding: "7px 11px", fontWeight: 900, fontSize: ".74rem", whiteSpace: "nowrap" }}>{item.status}</span></div>{!compact && <p style={{ color: T.textDim, marginTop: 12, lineHeight: 1.6 }}>Flujo: <code>{item.flow}</code></p>}</Card>)}</div>;
}

function AuthStatusPanel({ compact = false }) {
  const lang = useLang();
  const tx = key => t(key, lang);
  return <Card><div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 16, flexWrap: "wrap", marginBottom: 18 }}><div><h3 style={{ margin: 0, fontFamily: T.fontDisplay, letterSpacing: "-.04em" }}>{tx("auth.roles_title")}</h3><p style={{ color: T.textDim, lineHeight: 1.65, marginTop: 8 }}>{tx("auth.pending_desc")}</p></div><span className="cp04-badge" style={{ color: T.warning, border: `1px solid ${T.warning}55`, borderRadius: 999, padding: "7px 11px", fontWeight: 900, fontSize: ".74rem", whiteSpace: "nowrap" }}>{tx("auth.pending_badge")}</span></div><div className={compact ? undefined : "cp04-grid-2"} style={compact ? { display: "grid", gap: 12 } : undefined}>{ROLES.map((role) => <div key={role.id} style={{ border: `1px solid ${T.line}`, borderRadius: 18, padding: 16, background: "rgba(255,255,255,.035)" }}><div style={{ display: "flex", justifyContent: "space-between", gap: 10, flexWrap: "wrap" }}><strong style={{ color: T.accent }}>{role.id}</strong><span style={{ color: T.warning, fontSize: ".82rem", fontWeight: 900 }}>{role.access}</span></div><div style={{ marginTop: 8, fontWeight: 900 }}>{role.label}</div><div style={{ color: T.textDim, marginTop: 6, lineHeight: 1.55 }}>{tx("auth.secciones")} {role.sections}</div>{!compact && <PanelList items={role.permissions} />}</div>)}</div></Card>;
}



// ============================================================
// SISTEMA GLOBAL DE RELOJ EN TIEMPO REAL
// ============================================================
function useClock() {
  const [now, setNow] = useState(() => new Date());
  const [langCode, setLangCode] = useState(() => {
    try {
      const raw = localStorage.getItem("cp04_language");
      if (!raw) return "es-ES";
      const p = JSON.parse(raw);
      return p?.code || "es-ES";
    } catch { return "es-ES"; }
  });
  useEffect(() => {
    const id = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(id);
  }, []);
  useEffect(() => {
    function handler(e) { setLangCode(e.detail?.lang?.code || "es-ES"); }
    window.addEventListener("cp04:lang-change", handler);
    return () => window.removeEventListener("cp04:lang-change", handler);
  }, []);
  const dias = ["Domingo","Lunes","Martes","Miércoles","Jueves","Viernes","Sábado"];
  const pad = n => String(n).padStart(2,"0");
  try {
    const d = now;
    let dayStr, dateStr;
    const sep = langCode.startsWith("de") ? "." : "/";
    try {
      dayStr = new Intl.DateTimeFormat(langCode, { weekday: "long", timeZone: MADRID_TIME_ZONE }).format(d);
      dayStr = dayStr.charAt(0).toUpperCase() + dayStr.slice(1);
      const parts = new Intl.DateTimeFormat(langCode, { day: "2-digit", month: "2-digit", year: "numeric", timeZone: MADRID_TIME_ZONE }).formatToParts(d);
      const pDay = parts.find(p => p.type === "day")?.value || pad(d.getDate());
      const pMon = parts.find(p => p.type === "month")?.value || pad(d.getMonth()+1);
      const pYr = parts.find(p => p.type === "year")?.value || String(d.getFullYear());
      dateStr = `${pDay}${sep}${pMon}${sep}${pYr}`;
    } catch {
      dayStr = dias[d.getDay()];
      dateStr = `${pad(d.getDate())}/${pad(d.getMonth()+1)}/${d.getFullYear()}`;
    }
    return {
      time: `${pad(d.getHours())}:${pad(d.getMinutes())}:${pad(d.getSeconds())}`,
      date: dateStr,
      day: dayStr,
      full: `${dayStr}, ${dateStr} · ${pad(d.getHours())}:${pad(d.getMinutes())}:${pad(d.getSeconds())}`,
      hour: d.getHours(),
    };
  } catch { return { time:"--:--:--", date:"--/--/----", day:"--", full:"--", hour:0 }; }
}

function ClockDisplay({ compact = false }) {
  const clk = useClock();
  if (compact) {
    return (
      <div style={{ display:"flex", alignItems:"center", gap:8, fontFamily:"monospace" }}>
        <span style={{ width:7, height:7, borderRadius:"50%", background:T.accent, flexShrink:0, boxShadow:`0 0 6px ${T.accent}` }} />
        <span style={{ color:T.textDim, fontSize:".75rem" }}>{clk.day.slice(0,3)}</span>
        <span style={{ color:T.text, fontWeight:700, fontSize:".82rem" }}>{clk.date}</span>
        <span style={{ color:T.accent, fontWeight:900, fontSize:".85rem" }}>{clk.time}</span>
      </div>
    );
  }
  return (
    <div style={{ textAlign:"center" }}>
      <div style={{ fontFamily:"monospace", fontSize:"clamp(2.2rem,6vw,3.8rem)", fontWeight:900, letterSpacing:".04em", color:T.accent, lineHeight:1 }}>{clk.time}</div>
      <div style={{ color:T.textDim, fontSize:".92rem", marginTop:6 }}>{clk.day}, {clk.date}</div>
    </div>
  );
}

// ============================================================
// SISTEMA DE GRÁFICAS SVG PREMIUM (sin dependencias externas)
// ============================================================

function MetricCard({ label, value, sub, trend, color, icon }) {
  const col = color || T.accent;
  const trendUp = trend && trend > 0;
  const trendDown = trend && trend < 0;
  const valStr = String(value);
  const isRatio = valStr.includes("/");
  const longVal = valStr.length > 6 || isRatio;
  const valFontSize = isRatio
    ? "clamp(1.1rem,2.2vw,1.55rem)"
    : longVal
      ? "clamp(1.3rem,3vw,1.8rem)"
      : "clamp(1.6rem,3.5vw,2.2rem)";
  return (
    <div style={{ borderRadius:18, border:`1px solid rgba(255,255,255,.09)`, background:"rgba(11,17,29,.85)", padding:"14px 16px", display:"flex", flexDirection:"column", gap:5, position:"relative", overflow:"hidden", minWidth:0 }}>
      <div style={{ position:"absolute", top:0, left:0, right:0, height:2, background:`linear-gradient(90deg,${col},transparent)` }} />
      <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start", gap:4 }}>
        <span style={{ color:T.textDim, fontSize:".68rem", fontWeight:700, letterSpacing:".08em", textTransform:"uppercase", lineHeight:1.3, flex:1, minWidth:0 }}>{label}</span>
        {icon && <span style={{ fontSize:"1rem", opacity:.65, flexShrink:0 }}>{icon}</span>}
      </div>
      <div style={{ fontFamily:T.fontDisplay, fontSize:valFontSize, fontWeight:900, color:col, lineHeight:1.1, letterSpacing:"-.02em", whiteSpace:"nowrap", overflow:"hidden", textOverflow:"clip", minWidth:0 }}>{value}</div>
      {sub && <div style={{ color:T.textDim, fontSize:".72rem", lineHeight:1.35, overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap" }}>{sub}</div>}
      {trend !== undefined && trend !== null && (
        <div style={{ marginTop:2 }}>
          <span style={{ fontSize:".72rem", fontWeight:700, color: trendUp ? T.accent : trendDown ? T.danger : T.textDim }}>
            {trendUp ? "▲" : trendDown ? "▼" : "—"} {trend !== 0 ? Math.abs(trend)+"%" : "Sin cambios"}
          </span>
        </div>
      )}
    </div>
  );
}

function ChartTooltip({ x, y, children, visible }) {
  if (!visible) return null;
  return (
    <div style={{ position:"absolute", left:x, top:y, transform:"translate(-50%,-100%)", pointerEvents:"none", zIndex:100, background:"rgba(7,11,20,.95)", border:"1px solid rgba(182,255,0,.35)", borderRadius:10, padding:"7px 11px", whiteSpace:"nowrap", boxShadow:"0 8px 24px rgba(0,0,0,.5)" }}>
      {children}
    </div>
  );
}

function MiniBarChart({ data, height = 60, color, label, unit = "reservas" }) {
  const col = color || T.accent;
  const [tip, setTip] = useState(null);
  if (!data || !data.length) return null;
  const max = Math.max(...data.map(d => d.v), 1);
  const W = 200, H = height;
  const barW = Math.max(4, Math.floor((W - data.length * 2) / data.length));
  return (
    <div style={{ position:"relative" }}>
      {label && <div style={{ color:T.textDim, fontSize:".7rem", marginBottom:4, fontWeight:700 }}>{label}</div>}
      {tip && (
        <div style={{ position:"absolute", left:`${tip.px}%`, top:-38, transform:"translateX(-50%)", pointerEvents:"none", zIndex:50, background:"rgba(7,11,20,.96)", border:"1px solid rgba(182,255,0,.4)", borderRadius:9, padding:"5px 10px", whiteSpace:"nowrap", boxShadow:"0 6px 20px rgba(0,0,0,.55)", fontSize:".75rem" }}>
          <span style={{ color:T.textDim }}>{tip.l} · </span>
          <strong style={{ color:T.accent }}>{tip.v} {unit}</strong>
        </div>
      )}
      <svg width="100%" viewBox={`0 0 ${W} ${H}`} style={{ overflow:"visible", display:"block" }} aria-label={label || "Gráfica de barras"}
        onMouseLeave={() => setTip(null)} onTouchEnd={() => setTimeout(() => setTip(null), 2000)}>
        {data.map((d, i) => {
          const bh = Math.max(2, (d.v / max) * (H - 14));
          const x = i * (barW + 2);
          const cx = x + barW / 2;
          const pxPct = (cx / W) * 100;
          return (
            <g key={i} onMouseEnter={() => setTip({ l: d.l, v: d.v, px: pxPct })} onTouchStart={() => setTip({ l: d.l, v: d.v, px: pxPct })}>
              <rect x={x} y={H - bh - 12} width={barW} height={bh} rx={2} fill={col}
                opacity={tip?.l === d.l ? 1 : .7} style={{ cursor:"crosshair", transition:"opacity .15s" }} />
              {data.length <= 8 && <text x={cx} y={H - 1} textAnchor="middle" fill={T.textDim} fontSize="8">{d.l}</text>}
            </g>
          );
        })}
      </svg>
    </div>
  );
}

function MiniLineChart({ data, height = 60, color, labels, unit = "" }) {
  const col = color || T.accent;
  const [tip, setTip] = useState(null);
  if (!data || data.length < 2) return null;
  const W = 200, H = height;
  const max = Math.max(...data, 1);
  const points = data.map((v, i) => ({
    x: (i / (data.length - 1)) * W,
    y: H - (v / max) * H + 2,
    v, l: labels?.[i] ?? `Día ${i + 1}`,
  }));
  const pts = points.map(p => `${p.x},${p.y}`).join(" ");
  const area = `0,${H} ` + pts + ` ${W},${H}`;
  return (
    <div style={{ position:"relative" }}>
      {tip && (
        <div style={{ position:"absolute", left:`${(tip.x / W) * 100}%`, top:-38, transform:"translateX(-50%)", pointerEvents:"none", zIndex:50, background:"rgba(7,11,20,.96)", border:"1px solid rgba(182,255,0,.4)", borderRadius:9, padding:"5px 10px", whiteSpace:"nowrap", boxShadow:"0 6px 20px rgba(0,0,0,.55)", fontSize:".75rem" }}>
          <span style={{ color:T.textDim }}>{tip.l} · </span>
          <strong style={{ color:T.accent }}>{tip.v}{unit}</strong>
        </div>
      )}
      <svg width="100%" viewBox={`0 0 ${W} ${H}`} style={{ display:"block", overflow:"visible" }} aria-label="Gráfica de líneas"
        onMouseLeave={() => setTip(null)}>
        <defs>
          <linearGradient id="lgArea" x1="0" y1="0" x2="0" y2="1">
```
