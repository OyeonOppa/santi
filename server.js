/**
 * SANTI HARMONY - Local Game Server
 * Run: node server.js
 * Then open: http://localhost:3000 (stage) and share http://YOUR_IP:3000/?view=mobile
 */
const http = require('http');
const fs = require('fs');
const path = require('path');
const os = require('os');

// In-memory game state
let gameState = null;

// Connected SSE clients
const clients = new Set();

// Broadcast state to all connected clients
function broadcast(state) {
  const msg = 'data: ' + JSON.stringify(state) + '\n\n';
  for (const client of clients) {
    try { client.res.write(msg); } catch(e) { clients.delete(client); }
  }
}

// Get local IP address
function getLocalIP() {
  const ifaces = os.networkInterfaces();
  for (const iface of Object.values(ifaces)) {
    for (const addr of iface) {
      if (addr.family === 'IPv4' && !addr.internal) return addr.address;
    }
  }
  return 'localhost';
}

const MIME = {
  '.html': 'text/html; charset=utf-8',
  '.js':   'application/javascript',
  '.css':  'text/css',
  '.png':  'image/png',
  '.jpg':  'image/jpeg',
  '.svg':  'image/svg+xml',
  '.json': 'application/json',
};

const server = http.createServer((req, res) => {
  // CORS headers for dev
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') { res.writeHead(204); res.end(); return; }

  // ── GET /api/state ─────────────────────────────
  if (req.url === '/api/state' && req.method === 'GET') {
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify(gameState || {}));
    return;
  }

  // ── POST /api/state ────────────────────────────
  if (req.url === '/api/state' && req.method === 'POST') {
    let body = '';
    req.on('data', c => body += c);
    req.on('end', () => {
      try {
        gameState = JSON.parse(body);
        broadcast(gameState);
        res.writeHead(200); res.end('OK');
      } catch(e) {
        res.writeHead(400); res.end('Bad JSON');
      }
    });
    return;
  }

  // ── GET /api/events (Server-Sent Events) ───────
  if (req.url === '/api/events') {
    res.writeHead(200, {
      'Content-Type':  'text/event-stream',
      'Cache-Control': 'no-cache',
      'Connection':    'keep-alive',
    });
    res.flushHeaders();
    // Send current state immediately
    if (gameState) res.write('data: ' + JSON.stringify(gameState) + '\n\n');
    const client = { res, id: Date.now() };
    clients.add(client);
    // Heartbeat to keep connection alive
    const hb = setInterval(() => { try { res.write(': ping\n\n'); } catch(e) {} }, 20000);
    req.on('close', () => { clients.delete(client); clearInterval(hb); });
    return;
  }

  // ── Static files ───────────────────────────────
  let urlPath = req.url.split('?')[0];
  if (urlPath === '/' || urlPath === '') urlPath = '/index.html';
  const filePath = path.join(__dirname, urlPath);
  const ext = path.extname(filePath).toLowerCase();

  fs.readFile(filePath, (err, data) => {
    if (err) { res.writeHead(404); res.end('Not found'); return; }
    res.writeHead(200, { 'Content-Type': MIME[ext] || 'text/plain' });
    res.end(data);
  });
});

const PORT = process.env.PORT || 3000;
const LOCAL_IP = getLocalIP();

server.listen(PORT, '0.0.0.0', () => {
  console.log('');
  console.log('🎮  SANTI HARMONY Server');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log(`📺  Stage (เวที):    http://${LOCAL_IP}:${PORT}/?view=stage`);
  console.log(`📱  Mobile (ผู้เล่น): http://${LOCAL_IP}:${PORT}/?view=mobile`);
  console.log(`⚙️   Settings:        http://${LOCAL_IP}:${PORT}/?view=settings`);
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log(`🌐  Local IP: ${LOCAL_IP}:${PORT}`);
  console.log('');
});
