const windows = new Map([...document.querySelectorAll('[data-window]')].map(element => [element.dataset.window, {element, open: !element.hidden, minimized: false, timer: null}]));
const desktop = document.querySelector('#desktop');
const tasks = document.querySelector('#task-buttons');
const menu = document.querySelector('#start-menu');
const startButton = document.querySelector('#start-button');
const status = document.querySelector('#desktop-status');
const dialog = document.querySelector('#project-dialog');
let active = 'projects';
let layer = 20;
let projectData = null;
let lastProjectButton = null;
const reducedMotion = matchMedia('(prefers-reduced-motion: reduce)');

function announce(message) { status.textContent = message; }
function setMenu(open) {
  menu.hidden = !open;
  startButton.setAttribute('aria-expanded', String(open));
}
function renderTasks() {
  tasks.replaceChildren();
  windows.forEach((state, key) => {
    if (!state.open) return;
    const button = document.createElement('button');
    button.type = 'button';
    button.title = state.element.querySelector('h2').textContent.trim();
    button.setAttribute('aria-label', `${state.minimized ? 'Restaurar' : 'Activar'} ${button.title}`);
    button.setAttribute('aria-pressed', String(active === key && !state.minimized));
    button.classList.toggle('is-active', active === key && !state.minimized);
    const svg = state.element.querySelector('h2 svg').cloneNode(true);
    const label = document.createElement('span');
    label.className = 'task-label';
    label.textContent = button.title;
    button.append(svg, label);
    button.addEventListener('click', () => {
      if (active === key && !state.minimized) hideWindow(key, true);
      else openWindow(key, true);
    });
    tasks.append(button);
  });
}
function focusWindow(key, focusHeader = false) {
  const state = windows.get(key);
  if (!state || state.element.hidden) return;
  active = key;
  state.element.style.zIndex = ++layer;
  windows.forEach(({element}, id) => element.classList.toggle('active-window', id === key));
  if (focusHeader) state.element.querySelector('.titlebar').focus({preventScroll: true});
  renderTasks();
}
function openWindow(key, focusHeader = true) {
  setMenu(false);
  if (key === 'github') {
    window.open('https://github.com/Rokkaku-1', '_blank', 'noopener,noreferrer');
    return;
  }
  const state = windows.get(key);
  if (!state) return;
  clearTimeout(state.timer);
  state.open = true;
  state.minimized = false;
  state.element.hidden = false;
  state.element.classList.remove('closing', 'minimizing');
  state.element.classList.add('is-open');
  focusWindow(key, focusHeader);
  announce(`${state.element.querySelector('h2').textContent.trim()} abierta`);
}
function hideWindow(key, minimize) {
  const state = windows.get(key);
  if (!state || state.element.hidden) return;
  clearTimeout(state.timer);
  state.minimized = minimize;
  state.open = minimize;
  state.element.classList.add(minimize ? 'minimizing' : 'closing');
  const hide = () => {
    state.element.hidden = true;
    state.element.classList.remove('is-open', 'closing', 'minimizing');
    const remaining = [...windows].filter(([id, s]) => id !== key && s.open && !s.minimized && !s.element.hidden).sort((a,b) => Number(b[1].element.style.zIndex) - Number(a[1].element.style.zIndex));
    if (remaining.length) focusWindow(remaining[0][0], true);
    else {
      active = null;
      renderTasks();
      document.querySelector(`[data-open="${key}"]`)?.focus({preventScroll:true});
    }
  };
  if (document.body.classList.contains('motion-paused') || reducedMotion.matches) hide();
  else state.timer = setTimeout(hide, minimize ? 180 : 140);
  renderTasks();
}
function clampPosition(element, left, top) {
  const maxLeft = Math.max(0, desktop.clientWidth - element.offsetWidth);
  const maxTop = Math.max(0, desktop.clientHeight - 80);
  element.style.left = `${Math.min(maxLeft, Math.max(0, left))}px`;
  element.style.top = `${Math.min(maxTop, Math.max(0, top))}px`;
}
windows.forEach((state, key) => {
  const element = state.element;
  const bar = element.querySelector('.titlebar');
  bar.tabIndex = 0;
  bar.setAttribute('aria-label', `${element.querySelector('h2').textContent.trim()}. Arrastra para mover o usa las teclas de flecha.`);
  element.addEventListener('pointerdown', () => { if (active !== key) focusWindow(key); });
  element.addEventListener('focusin', () => { if (active !== key) focusWindow(key); });
  element.querySelectorAll('[data-action]').forEach(button => button.addEventListener('click', () => {
    if (button.dataset.action === 'maximize') {
      const maximized = element.classList.toggle('maximized');
      button.setAttribute('aria-label', `${maximized ? 'Restaurar tamaño de' : 'Maximizar'} ${element.querySelector('h2').textContent.trim()}`);
      focusWindow(key);
    } else hideWindow(key, button.dataset.action === 'minimize');
  }));
  bar.addEventListener('keydown', event => {
    if (event.target !== bar || !['ArrowLeft','ArrowRight','ArrowUp','ArrowDown'].includes(event.key)) return;
    event.preventDefault();
    if (element.classList.contains('maximized')) return;
    const step = event.shiftKey ? 30 : 10;
    clampPosition(element, element.offsetLeft + (event.key === 'ArrowRight' ? step : event.key === 'ArrowLeft' ? -step : 0), element.offsetTop + (event.key === 'ArrowDown' ? step : event.key === 'ArrowUp' ? -step : 0));
  });
  let drag = null;
  bar.addEventListener('pointerdown', event => {
    if (event.target.closest('button') || element.classList.contains('maximized') || matchMedia('(max-width:700px)').matches || event.button !== 0) return;
    drag = {x:event.clientX,y:event.clientY,left:element.offsetLeft,top:element.offsetTop};
    bar.setPointerCapture(event.pointerId);
    element.classList.add('dragging');
    focusWindow(key);
  });
  bar.addEventListener('pointermove', event => {
    if (!drag) return;
    clampPosition(element, drag.left + event.clientX - drag.x, drag.top + event.clientY - drag.y);
  });
  const endDrag = () => { drag = null; element.classList.remove('dragging'); };
  bar.addEventListener('pointerup', endDrag);
  bar.addEventListener('pointercancel', endDrag);
  bar.addEventListener('lostpointercapture', endDrag);
});
document.querySelectorAll('[data-open]').forEach(button => button.addEventListener('click', () => openWindow(button.dataset.open)));
startButton.addEventListener('click', () => setMenu(menu.hidden));
document.addEventListener('pointerdown', event => {
  if (!menu.hidden && !menu.contains(event.target) && !startButton.contains(event.target)) setMenu(false);
});
document.addEventListener('keydown', event => {
  if (event.key === 'Escape' && !menu.hidden) { setMenu(false); startButton.focus(); }
});
document.querySelectorAll('[data-filter]').forEach(button => button.addEventListener('click', () => {
  const filter = button.dataset.filter;
  document.querySelectorAll('[data-filter]').forEach(control => {
    control.classList.toggle('selected', control === button);
    control.setAttribute('aria-pressed', String(control === button));
  });
  let count = 0;
  document.querySelectorAll('[data-project]').forEach(file => {
    const entry = projectData?.[Number(file.dataset.project)];
    const visible = filter === 'all' || (filter === 'github' ? !!entry?.repo : !!entry?.demo);
    file.hidden = !visible;
    if (visible) count++;
  });
  document.querySelector('#project-count').textContent = `${count} objetos`;
}));
const dataReady = fetch('projects.json').then(response => {
  if (!response.ok) throw Error('No se pudo cargar el catálogo');
  return response.json();
}).then(data => { projectData = data; return data; });
dataReady.catch(() => announce('No se pudo cargar el catálogo. Recarga la página para volver a intentarlo.'));
const esc = value => String(value).replace(/[&<>"']/g, char => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[char]));
document.querySelectorAll('[data-project]').forEach(button => button.addEventListener('click', async () => {
  lastProjectButton = button;
  try {
    const entries = await dataReady;
    const project = entries[Number(button.dataset.project)];
    document.querySelector('#project-title').textContent = `${project.name} — Propiedades`;
    document.querySelector('#project-details').innerHTML = `<div class="project-detail-art art-${esc(project.theme)}" aria-hidden="true"><strong>${esc(project.wordmark)}</strong></div><div class="project-detail-copy"><small>${esc(project.category)}</small><h3>${esc(project.name)}</h3><p${project.unavailable?' class="project-warning"':''}>${esc(project.description)}</p><div class="detail-tags">${project.tags.map(tag=>`<span>${esc(tag)}</span>`).join('')}</div><div class="detail-links">${project.demo?`<a class="classic-button" href="${esc(project.demo)}" target="_blank" rel="noopener noreferrer">${project.unavailable?'Revisar enlace · 404':'Abrir sitio'} ↗</a>`:'<span class="repo-note">Demo sin enlace verificado.</span>'}${project.repo?`<a class="classic-button" href="https://github.com/Rokkaku-1/${esc(project.repo)}" target="_blank" rel="noopener noreferrer">Ver en GitHub ↗</a>`:''}</div>${project.repo?'<p class="repo-note">Código fuente público disponible en GitHub.</p>':''}</div>`;
    dialog.showModal();
  } catch {
    announce('El proyecto no se pudo cargar. Recarga la página para volver a intentarlo.');
  }
}));
// Wait for the catalogue before enabling filters, so a fast click cannot hide valid files.
document.querySelectorAll('[data-filter]').forEach(button => { button.disabled = true; });
dataReady.then(() => document.querySelectorAll('[data-filter]').forEach(button => { button.disabled = false; })).catch(() => {});
document.querySelector('#close-project').addEventListener('click', () => dialog.close());
dialog.addEventListener('click', event => {
  if (event.target !== dialog) return;
  const bounds = dialog.getBoundingClientRect();
  if (event.clientX < bounds.left || event.clientX > bounds.right || event.clientY < bounds.top || event.clientY > bounds.bottom) dialog.close();
});
dialog.addEventListener('close', () => lastProjectButton?.focus({preventScroll:true}));
document.querySelector('#copy-email').addEventListener('click', async () => {
  try {
    await navigator.clipboard.writeText('jeduardo.berrospi@gmail.com');
    document.querySelector('#copy-status').textContent = 'Correo copiado. ¡Hablemos!';
  } catch {
    document.querySelector('#email').select();
    document.querySelector('#copy-status').textContent = 'Selecciona y copia el correo con tu teclado.';
  }
});
function setMotion(paused) {
  document.body.classList.toggle('motion-paused', paused);
  document.querySelector('#motion-toggle').textContent = paused ? '▶' : 'Ⅱ';
  document.querySelector('#motion-toggle').setAttribute('aria-label', paused ? 'Activar animaciones' : 'Pausar animaciones');
  document.querySelector('#motion-toggle').title = paused ? 'Activar animaciones' : 'Pausar animaciones';
  document.querySelectorAll('[data-toggle-motion]').forEach(button => { button.textContent = paused ? 'Activar animaciones' : 'Pausar animaciones'; });
  try { localStorage.setItem('je-motion-paused', String(paused)); } catch {}
}
document.querySelectorAll('#motion-toggle,[data-toggle-motion]').forEach(button => button.addEventListener('click', () => setMotion(!document.body.classList.contains('motion-paused'))));
try { setMotion(localStorage.getItem('je-motion-paused') === 'true'); } catch { setMotion(false); }
function updateClock() {
  const now = new Date();
  document.querySelector('#clock').textContent = new Intl.DateTimeFormat('es-CO',{hour:'2-digit',minute:'2-digit',hour12:false,timeZone:'America/Bogota'}).format(now);
  document.querySelector('#clock').dateTime = now.toISOString();
}
updateClock();
setInterval(updateClock, 30000);
window.addEventListener('resize', () => {
  windows.forEach(({element}) => {
    // Return to the responsive CSS layout instead of keeping desktop drag coordinates.
    if (matchMedia('(max-width:700px)').matches) { element.style.left = ''; element.style.top = ''; }
    else if (element.style.left && !element.classList.contains('maximized')) clampPosition(element,element.offsetLeft,element.offsetTop);
  });
});
focusWindow('design');
if (location.hash === '#sobre-mi') openWindow('about', false);
if (location.hash === '#contacto') openWindow('contact', false);
