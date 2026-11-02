const http = require('node:http');
const fs = require('node:fs');
const path = require('node:path');
const root = path.resolve(__dirname, 'dist');
const server = http.createServer((request, response) => {
  let file;
  try { file = path.resolve(root, '.' + decodeURIComponent(new URL(request.url, 'http://localhost').pathname)); }
  catch { response.writeHead(400); return response.end('Bad request'); }
  if (file === root) file = path.join(root, 'index.html');
  if (!file.startsWith(root + path.sep)) { response.writeHead(403); return response.end('Forbidden'); }
  const types = {'.html':'text/html; charset=utf-8','.css':'text/css','.js':'text/javascript','.svg':'image/svg+xml','.json':'application/json','.pdf':'application/pdf','.png':'image/png','.webp':'image/webp','.zip':'application/zip'};
  fs.readFile(file, (error, bytes) => {
    response.writeHead(error ? 404 : 200, {'Content-Type':types[path.extname(file)] || 'application/octet-stream','Cache-Control':'no-store'});
    response.end(error ? 'Not found' : bytes);
  });
});
server.listen(0,'127.0.0.1',()=>console.log('http://127.0.0.1:'+server.address().port));
