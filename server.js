/**
 * SANTI - Local Game Server (Multi-Room Support)
 * Run: node server.js
 * Supports multiple simultaneous rooms via ?room=SANTI-XX
 */
const http = require('http');
const https = require('https');
const fs = require('fs');
const path = require('path');
const os = require('os');

// Per-room state: Map<roomCode, state>
const rooms = new Map();

// Per-room SSE clients: Map<roomCode, Set<{res, id}>>
const roomClients = new Map();

function getClients(roomCode) {
  if (!roomClients.has(roomCode)) roomClients.set(roomCode, new Set());
  return roomClients.get(roomCode);
}

function broadcast(roomCode, state) {
  const msg = 'data: ' + JSON.stringify(state) + '\n\n';
  const clients = getClients(roomCode);
  for (const client of clients) {
    try { client.res.write(msg); } catch(e) { clients.delete(client); }
  }
}

function getRoomFromUrl(url) {
  try {
    const u = new URL(url, 'http://localhost');
    return (u.searchParams.get('room') || '').trim();
  } catch(e) { return ''; }
}

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
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') { res.writeHead(204); res.end(); return; }

  const urlPath = req.url.split('?')[0];

  // ── GET /api/state?room=SANTI-XX ──────────────────────────
  if (urlPath === '/api/state' && req.method === 'GET') {
    const roomCode = getRoomFromUrl(req.url);
    const state = roomCode ? (rooms.get(roomCode) || null) : null;
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify(state || {}));
    return;
  }

  // ── POST /api/state ────────────────────────────────────────
  // Room code is extracted from the request body (state.roomCode)
  if (urlPath === '/api/state' && req.method === 'POST') {
    let body = '';
    req.on('data', c => body += c);
    req.on('end', () => {
      try {
        const state = JSON.parse(body);
        const roomCode = state.roomCode || getRoomFromUrl(req.url);
        if (!roomCode) { res.writeHead(400); res.end('Missing roomCode'); return; }
        // Merge: never shrink arrays that are append-only (emotions, players)
        const prev = rooms.get(roomCode);
        if (prev) {
          if (Array.isArray(prev.emotions) && Array.isArray(state.emotions) &&
              prev.emotions.length > state.emotions.length) {
            state.emotions = prev.emotions;
          }
          if (Array.isArray(prev.players) && Array.isArray(state.players) &&
              prev.players.length > state.players.length) {
            state.players = prev.players;
          }
          if (Array.isArray(prev.reactions) && Array.isArray(state.reactions) &&
              prev.reactions.length > state.reactions.length) {
            state.reactions = prev.reactions;
          }
        }
        rooms.set(roomCode, state);
        broadcast(roomCode, state);
        res.writeHead(200); res.end('OK');
      } catch(e) {
        res.writeHead(400); res.end('Bad JSON');
      }
    });
    return;
  }

  // ── GET /api/events?room=SANTI-XX (SSE) ───────────────────
  if (urlPath === '/api/events') {
    const roomCode = getRoomFromUrl(req.url);
    res.writeHead(200, {
      'Content-Type':  'text/event-stream',
      'Cache-Control': 'no-cache',
      'Connection':    'keep-alive',
    });
    res.flushHeaders();
    // Send current room state immediately
    const existing = roomCode ? rooms.get(roomCode) : null;
    if (existing) res.write('data: ' + JSON.stringify(existing) + '\n\n');
    const client = { res, id: Date.now() };
    if (roomCode) getClients(roomCode).add(client);
    const hb = setInterval(() => { try { res.write(': ping\n\n'); } catch(e) {} }, 20000);
    req.on('close', () => {
      if (roomCode) getClients(roomCode).delete(client);
      clearInterval(hb);
    });
    return;
  }

  // ── GET /api/ping (keep-alive probe) ──────────────────────
  if (urlPath === '/api/ping') {
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ ok: true, rooms: rooms.size, ts: Date.now() }));
    return;
  }

  // ── GET /api/rooms (debug: list active rooms) ──────────────
  if (urlPath === '/api/rooms' && req.method === 'GET') {
    const list = [];
    for (const [code, state] of rooms.entries()) {
      list.push({ room: code, players: state.players?.length || 0, phase: state.phase });
    }
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify(list));
    return;
  }

  // ── Static files ───────────────────────────────────────────
  let filePath = urlPath === '/' || urlPath === '' ? '/index.html' : urlPath;
  filePath = path.join(__dirname, filePath);
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
  console.log('🎮  SANTI Server (Multi-Room)');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log(`📺  Stage:   http://${LOCAL_IP}:${PORT}/?view=stage`);
  console.log(`📱  Mobile:  http://${LOCAL_IP}:${PORT}/?view=mobile`);
  console.log(`⚙️   Settings: http://${LOCAL_IP}:${PORT}/?view=settings`);
  console.log(`🔍  Rooms:   http://${LOCAL_IP}:${PORT}/api/rooms`);
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log(`🌐  Local IP: ${LOCAL_IP}:${PORT}`);
  console.log('');

  // ── Keep-alive self-ping (Railway idle sleep prevention) ──
  // Railway sleeps process after ~15 min of no traffic on free tier.
  // Ping own /api/ping every 10 minutes to stay awake.
  const RAILWAY_DOMAIN = process.env.RAILWAY_PUBLIC_DOMAIN;
  if (RAILWAY_DOMAIN) {
    const pingUrl = `https://${RAILWAY_DOMAIN}/api/ping`;
    console.log(`💓  Keep-alive: pinging ${pingUrl} every 10 min`);
    setInterval(() => {
      https.get(pingUrl, (res) => {
        console.log(`[keep-alive] ${new Date().toISOString()} → ${res.statusCode}`);
        res.resume(); // drain response
      }).on('error', (e) => {
        console.warn(`[keep-alive] ping failed: ${e.message}`);
      });
    }, 10 * 60 * 1000); // 10 minutes
  } else {
    console.log('ℹ️   Keep-alive: disabled (no RAILWAY_PUBLIC_DOMAIN env var)');
  }
});
