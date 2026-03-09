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
  PRIMARY KEY (`id`),
  KEY `race_id` (`race_id`),
  CONSTRAINT `LOT_ibfk_1` FOREIGN KEY (`race_id`) REFERENCES `RACE` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB AUTO_INCREMENT=3 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `LOT`
--

LOCK TABLES `LOT` WRITE;
/*!40000 ALTER TABLE `LOT` DISABLE KEYS */;
INSERT INTO `LOT` VALUES
(1,'2026-03-07',100,100,1,0,200000.00,1,0,'2026-03-09 10:12:42'),
(2,'2026-03-06',100,100,2,0,210000.00,1,0,'2026-03-09 10:13:08');
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
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `MORTALITE`
--

LOCK TABLES `MORTALITE` WRITE;
/*!40000 ALTER TABLE `MORTALITE` DISABLE KEYS */;
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
  `race_id` int(11) NOT NULL,
  `prix_unitaire` decimal(10,2) NOT NULL,
  `date_debut` date NOT NULL,
  PRIMARY KEY (`id`),
  KEY `race_id` (`race_id`),
  CONSTRAINT `PRIX_ATODY_ibfk_1` FOREIGN KEY (`race_id`) REFERENCES `RACE` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `PRIX_ATODY`
--

LOCK TABLES `PRIX_ATODY` WRITE;
/*!40000 ALTER TABLE `PRIX_ATODY` DISABLE KEYS */;
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
) ENGINE=InnoDB AUTO_INCREMENT=3 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `PRIX_SAKAFO`
--

LOCK TABLES `PRIX_SAKAFO` WRITE;
/*!40000 ALTER TABLE `PRIX_SAKAFO` DISABLE KEYS */;
INSERT INTO `PRIX_SAKAFO` VALUES
(1,1,120.0000),
(2,2,130.0000);
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
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=3 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `RACE`
--

LOCK TABLES `RACE` WRITE;
/*!40000 ALTER TABLE `RACE` DISABLE KEYS */;
INSERT INTO `RACE` VALUES
(1,'Gasy',5000.00,2000.00,'2026-03-09 10:09:28',150.0000),
(2,'Vazaha',2000.00,2100.00,'2026-03-09 10:09:28',160.0000);
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
  PRIMARY KEY (`id`),
  KEY `lot_id` (`lot_id`),
  CONSTRAINT `RECENSEMENT_OEUF_ibfk_1` FOREIGN KEY (`lot_id`) REFERENCES `LOT` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `RECENSEMENT_OEUF`
--

LOCK TABLES `RECENSEMENT_OEUF` WRITE;
/*!40000 ALTER TABLE `RECENSEMENT_OEUF` DISABLE KEYS */;
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
) ENGINE=InnoDB AUTO_INCREMENT=11 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `SUIVI_POIDS`
--

LOCK TABLES `SUIVI_POIDS` WRITE;
/*!40000 ALTER TABLE `SUIVI_POIDS` DISABLE KEYS */;
INSERT INTO `SUIVI_POIDS` VALUES
(1,1,0,150,0),
(2,1,1,100,150),
(3,1,2,150,200),
(4,1,3,300,500),
(5,1,4,350,500),
(6,2,0,200,0),
(7,2,1,110,150),
(8,2,2,160,200),
(9,2,3,310,520),
(10,2,4,320,550);
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
  `date_transformation` date DEFAULT NULL,
  `nombre_oeufs` int(11) DEFAULT NULL,
  `nombre_poussins_obtenus` int(11) DEFAULT NULL,
  `nombre_perte` int(11) DEFAULT NULL,
  `lot_destination_id` int(11) DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `lot_source_id` (`lot_source_id`),
  KEY `lot_destination_id` (`lot_destination_id`),
  CONSTRAINT `TRANSFORMATION_OEUF_ibfk_1` FOREIGN KEY (`lot_source_id`) REFERENCES `LOT` (`id`) ON DELETE SET NULL,
  CONSTRAINT `TRANSFORMATION_OEUF_ibfk_2` FOREIGN KEY (`lot_destination_id`) REFERENCES `LOT` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `TRANSFORMATION_OEUF`
--

LOCK TABLES `TRANSFORMATION_OEUF` WRITE;
/*!40000 ALTER TABLE `TRANSFORMATION_OEUF` DISABLE KEYS */;
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

-- Dump completed on 2026-03-09 20:22:26
