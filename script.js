const THEME_KEY = 'bfs_theme';

const PROJECT_HIDE = [
  'macro-creator',
  'bestfreesoftwareco',
  'bestfreesoftwareco.github.io'
];
const PROJECT_HIDE_SET = new Set(PROJECT_HIDE.map((id) => id.toLowerCase()));
const shouldHideProject = (id = '') => PROJECT_HIDE_SET.has(String(id).toLowerCase());

const PROJECTS_FALLBACK = [
  {
    id: 'main-macro-installer',
    name: 'Main Macro Installer',
    description: 'One installer to set up and manage the macro suite.',
    tags: ['Installer', 'Windows', 'Macros'],
    status: 'stable',
    category: 'installer',
    version: 'v2.3.0',
    lastUpdated: '2025-12-01',
    repoUrl: 'https://github.com/BestFreeSoftwareCo/Main-Macro-Installer',
    demoUrl: null,
    highlights: [
      'Main installer for the whole suite',
      'Simple setup',
      'Keeps everything in one place'
    ]
  },
  {
    id: 'rivals-afk-macro',
    name: 'Rivals AFK Macro',
    description: 'AFK macro for Rivals.',
    tags: ['Macros', 'Rivals'],
    status: 'stable',
    category: 'macro',
    version: 'v1.4.2',
    lastUpdated: '2025-11-28',
    repoUrl: 'https://github.com/BestFreeSoftwareCo/Rivals-Afk-Macro',
    demoUrl: null,
    highlights: [
      'Suite-compatible',
      'Simple to set up',
      'Runs with the installer'
    ]
  },
  {
    id: 'adopt-me-task-macro',
    name: 'Adopt Me Task Macro',
    description: 'Task automation macro for Adopt Me.',
    tags: ['Macros', 'Adopt Me'],
    status: 'stable',
    category: 'macro',
    version: 'v1.1.0',
    lastUpdated: '2025-10-22',
    repoUrl: 'https://github.com/BestFreeSoftwareCo/Adopt-Me-Task-Macro',
    demoUrl: null,
    highlights: [
      'Suite-compatible',
      'Task-focused',
      'Easy to run'
    ]
  }
];

function escapeHtml(str) {
  return String(str)
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#39;');
}

function normalizeTag(tag) {
  return String(tag || '').trim();
}

function uniq(arr) {
  return Array.from(new Set(arr));
}

function byStatusOrder(a, b) {
  const order = { stable: 0, 'in-progress': 1, planned: 2 };
  const av = order[a.status] ?? 99;
  const bv = order[b.status] ?? 99;
  if (av !== bv) return av - bv;
  return String(a.name || '').localeCompare(String(b.name || ''));
}

function parseDateStr(dateStr) {
  if (!dateStr) return null;
  const date = new Date(dateStr);
  return Number.isNaN(date.getTime()) ? null : date;
}

function formatDate(dateStr) {
  const date = parseDateStr(dateStr);
  if (!date) return '—';
  return date.toLocaleDateString(undefined, {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  });
}

function setTheme(theme) {
  document.documentElement.setAttribute('data-theme', theme);
  localStorage.setItem(THEME_KEY, theme);

  const toggleText = document.getElementById('themeToggleText');
  if (toggleText) toggleText.textContent = theme === 'light' ? 'Dark' : 'Light';
}

function getInitialTheme() {
  const saved = localStorage.getItem(THEME_KEY);
  if (saved === 'light' || saved === 'dark') return saved;

  const prefersLight = window.matchMedia && window.matchMedia('(prefers-color-scheme: light)').matches;
  return prefersLight ? 'light' : 'dark';
}

function copyToClipboard(text) {
  if (navigator.clipboard && navigator.clipboard.writeText) {
    return navigator.clipboard.writeText(text);
  }

  const ta = document.createElement('textarea');
  ta.value = text;
  ta.setAttribute('readonly', '');
  ta.style.position = 'absolute';
  ta.style.left = '-9999px';
  document.body.appendChild(ta);
  ta.select();
  document.execCommand('copy');
  document.body.removeChild(ta);
  return Promise.resolve();
}

