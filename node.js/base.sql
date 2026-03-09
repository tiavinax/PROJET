-- Création de la base de données
-- CREATE DATABASE IF NOT EXISTS akoho_db;
-- USE akoho_db;

-- Supprimer les tables dans l'ordre inverse (pour éviter les problèmes de clés étrangères)
DROP TABLE IF EXISTS RECENSEMENT_OEUF;
DROP TABLE IF EXISTS SUIVI_POIDS;
DROP TABLE IF EXISTS MORTALITE;
DROP TABLE IF EXISTS TRANSFORMATION_OEUF;
DROP TABLE IF EXISTS PRIX_SAKAFO;
DROP TABLE IF EXISTS PRIX_ATODY;
DROP TABLE IF EXISTS LOT;
DROP TABLE IF EXISTS RACE;

-- Table des races (doit être créée en premier)
CREATE TABLE RACE (
    id INT PRIMARY KEY AUTO_INCREMENT,
    nom VARCHAR(50) NOT NULL,
    prix_vente_kg DECIMAL(10,2),
    prix_vente_gramme DECIMAL(10,4),
    prix_achat_unitaire DECIMAL(10,2),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
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

CREATE TABLE PRIX_SAKAFO (
    id INT PRIMARY KEY AUTO_INCREMENT,
    race_id INT UNIQUE,          -- UNIQUE : une seule ligne par race
    prix_par_gramme DECIMAL(10,4) NOT NULL,
    FOREIGN KEY (race_id) REFERENCES RACE(id) ON DELETE CASCADE
);

-- Table des pesées et consommation
CREATE TABLE SUIVI_POIDS (
    id INT PRIMARY KEY AUTO_INCREMENT,
    race_id INT NOT NULL,
    semaine INT NOT NULL,
    poids_recueilli_grammes INT NOT NULL,
    sakafo_consomme_grammes INT NOT NULL,
    UNIQUE KEY unique_race_semaine (race_id, semaine),
    FOREIGN KEY (race_id) REFERENCES RACE(id) ON DELETE CASCADE
);

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

CREATE TABLE PRIX_ATODY (
    id INT PRIMARY KEY AUTO_INCREMENT,
    race_id INT,
    prix_unitaire DECIMAL(10,2),
    date DATE DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (race_id) REFERENCES RACE(id) ON DELETE CASCADE
);

-- Insertion des données de test (dans le bon ordre)

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

-- =============================
-- RACES (prix simples)
-- =============================
INSERT INTO RACE (nom, prix_vente_kg, prix_achat_unitaire, prix_vente_gramme) VALUES
('Gasy', 5000, 2000, 150),
('Vazaha',2000, 2100, 160);

-- =============================
-- LOTS (petits chiffres)
-- =============================

INSERT INTO LOT (date_entree, nombre_initial, nombre_restant, race_id, age_entree_semaines, prix_achat_total, est_actif) VALUES
('2026-03-07', 100, 10, 1, 0, 200000, TRUE),  
('2026-03-06', 100, 10, 2, 0, 210000, TRUE);  

-- =============================
-- PRIX SAKAFO (prix simples)
-- =============================
INSERT INTO PRIX_SAKAFO (race_id, prix_par_gramme) VALUES
(1, 120),   
(2, 130);   

-- =============================
-- PRIX ATODY
-- =============================
INSERT INTO PRIX_ATODY (race_id, prix_unitaire, date_debut) VALUES
(1, 1000, '2026-07-06'),
(2, 1500, '2026-07-06');


SELECT COUNT(*) AS TOTAL FROM RACE;
SELECT COUNT(*) AS TOTAL FROM PRIX_ATODY;
SELECT COUNT(*) AS TOTAL FROM LOT;
SELECT COUNT(*) AS TOTAL FROM PRIX_SAKAFO;
SELECT COUNT(*) AS TOTAL FROM MORTALITE;
SELECT COUNT(*) AS TOTAL FROM SUIVI_POIDS WHERE lot_id = 1; 
SELECT COUNT(*) AS TOTAL FROM SUIVI_POIDS WHERE lot_id = 2;
SELECT COUNT(*) AS TOTAL FROM SUIVI_POIDS WHERE lot_id = 3;
SELECT COUNT(*) AS TOTAL FROM RECENSEMENT_OEUF;


