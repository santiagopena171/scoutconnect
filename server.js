const http = require('http');
const fs = require('fs');
const path = require('path');
const url = require('url');

const server = http.createServer((req, res) => {
    let filePath = url.parse(req.url).pathname;
    
    if (filePath === '/') {
        filePath = '/index.html';
    }
    
    const fullPath = path.join(__dirname, filePath);
    
    fs.readFile(fullPath, (err, data) => {
        if (err) {
            res.writeHead(404);
            res.end('File not found');
            return;
        }
        
        let contentType = 'text/html';
        const ext = path.extname(filePath);
        
        if (ext === '.css') contentType = 'text/css';
        if (ext === '.js') contentType = 'application/javascript';
        if (ext === '.json') contentType = 'application/json';
        
        res.writeHead(200, { 'Content-Type': contentType });
        res.end(data);
    });
});

server.listen(3000, () => {
    console.log('Servidor ejecutándose en http://localhost:3000');
    console.log('Abre: http://localhost:3000/busqueda-avanzada.html');
});