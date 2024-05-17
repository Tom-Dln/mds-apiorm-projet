const express = require('express');
const http = require('http');
const WebSocket = require('ws');

const app = express();
const server = http.createServer(app);
const wss = new WebSocket.Server({ server });

// Middleware pour analyser les requêtes JSON
app.use(express.json());

// Base de données en mémoire pour les utilisateurs et leurs positions
let users = [];

// API RESTful pour gérer les utilisateurs et leurs positions
app.post('/user', (req, res) => {
    const { id, name, position } = req.body;
    const user = { id, name, position };
    users.push(user);
    res.status(200).json(user);
});

app.get('/positions', (req, res) => {
    res.status(200).json(users);
});

// WebSocket pour la mise à jour en temps réel
wss.on('connection', ws => {
    console.log('Nouvelle connexion WebSocket');
    ws.on('message', message => {
        console.log('Message reçu:', message);
        const { id, position } = JSON.parse(message);
        const user = users.find(user => user.id === id);
        if (user) {
            user.position = position;
            // Diffusez la mise à jour de la position à tous les clients connectés
            wss.clients.forEach(client => {
                if (client.readyState === WebSocket.OPEN) {
                    client.send(JSON.stringify({ id, position }));
                }
            });
        }
    });
});

// Démarrage du serveur
const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
    console.log(`Serveur en cours d'exécution sur le port ${PORT}`);
});
