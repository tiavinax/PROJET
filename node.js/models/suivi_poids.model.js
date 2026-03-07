const db = require('../config/db');

class SuiviPoids {

    // Récupérer tous les suivis d'un lot
    static async findByLot(lotId) {
        const [rows] = await db.query(`
            SELECT 
                sp.id,
                sp.lot_id,
                sp.semaine,
                sp.date_mesure,
                sp.poids_recueilli_grammes,
                sp.sakafo_consomme_grammes,
                l.date_entree,
                r.nom AS race_nom
            FROM SUIVI_POIDS sp
            JOIN LOT l ON l.id = sp.lot_id
            JOIN RACE r ON r.id = l.race_id
            WHERE sp.lot_id = ?
            ORDER BY sp.semaine ASC
        `, [lotId]);
        return rows;
    }

    // Récupérer un suivi par ID
    static async findById(id) {
        const [rows] = await db.query(`
            SELECT 
                sp.id,
                sp.lot_id,
                sp.semaine,
                sp.date_mesure,
                sp.poids_recueilli_grammes,
                sp.sakafo_consomme_grammes,
                r.nom AS race_nom
            FROM SUIVI_POIDS sp
            JOIN LOT l ON l.id = sp.lot_id
            JOIN RACE r ON r.id = l.race_id
            WHERE sp.id = ?
        `, [id]);
        return rows[0] || null;
    }

    // Récupérer les suivis d'un lot jusqu'à une date filtre
    static async findByLotAndDate(lotId, dateFiltre) {
        const [rows] = await db.query(`
            SELECT 
                sp.id,
                sp.lot_id,
                sp.semaine,
                sp.date_mesure,
                sp.poids_recueilli_grammes,
                sp.sakafo_consomme_grammes,
                r.nom AS race_nom
            FROM SUIVI_POIDS sp
            JOIN LOT l ON l.id = sp.lot_id
            JOIN RACE r ON r.id = l.race_id
            WHERE sp.lot_id = ?
            AND sp.date_mesure <= ?
            ORDER BY sp.semaine ASC
        `, [lotId, dateFiltre]);
        return rows;
    }

    // Récupérer tous les suivis de tous les lots
    static async findAll() {
        const [rows] = await db.query(`
            SELECT 
                sp.id,
                sp.lot_id,
                sp.semaine,
                sp.date_mesure,
                sp.poids_recueilli_grammes,
                sp.sakafo_consomme_grammes,
                r.nom AS race_nom
            FROM SUIVI_POIDS sp
            JOIN LOT l ON l.id = sp.lot_id
            JOIN RACE r ON r.id = l.race_id
            ORDER BY sp.lot_id ASC, sp.semaine ASC
        `);
        return rows;
    }

    // Créer un nouveau suivi
    static async create(data) {
        // Vérifier si la semaine existe déjà pour ce lot
        const [existe] = await db.query(`
            SELECT id FROM SUIVI_POIDS 
            WHERE lot_id = ? AND semaine = ?
        `, [data.lot_id, data.semaine]);

        if (existe.length > 0) {
            throw new Error(`Semaine ${data.semaine} existe déjà pour ce lot`);
        }

        const [result] = await db.query(`
            INSERT INTO SUIVI_POIDS 
                (lot_id, semaine, date_mesure, poids_recueilli_grammes, sakafo_consomme_grammes)
            VALUES (?, ?, ?, ?, ?)
        `, [
            data.lot_id,
            data.semaine,
            data.date_mesure,
            data.poids_recueilli_grammes,
            data.sakafo_consomme_grammes
        ]);

        return result.insertId;
    }

    // Modifier un suivi
    static async update(id, data) {
        const [result] = await db.query(`
            UPDATE SUIVI_POIDS SET
                date_mesure                = ?,
                poids_recueilli_grammes    = ?,
                sakafo_consomme_grammes    = ?
            WHERE id = ?
        `, [
            data.date_mesure,
            data.poids_recueilli_grammes,
            data.sakafo_consomme_grammes,
            id
        ]);

        return result.affectedRows > 0;
    }

    // Supprimer un suivi
    static async delete(id) {
        const [result] = await db.query(`
            DELETE FROM SUIVI_POIDS WHERE id = ?
        `, [id]);

        return result.affectedRows > 0;
    }

    // Calculer le poids cumulé d'un lot à une date donnée
    static async getPoidsTotal(lotId, dateFiltre) {
        const [rows] = await db.query(`
            SELECT COALESCE(SUM(poids_recueilli_grammes), 0) AS poids_total
            FROM SUIVI_POIDS
            WHERE lot_id = ?
            AND date_mesure <= ?
        `, [lotId, dateFiltre]);

        return rows[0].poids_total;
    }
}

module.exports = SuiviPoids;