const db = require('../config/db');

class Race {

    static async findAll() {
        const [rows] = await db.query(`
            SELECT * FROM RACE ORDER BY nom ASC
        `);
        return rows;
    }

    static async findById(id) {
        const [rows] = await db.query(`
            SELECT * FROM RACE WHERE id = ?
        `, [id]);
        return rows[0] || null;
    }

    static async create(data) {
        const [result] = await db.query(`
            INSERT INTO RACE (nom, prix_vente_kg, prix_achat_unitaire, prix_vente_gramme)
            VALUES (?, ?, ?, ?)
        `, [
            data.nom,
            data.prix_vente_kg,
            data.prix_achat_unitaire,
            data.prix_vente_gramme
        ]);
        return result.insertId;
    }

    static async update(id, data) {
        const [result] = await db.query(`
            UPDATE RACE SET
                nom                  = ?,
                prix_vente_kg        = ?,
                prix_achat_unitaire  = ?,
                prix_vente_gramme    = ?
            WHERE id = ?
        `, [
            data.nom,
            data.prix_vente_kg,
            data.prix_achat_unitaire,
            data.prix_vente_gramme,
            id
        ]);
        return result.affectedRows > 0;
    }

    static async delete(id) {
        const [result] = await db.query(`
            DELETE FROM RACE WHERE id = ?
        `, [id]);
        return result.affectedRows > 0;
    }
}

module.exports = Race;