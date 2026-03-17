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
                r.nom  AS race_nom,
                r.prix_vente_gramme,
                r.prix_vente_kg,
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
            ORDER BY date DESC
            LIMIT 1
        `, [raceId]);

        return rows.length > 0 ? rows[0].prix_unitaire : 0;
    }


    // Ajouter ces méthodes dans la classe Situation

    // Atody lamokany d'un lot jusqu'à la date filtre
    static async getLamokany(lotId, dateFiltre) {
        const [rows] = await db.query(`
        SELECT 
            COALESCE(SUM(ROUND(nombre_oeufs * pourcentage_lamokany / 100)), 0) AS total_lamokany
        FROM RECENSEMENT_OEUF
        WHERE lot_id = ?
        AND date_recensement <= ?
        AND nombre_oeufs > 0
    `, [lotId, dateFiltre]);
        return rows[0].total_lamokany;
    }

    // Capacité pondaison de chaque race à la date filtre
    static async getCapaciteRaces(dateFiltre) {
        const [rows] = await db.query(`
        SELECT
            r.id,
            r.nom,
            r.capacite_pondation AS capacite_initiale,
            r.pourcentage_vavy,
            r.pourcentage_lahy,
            r.duree_incubation,

            -- Total oeufs collectés jusqu'à dateFiltre
            COALESCE((
                SELECT SUM(ro.nombre_oeufs)
                FROM RECENSEMENT_OEUF ro
                JOIN LOT l ON l.id = ro.lot_id
                WHERE l.race_id = r.id
                AND ro.nombre_oeufs > 0
                AND ro.date_recensement <= ?
            ), 0) AS total_oeufs_collectes,

            -- Vavy ajoutées par incubation jusqu'à dateFiltre
            COALESCE((
                SELECT SUM(ROUND(t.nombre_poussins_obtenus * r2.pourcentage_vavy / 100))
                FROM TRANSFORMATION_OEUF t
                JOIN LOT l ON l.id = t.lot_source_id
                JOIN RACE r2 ON r2.id = l.race_id
                WHERE r2.id = r.id
                AND t.date_transformation <= ?
            ), 0) AS total_vavy_ajoutees,

            -- Total vavy vivantes (tous lots confondus)
            COALESCE((
                SELECT SUM(
                    ROUND(
                        (l.nombre_initial - COALESCE((
                            SELECT SUM(m.nombre_morts)
                            FROM MORTALITE m
                            WHERE m.lot_id = l.id
                            AND m.date_mortalite <= ?
                        ), 0))
                        * l.pourcentage_sexe / 100
                    )
                )
                FROM LOT l
                WHERE l.race_id = r.id
                AND l.est_actif = 1
                AND l.date_entree <= ?
                AND (l.sexe = 'vavy' OR l.sexe = 'mixte')
            ), 0) AS nb_vavy_vivantes

        FROM RACE r
        ORDER BY r.nom ASC
    `, [dateFiltre, dateFiltre, dateFiltre, dateFiltre]);

        return rows.map(race => {
            const capacite_initiale = Number(race.capacite_initiale);
            const total_oeufs_collectes = Number(race.total_oeufs_collectes);
            const nb_vavy = Number(race.nb_vavy_vivantes);

            // Capacite max globale = nb_vavy × capacite_par_poule
            const capacite_max_globale = nb_vavy * capacite_initiale;

            // Capacite restante globale
            const capacite_restante_globale = capacite_max_globale - total_oeufs_collectes;

            // Capacite restante par poule = capacite_restante_globale / nb_vavy
            const capacite_restante_par_poule = nb_vavy > 0
                ? Math.round((capacite_restante_globale / nb_vavy) * 100) / 100
                : 0;

            return {
                ...race,
                nb_vavy_vivantes: nb_vavy,
                capacite_max_globale: Math.round(capacite_max_globale),
                total_oeufs_collectes,
                capacite_restante_globale: Math.round(capacite_restante_globale),
                capacite_restante: capacite_restante_par_poule  // ← par poule
            };
        });
    }

    // Capacité globale par race = capacite_pondation × nb_vavy_vivantes
    static async getCapaciteGlobaleRaces(dateFiltre) {
        const [rows] = await db.query(`
        SELECT
            r.id,
            r.nom,
            r.capacite_pondation,
            r.pourcentage_vavy,

            -- Nombre total de vavy vivantes de cette race à dateFiltre
            -- vavy = nb_akoho_restant × pourcentage_sexe / 100 (si sexe = vavy ou mixte)
            COALESCE((
                SELECT SUM(
                    ROUND((l.nombre_initial 
                        - COALESCE((
                            SELECT SUM(m.nombre_morts)
                            FROM MORTALITE m
                            WHERE m.lot_id = l.id
                            AND m.date_mortalite <= ?
                        ), 0)
                    ) * l.pourcentage_sexe / 100
                ))
                FROM LOT l
                WHERE l.race_id = r.id
                AND l.est_actif = 1
                AND l.date_entree <= ?
                AND (l.sexe = 'vavy' OR l.sexe = 'mixte')
            ), 0) AS nb_vavy_vivantes,

            -- Total oeufs collectés jusqu'à dateFiltre
            COALESCE((
                SELECT SUM(ro.nombre_oeufs)
                FROM RECENSEMENT_OEUF ro
                JOIN LOT l ON l.id = ro.lot_id
                WHERE l.race_id = r.id
                AND ro.nombre_oeufs > 0
                AND ro.date_recensement <= ?
            ), 0) AS total_oeufs_collectes

        FROM RACE r
        ORDER BY r.nom ASC
    `, [dateFiltre, dateFiltre, dateFiltre]);

        return rows.map(race => {
            const nb_vavy = Number(race.nb_vavy_vivantes);
            const capacite_max = Number(race.capacite_pondation) * nb_vavy;
            const oeufs_collectes = Number(race.total_oeufs_collectes);
            const capacite_restante = capacite_max - oeufs_collectes;

            return {
                race_id: race.id,
                race_nom: race.nom,
                capacite_par_poule: Number(race.capacite_pondation),
                nb_vavy_vivantes: nb_vavy,
                capacite_max,           // 40 × 90 = 3600
                total_oeufs_collectes: oeufs_collectes,
                capacite_restante,      // 3600 - 3500 = 100
                pourcentage_utilise: capacite_max > 0
                    ? Math.round(oeufs_collectes / capacite_max * 100)
                    : 0
            };
        });
    }

    // Atody valides d'un lot (sans les lamokany)
    static async getAtodyValides(lotId, dateFiltre) {
        const [rows] = await db.query(`
        SELECT 
            COALESCE(SUM(nombre_oeufs - ROUND(nombre_oeufs * pourcentage_lamokany / 100)), 0) AS total_valides
        FROM RECENSEMENT_OEUF
        WHERE lot_id = ?
        AND date_recensement <= ?
        AND nombre_oeufs > 0
    `, [lotId, dateFiltre]);
        return rows[0].total_valides;
    }

}

module.exports = Situation;