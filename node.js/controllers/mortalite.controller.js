const Mortalite = require('../models/mortalite.model');

exports.getAll = async (req, res) => {
    try {
        const { lot_id } = req.query;
        const mortalites = await Mortalite.findAll(lot_id || null);
        res.json({ success: true, data: mortalites });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

exports.getById = async (req, res) => {
    try {
        const mortalite = await Mortalite.findById(req.params.id);
        if (!mortalite) {
            return res.status(404).json({
                success: false,
                message: 'Mortalité non trouvée'
            });
        }
        res.json({ success: true, data: mortalite });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

exports.create = async (req, res) => {
    try {
        const { lot_id, date_mortalite, nombre_morts } = req.body;

        if (!lot_id || !date_mortalite || !nombre_morts) {
            return res.status(400).json({
                success: false,
                message: 'Champs manquants : lot_id, date_mortalite, nombre_morts'
            });
        }

        const id = await Mortalite.create(req.body);
        const nouveau = await Mortalite.findById(id);

        res.status(201).json({
            success: true,
            message: 'Mortalité enregistrée',
            data: nouveau
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

exports.update = async (req, res) => {
    try {
        const updated = await Mortalite.update(req.params.id, req.body);
        if (!updated) {
            return res.status(404).json({
                success: false,
                message: 'Mortalité non trouvée'
            });
        }
        const mortalite = await Mortalite.findById(req.params.id);
        res.json({ success: true, message: 'Mortalité modifiée', data: mortalite });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

exports.delete = async (req, res) => {
    try {
        const deleted = await Mortalite.delete(req.params.id);
        if (!deleted) {
            return res.status(404).json({
                success: false,
                message: 'Mortalité non trouvée'
            });
        }
        res.json({ success: true, message: 'Mortalité supprimée' });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};