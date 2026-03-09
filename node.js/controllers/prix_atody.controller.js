const PrixAtody = require('../models/prix_atody.model');

exports.getAll = async (req, res) => {
    try {
        const prix = await PrixAtody.findAll();
        res.json({ success: true, data: prix });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

exports.getById = async (req, res) => {
    try {
        const prix = await PrixAtody.findById(req.params.id);
        if (!prix) {
            return res.status(404).json({
                success: false, message: 'Prix non trouvé'
            });
        }
        res.json({ success: true, data: prix });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

exports.create = async (req, res) => {
    try {
        const { race_id, prix_unitaire, date } = req.body;

        if (!race_id || !prix_unitaire) {
            return res.status(400).json({
                success: false,
                message: 'race_id et prix_unitaire obligatoires'
            });
        }

        const id = await PrixAtody.create(req.body);
        const nouveau = await PrixAtody.findById(id);

        res.status(201).json({
            success: true,
            message: 'Prix atody créé',
            data: nouveau
        });
    } catch (error) {
        res.status(400).json({ success: false, message: error.message });
    }
};

exports.update = async (req, res) => {
    try {
        const { prix_unitaire, date } = req.body;

        if (!prix_unitaire || prix_unitaire <= 0) {
            return res.status(400).json({
                success: false, message: 'Prix invalide'
            });
        }

        const updated = await PrixAtody.update(req.params.id, req.body);
        if (!updated) {
            return res.status(404).json({
                success: false, message: 'Prix non trouvé'
            });
        }

        const prix = await PrixAtody.findById(req.params.id);
        res.json({ success: true, message: 'Prix modifié', data: prix });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

exports.delete = async (req, res) => {
    try {
        const deleted = await PrixAtody.delete(req.params.id);
        if (!deleted) {
            return res.status(404).json({
                success: false, message: 'Prix non trouvé'
            });
        }
        res.json({ success: true, message: 'Prix supprimé' });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};