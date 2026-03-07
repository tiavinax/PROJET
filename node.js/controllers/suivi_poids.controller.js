const SuiviPoids = require('../models/suivi_poids.model');

// GET /api/suivi-poids?lot_id=1
exports.getAll = async (req, res) => {
    try {
        // Si lot_id fourni → filtrer par lot, sinon tout récupérer
        const { lot_id } = req.query;

        const suivis = lot_id
            ? await SuiviPoids.findByLot(lot_id)
            : await SuiviPoids.findAll();

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

// GET /api/suivi-poids/lot/:lotId/date?date=2026-01-22
exports.getByLotAndDate = async (req, res) => {
    try {
        const { lotId } = req.params;
        const { date } = req.query;

        if (!date) {
            return res.status(400).json({
                success: false,
                message: 'Paramètre date manquant'
            });
        }

        const suivis = await SuiviPoids.findByLotAndDate(lotId, date);
        res.json({ success: true, data: suivis });

    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// POST /api/suivi-poids
exports.create = async (req, res) => {
    try {
        const { lot_id, semaine, date_mesure, 
                poids_recueilli_grammes, sakafo_consomme_grammes } = req.body;

        // Validation simple
        if (!lot_id || semaine === undefined || !date_mesure || 
            !poids_recueilli_grammes || !sakafo_consomme_grammes) {
            return res.status(400).json({
                success: false,
                message: 'Champs manquants : lot_id, semaine, date_mesure, poids_recueilli_grammes, sakafo_consomme_grammes'
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
        // Erreur doublon semaine
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
        res.json({
            success: true,
            message: 'Suivi modifié avec succès',
            data: suivi
        });

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

        res.json({
            success: true,
            message: 'Suivi supprimé avec succès'
        });

    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};