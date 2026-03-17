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
            INSERT INTO RACE (
                nom, prix_vente_kg, prix_achat_unitaire, prix_vente_gramme,
                pourcentage_vavy, pourcentage_lahy,
                duree_incubation, capacite_pondation
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)
        `, [
            data.nom,
            data.prix_vente_kg       || 0,
            data.prix_achat_unitaire || 0,
            data.prix_vente_gramme   || 0,
            data.pourcentage_vavy    || 50,
            data.pourcentage_lahy    || 50,
            data.duree_incubation    || 21,
            data.capacite_pondation  || 0
        ]);
        return result.insertId;
    }

    static async update(id, data) {
        const [result] = await db.query(`
            UPDATE RACE SET
                nom                 = ?,
                prix_vente_kg       = ?,
                prix_achat_unitaire = ?,
                prix_vente_gramme   = ?,
                pourcentage_vavy    = ?,
                pourcentage_lahy    = ?,
                duree_incubation    = ?,
                capacite_pondation  = ?
            WHERE id = ?
        `, [
            data.nom,
            data.prix_vente_kg       || 0,
            data.prix_achat_unitaire || 0,
            data.prix_vente_gramme   || 0,
            data.pourcentage_vavy    || 50,
            data.pourcentage_lahy    || 50,
            data.duree_incubation    || 21,
            data.capacite_pondation  || 0,
            id
        ]);
        return result.affectedRows > 0;
    }

    // Déduire capacité au recensement
    static async deduireCapacite(raceId, nbOeufs, connection = db) {
        await connection.query(`
            UPDATE RACE SET capacite_pondation = capacite_pondation - ?
            WHERE id = ?
        `, [nbOeufs, raceId]);
    }

    // Ajouter capacité au nouveau lot (nouvelles vavy)
    static async ajouterCapacite(raceId, nbVavy, connection = db) {
        await connection.query(`
            UPDATE RACE SET capacite_pondation = capacite_pondation + ?
            WHERE id = ?
        `, [nbVavy, raceId]);
    }

    static async delete(id) {
        const [result] = await db.query(`
            DELETE FROM RACE WHERE id = ?
        `, [id]);
        return result.affectedRows > 0;
    }
}

module.exports = Race;