function showTournamentToast(message) {
  let toast = document.querySelector('#cp04-tournament-toast');

  if (!toast) {
    toast = document.createElement('div');
    toast.id = 'cp04-tournament-toast';
    toast.className = 'cp04-tournament-toast';
    document.body.appendChild(toast);
  }

  toast.textContent = `✅ ${message}`;
  toast.classList.add('is-visible');

  clearTimeout(window.__cp04TournamentToastTimer);
  window.__cp04TournamentToastTimer = setTimeout(() => {
    toast.classList.remove('is-visible');
  }, 2600);
}

function normalizeText(value) {
  return String(value || '')
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/\s+/g, ' ')
    .trim();
}

function getTournamentRoot() {
  const headings = Array.from(document.querySelectorAll('h1, h2, h3'));
  const title = headings.find((el) => normalizeText(el.textContent).includes('torneos'));
  return title ? title.closest('main, section, div') || document.body : document.body;
}

function getSelectedFormatPairs() {
  const activeFormat = Array.from(document.querySelectorAll('button'))
    .find((button) => {
      const text = normalizeText(button.textContent);
      const looksFormat = text.includes('jugadores') && text.includes('parejas');
      const isActive = button.className.includes('is-active') || String(button.style.background || '').includes('linear-gradient');
      return looksFormat && isActive;
    });

  const text = normalizeText(activeFormat?.textContent || document.body.textContent);

  if (text.includes('64 jugadores')) return 32;
  if (text.includes('32 jugadores')) return 16;
  if (text.includes('16 jugadores')) return 8;

  return 8;
}

function ensureControlLog() {
  let panel = document.querySelector('#cp04-tournament-control-log');

  if (!panel) {
    panel = document.createElement('div');
    panel.id = 'cp04-tournament-control-log';
    panel.className = 'cp04-tournament-control-log';
    panel.innerHTML = `
      <div class="cp04-control-log-head">
        <strong>Acciones del torneo</strong>
        <span>Modo demo local</span>
      </div>
      <div class="cp04-control-log-list"></div>
    `;

    const controlsTitle = Array.from(document.querySelectorAll('h3, h2'))
      .find((el) => normalizeText(el.textContent).includes('controles del torneo'));

    const controlsCard = controlsTitle?.closest('div');
    if (controlsCard) {
      controlsCard.appendChild(panel);
    } else {
      document.body.appendChild(panel);
    }
  }

  return panel.querySelector('.cp04-control-log-list');
}

function addControlLog(message) {
  const list = ensureControlLog();
  const item = document.createElement('div');
  item.className = 'cp04-control-log-item';
  item.textContent = message;
  list.prepend(item);
}

function markTournamentSaved() {
  localStorage.setItem('cp04_tournament_saved', new Date().toISOString());
  document.body.dataset.cp04TournamentSaved = 'true';
  addControlLog('Cuadro guardado en almacenamiento local demo.');
  showTournamentToast('Cuadro guardado en modo demo local');
}

function markTournamentPublished() {
  localStorage.setItem('cp04_tournament_status', 'publicado');
  document.body.dataset.cp04TournamentStatus = 'publicado';

  const statusButtons = Array.from(document.querySelectorAll('button, span'))
    .filter((el) => ['en curso', 'en edicion', 'en edición'].includes(normalizeText(el.textContent)));

  statusButtons.forEach((el) => {
    el.textContent = 'Publicado';
    el.classList.add('cp04-status-published');
  });

  addControlLog('Torneo publicado en modo demo local.');
  showTournamentToast('Torneo publicado en modo demo local');
}

function autoAssignBracket() {
  const root = getTournamentRoot();
  const pendingNodes = Array.from(root.querySelectorAll('*'))
    .filter((el) => normalizeText(el.textContent) === 'pendiente')
    .slice(0, 24);

  pendingNodes.forEach((el, index) => {
    el.textContent = `Asignada ${index + 1}`;
    el.classList.add('cp04-autoassigned');
  });

  localStorage.setItem('cp04_tournament_autoassigned', 'true');
  addControlLog('Parejas autoasignadas visualmente en el bracket.');
  showTournamentToast('Autoasignación aplicada al bracket');
}

