const http = require('http');
const fs = require('fs');
const path = require('path');

const host = '127.0.0.1';
const port = Number(process.env.PORT) || 8000;
const rootDir = __dirname;

const contentTypes = {
    '.css': 'text/css; charset=utf-8',
    '.html': 'text/html; charset=utf-8',
    '.ico': 'image/x-icon',
    '.js': 'application/javascript; charset=utf-8',
    '.json': 'application/json; charset=utf-8',
    '.mp4': 'video/mp4',
    '.png': 'image/png',
    '.svg': 'image/svg+xml; charset=utf-8',
    '.txt': 'text/plain; charset=utf-8'
};

function sendFile(response, filePath) {
    fs.readFile(filePath, (error, data) => {
        if (error) {
            response.writeHead(error.code === 'ENOENT' ? 404 : 500, {
                'Content-Type': 'text/plain; charset=utf-8'
            });
            response.end(error.code === 'ENOENT' ? '404 Not Found' : '500 Internal Server Error');
            return;
        }

        const ext = path.extname(filePath).toLowerCase();
        response.writeHead(200, {
            'Content-Type': contentTypes[ext] || 'application/octet-stream',
            'Cache-Control': 'no-cache'
        });
        response.end(data);
    });
}

const server = http.createServer((request, response) => {
    const requestUrl = new URL(request.url, `http://${request.headers.host || `${host}:${port}`}`);
    const cleanPath = decodeURIComponent(requestUrl.pathname === '/' ? '/index.html' : requestUrl.pathname);
    const normalizedPath = path.normalize(cleanPath).replace(/^(\.\.[\\/])+/, '');
    const filePath = path.join(rootDir, normalizedPath);

    if (!filePath.startsWith(rootDir)) {
        response.writeHead(403, { 'Content-Type': 'text/plain; charset=utf-8' });
        response.end('403 Forbidden');
        return;
    }

    fs.stat(filePath, (error, stats) => {
        if (!error && stats.isDirectory()) {
            sendFile(response, path.join(filePath, 'index.html'));
            return;
        }

        sendFile(response, filePath);
    });
});

server.listen(port, host, () => {
    console.log(`Book Finder server running at http://${host}:${port}`);
});
