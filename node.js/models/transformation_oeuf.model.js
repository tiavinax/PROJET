const db = require('../config/db');

class TransformationOeuf {

    static async findAll() {
        const [rows] = await db.query(`
            SELECT 
                t.id,
                t.lot_source_id,
                t.recensement_source_id,
                t.date_transformation,
                t.nombre_oeufs,
                t.nombre_poussins_obtenus,
                t.nombre_perte,
                t.lot_destination_id,
                l.date_entree       AS source_date_entree,
                r.nom               AS source_race_nom,
                ro.date_recensement AS recensement_date,
                ro.nombre_oeufs     AS recensement_total
            FROM TRANSFORMATION_OEUF t
            JOIN LOT l   ON l.id  = t.lot_source_id
            JOIN RACE r  ON r.id  = l.race_id
            JOIN RECENSEMENT_OEUF ro ON ro.id = t.recensement_source_id
            ORDER BY t.date_transformation DESC
        `);
        return rows;
    }

    static async findById(id) {
        const [rows] = await db.query(`
            SELECT 
                t.*,
                r.nom               AS source_race_nom,
                ro.date_recensement AS recensement_date,
                ro.nombre_oeufs     AS recensement_total
            FROM TRANSFORMATION_OEUF t
            JOIN LOT l   ON l.id  = t.lot_source_id
            JOIN RACE r  ON r.id  = l.race_id
            JOIN RECENSEMENT_OEUF ro ON ro.id = t.recensement_source_id
            WHERE t.id = ?
        `, [id]);
        return rows[0] || null;
    }

    // Stock restant d'UN recensement précis
    static async getStockRecensement(recensementId) {
        // Nombre d'oeufs du recensement
        const [recRows] = await db.query(`
            SELECT nombre_oeufs FROM RECENSEMENT_OEUF WHERE id = ?
        `, [recensementId]);

        if (recRows.length === 0) throw new Error('Recensement non trouvé');

        const totalOeufs = recRows[0].nombre_oeufs;

        // Déjà transformés depuis ce recensement
        const [transfoRows] = await db.query(`
            SELECT COALESCE(SUM(nombre_oeufs), 0) AS deja_transformes
            FROM TRANSFORMATION_OEUF
            WHERE recensement_source_id = ?
        `, [recensementId]);

        const dejaTransformes = Number(transfoRows[0].deja_transformes);

        return totalOeufs - dejaTransformes;
    }

    // Recensements disponibles d'un lot (stock > 0)
    static async getRecensementsDisponibles(lotId) {
        const [recensements] = await db.query(`
            SELECT 
                ro.id,
                ro.lot_id,
                ro.date_recensement,
                ro.nombre_oeufs,
                COALESCE(SUM(t.nombre_oeufs), 0) AS deja_transformes,
                ro.nombre_oeufs - COALESCE(SUM(t.nombre_oeufs), 0) AS stock_restant
            FROM RECENSEMENT_OEUF ro
            LEFT JOIN TRANSFORMATION_OEUF t ON t.recensement_source_id = ro.id
            WHERE ro.lot_id = ?
            AND ro.nombre_oeufs > 0
            GROUP BY ro.id
            HAVING stock_restant > 0
            ORDER BY ro.date_recensement ASC
        `, [lotId]);

        return recensements;
    }

    static async create(data) {
        const connection = await db.getConnection();
        await connection.beginTransaction();

        try {
            const {
                lot_source_id,
                recensement_source_id,
                date_transformation,
                nombre_oeufs,
                nombre_poussins_obtenus,
                prix_achat_total_nouveau_lot,
                age_entree_semaines
            } = data;

            // Vérifier stock restant du recensement choisi
            const stockRestant = await TransformationOeuf.getStockRecensement(recensement_source_id);

            if (nombre_oeufs > stockRestant) {
                throw new Error(`Stock insuffisant : seulement ${stockRestant} œufs disponibles dans ce recensement`);
            }

            const nombre_perte = nombre_oeufs - nombre_poussins_obtenus;

            // 1. Récupérer la race du lot source
            const [lotSource] = await connection.query(`
                SELECT race_id FROM LOT WHERE id = ?
            `, [lot_source_id]);

            if (lotSource.length === 0) throw new Error('Lot source non trouvé');

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
                    (lot_source_id, recensement_source_id, date_transformation,
                     nombre_oeufs, nombre_poussins_obtenus, nombre_perte, lot_destination_id)
                VALUES (?, ?, ?, ?, ?, ?, ?)
            `, [
                lot_source_id,
                recensement_source_id,
                date_transformation,
                nombre_oeufs,
                nombre_poussins_obtenus,
                nombre_perte,
                lot_destination_id
            ]);

            await connection.commit();
            return resultTransfo.insertId;

        } catch (error) {
            await connection.rollback();
            throw error;
        } finally {
            connection.release();
        }
    }

    static async delete(id) {
        const connection = await db.getConnection();
        await connection.beginTransaction();

        try {
            // Récupérer la transformation
            const [rows] = await connection.query(`
                SELECT * FROM TRANSFORMATION_OEUF WHERE id = ?
            `, [id]);

            if (rows.length === 0) throw new Error('Transformation non trouvée');

            const transfo = rows[0];

            // Supprimer le lot destination
            await connection.query(`
                DELETE FROM LOT WHERE id = ?
            `, [transfo.lot_destination_id]);

            // Supprimer la transformation
            await connection.query(`
                DELETE FROM TRANSFORMATION_OEUF WHERE id = ?
            `, [id]);

            await connection.commit();

        } catch (error) {
            await connection.rollback();
            throw error;
        } finally {
            connection.release();
        }
    }
}

module.exports = TransformationOeuf;