function reorderCrosses() {
  const root = getTournamentRoot();
  root.classList.toggle('cp04-crosses-reordered');

  const crosses = Array.from(root.querySelectorAll('*'))
    .filter((el) => normalizeText(el.textContent).includes('pareja vs'))
    .slice(0, 8);

  crosses.forEach((el, index) => {
    el.classList.toggle('cp04-cross-reordered');
    el.title = `Cruce reordenado ${index + 1}`;
  });

  localStorage.setItem('cp04_tournament_reordered', String(Date.now()));
  addControlLog('Cruces reordenados visualmente en modo demo.');
  showTournamentToast('Cruces reordenados visualmente');
}

function addDemoPair() {
  const pairs = getSelectedFormatPairs();
  const nextPair = Number(localStorage.getItem('cp04_tournament_extra_pair') || pairs) + 1;
  localStorage.setItem('cp04_tournament_extra_pair', String(nextPair));

  const bracketTitle = Array.from(document.querySelectorAll('h3, h2'))
    .find((el) => normalizeText(el.textContent).includes('bracket interactivo'));

  const bracketCard = bracketTitle?.closest('div');

  if (bracketCard) {
    const pairCard = document.createElement('div');
    pairCard.className = 'cp04-added-pair-card';
    pairCard.innerHTML = `<strong>${nextPair}</strong><span>Pareja demo ${nextPair}</span><small>Añadida localmente</small>`;
    bracketCard.appendChild(pairCard);
  }

  addControlLog(`Pareja demo ${nextPair} añadida localmente.`);
  showTournamentToast(`Pareja demo ${nextPair} añadida`);
}

function openExportView() {
  const topExport = Array.from(document.querySelectorAll('button')).find((button) => {
    const text = normalizeText(button.textContent);
    return text === 'exportar' && !button.closest('#cp04-tournament-control-log');
  });

  if (topExport) {
    topExport.click();
  }

  localStorage.setItem('cp04_tournament_export_requested', new Date().toISOString());
  addControlLog('Vista Exportar abierta y exportación demo preparada.');
  showTournamentToast('Vista Exportar abierta');
}

function handleTournamentButtonClick(event) {
  const button = event.target.closest('button');
  if (!button) return;

  const appText = normalizeText(document.body.textContent);
  if (!appText.includes('torneos') && !appText.includes('ranking completo')) return;

  const text = normalizeText(button.textContent);

  if (text.includes('anadir pareja')) {
    event.preventDefault();
    event.stopPropagation();
    addDemoPair();
    return;
  }

  if (text === 'reordenar cruces') {
    event.preventDefault();
    event.stopPropagation();
    reorderCrosses();
    return;
  }

  if (text === 'autoasignar') {
    event.preventDefault();
    event.stopPropagation();
    autoAssignBracket();
    return;
  }

  if (text === 'guardar cuadro') {
    event.preventDefault();
    event.stopPropagation();
    markTournamentSaved();
    return;
  }

  if (text === 'publicar') {
    event.preventDefault();
    event.stopPropagation();
    markTournamentPublished();
    return;
  }

  if (text === 'exportar' && button.className.includes('cp04-control-btn')) {
    event.preventDefault();
    event.stopPropagation();
    openExportView();
  }
}

document.addEventListener('click', handleTournamentButtonClick, true);

/* CLUB PÁDEL 04 · Editar y eliminar parejas del bracket en modo demo local */

function getPairNameFromNode(node) {
  const text = String(node?.textContent || '').trim();
  const match = text.match(/Pareja demo\s+\d+/i);
  return match ? match[0] : '';
}

