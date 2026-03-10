const db = require('../config/db');

class Reinitialisation {

    static async reinitialiser() {
        const connection = await db.getConnection();
        await connection.beginTransaction();

        try {
            // Désactiver les contraintes FK pendant la suppression
            await connection.query(`SET FOREIGN_KEY_CHECKS = 0`);

            // Supprimer dans l'ordre (enfants avant parents)
            await connection.query(`DELETE FROM TRANSFORMATION_OEUF`);
            await connection.query(`DELETE FROM RECENSEMENT_OEUF`);
            await connection.query(`DELETE FROM MORTALITE`);
            await connection.query(`DELETE FROM SUIVI_POIDS`);
            await connection.query(`DELETE FROM PRIX_ATODY`);
            await connection.query(`DELETE FROM PRIX_SAKAFO`);
            await connection.query(`DELETE FROM LOT`);
            await connection.query(`DELETE FROM RACE`);

            // Reset auto-increment
            await connection.query(`ALTER TABLE TRANSFORMATION_OEUF AUTO_INCREMENT = 1`);
            await connection.query(`ALTER TABLE RECENSEMENT_OEUF AUTO_INCREMENT = 1`);
            await connection.query(`ALTER TABLE MORTALITE AUTO_INCREMENT = 1`);
            await connection.query(`ALTER TABLE SUIVI_POIDS AUTO_INCREMENT = 1`);
            await connection.query(`ALTER TABLE PRIX_ATODY AUTO_INCREMENT = 1`);
            await connection.query(`ALTER TABLE PRIX_SAKAFO AUTO_INCREMENT = 1`);
            await connection.query(`ALTER TABLE LOT AUTO_INCREMENT = 1`);
            await connection.query(`ALTER TABLE RACE AUTO_INCREMENT = 1`);

            // Réactiver les contraintes FK
            await connection.query(`SET FOREIGN_KEY_CHECKS = 1`);

            await connection.commit();

        } catch (error) {
            await connection.rollback();
            await connection.query(`SET FOREIGN_KEY_CHECKS = 1`);
            throw error;
        } finally {
            connection.release();
        }
    }
}

module.exports = Reinitialisation;