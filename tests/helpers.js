// Shared local test server; the website has no runtime dependency on this file.
const fs = require('node:fs');
const path = require('node:path');
const http = require('node:http');

const CONTENT_TYPES = {
  '.html': 'text/html',
  '.css': 'text/css',
  '.js': 'text/javascript',
  '.svg': 'image/svg+xml',
  '.webp': 'image/webp',
  '.webm': 'video/webm'
};

function createStaticServer(root){
  return http.createServer((req, res) => {
    let pathname;
    try{
      pathname = decodeURIComponent(new URL(req.url, 'http://localhost').pathname);
    }catch{
      res.writeHead(400).end();
      return;
    }
    const file = path.resolve(root, '.' + (pathname === '/' ? '/index.html' : pathname));
    if(!file.startsWith(root + path.sep) || !fs.existsSync(file) || !fs.statSync(file).isFile()){
      res.writeHead(404).end();
      return;
    }
    res.setHeader('Content-Type', CONTENT_TYPES[path.extname(file)] || 'application/octet-stream');
    const stream = fs.createReadStream(file);
    stream.on('error', () => res.destroy());
    stream.pipe(res);
  });
}

module.exports = {createStaticServer};