function openModal() {
  const modal = document.getElementById('projectModal');
  if (!modal) return;
  modal.classList.add('is-open');
  modal.setAttribute('aria-hidden', 'false');
  document.body.style.overflow = 'hidden';

  const closeBtn = document.getElementById('modalClose');
  if (closeBtn) closeBtn.focus();
}

function closeModal() {
  const modal = document.getElementById('projectModal');
  if (!modal) return;
  modal.classList.remove('is-open');
  modal.setAttribute('aria-hidden', 'true');
  document.body.style.overflow = '';
}

function renderProjectCard(project) {
  const tags = Array.isArray(project.tags) ? project.tags : [];
  const tagPills = tags
    .slice(0, 4)
    .map((t) => `<span class="pill">${escapeHtml(t)}</span>`)
    .join('');

  const status = project.status ? String(project.status) : 'unknown';
  const highlights = Array.isArray(project.highlights) ? project.highlights : [];
  const highlightsHtml = highlights.length
    ? `<ul class="project-more-list">${highlights.map((h) => `<li>${escapeHtml(h)}</li>`).join('')}</ul>`
    : `<p class="project-more-empty">More details coming soon.</p>`;

  const metaRows = `
    <div>
      <div class="project-more-label">Status</div>
      <div class="project-more-value">${escapeHtml(status)}</div>
    </div>
    <div>
      <div class="project-more-label">Version</div>
      <div class="project-more-value">${escapeHtml(project.version || '—')}</div>
    </div>
    <div>
      <div class="project-more-label">Updated</div>
      <div class="project-more-value">${escapeHtml(project.lastUpdated ? formatDate(project.lastUpdated) : '—')}</div>
    </div>
  `;

  const version = project.version ? `Version ${escapeHtml(project.version)}` : '';
  const updated = project.lastUpdated ? `Updated ${formatDate(project.lastUpdated)}` : '';
  const category = project.category ? `<span class="pill">${escapeHtml(project.category)}</span>` : '';

  return `
    <article class="project-card" data-project-id="${escapeHtml(project.id)}">
      <div class="project-top">
        <h3 class="project-name">${escapeHtml(project.name)}</h3>
        <span class="badge">${escapeHtml(status)}</span>
      </div>
      <div class="tag-row" aria-label="Meta">
        ${category}
        ${version ? `<span class="pill">${version}</span>` : ''}
        ${updated ? `<span class="pill">${updated}</span>` : ''}
      </div>
      <p class="project-desc">${escapeHtml(project.description || '')}</p>
      <div class="tag-row" aria-label="Tags">${tagPills}</div>
      <div class="project-actions">
        <div class="project-btns">
          <button class="btn small" type="button" data-action="details" data-project-id="${escapeHtml(project.id)}">Details</button>
          <button class="btn ghost small" type="button" data-action="expand" data-project-id="${escapeHtml(project.id)}" aria-expanded="false">See more</button>
        </div>
        <div class="project-links">
          ${project.repoUrl ? `<a class="link" href="${escapeHtml(project.repoUrl)}" target="_blank" rel="noreferrer">Repo</a>` : ''}
          ${project.demoUrl ? ` <span class="sep" aria-hidden="true">·</span> <a class="link" href="${escapeHtml(project.demoUrl)}" target="_blank" rel="noreferrer">Demo</a>` : ''}
        </div>
      </div>
      <div class="project-more" aria-hidden="true">
        <div class="project-more-meta">
          ${metaRows}
        </div>
        <div class="project-more-body">
          ${highlightsHtml}
          ${
            project.repoUrl
              ? `<a class="link" href="${escapeHtml(project.repoUrl)}" target="_blank" rel="noreferrer">Open repository</a>`
              : ''
          }
        </div>
      </div>
    </article>
  `;
}

