const db = require('../config/db');

class Mortalite {

    static async findAll(lotId = null) {
        const condition = lotId ? 'WHERE m.lot_id = ?' : '';
        const params    = lotId ? [lotId] : [];

        const [rows] = await db.query(`
            SELECT
                m.id,
                m.lot_id,
                m.date_mortalite,
                m.nombre_morts,
                m.pourcentage_vavy,
                m.pourcentage_lahy,
                ROUND(m.nombre_morts * m.pourcentage_vavy / 100) AS nb_vavy_morts,
                ROUND(m.nombre_morts * m.pourcentage_lahy / 100) AS nb_lahy_morts,
                l.race_id,
                r.nom AS race_nom
            FROM MORTALITE m
            JOIN LOT l  ON l.id = m.lot_id
            JOIN RACE r ON r.id = l.race_id
            ${condition}
            ORDER BY m.date_mortalite DESC
        `, params);

        return rows;
    }

    static async findById(id) {
        const [rows] = await db.query(`
            SELECT
                m.*,
                ROUND(m.nombre_morts * m.pourcentage_vavy / 100) AS nb_vavy_morts,
                ROUND(m.nombre_morts * m.pourcentage_lahy / 100) AS nb_lahy_morts,
                l.race_id,
                r.nom AS race_nom
            FROM MORTALITE m
            JOIN LOT l  ON l.id = m.lot_id
            JOIN RACE r ON r.id = l.race_id
            WHERE m.id = ?
        `, [id]);
        return rows[0] || null;
    }

    static async create(data) {
        const [result] = await db.query(`
            INSERT INTO MORTALITE
                (lot_id, date_mortalite, nombre_morts, pourcentage_vavy, pourcentage_lahy)
            VALUES (?, ?, ?, ?, ?)
        `, [
            data.lot_id,
            data.date_mortalite,
            data.nombre_morts,
            data.pourcentage_vavy ?? 50,
            data.pourcentage_lahy ?? 50
        ]);
        return result.insertId;
    }

    static async update(id, data) {
        const [result] = await db.query(`
            UPDATE MORTALITE SET
                date_mortalite   = ?,
                nombre_morts     = ?,
                pourcentage_vavy = ?,
                pourcentage_lahy = ?
            WHERE id = ?
        `, [
            data.date_mortalite,
            data.nombre_morts,
            data.pourcentage_vavy ?? 50,
            data.pourcentage_lahy ?? 50,
            id
        ]);
        return result.affectedRows > 0;
    }

    static async delete(id) {
        const [result] = await db.query(`
            DELETE FROM MORTALITE WHERE id = ?
        `, [id]);
        return result.affectedRows > 0;
    }

    // Total vavy mortes d'un lot jusqu'à dateFiltre
    static async getVavyMortes(lotId, dateFiltre) {
        const [rows] = await db.query(`
            SELECT COALESCE(
                SUM(ROUND(nombre_morts * pourcentage_vavy / 100)), 0
            ) AS total_vavy_mortes
            FROM MORTALITE
            WHERE lot_id = ?
            AND date_mortalite <= ?
        `, [lotId, dateFiltre]);
        return Number(rows[0].total_vavy_mortes);
    }
}

module.exports = Mortalite;