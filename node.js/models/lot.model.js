const db = require('../config/db');

class Lot {
    // Récupérer tous les lots
    // Juste récupérer les lots avec le nom de la race
    static async findAll() {
        const [rows] = await db.query(`
            SELECT 
                l.id,
                l.date_entree,
                l.nombre_initial,
                l.nombre_restant,
                l.age_entree_semaines,
                l.prix_achat_total,
                l.est_actif,
                r.nom AS race_nom
            FROM LOT l
            LEFT JOIN RACE r ON l.race_id = r.id
            ORDER BY l.date_entree DESC
        `);
        return rows;
    }

    // Récupérer un lot par ID
    static async findById(id) {
        const [rows] = await db.query(`
            SELECT 
                l.*, 
                r.nom as race_nom, 
                r.prix_vente_kg, 
                r.prix_achat_unitaire,
                DATE_FORMAT(l.date_entree, '%Y-%m-%d') as date_entree_formatted,
                (SELECT SUM(nombre_oeufs) FROM RECENSEMENT_OEUF WHERE lot_id = l.id) as total_oeufs,
                (SELECT SUM(nombre_morts) FROM MORTALITE WHERE lot_id = l.id) as total_morts
            FROM LOT l
            LEFT JOIN RACE r ON l.race_id = r.id
            WHERE l.id = ?
        `, [id]);

        if (rows.length === 0) return null;

        const row = rows[0];
        return {
            ...row,
            date_entree: row.date_entree_formatted,
            date_entree_formatted: undefined
        };
    }

    // Créer un nouveau lot
    static async create(lotData) {
        const { date_entree, nombre_initial, race_id, age_entree_semaines, prix_achat_total } = lotData;

        const [result] = await db.query(
            `INSERT INTO LOT 
             (date_entree, nombre_initial, nombre_restant, race_id, age_entree_semaines, prix_achat_total, est_actif) 
             VALUES (?, ?, ?, ?, ?, ?, ?)`,
            [date_entree, nombre_initial, nombre_initial, race_id, age_entree_semaines, prix_achat_total, 1]
        );

        return result.insertId;
    }

    // Mettre à jour un lot
    static async update(id, lotData) {
        const { date_entree, nombre_initial, race_id, age_entree_semaines, prix_achat_total } = lotData;

        const [result] = await db.query(
            `UPDATE LOT 
             SET date_entree = ?, 
                 nombre_initial = ?, 
                 race_id = ?, 
                 age_entree_semaines = ?, 
                 prix_achat_total = ?
             WHERE id = ?`,
            [date_entree, nombre_initial, race_id, age_entree_semaines, prix_achat_total, id]
        );

        return result.affectedRows > 0;
    }

    // Supprimer un lot
    static async delete(id) {
        const connection = await db.getConnection();
        await connection.beginTransaction();

        try {
            await connection.query('DELETE FROM RECENSEMENT_OEUF WHERE lot_id = ?', [id]);
            await connection.query('DELETE FROM MORTALITE WHERE lot_id = ?', [id]);
            await connection.query('DELETE FROM TRANSFORMATION_OEUF WHERE lot_source_id = ? OR lot_destination_id = ?', [id, id]);

            const [result] = await connection.query('DELETE FROM LOT WHERE id = ?', [id]);

            await connection.commit();
            return result.affectedRows > 0;
        } catch (error) {
            await connection.rollback();
            throw error;
        } finally {
            connection.release();
        }
    }

    // Récupérer toutes les races
    static async findAllRaces() {
        const [rows] = await db.query('SELECT * FROM RACE ORDER BY nom');
        return rows;
    }

    // Récupérer le suivi poids d'un lot
    static async getSuiviPoids(lotId) {
        const [rows] = await db.query(
            'SELECT * FROM SUIVI_POIDS WHERE lot_id = ? ORDER BY semaine',
            [lotId]
        );
        return rows;
    }

    // Ajouter un suivi poids
    static async addSuiviPoids(data) {
        const { lot_id, semaine, date_mesure, poids_recueilli_grammes, sakafo_consomme_grammes } = data;

        const [result] = await db.query(
            `INSERT INTO SUIVI_POIDS (lot_id, semaine, date_mesure, poids_recueilli_grammes, sakafo_consomme_grammes)
             VALUES (?, ?, ?, ?, ?)
             ON DUPLICATE KEY UPDATE
             date_mesure = VALUES(date_mesure),
             poids_recueilli_grammes = VALUES(poids_recueilli_grammes),
             sakafo_consomme_grammes = VALUES(sakafo_consomme_grammes)`,
            [lot_id, semaine, date_mesure, poids_recueilli_grammes, sakafo_consomme_grammes]
        );

        return result.insertId;
    }
}

module.exports = Lot;