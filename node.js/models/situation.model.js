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
        // Total recensé avant dateFiltre
        const [recRows] = await db.query(`
        SELECT COALESCE(SUM(nombre_oeufs), 0) AS total_recense
        FROM RECENSEMENT_OEUF
        WHERE lot_id = ?
        AND date_recensement <= ?
        AND nombre_oeufs > 0
    `, [lotId, dateFiltre]);

        const total_recense = Number(recRows[0].total_recense);

        // Transformés + lamokany — seulement si transformation faite avant dateFiltre
        const [transfoRows] = await db.query(`
        SELECT 
            COALESCE(SUM(nombre_oeufs), 0)  AS total_oeufs_transfo,
            COALESCE(SUM(nb_lamokany), 0)   AS total_lamokany
        FROM TRANSFORMATION_OEUF
        WHERE lot_source_id = ?
        AND date_transformation <= ?
    `, [lotId, dateFiltre]);

        const total_oeufs_transfo = Number(transfoRows[0].total_oeufs_transfo);
        // const total_lamokany = Number(transfoRows[0].total_lamokany);

        // Atody vendables = recensé - transformés - lamokany
        return Math.max(0, total_recense - total_oeufs_transfo);
        // Note : total_oeufs_transfo inclut déjà les lamokany
        // car nombre_oeufs = total recensé (27000+3000=30000)
    }

    static async getLamokany(lotId, dateFiltre) {
        // Lamokany = connus seulement après transformation
        const [rows] = await db.query(`
        SELECT COALESCE(SUM(nb_lamokany), 0) AS total_lamokany
        FROM TRANSFORMATION_OEUF
        WHERE lot_source_id = ?
        AND date_transformation <= ?
    `, [lotId, dateFiltre]);

        return rows[0].total_lamokany;
    }

    // Atody valides d'un lot (sans les lamokany)
    static async getAtodyValides(lotId, dateFiltre) {
        return await Situation.getAtody(lotId, dateFiltre);
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

            COALESCE((
                SELECT SUM(ro.nombre_oeufs)
                FROM RECENSEMENT_OEUF ro
                JOIN LOT l ON l.id = ro.lot_id
                WHERE l.race_id = r.id
                AND ro.nombre_oeufs > 0
                AND ro.date_recensement <= ?
            ), 0) AS total_oeufs_collectes,

            COALESCE((
                SELECT SUM(ROUND(t.nombre_poussins_obtenus * r2.pourcentage_vavy / 100))
                FROM TRANSFORMATION_OEUF t
                JOIN LOT l ON l.id = t.lot_source_id
                JOIN RACE r2 ON r2.id = l.race_id
                WHERE r2.id = r.id
                AND t.date_transformation <= ?
            ), 0) AS total_vavy_ajoutees,

            COALESCE((
                SELECT SUM(
                    ROUND(
                        (l.nombre_initial
                            - COALESCE((
                                SELECT SUM(m.nombre_morts)
                                FROM MORTALITE m
                                WHERE m.lot_id = l.id
                                AND m.date_mortalite <= ?
                            ), 0)
                        ) * l.pourcentage_sexe / 100
                        - COALESCE((
                            SELECT SUM(ROUND(m2.nombre_morts * m2.pourcentage_vavy / 100))
                            FROM MORTALITE m2
                            WHERE m2.lot_id = l.id
                            AND m2.date_mortalite <= ?
                        ), 0)
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
    `, [
            dateFiltre,   // 1 — total_oeufs_collectes
            dateFiltre,   // 2 — total_vavy_ajoutees
            dateFiltre,   // 3 — mortalite dans nb_vavy
            dateFiltre,   // 4 — vavy_mortes dans nb_vavy
            dateFiltre    // 5 — date_entree <= ? ← manquait !
        ]);

        return rows.map(race => {
            const capacite_initiale = Number(race.capacite_initiale);
            const total_oeufs_collectes = Number(race.total_oeufs_collectes);
            const nb_vavy = Number(race.nb_vavy_vivantes);

            const capacite_max_globale = nb_vavy * capacite_initiale;
            const capacite_restante_globale = capacite_max_globale - total_oeufs_collectes;
            const capacite_restante_par_poule = nb_vavy > 0
                ? Math.round((capacite_restante_globale / nb_vavy) * 100) / 100
                : 0;

            return {
                ...race,
                nb_vavy_vivantes: nb_vavy,
                capacite_max_globale: Math.round(capacite_max_globale),
                total_oeufs_collectes,
                capacite_restante_globale: Math.round(capacite_restante_globale),
                capacite_restante: capacite_restante_par_poule
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

}

module.exports = Situation;