function renderProjectModal(project) {
  const title = document.getElementById('projectModalTitle');
  const body = document.getElementById('projectModalBody');
  const actions = document.getElementById('projectModalActions');
  if (!title || !body || !actions) return;

  title.textContent = project.name || 'Project';

  const tags = Array.isArray(project.tags) ? project.tags : [];
  const highlights = Array.isArray(project.highlights) ? project.highlights : [];

  const tagsHtml = tags.length
    ? `<div class="tag-row" aria-label="Tags">${tags.map((t) => `<span class="pill">${escapeHtml(t)}</span>`).join('')}</div>`
    : '';

  const highlightsHtml = highlights.length
    ? `<div><div class="muted" style="margin-bottom:8px;">Highlights</div><ul style="margin:0; padding-left:18px;">${highlights
        .slice(0, 8)
        .map((h) => `<li>${escapeHtml(h)}</li>`)
        .join('')}</ul></div>`
    : '';

  body.innerHTML = `
    <div style="display:flex; gap:10px; flex-wrap:wrap; align-items:center; margin-bottom:10px;">
      <span class="badge">${escapeHtml(project.status || 'unknown')}</span>
      ${project.category ? `<span class="pill">${escapeHtml(project.category)}</span>` : ''}
      ${project.version ? `<span class="pill">Version ${escapeHtml(project.version)}</span>` : ''}
      <span class="mono">${escapeHtml(project.id || '')}</span>
    </div>
    <div style="margin-bottom:12px;">${escapeHtml(project.description || '')}</div>
    ${project.lastUpdated ? `<div class="muted" style="margin-bottom:12px;">Last updated: ${formatDate(project.lastUpdated)}</div>` : ''}
    ${tagsHtml}
    ${highlightsHtml}
  `;

  const repoBtn = project.repoUrl
    ? `<a class="btn" href="${escapeHtml(project.repoUrl)}" target="_blank" rel="noreferrer">Open repo</a>`
    : '';
  const demoBtn = project.demoUrl
    ? `<a class="btn primary" href="${escapeHtml(project.demoUrl)}" target="_blank" rel="noreferrer">Open demo</a>`
    : '';
  const copyBtn = project.repoUrl
    ? `<button class="btn" type="button" data-action="copy" data-copy="${escapeHtml(project.repoUrl)}">Copy repo URL</button>`
    : '';

  actions.innerHTML = `${demoBtn}${repoBtn}${copyBtn}`;
}

function shapeProjects(data) {
  return (Array.isArray(data) ? data : PROJECTS_FALLBACK)
    .filter((p) => p && typeof p === 'object' && !shouldHideProject(p.id || p.name))
    .map((p) => ({
      id: p.id || '',
      name: p.name || '',
      description: p.description || '',
      tags: Array.isArray(p.tags) ? p.tags.map(normalizeTag).filter(Boolean) : [],
      status: p.status || 'unknown',
      category: p.category || 'macro',
      version: p.version || '',
      lastUpdated: p.lastUpdated || '',
      repoUrl: p.repoUrl || null,
      demoUrl: p.demoUrl || null,
      highlights: Array.isArray(p.highlights) ? p.highlights : []
    }))
    .sort(byStatusOrder);
}

async function loadProjects() {
  try {
    const res = await fetch('projects.json', { cache: 'no-store' });
    if (!res.ok) throw new Error(`Failed to load projects.json (${res.status})`);
    const data = await res.json();
    return shapeProjects(data);
  } catch (error) {
    console.warn('Falling back to embedded project data:', error);
    return shapeProjects(PROJECTS_FALLBACK);
  }
}

