const TransformationOeuf = require('../models/transformation_oeuf.model');

exports.getAll = async (req, res) => {
    try {
        const transformations = await TransformationOeuf.findAll();
        res.json({ success: true, data: transformations });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

exports.getById = async (req, res) => {
    try {
        const t = await TransformationOeuf.findById(req.params.id);
        if (!t) return res.status(404).json({ success: false, message: 'Non trouvé' });
        res.json({ success: true, data: t });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// GET /api/transformation-oeuf/recensements-disponibles/:lotId
exports.getRecensementsDisponibles = async (req, res) => {
    try {
        const recensements = await TransformationOeuf.getRecensementsDisponibles(req.params.lotId);
        res.json({ success: true, data: recensements });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

exports.create = async (req, res) => {
    try {
        const {
            lot_source_id,
            recensement_source_id,
            date_transformation,
            nombre_oeufs,
            nombre_poussins_obtenus
        } = req.body;

        if (!lot_source_id || !recensement_source_id ||
            !date_transformation || !nombre_oeufs || !nombre_poussins_obtenus) {
            return res.status(400).json({
                success: false, message: 'Champs manquants'
            });
        }

        if (nombre_poussins_obtenus > nombre_oeufs) {
            return res.status(400).json({
                success: false,
                message: 'Poussins ne peut pas dépasser les œufs utilisés'
            });
        }

        const id = await TransformationOeuf.create(req.body);
        const nouvelle = await TransformationOeuf.findById(id);

        res.status(201).json({
            success: true,
            message: 'Transformation créée avec succès',
            data: nouvelle
        });

    } catch (error) {
        res.status(400).json({ success: false, message: error.message });
    }
};

exports.delete = async (req, res) => {
    try {
        await TransformationOeuf.delete(req.params.id);
        res.json({ success: true, message: 'Transformation annulée' });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};