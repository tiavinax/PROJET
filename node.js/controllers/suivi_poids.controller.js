const SuiviPoids = require('../models/suivi_poids.model');

// GET /api/suivi-poids
// GET /api/suivi-poids?race_id=1
exports.getAll = async (req, res) => {
    try {
        const { race_id } = req.query;
        const suivis = await SuiviPoids.findAll(race_id || null);
        res.json({ success: true, data: suivis });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// GET /api/suivi-poids/:id
exports.getById = async (req, res) => {
    try {
        const suivi = await SuiviPoids.findById(req.params.id);
        if (!suivi) {
            return res.status(404).json({
                success: false,
                message: 'Suivi non trouvé'
            });
        }
        res.json({ success: true, data: suivi });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// POST /api/suivi-poids
exports.create = async (req, res) => {
    try {
        const { race_id, semaine, 
                poids_recueilli_grammes, 
                sakafo_consomme_grammes } = req.body;

        // Validation robuste
        const champsManquants = [];
        if (!race_id)                          champsManquants.push('race_id');
        if (semaine === null || 
            semaine === undefined || 
            semaine === '')                     champsManquants.push('semaine');
        if (!poids_recueilli_grammes)          champsManquants.push('poids_recueilli_grammes');
        if (sakafo_consomme_grammes === null || 
            sakafo_consomme_grammes === undefined) champsManquants.push('sakafo_consomme_grammes');

        if (champsManquants.length > 0) {
            return res.status(400).json({
                success: false,
                message: `Champs manquants : ${champsManquants.join(', ')}`
            });
        }

        const id = await SuiviPoids.create(req.body);
        const nouveauSuivi = await SuiviPoids.findById(id);

        res.status(201).json({
            success: true,
            message: 'Suivi créé avec succès',
            data: nouveauSuivi
        });

    } catch (error) {
        res.status(400).json({ success: false, message: error.message });
    }
};

// PUT /api/suivi-poids/:id
exports.update = async (req, res) => {
    try {
        const updated = await SuiviPoids.update(req.params.id, req.body);
        if (!updated) {
            return res.status(404).json({
                success: false,
                message: 'Suivi non trouvé'
            });
        }
        const suivi = await SuiviPoids.findById(req.params.id);
        res.json({ success: true, message: 'Suivi modifié', data: suivi });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// DELETE /api/suivi-poids/:id
exports.delete = async (req, res) => {
    try {
        const deleted = await SuiviPoids.delete(req.params.id);
        if (!deleted) {
            return res.status(404).json({
                success: false,
                message: 'Suivi non trouvé'
            });
        }
        res.json({ success: true, message: 'Suivi supprimé' });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};