// Importation des modules nécessaires
const express = require('express');
const http = require('http');
const WebSocket = require('ws');
const path = require('path');

// Initialisation de l'application Express et création du serveur HTTP
const app = express();
const server = http.createServer(app);
const wss = new WebSocket.Server({ server });

// Configuration de l'application pour servir des fichiers statiques et pour parser les requêtes JSON
app.use(express.static(path.join(__dirname, 'public')));
app.use(express.json());

// Tableau pour stocker les utilisateurs
let users = [];

// Route POST pour ajouter un nouvel utilisateur
app.post('/user', (req, res) => {
    const { id, name, position } = req.body;
    const user = { id, name, position };
    users.push(user);
    res.status(200).json(user);
});

// Route GET pour obtenir les positions des utilisateurs
app.get('/positions', (req, res) => {
    res.status(200).json(users);
});

// Gestion des connexions WebSocket
wss.on('connection', ws => {
    console.log('Nouvelle connexion WebSocket');

    // Gestion des messages reçus via WebSocket
    ws.on('message', message => {
        const data = JSON.parse(message);
        if (data.type === 'position') {
            const { id, position } = data;
            const user = users.find(user => user.id === id);
            if (user) {
                user.position = position;
                // Envoi de la position mise à jour à tous les clients connectés
                wss.clients.forEach(client => {
                    if (client.readyState === WebSocket.OPEN) {
                        client.send(JSON.stringify({ type: 'position', id, position }));
                    }
                });
            }
        } else {
            // Gestion des données de signalisation WebRTC
            wss.clients.forEach(client => {
                if (client !== ws && client.readyState === WebSocket.OPEN) {
                    client.send(message);
                }
            });
        }
    });
});

// Démarrage du serveur sur le port spécifié
const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
    console.log(`Serveur en cours d'exécution sur le port ${PORT}`);
});
