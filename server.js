import express from 'express';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import tredictHandler from './api/tredict.mjs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3000;
const HOST = process.env.HOST || '127.0.0.1';
const liveClients = new Set();

app.use(express.json());

/**
 * Checks whether an incoming HTTP request originates from loopback.
 */
function isLoopbackRequest(req) {
  const ip = req.socket.remoteAddress || '';
  return ip === '127.0.0.1' || ip === '::1' || ip === '::ffff:127.0.0.1';
}

/**
 * Broadcasts a live-reload payload to all connected local preview clients.
 */
function broadcastLiveReload(payload) {
  const data = `data: ${JSON.stringify(payload)}\n\n`;
  for (const client of liveClients) {
    try {
      client.write(data);
    } catch {
      liveClients.delete(client);
    }
  }
}

/**
 * Watches local UI files (index.html, css/, js/) and notifies connected browsers.
 */
function setupLiveReloadWatcher() {
  const targets = [
    { target: path.join(__dirname, 'index.html'), recursive: false, base: 'index.html' },
    { target: path.join(__dirname, 'css'), recursive: true, base: 'css' },
    { target: path.join(__dirname, 'js'), recursive: true, base: 'js' }
  ];

  let debounceTimer = null;
  const changedFiles = new Set();

  const scheduleBroadcast = (fileName) => {
    if (!fileName) return;
    const baseName = path.basename(fileName);
    if (baseName.startsWith('.') || baseName.endsWith('~') || baseName.endsWith('.tmp')) return;
    changedFiles.add(fileName.toLowerCase());
    if (debounceTimer) clearTimeout(debounceTimer);
    debounceTimer = setTimeout(() => {
      const files = Array.from(changedFiles);
      changedFiles.clear();
      if (files.length === 0) return;
      const cssOnly = files.every((f) => f.endsWith('.css'));
      broadcastLiveReload({ type: cssOnly ? 'css' : 'reload', files });
    }, 160);
  };

  for (const { target, recursive, base } of targets) {
    if (!fs.existsSync(target)) continue;
    try {
      const watcher = fs.watch(target, { recursive }, (_eventType, filename) => {
        scheduleBroadcast(filename ? String(filename) : base);
      });
      watcher.on('error', () => {});
    } catch {
      // Ignore watcher initialization failure in restricted environments
    }
  }
}

/**
 * Returns the browser-side live-reload script injected only in local dev responses.
 */
function getLiveReloadClientScript() {
  return `(() => {
  const TAB_KEY = 'celik_dev_restore_tab';
  const SCROLL_KEY = 'celik_dev_restore_scroll';

  const restoreViewAfterReload = () => {
    try {
      const savedTab = sessionStorage.getItem(TAB_KEY);
      const savedScroll = Number(sessionStorage.getItem(SCROLL_KEY) || '0');
      sessionStorage.removeItem(TAB_KEY);
      sessionStorage.removeItem(SCROLL_KEY);
      if (!savedTab) return;

      const loginScreen = document.getElementById('loginScreen');
      const isLoggedOut = loginScreen && loginScreen.classList.contains('active');
      if (!isLoggedOut && typeof window.switchTab === 'function') {
        const currentTab = document.querySelector('.tab-content.active')?.id;
        if (currentTab !== savedTab && document.getElementById(savedTab)) {
          window.switchTab(savedTab);
        }
      }
      if (savedScroll > 0) {
        requestAnimationFrame(() => window.scrollTo(0, savedScroll));
      }
    } catch {}
  };

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => setTimeout(restoreViewAfterReload, 80));
  } else {
    setTimeout(restoreViewAfterReload, 80);
  }

  if (typeof EventSource === 'undefined') return;
  const source = new EventSource('/__live-reload');
  source.onmessage = (event) => {
    try {
      const msg = JSON.parse(event.data || '{}');
      if (msg.type === 'css') {
        const links = document.querySelectorAll('link[rel="stylesheet"]');
        for (const link of links) {
          const href = link.getAttribute('href') || '';
          if (!href || /^https?:\\/\\//i.test(href) && !href.startsWith(window.location.origin)) continue;
          const url = new URL(href, window.location.origin);
          url.searchParams.set('lr', String(Date.now()));
          link.setAttribute('href', url.pathname + url.search);
        }
        return;
      }
      if (msg.type === 'reload') {
        const activeTab = document.querySelector('.tab-content.active')?.id || '';
        if (activeTab) sessionStorage.setItem(TAB_KEY, activeTab);
        sessionStorage.setItem(SCROLL_KEY, String(Math.round(window.scrollY || 0)));
        window.location.reload();
      }
    } catch {}
  };
})();`;
}

