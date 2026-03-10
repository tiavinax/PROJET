const Reinitialisation = require('../models/reinitialisation.model');

exports.reinitialiser = async (req, res) => {
    try {
        await Reinitialisation.reinitialiser();
        res.json({
            success: true,
            message: 'Base de données réinitialisée avec succès'
        });
    } catch (error) {
        console.error('Erreur réinitialisation:', error);
        res.status(500).json({
            success: false,
            message: 'Erreur lors de la réinitialisation',
            error: error.message
        });
    }
};