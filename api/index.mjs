import { promises as fs } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import worker from '../dist/server/index.js';

const root = path.dirname(fileURLToPath(import.meta.url));
const clientDir = path.resolve(root, '../dist/client');

const contentTypes = {
  '.css': 'text/css; charset=utf-8',
  '.html': 'text/html; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.glb': 'model/gltf-binary',
  '.png': 'image/png',
  '.svg': 'image/svg+xml',
  '.txt': 'text/plain; charset=utf-8',
};

async function fetchAsset(request) {
  const url = new URL(request.url);
  const decoded = decodeURIComponent(url.pathname);
  const relative = decoded === '/' ? '' : decoded.replace(/^\/+/, '');
  const filePath = path.resolve(clientDir, relative);

  if (!filePath.startsWith(clientDir)) {
    return new Response('Not found', { status: 404 });
  }

  try {
    const data = await fs.readFile(filePath);
    const extension = path.extname(filePath).toLowerCase();
    return new Response(data, {
      headers: {
        'cache-control': 'public, max-age=31536000, immutable',
        'content-type': contentTypes[extension] || 'application/octet-stream',
      },
    });
  } catch {
    return new Response('Not found', { status: 404 });
  }
}

export default async function handler(req, res) {
  const protocol = req.headers['x-forwarded-proto'] || 'https';
  const host = req.headers.host || 'localhost';
  const rewrittenUrl = new URL(req.url || '/', `${protocol}://${host}`);
  const route = rewrittenUrl.searchParams.get('__route') || '';
  rewrittenUrl.searchParams.delete('__route');
  const pathname = route ? `/${route.replace(/^\/+/, '')}` : '/';
  const url = `${protocol}://${host}${pathname}${rewrittenUrl.search}`;
  const request = new Request(url, {
    method: req.method,
    headers: req.headers,
    body: req.method === 'GET' || req.method === 'HEAD' ? undefined : req,
    duplex: 'half',
  });
  let response = await fetchAsset(request);
  if (response.status === 404) {
    response = await worker.fetch(request, { ASSETS: { fetch: fetchAsset } });
  }

  res.statusCode = response.status;
  response.headers.forEach((value, key) => res.setHeader(key, value));
  if (!response.body) {
    res.end();
    return;
  }

  const reader = response.body.getReader();
  res.on('close', () => reader.cancel().catch(() => {}));
  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    res.write(Buffer.from(value));
  }
  res.end();
}
