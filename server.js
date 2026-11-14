import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import tredictHandler from './api/tredict.mjs';

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

// Handle /api/tredict requests directly via stateless gateway module
app.use('/api/tredict', async (req, res) => {
  const ip = req.socket.remoteAddress || '';
  const isLoopback = ip === '127.0.0.1' || ip === '::1' || ip === '::ffff:127.0.0.1';
  if (!isLoopback) {
    return res.status(403).json({ ok: false, error: 'Forbidden: Local requests only' });
  }
  return tredictHandler(req, res);
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
