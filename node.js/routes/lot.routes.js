const express = require('express');
const router = express.Router();
const lotController = require('../controllers/lot.controller');
const situationController = require('../controllers/situation.controller');
const suiviPoidsController = require('../controllers/suivi_poids.controller');
const recensementOeufController = require('../controllers/recensement_oeuf.controller');
const transformationOeufController = require('../controllers/transformation_oeuf.controller');
const mortaliteController    = require('../controllers/mortalite.controller');
const prixSakafoController   = require('../controllers/prix_sakafo.controller');
const raceController = require('../controllers/race.controller');
const prixAtodyController = require('../controllers/prix_atody.controller');

// ========== LOTS ==========
router.get('/lots', lotController.getAllLots);
router.get('/lots/:id', lotController.getLotById);
router.post('/lots', lotController.createLot);
router.put('/lots/:id', lotController.updateLot);
router.delete('/lots/:id', lotController.deleteLot);

// ========== RACES ==========
router.get('/races', lotController.getAllRaces);

// ========== SITUATION ==========
router.get('/situation', situationController.getSituation);

// ========== SUIVI POIDS ==========
router.get('/suivi-poids',          suiviPoidsController.getAll);
router.get('/suivi-poids/:id',      suiviPoidsController.getById);
router.post('/suivi-poids',         suiviPoidsController.create);
router.put('/suivi-poids/:id',      suiviPoidsController.update);
router.delete('/suivi-poids/:id',   suiviPoidsController.delete);

// ========== RECENSEMENT OEUF ==========
router.get('/recensement-oeuf',                   recensementOeufController.getAll);
router.get('/recensement-oeuf/lot/:lotId/date',   recensementOeufController.getByLotAndDate);
router.get('/recensement-oeuf/:id',               recensementOeufController.getById);
router.post('/recensement-oeuf',                  recensementOeufController.create);
router.put('/recensement-oeuf/:id',               recensementOeufController.update);
router.delete('/recensement-oeuf/:id',            recensementOeufController.delete);

// ========== TRANSFORMATION OEUF ==========
router.get('/transformation-oeuf',      transformationOeufController.getAll);
router.get('/transformation-oeuf/:id',  transformationOeufController.getById);
router.post('/transformation-oeuf',     transformationOeufController.create);
router.delete('/transformation-oeuf/:id', transformationOeufController.delete);

// ========== MORTALITE ==========
router.get('/mortalite',        mortaliteController.getAll);
router.get('/mortalite/:id',    mortaliteController.getById);
router.post('/mortalite',       mortaliteController.create);
router.put('/mortalite/:id',    mortaliteController.update);
router.delete('/mortalite/:id', mortaliteController.delete);

// ========== PRIX SAKAFO ==========
router.get('/prix-sakafo',      prixSakafoController.getAll);
router.get('/prix-sakafo/:id',  prixSakafoController.getById);
router.put('/prix-sakafo/:id',  prixSakafoController.update);  
router.post('/prix-sakafo', prixSakafoController.create);  // ← ajouter une route POST pour créer un nouveau prix sakafo

// ========== RACES CRUD ==========
router.get('/races',        raceController.getAll);
router.get('/races/:id',    raceController.getById);
router.post('/races',       raceController.create);
router.put('/races/:id',    raceController.update);
router.delete('/races/:id', raceController.delete);

// ========== PRIX ATODY ==========
router.get('/prix-atody',        prixAtodyController.getAll);
router.get('/prix-atody/:id',    prixAtodyController.getById);
router.post('/prix-atody',       prixAtodyController.create);
router.put('/prix-atody/:id',    prixAtodyController.update);
router.delete('/prix-atody/:id', prixAtodyController.delete);


module.exports = router;