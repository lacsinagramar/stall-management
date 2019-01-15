CREATE DATABASE  IF NOT EXISTS `stallv1` /*!40100 DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci */;
USE `stallv1`;
-- MySQL dump 10.13  Distrib 8.0.13, for Win64 (x86_64)
--
-- Host: localhost    Database: stallv1
-- ------------------------------------------------------
-- Server version	8.0.13

/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
 SET NAMES utf8 ;
/*!40103 SET @OLD_TIME_ZONE=@@TIME_ZONE */;
/*!40103 SET TIME_ZONE='+00:00' */;
/*!40014 SET @OLD_UNIQUE_CHECKS=@@UNIQUE_CHECKS, UNIQUE_CHECKS=0 */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;
/*!40111 SET @OLD_SQL_NOTES=@@SQL_NOTES, SQL_NOTES=0 */;

--
-- Table structure for table `tbl_company_lessee`
--

DROP TABLE IF EXISTS `tbl_company_lessee`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
 SET character_set_client = utf8mb4 ;
CREATE TABLE `tbl_company_lessee` (
  `strLesseeId` varchar(20) NOT NULL,
  `strCompanyName` varchar(80) NOT NULL,
  `strCompanyAddress` longtext NOT NULL,
  `strRepresentativePosition` varchar(45) NOT NULL,
  PRIMARY KEY (`strLesseeId`),
  CONSTRAINT `company to lessee` FOREIGN KEY (`strLesseeId`) REFERENCES `tbl_lessee` (`strid`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `tbl_company_lessee`
--

LOCK TABLES `tbl_company_lessee` WRITE;
/*!40000 ALTER TABLE `tbl_company_lessee` DISABLE KEYS */;
INSERT INTO `tbl_company_lessee` VALUES ('2019-00003-C','asd','asd','asd');
/*!40000 ALTER TABLE `tbl_company_lessee` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `tbl_contract`
--

DROP TABLE IF EXISTS `tbl_contract`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
 SET character_set_client = utf8mb4 ;
CREATE TABLE `tbl_contract` (
  `intId` int(11) NOT NULL AUTO_INCREMENT,
  `strLesseeId` varchar(20) NOT NULL,
  `strStallId` varchar(10) NOT NULL,
  `intContractMonth` int(11) NOT NULL,
  `intContractDay` int(11) NOT NULL,
  `intContractYear` int(11) NOT NULL,
  `intContractDuration` int(11) NOT NULL,
  `booContractStatus` tinyint(4) NOT NULL DEFAULT '0',
  PRIMARY KEY (`intId`),
  KEY `contract to lessee_idx` (`strLesseeId`),
  KEY `contract to stall_idx` (`strStallId`),
  CONSTRAINT `contract to lessee` FOREIGN KEY (`strLesseeId`) REFERENCES `tbl_lessee` (`strid`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `contract to stall` FOREIGN KEY (`strStallId`) REFERENCES `tbl_stall` (`strid`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `tbl_contract`
--

LOCK TABLES `tbl_contract` WRITE;
/*!40000 ALTER TABLE `tbl_contract` DISABLE KEYS */;
/*!40000 ALTER TABLE `tbl_contract` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `tbl_electric_lessee_bill`
--

DROP TABLE IF EXISTS `tbl_electric_lessee_bill`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
 SET character_set_client = utf8mb4 ;
CREATE TABLE `tbl_electric_lessee_bill` (
  `intId` int(11) NOT NULL AUTO_INCREMENT,
  `intElectricMainBillId` int(11) NOT NULL,
  `dblAmountDue` double NOT NULL,
  `intTotalKwhUsage` int(11) NOT NULL,
  `datDueDate` date NOT NULL,
  `strPaymentReferenceNo` varchar(45) DEFAULT NULL,
  PRIMARY KEY (`intId`),
  KEY `electricBill to payment_idx` (`strPaymentReferenceNo`),
  KEY `electricBill to mainElectric_idx` (`intElectricMainBillId`),
  CONSTRAINT `electricBill to mainElectric` FOREIGN KEY (`intElectricMainBillId`) REFERENCES `tbl_electric_main_bill` (`intid`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `electricBill to payment` FOREIGN KEY (`strPaymentReferenceNo`) REFERENCES `tbl_payment` (`strreferenceno`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `tbl_electric_lessee_bill`
--

LOCK TABLES `tbl_electric_lessee_bill` WRITE;
/*!40000 ALTER TABLE `tbl_electric_lessee_bill` DISABLE KEYS */;
/*!40000 ALTER TABLE `tbl_electric_lessee_bill` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `tbl_electric_main_bill`
--

DROP TABLE IF EXISTS `tbl_electric_main_bill`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
 SET character_set_client = utf8mb4 ;
CREATE TABLE `tbl_electric_main_bill` (
  `intId` int(11) NOT NULL AUTO_INCREMENT,
  `dblTotalAmountDue` double NOT NULL,
  `intTotalKwhUsage` int(11) NOT NULL,
  `intDueMonth` int(11) NOT NULL,
  `intDueDay` int(11) NOT NULL,
  `intDueYear` int(11) NOT NULL,
  PRIMARY KEY (`intId`),
  UNIQUE KEY `dueConstraint` (`intDueMonth`,`intDueYear`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `tbl_electric_main_bill`
--

LOCK TABLES `tbl_electric_main_bill` WRITE;
/*!40000 ALTER TABLE `tbl_electric_main_bill` DISABLE KEYS */;
/*!40000 ALTER TABLE `tbl_electric_main_bill` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `tbl_issue_report`
--

DROP TABLE IF EXISTS `tbl_issue_report`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
 SET character_set_client = utf8mb4 ;
CREATE TABLE `tbl_issue_report` (
  `intId` int(11) NOT NULL AUTO_INCREMENT,
  `intContractId` int(11) NOT NULL,
  `strSubject` varchar(45) NOT NULL,
  `strMessage` longtext,
  `booStatus` tinyint(4) NOT NULL DEFAULT '0',
  PRIMARY KEY (`intId`),
  KEY `issueReport to contract_idx` (`intContractId`),
  CONSTRAINT `issueReport to contract` FOREIGN KEY (`intContractId`) REFERENCES `tbl_contract` (`intid`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `tbl_issue_report`
--

LOCK TABLES `tbl_issue_report` WRITE;
/*!40000 ALTER TABLE `tbl_issue_report` DISABLE KEYS */;
/*!40000 ALTER TABLE `tbl_issue_report` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `tbl_lessee`
--

DROP TABLE IF EXISTS `tbl_lessee`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
 SET character_set_client = utf8mb4 ;
CREATE TABLE `tbl_lessee` (
  `strId` varchar(20) NOT NULL,
  `strFirstName` varchar(45) NOT NULL,
  `strMiddleName` varchar(45) DEFAULT NULL,
  `strLastName` varchar(45) NOT NULL,
  `strAddress` longtext NOT NULL,
  `strValidId1` longtext NOT NULL,
  `strValidId2` longtext NOT NULL,
  `strBaranggayPermit` longtext NOT NULL,
  `strEmail` varchar(45) NOT NULL,
  `strPhoneNumber` varchar(45) NOT NULL,
  `strUsername` varchar(45) NOT NULL,
  `strPassword` varchar(45) NOT NULL,
  `booLesseeType` tinyint(4) NOT NULL,
  PRIMARY KEY (`strId`),
  UNIQUE KEY `strEmail_UNIQUE` (`strEmail`),
  UNIQUE KEY `strUsername_UNIQUE` (`strUsername`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `tbl_lessee`
--

LOCK TABLES `tbl_lessee` WRITE;
/*!40000 ALTER TABLE `tbl_lessee` DISABLE KEYS */;
INSERT INTO `tbl_lessee` VALUES ('2019-00001-I','Gramar','','Lacsina','Manila','validId1-1547542269138.jpg','validId2-1547542269139.jpg','baranggayPermit-1547542269140.jpg','gramar@offshorly.com','(+63) 912-463-8507','lgramar59','212719605732294939',0),('2019-00002-I','asd','asd','asd','asd','validId1-1547542385896.jpg','validId2-1547542385898.jpg','baranggayPermit-1547542385898.jpg','dev@offshorly.com','(+63) 912-463-8507','aasd57','Qorkd5aV6',0),('2019-00003-C','asd','asd','asd','asd','validId1-1547544330877.jpg','validId2-1547544330878.jpg','baranggayPermit-1547544330878.jpg','manual181217@mailinator.com','(+63) 912-463-8507','aasd13','z16ivsdL1',1);
/*!40000 ALTER TABLE `tbl_lessee` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `tbl_payment`
--

DROP TABLE IF EXISTS `tbl_payment`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
 SET character_set_client = utf8mb4 ;
CREATE TABLE `tbl_payment` (
  `strReferenceNo` varchar(45) NOT NULL,
  `dblAmountPaid` double NOT NULL,
  PRIMARY KEY (`strReferenceNo`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `tbl_payment`
--

LOCK TABLES `tbl_payment` WRITE;
/*!40000 ALTER TABLE `tbl_payment` DISABLE KEYS */;
/*!40000 ALTER TABLE `tbl_payment` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `tbl_rental_bill`
--

DROP TABLE IF EXISTS `tbl_rental_bill`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
 SET character_set_client = utf8mb4 ;
CREATE TABLE `tbl_rental_bill` (
  `intId` int(11) NOT NULL AUTO_INCREMENT,
  `intContractId` int(11) NOT NULL,
  `datDueDate` date NOT NULL,
  `strPaymentReferenceNo` varchar(45) DEFAULT NULL,
  PRIMARY KEY (`intId`),
  KEY `rentalBill to contract_idx` (`intContractId`),
  KEY `rentalBill to payment_idx` (`strPaymentReferenceNo`),
  CONSTRAINT `rentalBill to contract` FOREIGN KEY (`intContractId`) REFERENCES `tbl_contract` (`intid`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `rentalBill to payment` FOREIGN KEY (`strPaymentReferenceNo`) REFERENCES `tbl_payment` (`strreferenceno`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `tbl_rental_bill`
--

LOCK TABLES `tbl_rental_bill` WRITE;
/*!40000 ALTER TABLE `tbl_rental_bill` DISABLE KEYS */;
/*!40000 ALTER TABLE `tbl_rental_bill` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `tbl_staff`
--

DROP TABLE IF EXISTS `tbl_staff`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
 SET character_set_client = utf8mb4 ;
CREATE TABLE `tbl_staff` (
  `intId` int(11) NOT NULL AUTO_INCREMENT,
  `strFirstName` varchar(45) NOT NULL,
  `strMiddleName` varchar(45) DEFAULT NULL,
  `strLastName` varchar(45) NOT NULL,
  `strEmail` varchar(45) NOT NULL,
  `strPhone` varchar(45) NOT NULL,
  `strUsername` varchar(45) NOT NULL,
  `strPassword` varchar(45) NOT NULL,
  `booStatus` tinyint(4) NOT NULL DEFAULT '1',
  PRIMARY KEY (`intId`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `tbl_staff`
--

LOCK TABLES `tbl_staff` WRITE;
/*!40000 ALTER TABLE `tbl_staff` DISABLE KEYS */;
/*!40000 ALTER TABLE `tbl_staff` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `tbl_stall`
--

DROP TABLE IF EXISTS `tbl_stall`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
 SET character_set_client = utf8mb4 ;
CREATE TABLE `tbl_stall` (
  `strId` varchar(10) NOT NULL,
  `booStallType` tinyint(4) NOT NULL,
  `booIsAvailable` tinyint(4) NOT NULL DEFAULT '0',
  PRIMARY KEY (`strId`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `tbl_stall`
--

LOCK TABLES `tbl_stall` WRITE;
/*!40000 ALTER TABLE `tbl_stall` DISABLE KEYS */;
/*!40000 ALTER TABLE `tbl_stall` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `tbl_ticket`
--

DROP TABLE IF EXISTS `tbl_ticket`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
 SET character_set_client = utf8mb4 ;
CREATE TABLE `tbl_ticket` (
  `intId` int(11) NOT NULL AUTO_INCREMENT,
  `intIssueId` int(11) NOT NULL,
  `booStatus` tinyint(4) NOT NULL DEFAULT '0',
  PRIMARY KEY (`intId`),
  KEY `ticket to issueReport_idx` (`intIssueId`),
  CONSTRAINT `ticket to issueReport` FOREIGN KEY (`intIssueId`) REFERENCES `tbl_issue_report` (`intid`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `tbl_ticket`
--

LOCK TABLES `tbl_ticket` WRITE;
/*!40000 ALTER TABLE `tbl_ticket` DISABLE KEYS */;
/*!40000 ALTER TABLE `tbl_ticket` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `tbl_water_lessee_bill`
--

DROP TABLE IF EXISTS `tbl_water_lessee_bill`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
 SET character_set_client = utf8mb4 ;
CREATE TABLE `tbl_water_lessee_bill` (
  `intId` int(11) NOT NULL AUTO_INCREMENT,
  `intWaterMainBillId` int(11) NOT NULL,
  `dblAmountDue` double NOT NULL,
  `intTotalCubicMeterUsage` int(11) NOT NULL,
  `datDueDate` date NOT NULL,
  `strPaymentReferenceNo` varchar(45) DEFAULT NULL,
  PRIMARY KEY (`intId`),
  KEY `waterBill to mainWater_idx` (`intWaterMainBillId`),
  KEY `waterBill to payment_idx` (`strPaymentReferenceNo`),
  CONSTRAINT `waterBill to mainWater` FOREIGN KEY (`intWaterMainBillId`) REFERENCES `tbl_water_main_bill` (`intid`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `waterBill to payment` FOREIGN KEY (`strPaymentReferenceNo`) REFERENCES `tbl_payment` (`strreferenceno`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `tbl_water_lessee_bill`
--

LOCK TABLES `tbl_water_lessee_bill` WRITE;
/*!40000 ALTER TABLE `tbl_water_lessee_bill` DISABLE KEYS */;
/*!40000 ALTER TABLE `tbl_water_lessee_bill` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `tbl_water_main_bill`
--

DROP TABLE IF EXISTS `tbl_water_main_bill`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
 SET character_set_client = utf8mb4 ;
CREATE TABLE `tbl_water_main_bill` (
  `intId` int(11) NOT NULL AUTO_INCREMENT,
  `dblTotalAmountDue` double NOT NULL,
  `intTotalCubicMeterUsage` int(11) NOT NULL,
  `intDueMonth` int(11) NOT NULL,
  `intDueDay` int(11) NOT NULL,
  `intDueYear` int(11) NOT NULL,
  PRIMARY KEY (`intId`),
  UNIQUE KEY `dueConstraint` (`intDueMonth`,`intDueYear`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `tbl_water_main_bill`
--

LOCK TABLES `tbl_water_main_bill` WRITE;
/*!40000 ALTER TABLE `tbl_water_main_bill` DISABLE KEYS */;
/*!40000 ALTER TABLE `tbl_water_main_bill` ENABLE KEYS */;
UNLOCK TABLES;
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed on 2019-01-15 19:03:26
