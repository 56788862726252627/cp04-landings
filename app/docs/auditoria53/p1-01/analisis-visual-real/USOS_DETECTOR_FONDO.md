# IMPORTS Y USOS DEL DETECTOR DE FONDO

src/App.jsx:9:import './role-background-detector';
src/role-background-detector.js:10:function applyRoleBackground(active) {
src/role-background-detector.js:40:function updateRoleBackground() {
src/role-background-detector.js:54:  applyRoleBackground(Boolean(isRoleScreen));
src/role-background-detector.js:57:updateRoleBackground();
src/role-background-detector.js:59:setTimeout(updateRoleBackground, 100);
src/role-background-detector.js:60:setTimeout(updateRoleBackground, 500);
src/role-background-detector.js:61:setTimeout(updateRoleBackground, 1200);
src/role-background-detector.js:63:new MutationObserver(updateRoleBackground).observe(document.body, {
src/role-background-detector.js:69:window.addEventListener('popstate', updateRoleBackground);
src/role-background-detector.js:70:window.addEventListener('hashchange', updateRoleBackground);
src/role-background-detector.js:71:window.addEventListener('load', updateRoleBackground);