async function loadGithubRepos() {
  try {
    const res = await fetch('https://api.github.com/users/BestFreeSoftwareCo/repos?per_page=100');
    if (!res.ok) throw new Error(`GitHub API error: ${res.status}`);
    const repos = await res.json();
    if (!Array.isArray(repos)) return [];
    return repos
      .filter((repo) => !shouldHideProject(repo.name || repo.full_name))
      .map((repo) => ({
      id: repo.name || repo.full_name || '',
      name: repo.name || 'Untitled repo',
      description: repo.description || 'In development',
      tags: ['GitHub'],
      status: repo.archived ? 'archived' : repo.private ? 'private' : 'in-progress',
      category: 'macro',
      version: repo.default_branch ? `branch: ${repo.default_branch}` : '',
      lastUpdated: repo.pushed_at || repo.updated_at || '',
      repoUrl: repo.html_url || null,
      demoUrl: null,
      highlights: []
    }));
  } catch (error) {
    console.warn('Unable to fetch GitHub repositories:', error);
    return [];
  }
}

function mergeProjects(localProjects, repoProjects) {
  const map = new Map();
  localProjects.forEach((p) => {
    if (shouldHideProject(p.id || p.name)) return;
    map.set((p.id || p.name || '').toLowerCase(), p);
  });
  repoProjects.forEach((repo) => {
    if (shouldHideProject(repo.id || repo.name)) return;
    const key = (repo.id || repo.name || '').toLowerCase();
    if (!map.has(key)) {
      map.set(key, repo);
    }
  });
  return Array.from(map.values()).sort(byStatusOrder);
}

async function loadAllProjects() {
  const [local, repos] = await Promise.allSettled([loadProjects(), loadGithubRepos()]);
  const localProjects = local.status === 'fulfilled' ? local.value : shapeProjects(PROJECTS_FALLBACK);
  const repoProjects = repos.status === 'fulfilled' ? repos.value : [];
  return mergeProjects(localProjects, repoProjects);
}

