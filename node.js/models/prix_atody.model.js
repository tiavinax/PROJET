const db = require('../config/db');

class PrixAtody {

    static async findAll() {
        const [rows] = await db.query(`
            SELECT 
                pa.id,
                pa.race_id,
                pa.prix_unitaire,
                pa.date,
                r.nom AS race_nom
            FROM PRIX_ATODY pa
            JOIN RACE r ON r.id = pa.race_id
            ORDER BY r.nom ASC
        `);
        return rows;
    }

    static async findById(id) {
        const [rows] = await db.query(`
            SELECT 
                pa.id,
                pa.race_id,
                pa.prix_unitaire,
                pa.date,
                r.nom AS race_nom
            FROM PRIX_ATODY pa
            JOIN RACE r ON r.id = pa.race_id
            WHERE pa.id = ?
        `, [id]);
        return rows[0] || null;
    }

    static async findByRace(raceId) {
        const [rows] = await db.query(`
            SELECT * FROM PRIX_ATODY WHERE race_id = ?
        `, [raceId]);
        return rows[0] || null;
    }

    static async create(data) {
        // Vérifier si cette race a déjà un prix
        const existe = await PrixAtody.findByRace(data.race_id);
        if (existe) {
            throw new Error('Cette race a déjà un prix atody — utilisez Modifier');
        }

        const [result] = await db.query(`
            INSERT INTO PRIX_ATODY (race_id, prix_unitaire, date)
            VALUES (?, ?, ?)
        `, [data.race_id, data.prix_unitaire, data.date]);

        return result.insertId;
    }

    static async update(id, data) {
        const [result] = await db.query(`
            UPDATE PRIX_ATODY SET
                prix_unitaire = ?,
                date          = ?
            WHERE id = ?
        `, [data.prix_unitaire, data.date, id]);
        return result.affectedRows > 0;
    }

    static async delete(id) {
        const [result] = await db.query(`
            DELETE FROM PRIX_ATODY WHERE id = ?
        `, [id]);
        return result.affectedRows > 0;
    }
}

module.exports = PrixAtody;