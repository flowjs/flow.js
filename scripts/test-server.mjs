import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const MIME = {
  '.html': 'text/html; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.mjs': 'text/javascript; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.map': 'application/json; charset=utf-8',
  '.css': 'text/css; charset=utf-8'
};
const uploads = new Map();

function listSpecs() {
  return fs.readdirSync(path.join(ROOT, 'test'))
    .filter(name => /Spec\.js$/.test(name))
    .sort();
}

function serveStatic(res, pathname) {
  const rel = decodeURIComponent(pathname).replace(/^\/+/, '');
  const file = path.resolve(ROOT, rel);
  if (!file.startsWith(ROOT) || !fs.existsSync(file) || fs.statSync(file).isDirectory()) {
    res.writeHead(404);
    res.end('not found');
    return;
  }
  res.writeHead(200, {
    'content-type': MIME[path.extname(file)] || 'application/octet-stream',
    'cache-control': 'no-store'
  });
  fs.createReadStream(file).pipe(res);
}

function handleUpload(req, res, url) {
  const body = [];
  req.on('data', chunk => body.push(chunk));
  req.on('error', () => {
    res.writeHead(500);
    res.end('read error');
  });
  req.on('end', () => {
    const identifier = url.searchParams.get('flowIdentifier') || 'default';
    const chunkNumber = Number(url.searchParams.get('flowChunkNumber') || '1');
    const failChunk = Number(url.searchParams.get('failChunk') || '0');
    const failTimes = Number(url.searchParams.get('failTimes') || '0');
    const state = uploads.get(identifier) || {
      chunks: new Map(),
      requests: 0,
      failures: new Map()
    };
    state.requests++;
    const failures = state.failures.get(chunkNumber) || 0;
    if (failChunk && chunkNumber === failChunk && failures < failTimes) {
      state.failures.set(chunkNumber, failures + 1);
      uploads.set(identifier, state);
      res.writeHead(503, {'content-type': 'text/plain'});
      res.end('busy');
      return;
    }
    state.chunks.set(chunkNumber, Buffer.concat(body));
    uploads.set(identifier, state);
    res.writeHead(200, {'content-type': 'text/plain'});
    res.end('ok');
  });
}

function handleResult(res, url) {
  const identifier = url.searchParams.get('flowIdentifier') || 'default';
  const state = uploads.get(identifier) || {
    chunks: new Map(),
    requests: 0,
    failures: new Map()
  };
  const numbers = Array.from(state.chunks.keys()).sort((a, b) => a - b);
  const data = Buffer.concat(numbers.map(number => state.chunks.get(number)));
  res.writeHead(200, {'content-type': 'application/json'});
  res.end(JSON.stringify({
    requests: state.requests,
    chunkNumbers: numbers,
    data: data.toString('base64')
  }));
}

export function startServer(port = 0) {
  const server = http.createServer((req, res) => {
    const url = new URL(req.url, 'http://127.0.0.1');
    if (url.pathname === '/_specs') {
      res.writeHead(200, {'content-type': 'application/json'});
      res.end(JSON.stringify(listSpecs()));
      return;
    }
    if (url.pathname === '/_upload' && req.method === 'POST') {
      handleUpload(req, res, url);
      return;
    }
    if (url.pathname === '/_upload/result' && req.method === 'GET') {
      handleResult(res, url);
      return;
    }
    if (url.pathname === '/_upload' && req.method === 'DELETE') {
      uploads.delete(url.searchParams.get('flowIdentifier') || 'default');
      res.writeHead(204);
      res.end();
      return;
    }
    serveStatic(res, url.pathname);
  });

  return new Promise(resolve => {
    server.listen(port, '127.0.0.1', () => {
      const actualPort = server.address().port;
      resolve({
        server,
        port: actualPort,
        url: `http://127.0.0.1:${actualPort}`,
        close: async () => {
          if (typeof server.closeAllConnections === 'function') {
            server.closeAllConnections();
          }
          await new Promise(done => server.close(done));
        }
      });
    });
  });
}
