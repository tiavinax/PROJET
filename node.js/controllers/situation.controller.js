const Situation = require('../models/situation.model');

// Convertir n'importe quelle date en "YYYY-MM-DD"
function toDateStr(date) {
    const d = new Date(date);
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
}

// Calculer le nombre de jours entre deux dates "YYYY-MM-DD"
function diffJours(dateDebut, dateFin) {
    const d1 = new Date(dateDebut + 'T00:00:00');
    const d2 = new Date(dateFin + 'T00:00:00');
    return Math.floor((d2 - d1) / (1000 * 60 * 60 * 24));
}

// Calculer sakafo_lany en grammes pour un lot
function calculerSakafoLanyGrammes(suiviPoids, dateEntreeLot, dateFiltre) {
    const dateEntree = toDateStr(dateEntreeLot);
    let total = 0;

    for (const s of suiviPoids) {

        // S0 — pas de sakafo
        if (s.semaine === 0) continue;

        // Bornes de la période
        // debut = dateEntree + (N-1)*7
        // fin   = dateEntree + N*7 - 1
        const debutJour = (s.semaine - 1) * 7;
        const finJour = (s.semaine * 7) - 1;

        const debut = new Date(dateEntree + 'T00:00:00');
        debut.setDate(debut.getDate() + debutJour);
        const debutStr = toDateStr(debut);

        const fin = new Date(dateEntree + 'T00:00:00');
        fin.setDate(fin.getDate() + finJour);
        const finStr = toDateStr(fin);

        // Cas 1 — période future
        if (debutStr > dateFiltre) continue;

        // Cas 2 — période complète passée
        if (finStr < dateFiltre) {
            total += s.sakafo_consomme_grammes;
            continue;
        }

        // Cas 3 — période en cours
        const jours = diffJours(debutStr, dateFiltre) + 1;
        total += (s.sakafo_consomme_grammes / 7) * jours;
    }

    return total;
}

// Calculer poids moyen pour un lot
function calculerPoidsMoyen(suiviPoids, dateEntreeLot, dateFiltre) {
    const dateEntree = toDateStr(dateEntreeLot);
    let total = 0;

    for (const s of suiviPoids) {

        // Date de cette semaine = dateEntree + semaine*7
        const dateSemaine = new Date(dateEntree + 'T00:00:00');
        dateSemaine.setDate(dateSemaine.getDate() + s.semaine * 7);
        const dateSemaineStr = toDateStr(dateSemaine);

        // S0 — poids initial complet si date_entree <= dateFiltre
        if (s.semaine === 0) {
            if (dateSemaineStr <= dateFiltre) {
                total += s.poids_recueilli_grammes;
            }
            continue;
        }

        // Bornes de la période
        const debutJour = (s.semaine - 1) * 7;
        const debut = new Date(dateEntree + 'T00:00:00');
        debut.setDate(debut.getDate() + debutJour);
        const debutStr = toDateStr(debut);

        const finJour = (s.semaine * 7) - 1;
        const fin = new Date(dateEntree + 'T00:00:00');
        fin.setDate(fin.getDate() + finJour);
        const finStr = toDateStr(fin);

        // Période future → 0
        if (debutStr > dateFiltre) continue;

        // Période complète
        if (finStr < dateFiltre) {
            total += s.poids_recueilli_grammes;
            continue;
        }

        // Période en cours — proportionnel
        const jours = diffJours(debutStr, dateFiltre) + 1;
        total += (s.poids_recueilli_grammes / 7) * jours;
    }

    return total;
}

exports.getSituation = async (req, res) => {
    try {
        const dateFiltre = req.query.date || toDateStr(new Date());

        const lots = await Situation.getLotsFiltres(dateFiltre);
        const situationLots = [];

        for (const lot of lots) {

            // 1. nb_akoho
            const totalMorts = await Situation.getMorts(lot.id, dateFiltre);
            const nb_akoho = lot.nombre_initial - Number(totalMorts);

            // 2. Suivi poids par race
            const suiviPoids = await Situation.getSuiviPoids(lot.race_id);

            // 3. Sakafo
            const sakafoGrammes = calculerSakafoLanyGrammes(
                suiviPoids,
                lot.date_entree,
                dateFiltre
            );
            const sakafo_lany = sakafoGrammes * Number(lot.sakafo_prix || 0) * nb_akoho;
            // const sakafo_lany = sakafoGrammes * Number(lot.sakafo_prix || 0);


            // 4. Poids moyen
            const poids_moyen = calculerPoidsMoyen(
                suiviPoids,
                lot.date_entree,
                dateFiltre
            );

            // 5. Prix vente
            const prix_vente = poids_moyen * Number(lot.prix_vente_gramme || 0) * nb_akoho;

            // 6. Atody
            const nb_atody = await Situation.getAtody(lot.id, dateFiltre);
            const prixUnitaireAtody = await Situation.getPrixAtody(lot.race_id);
            const prix_atody = Number(nb_atody) * Number(prixUnitaireAtody);

            // 7. Bénéfice
            const benefice = (prix_vente + prix_atody) - (Number(lot.prix_achat_total) + sakafo_lany);

            situationLots.push({
                lot_id: lot.id,
                race: lot.race_nom,
                nb_akoho,
                achat_akoho: Number(lot.prix_achat_total),
                sakafo_lany: Math.round(sakafo_lany * 100) / 100,
                nb_morts: Number(totalMorts),
                poids_moyen: Math.round(poids_moyen * 1000) / 1000,
                prix_vente: Math.round(prix_vente * 100) / 100,
                nb_atody: Number(nb_atody),
                prix_atody: Math.round(prix_atody * 100) / 100,
                benefice: Math.round(benefice * 100) / 100
            });
        }

        const totale = situationLots.reduce((acc, lot) => ({
            total_akoho_vivants: acc.total_akoho_vivants + lot.nb_akoho,
            total_morts: acc.total_morts + lot.nb_morts,
            total_oeufs: acc.total_oeufs + lot.nb_atody,
            chiffre_affaires: acc.chiffre_affaires + lot.prix_vente + lot.prix_atody,
            charges_totales: acc.charges_totales + lot.achat_akoho + lot.sakafo_lany,
            benefice_total: acc.benefice_total + lot.benefice,
            somme_poids: acc.somme_poids + (lot.poids_moyen * lot.nb_akoho)
        }), {
            total_akoho_vivants: 0,
            total_morts: 0,
            total_oeufs: 0,
            chiffre_affaires: 0,
            charges_totales: 0,
            benefice_total: 0,
            somme_poids: 0
        });

        const total_lots_actifs = situationLots.length;
        const poids_moyen_global = totale.total_akoho_vivants > 0
            ? totale.somme_poids / totale.total_akoho_vivants
            : 0;
        const taux_mortalite = situationLots.reduce((acc, lot) =>
            acc + (lot.nb_morts / (lot.nb_akoho + lot.nb_morts) * 100), 0) / total_lots_actifs || 0;

        const globale = {
            total_lots_actifs,
            total_akoho_vivants: totale.total_akoho_vivants,
            total_morts: totale.total_morts,
            total_oeufs: totale.total_oeufs,
            chiffre_affaires: Math.round(totale.chiffre_affaires * 100) / 100,
            charges_totales: Math.round(totale.charges_totales * 100) / 100,
            benefice_total: Math.round(totale.benefice_total * 100) / 100,
            taux_mortalite: Math.round(taux_mortalite * 100) / 100,
            poids_moyen_global: Math.round(poids_moyen_global * 1000) / 1000
        };

        res.json({
            success: true,
            date_filtre: dateFiltre,
            globale, 
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