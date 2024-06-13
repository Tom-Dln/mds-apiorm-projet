let map;
let markers = {};
let userId = 'user_' + Math.random().toString(36).substr(2, 9);

// Fonction pour initialiser la carte
function initMap() {
    map = L.map('map').setView([0, 0], 2);

    // Ajout d'une couche de tuiles OpenStreetMap
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
    }).addTo(map);

    // Suivi de la position géographique de l'utilisateur
    if (navigator.geolocation) {
        navigator.geolocation.watchPosition(position => {
            const pos = {
                lat: position.coords.latitude,
                lng: position.coords.longitude
            };

            // Mise à jour du marqueur de l'utilisateur sur la carte
            if (!markers[userId]) {
                markers[userId] = L.marker(pos).addTo(map).bindPopup('My Position').openPopup();
            } else {
                markers[userId].setLatLng(pos).openPopup();
            }

            map.setView(pos, 13);

            // Envoi de la position via WebSocket
            const message = JSON.stringify({ type: 'position', id: userId, position: pos });
            ws.send(message);

            // Enregistrement de l'utilisateur et de sa position via une requête POST
            fetch('/user', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ id: userId, name: 'User', position: pos })
            });
        });
    }
}

// Initialisation de la connexion WebSocket
const ws = new WebSocket('ws://localhost:3000');

// Gestion des messages reçus via WebSocket
ws.onmessage = event => {
    const data = JSON.parse(event.data);

    if (data.type === 'position') {
        const { id, position } = data;
        // Mise à jour de la position des autres utilisateurs sur la carte
        if (!markers[id]) {
            markers[id] = L.marker(position).addTo(map).bindPopup('User ' + id).openPopup();
        } else {
            markers[id].setLatLng(position).openPopup();
        }
    } else {
        // Gestion des données de signalisation WebRTC
        handleSignalingData(data);
    }
};

// Initialisation de la carte lors du chargement de la fenêtre
window.onload = initMap;

const localVideo = document.getElementById('localVideo');
const remoteVideo = document.getElementById('remoteVideo');
const peerConnection = new RTCPeerConnection();

// Accès à la caméra et au micro de l'utilisateur
navigator.mediaDevices.getUserMedia({ video: true, audio: true }).then(stream => {
    localVideo.srcObject = stream;
    stream.getTracks().forEach(track => peerConnection.addTrack(track, stream));
});

// Affichage de la vidéo distante lorsque les flux sont reçus
peerConnection.ontrack = event => {
    remoteVideo.srcObject = event.streams[0];
};

// Envoi des candidats ICE via WebSocket
peerConnection.onicecandidate = event => {
    if (event.candidate) {
        ws.send(JSON.stringify({ type: 'candidate', candidate: event.candidate }));
    }
};

// Gestion des données de signalisation WebRTC
function handleSignalingData(data) {
    switch (data.type) {
        case 'offer':
            peerConnection.setRemoteDescription(new RTCSessionDescription(data));
            peerConnection.createAnswer().then(answer => {
                peerConnection.setLocalDescription(answer);
                ws.send(JSON.stringify(answer));
            });
            break;
        case 'answer':
            peerConnection.setRemoteDescription(new RTCSessionDescription(data));
            break;
        case 'candidate':
            peerConnection.addIceCandidate(new RTCIceCandidate(data.candidate));
            break;
    }
}

// Fonction pour démarrer un appel
function startCall() {
    peerConnection.createOffer().then(offer => {
        peerConnection.setLocalDescription(offer);
        ws.send(JSON.stringify(offer));
    });
}

// Affichage des données de l'accéléromètre si disponible
if ('Accelerometer' in window) {
    let accelerometer = new Accelerometer({ frequency: 60 });
    accelerometer.addEventListener('reading', () => {
        document.getElementById('accelerometer-data').innerText =
            `X: ${accelerometer.x.toFixed(2)} Y: ${accelerometer.y.toFixed(2)} Z: ${accelerometer.z.toFixed(2)}`;
    });
    accelerometer.start();
} else {
    document.getElementById('accelerometer-data').innerText = 'Accelerometer not supported';
}
