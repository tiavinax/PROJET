const PrixSakafo = require('../models/prix_sakafo.model');

exports.getAll = async (req, res) => {
    try {
        const prix = await PrixSakafo.findAll();
        res.json({ success: true, data: prix });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

exports.getById = async (req, res) => {
    try {
        const prix = await PrixSakafo.findById(req.params.id);
        if (!prix) {
            return res.status(404).json({
                success: false,
                message: 'Prix non trouvé'
            });
        }
        res.json({ success: true, data: prix });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

exports.create = async (req, res) => {
    try {
        const { race_id, prix_par_gramme } = req.body;

        // Validation
        if (!race_id || !prix_par_gramme || prix_par_gramme <= 0) {
            return res.status(400).json({
                success: false,
                message: 'race_id et prix_par_gramme obligatoires'
            });
        }

        // Vérifier si cette race a déjà un prix
        const existe = await PrixSakafo.findByRace(race_id);
        if (existe) {
            return res.status(400).json({
                success: false,
                message: 'Cette race a déjà un prix — utilisez Modifier'
            });
        }

        const id = await PrixSakafo.create(race_id, prix_par_gramme);
        const nouveau = await PrixSakafo.findById(id);

        res.status(201).json({
            success: true,
            message: 'Prix créé avec succès',
            data: nouveau
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

exports.update = async (req, res) => {
    try {
        const { prix_par_gramme } = req.body;

        if (!prix_par_gramme || prix_par_gramme <= 0) {
            return res.status(400).json({
                success: false,
                message: 'Prix invalide'
            });
        }

        const updated = await PrixSakafo.update(req.params.id, prix_par_gramme);
        if (!updated) {
            return res.status(404).json({
                success: false,
                message: 'Prix non trouvé'
            });
        }

        const prix = await PrixSakafo.findById(req.params.id);
        res.json({ success: true, message: 'Prix mis à jour', data: prix });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};