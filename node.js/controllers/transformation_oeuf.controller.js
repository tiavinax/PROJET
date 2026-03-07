const TransformationOeuf = require('../models/transformation_oeuf.model');
const RecensementOeuf = require('../models/recensement_oeuf.model');

// GET /api/transformation-oeuf
exports.getAll = async (req, res) => {
    try {
        const transformations = await TransformationOeuf.findAll();
        res.json({ success: true, data: transformations });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// GET /api/transformation-oeuf/:id
exports.getById = async (req, res) => {
    try {
        const transformation = await TransformationOeuf.findById(req.params.id);
        if (!transformation) {
            return res.status(404).json({
                success: false,
                message: 'Transformation non trouvée'
            });
        }
        res.json({ success: true, data: transformation });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// POST /api/transformation-oeuf
exports.create = async (req, res) => {
    try {
        const {
            lot_source_id,
            date_transformation,
            nombre_oeufs,
            nombre_poussins_obtenus
        } = req.body;

        // Validation
        if (!lot_source_id || !date_transformation ||
            !nombre_oeufs || !nombre_poussins_obtenus) {
            return res.status(400).json({
                success: false,
                message: 'Champs manquants'
            });
        }

        // Vérifier que poussins <= oeufs
        if (nombre_poussins_obtenus > nombre_oeufs) {
            return res.status(400).json({
                success: false,
                message: 'Nombre de poussins ne peut pas dépasser le nombre d\'œufs'
            });
        }

        // Vérifier stock atody disponible
        const today = new Date().toISOString().split('T')[0];
        const totalAtody = await RecensementOeuf.getTotalOeufs(lot_source_id, today);

        if (nombre_oeufs > totalAtody) {
            return res.status(400).json({
                success: false,
                message: `Stock insuffisant : seulement ${totalAtody} atody disponibles`
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
        res.status(500).json({ success: false, message: error.message });
    }
};

// DELETE /api/transformation-oeuf/:id
exports.delete = async (req, res) => {
    try {
        await TransformationOeuf.delete(req.params.id);
        res.json({
            success: true,
            message: 'Transformation annulée avec succès'
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};