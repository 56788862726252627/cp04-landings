# Auditoría 30 · Mapa App.jsx

Total líneas App.jsx: 7580
Bloques detectados: 228

| Línea | Bloque | Tipo / inicio |
|---:|---|---|
| 51 | `T` | `const T = {` |
| 68 | `CONFIG` | `const CONFIG = {` |
| 77 | `GALLERY` | `const GALLERY = [` |
| 110 | `COURTS` | `const COURTS = [` |
| 117 | `BOOKING_HOURS` | `const BOOKING_HOURS = ["08:00", "09:00", "10:00", "11:00", "12:00", "17:00", "18:00", "19:00", "20:00", "21:00", "22:00"];` |
| 118 | `BOOKING_DURATIONS` | `const BOOKING_DURATIONS = [60, 90, 120];` |
| 119 | `BOOKING_MODALITIES` | `const BOOKING_MODALITIES = ["libre", "partido", "clase", "torneo"];` |
| 120 | `BOOKING_LEVELS` | `const BOOKING_LEVELS = ["iniciacion", "intermedio", "avanzado", "competicion"];` |
| 122 | `BOOKINGS` | `const BOOKINGS = [` |
| 128 | `RANKING` | `const RANKING = [` |
| 134 | `RANKING_PRO` | `const RANKING_PRO = [` |
| 152 | `INTEGRATIONS` | `const INTEGRATIONS = [` |
| 161 | `ROLES` | `const ROLES = [` |
| 168 | `PROTECTED_SECTIONS` | `const PROTECTED_SECTIONS = ["Gestión", "Admin", "Soporte"];` |
| 268 | `calcTimeEnd` | `function calcTimeEnd(time, mins) {` |
| 274 | `priceFor` | `function priceFor(courtName, duration) {` |
| 282 | `madridDateParts` | `function madridDateParts(date = new Date()) {` |
| 296 | `todayISO` | `function todayISO() {` |
| 301 | `parseISODateParts` | `function parseISODateParts(value) {` |
| 307 | `isSundayISO` | `function isSundayISO(value) {` |
| 313 | `isPastDateISO` | `function isPastDateISO(value) {` |
| 317 | `minutesFromTime` | `function minutesFromTime(value) {` |
| 323 | `madridCurrentMinutes` | `function madridCurrentMinutes() {` |
| 328 | `getSlotStatus` | `function getSlotStatus(fecha, hora, duration = 90) {` |
| 347 | `formatDateEs` | `function formatDateEs(value) {` |
| 353 | `cleanText` | `function cleanText(value) {` |
| 357 | `validateBooking` | `function validateBooking(form, courtName, tx) {` |
| 358 | `errors` | `const errors = {};` |
| 386 | `prepareBookingPayload` | `function prepareBookingPayload(form, courtName) {` |
| 415 | `validateReschedule` | `function validateReschedule(form, courtName, tx) {` |
| 417 | `errors` | `const errors = {};` |
| 465 | `prepareReschedulePayload` | `function prepareReschedulePayload(form, courtName) {` |
| 494 | `Card` | `function Card({ children, style = {} }) {` |
| 498 | `Btn` | `function Btn({ children, onClick, variant = "primary", disabled = false, type = "button", style = {} }) {` |
| 499 | `map` | `const map = {` |
| 534 | `emitDisponibilidadUpdate` | `function emitDisponibilidadUpdate(fecha) {` |
| 538 | `refreshDisponibilidadAfterChange` | `function refreshDisponibilidadAfterChange(fecha) {` |
| 544 | `CalendarioDisponibilidad` | `function CalendarioDisponibilidad({` |
| 618 | `handleDisponibilidadUpdate` | `function handleDisponibilidadUpdate(event) {` |
| 635 | `cambiarFecha` | `const cambiarFecha = (value) => {` |
| 762 | `SectionTitle` | `function SectionTitle({ eyebrow, title, desc }) {` |
| 766 | `Badge` | `function Badge({ status }) {` |
| 769 | `map` | `const map = { confirmed: [tx("badge.confirmed"), T.accent], pending: [tx("badge.pending"), T.warning], completed: [tx("badge.completed"), T.` |
| 774 | `FieldError` | `function FieldError({ children }) {` |
| 779 | `PanelList` | `function PanelList({ items }) {` |
| 783 | `RolePanel` | `function RolePanel({ eyebrow, title, desc, items, action }) {` |
| 787 | `GalleryItem` | `function GalleryItem({ item, featured = false }) {` |
| 791 | `Gallery` | `function Gallery() {` |
| 798 | `IntegrationMatrix` | `function IntegrationMatrix({ compact = false }) {` |
| 799 | `colorFor` | `const colorFor = (status) => status === "Preparada" ? T.accent : status === "Pendiente de credenciales" ? T.warning : T.textDim;` |
| 803 | `AuthStatusPanel` | `function AuthStatusPanel({ compact = false }) {` |
| 814 | `useClock` | `function useClock() {` |
| 829 | `handler` | `function handler(e) { setLangCode(e.detail?.lang?.code // "es-ES"); }` |
| 833 | `dias` | `const dias = ["Domingo","Lunes","Martes","Miércoles","Jueves","Viernes","Sábado"];` |
| 861 | `ClockDisplay` | `function ClockDisplay({ compact = false }) {` |
| 885 | `MetricCard` | `function MetricCard({ label, value, sub, trend, color, icon }) {` |
| 917 | `ChartTooltip` | `function ChartTooltip({ x, y, children, visible }) {` |
| 926 | `MiniBarChart` | `function MiniBarChart({ data, height = 60, color, label, unit = "reservas" }) {` |
| 948 | `pxPct` | `const pxPct = (cx / W) * 100;` |
| 962 | `MiniLineChart` | `function MiniLineChart({ data, height = 60, color, labels, unit = "" }) {` |
| 1003 | `DonutChart` | `function DonutChart({ segments, size = 120, label }) {` |
| 1011 | `a1` | `const a1 = (angle * Math.PI) / 180;` |
| 1012 | `a2` | `const a2 = ((angle + pct * 360) * Math.PI) / 180;` |
| 1054 | `HorizontalBarChart` | `function HorizontalBarChart({ data, color, unit = "" }) {` |
| 1082 | `FlowStatusBadge` | `function FlowStatusBadge({ status }) {` |
| 1083 | `map` | `const map = {` |
| 1099 | `ChartCard` | `function ChartCard({ title, sub, children, action, demo = false, style: cs = {} }) {` |
| 1121 | `dashboardDataSources` | `const dashboardDataSources = {` |
| 1129 | `DEMO_RESERVAS_HOY` | `const DEMO_RESERVAS_HOY = [` |
| 1135 | `DEMO_RESERVAS_SEMANA` | `const DEMO_RESERVAS_SEMANA = [12, 18, 24, 19, 27, 31, 22];` |
| 1137 | `DEMO_OCUPACION_PISTAS` | `const DEMO_OCUPACION_PISTAS = [` |
| 1144 | `DEMO_KPI` | `const DEMO_KPI = {` |
| 1163 | `DEMO_MAKE_EJECUCIONES_24H` | `const DEMO_MAKE_EJECUCIONES_24H = [42, 55, 38, 61, 47, 53, 49, 66, 71, 58, 44, 39, 52, 48, 57, 63, 70, 65, 59, 42, 38, 44, 51, 48];` |
| 1165 | `DEMO_MAKE_CATEGORIAS` | `const DEMO_MAKE_CATEGORIAS = [` |
| 1178 | `DEMO_MAKE_FLUJOS_TOP` | `const DEMO_MAKE_FLUJOS_TOP = [` |
| 1186 | `DEMO_MAKE_FLUJOS_ERRORES` | `const DEMO_MAKE_FLUJOS_ERRORES = [` |
| 1192 | `WORKFLOW_ITEMS` | `const WORKFLOW_ITEMS = [` |
| 1840 | `FlujosMake` | `function FlujosMake() {` |
| 1847 | `cats` | `const cats = ["Todas", ...Array.from(new Set(DEMO_MAKE_CATEGORIAS.map(c => c.l)))];` |
| 1852 | `exportMakeJSON` | `const exportMakeJSON = () => {` |
| 1986 | `normalizeSearchText` | `function normalizeSearchText(value) {` |
| 1995 | `LANGUAGES_RAW` | `const LANGUAGES_RAW = [` |
| 2106 | `sortLanguages` | `function sortLanguages(list) {` |
| 2118 | `loadSavedLanguage` | `function loadSavedLanguage() {` |
| 2148 | `setGlobalLang` | `function setGlobalLang(lang) {` |
| 2154 | `useLang` | `function useLang() {` |
| 2157 | `handler` | `function handler(e) { setLang(e.detail?.lang // _defaultLang); }` |
| 2169 | `CP04_AUTH_MODES` | `const CP04_AUTH_MODES = {` |
| 2176 | `CP04_PROTECTED_SECTIONS` | `const CP04_PROTECTED_SECTIONS = [` |
| 2183 | `CP04_ROLE_PERMISSIONS` | `const CP04_ROLE_PERMISSIONS = {` |
| 2190 | `cp04NormalizeRole` | `function cp04NormalizeRole(role) {` |
| 2196 | `cp04IsProtectedSection` | `function cp04IsProtectedSection(section) {` |
| 2200 | `cp04CanAccessSection` | `function cp04CanAccessSection(role, section) {` |
| 2206 | `cp04GetSafeStartSection` | `function cp04GetSafeStartSection(role) {` |
| 2212 | `cp04RequiresBackendAuth` | `function cp04RequiresBackendAuth(section) {` |
| 2216 | `cp04GetStoredAuthMode` | `function cp04GetStoredAuthMode() {` |
| 2225 | `TRANSLATIONS` | `const TRANSLATIONS = {` |
| 3824 | `t` | `function t(key, lang) {` |
| 3838 | `LanguageSelector` | `function LanguageSelector() {` |
| 3850 | `onKey` | `function onKey(e) { if (e.key === "Escape") setOpen(false); }` |
| 3857 | `onClickOut` | `function onClickOut(e) {` |
| 3864 | `filterLanguages` | `function filterLanguages(list) {` |
| 3869 | `fields` | `const fields = [lang.label, lang.country, lang.countryEs, lang.countryEn, lang.code, lang.flag, ...(lang.aliases // [])];` |
| 3874 | `selectLang` | `function selectLang(lang) {` |
| 3941 | `LangOption` | `function LangOption({ lang, selected, onSelect }) {` |
| 3965 | `Sidebar` | `function Sidebar({ current, selectedRole, onClearRole, mobileOpen, onNavigate, onClose }) {` |
| 3968 | `navKeys` | `const navKeys = [` |
| 3974 | `menuByRole` | `const menuByRole = {` |
| 4022 | `Inicio` | `function Inicio({ setCurrent }) {` |
| 4135 | `Reservas` | `function Reservas() {` |
| 4150 | `statusMap` | `const statusMap = {` |
| 4158 | `updateForm` | `function updateForm(field, value) {` |
| 4165 | `review` | `function review() {` |
| 4212 | `newBooking` | `function newBooking() {` |
| 4233 | `CancelarReserva` | `function CancelarReserva({ setCurrent }) {` |
| 4243 | `statusMap` | `const statusMap = {` |
| 4251 | `updateClave` | `function updateClave(value) {` |
| 4257 | `updateConfirmado` | `function updateConfirmado(value) {` |
| 4322 | `ReprogramarReserva` | `function ReprogramarReserva({ setCurrent }) {` |
| 4346 | `statusMap` | `const statusMap = {` |
| 4354 | `updateForm` | `function updateForm(field, value) {` |
| 4361 | `chooseCourt` | `function chooseCourt(value) {` |
| 4439 | `resetForm` | `function resetForm() {` |
| 4688 | `Gestion` | `function Gestion() {` |
| 4717 | `normalizarReserva` | `function normalizarReserva(item) {` |
| 4949 | `colorEstado` | `function colorEstado(estado) {` |
| 5321 | `AltaJugador` | `function AltaJugador() {` |
| 5324 | `initialForm` | `const initialForm = {` |
| 5342 | `updateForm` | `function updateForm(field, value) {` |
| 5349 | `validate` | `function validate() {` |
| 5350 | `nextErrors` | `const nextErrors = {};` |
| 5509 | `TORNEO_DEMO_NAMES` | `const TORNEO_DEMO_NAMES = [` |
| 5530 | `FORMAT_MAX` | `const FORMAT_MAX = { "16": 8, "32": 16, "64": 32 };` |
| 5534 | `torneoLoadSaved` | `function torneoLoadSaved() {` |
| 5546 | `torneoLoadHist` | `function torneoLoadHist() {` |
| 5554 | `torneoBuildEmptyPairs` | `function torneoBuildEmptyPairs(count) {` |
| 5563 | `torneoBuildFullBracket` | `function torneoBuildFullBracket(pairs, byeId) {` |
| 5565 | `r1` | `const r1 = [];` |
| 5572 | `all` | `const all = [...r1];` |
| 5593 | `torneoGetRoundLabel` | `function torneoGetRoundLabel(rNum, total) {` |
| 5603 | `torneoAdvanceWinner` | `function torneoAdvanceWinner(bracket, matchId, winnerId) {` |
| 5616 | `torneoGetMatchGap` | `function torneoGetMatchGap(round) {` |
| 5620 | `torneoGetRoundPadding` | `function torneoGetRoundPadding(round) {` |
| 5624 | `Torneos` | `function Torneos() {` |
| 5656 | `s` | `const s = { formatMode, customMode, customInput, pairs, bracket, byePair, byeDrawDate, published };` |
| 5661 | `showNotice` | `const showNotice = (msg, err = false) => {` |
| 5666 | `pairLabel` | `const pairLabel = (p) => {` |
| 5674 | `pushHistory` | `const pushHistory = (action) => {` |
| 5676 | `snap` | `const snap = {` |
| 5685 | `newSnaps` | `const newSnaps = [...snaps.slice(0, idx + 1), snap].slice(-30);` |
| 5692 | `restoreSnap` | `const restoreSnap = (snap) => {` |
| 5705 | `handleUndo` | `const handleUndo = () => {` |
| 5716 | `handleRedo` | `const handleRedo = () => {` |
| 5727 | `handleRestoreVersion` | `const handleRestoreVersion = (idx) => {` |
| 5739 | `applyFormat` | `const applyFormat = (fmt) => {` |
| 5748 | `applyCustom` | `const applyCustom = () => {` |
| 5769 | `handleReorder` | `const handleReorder = () => {` |
| 5771 | `shuffled` | `const shuffled = [...pairs].sort(() => Math.random() - 0.5);` |
| 5783 | `handleAutoAssign` | `const handleAutoAssign = () => {` |
| 5794 | `handleSave` | `const handleSave = () => {` |
| 5799 | `handlePublish` | `const handlePublish = () => {` |
| 5806 | `handleAddPair` | `const handleAddPair = () => {` |
| 5810 | `np` | `const np = { id: `p${Date.now()}`, player1: "", player2: "" };` |
| 5811 | `upd` | `const upd = [...pairs, np];` |
| 5816 | `handleDeletePair` | `const handleDeletePair = (id) => {` |
| 5825 | `handleEditSave` | `const handleEditSave = () => {` |
| 5832 | `handleMarkWinner` | `const handleMarkWinner = (matchId, winnerId) => {` |
| 5844 | `handleExportJSON` | `const handleExportJSON = () => {` |
| 5845 | `data` | `const data = {` |
| 5868 | `handleExportCSV` | `const handleExportCSV = () => {` |
| 5869 | `lines` | `const lines = ["#,Jugador 1,Jugador 2"];` |
| 5878 | `bracketByRound` | `const bracketByRound = {};` |
| 6278 | `RankingAvatar` | `function RankingAvatar({ name, color = T.accent, size = 34 }) {` |
| 6293 | `MovArrow` | `function MovArrow({ mov }) {` |
| 6299 | `RachaBadge` | `function RachaBadge({ racha }) {` |
| 6305 | `Ranking` | `function Ranking() {` |
| 6309 | `CATS` | `const CATS = [` |
| 6318 | `NIVEL_COLORS` | `const NIVEL_COLORS = { "Avanzado":"#b6ff00", "Medio":"#20e3b2", "Iniciación":"#a78bfa" };` |
| 6341 | `PODIO_COLORS` | `const PODIO_COLORS = ["#f59e0b", "#9ca3af", "#b45309"];` |
| 6342 | `PODIO_TROFEOS` | `const PODIO_TROFEOS = ["🏆", "🥈", "🥉"];` |
| 6343 | `PODIO_LABELS` | `const PODIO_LABELS = [tx("ranking.campeon"), tx("ranking.subcampeon"), tx("ranking.tercero")];` |
| 6529 | `Admin` | `function Admin() {` |
| 6581 | `AuthProductionStatusPanel` | `function AuthProductionStatusPanel() {` |
| 6614 | `Soporte` | `function Soporte() {` |
| 6620 | `Perfil` | `function Perfil({ selectedRole, onClearRole }) {` |
| 6623 | `roleLabels` | `const roleLabels = { PLAYER:"Jugador / cliente", STAFF:"Staff / recepción", ADMIN:"Administrador / jefe", SUPPORT:"Soporte técnico" };` |
| 6624 | `demoPwds` | `const demoPwds = { PLAYER:"jugador04", STAFF:"staff04", ADMIN:"admin04", SUPPORT:"soporte04" };` |
| 6635 | `PROFILE_BACKEND_ENDPOINTS` | `const PROFILE_BACKEND_ENDPOINTS = {` |
| 6642 | `saveProfileFallback` | `function saveProfileFallback(key, value) {` |
| 6660 | `storageMap` | `const storageMap = {` |
| 6706 | `roleInitials` | `const roleInitials = { PLAYER:"JG", STAFF:"ST", ADMIN:"AD", SUPPORT:"SP" };` |
| 6710 | `computeCompleteness` | `function computeCompleteness() {` |
| 6723 | `handleAvatarChange` | `function handleAvatarChange(e) {` |
| 6727 | `allowed` | `const allowed = ["image/jpeg","image/png","image/webp","image/gif"];` |
| 6734 | `handleAvatarSave` | `function handleAvatarSave() {` |
| 6741 | `handleAvatarDelete` | `function handleAvatarDelete() {` |
| 6749 | `startBioEdit` | `function startBioEdit() { setBioDraft(bio); setBioEdit(true); setBioMsg(""); }` |
| 6750 | `cancelBioEdit` | `function cancelBioEdit() { setBioEdit(false); setBioDraft(""); }` |
| 6751 | `saveBio` | `function saveBio() {` |
| 6760 | `startDeporteEdit` | `function startDeporteEdit() { setDeporteDraft({...deporteData}); setDeporteEditing(true); }` |
| 6761 | `cancelDeporteEdit` | `function cancelDeporteEdit() { setDeporteEditing(false); }` |
| 6762 | `saveDeporte` | `function saveDeporte() {` |
| 6763 | `saved` | `const saved = {...deporteDraft};` |
| 6770 | `togglePriv` | `function togglePriv(key, defaultOn) {` |
| 6772 | `updated` | `const updated = { ...privacidad, [key]: !current };` |
| 6779 | `handleChangePwd` | `function handleChangePwd(e) {` |
| 6792 | `demoMetrics` | `const demoMetrics = {` |
| 6801 | `allBadges` | `const allBadges = [` |
| 6813 | `recentActivity` | `const recentActivity = [` |
| 6822 | `roleProfileLabel` | `const roleProfileLabel = { PLAYER:"Jugador", STAFF:"Staff · Recepción", ADMIN:"Administración", SUPPORT:"Soporte técnico" }[selectedRole] //` |
| 6826 | `cs` | `const cs = { background:T.surface2, borderRadius:20, padding:"22px 24px", border:`1px solid ${T.line}` };` |
| 6827 | `ls` | `const ls = { color:T.textDim, fontWeight:700, fontSize:".8rem", letterSpacing:".06em", textTransform:"uppercase", marginBottom:6, display:"b` |
| 6828 | `ss` | `const ss = { background:T.surface3, border:`1px solid ${T.line}`, borderRadius:10, color:T.text, padding:"10px 14px", width:"100%", fontSize` |
| 6829 | `hs` | `const hs = { margin:0, color:T.accent, fontFamily:T.fontDisplay, fontSize:"1rem", letterSpacing:".04em" };` |
| 7167 | `ClubPadel04SaaSApp` | `export default function ClubPadel04SaaSApp() {` |
| 7186 | `modules` | `const modules = { inicio: <Inicio setCurrent={setCurrent} />, reservas: <Reservas />, alta_jugador: <AltaJugador />, reprogramar: <Reprogram` |
| 7188 | `roleConfig` | `const roleConfig = {` |
| 7215 | `selectRole` | `function selectRole(roleId) {` |
| 7222 | `confirmRoleAccess` | `function confirmRoleAccess(event) {` |
| 7249 | `clearRole` | `function clearRole() {` |
| 7261 | `inferRoleFromEmail` | `function inferRoleFromEmail(email) {` |
| 7273 | `handleUniversalLogin` | `function handleUniversalLogin(event) {` |
| 7300 | `openForgotPwd` | `function openForgotPwd() {` |
| 7306 | `closeForgotPwd` | `function closeForgotPwd() {` |
| 7312 | `handleForgotPwdSubmit` | `function handleForgotPwdSubmit(e) {` |
| 7328 | `handleKeyDown` | `function handleKeyDown(event) {` |
| 7343 | `navigate` | `function navigate(section) {` |
| 7363 | `roleLabels` | `const roleLabels = {` |