const db = require('../config/db');

class TransformationOeuf {

    // Tous les transformations
    static async findAll() {
        const [rows] = await db.query(`
            SELECT 
                t.id,
                t.lot_source_id,
                t.date_transformation,
                t.nombre_oeufs,
                t.nombre_poussins_obtenus,
                t.nombre_perte,
                t.lot_destination_id,
                r.nom AS race_nom
            FROM TRANSFORMATION_OEUF t
            JOIN LOT l ON l.id = t.lot_source_id
            JOIN RACE r ON r.id = l.race_id
            ORDER BY t.date_transformation DESC
        `);
        return rows;
    }

    // Par ID
    static async findById(id) {
        const [rows] = await db.query(`
            SELECT 
                t.id,
                t.lot_source_id,
                t.date_transformation,
                t.nombre_oeufs,
                t.nombre_poussins_obtenus,
                t.nombre_perte,
                t.lot_destination_id,
                r.nom AS race_nom,
                r.id  AS race_id
            FROM TRANSFORMATION_OEUF t
            JOIN LOT l ON l.id = t.lot_source_id
            JOIN RACE r ON r.id = l.race_id
            WHERE t.id = ?
        `, [id]);
        return rows[0] || null;
    }

    // Par lot source
    static async findByLotSource(lotId) {
        const [rows] = await db.query(`
            SELECT 
                t.id,
                t.lot_source_id,
                t.date_transformation,
                t.nombre_oeufs,
                t.nombre_poussins_obtenus,
                t.nombre_perte,
                t.lot_destination_id,
                r.nom AS race_nom
            FROM TRANSFORMATION_OEUF t
            JOIN LOT l ON l.id = t.lot_source_id
            JOIN RACE r ON r.id = l.race_id
            WHERE t.lot_source_id = ?
            ORDER BY t.date_transformation DESC
        `, [lotId]);
        return rows;
    }

    // Créer — transaction complète
    static async create(data) {
        const connection = await db.getConnection();
        await connection.beginTransaction();

        try {
            const {
                lot_source_id,
                date_transformation,
                nombre_oeufs,
                nombre_poussins_obtenus,
                prix_achat_total_nouveau_lot,
                age_entree_semaines
            } = data;

            // Calculer la perte
            const nombre_perte = nombre_oeufs - nombre_poussins_obtenus;

            // 1. Récupérer la race du lot source
            const [lotSource] = await connection.query(`
                SELECT race_id FROM LOT WHERE id = ?
            `, [lot_source_id]);

            if (lotSource.length === 0) {
                throw new Error('Lot source non trouvé');
            }

            const race_id = lotSource[0].race_id;

            // 2. Créer le nouveau lot destination
            const [resultLot] = await connection.query(`
                INSERT INTO LOT 
                    (date_entree, nombre_initial, nombre_restant, race_id, 
                     age_entree_semaines, prix_achat_total, est_actif)
                VALUES (?, ?, ?, ?, ?, ?, 1)
            `, [
                date_transformation,
                nombre_poussins_obtenus,
                nombre_poussins_obtenus,
                race_id,
                age_entree_semaines || 0,
                prix_achat_total_nouveau_lot || 0
            ]);

            const lot_destination_id = resultLot.insertId;

            // 3. Enregistrer la transformation
            const [resultTransfo] = await connection.query(`
                INSERT INTO TRANSFORMATION_OEUF
                    (lot_source_id, date_transformation, nombre_oeufs,
                     nombre_poussins_obtenus, nombre_perte, lot_destination_id)
                VALUES (?, ?, ?, ?, ?, ?)
            `, [
                lot_source_id,
                date_transformation,
                nombre_oeufs,
                nombre_poussins_obtenus,
                nombre_perte,
                lot_destination_id
            ]);

            // 4. Déduire les atody du lot source (recensement négatif)
            await connection.query(`
                INSERT INTO RECENSEMENT_OEUF (lot_id, date_recensement, nombre_oeufs)
                VALUES (?, ?, ?)
            `, [lot_source_id, date_transformation, -nombre_oeufs]);

            await connection.commit();
            return resultTransfo.insertId;

        } catch (error) {
            await connection.rollback();
            throw error;
        } finally {
            connection.release();
        }
    }

    // Supprimer — annuler la transformation
    static async delete(id) {
        const connection = await db.getConnection();
        await connection.beginTransaction();

        try {
            // Récupérer les infos avant suppression
            const [rows] = await connection.query(`
                SELECT * FROM TRANSFORMATION_OEUF WHERE id = ?
            `, [id]);

            if (rows.length === 0) throw new Error('Transformation non trouvée');

            const transfo = rows[0];

            // 1. Supprimer le lot destination
            await connection.query(`
                DELETE FROM LOT WHERE id = ?
            `, [transfo.lot_destination_id]);

            // 2. Supprimer le recensement négatif lié
            await connection.query(`
                DELETE FROM RECENSEMENT_OEUF 
                WHERE lot_id = ? 
                AND date_recensement = ? 
                AND nombre_oeufs = ?
            `, [transfo.lot_source_id, transfo.date_transformation, -transfo.nombre_oeufs]);

            // 3. Supprimer la transformation
            await connection.query(`
                DELETE FROM TRANSFORMATION_OEUF WHERE id = ?
            `, [id]);

            await connection.commit();
            return true;

        } catch (error) {
            await connection.rollback();
            throw error;
        } finally {
            connection.release();
        }
    }
}

module.exports = TransformationOeuf;