import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3000;
const HOST = process.env.HOST || '127.0.0.1';

app.use(express.json());

// Security Headers & File Protection Middleware
app.use((req, res, next) => {
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
  res.setHeader('X-Frame-Options', 'SAMEORIGIN');

  const p = req.path.toLowerCase();
  if (p.startsWith('/.') || 
      p === '/server.js' || 
      p === '/package.json' || 
      p === '/package-lock.json' ||
      p === '/firestore.rules' ||
      p.startsWith('/scripts') ||
      /\.(rules|sh|mjs|py|env|lock|md|zip|tar|gz)$/i.test(p) ||
      p.includes('/node_modules') || 
      p.includes('/desktop-app') ||
      p.includes('/source_archive')) {
    return res.status(403).send('Forbidden');
  }
  next();
});

// API health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', app: 'Çelik Kodu' });
});

// Proxy /api/tredict requests directly to local bridge (Zero CORS, zero port issues)
app.use('/api/tredict', async (req, res) => {
  const ip = req.socket.remoteAddress || '';
  const isLoopback = ip === '127.0.0.1' || ip === '::1' || ip === '::ffff:127.0.0.1';
  if (!isLoopback) {
    return res.status(403).json({ ok: false, error: 'Forbidden: Local requests only' });
  }

  const allowedPaths = new Set(['', '/', '/status', '/wellness', '/activities', '/push-workout', '/delete-dates', '/activity-update', '/workout-logs']);
  const cleanPath = (req.path || '').replace(/\/+$/, '') || '/';
  if (!allowedPaths.has(cleanPath)) {
    return res.status(404).json({ ok: false, error: 'Endpoint not allowed' });
  }

  try {
    const targetUrl = `http://127.0.0.1:3847/api/tredict${req.url}`;
    const opts = {
      method: req.method,
      headers: { ...req.headers, host: '127.0.0.1:3847' }
    };
    if (req.method === 'POST' || req.method === 'PUT') {
      opts.body = JSON.stringify(req.body);
      opts.headers['content-type'] = 'application/json';
    }
    const response = await fetch(targetUrl, opts);
    res.status(response.status);
    const skipHeaders = new Set(['transfer-encoding', 'content-length', 'connection', 'keep-alive', 'content-encoding']);
    response.headers.forEach((val, key) => {
      if (!skipHeaders.has(key.toLowerCase())) {
        res.setHeader(key, val);
      }
    });
    const buf = await response.arrayBuffer();
    res.send(Buffer.from(buf));
  } catch (err) {
    res.status(502).json({ ok: false, error: 'Bridge unreachable: ' + err.message });
  }
});

// Serve static assets from root directory
app.use(express.static(__dirname, {
  extensions: ['html', 'htm'],
  index: 'index.html'
}));

// Fallback to index.html for SPA routing
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'));
});

app.listen(PORT, HOST, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});
