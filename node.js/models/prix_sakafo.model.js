const db = require('../config/db');

class PrixSakafo {

    static async findAll() {
        const [rows] = await db.query(`
            SELECT 
                ps.id,
                ps.race_id,
                ps.prix_par_gramme,
                r.nom AS race_nom
            FROM PRIX_SAKAFO ps
            JOIN RACE r ON r.id = ps.race_id
            ORDER BY r.nom ASC
        `);
        return rows;
    }

    static async findById(id) {
        const [rows] = await db.query(`
            SELECT 
                ps.id,
                ps.race_id,
                ps.prix_par_gramme,
                r.nom AS race_nom
            FROM PRIX_SAKAFO ps
            JOIN RACE r ON r.id = ps.race_id
            WHERE ps.id = ?
        `, [id]);
        return rows[0] || null;
    }

    // Vérifier si une race a déjà un prix
    static async findByRace(raceId) {
        const [rows] = await db.query(`
        SELECT * FROM PRIX_SAKAFO WHERE race_id = ?
    `, [raceId]);
        return rows[0] || null;
    }

    // Créer un nouveau prix pour une race
    static async create(race_id, prix_par_gramme) {
        const [result] = await db.query(`
        INSERT INTO PRIX_SAKAFO (race_id, prix_par_gramme)
        VALUES (?, ?)
    `, [race_id, prix_par_gramme]);
        return result.insertId;
    }

    // Juste mettre à jour le prix
    static async update(id, prix_par_gramme) {
        const [result] = await db.query(`
            UPDATE PRIX_SAKAFO SET prix_par_gramme = ?
            WHERE id = ?
        `, [prix_par_gramme, id]);
        return result.affectedRows > 0;
    }
}

module.exports = PrixSakafo;