/**
 * Serves index.html with the local live-reload helper script appended.
 */
async function sendLiveHtml(res) {
  try {
    const html = await fs.promises.readFile(path.join(__dirname, 'index.html'), 'utf8');
    const tag = '<script src="/__live-reload.js"></script>';
    const injected = /<\/body>/i.test(html)
      ? html.replace(/<\/body>/i, `    ${tag}\n</body>`)
      : `${html}\n${tag}`;
    res.setHeader('Content-Type', 'text/html; charset=utf-8');
    res.setHeader('Cache-Control', 'no-store');
    res.send(injected);
  } catch {
    res.status(500).send('Unable to load index.html');
  }
}

// Security Headers & File Protection Middleware
app.use((req, res, next) => {
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
  res.setHeader('X-Frame-Options', 'SAMEORIGIN');

  const p = req.path.toLowerCase();
  if (p.startsWith('/.') || 
      p === '/server.js' || 
      p === '/package.json' || 
      p === '/vercel.json' ||
      p === '/package-lock.json' ||
      p === '/firestore.rules' ||
      p.startsWith('/config') ||
      p.startsWith('/scripts') ||
      /\.(rules|sh|mjs|py|env|lock|md|zip|tar|gz)$/i.test(p) ||
      p.includes('/node_modules') || 
      p.includes('/desktop-app')) {
    return res.status(403).send('Forbidden');
  }
  next();
});

// API health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', app: 'Çelik Kodu' });
});

// Local-only live-reload SSE stream and helper script
app.get('/__live-reload', (req, res) => {
  if (!isLoopbackRequest(req)) return res.status(403).send('Forbidden');
  res.setHeader('Content-Type', 'text/event-stream; charset=utf-8');
  res.setHeader('Cache-Control', 'no-cache, no-transform');
  res.setHeader('Connection', 'keep-alive');
  res.flushHeaders?.();
  res.write(': connected\n\n');
  liveClients.add(res);
  const keepAlive = setInterval(() => {
    try {
      res.write(': ping\n\n');
    } catch {
      clearInterval(keepAlive);
      liveClients.delete(res);
    }
  }, 25000);
  req.on('close', () => {
    clearInterval(keepAlive);
    liveClients.delete(res);
  });
});

app.get('/__live-reload.js', (req, res) => {
  if (!isLoopbackRequest(req)) return res.status(403).send('Forbidden');
  res.setHeader('Content-Type', 'application/javascript; charset=utf-8');
  res.setHeader('Cache-Control', 'no-store');
  res.send(getLiveReloadClientScript());
});

// Handle /api/tredict requests directly via stateless gateway module
app.use('/api/tredict', async (req, res) => {
  if (!isLoopbackRequest(req)) {
    return res.status(403).json({ ok: false, error: 'Forbidden: Local requests only' });
  }
  return tredictHandler(req, res);
});

// Serve index.html with live-reload before static middleware
app.get(['/', '/index.html'], (_req, res) => sendLiveHtml(res));

// Serve static assets from root directory (no-store for CSS/JS in local dev)
app.use(express.static(__dirname, {
  extensions: ['html', 'htm'],
  index: false,
  setHeaders: (res, filePath) => {
    if (/\.(html|htm|css|js)$/i.test(filePath)) {
      res.setHeader('Cache-Control', 'no-store');
    }
  }
}));

// Fallback to index.html for SPA routing
app.get('*', (_req, res) => sendLiveHtml(res));

setupLiveReloadWatcher();

app.listen(PORT, HOST, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});
