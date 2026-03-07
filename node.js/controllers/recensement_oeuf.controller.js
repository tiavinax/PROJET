const RecensementOeuf = require('../models/recensement_oeuf.model');

// GET /api/recensement-oeuf
// GET /api/recensement-oeuf?lot_id=1
exports.getAll = async (req, res) => {
    try {
        const { lot_id } = req.query;
        const recensements = await RecensementOeuf.findAll(lot_id || null);
        res.json({ success: true, data: recensements });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// GET /api/recensement-oeuf/:id
exports.getById = async (req, res) => {
    try {
        const recensement = await RecensementOeuf.findById(req.params.id);
        if (!recensement) {
            return res.status(404).json({
                success: false,
                message: 'Recensement non trouvé'
            });
        }
        res.json({ success: true, data: recensement });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// GET /api/recensement-oeuf/lot/:lotId/date?date=2026-01-22
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

        const recensements = await RecensementOeuf.findByLotAndDate(lotId, date);
        res.json({ success: true, data: recensements });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// POST /api/recensement-oeuf
exports.create = async (req, res) => {
    try {
        const { lot_id, date_recensement, nombre_oeufs } = req.body;

        // Validation
        if (!lot_id || !date_recensement || !nombre_oeufs) {
            return res.status(400).json({
                success: false,
                message: 'Champs manquants : lot_id, date_recensement, nombre_oeufs'
            });
        }

        const id = await RecensementOeuf.create(req.body);
        const nouveau = await RecensementOeuf.findById(id);

        res.status(201).json({
            success: true,
            message: 'Recensement créé avec succès',
            data: nouveau
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// PUT /api/recensement-oeuf/:id
exports.update = async (req, res) => {
    try {
        const updated = await RecensementOeuf.update(req.params.id, req.body);

        if (!updated) {
            return res.status(404).json({
                success: false,
                message: 'Recensement non trouvé'
            });
        }

        const recensement = await RecensementOeuf.findById(req.params.id);
        res.json({
            success: true,
            message: 'Recensement modifié avec succès',
            data: recensement
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// DELETE /api/recensement-oeuf/:id
exports.delete = async (req, res) => {
    try {
        const deleted = await RecensementOeuf.delete(req.params.id);

        if (!deleted) {
            return res.status(404).json({
                success: false,
                message: 'Recensement non trouvé'
            });
        }

        res.json({
            success: true,
            message: 'Recensement supprimé avec succès'
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};