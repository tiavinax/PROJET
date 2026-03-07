const db = require('../config/db');

class Mortalite {

    static async findAll(lotId = null) {
        const condition = lotId ? 'WHERE m.lot_id = ?' : '';
        const params = lotId ? [lotId] : [];

        const [rows] = await db.query(`
            SELECT 
                m.id,
                m.lot_id,
                m.date_mortalite,
                m.nombre_morts,
                r.nom AS race_nom
            FROM MORTALITE m
            JOIN LOT l ON l.id = m.lot_id
            JOIN RACE r ON r.id = l.race_id
            ${condition}
            ORDER BY m.lot_id ASC, m.date_mortalite ASC
        `, params);

        return rows;
    }

    static async findById(id) {
        const [rows] = await db.query(`
            SELECT 
                m.id,
                m.lot_id,
                m.date_mortalite,
                m.nombre_morts,
                r.nom AS race_nom
            FROM MORTALITE m
            JOIN LOT l ON l.id = m.lot_id
            JOIN RACE r ON r.id = l.race_id
            WHERE m.id = ?
        `, [id]);

        return rows[0] || null;
    }

    static async create(data) {
        const [result] = await db.query(`
            INSERT INTO MORTALITE (lot_id, date_mortalite, nombre_morts)
            VALUES (?, ?, ?)
        `, [data.lot_id, data.date_mortalite, data.nombre_morts]);

        return result.insertId;
    }

    static async update(id, data) {
        const [result] = await db.query(`
            UPDATE MORTALITE SET
                date_mortalite = ?,
                nombre_morts   = ?
            WHERE id = ?
        `, [data.date_mortalite, data.nombre_morts, id]);

        return result.affectedRows > 0;
    }

    static async delete(id) {
        const [result] = await db.query(`
            DELETE FROM MORTALITE WHERE id = ?
        `, [id]);

        return result.affectedRows > 0;
    }
}

module.exports = Mortalite;