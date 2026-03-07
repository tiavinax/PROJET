-- Création de la base de données
-- CREATE DATABASE IF NOT EXISTS akoho_db;
-- USE akoho_db;

-- Supprimer les tables dans l'ordre inverse (pour éviter les problèmes de clés étrangères)
DROP TABLE IF EXISTS RECENSEMENT_OEUF;
DROP TABLE IF EXISTS SUIVI_POIDS;
DROP TABLE IF EXISTS MORTALITE;
DROP TABLE IF EXISTS TRANSFORMATION_OEUF;
DROP TABLE IF EXISTS PRIX_SAKAFO;
DROP TABLE IF EXISTS LOT;
DROP TABLE IF EXISTS RACE;

-- Table des races (doit être créée en premier)
CREATE TABLE RACE (
    id INT PRIMARY KEY AUTO_INCREMENT,
    nom VARCHAR(50) NOT NULL,
    prix_vente_kg DECIMAL(10,2),
    prix_achat_unitaire DECIMAL(10,2),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Table des lots
CREATE TABLE LOT (
    id INT PRIMARY KEY AUTO_INCREMENT,
    date_entree DATE NOT NULL,
    nombre_initial INT NOT NULL,
    nombre_restant INT,
    race_id INT,
    age_entree_semaines INT,
    prix_achat_total DECIMAL(10,2),
    est_actif BOOLEAN DEFAULT TRUE,
    nb_atody INT DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (race_id) REFERENCES RACE(id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Table du prix du sakafo
CREATE TABLE PRIX_SAKAFO (
    id INT PRIMARY KEY AUTO_INCREMENT,
    race_id INT,
    date_debut DATE,
    date_fin DATE,
    prix_par_gramme DECIMAL(10,4),
    FOREIGN KEY (race_id) REFERENCES RACE(id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE PRIX_SAKAFO (
    id INT PRIMARY KEY AUTO_INCREMENT,
    race_id INT,
    date DATE,
    prix_par_gramme DECIMAL(10,4),
    FOREIGN KEY (race_id) REFERENCES RACE(id) ON DELETE SET NULL
);

-- Table des pesées et consommation
CREATE TABLE SUIVI_POIDS (
    id INT PRIMARY KEY AUTO_INCREMENT,
    lot_id INT,
    semaine INT,
    date_mesure DATE,
    poids_moyen_grammes INT,
    sakafo_consomme_grammes INT,
    UNIQUE KEY unique_lot_semaine (lot_id, semaine),
    FOREIGN KEY (lot_id) REFERENCES LOT(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Table du recensement des œufs
CREATE TABLE RECENSEMENT_OEUF (
    id INT PRIMARY KEY AUTO_INCREMENT,
    lot_id INT,
    date_recensement DATE,
    nombre_oeufs INT,
    FOREIGN KEY (lot_id) REFERENCES LOT(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Table de transformation œufs → poulets
CREATE TABLE TRANSFORMATION_OEUF (
    id INT PRIMARY KEY AUTO_INCREMENT,
    lot_source_id INT,
    date_transformation DATE,
    nombre_oeufs INT,
    nombre_poussins_obtenus INT,
    nombre_perte INT,
    lot_destination_id INT,
    FOREIGN KEY (lot_source_id) REFERENCES LOT(id) ON DELETE SET NULL,
    FOREIGN KEY (lot_destination_id) REFERENCES LOT(id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Table de mortalité
CREATE TABLE MORTALITE (
    id INT PRIMARY KEY AUTO_INCREMENT,
    lot_id INT,
    date_mortalite DATE,
    nombre_morts INT,
    FOREIGN KEY (lot_id) REFERENCES LOT(id) ON DELETE CASCADE
);

-- Insertion des données de test (dans le bon ordre)
-- D'abord les races
INSERT INTO RACE (nom, prix_vente_kg, prix_achat_unitaire) VALUES
('Poulet de chair', 5000, 2500),
('Pondeuse', 4500, 3000),
('Poulet local', 6000, 2000);

-- Ensuite les lots
INSERT INTO LOT (date_entree, nombre_initial, nombre_restant, race_id, age_entree_semaines, prix_achat_total, est_actif) VALUES
('2026-01-15', 100, 98, 1, 0, 250000, TRUE),
('2026-02-01', 50, 45, 2, 2, 150000, TRUE),
('2026-02-15', 200, 200, 1, 0, 500000, TRUE);

-- Puis les prix sakafo
INSERT INTO PRIX_SAKAFO (race_id, date_debut, prix_par_gramme) VALUES
(1, '2026-01-01', 150),
(2, '2026-01-01', 120),
(3, '2026-01-01', 100);

-- Ensuite les suivis poids
INSERT INTO SUIVI_POIDS (lot_id, semaine, date_mesure, poids_moyen_grammes, sakafo_consomme_grammes) VALUES
(1, 1, '2026-01-22', 150, 1000),
(1, 2, '2026-01-29', 300, 2000),
(1, 3, '2026-02-05', 450, 3000),
(2, 1, '2026-02-08', 500, 1500);

-- Enfin les recensements d'œufs
INSERT INTO RECENSEMENT_OEUF (lot_id, date_recensement, nombre_oeufs) VALUES
(2, '2026-02-10', 45),
(2, '2026-02-15', 52),
(2, '2026-02-20', 48);

-- Afficher les résultats
SELECT '=== RACES ===' as '';
SELECT * FROM RACE;
SELECT '=== PRIX ATODY ===' as '';
SELECT * FROM PRIX_ATODY;
SELECT '=== LOTS ===' as '';
SELECT * FROM LOT;
SELECT '=== PRIX SAKAFO ===' as '';
SELECT * FROM PRIX_SAKAFO;
SELECT '=== MORTALITE ===' as '';
SELECT * FROM MORTALITE;
SELECT '=== SUIVI POIDS LOT 1 ===' as '';
SELECT * FROM SUIVI_POIDS WHERE lot_id = 1; 
SELECT '=== SUIVI POIDS LOT 2 ===' as '';
SELECT * FROM SUIVI_POIDS WHERE lot_id = 2;
SELECT '=== SUIVI POIDS LOT 3 ===' as '';
SELECT * FROM SUIVI_POIDS WHERE lot_id = 3;
SELECT '=== RECENSEMENT OEUFS ===' as '';
SELECT * FROM RECENSEMENT_OEUF;



-- SCRIPTE DU 07/003/26

-- Ajouter prix_vente_gramme dans RACE
ALTER TABLE RACE ADD COLUMN prix_vente_gramme DECIMAL(10,4);

-- Mettre à jour les données existantes
-- (5000 Ar/kg = 5 Ar/g)
UPDATE RACE SET prix_vente_gramme = 5.00 WHERE nom = 'Poulet de chair';
UPDATE RACE SET prix_vente_gramme = 4.50 WHERE nom = 'Pondeuse';
UPDATE RACE SET prix_vente_gramme = 6.00 WHERE nom = 'Poulet local';

-- Nouvelle table prix atody par race
CREATE TABLE PRIX_ATODY (
    id INT PRIMARY KEY AUTO_INCREMENT,
    race_id INT NOT NULL,
    prix_unitaire DECIMAL(10,2) NOT NULL,
    date_debut DATE NOT NULL,
    FOREIGN KEY (race_id) REFERENCES RACE(id)
);

-- Données de test
INSERT INTO PRIX_ATODY (race_id, prix_unitaire, date_debut) VALUES
(2, 500, '2026-01-01');  -- Pondeuse : 500 Ar par oeuf

-- Données de test pour mortalité
INSERT INTO MORTALITE (lot_id, date_mortalite, nombre_morts) VALUES
(1, '2026-01-20', 2),
(2, '2026-02-05', 5);

-- SCRIPTE DU 07/03/26 a 11:37

-- Vider les tables
DELETE FROM RECENSEMENT_OEUF;
DELETE FROM SUIVI_POIDS;
DELETE FROM MORTALITE;
DELETE FROM PRIX_ATODY;
DELETE FROM PRIX_SAKAFO;
DELETE FROM LOT;
DELETE FROM RACE;
DELETE FROM TRANSFORMATION_OEUF;

-- Reset auto-increment
ALTER TABLE RACE AUTO_INCREMENT = 1;
ALTER TABLE LOT AUTO_INCREMENT = 1;
ALTER TABLE SUIVI_POIDS AUTO_INCREMENT = 1;
ALTER TABLE PRIX_SAKAFO AUTO_INCREMENT = 1;
ALTER TABLE PRIX_ATODY AUTO_INCREMENT = 1;
ALTER TABLE MORTALITE AUTO_INCREMENT = 1;
ALTER TABLE RECENSEMENT_OEUF AUTO_INCREMENT = 1;
ALTER TABLE TRANSFORMATION_OEUF AUTO_INCREMENT = 1;



-- Renommer la colonne
ALTER TABLE SUIVI_POIDS CHANGE poids_moyen_grammes poids_recueilli_grammes INT;

-- =============================
-- RACES (prix simples)
-- =============================
INSERT INTO RACE (nom, prix_vente_kg, prix_achat_unitaire, prix_vente_gramme) VALUES
('Poulet de chair', 5000, 2500, 5.00),
('Pondeuse',        4500, 3000, 4.50),
('Poulet local', 3000, 2000, 3.00);

-- =============================
-- PRIX SAKAFO (prix simples)
-- =============================
INSERT INTO PRIX_SAKAFO (race_id, date_debut, date_fin, prix_par_gramme) VALUES
(1, '2026-01-01', NULL, 150),   -- Poulet de chair : 150 Ar/g
(2, '2026-01-01', NULL, 200);   -- Pondeuse        : 200 Ar/g

-- =============================
-- PRIX ATODY
-- =============================
INSERT INTO PRIX_ATODY (race_id, prix_unitaire, date_debut) VALUES
(2, 500, '2026-01-01');  -- Pondeuse : 500 Ar/oeuf

INSERT INTO PRIX_ATODY (race_id, prix_unitaire, date_debut) VALUES
(1, 700, '2026-01-01');  -- poulets de chair : 600 Ar/oeuf

-- =============================
-- LOTS (petits chiffres)
-- =============================
INSERT INTO LOT (date_entree, nombre_initial, nombre_restant, race_id, age_entree_semaines, prix_achat_total, est_actif) VALUES
('2026-01-01', 10, 10, 1, 0, 10000, TRUE),  -- Lot 1 : 10 poulets de chair
('2026-01-01', 10, 10, 2, 0, 10000, TRUE);  -- Lot 2 : 10 pondeuses

-- =============================
-- MORTALITE (simple)
-- =============================
INSERT INTO MORTALITE (lot_id, date_mortalite, nombre_morts) VALUES
(1, '2026-01-10', 2),   -- Lot 1 : 2 morts semaine 2
(2, '2026-01-20', 1);   -- Lot 2 : 1 mort semaine 3

-- =============================
INSERT INTO SUIVI_POIDS (lot_id, semaine, date_mesure, poids_recueilli_grammes, sakafo_consomme_grammes) VALUES
-- Lot 1 (Poulet de chair) — grossit vite
(1, 0, '2026-01-01',  50,   0),   -- S0 : poids initial 50g,  sakafo 0
(1, 1, '2026-01-08', 150, 200),   -- S1 : +150g, sakafo 200g
(1, 2, '2026-01-15', 300, 400),   -- S2 : +300g, sakafo 400g
(1, 3, '2026-01-22', 500, 600),   -- S3 : +500g, sakafo 600g

-- Lot 2 (Pondeuse) — grossit moins vite
(2, 0, '2026-01-01',  50,   0),   -- S0 : poids initial 50g,  sakafo 0
(2, 1, '2026-01-08', 100, 200),   -- S1 : +100g, sakafo 200g
(2, 2, '2026-01-15', 200, 400),   -- S2 : +200g, sakafo 400g
(2, 3, '2026-01-22', 300, 600);   -- S3 : +300g, sakafo 600g

-- =============================
-- RECENSEMENT ATODY (Lot 2 seulement)
-- =============================
INSERT INTO RECENSEMENT_OEUF (lot_id, date_recensement, nombre_oeufs) VALUES
(2, '2026-01-15', 10),   -- semaine 2 : 10 oeufs
(2, '2026-01-22', 10),   -- semaine 3 : 10 oeufs
(2, '2026-01-29', 10);   -- semaine 4 : 10 oeufs

-- SCRIPT DU 07/03/26

-- Supprimer l'ancienne table
DROP TABLE IF EXISTS PRIX_SAKAFO;

-- Nouvelle table simple
CREATE TABLE PRIX_SAKAFO (
    id INT PRIMARY KEY AUTO_INCREMENT,
    race_id INT UNIQUE,          -- UNIQUE : une seule ligne par race
    prix_par_gramme DECIMAL(10,4) NOT NULL,
    FOREIGN KEY (race_id) REFERENCES RACE(id) ON DELETE CASCADE
);

-- Insérer les prix actuels
INSERT INTO PRIX_SAKAFO (race_id, prix_par_gramme) VALUES
(1, 150),   -- Poulet de chair : 150 Ar/g
(2, 200);   -- Pondeuse        : 200 Ar/g




SELECT COUNT(*) AS TOTAL FROM RACE;
SELECT COUNT(*) AS TOTAL FROM PRIX_ATODY;
SELECT COUNT(*) AS TOTAL FROM LOT;
SELECT COUNT(*) AS TOTAL FROM PRIX_SAKAFO;
SELECT COUNT(*) AS TOTAL FROM MORTALITE;
SELECT COUNT(*) AS TOTAL FROM SUIVI_POIDS WHERE lot_id = 1; 
SELECT COUNT(*) AS TOTAL FROM SUIVI_POIDS WHERE lot_id = 2;
SELECT COUNT(*) AS TOTAL FROM SUIVI_POIDS WHERE lot_id = 3;
SELECT COUNT(*) AS TOTAL FROM RECENSEMENT_OEUF;

SELECT * FROM PRIX_SAKAFO;
