const THEME_KEY = 'bfs_theme';
const FILTERS_KEY = 'bfs_projects_filters';
const ANNOUNCEMENT_KEY = 'bfs_announcement_dismissed';
const MOBILE_BREAKPOINT = '(max-width: 720px)';

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
    description:
      'This Rivals AFK Macro is a safe, Python-based tool that simulates basic keyboard and mouse inputs to prevent AFK kicking. It is not a virus or malware, uses open-source readable code, has no exploits, injections, or memory editing, and follows Roblox and Rivals ToS by only automating normal inputs.',
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
    description:
      'This Adopt Me Task Macro is a safe, Python-based tool that automates simple tasks using normal keyboard and mouse inputs. It is not a virus or malware, uses open-source readable code, has no exploits or injections, and follows Roblox ToS by not modifying the game or interfering with its systems.',
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
  },
  {
    id: 'forge-auto-mine',
    name: 'Forge Macro — Auto Mine v1',
    description:
      'Automates Forge mining loops with safe, Python-based mouse and keyboard inputs. No exploits, injections, or memory editing—just repeatable movements that align with Roblox ToS.',
    tags: ['Macros', 'Forge'],
    status: 'stable',
    category: 'macro',
    version: 'v1.0.0',
    lastUpdated: '2025-12-22',
    repoUrl: 'https://github.com/BestFreeSoftwareCo/Forge-Macro---Auto-Mine-v1-',
    demoUrl: null,
    highlights: [
      'Auto-mines Forge nodes without AFK kicks',
      'Readable, open-source Python',
      'Pairs with the main installer'
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

function addMqListener(mediaQueryList, handler) {
  if (!mediaQueryList || typeof handler !== 'function') return;
  if (typeof mediaQueryList.addEventListener === 'function') {
    mediaQueryList.addEventListener('change', handler);
  } else if (typeof mediaQueryList.addListener === 'function') {
    mediaQueryList.addListener(handler);
  }
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
    ? `<div class="project-more-section">
        <div class="project-more-label muted">Highlights</div>
        <ul class="project-more-list">${highlights.map((h) => `<li>${escapeHtml(h)}</li>`).join('')}</ul>
      </div>`
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
        <div class="project-more-grid">
          <div class="project-more-meta">
            ${metaRows}
          </div>
          <div class="project-more-body">
            <p class="project-more-desc">${escapeHtml(project.description || 'More info coming soon.')}</p>
            ${highlightsHtml}
            ${
              project.repoUrl
                ? `<a class="project-more-link" href="${escapeHtml(
                    project.repoUrl
                  )}/releases/latest" target="_blank" rel="noreferrer">View latest release notes →</a>`
                : ''
            }
          </div>
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

function readFilterPrefs() {
  try {
    const raw = localStorage.getItem(FILTERS_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    if (parsed && typeof parsed === 'object') return parsed;
    return null;
  } catch (error) {
    console.warn('Unable to read filter prefs', error);
    return null;
  }
}

function writeFilterPrefs(state) {
  try {
    localStorage.setItem(
      FILTERS_KEY,
      JSON.stringify({
        q: state.q || '',
        status: state.status || 'all',
        tag: state.tag || 'all',
        category: state.category || 'all',
        sort: state.sort || 'status'
      })
    );
  } catch (error) {
    console.warn('Unable to persist filter prefs', error);
  }
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
  const toast = document.getElementById('projectsToast');
  const filtersPanel = document.getElementById('projectsFilters');
  const filtersToggle = document.getElementById('filtersToggle');

  if (
    !grid ||
    !search ||
    !status ||
    !clear ||
    !tagFilters ||
    !count ||
    !category ||
    !sortSelect ||
    !filtersPanel ||
    !filtersToggle
  )
    return;

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

  const savedFilters = readFilterPrefs();
  const state = {
    q: savedFilters?.q || '',
    status: savedFilters?.status || 'all',
    tag: savedFilters?.tag || 'all',
    category: savedFilters?.category || 'all',
    sort: savedFilters?.sort || 'status'
  };

  search.value = state.q;
  status.value = state.status;
  category.value = state.category;
  sortSelect.value = state.sort;

  function setActiveChip(tag) {
    const chips = tagFilters.querySelectorAll('.chip');
    chips.forEach((c) => c.classList.toggle('is-active', c.dataset.tag === tag));
  }

  const mq = window.matchMedia(MOBILE_BREAKPOINT);
  let filtersOpen = !mq.matches;

  function setFiltersVisibility(isOpen) {
    filtersOpen = isOpen;
    filtersPanel.classList.toggle('is-collapsed', !isOpen);
    filtersToggle.setAttribute('aria-expanded', String(isOpen));
    filtersToggle.textContent = isOpen ? 'Hide filters' : 'Show filters';
  }

  setFiltersVisibility(filtersOpen);

  filtersToggle.addEventListener('click', () => {
    setFiltersVisibility(!filtersOpen);
  });

  addMqListener(mq, (event) => {
    setFiltersVisibility(!event.matches);
  });

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

  function updateToast(filteredLength) {
    if (!toast) return;
    const details = [];
    if (state.q.trim()) details.push(`search “${state.q.trim()}”`);
    if (state.status !== 'all') details.push(`status = ${state.status}`);
    if (state.category !== 'all') details.push(`category = ${state.category}`);
    if (state.tag !== 'all') details.push(`tag = ${state.tag}`);
    if (state.sort !== 'status') details.push(`sorted by ${state.sort}`);

    if (!filteredLength) {
      toast.textContent = 'No projects match those filters. Try clearing or switching tags.';
      return;
    }

    toast.textContent = details.length
      ? `Filtered by ${details.join(', ')}`
      : 'Showing every public project.';
  }

  function render() {
    const filtered = sortProjects(projects.filter(matches));
    if (!filtered.length) {
      grid.innerHTML = `
        <article class="project-empty">
          <h3>No projects found</h3>
          <p>Adjust your filters or clear them to see the full suite.</p>
        </article>
      `;
    } else {
      grid.innerHTML = filtered.map(renderProjectCard).join('');
    }

    count.textContent = `${filtered.length} / ${projects.length} in view`;
    updateToast(filtered.length);
    writeFilterPrefs(state);
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

  setActiveChip(state.tag);
  render();
}

function renderFeaturedRelease(projects) {
  const nameEl = document.getElementById('releaseName');
  const badgeEl = document.getElementById('releaseBadge');
  const versionEl = document.getElementById('releaseVersion');
  const dateEl = document.getElementById('releaseDate');
  const notesEl = document.getElementById('releaseNotes');
  const highlightsEl = document.getElementById('releaseHighlights');
  const primaryBtn = document.getElementById('releasePrimary');
  const repoBtn = document.getElementById('releaseRepo');
  if (!nameEl || !badgeEl || !versionEl || !dateEl || !notesEl || !highlightsEl || !primaryBtn || !repoBtn) return;

  const installer = projects.find((p) => p.category === 'installer') || projects[0];
  if (!installer) return;

  nameEl.textContent = installer.name || 'Featured release';
  versionEl.textContent = installer.version || installer.name;
  dateEl.textContent = formatDate(installer.lastUpdated);
  notesEl.textContent = installer.description || 'Latest update available.';

  const badgeText = (() => {
    const updatedDate = parseDateStr(installer.lastUpdated);
    if (!updatedDate) return 'Stable';
    const diffDays = (Date.now() - updatedDate.getTime()) / (1000 * 60 * 60 * 24);
    if (diffDays <= 7) return 'New';
    if (diffDays <= 21) return 'Updated';
    return 'Stable';
  })();
  badgeEl.textContent = badgeText;

  const highlightItems = Array.isArray(installer.highlights) && installer.highlights.length
    ? installer.highlights.slice(0, 3).map((item) => `<li>${escapeHtml(item)}</li>`).join('')
    : '<li>Installer keeps all macros in sync.</li>';
  highlightsEl.innerHTML = highlightItems;

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

const POINTER_GLOW_TARGETS = [
  '.btn',
  '.chip',
  '.project-card',
  '.tile',
  '.about-pane',
  '.about-main',
  '.installer-card',
  '.adv-card',
  '.contact-panel',
  '.contact-tile',
  '.contact-badge',
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
    const target = event.target.closest(POINTER_GLOW_TARGETS);
    if (!target) return;
    setPos(target, event);
  });

  document.addEventListener(
    'pointerout',
    (event) => {
      const target = event.target.closest(POINTER_GLOW_TARGETS);
      if (!target) return;
      target.style.removeProperty('--mx');
      target.style.removeProperty('--my');
    },
    true
  );
}

function enableAnnouncement() {
  const bar = document.getElementById('announcement');
  const closeBtn = document.getElementById('announcementClose');
  if (!bar || !closeBtn) return;

  const dismissed = localStorage.getItem(ANNOUNCEMENT_KEY);
  if (dismissed === '1') {
    bar.classList.add('is-hidden');
    return;
  }

  closeBtn.addEventListener('click', () => {
    bar.classList.add('is-hidden');
    localStorage.setItem(ANNOUNCEMENT_KEY, '1');
  });
}

function enableScrollProgress() {
  const bar = document.getElementById('scrollProgress');
  if (!bar) return;

  const update = () => {
    const scrollTop = window.scrollY || document.documentElement.scrollTop;
    const height =
      document.documentElement.scrollHeight - document.documentElement.clientHeight;
    const progress = height > 0 ? (scrollTop / height) * 100 : 0;
    bar.style.setProperty('--progress', `${progress}%`);
  };

  update();
  window.addEventListener('scroll', update, { passive: true });
  window.addEventListener('resize', update);
}

function enableSectionSpy() {
  const navLinks = Array.from(document.querySelectorAll('.nav a[href^="#"]'));
  if (!navLinks.length) return;

  const sections = navLinks
    .map((link) => {
      const id = link.getAttribute('href');
      const target = document.querySelector(id);
      return target ? { id, target, link } : null;
    })
    .filter(Boolean);

  if (!sections.length) return;

  let activeId = null;

  const setActive = (id) => {
    if (activeId === id) return;
    activeId = id;
    navLinks.forEach((link) => {
      link.classList.toggle('is-active', link.getAttribute('href') === id);
    });
  };

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          setActive(`#${entry.target.id}`);
        }
      });
    },
    {
      rootMargin: '-40% 0px -50% 0px',
      threshold: 0.25
    }
  );

  sections.forEach(({ target }) => observer.observe(target));
}

