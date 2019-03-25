CREATE DATABASE  IF NOT EXISTS `stallv6` /*!40100 DEFAULT CHARACTER SET utf8 */;
USE `stallv6`;
-- MySQL dump 10.13  Distrib 5.7.17, for Win64 (x86_64)
--
-- Host: 127.0.0.1    Database: stallv6
-- ------------------------------------------------------
-- Server version	5.7.19-log

/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8 */;
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
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `tbl_company_lessee` (
  `strLesseeId` varchar(20) NOT NULL,
  `strCompanyName` varchar(80) NOT NULL,
  `strCompanyAddress` longtext NOT NULL,
  `strRepresentativePosition` varchar(45) NOT NULL,
  `strBusinessPermit` longtext NOT NULL,
  `strMayorPermit` longtext NOT NULL,
  `strDtiPermit` longtext NOT NULL,
  PRIMARY KEY (`strLesseeId`),
  CONSTRAINT `company to lessee` FOREIGN KEY (`strLesseeId`) REFERENCES `tbl_lessee` (`strid`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `tbl_company_lessee`
--

LOCK TABLES `tbl_company_lessee` WRITE;
/*!40000 ALTER TABLE `tbl_company_lessee` DISABLE KEYS */;
INSERT INTO `tbl_company_lessee` VALUES ('2019-00003-C','Apptrade','Cavite','Marketing Head','business-1553082186121.jpg','mayor-1553082186125.jpg','');
/*!40000 ALTER TABLE `tbl_company_lessee` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `tbl_contract`
--

DROP TABLE IF EXISTS `tbl_contract`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `tbl_contract` (
  `intId` int(11) NOT NULL AUTO_INCREMENT,
  `strLesseeId` varchar(20) NOT NULL,
  `strStallId` varchar(10) NOT NULL,
  `strContractStallDescription` longtext NOT NULL,
  `intContractMonth` int(11) NOT NULL,
  `intContractDay` int(11) NOT NULL,
  `intContractYear` int(11) NOT NULL,
  `intContractDuration` int(11) NOT NULL,
  `booContractStatus` tinyint(4) NOT NULL DEFAULT '0',
  `dblRentPrice` double NOT NULL,
  PRIMARY KEY (`intId`),
  KEY `contract to lessee_idx` (`strLesseeId`),
  KEY `contract to stall_idx` (`strStallId`),
  CONSTRAINT `contract to lessee` FOREIGN KEY (`strLesseeId`) REFERENCES `tbl_lessee` (`strid`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `contract to stall` FOREIGN KEY (`strStallId`) REFERENCES `tbl_stall` (`strid`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=40 DEFAULT CHARSET=utf8;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `tbl_contract`
--

LOCK TABLES `tbl_contract` WRITE;
/*!40000 ALTER TABLE `tbl_contract` DISABLE KEYS */;
INSERT INTO `tbl_contract` VALUES (30,'2019-00001-I','A-1','Gramar Foods',3,18,2019,6,0,8000),(31,'2019-00001-I','B-48','Gramar RTW',3,18,2019,6,2,7000),(32,'2019-00002-I','A-2','Rae Foods',3,18,2019,6,0,8000),(33,'2019-00002-I','B-34','Rae Dry Goods',3,20,2019,6,0,7000),(39,'2019-00004-I','B-48','Hideaway',3,25,2019,6,0,7000);
/*!40000 ALTER TABLE `tbl_contract` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `tbl_electric_lessee_bill`
--

DROP TABLE IF EXISTS `tbl_electric_lessee_bill`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `tbl_electric_lessee_bill` (
  `intId` int(11) NOT NULL AUTO_INCREMENT,
  `intElectricMainBillId` int(11) NOT NULL,
  `intContractId` int(11) NOT NULL,
  `intPreviousMeterReading` int(11) NOT NULL,
  `intMeterReading` int(11) NOT NULL,
  `intTotalKwhUsage` int(11) NOT NULL,
  `dblAmountDue` double NOT NULL,
  `dblAdminFee` double NOT NULL,
  `datDueDate` date NOT NULL,
  `strPaymentReferenceNo` varchar(45) DEFAULT NULL,
  PRIMARY KEY (`intId`),
  KEY `electricBill to mainElectric_idx` (`intElectricMainBillId`),
  KEY `electricBill to contract_idx` (`intContractId`),
  CONSTRAINT `electricBill to contract` FOREIGN KEY (`intContractId`) REFERENCES `tbl_contract` (`intId`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `electricBill to mainElectric` FOREIGN KEY (`intElectricMainBillId`) REFERENCES `tbl_electric_main_bill` (`intid`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=10013 DEFAULT CHARSET=utf8;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `tbl_electric_lessee_bill`
--

LOCK TABLES `tbl_electric_lessee_bill` WRITE;
/*!40000 ALTER TABLE `tbl_electric_lessee_bill` DISABLE KEYS */;
INSERT INTO `tbl_electric_lessee_bill` VALUES (10010,13,30,35,40,5,307.9,15.39,'2019-03-25',NULL),(10011,13,31,100,150,50,3079,153.95,'2019-03-25',NULL),(10012,13,32,20,50,30,1847.3999999999999,92.37,'2019-03-25',NULL);
/*!40000 ALTER TABLE `tbl_electric_lessee_bill` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `tbl_electric_main_bill`
--

DROP TABLE IF EXISTS `tbl_electric_main_bill`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `tbl_electric_main_bill` (
  `intId` int(11) NOT NULL AUTO_INCREMENT,
  `dblTotalAmountDue` double NOT NULL,
  `intTotalKwhUsage` int(11) NOT NULL,
  `intDueMonth` int(11) NOT NULL,
  `intDueDay` int(11) NOT NULL,
  `intDueYear` int(11) NOT NULL,
  `booStatus` tinyint(4) NOT NULL DEFAULT '0',
  PRIMARY KEY (`intId`),
  UNIQUE KEY `dueConstraint` (`intDueMonth`,`intDueYear`)
) ENGINE=InnoDB AUTO_INCREMENT=14 DEFAULT CHARSET=utf8;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `tbl_electric_main_bill`
--

LOCK TABLES `tbl_electric_main_bill` WRITE;
/*!40000 ALTER TABLE `tbl_electric_main_bill` DISABLE KEYS */;
INSERT INTO `tbl_electric_main_bill` VALUES (13,5234,300,3,30,2019,2);
/*!40000 ALTER TABLE `tbl_electric_main_bill` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `tbl_issue_report`
--

DROP TABLE IF EXISTS `tbl_issue_report`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `tbl_issue_report` (
  `intId` int(11) NOT NULL AUTO_INCREMENT,
  `intContractId` int(11) NOT NULL,
  `strSubject` varchar(45) NOT NULL,
  `strMessage` longtext,
  `booStatus` tinyint(4) NOT NULL DEFAULT '0',
  PRIMARY KEY (`intId`),
  KEY `issueReport to contract_idx` (`intContractId`),
  CONSTRAINT `issueReport to contract` FOREIGN KEY (`intContractId`) REFERENCES `tbl_contract` (`intId`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=6 DEFAULT CHARSET=utf8;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `tbl_issue_report`
--

LOCK TABLES `tbl_issue_report` WRITE;
/*!40000 ALTER TABLE `tbl_issue_report` DISABLE KEYS */;
INSERT INTO `tbl_issue_report` VALUES (5,30,'No Water','No water since last week',1);
/*!40000 ALTER TABLE `tbl_issue_report` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `tbl_lessee`
--

DROP TABLE IF EXISTS `tbl_lessee`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
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
  `booIsDeleted` tinyint(4) NOT NULL DEFAULT '0',
  `booFirstLogin` tinyint(4) NOT NULL DEFAULT '0',
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
INSERT INTO `tbl_lessee` VALUES ('2019-00001-I','Gramar','Desuyo','Lacsina','Punta Sta. Ana, Manila','validId1-1552904977361.jpg','validId2-1552904977458.jpg','baranggayPermit-1552904977570.jpg','gramar@test.com','(+63) 932-798-4453','gramar','gramar',0,0,1),('2019-00002-I','Rae','','Macaya','Caloocan City','validId1-1552905038404.jpg','validId2-1552905038413.jpg','baranggayPermit-1552905038418.jpg','rae@test.com','(+63) 923-084-2379','mrae21','BxlkN7Ly6',0,0,0),('2019-00003-C','Leslie','','Cordoviz','Cainta','validId1-1553082185312.jpg','validId2-1553082185328.jpg','baranggayPermit-1553082185437.jpg','leslie@test.com','(+63) 975-612-9837','cleslie09','lwtfreR2D',1,0,0),('2019-00004-I','Grace','','Vanderwaal','Hideaway','{\"idType\":\"Voter\",\"scannedId\":\"validId1-1553436688418.jpg\"}','{\"idType\":\"SSS\",\"scannedId\":\"validId2-1553436688425.jpg\"}','baranggayPermit-1553436688430.jpg','grace@test.com','(+63) 929-847-9238','vgrace76','IuPxo4uCO',0,0,0);
/*!40000 ALTER TABLE `tbl_lessee` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `tbl_payment`
--

DROP TABLE IF EXISTS `tbl_payment`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `tbl_payment` (
  `strReferenceNo` varchar(45) NOT NULL,
  `datDatePaid` date NOT NULL,
  `dblAmountPaid` double NOT NULL,
  PRIMARY KEY (`strReferenceNo`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `tbl_payment`
--

LOCK TABLES `tbl_payment` WRITE;
/*!40000 ALTER TABLE `tbl_payment` DISABLE KEYS */;
INSERT INTO `tbl_payment` VALUES ('6cAPJ3bT2bKaeMsa','2019-03-18',14000),('dGWgf6eFVZTz953o','2019-03-18',16000),('e5f84lqkBQzRAXsd','2019-03-18',16000),('snEokwvVwSlUHHZO','2019-03-20',14000),('WF3Q0YYnFIBHZQFw','2019-03-25',14000);
/*!40000 ALTER TABLE `tbl_payment` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `tbl_payment_child`
--

DROP TABLE IF EXISTS `tbl_payment_child`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `tbl_payment_child` (
  `intId` int(11) NOT NULL AUTO_INCREMENT,
  `strPaymentReferenceNo` varchar(45) NOT NULL,
  `intBillId` int(11) NOT NULL,
  `strBillType` varchar(5) NOT NULL,
  PRIMARY KEY (`intId`),
  KEY `child to payment_idx` (`strPaymentReferenceNo`)
) ENGINE=InnoDB AUTO_INCREMENT=30 DEFAULT CHARSET=utf8mb4;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `tbl_payment_child`
--

LOCK TABLES `tbl_payment_child` WRITE;
/*!40000 ALTER TABLE `tbl_payment_child` DISABLE KEYS */;
INSERT INTO `tbl_payment_child` VALUES (21,'dGWgf6eFVZTz953o',10003,'R'),(22,'6cAPJ3bT2bKaeMsa',10004,'R'),(23,'e5f84lqkBQzRAXsd',10005,'R'),(24,'snEokwvVwSlUHHZO',10006,'R'),(29,'WF3Q0YYnFIBHZQFw',10011,'R');
/*!40000 ALTER TABLE `tbl_payment_child` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `tbl_rental_bill`
--

DROP TABLE IF EXISTS `tbl_rental_bill`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `tbl_rental_bill` (
  `intId` int(11) NOT NULL AUTO_INCREMENT,
  `intContractId` int(11) NOT NULL,
  `datDueDate` date NOT NULL,
  `dblAmountDue` double NOT NULL,
  `strPaymentReferenceNo` varchar(45) DEFAULT NULL,
  PRIMARY KEY (`intId`),
  KEY `rentalBill to contract_idx` (`intContractId`),
  KEY `rentalBill to payment_idx` (`strPaymentReferenceNo`),
  CONSTRAINT `rentalBill to contract` FOREIGN KEY (`intContractId`) REFERENCES `tbl_contract` (`intId`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `rentalBill to payment` FOREIGN KEY (`strPaymentReferenceNo`) REFERENCES `tbl_payment` (`strReferenceNo`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=10012 DEFAULT CHARSET=utf8;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `tbl_rental_bill`
--

LOCK TABLES `tbl_rental_bill` WRITE;
/*!40000 ALTER TABLE `tbl_rental_bill` DISABLE KEYS */;
INSERT INTO `tbl_rental_bill` VALUES (10003,30,'2019-03-18',16000,'dGWgf6eFVZTz953o'),(10004,31,'2019-03-18',14000,'6cAPJ3bT2bKaeMsa'),(10005,32,'2019-03-18',16000,'e5f84lqkBQzRAXsd'),(10006,33,'2019-03-20',14000,'snEokwvVwSlUHHZO'),(10011,39,'2019-03-25',14000,'WF3Q0YYnFIBHZQFw');
/*!40000 ALTER TABLE `tbl_rental_bill` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `tbl_staff`
--

DROP TABLE IF EXISTS `tbl_staff`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
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
  PRIMARY KEY (`intId`),
  UNIQUE KEY `strUsername_UNIQUE` (`strUsername`)
) ENGINE=InnoDB AUTO_INCREMENT=11 DEFAULT CHARSET=utf8;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `tbl_staff`
--

LOCK TABLES `tbl_staff` WRITE;
/*!40000 ALTER TABLE `tbl_staff` DISABLE KEYS */;
INSERT INTO `tbl_staff` VALUES (10,'Rachel','Maiden','Flores','rachel@test.com','(+63) 932-746-7873','rachel','pass',1);
/*!40000 ALTER TABLE `tbl_staff` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `tbl_stall`
--

DROP TABLE IF EXISTS `tbl_stall`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `tbl_stall` (
  `strId` varchar(10) NOT NULL,
  `booStallType` tinyint(4) NOT NULL,
  `booIsAvailable` tinyint(4) NOT NULL DEFAULT '0',
  `intKwhUsage` int(11) NOT NULL DEFAULT '0',
  `intCubicMeterUsage` int(11) NOT NULL DEFAULT '0',
  `dblX` double NOT NULL,
  `dblY` double NOT NULL,
  PRIMARY KEY (`strId`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `tbl_stall`
--

LOCK TABLES `tbl_stall` WRITE;
/*!40000 ALTER TABLE `tbl_stall` DISABLE KEYS */;
INSERT INTO `tbl_stall` VALUES ('A-1',0,1,40,110,141,61),('A-2',0,1,50,400,211.99999700927754,61),('A-3',0,1,0,0,281,61),('B-34',1,1,0,0,173,408),('B-35',1,0,0,0,243,408),('B-48',1,1,150,120,173,478);
/*!40000 ALTER TABLE `tbl_stall` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `tbl_ticket`
--

DROP TABLE IF EXISTS `tbl_ticket`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `tbl_ticket` (
  `intId` int(11) NOT NULL AUTO_INCREMENT,
  `intIssueId` int(11) NOT NULL,
  `strAssigneeUsername` varchar(45) NOT NULL,
  `booStatus` tinyint(4) NOT NULL DEFAULT '0',
  `datTicketDate` date NOT NULL,
  PRIMARY KEY (`intId`),
  KEY `ticket to issueReport_idx` (`intIssueId`),
  KEY `ticket to staff_idx` (`strAssigneeUsername`),
  CONSTRAINT `ticket to issueReport` FOREIGN KEY (`intIssueId`) REFERENCES `tbl_issue_report` (`intId`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `ticket to staff` FOREIGN KEY (`strAssigneeUsername`) REFERENCES `tbl_staff` (`strUsername`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=10002 DEFAULT CHARSET=utf8;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `tbl_ticket`
--

LOCK TABLES `tbl_ticket` WRITE;
/*!40000 ALTER TABLE `tbl_ticket` DISABLE KEYS */;
INSERT INTO `tbl_ticket` VALUES (10001,5,'rachel',1,'2019-03-20');
/*!40000 ALTER TABLE `tbl_ticket` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `tbl_utilities`
--

DROP TABLE IF EXISTS `tbl_utilities`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `tbl_utilities` (
  `intUtilitiesId` int(11) NOT NULL,
  `dblFoodStallPrice` double NOT NULL,
  `dblDryGoodsStallPrice` double NOT NULL,
  `strAdminUsername` varchar(45) NOT NULL,
  `strAdminPassword` varchar(45) NOT NULL,
  `strFoodStallPrice` longtext NOT NULL,
  `strDryGoodsStallPrice` longtext NOT NULL,
  `intUtilitiesCutOffDay` int(11) NOT NULL,
  `intAdminFeePercentage` double NOT NULL,
  PRIMARY KEY (`intUtilitiesId`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `tbl_utilities`
--

LOCK TABLES `tbl_utilities` WRITE;
/*!40000 ALTER TABLE `tbl_utilities` DISABLE KEYS */;
INSERT INTO `tbl_utilities` VALUES (1,8000,7000,'admin','admin','{\"regular\":\"Eight Thousand\",\"double\":\"Sixteen Thousand\"}','{\"regular\":\"Seven Thousand\",\"double\":\"Fourteen Thousand\"}',25,0.05);
/*!40000 ALTER TABLE `tbl_utilities` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `tbl_water_lessee_bill`
--

DROP TABLE IF EXISTS `tbl_water_lessee_bill`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `tbl_water_lessee_bill` (
  `intId` int(11) NOT NULL AUTO_INCREMENT,
  `intWaterMainBillId` int(11) NOT NULL,
  `intContractId` int(11) NOT NULL,
  `intPreviousMeterReading` int(11) NOT NULL,
  `intMeterReading` int(11) NOT NULL,
  `intTotalCubicMeterUsage` int(11) NOT NULL,
  `dblAmountDue` double NOT NULL,
  `dblAdminFee` double NOT NULL,
  `datDueDate` date NOT NULL,
  `strPaymentReferenceNo` varchar(45) DEFAULT NULL,
  PRIMARY KEY (`intId`),
  KEY `waterBill to mainWater_idx` (`intWaterMainBillId`),
  KEY `waterBill to contract_idx` (`intContractId`),
  CONSTRAINT `waterBill to contract` FOREIGN KEY (`intContractId`) REFERENCES `tbl_contract` (`intId`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `waterBill to mainWater` FOREIGN KEY (`intWaterMainBillId`) REFERENCES `tbl_water_main_bill` (`intid`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=10011 DEFAULT CHARSET=utf8;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `tbl_water_lessee_bill`
--

LOCK TABLES `tbl_water_lessee_bill` WRITE;
/*!40000 ALTER TABLE `tbl_water_lessee_bill` DISABLE KEYS */;
INSERT INTO `tbl_water_lessee_bill` VALUES (10008,6,30,100,110,10,1083.8,54.19,'2019-03-25',NULL),(10009,6,31,110,120,10,1083.8,54.19,'2019-03-25',NULL),(10010,6,32,350,400,50,5419,270.95,'2019-03-25',NULL);
/*!40000 ALTER TABLE `tbl_water_lessee_bill` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `tbl_water_main_bill`
--

DROP TABLE IF EXISTS `tbl_water_main_bill`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `tbl_water_main_bill` (
  `intId` int(11) NOT NULL AUTO_INCREMENT,
  `dblTotalAmountDue` double NOT NULL,
  `intTotalCubicMeterUsage` int(11) NOT NULL,
  `intDueMonth` int(11) NOT NULL,
  `intDueDay` int(11) NOT NULL,
  `intDueYear` int(11) NOT NULL,
  `booStatus` tinyint(4) NOT NULL DEFAULT '0',
  PRIMARY KEY (`intId`),
  UNIQUE KEY `dueConstraint` (`intDueMonth`,`intDueYear`)
) ENGINE=InnoDB AUTO_INCREMENT=7 DEFAULT CHARSET=utf8;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `tbl_water_main_bill`
--

LOCK TABLES `tbl_water_main_bill` WRITE;
/*!40000 ALTER TABLE `tbl_water_main_bill` DISABLE KEYS */;
INSERT INTO `tbl_water_main_bill` VALUES (6,7586.54,386,3,30,2019,2);
/*!40000 ALTER TABLE `tbl_water_main_bill` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Dumping events for database 'stallv6'
--

--
-- Dumping routines for database 'stallv6'
--
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed on 2019-03-25 23:31:51
