const db = require('../config/db');

class RecensementOeuf {

    // Tous les recensements — avec ou sans filtre lot
    static async findAll(lotId = null) {
        const condition = lotId ? 'WHERE ro.lot_id = ?' : '';
        const params = lotId ? [lotId] : [];

        const [rows] = await db.query(`
            SELECT 
                ro.id,
                ro.lot_id,
                ro.date_recensement,
                ro.nombre_oeufs,
                r.nom AS race_nom
            FROM RECENSEMENT_OEUF ro
            JOIN LOT l ON l.id = ro.lot_id
            JOIN RACE r ON r.id = l.race_id
            ${condition}
            ORDER BY ro.lot_id ASC, ro.date_recensement ASC
        `, params);

        return rows;
    }

    // Par ID
    static async findById(id) {
        const [rows] = await db.query(`
            SELECT 
                ro.id,
                ro.lot_id,
                ro.date_recensement,
                ro.nombre_oeufs,
                r.nom AS race_nom
            FROM RECENSEMENT_OEUF ro
            JOIN LOT l ON l.id = ro.lot_id
            JOIN RACE r ON r.id = l.race_id
            WHERE ro.id = ?
        `, [id]);

        return rows[0] || null;
    }

    // Par lot et date filtre
    static async findByLotAndDate(lotId, dateFiltre) {
        const [rows] = await db.query(`
            SELECT 
                ro.id,
                ro.lot_id,
                ro.date_recensement,
                ro.nombre_oeufs,
                r.nom AS race_nom
            FROM RECENSEMENT_OEUF ro
            JOIN LOT l ON l.id = ro.lot_id
            JOIN RACE r ON r.id = l.race_id
            WHERE ro.lot_id = ?
            AND ro.date_recensement <= ?
            ORDER BY ro.date_recensement ASC
        `, [lotId, dateFiltre]);

        return rows;
    }

    // Total oeufs d'un lot jusqu'à une date
    static async getTotalOeufs(lotId, dateFiltre) {
        const [rows] = await db.query(`
            SELECT COALESCE(SUM(nombre_oeufs), 0) AS total_oeufs
            FROM RECENSEMENT_OEUF
            WHERE lot_id = ?
            AND date_recensement <= ?
        `, [lotId, dateFiltre]);

        return rows[0].total_oeufs;
    }

    // Créer
    static async create(data) {
        const [result] = await db.query(`
            INSERT INTO RECENSEMENT_OEUF (lot_id, date_recensement, nombre_oeufs)
            VALUES (?, ?, ?)
        `, [data.lot_id, data.date_recensement, data.nombre_oeufs]);

        return result.insertId;
    }

    // Modifier
    static async update(id, data) {
        const [result] = await db.query(`
            UPDATE RECENSEMENT_OEUF SET
                date_recensement = ?,
                nombre_oeufs     = ?
            WHERE id = ?
        `, [data.date_recensement, data.nombre_oeufs, id]);

        return result.affectedRows > 0;
    }

    // Supprimer
    static async delete(id) {
        const [result] = await db.query(`
            DELETE FROM RECENSEMENT_OEUF WHERE id = ?
        `, [id]);

        return result.affectedRows > 0;
    }
}

module.exports = RecensementOeuf;