(function init() {
  const yearEl = document.getElementById('year');
  if (yearEl) yearEl.textContent = new Date().getFullYear();

  const theme = getInitialTheme();
  setTheme(theme);

  const themeToggle = document.getElementById('themeToggle');
  if (themeToggle) {
    themeToggle.addEventListener('click', () => {
      const current = document.documentElement.getAttribute('data-theme') || 'dark';
      setTheme(current === 'dark' ? 'light' : 'dark');
    });
  }

  const menuToggle = document.getElementById('menuToggle');
  const primaryNav = document.getElementById('primaryNav');
  const mobileMq = window.matchMedia(MOBILE_BREAKPOINT);
  if (menuToggle && primaryNav) {
    const closeMenu = () => {
      menuToggle.classList.remove('is-active');
      primaryNav.classList.remove('is-open');
      menuToggle.setAttribute('aria-expanded', 'false');
    };

    const shouldUseMobileNav = () => mobileMq.matches;

    menuToggle.addEventListener('click', () => {
      const isOpen = menuToggle.classList.toggle('is-active');
      primaryNav.classList.toggle('is-open', isOpen);
      menuToggle.setAttribute('aria-expanded', String(isOpen));
    });

    primaryNav.addEventListener('click', (event) => {
      if (shouldUseMobileNav() && event.target.closest('a')) {
        closeMenu();
      }
    });

    addMqListener(mobileMq, (event) => {
      if (!event.matches) {
        closeMenu();
      }
    });
  }

  enableSmoothAnchors();
  enableRevealAnimations();
  enablePointerGlow();
  enableScrollProgress();
  enableAnnouncement();
  enableSectionSpy();

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
