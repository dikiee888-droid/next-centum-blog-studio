import { createServer } from 'node:http';
import { readFile } from 'node:fs/promises';
import { extname, join, normalize } from 'node:path';

const root = new URL('./dist/', import.meta.url).pathname.replace(/^\/(.:)/, '$1');
const types = {'.html':'text/html; charset=utf-8','.css':'text/css; charset=utf-8','.js':'text/javascript; charset=utf-8','.json':'application/json; charset=utf-8'};

createServer(async (req,res) => {
  try {
    const raw = decodeURIComponent((req.url || '/').split('?')[0]);
    const relative = raw === '/' ? 'index.html' : raw.replace(/^\/+/, '');
    const file = normalize(join(root, relative));
    if (!file.startsWith(normalize(root))) throw new Error('invalid path');
    const body = await readFile(file);
    res.writeHead(200, {'Content-Type': types[extname(file)] || 'application/octet-stream'}).end(body);
  } catch {
    res.writeHead(404, {'Content-Type':'text/plain; charset=utf-8'}).end('Not found');
  }
}).listen(4173, '127.0.0.1', () => console.log('Local: http://127.0.0.1:4173'));
