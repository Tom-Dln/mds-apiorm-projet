
# MDS APIORM Projet

Ce projet est une application web permettant le suivi en temps réel et la visioconférence en utilisant Node.js, Express, WebSocket et Leaflet.js.

## Lien Live

Vous pouvez accéder à la version en ligne du projet [ici](https://mds-apiorm-projet-31faab05a0ea.herokuapp.com/).

## Installation

Pour installer et exécuter ce projet localement, suivez les étapes ci-dessous :

1. Clonez le dépôt:
   ```bash
   git clone https://github.com/votre-utilisateur/mds-apiorm-projet.git
   ```
2. Accédez au répertoire du projet:
   ```bash
   cd mds-apiorm-projet
   ```
3. Installez les dépendances:
   ```bash
   npm install
   ```

## Utilisation

Pour démarrer le serveur en mode développement avec Nodemon :
```bash
npm run dev
```

Pour démarrer le serveur en mode production :
```bash
npm start
```

Accédez à l'application via votre navigateur à l'adresse suivante : `http://localhost:3000`.

## Fonctionnalités

- **Suivi en temps réel** : Utilisation de la géolocalisation pour suivre les positions des utilisateurs sur une carte en temps réel.
- **Visioconférence** : Fonctionnalité de visioconférence intégrée permettant une communication vidéo et audio entre les utilisateurs.
- **WebSocket** : Utilisation de WebSocket pour la communication en temps réel entre le client et le serveur.
- **WebRTC** : Intégration de WebRTC pour la gestion des appels vidéo.

## Structure du projet

- `server.js` : Point d'entrée principal de l'application serveur. Contient la configuration des routes et la gestion des connexions WebSocket.
- `index.html` : Fichier HTML principal de l'application cliente.
- `style.css` : Feuille de style pour le design de l'application.
- `script.js` : Fichier JavaScript côté client pour la gestion de la carte et des fonctionnalités WebRTC.
- `package.json` : Fichier de configuration npm contenant les dépendances et les scripts de démarrage.
- `Procfile` : Fichier pour la configuration de déploiement sur Heroku.

## Dépendances

Le projet utilise les dépendances suivantes :
- **Express** : Framework web pour Node.js.
- **ws** : Bibliothèque WebSocket pour Node.js.
- **Nodemon** : Outil de développement qui redémarre automatiquement le serveur lors de changements dans le code.

Vous pouvez voir toutes les dépendances et leurs versions dans le fichier `package.json`.

## License

Ce projet est sous licence ISC. Voir le fichier `LICENSE` pour plus de détails.