function saveEditedPair(oldName, newName) {
  const saved = JSON.parse(localStorage.getItem('cp04_tournament_edited_pairs') || '{}');
  saved[oldName] = newName;
  localStorage.setItem('cp04_tournament_edited_pairs', JSON.stringify(saved));
}

function markDeletedPair(pairName) {
  const deleted = JSON.parse(localStorage.getItem('cp04_tournament_deleted_pairs') || '[]');
  if (!deleted.includes(pairName)) deleted.push(pairName);
  localStorage.setItem('cp04_tournament_deleted_pairs', JSON.stringify(deleted));
}

function makeExistingPairsEditable() {
  const root = getTournamentRoot();

  const pairNodes = Array.from(root.querySelectorAll('*')).filter((el) => {
    const text = normalizeText(el.textContent);
    const isPair = text.includes('pareja demo');
    const isButton = el.tagName === 'BUTTON';
    const alreadyPrepared = el.classList.contains('cp04-editable-pair');
    const tooLarge = String(el.textContent || '').length > 90;
    return isPair && !isButton && !alreadyPrepared && !tooLarge;
  });

  pairNodes.forEach((node) => {
    const pairName = getPairNameFromNode(node);
    if (!pairName) return;

    node.classList.add('cp04-editable-pair');
    node.setAttribute('title', 'Clicar para editar esta pareja');

    const deleteBtn = document.createElement('button');
    deleteBtn.type = 'button';
    deleteBtn.className = 'cp04-delete-pair-btn';
    deleteBtn.textContent = '🗑️';
    deleteBtn.setAttribute('aria-label', `Eliminar ${pairName}`);
    deleteBtn.dataset.pairName = pairName;

    node.appendChild(deleteBtn);
  });
}

function editPairNode(node) {
  const oldName = getPairNameFromNode(node);
  if (!oldName) return;

  const currentCustom = node.dataset.customName || oldName;
  const newName = window.prompt('Editar nombre de la pareja:', currentCustom);

  if (!newName) return;

  const cleanName = newName.trim();
  if (!cleanName) return;

  node.dataset.customName = cleanName;

  node.childNodes.forEach((child) => {
    if (child.nodeType === Node.TEXT_NODE && child.textContent.includes(oldName)) {
      child.textContent = child.textContent.replace(oldName, cleanName);
    }
  });

  node.innerHTML = node.innerHTML.replaceAll(oldName, cleanName);

  const deleteBtn = node.querySelector('.cp04-delete-pair-btn');
  if (deleteBtn) {
    deleteBtn.dataset.pairName = cleanName;
    deleteBtn.setAttribute('aria-label', `Eliminar ${cleanName}`);
  }

  saveEditedPair(oldName, cleanName);
  addControlLog(`${oldName} editada como ${cleanName}.`);
  showTournamentToast(`Pareja editada: ${cleanName}`);
}

function deletePairNode(button) {
  const node = button.closest('.cp04-editable-pair, .cp04-added-pair-card');
  if (!node) return;

  const pairName = button.dataset.pairName || getPairNameFromNode(node) || 'Pareja seleccionada';

  const confirmed = window.confirm(`¿Eliminar ${pairName} del bracket en modo demo?`);
  if (!confirmed) return;

  node.classList.add('cp04-pair-deleted');
  markDeletedPair(pairName);

  setTimeout(() => {
    node.remove();
  }, 180);

  addControlLog(`${pairName} eliminada del bracket en modo demo.`);
  showTournamentToast(`${pairName} eliminada`);
}

document.addEventListener('click', function handlePairEditDelete(event) {
  const deleteBtn = event.target.closest('.cp04-delete-pair-btn');

  if (deleteBtn) {
    event.preventDefault();
    event.stopPropagation();
    deletePairNode(deleteBtn);
    return;
  }

  const pairNode = event.target.closest('.cp04-editable-pair');

  if (pairNode) {
    event.preventDefault();
    event.stopPropagation();
    editPairNode(pairNode);
  }
}, true);

