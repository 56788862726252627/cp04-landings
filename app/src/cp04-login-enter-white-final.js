(function () {
  function normalize(text) {
    return String(text || "")
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .replace(/\s+/g, " ")
      .trim();
  }

  function forceLoginEnterWhite() {
    const bodyText = normalize(document.body?.innerText || "");

    const looksLikeRoleLogin =
      bodyText.includes("guardar sesion") ||
      bodyText.includes("ver contrasena") ||
      bodyText.includes("contraseña") ||
      bodyText.includes("contrasena") ||
      bodyText.includes("cancelar");

    if (!looksLikeRoleLogin) return;

    Array.from(document.querySelectorAll("button")).forEach((button) => {
      const text = normalize(button.innerText || button.textContent || "");

      if (text === "entrar") {
        button.classList.add("cp04-login-enter-white-final");

        button.style.setProperty("color", "#ffffff", "important");
        button.style.setProperty("-webkit-text-fill-color", "#ffffff", "important");
        button.style.setProperty("fill", "#ffffff", "important");
        button.style.setProperty("font-weight", "950", "important");
        button.style.setProperty("opacity", "1", "important");
        button.style.setProperty("filter", "none", "important");
        button.style.setProperty("text-shadow", "0 2px 12px rgba(0,0,0,.82)", "important");

        Array.from(button.querySelectorAll("*")).forEach((child) => {
          child.style.setProperty("color", "#ffffff", "important");
          child.style.setProperty("-webkit-text-fill-color", "#ffffff", "important");
          child.style.setProperty("fill", "#ffffff", "important");
          child.style.setProperty("font-weight", "950", "important");
          child.style.setProperty("opacity", "1", "important");
          child.style.setProperty("filter", "none", "important");
          child.style.setProperty("text-shadow", "0 2px 12px rgba(0,0,0,.82)", "important");
        });
      }
    });
  }

  forceLoginEnterWhite();
  setTimeout(forceLoginEnterWhite, 100);
  setTimeout(forceLoginEnterWhite, 500);
  setTimeout(forceLoginEnterWhite, 1200);
  setTimeout(forceLoginEnterWhite, 2500);

  document.addEventListener("click", () => setTimeout(forceLoginEnterWhite, 80), true);
  document.addEventListener("input", () => setTimeout(forceLoginEnterWhite, 80), true);
  window.addEventListener("load", forceLoginEnterWhite);
  window.addEventListener("hashchange", forceLoginEnterWhite);
})();
