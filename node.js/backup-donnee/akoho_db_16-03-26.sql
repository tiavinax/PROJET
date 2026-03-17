/*M!999999\- enable the sandbox mode */ 
-- MariaDB dump 10.19  Distrib 10.11.14-MariaDB, for debian-linux-gnu (x86_64)
--
-- Host: 127.0.0.1    Database: akoho_db
-- ------------------------------------------------------
-- Server version	10.4.32-MariaDB

/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;
/*!40103 SET @OLD_TIME_ZONE=@@TIME_ZONE */;
/*!40103 SET TIME_ZONE='+00:00' */;
/*!40014 SET @OLD_UNIQUE_CHECKS=@@UNIQUE_CHECKS, UNIQUE_CHECKS=0 */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;
/*!40111 SET @OLD_SQL_NOTES=@@SQL_NOTES, SQL_NOTES=0 */;

--
-- Table structure for table `LOT`
--

DROP TABLE IF EXISTS `LOT`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8mb4 */;
CREATE TABLE `LOT` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `date_entree` date NOT NULL,
  `nombre_initial` int(11) NOT NULL,
  `nombre_restant` int(11) DEFAULT NULL,
  `race_id` int(11) DEFAULT NULL,
  `age_entree_semaines` int(11) DEFAULT NULL,
  `prix_achat_total` decimal(10,2) DEFAULT NULL,
  `est_actif` tinyint(1) DEFAULT 1,
  `nb_atody` int(11) DEFAULT 0,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `sexe` enum('vavy','lahy','mixte') DEFAULT 'mixte',
  `pourcentage_sexe` int(11) DEFAULT 100,
  PRIMARY KEY (`id`),
  KEY `race_id` (`race_id`),
  CONSTRAINT `LOT_ibfk_1` FOREIGN KEY (`race_id`) REFERENCES `RACE` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB AUTO_INCREMENT=8 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `LOT`
--

LOCK TABLES `LOT` WRITE;
/*!40000 ALTER TABLE `LOT` DISABLE KEYS */;
INSERT INTO `LOT` VALUES
(1,'2026-01-01',500,500,1,0,250000.00,1,0,'2026-03-11 11:52:57','mixte',100),
(2,'2026-03-03',100,100,1,0,0.00,1,0,'2026-03-11 12:04:29','mixte',100),
(3,'2026-03-16',150,150,1,0,0.00,1,0,'2026-03-11 12:05:24','mixte',100),
(7,'2026-03-22',95,95,1,0,0.00,1,0,'2026-03-16 20:25:14','mixte',60);
/*!40000 ALTER TABLE `LOT` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `MORTALITE`
--

DROP TABLE IF EXISTS `MORTALITE`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8mb4 */;
CREATE TABLE `MORTALITE` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `lot_id` int(11) DEFAULT NULL,
  `date_mortalite` date DEFAULT NULL,
  `nombre_morts` int(11) DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `lot_id` (`lot_id`),
  CONSTRAINT `MORTALITE_ibfk_1` FOREIGN KEY (`lot_id`) REFERENCES `LOT` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=2 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `MORTALITE`
--

LOCK TABLES `MORTALITE` WRITE;
/*!40000 ALTER TABLE `MORTALITE` DISABLE KEYS */;
INSERT INTO `MORTALITE` VALUES
(1,1,'2026-02-01',15);
/*!40000 ALTER TABLE `MORTALITE` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `PRIX_ATODY`
--

DROP TABLE IF EXISTS `PRIX_ATODY`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8mb4 */;
CREATE TABLE `PRIX_ATODY` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `race_id` int(11) DEFAULT NULL,
  `prix_unitaire` decimal(10,2) DEFAULT NULL,
  `date` date DEFAULT current_timestamp(),
  PRIMARY KEY (`id`),
  KEY `race_id` (`race_id`),
  CONSTRAINT `PRIX_ATODY_ibfk_1` FOREIGN KEY (`race_id`) REFERENCES `RACE` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=2 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `PRIX_ATODY`
--

LOCK TABLES `PRIX_ATODY` WRITE;
/*!40000 ALTER TABLE `PRIX_ATODY` DISABLE KEYS */;
INSERT INTO `PRIX_ATODY` VALUES
(1,1,500.00,'2026-03-11');
/*!40000 ALTER TABLE `PRIX_ATODY` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `PRIX_SAKAFO`
--

DROP TABLE IF EXISTS `PRIX_SAKAFO`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8mb4 */;
CREATE TABLE `PRIX_SAKAFO` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `race_id` int(11) DEFAULT NULL,
  `prix_par_gramme` decimal(10,4) NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `race_id` (`race_id`),
  CONSTRAINT `PRIX_SAKAFO_ibfk_1` FOREIGN KEY (`race_id`) REFERENCES `RACE` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=2 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `PRIX_SAKAFO`
--

LOCK TABLES `PRIX_SAKAFO` WRITE;
/*!40000 ALTER TABLE `PRIX_SAKAFO` DISABLE KEYS */;
INSERT INTO `PRIX_SAKAFO` VALUES
(1,1,5.0000);
/*!40000 ALTER TABLE `PRIX_SAKAFO` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `RACE`
--

DROP TABLE IF EXISTS `RACE`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8mb4 */;
CREATE TABLE `RACE` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `nom` varchar(50) NOT NULL,
  `prix_vente_kg` decimal(10,2) DEFAULT NULL,
  `prix_achat_unitaire` decimal(10,2) DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `prix_vente_gramme` decimal(10,4) DEFAULT NULL,
  `pourcentage_vavy` int(11) DEFAULT 50,
  `pourcentage_lahy` int(11) DEFAULT 50,
  `duree_incubation` int(11) DEFAULT 21,
  `capacite_pondation` int(11) DEFAULT 0,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=3 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `RACE`
