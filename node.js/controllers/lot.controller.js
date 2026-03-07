const Lot = require('../models/lot.model');

// Fonction utilitaire pour formater les dates
const formatLot = (lot) => {
    if (!lot) return null;

    return {
        ...lot,
        date_entree: lot.date_entree ? new Date(lot.date_entree).toISOString().split('T')[0] : null,
        // Convertir les nombres décimaux
        prix_achat_total: parseFloat(lot.prix_achat_total),
        prix_vente_kg: lot.prix_vente_kg ? parseFloat(lot.prix_vente_kg) : null,
        prix_achat_unitaire: lot.prix_achat_unitaire ? parseFloat(lot.prix_achat_unitaire) : null,
        // Convertir les booléens
        est_actif: lot.est_actif === 1 || lot.est_actif === true
    };
};


// Récupérer tous les lots
exports.getAllLots = async (req, res) => {
    try {
        const lots = await Lot.findAll();

        res.json({
            success: true,
            data: lots
        });

    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Erreur serveur',
            error: error.message
        });
    }
};
exports.getLotById = async (req, res) => {
    try {
        const lot = await Lot.findById(req.params.id);
        if (!lot) {
            return res.status(404).json({
                success: false,
                message: 'Lot non trouvé'
            });
        }
        res.json({
            success: true,
            data: formatLot(lot)
        });
    } catch (error) {
        console.error('Erreur getLotById:', error);
        res.status(500).json({
            success: false,
            message: 'Erreur lors de la récupération du lot',
            error: error.message
        });
    }
};

// Le reste des fonctions reste identique
exports.createLot = async (req, res) => {
    try {
        const id = await Lot.create(req.body);
        const nouveauLot = await Lot.findById(id);
        res.status(201).json({
            success: true,
            message: 'Lot créé avec succès',
            data: formatLot(nouveauLot)
        });
    } catch (error) {
        console.error('Erreur createLot:', error);
        res.status(500).json({
            success: false,
            message: 'Erreur lors de la création du lot',
            error: error.message
        });
    }
};

exports.updateLot = async (req, res) => {
    try {
        const updated = await Lot.update(req.params.id, req.body);
        if (!updated) {
            return res.status(404).json({
                success: false,
                message: 'Lot non trouvé'
            });
        }
        const lotModifie = await Lot.findById(req.params.id);
        res.json({
            success: true,
            message: 'Lot modifié avec succès',
            data: formatLot(lotModifie)
        });
    } catch (error) {
        console.error('Erreur updateLot:', error);
        res.status(500).json({
            success: false,
            message: 'Erreur lors de la modification du lot',
            error: error.message
        });
    }
};

exports.deleteLot = async (req, res) => {
    try {
        const deleted = await Lot.delete(req.params.id);
        if (!deleted) {
            return res.status(404).json({
                success: false,
                message: 'Lot non trouvé'
            });
        }
        res.json({
            success: true,
            message: 'Lot supprimé avec succès'
        });
    } catch (error) {
        console.error('Erreur deleteLot:', error);
        res.status(500).json({
            success: false,
            message: 'Erreur lors de la suppression du lot',
            error: error.message
        });
    }
};

exports.getAllRaces = async (req, res) => {
    try {
        const races = await Lot.findAllRaces();
        // Formater les races si nécessaire
        const racesFormatees = races.map(race => ({
            ...race,
            prix_vente_kg: parseFloat(race.prix_vente_kg),
            prix_achat_unitaire: parseFloat(race.prix_achat_unitaire)
        }));

        res.json({
            success: true,
            data: racesFormatees
        });
    } catch (error) {
        console.error('Erreur getAllRaces:', error);
        res.status(500).json({
            success: false,
            message: 'Erreur lors de la récupération des races',
            error: error.message
        });
    }
};