const THEME_KEY = 'bfs_theme';

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

const TESTIMONIALS = [
  {
    quote: 'The installer made it painless to get all the macros running on a new PC.',
    author: 'Kai',
    context: 'Macro tester'
  },
  {
    quote: 'Macro Creator plus the installer is the combo I use for every Roblox alt.',
    author: 'Nova',
    context: 'Creator of workflows'
  },
  {
    quote: 'Rivals AFK Macro fits right into the suite—just launch and let it run.',
    author: 'Jett',
    context: 'Rivals grinder'
  }
];

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
        <button class="btn small" type="button" data-action="details" data-project-id="${escapeHtml(project.id)}">Details</button>
        <div>
          ${project.repoUrl ? `<a class="link" href="${escapeHtml(project.repoUrl)}" target="_blank" rel="noreferrer">Repo</a>` : ''}
          ${project.demoUrl ? ` <span class="sep" aria-hidden="true">·</span> <a class="link" href="${escapeHtml(project.demoUrl)}" target="_blank" rel="noreferrer">Demo</a>` : ''}
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

async function loadProjects() {
  const res = await fetch('projects.json', { cache: 'no-store' });
  if (!res.ok) throw new Error(`Failed to load projects.json (${res.status})`);
  const data = await res.json();
  if (!Array.isArray(data)) return [];
  return data
    .filter((p) => p && typeof p === 'object')
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

function attachProjectsUI(projects) {
  const grid = document.getElementById('projectsGrid');
  const search = document.getElementById('projectSearch');
  const status = document.getElementById('statusFilter');
  const category = document.getElementById('categoryFilter');
  const sortSelect = document.getElementById('sortProjects');
  const clear = document.getElementById('clearFilters');
  const tagFilters = document.getElementById('tagFilters');
  const count = document.getElementById('projectsCount');

  if (!grid || !search || !status || !clear || !tagFilters || !count || !category || !sortSelect) return;

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

function renderTestimonials(items) {
  const container = document.getElementById('testimonialsGrid');
  if (!container) return;
  container.innerHTML = items
    .map(
      (item) => `
        <article class="testi-card">
          <div class="testi-quote">“${escapeHtml(item.quote)}”</div>
          <div class="testi-meta">${escapeHtml(item.author)} — ${escapeHtml(item.context)}</div>
        </article>
      `
    )
    .join('');
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

  const copyBtn = document.getElementById('copyUrl');
  const copyMsg = document.getElementById('copyMsg');
  if (copyBtn && copyMsg) {
    copyBtn.addEventListener('click', async () => {
      const url = 'https://bestfreesoftwareco.github.io';
      try {
        await copyToClipboard(url);
        copyMsg.textContent = 'Copied!';
      } catch {
        copyMsg.textContent = 'Copy failed. You can manually copy the URL.';
      }
    });
  }

  enableSmoothAnchors();
  enableRevealAnimations();

  loadProjects()
    .then((projects) => {
      attachProjectsUI(projects);
      renderFeaturedRelease(projects);
      renderTestimonials(TESTIMONIALS);
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
