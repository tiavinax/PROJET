const Mortalite = require('../models/mortalite.model');

exports.getAll = async (req, res) => {
    try {
        const { lot_id } = req.query;
        const morts = await Mortalite.findAll(lot_id || null);
        res.json({ success: true, data: morts });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

exports.getById = async (req, res) => {
    try {
        const mort = await Mortalite.findById(req.params.id);
        if (!mort) return res.status(404).json({
            success: false, message: 'Mortalité non trouvée'
        });
        res.json({ success: true, data: mort });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

exports.create = async (req, res) => {
    try {
        const { lot_id, date_mortalite, nombre_morts,
                pourcentage_vavy, pourcentage_lahy } = req.body;

        if (!lot_id || !date_mortalite || !nombre_morts) {
            return res.status(400).json({
                success: false,
                message: 'lot_id, date_mortalite, nombre_morts obligatoires'
            });
        }

        const pctVavy = pourcentage_vavy ?? 50;
        const pctLahy = pourcentage_lahy ?? 50;

        if (pctVavy + pctLahy !== 100) {
            return res.status(400).json({
                success: false,
                message: 'pourcentage_vavy + pourcentage_lahy doit égaler 100'
            });
        }

        const id   = await Mortalite.create({ ...req.body, pourcentage_vavy: pctVavy, pourcentage_lahy: pctLahy });
        const mort = await Mortalite.findById(id);

        res.status(201).json({
            success: true,
            message: 'Mortalité enregistrée',
            data: mort
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

exports.update = async (req, res) => {
    try {
        const pctVavy = req.body.pourcentage_vavy ?? 50;
        const pctLahy = req.body.pourcentage_lahy ?? 50;

        if (pctVavy + pctLahy !== 100) {
            return res.status(400).json({
                success: false,
                message: 'pourcentage_vavy + pourcentage_lahy doit égaler 100'
            });
        }

        const updated = await Mortalite.update(req.params.id, {
            ...req.body, pourcentage_vavy: pctVavy, pourcentage_lahy: pctLahy
        });

        if (!updated) return res.status(404).json({
            success: false, message: 'Mortalité non trouvée'
        });

        const mort = await Mortalite.findById(req.params.id);
        res.json({ success: true, message: 'Mortalité modifiée', data: mort });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

exports.delete = async (req, res) => {
    try {
        const deleted = await Mortalite.delete(req.params.id);
        if (!deleted) return res.status(404).json({
            success: false, message: 'Mortalité non trouvée'
        });
        res.json({ success: true, message: 'Mortalité supprimée' });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};