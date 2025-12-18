const THEME_KEY = 'bfs_theme';

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

function isValidEmail(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(email).trim());
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

  const notifyBtn = document.getElementById('notifyBtn');
  const emailInput = document.getElementById('email');
  const notifyMsg = document.getElementById('notifyMsg');

  if (notifyBtn && emailInput && notifyMsg) {
    notifyBtn.addEventListener('click', () => {
      const email = emailInput.value;
      if (!isValidEmail(email)) {
        notifyMsg.textContent = 'Please enter a valid email address.';
        return;
      }

      notifyMsg.textContent = `Thanks! (Demo) We'll notify ${email} when updates are ready.`;
      emailInput.value = '';
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
})();
