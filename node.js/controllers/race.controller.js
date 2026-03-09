const Race = require('../models/race.model');

exports.getAll = async (req, res) => {
    try {
        const races = await Race.findAll();
        res.json({ success: true, data: races });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

exports.getById = async (req, res) => {
    try {
        const race = await Race.findById(req.params.id);
        if (!race) {
            return res.status(404).json({
                success: false, message: 'Race non trouvée'
            });
        }
        res.json({ success: true, data: race });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

exports.create = async (req, res) => {
    try {
        const { nom, prix_vente_kg, prix_achat_unitaire, prix_vente_gramme } = req.body;

        if (!nom || !prix_vente_gramme) {
            return res.status(400).json({
                success: false,
                message: 'Nom et prix_vente_gramme obligatoires'
            });
        }

        const id = await Race.create(req.body);
        const nouvelle = await Race.findById(id);
        res.status(201).json({
            success: true,
            message: 'Race créée avec succès',
            data: nouvelle
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

exports.update = async (req, res) => {
    try {
        const updated = await Race.update(req.params.id, req.body);
        if (!updated) {
            return res.status(404).json({
                success: false, message: 'Race non trouvée'
            });
        }
        const race = await Race.findById(req.params.id);
        res.json({ success: true, message: 'Race modifiée', data: race });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

exports.delete = async (req, res) => {
    try {
        const deleted = await Race.delete(req.params.id);
        if (!deleted) {
            return res.status(404).json({
                success: false, message: 'Race non trouvée'
            });
        }
        res.json({ success: true, message: 'Race supprimée' });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};