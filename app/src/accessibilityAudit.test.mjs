import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import path from "node:path";

// Prompt 4 (Mejora 2.6, 2026-07-26): auditoría de accesibilidad/contraste.
// Estas pruebas fijan por escrito las correcciones reales aplicadas para
// que no se puedan revertir sin que un test lo note.

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const appJsx = readFileSync(path.join(__dirname, "App.jsx"), "utf8");
const torcalCss = readFileSync(path.join(__dirname, "torcal-role-background.css"), "utf8");

test("los avisos role=status (PwaStatusBanners) están excluidos de las reglas catch-all de fondo del role-screen", () => {
  // Las dos reglas responsables del bug real (texto ~invisible en el
  // aviso "sin conexión" y su botón "Reintentar"): deben excluir
  // explícitamente los descendientes de [role="status"], usando
  // :where() para no inflar la especificidad y romper otros fixes ya
  // existentes (cp04-login-submit-btn, cp04-login-entrar-white-btn).
  assert.match(torcalCss, /\[style\*="background"\]:not\(:where\(\[role="status"\], \[role="status"\] \*\)\)/);
  assert.match(torcalCss, /button:not\(:where\(\[role="status"\] \*\)\)/);
});

test("los botones de PwaStatusBanners (Reintentar / Actualizar ahora) ya no llevan el overlay rgba(0,0,0,.12) que bajaba el contraste por debajo de AA", () => {
  assert.equal(appJsx.includes('background: "rgba(0,0,0,.12)"'), false);
});

test("el botón 'Entrar' del login usa color blanco fijo, no depende de ningún idioma", () => {
  assert.match(appJsx, /color:"#ffffff",\s*fontWeight:900\s*\}\}>\s*\{ltx\("login\.entrar"\)\}/);
});

test("el botón 'Enviar instrucciones' (recuperar contraseña) reutiliza la clase cp04-login-entrar-white-btn (2 usos: Entrar + Enviar instrucciones) y ambos fijan color blanco", () => {
  const classUses = appJsx.match(/className="cp04-menu-button cp04-login-entrar-white-btn"/g) || [];
  assert.equal(classUses.length, 2, "se esperaban 2 usos: botón Entrar y botón Enviar instrucciones");
  assert.match(appJsx, /className="cp04-menu-button cp04-login-entrar-white-btn"[\s\S]{0,80}color:"#ffffff"/);
});

test("el botón 'Crear cuenta' (envío del formulario de registro) reutiliza el fix ya validado de 'Iniciar sesión' (cp04-login-submit-btn)", () => {
  assert.match(appJsx, /onClick=\{handleRegisterSubmit\} className="cp04-menu-button cp04-login-submit-btn"/);
});

test("Alta de jugador / Baja de jugador: cada input de texto tiene label asociado por htmlFor+id (no solo visualmente cercano)", () => {
  const pairs = [
    ["baja-nombre"], ["baja-apellidos"], ["baja-email"], ["baja-telefono"], ["baja-motivo"], ["baja-fecha"], ["baja-observaciones"],
    ["alta-nombre"], ["alta-apellidos"], ["alta-email"], ["alta-telefono"], ["alta-fecha-nac"], ["alta-nivel"], ["alta-genero"], ["alta-comentarios"],
  ];
  for (const [id] of pairs) {
    assert.match(appJsx, new RegExp(`htmlFor="${id}"`), `falta htmlFor="${id}"`);
    assert.match(appJsx, new RegExp(`id="${id}"`), `falta id="${id}" en el control`);
  }
});

test("Cierre temporal de pista: cada campo tiene label asociado por htmlFor+id", () => {
  for (const id of ["cierre-pista", "cierre-motivo", "cierre-fecha-inicio", "cierre-hora-inicio", "cierre-fecha-fin", "cierre-hora-fin", "cierre-observaciones"]) {
    assert.match(appJsx, new RegExp(`htmlFor="${id}"`), `falta htmlFor="${id}"`);
    assert.match(appJsx, new RegExp(`id="${id}"`), `falta id="${id}" en el control`);
  }
});

test("Lista de espera: cada campo tiene label asociado por htmlFor+id", () => {
  for (const id of ["espera-nombre", "espera-apellidos", "espera-email", "espera-telefono", "espera-pista", "espera-fecha", "espera-observaciones"]) {
    assert.match(appJsx, new RegExp(`htmlFor="${id}"`), `falta htmlFor="${id}"`);
    assert.match(appJsx, new RegExp(`id="${id}"`), `falta id="${id}" en el control`);
  }
});
