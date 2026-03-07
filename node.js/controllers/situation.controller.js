const Situation = require('../models/situation.model');

// Calculer sakafo d'UNE semaine
function calculerSakafoSemaine(semaine, dateFiltre) {
    const dateMesure = semaine.date_mesure.toISOString().split('T')[0];

    // Semaine future → 0
    if (dateMesure > dateFiltre) return 0;

    // Semaine passée ou égale → 100%
    return semaine.sakafo_consomme_grammes;
}

// Calculer sakafo total en Ariary
function calculerSakafoLany(suiviPoids, dateFiltre, prixParGramme) {
    let totalGrammes = 0;

    for (const semaine of suiviPoids) {
        totalGrammes += calculerSakafoSemaine(semaine, dateFiltre);
    }

    return Math.round(totalGrammes * prixParGramme);
}

// Controller principal
exports.getSituation = async (req, res) => {
    try {
        const dateFiltre = req.query.date || new Date().toISOString().split('T')[0];

        const lots = await Situation.getLotsFiltres(dateFiltre);
        const situationLots = [];

        for (const lot of lots) {

            // 1. nb_akoho
            const totalMorts = await Situation.getMorts(lot.id, dateFiltre);
            const nb_akoho = lot.nombre_initial - Number(totalMorts);

            // 2. Suivi poids
            const suiviPoids = await Situation.getSuiviPoids(lot.id, dateFiltre);

            // 3. Sakafo
            const sakafo_lany = calculerSakafoLany(
                suiviPoids,
                dateFiltre,
                lot.sakafo_prix || 0
            );

            // 4. Poids moyen — sommer tous les poids_recueilli
            const poids_moyen = suiviPoids.reduce(
                (sum, semaine) => sum + semaine.poids_recueilli_grammes,
                0
            );

            // 5. Prix vente
            const prix_vente = Math.round(
                poids_moyen * (lot.prix_vente_gramme || 0) * nb_akoho
            );

            // 6. Atody
            const nb_atody = await Situation.getAtody(lot.id, dateFiltre);
            const prixUnitaireAtody = await Situation.getPrixAtody(lot.race_id);
            const prix_atody = Number(nb_atody) * prixUnitaireAtody;

            // 7. Bénéfice
            const benefice = Math.round(
                (prix_vente + prix_atody) - (Number(lot.prix_achat_total) + sakafo_lany)
            );

            situationLots.push({
                lot_id:      lot.id,
                race:        lot.race_nom,
                nb_akoho,
                achat_akoho: Number(lot.prix_achat_total),
                sakafo_lany,
                nb_morts:    Number(totalMorts),
                poids_moyen,
                prix_vente,
                nb_atody:    Number(nb_atody),
                prix_atody,
                benefice
            });
        }

        res.json({
            success: true,
            date_filtre: dateFiltre,
            data: situationLots
        });

    } catch (error) {
        console.error('Erreur getSituation:', error);
        res.status(500).json({
            success: false,
            message: 'Erreur serveur',
            error: error.message
        });
    }
};