--

LOCK TABLES `RACE` WRITE;
/*!40000 ALTER TABLE `RACE` DISABLE KEYS */;
INSERT INTO `RACE` VALUES
(1,'borboneze',15.00,1000.00,'2026-03-11 11:38:33',15.0000,60,40,21,-202),
(2,'Sinoa',20000.00,500.00,'2026-03-16 19:20:30',20.0000,60,40,21,40);
/*!40000 ALTER TABLE `RACE` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `RECENSEMENT_OEUF`
--

DROP TABLE IF EXISTS `RECENSEMENT_OEUF`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8mb4 */;
CREATE TABLE `RECENSEMENT_OEUF` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `lot_id` int(11) DEFAULT NULL,
  `date_recensement` date DEFAULT NULL,
  `nombre_oeufs` int(11) DEFAULT NULL,
  `pourcentage_lamokany` int(11) DEFAULT 0,
  PRIMARY KEY (`id`),
  KEY `lot_id` (`lot_id`),
  CONSTRAINT `RECENSEMENT_OEUF_ibfk_1` FOREIGN KEY (`lot_id`) REFERENCES `LOT` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=7 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `RECENSEMENT_OEUF`
--

LOCK TABLES `RECENSEMENT_OEUF` WRITE;
/*!40000 ALTER TABLE `RECENSEMENT_OEUF` DISABLE KEYS */;
INSERT INTO `RECENSEMENT_OEUF` VALUES
(1,1,'2026-02-02',100,0),
(2,1,'2026-02-15',150,0),
(6,1,'2026-03-01',100,5);
/*!40000 ALTER TABLE `RECENSEMENT_OEUF` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `SUIVI_POIDS`
--

DROP TABLE IF EXISTS `SUIVI_POIDS`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8mb4 */;
CREATE TABLE `SUIVI_POIDS` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `race_id` int(11) NOT NULL,
  `semaine` int(11) NOT NULL,
  `poids_recueilli_grammes` int(11) NOT NULL,
  `sakafo_consomme_grammes` int(11) NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `unique_race_semaine` (`race_id`,`semaine`),
  CONSTRAINT `SUIVI_POIDS_ibfk_1` FOREIGN KEY (`race_id`) REFERENCES `RACE` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=27 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `SUIVI_POIDS`
--

LOCK TABLES `SUIVI_POIDS` WRITE;
/*!40000 ALTER TABLE `SUIVI_POIDS` DISABLE KEYS */;
INSERT INTO `SUIVI_POIDS` VALUES
(1,1,0,50,0),
(2,1,1,20,75),
(3,1,2,25,80),
(4,1,3,30,100),
(5,1,4,40,150),
(6,1,5,80,170),
(7,1,6,85,190),
(8,1,7,100,200),
(9,1,8,100,250),
(10,1,9,90,270),
(11,1,10,140,290),
(12,1,11,200,300),
(13,1,12,220,370),
(14,1,13,265,390),
(15,1,14,285,350),
(16,1,15,300,300),
(17,1,16,350,450),
(18,1,17,400,500),
(19,1,18,420,400),
(20,1,19,430,500),
(21,1,20,500,500),
(22,1,21,530,650),
(23,1,22,600,600),
(24,1,23,400,750),
(25,1,24,100,750),
(26,1,25,0,600);
/*!40000 ALTER TABLE `SUIVI_POIDS` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `TRANSFORMATION_OEUF`
--

DROP TABLE IF EXISTS `TRANSFORMATION_OEUF`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8mb4 */;
CREATE TABLE `TRANSFORMATION_OEUF` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `lot_source_id` int(11) DEFAULT NULL,
  `recensement_source_id` int(11) DEFAULT NULL,
  `date_transformation` date DEFAULT NULL,
  `nombre_oeufs` int(11) DEFAULT NULL,
  `nombre_poussins_obtenus` int(11) DEFAULT NULL,
  `nombre_perte` int(11) DEFAULT NULL,
  `lot_destination_id` int(11) DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `lot_source_id` (`lot_source_id`),
  KEY `lot_destination_id` (`lot_destination_id`),
  KEY `recensement_source_id` (`recensement_source_id`),
  CONSTRAINT `TRANSFORMATION_OEUF_ibfk_1` FOREIGN KEY (`lot_source_id`) REFERENCES `LOT` (`id`) ON DELETE SET NULL,
  CONSTRAINT `TRANSFORMATION_OEUF_ibfk_2` FOREIGN KEY (`lot_destination_id`) REFERENCES `LOT` (`id`) ON DELETE SET NULL,
  CONSTRAINT `TRANSFORMATION_OEUF_ibfk_3` FOREIGN KEY (`recensement_source_id`) REFERENCES `RECENSEMENT_OEUF` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=7 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `TRANSFORMATION_OEUF`
--

LOCK TABLES `TRANSFORMATION_OEUF` WRITE;
/*!40000 ALTER TABLE `TRANSFORMATION_OEUF` DISABLE KEYS */;
INSERT INTO `TRANSFORMATION_OEUF` VALUES
(1,1,1,'2026-03-03',100,100,0,2),
(2,1,2,'2026-03-16',150,150,0,3),
(6,1,6,'2026-03-22',95,95,0,7);
/*!40000 ALTER TABLE `TRANSFORMATION_OEUF` ENABLE KEYS */;
UNLOCK TABLES;
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed on 2026-03-17  1:02:55