function attachProjectsUI(allProjects) {
  const grid = document.getElementById('projectsGrid');
  const search = document.getElementById('projectSearch');
  const status = document.getElementById('statusFilter');
  const category = document.getElementById('categoryFilter');
  const sortSelect = document.getElementById('sortProjects');
  const clear = document.getElementById('clearFilters');
  const tagFilters = document.getElementById('tagFilters');
  const count = document.getElementById('projectsCount');

  if (!grid || !search || !status || !clear || !tagFilters || !count || !category || !sortSelect) return;

  const projects = allProjects.filter(
    (project) => !shouldHideProject(project.id || project.name)
  );

  const allTags = uniq(
    projects.flatMap((p) => (Array.isArray(p.tags) ? p.tags : []))
  ).sort((a, b) => String(a).localeCompare(String(b)));

  for (const tag of allTags) {
    const btn = document.createElement('button');
    btn.className = 'chip';
    btn.type = 'button';
    btn.dataset.tag = tag;
    btn.textContent = tag;
    tagFilters.appendChild(btn);
  }

  const state = {
    q: '',
    status: 'all',
    tag: 'all',
    category: 'all',
    sort: 'status'
  };

  function setActiveChip(tag) {
    const chips = tagFilters.querySelectorAll('.chip');
    chips.forEach((c) => c.classList.toggle('is-active', c.dataset.tag === tag));
  }

  function matches(project) {
    const q = state.q.trim().toLowerCase();
    if (q) {
      const hay = `${project.name} ${project.description} ${(project.tags || []).join(' ')}`.toLowerCase();
      if (!hay.includes(q)) return false;
    }

    if (state.status !== 'all' && String(project.status) !== state.status) return false;
    if (state.tag !== 'all') {
      const tags = Array.isArray(project.tags) ? project.tags : [];
      if (!tags.includes(state.tag)) return false;
    }
    if (state.category !== 'all' && String(project.category) !== state.category) return false;

    return true;
  }

  function sortProjects(list) {
    if (state.sort === 'recent') {
      return [...list].sort((a, b) => {
        const da = parseDateStr(b.lastUpdated) || 0;
        const db = parseDateStr(a.lastUpdated) || 0;
        return da - db;
      });
    }
    if (state.sort === 'name') {
      return [...list].sort((a, b) => a.name.localeCompare(b.name));
    }
    // default: status order
    return [...list].sort(byStatusOrder);
  }

  function render() {
    const filtered = sortProjects(projects.filter(matches));
    grid.innerHTML = filtered.map(renderProjectCard).join('');
    count.textContent = `${filtered.length} / ${projects.length} shown`;
  }

  search.addEventListener('input', () => {
    state.q = search.value;
    render();
  });

  status.addEventListener('change', () => {
    state.status = status.value;
    render();
  });

  category.addEventListener('change', () => {
    state.category = category.value;
    render();
  });

  sortSelect.addEventListener('change', () => {
    state.sort = sortSelect.value;
    render();
  });

  clear.addEventListener('click', () => {
    state.q = '';
    state.status = 'all';
    state.tag = 'all';
    state.category = 'all';
    state.sort = 'status';
    search.value = '';
    status.value = 'all';
    category.value = 'all';
    sortSelect.value = 'status';
    setActiveChip('all');
    render();
  });

  tagFilters.addEventListener('click', (e) => {
    const btn = e.target && e.target.closest ? e.target.closest('button[data-tag]') : null;
    if (!btn) return;
    state.tag = btn.dataset.tag || 'all';
    setActiveChip(state.tag);
    render();
  });

  grid.addEventListener('click', (e) => {
    const expandBtn = e.target && e.target.closest ? e.target.closest('button[data-action="expand"]') : null;
    if (expandBtn) {
      const card = expandBtn.closest('.project-card');
      if (!card) return;
      const wasOpen = card.classList.contains('is-expanded');

      document.querySelectorAll('.project-card.is-expanded').forEach((openCard) => {
        openCard.classList.remove('is-expanded');
        const btn = openCard.querySelector('button[data-action="expand"]');
        const panel = openCard.querySelector('.project-more');
        if (btn) {
          btn.setAttribute('aria-expanded', 'false');
          btn.textContent = 'See more';
        }
        if (panel) panel.setAttribute('aria-hidden', 'true');
      });

      if (!wasOpen) {
        const panel = card.querySelector('.project-more');
        card.classList.add('is-expanded');
        if (expandBtn) {
          expandBtn.setAttribute('aria-expanded', 'true');
          expandBtn.textContent = 'Hide details';
        }
        if (panel) panel.setAttribute('aria-hidden', 'false');
      }

      return;
    }

    const btn = e.target && e.target.closest ? e.target.closest('button[data-action="details"]') : null;
    if (!btn) return;
    const id = btn.dataset.projectId;
    const project = projects.find((p) => p.id === id);
    if (!project) return;
    renderProjectModal(project);
    openModal();
  });

  const modal = document.getElementById('projectModal');
  const modalClose = document.getElementById('modalClose');
  if (modal) {
    modal.addEventListener('click', (e) => {
      const closeTarget = e.target && e.target.closest ? e.target.closest('[data-modal-close="true"]') : null;
      if (closeTarget) closeModal();

      const copyBtn = e.target && e.target.closest ? e.target.closest('[data-action="copy"]') : null;
      if (copyBtn && copyBtn.dataset.copy) {
        copyToClipboard(copyBtn.dataset.copy).catch(() => {});
      }
    });
  }

  if (modalClose) modalClose.addEventListener('click', closeModal);

  document.addEventListener('keydown', (e) => {
    const isOpen = modal && modal.classList.contains('is-open');
    if (!isOpen) return;
    if (e.key === 'Escape') closeModal();
  });

  setActiveChip('all');
  render();
}

