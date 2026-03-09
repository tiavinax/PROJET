const db = require('../config/db');

class Situation {

    // Récupérer tous les lots actifs à une date donnée
    static async getLotsFiltres(dateFiltre) {
        const [rows] = await db.query(`
            SELECT 
                l.id,
                l.date_entree,
                l.nombre_initial,
                l.prix_achat_total,
                l.race_id,
                r.nom           AS race_nom,
                r.prix_vente_gramme,
                ps.prix_par_gramme AS sakafo_prix
            FROM LOT l
            LEFT JOIN RACE r ON l.race_id = r.id
            LEFT JOIN PRIX_SAKAFO ps 
                ON ps.race_id = l.race_id 
            WHERE l.est_actif = 1
            AND l.date_entree <= ?
            ORDER BY l.date_entree DESC
        `, [dateFiltre]);

        return rows;
    }

    // Total morts d'un lot jusqu'à la date filtre
    static async getMorts(lotId, dateFiltre) {
        const [rows] = await db.query(`
            SELECT COALESCE(SUM(nombre_morts), 0) AS total_morts
            FROM MORTALITE
            WHERE lot_id = ?
            AND date_mortalite <= ?
        `, [lotId, dateFiltre]);

        return rows[0].total_morts;
    }

    // Suivi poids d'un lot jusqu'à la date filtre
    // Remplacer getSuiviPoids — maintenant par race
    static async getSuiviPoids(raceId) {
        const [rows] = await db.query(`
        SELECT 
            semaine,
            poids_recueilli_grammes,
            sakafo_consomme_grammes
        FROM SUIVI_POIDS
        WHERE race_id = ?
        ORDER BY semaine ASC
    `, [raceId]);

        return rows;
    }

    // Total atody d'un lot jusqu'à la date filtre
    static async getAtody(lotId, dateFiltre) {
        const [rows] = await db.query(`
            SELECT COALESCE(SUM(nombre_oeufs), 0) AS total_atody
            FROM RECENSEMENT_OEUF
            WHERE lot_id = ?
            AND date_recensement <= ?
        `, [lotId, dateFiltre]);

        return rows[0].total_atody;
    }

    // Prix atody selon la race
    static async getPrixAtody(raceId) {
        const [rows] = await db.query(`
            SELECT prix_unitaire
            FROM PRIX_ATODY
            WHERE race_id = ?
            ORDER BY date_debut DESC
            LIMIT 1
        `, [raceId]);

        return rows.length > 0 ? rows[0].prix_unitaire : 0;
    }
}

module.exports = Situation;