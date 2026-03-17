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
                ro.pourcentage_lamokany,
                ROUND(ro.nombre_oeufs * ro.pourcentage_lamokany / 100) AS nb_lamokany,
                ro.nombre_oeufs - ROUND(ro.nombre_oeufs * ro.pourcentage_lamokany / 100) AS oeufs_valides,
                l.date_entree,
                r.nom              AS race_nom,
                r.duree_incubation,
                r.pourcentage_vavy,
                r.pourcentage_lahy,
                DATE_ADD(ro.date_recensement, INTERVAL r.duree_incubation DAY) AS date_incubation
            FROM RECENSEMENT_OEUF ro
            JOIN LOT l  ON l.id  = ro.lot_id
            JOIN RACE r ON r.id  = l.race_id
            ${condition}
            ORDER BY ro.date_recensement DESC
        `, params);

        return rows;
    }

    // Par ID
    static async findById(id) {
        const [rows] = await db.query(`
            SELECT
                ro.*,
                ROUND(ro.nombre_oeufs * ro.pourcentage_lamokany / 100) AS nb_lamokany,
                ro.nombre_oeufs - ROUND(ro.nombre_oeufs * ro.pourcentage_lamokany / 100) AS oeufs_valides,
                r.duree_incubation,
                r.pourcentage_vavy,
                r.pourcentage_lahy,
                DATE_ADD(ro.date_recensement, INTERVAL r.duree_incubation DAY) AS date_incubation
            FROM RECENSEMENT_OEUF ro
            JOIN LOT l  ON l.id = ro.lot_id
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
            SELECT COALESCE(SUM(nombre_oeufs), 0) AS total
            FROM RECENSEMENT_OEUF
            WHERE lot_id = ? AND date_recensement <= ?
        `, [lotId, dateFiltre]);
        return rows[0].total;
    }

    // Créer
    static async create(data, connection = db) {
        const [result] = await connection.query(`
            INSERT INTO RECENSEMENT_OEUF
                (lot_id, date_recensement, nombre_oeufs, pourcentage_lamokany)
            VALUES (?, ?, ?, ?)
        `, [
            data.lot_id,
            data.date_recensement,
            data.nombre_oeufs,
            data.pourcentage_lamokany || 0
        ]);
        return result.insertId;
    }

    // Modifier

    static async update(id, data) {
        const [result] = await db.query(`
            UPDATE RECENSEMENT_OEUF SET
                date_recensement    = ?,
                nombre_oeufs        = ?,
                pourcentage_lamokany = ?
            WHERE id = ?
        `, [
            data.date_recensement,
            data.nombre_oeufs,
            data.pourcentage_lamokany || 0,
            id
        ]);
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