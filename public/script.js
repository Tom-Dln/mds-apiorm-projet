let map;
let markers = {};
let userId = 'user_' + Math.random().toString(36).substr(2, 9);

function initMap() {
    map = L.map('map').setView([0, 0], 2);

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
    }).addTo(map);

    if (navigator.geolocation) {
        navigator.geolocation.watchPosition(position => {
            const pos = {
                lat: position.coords.latitude,
                lng: position.coords.longitude
            };

            if (!markers[userId]) {
                markers[userId] = L.marker(pos).addTo(map).bindPopup('My Position').openPopup();
            } else {
                markers[userId].setLatLng(pos).openPopup();
            }

            map.setView(pos, 13);

            const message = JSON.stringify({ id: userId, position: pos });
            ws.send(message);

            fetch('/user', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ id: userId, name: 'User', position: pos })
            });
        });
    }
}

const ws = new WebSocket('ws://localhost:3000');

ws.onmessage = event => {
    const { id, position } = JSON.parse(event.data);
    if (!markers[id]) {
        markers[id] = L.marker(position).addTo(map).bindPopup('User ' + id).openPopup();
    } else {
        markers[id].setLatLng(position).openPopup();
    }
};

window.onload = initMap;

const localVideo = document.getElementById('localVideo');
const remoteVideo = document.getElementById('remoteVideo');
const peerConnection = new RTCPeerConnection();

navigator.mediaDevices.getUserMedia({ video: true, audio: true }).then(stream => {
    localVideo.srcObject = stream;
    stream.getTracks().forEach(track => peerConnection.addTrack(track, stream));
});

peerConnection.ontrack = event => {
    remoteVideo.srcObject = event.streams[0];
};

// Handling WebRTC signaling
ws.onmessage = event => {
    const data = JSON.parse(event.data);

    if (data.type === 'offer') {
        peerConnection.setRemoteDescription(new RTCSessionDescription(data));
        peerConnection.createAnswer().then(answer => {
            peerConnection.setLocalDescription(answer);
            ws.send(JSON.stringify(answer));
        });
    } else if (data.type === 'answer') {
        peerConnection.setRemoteDescription(new RTCSessionDescription(data));
    } else if (data.type === 'candidate') {
        peerConnection.addIceCandidate(new RTCIceCandidate(data.candidate));
    } else {
        // Handle position updates as before
        const { id, position } = data;
        if (!markers[id]) {
            markers[id] = L.marker(position).addTo(map).bindPopup('User ' + id).openPopup();
        } else {
            markers[id].setLatLng(position).openPopup();
        }
    }
};

peerConnection.onicecandidate = event => {
    if (event.candidate) {
        ws.send(JSON.stringify({ type: 'candidate', candidate: event.candidate }));
    }
};

function startCall() {
    peerConnection.createOffer().then(offer => {
        peerConnection.setLocalDescription(offer);
        ws.send(JSON.stringify(offer));
    });
}

// Call startCall() when you want to initiate a call


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