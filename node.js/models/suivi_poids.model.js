const db = require('../config/db');

class SuiviPoids {

    // Tous les suivis — avec ou sans filtre race
    static async findAll(raceId = null) {
        const condition = raceId ? 'WHERE sp.race_id = ?' : '';
        const params = raceId ? [raceId] : [];

        const [rows] = await db.query(`
            SELECT 
                sp.id,
                sp.race_id,
                sp.semaine,
                sp.poids_recueilli_grammes,
                sp.sakafo_consomme_grammes,
                r.nom AS race_nom
            FROM SUIVI_POIDS sp
            JOIN RACE r ON r.id = sp.race_id
            ${condition}
            ORDER BY sp.race_id ASC, sp.semaine ASC
        `, params);

        return rows;
    }

    // Par ID
    static async findById(id) {
        const [rows] = await db.query(`
            SELECT 
                sp.id,
                sp.race_id,
                sp.semaine,
                sp.poids_recueilli_grammes,
                sp.sakafo_consomme_grammes,
                r.nom AS race_nom
            FROM SUIVI_POIDS sp
            JOIN RACE r ON r.id = sp.race_id
            WHERE sp.id = ?
        `, [id]);

        return rows[0] || null;
    }

    // Par race — pour le calcul situation
    static async findByRace(raceId) {
        const [rows] = await db.query(`
            SELECT 
                semaine,
                poids_recueilli_grammes,
                sakafo_consomme_grammes
            FROM SUIVI_POIDS
            WHERE race_id = ?
            ORDER BY semaine ASC
        `, [raceId]);

        return rows;
    }

    // Créer
    static async create(data) {
        // Vérifier doublon
        const [existe] = await db.query(`
            SELECT id FROM SUIVI_POIDS
            WHERE race_id = ? AND semaine = ?
        `, [data.race_id, data.semaine]);

        if (existe.length > 0) {
            throw new Error(`Semaine ${data.semaine} existe déjà pour cette race`);
        }

        const [result] = await db.query(`
            INSERT INTO SUIVI_POIDS (race_id, semaine, poids_recueilli_grammes, sakafo_consomme_grammes)
            VALUES (?, ?, ?, ?)
        `, [
            data.race_id,
            data.semaine,
            data.poids_recueilli_grammes,
            data.sakafo_consomme_grammes
        ]);

        return result.insertId;
    }

    // Modifier
    static async update(id, data) {
        const [result] = await db.query(`
            UPDATE SUIVI_POIDS SET
                poids_recueilli_grammes = ?,
                sakafo_consomme_grammes = ?
            WHERE id = ?
        `, [
            data.poids_recueilli_grammes,
            data.sakafo_consomme_grammes,
            id
        ]);

        return result.affectedRows > 0;
    }

    // Supprimer
    static async delete(id) {
        const [result] = await db.query(`
            DELETE FROM SUIVI_POIDS WHERE id = ?
        `, [id]);

        return result.affectedRows > 0;
    }
}

module.exports = SuiviPoids;