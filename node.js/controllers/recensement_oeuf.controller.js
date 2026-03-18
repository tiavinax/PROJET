const RecensementOeuf = require('../models/recensement_oeuf.model');
const Race = require('../models/race.model');
const TransformationOeuf = require('../models/transformation_oeuf.model');

exports.getAll = async (req, res) => {
    try {
        const { lot_id } = req.query;
        const recensements = await RecensementOeuf.findAll(lot_id || null);
        res.json({ success: true, data: recensements });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

exports.getById = async (req, res) => {
    try {
        const rec = await RecensementOeuf.findById(req.params.id);
        if (!rec) return res.status(404).json({
            success: false, message: 'Recensement non trouvé'
        });
        res.json({ success: true, data: rec });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

exports.create = async (req, res) => {
    const connection = await require('../config/db').getConnection();
    await connection.beginTransaction();

    try {
        const { lot_id, date_recensement, nombre_oeufs, pourcentage_lamokany } = req.body;

        if (!lot_id || !date_recensement || !nombre_oeufs) {
            return res.status(400).json({
                success: false, message: 'lot_id, date_recensement, nombre_oeufs obligatoires'
            });
        }

        // Récupérer la race du lot
        const [lotRows] = await connection.query(`
            SELECT l.race_id, r.duree_incubation, r.pourcentage_vavy, r.pourcentage_lahy
            FROM LOT l JOIN RACE r ON r.id = l.race_id
            WHERE l.id = ?
        `, [lot_id]);

        if (lotRows.length === 0) {
            return res.status(404).json({ success: false, message: 'Lot non trouvé' });
        }

        const race = lotRows[0];

        // Calculs
        const pctLamokany = pourcentage_lamokany || 0;
        const nb_lamokany = Math.round(nombre_oeufs * pctLamokany / 100);
        const oeufs_valides = nombre_oeufs - nb_lamokany;
        const nb_lamokany_transfo = Math.round(nombre_oeufs * pctLamokany / 100);
        const oeufs_a_incuber = nombre_oeufs - nb_lamokany_transfo;

        // 1. Créer le recensement
        const recId = await RecensementOeuf.create({
            lot_id,
            date_recensement,
            nombre_oeufs,
            pourcentage_lamokany: pctLamokany
        }, connection);

        // 2. Déduire capacité pondaison de la race
        // await Race.deduireCapacite(race.race_id, nombre_oeufs, connection);

        // 3. Créer la transformation automatique si oeufs_valides > 0
        let nouveauLot = null;
        if (oeufs_valides > 0) {
            const date_incubation_str = ajouterJours(date_recensement, race.duree_incubation);

            const nb_vavy = Math.round(oeufs_valides * race.pourcentage_vavy / 100);
            const nb_lahy = Math.round(oeufs_valides * race.pourcentage_lahy / 100);

            // Créer le nouveau lot destination
            // Créer le nouveau lot avec oeufs_a_incuber
            const [resultLot] = await connection.query(`
                INSERT INTO LOT
                    (date_entree, nombre_initial, nombre_restant, race_id,
                    age_entree_semaines, prix_achat_total, est_actif,
                    sexe, pourcentage_sexe)
                VALUES (?, ?, ?, ?, 0, 0, 1, 'mixte', ?)
            `, [
                date_incubation_str,
                oeufs_a_incuber,     // ← seulement les valides
                oeufs_a_incuber,
                race.race_id,
                race.pourcentage_vavy
            ]);

            const lot_destination_id = resultLot.insertId;

            // Enregistrer la transformation
            await connection.query(`
                INSERT INTO TRANSFORMATION_OEUF
                    (lot_source_id, recensement_source_id, date_transformation,
                    nombre_oeufs, nombre_poussins_obtenus, nombre_perte,
                    nb_lamokany, lot_destination_id)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?)
            `, [
                lot_id,
                recId,
                date_incubation_str,
                nombre_oeufs,           // total recensé
                oeufs_a_incuber,        // poussins = valides
                0,                      // nombre_perte = 0 (éclos parfaitement)
                nb_lamokany_transfo,    // ← lamokany stocké ici !
                lot_destination_id
            ]);

            // Ajouter capacité pondaison — nouvelles vavy

            // await Race.ajouterCapacite(race.race_id, nb_vavy, connection);

            nouveauLot = { lot_destination_id, date_incubation_str, nb_vavy, nb_lahy };
        }

        await connection.commit();

        const recensement = await RecensementOeuf.findById(recId);

        res.status(201).json({
            success: true,
            message: 'Recensement créé et incubation planifiée automatiquement',
            data: recensement,
            incubation: nouveauLot
        });

    } catch (error) {
        await connection.rollback();
        res.status(500).json({ success: false, message: error.message });
    } finally {
        connection.release();
    }
};

function ajouterJours(dateStr, nbJours) {
    const [annee, mois, jour] = dateStr.split('-').map(Number);
    const date = new Date(annee, mois - 1, jour); // ← local, pas UTC
    date.setDate(date.getDate() + nbJours);
    const y = date.getFullYear();
    const m = String(date.getMonth() + 1).padStart(2, '0');
    const d = String(date.getDate()).padStart(2, '0');
    return `${y}-${m}-${d}`;
}

exports.update = async (req, res) => {
    try {
        const updated = await RecensementOeuf.update(req.params.id, req.body);
        if (!updated) return res.status(404).json({
            success: false, message: 'Recensement non trouvé'
        });
        const rec = await RecensementOeuf.findById(req.params.id);
        res.json({ success: true, message: 'Recensement modifié', data: rec });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

exports.delete = async (req, res) => {
    try {
        const deleted = await RecensementOeuf.delete(req.params.id);
        if (!deleted) return res.status(404).json({
            success: false, message: 'Recensement non trouvé'
        });
        res.json({ success: true, message: 'Recensement supprimé' });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};


// GET /api/recensement-oeuf/lot/:lotId/date?date=2026-01-22
exports.getByLotAndDate = async (req, res) => {
    try {
        const { lotId } = req.params;
        const { date } = req.query;

        if (!date) {
            return res.status(400).json({
                success: false,
                message: 'Paramètre date manquant'
            });
        }

        const recensements = await RecensementOeuf.findByLotAndDate(lotId, date);
        res.json({ success: true, data: recensements });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};