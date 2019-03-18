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
  PRIMARY KEY (`strLesseeId`),
  CONSTRAINT `company to lessee` FOREIGN KEY (`strLesseeId`) REFERENCES `tbl_lessee` (`strid`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8;
/*!40101 SET character_set_client = @saved_cs_client */;

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
) ENGINE=InnoDB AUTO_INCREMENT=30 DEFAULT CHARSET=utf8;
/*!40101 SET character_set_client = @saved_cs_client */;

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
) ENGINE=InnoDB AUTO_INCREMENT=10002 DEFAULT CHARSET=utf8;
/*!40101 SET character_set_client = @saved_cs_client */;

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
) ENGINE=InnoDB AUTO_INCREMENT=13 DEFAULT CHARSET=utf8;
/*!40101 SET character_set_client = @saved_cs_client */;

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
) ENGINE=InnoDB AUTO_INCREMENT=5 DEFAULT CHARSET=utf8;
/*!40101 SET character_set_client = @saved_cs_client */;

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
  PRIMARY KEY (`strId`),
  UNIQUE KEY `strEmail_UNIQUE` (`strEmail`),
  UNIQUE KEY `strUsername_UNIQUE` (`strUsername`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8;
/*!40101 SET character_set_client = @saved_cs_client */;

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
) ENGINE=InnoDB AUTO_INCREMENT=21 DEFAULT CHARSET=utf8mb4;
/*!40101 SET character_set_client = @saved_cs_client */;

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
) ENGINE=InnoDB AUTO_INCREMENT=10003 DEFAULT CHARSET=utf8;
/*!40101 SET character_set_client = @saved_cs_client */;

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
) ENGINE=InnoDB AUTO_INCREMENT=10 DEFAULT CHARSET=utf8;
/*!40101 SET character_set_client = @saved_cs_client */;

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
  PRIMARY KEY (`strId`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8;
/*!40101 SET character_set_client = @saved_cs_client */;

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
) ENGINE=InnoDB AUTO_INCREMENT=10001 DEFAULT CHARSET=utf8;
/*!40101 SET character_set_client = @saved_cs_client */;

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
) ENGINE=InnoDB AUTO_INCREMENT=10002 DEFAULT CHARSET=utf8;
/*!40101 SET character_set_client = @saved_cs_client */;

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
) ENGINE=InnoDB AUTO_INCREMENT=6 DEFAULT CHARSET=utf8;
/*!40101 SET character_set_client = @saved_cs_client */;

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

-- Dump completed on 2019-03-18 18:11:45