window.addEventListener('load', makeExistingPairsEditable);
window.addEventListener('hashchange', makeExistingPairsEditable);
document.addEventListener('click', () => setTimeout(makeExistingPairsEditable, 120));
setTimeout(makeExistingPairsEditable, 600);
setTimeout(makeExistingPairsEditable, 1400);

/* CLUB PÁDEL 04 · Fix definitivo para parejas añadidas manualmente */

function prepareAddedPairCard(card) {
  if (!card || card.dataset.cp04Prepared === 'true') return;

  const pairText =
    card.dataset.pairName ||
    Array.from(card.querySelectorAll('span,strong'))
      .map((el) => el.textContent)
      .join(' ')
      .match(/Pareja demo\s+\d+/i)?.[0] ||
    getPairNameFromNode(card) ||
    'Pareja añadida';

  card.dataset.pairName = pairText;
  card.dataset.cp04Prepared = 'true';
  card.classList.add('cp04-editable-pair');

  if (!card.querySelector('.cp04-delete-pair-btn')) {
    const deleteBtn = document.createElement('button');
    deleteBtn.type = 'button';
    deleteBtn.className = 'cp04-delete-pair-btn';
    deleteBtn.textContent = '🗑️';
    deleteBtn.setAttribute('aria-label', `Eliminar ${pairText}`);
    deleteBtn.dataset.pairName = pairText;
    card.appendChild(deleteBtn);
  }

  card.setAttribute('title', 'Clicar para editar esta pareja');
}

function prepareAllAddedPairCards() {
  document.querySelectorAll('.cp04-added-pair-card').forEach(prepareAddedPairCard);
}

const originalAddDemoPairCp04 = typeof addDemoPair === 'function' ? addDemoPair : null;

if (originalAddDemoPairCp04) {
  addDemoPair = function addDemoPairFixed() {
    originalAddDemoPairCp04();
    setTimeout(() => {
      prepareAllAddedPairCards();
      makeExistingPairsEditable();
    }, 80);
  };
}

document.addEventListener('click', function handleAddedPairCardDirectEdit(event) {
  const deleteBtn = event.target.closest('.cp04-delete-pair-btn');

  if (deleteBtn) {
    event.preventDefault();
    event.stopPropagation();
    deletePairNode(deleteBtn);
    return;
  }

  const addedCard = event.target.closest('.cp04-added-pair-card');

  if (addedCard) {
    event.preventDefault();
    event.stopPropagation();
    prepareAddedPairCard(addedCard);
    editAddedPairCard(addedCard);
  }
}, true);

function editAddedPairCard(card) {
  const oldName = card.dataset.pairName || getPairNameFromNode(card) || 'Pareja añadida';
  const currentName = card.dataset.customName || oldName;
  const newName = window.prompt('Editar nombre de la pareja:', currentName);

  if (!newName) return;

  const cleanName = newName.trim();
  if (!cleanName) return;

  card.dataset.customName = cleanName;
  card.dataset.pairName = cleanName;

  const span = card.querySelector('span');
  if (span) {
    span.textContent = cleanName;
  } else {
    card.innerHTML = card.innerHTML.replace(oldName, cleanName);
  }

  const deleteBtn = card.querySelector('.cp04-delete-pair-btn');
  if (deleteBtn) {
    deleteBtn.dataset.pairName = cleanName;
    deleteBtn.setAttribute('aria-label', `Eliminar ${cleanName}`);
  }

  saveEditedPair(oldName, cleanName);
  addControlLog(`${oldName} editada como ${cleanName}.`);
  showTournamentToast(`Pareja editada: ${cleanName}`);
}

setTimeout(prepareAllAddedPairCards, 300);
setTimeout(prepareAllAddedPairCards, 1000);
document.addEventListener('click', () => setTimeout(prepareAllAddedPairCards, 120));
