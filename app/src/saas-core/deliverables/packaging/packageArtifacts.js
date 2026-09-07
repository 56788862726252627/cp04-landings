// App 3 · Prompt 5/6 — PackageArtifacts.
//
// Construye el índice HTML navegable y el README.md profesional del
// paquete final. Deliberadamente NO incluyen un timestamp de "generado
// el ..." en su contenido: un timestamp de pared (wall-clock) cambiaría
// los bytes de estos archivos en cada ejecución aunque el contenido de
// origen fuera idéntico — rompería la reproducibilidad real del .zip
// final (ver packageZip.js). La "versión" (entero, solo sube si algo
// cambió de verdad) ya es la fuente de verdad temporal de este paquete,
// igual que en el resto de manifiestos de App 3.

function escapeHtml(text) {
  return String(text ?? "").replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
}

function groupByFolder(entries) {
  const groups = new Map();
  for (const entry of entries) {
    const folder = entry.path.split("/")[0];
    if (!groups.has(folder)) groups.set(folder, []);
    groups.get(folder).push(entry);
  }
  return groups;
}

/**
 * @param {{projectName:string, version:number, entries:{id:string, deliverableType:string, format:string, path:string, status:string}[]}} options
 */
export function cp04BuildPackageIndexHtml({ projectName, version, entries }) {
  const groups = groupByFolder(entries);
  const sections = [...groups.entries()]
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([folder, items]) => {
      const rows = items
        .map((item) => `<tr><td>${escapeHtml(item.deliverableType)}</td><td>${escapeHtml(item.format)}</td><td>${escapeHtml(item.status)}</td><td><a href="${item.path}">${escapeHtml(item.path)}</a></td></tr>`)
        .join("\n");
      return `<section><h2>${escapeHtml(folder)} (${items.length})</h2><table><thead><tr><th>Entregable</th><th>Formato</th><th>Estado</th><th>Archivo</th></tr></thead><tbody>${rows}</tbody></table></section>`;
    })
    .join("\n");

  return `<!doctype html><html lang="es"><head><meta charset="utf-8"><title>${escapeHtml(projectName)} — Paquete final</title>
<style>body{font-family:sans-serif;background:#05080d;color:#f1f5f9;padding:32px} table{border-collapse:collapse;width:100%;table-layout:fixed;margin-bottom:24px} td,th{border:1px solid #334155;padding:6px 10px;font-size:.85rem;word-break:break-word;overflow-wrap:anywhere} a{color:#7dd3fc} h1{margin-bottom:4px} h2{color:#7dd3fc}</style>
</head><body>
<h1>${escapeHtml(projectName)}</h1>
<p>Paquete final de entregables · versión ${version} · ${entries.length} archivo(s)</p>
${sections}
</body></html>`;
}

/**
 * @param {{projectName:string, version:number, entries:object[], failed:{id:string, reason:string}[], validation:{validated:number, invalid:number}}} options
 */
export function cp04BuildPackageReadme({ projectName, version, entries, failed, validation }) {
  const byFolder = groupByFolder(entries);
  const folderLines = [...byFolder.entries()]
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([folder, items]) => `- **${folder}/** — ${items.length} archivo(s)`);

  const lines = [
    `# ${projectName} — Paquete de entregables`,
    "",
    `Paquete final generado por la fábrica de entregables de Agencia IA (App 3). Versión ${version}.`,
    "",
    "## Contenido",
    "",
    ...folderLines,
    "",
    "## Validación",
    "",
    `- Entregables incluidos y validados: ${validation.validated}`,
    `- Entregables excluidos por fallo de validación: ${validation.invalid}`,
    failed.length > 0 ? "" : null,
    failed.length > 0 ? "### Excluidos" : null,
    ...failed.map((f) => `- ${f.id}: ${f.reason}`),
    "",
    "## Cómo abrir este paquete",
    "",
    "Abrir `index.html` en un navegador para navegar todos los entregables por carpeta, o consultar `manifest/paquete-final.json` para el detalle técnico (checksums, formato, estado) de cada archivo.",
    "",
    "## Aviso",
    "",
    "Este paquete se generó localmente, sin conexión a Google Drive ni a ningún servicio externo. Ningún archivo fue subido a ningún sitio.",
  ].filter((line) => line !== null);

  return lines.join("\n") + "\n";
}