function renderFeaturedRelease(projects) {
  const versionEl = document.getElementById('releaseVersion');
  const dateEl = document.getElementById('releaseDate');
  const notesEl = document.getElementById('releaseNotes');
  const primaryBtn = document.getElementById('releasePrimary');
  const repoBtn = document.getElementById('releaseRepo');
  if (!versionEl || !dateEl || !notesEl || !primaryBtn || !repoBtn) return;

  const installer = projects.find((p) => p.category === 'installer') || projects[0];
  if (!installer) return;

  versionEl.textContent = installer.version || installer.name;
  dateEl.textContent = formatDate(installer.lastUpdated);
  notesEl.textContent = installer.highlights?.join(' · ') || installer.description || 'Latest update available.';

  const releaseUrl = installer.repoUrl ? `${installer.repoUrl}/releases/latest` : '#';
  primaryBtn.href = releaseUrl;
  repoBtn.href = installer.repoUrl || '#';
}

function enableSmoothAnchors() {
  const links = document.querySelectorAll('a[href^="#"]');
  links.forEach((link) => {
    link.addEventListener('click', (event) => {
      const hash = link.getAttribute('href');
      if (!hash || hash === '#') return;
      const target = document.querySelector(hash);
      if (!target) return;

      event.preventDefault();
      if (typeof target.scrollIntoView === 'function') {
        target.scrollIntoView({ behavior: 'smooth', block: 'start' });
      } else {
        window.scrollTo({ top: target.offsetTop - 80, behavior: 'smooth' });
      }
    });
  });
}

function enableRevealAnimations() {
  const elements = document.querySelectorAll('.reveal');
  if (!elements.length) return;

  const prefersReduced = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (!('IntersectionObserver' in window) || prefersReduced) {
    elements.forEach((el) => el.classList.add('is-visible'));
    return;
  }

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-visible');
          observer.unobserve(entry.target);
        }
      });
    },
    {
      rootMargin: '0px 0px -10% 0px',
      threshold: 0.15
    }
  );

  elements.forEach((el) => observer.observe(el));
}

const POINTER_GLOW_SELECTOR = [
  '.btn',
  '.project-card',
  '.tile',
  '.about-pane',
  '.about-main',
  '.installer-card',
  '.adv-card',
  '.contact-item',
  '.meta-card',
  '.point',
  '.testi-card',
  '.faq-item',
  '.release-card'
].join(', ');

function enablePointerGlow() {
  const setPos = (el, event) => {
    const rect = el.getBoundingClientRect();
    const x = ((event.clientX - rect.left) / rect.width) * 100;
    const y = ((event.clientY - rect.top) / rect.height) * 100;
    el.style.setProperty('--mx', `${x}%`);
    el.style.setProperty('--my', `${y}%`);
  };

  document.addEventListener('pointermove', (event) => {
    const target = event.target.closest(POINTER_GLOW_SELECTOR);
    if (!target) return;
    setPos(target, event);
  });

  document.addEventListener(
    'pointerout',
    (event) => {
      const target = event.target.closest(POINTER_GLOW_SELECTOR);
      if (!target) return;
      target.style.removeProperty('--mx');
      target.style.removeProperty('--my');
    },
    true
  );
}

(function init() {
  document.getElementById('year').textContent = new Date().getFullYear();

  const theme = getInitialTheme();
  setTheme(theme);

  const themeToggle = document.getElementById('themeToggle');
  if (themeToggle) {
    themeToggle.addEventListener('click', () => {
      const current = document.documentElement.getAttribute('data-theme') || 'dark';
      setTheme(current === 'dark' ? 'light' : 'dark');
    });
  }

  enableSmoothAnchors();
  enableRevealAnimations();
  enablePointerGlow();

  loadAllProjects()
    .then((projects) => {
      attachProjectsUI(projects);
      renderFeaturedRelease(projects);
    })
    .catch(() => {
      const grid = document.getElementById('projectsGrid');
      const count = document.getElementById('projectsCount');
      if (count) count.textContent = 'Projects failed to load.';
      if (grid) {
        grid.innerHTML = `
          <article class="tile">
            <h3>Couldn’t load projects</h3>
            <p>Please ensure <span class="mono">projects.json</span> exists next to <span class="mono">index.html</span>.</p>
          </article>
        `;
      }
    });
})();
