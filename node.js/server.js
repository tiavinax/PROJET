const express = require('express');
const cors = require('cors');
require('dotenv').config();

const app = express();
const port = process.env.PORT || 3000;

// Middleware
app.use(cors()); // Permet à Angular de communiquer
app.use(express.json()); // Pour parser le JSON
app.use(express.urlencoded({ extended: true })); // Pour parser les formulaires

// Routes
const lotRoutes = require('./routes/lot.routes');
app.use('/api', lotRoutes);

// Route de test
app.get('/', (req, res) => {
    res.json({ message: 'Bienvenue sur l\'API de la ferme avicole' });
});

// Gestion des erreurs 404
app.use((req, res) => {
    res.status(404).json({ success: false, message: 'Route non trouvée' });
});

// Démarrage du serveur
app.listen(port, () => {
    console.log(`✅ Serveur démarré sur http://localhost:${port}`);
    console.log(`📡 API disponible sur http://localhost:${port}/api`);
});