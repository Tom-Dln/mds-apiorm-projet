const express = require('express');
const http = require('http');
const WebSocket = require('ws');
const path = require('path');

const app = express();
const server = http.createServer(app);
const wss = new WebSocket.Server({ server });

app.use(express.static(path.join(__dirname, 'public')));

app.use(express.json());

let users = [];

app.post('/user', (req, res) => {
    const { id, name, position } = req.body;
    const user = { id, name, position };
    users.push(user);
    res.status(200).json(user);
});

app.get('/positions', (req, res) => {
    res.status(200).json(users);
});

wss.on('connection', ws => {
    console.log('Nouvelle connexion WebSocket');
    ws.on('message', message => {
        const { id, position } = JSON.parse(message);
        const user = users.find(user => user.id === id);
        if (user) {
            user.position = position;
            wss.clients.forEach(client => {
                if (client.readyState === WebSocket.OPEN) {
                    client.send(JSON.stringify({ id, position }));
                }
            });
        }
    });
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
    console.log(`Serveur en cours d'exécution sur le port ${PORT}`);
});
