const express = require('express');
const router = express.Router();
const db = require('../../lib/database')();
const moment = require('moment');
const multer = require('multer');
const middleware = require('../auth/middlewares/auth');
const fs = require('fs')
const numberToWords = require('number-to-words')

// MULTER CONFIG
const myStorage = multer.diskStorage({
	destination: function(req, file, cb){
		cb(null, 'public/uploads')
	},
	filename: function(req, file, cb){
		cb(null, file.fieldname + '-' + Date.now() + '.jpg')
	}
});
const upload = multer({storage: myStorage})

// HELPER FUNCTIONS
function changeContractStatus(contractId, status){
	return new Promise(function (resolve, reject){
		db.query('UPDATE tbl_contract SET booContractStatus = ? WHERE intId = ?', [status, contractId], (err, results) => {
			if(err) console.log(err)

			db.query('SELECT strStallId FROM tbl_contract WHERE intId = ?', contractId, (err, results) => {
				if(err) console.log(err)

				db.query('UPDATE tbl_stall SET booIsAvailable = 0 WHERE strId = ?', results[0].strStallId, (err, results) => {
					if(err) console.log(err)

					resolve()
				})
			})
		})
	})
}

//GET
router.get('/',middleware.hasAdminOrStaff, (req, res) => {
	function getRevenue(){
		return new Promise(function(resolve, reject){
			const monthNow = moment().format('MM')
			db.query(`SELECT SUM(dblAdminFee) AS adminFeeRev FROM tbl_electric_lessee_bill WHERE MONTH(datDueDate) = ${monthNow} AND strPaymentReferenceNo IS NOT NULL`, (err, results) => {
				if(err) console.log(err)

				const electricAdmin = results[0].adminFeeRev
				db.query(`SELECT SUM(dblAdminFee) AS adminFeeRev FROM tbl_water_lessee_bill WHERE MONTH(datDueDate) = ${monthNow} AND strPaymentReferenceNo IS NOT NULL`, (err, results) => {
					if(err) console.log(err)
	
					const waterAdmin = results[0].adminFeeRev
					db.query(`SELECT SUM(dblAmountDue) AS rentalFee FROM tbl_rental_bill WHERE MONTH(datDueDate) = ${monthNow} AND strPaymentReferenceNo IS NOT NULL`, (err, results) => {
						if(err) console.log(err)
		
						const rentalFee = results[0].rentalFee

						resolve(eval(`${electricAdmin}+${waterAdmin}+${rentalFee}`))
					})
				})
			})
		})
	}
	getRevenue().then(revenue => {
		db.query('SELECT COUNT(*) AS issueCount FROM tbl_issue_report', (err, results) => {
			if(err) console.log(err)

			db.query('SELECT COUNT(*) AS lesseeCount FROM tbl_lessee WHERE booIsDeleted = 0', (err, lesseeCount) =>{
				if(err) console.log(err)

				db.query('SELECT COUNT(*) AS staffCount FROM tbl_staff WHERE booStatus = 1', (err, staffCount) => {
					if(err) console.log(err)

					return res.render('admin/views/index', {
						url: req.url, 
						query: req.query, 
						session: req.session, 
						issueCount: results[0].issueCount, 
						revenueThisMonth: revenue,
						lesseeCount: lesseeCount[0].lesseeCount,
						staffCount: staffCount[0].staffCount
					});
				})
			})
	
		})
	})
});
router.get('/login',middleware.hasNoAdminOrStaff, (req, res) => {
	db.query('SELECT * FROM tbl_utilities LIMIT 1', (err, results) => {
		if(err) console.log(err)

		req.session.utilities = results[0]
		return res.render('admin/views/login', {query: req.query, session: req.session});
	})
});
router.get('/logout', (req, res) => {
	if(req.session.admin){
		delete req.session.admin
		res.redirect('/admin/login');
		console.log(req.session)
	}
	else{
		delete req.session.staff
		res.redirect('/admin/login');
		console.log(req.session)
	}
})
router.get('/stall',middleware.hasAdmin, (req, res) => {
	db.query('SELECT * FROM tbl_stall', (err, results) =>{
		if(err) console.log(err)

		return res.render('admin/views/stall', {url: req.url, stalls:results, session: req.session})
	})
})
router.get('/lessee',middleware.hasAdmin, (req, res) => {
	db.query('SELECT * FROM tbl_lessee WHERE booIsDeleted = 0', (err, results) => {
		if(err) console.log(err)

		if(results.length==0) return res.render('admin/views/lessee', {lessees: results, url: req.url, session: req.session})

		for(let a = 0; a<results.length; a++){
			db.query('SELECT * FROM tbl_company_lessee WHERE strLesseeId = ?', [results[a].strId], (err, results2) =>{
				if(err) console.log(err)

				if(results2.length>0){
					results[a].companyInfo = results2;
				}
			})
			if(a == results.length - 1){
				console.log(results);
				return res.render('admin/views/lessee', {lessees: results, url: req.url, session: req.session})
			}
		}    
	})
})
router.get('/rental',middleware.hasAdmin, (req, res) => {
	db.query('SELECT * FROM tbl_contract', (err, results) => {
		if(err) console.log(err)

		const contract = results;
		db.query('SELECT * FROM tbl_stall WHERE booIsAvailable = 0', (err, results) => {
			if(err) console.log(err)

			if(results.length>0) return res.render('admin/views/leasing', {contracts: contract, url: req.url, stalls: results, session: req.session})
			else return res.render('admin/views/leasing', {contracts: contract, url: req.url, stalls: [], session: req.session})
		})

	})
})
router.get('/staff', middleware.hasAdmin, (req, res) => {
	db.query('SELECT * FROM tbl_staff WHERE booStatus = 1', (err, results) => {
		if(err) console.log(err)

		if(results.length>0) return res.render('admin/views/staff', {staffs: results, url: req.url, session: req.session})
		else return res.render('admin/views/staff', {staffs: [], url: req.url, session: req.session})
	})
})
router.get('/electric-bill', middleware.hasAdmin, (req, res) => {
	db.query('SELECT * FROM tbl_electric_main_bill', (err, results) => {
		if(err) console.log(err)

		for(let i = 0; i< results.length; i++){
			results[i].billDate = moment(`${results[i].intDueMonth}-${results[i].intDueYear}`, 'MM-YYYY').format('MMMM YYYY')
		}

		return res.render('admin/views/electric-bill', {electric: results, url: req.url, session: req.session})
	})
})
router.get('/water-bill', middleware.hasAdmin, (req, res) => {
	db.query('SELECT * FROM tbl_water_main_bill', (err, results) => {
		if(err) console.log(err)

		for(let i = 0; i< results.length; i++){
			results[i].billDate = moment(`${results[i].intDueMonth}-${results[i].intDueYear}`, 'MM-YYYY').format('MMMM YYYY')
		}

		return res.render('admin/views/water-bill', {water: results, url: req.url, session: req.session})
	})
})
router.get('/electric-consumption', middleware.hasAdminOrStaff, (req, res) => {
	db.query('SELECT * FROM tbl_electric_main_bill', (err, results) => {
		if(err) console.log(err)

		for(let i = 0; i< results.length; i++){
			results[i].billDate = moment(`${results[i].intDueMonth}-${results[i].intDueYear}`, 'MM-YYYY').format('MMMM YYYY')
		}

		return res.render('admin/views/electric-consumption', {electric: results, url: req.url, session: req.session})
	})
})
router.get('/water-consumption', middleware.hasAdminOrStaff, (req, res) => {
	db.query('SELECT * FROM tbl_water_main_bill', (err, results) => {
		if(err) console.log(err)

		for(let i = 0; i< results.length; i++){
			results[i].billDate = moment(`${results[i].intDueMonth}-${results[i].intDueYear}`, 'MM-YYYY').format('MMMM YYYY')
		}

		return res.render('admin/views/water-consumption', {water: results, url: req.url, session: req.session})
	})
})
router.get('/payment', middleware.hasAdminOrStaff, (req, res) => {
	db.query('SELECT * FROM tbl_payment', (err, results) => {
		if(err) console.log(err)

		if(results.length> 0){
			for(let f = 0; f<results.length; f++){
				results[f].datDatePaid = moment(results[f].datDatePaid).format('MMMM DD YYYY')
			}
		}

		return res.render('admin/views/payment', {url: req.url, payments: results, session: req.session})
	})
})
router.get('/issue', middleware.hasAdmin, (req, res) => {
	const query = `SELECT *,tbl_issue_report.intId AS issueId FROM tbl_issue_report JOIN tbl_contract ON tbl_contract.intId = intContractId
	JOIN tbl_lessee ON strLesseeId = strId WHERE booStatus = 0`
	db.query(query, (err, results) => {
		if(err) console.log(err)

		return res.render('admin/views/issue', {url: req.url, issues: results, session: req.session});
	})
})
router.get('/utilities', middleware.hasAdmin, (req, res) => {
	return res.render('admin/views/utilities', {url: req.url, utilities: req.session.utilities, session: req.session})
})
router.get('/ticket', (req, res) => {
	db.query('SELECT * FROM tbl_ticket', (err, results) => {
		if(err) console.log(err)

		if(results.length > 0){
			for(let t = 0; t < results.length; t++){
				results[t].datTicketDate = moment(results[t].datTicketDate).format('YYYY-MM-DD')
			}
		}

		return res.render('admin/views/ticket', {url: req.url, session: req.session, tickets: results})
	})
})
router.get('/reports', middleware.hasAdmin, (req, res) => {
	return res.render('admin/views/reports', {url: req.url, session: req.session})
})
router.get('/queries', (req, res) => {
	return res.render('admin/views/queries', {url: req.url, session: req.session})
})
//END GET

//POST
router.post('/login', (req, res) => {
	if(req.body.user == req.session.utilities.strAdminUsername && req.body.pass == req.session.utilities.strAdminPassword){
		req.session.admin = true;
		console.log(req.session);
		return res.send({valid: true})
	}
	else{
		db.query('SELECT * FROM tbl_staff WHERE strUsername = ?', [req.body.user], (err, results) => {
			if(err) console.log(err)

			if(results.length>0){
				if(results[0].strPassword == req.body.pass && results[0].booStatus == 1){
					req.session.staff = results[0]
					return res.send({valid: true})
				}
				else{
					return res.send({valid: false})
				}
			}
			else{
				return res.send({valid: false})
			}
		})
	}
});
router.post('/addstall', (req, res) => {
	console.log(req.body)
	db.query('INSERT INTO tbl_stall VALUES(?, ?, 0)', [req.body.stallId, req.body.stallType], (err, results) => {
		if(err) console.log(err)

		return res.redirect('/admin/stall')
	})
});
router.post('/stall-id-check', (req, res) => {
	let originalStall = req.body.originalStallId;
	if(typeof req.body.originalStallId == 'undefined'){
		originalStall = '';
	} 
	console.log('sent: ', originalStall)
	db.query('SELECT * FROM tbl_stall WHERE strId = ? AND strId!= ?', [req.body.stallId, originalStall], (err, results) => {
		if(err) console.log(err)

		if(req.body.getDetails){
			return res.send(results[0]);
		}
		if(req.body.leasing){
			console.log('hi')
			if(results.length>0) return res.send('true')
			else return res.send('false')
		}
		else{
			if(results.length>0) return res.send('false')
			else return res.send('true')
		}
	})
})
router.post('/edit-stall', (req, res) => {
	console.log(req.query)
	db.query('UPDATE tbl_stall SET strId = ? , booStallType = ? WHERE strId = ? ', [req.body.stallId, req.body.stallType, req.query.stallId], (err, results) => {
		if(err) console.log(err)

		return res.redirect('/admin/stall');
	})
});
router.post('/delete-stall', (req, res) => {
	db.query('DELETE FROM tbl_stall WHERE strId = ? ', [req.body.id], (err, results) => {
		if(err) console.log(err)

		return res.send({valid:true});
	})
});
router.post('/addaccount', upload.any(), (req, res) => {
	//Functions

	function findFilename(fieldName){
		const found = req.files.find(file => {
			if(file.fieldname == fieldName) return file
		})
		return found.filename;
	}

	function generateUsername(){
		const username = `${req.body.lastName[0].toLowerCase()}${req.body.firstName.toLowerCase()}${Math.floor(Math.random() * Math.floor(10))}${Math.floor(Math.random() * Math.floor(10))}`
		return username;
	}
	
	function generatePassword(){
		const choice = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz1234567890';
		let password = '';
		for(let i=0; i<=8; i++){
			password += `${choice[Math.floor(Math.random() * Math.floor(choice.length))]}`
		}
		return password;
	}
	const queryString = `INSERT INTO tbl_lessee 
	(strId, strFirstName, strMiddleName, strLastName, strAddress, strValidId1, strValidId2, strBaranggayPermit, strEmail, strPhoneNumber, strUsername, strPassword, booLesseeType)
	VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`
	//GENERATE ID
	db.query('SELECT COUNT(strId) AS bilang FROM tbl_lessee', (err, results) => {
		if(err) console.log(err)

		let stringId = `${results[0].bilang}`
		let zeros = ''
		for(let b=stringId.length; b < 5; b++){
			zeros += '0'
		}
		const newId = `${moment().format('YYYY')}-${zeros}${eval(stringId+'+ 1')}-${req.body.accountType == 0 ? 'I': 'C'}`;
		console.log('NEW ID: ',newId);
		const newUser = generateUsername();
		const newPass = generatePassword();
		db.query(queryString, [newId, req.body.firstName, req.body.middleName, req.body.lastName, req.body.address, findFilename('validId1'), findFilename('validId2'), findFilename('baranggayPermit'), req.body.email, req.body.phoneNumber, newUser, newPass, req.body.accountType], (err, results) => {
			if(err) console.log(err)

			return res.send({user: newUser, pass: newPass, id: newId});
		})
	})
})
router.post('/add-company', (req, res) => {
	console.log(req.body)
	const queryString = `INSERT INTO tbl_company_lessee VALUES(?, ?, ?, ?)`;
	db.query(queryString, [req.body.id, req.body.companyName, req.body.companyAddress, req.body.repPosition], (err, results) => {
		if(err) console.log(err)

		return res.send({valid:true});
	})
});
router.post('/lessee-user-check', (req, res) => {
	db.query('SELECT * FROM tbl_lessee WHERE strUsername = ?', [req.body.lesseeUsername], (err, results) => {
		if(err) console.log(err)

		if(req.body.getDetails){
			console.log(results[0]);
			return res.send(results[0])
		}

		if(req.body.leasing){
			if(results.length>0) return res.send('true');
			else return res.send('false')
		}
	})
});
router.post('/delete-lessee', (req, res) => {
	console.log(req.body)
	db.query('UPDATE tbl_lessee SET booIsDeleted = 1 WHERE strId = ?',[req.body.id], (err, results) => {
		if(err) console.log(err)

		return res.send(true);
	});
})
router.post('/add-contract', (req, res) => {
	function generateReferenceNumber(){
		const choice = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz1234567890';
		let refCode = '';
		for(let i=0; i<=15; i++){
			refCode += `${choice[Math.floor(Math.random() * Math.floor(choice.length))]}`
		}
		return refCode;
	}
	const refCode = generateReferenceNumber();
	console.log("ADD CONTRACT ROUTE",req.body)
	const queryString = `INSERT INTO tbl_contract 
	(strLesseeId, strStallId, strContractStallDescription, intContractMonth, intContractDay, intContractYear, intContractDuration, dblRentPrice)
	VALUES (?, ?, ?, ?, ?, ?, ?, ?)`;
	const datePaid = `${req.body.dateNow.year}-${req.body.dateNow.month}-${req.body.dateNow.day}`
	const amountPaid = req.body.stallData.booStallType == 0? `${req.session.utilities.dblFoodStallPrice*2}`: `${req.session.utilities.dblDryGoodsStallPrice*2}`
	const rentPrice = req.body.stallData.booStallType == 0? `${req.session.utilities.dblFoodStallPrice}`: `${req.session.utilities.dblDryGoodsStallPrice}`
	db.query(queryString, [req.body.lesseeData.strId, req.body.stallData.strId, req.body.stallDescription, req.body.dateNow.month, req.body.dateNow.day, req.body.dateNow.year, 6, rentPrice], (err, results) => {
		if(err) console.log(err)

		const contractIdNow = results.insertId

		db.query('UPDATE tbl_stall SET booIsAvailable = 1 WHERE strId =?', req.body.stallData.strId, (err, results) => {
			if(err) console.log(err)

			db.query('INSERT INTO tbl_payment VALUES(?, ?, ?)',[refCode, datePaid, amountPaid], (err, results) =>{
				if(err) console.log(err)
				db.query('INSERT INTO tbl_rental_bill (intContractId, datDueDate, dblAmountDue, strPaymentReferenceNo) VALUES(?, ?, ?, ?)', [contractIdNow, datePaid, amountPaid, refCode], (err, resultsBill) =>{
					if(err) console.log(err)
					db.query('INSERT INTO tbl_payment_child(strPaymentReferenceNo, intBillId, strBillType) VALUES(?, ?, ?)', [refCode, resultsBill.insertId, 'R'], (err, results) => {
						if(err) console.log(err)

						return res.send(true);
					})
				})
			})

		})

	})
})
router.post('/add-staff', (req, res) => {
	const queryString = `INSERT INTO tbl_staff (strFirstName, strMiddleName, strLastName, strEmail, strPhone, strUsername, strPassword)
	VALUES (?, ?, ?, ?, ?, ?, ?)`
	db.query(queryString, [req.body.firstName, req.body.middleName, req.body.lastName, req.body.email, req.body.phoneNumber, req.body.username, req.body.password], (err, results) => {
		if(err) console.log(err)

		return res.redirect('/admin/staff');
	})
})
router.post('/validate-duedate', (req, res) => {
	if(req.body.type == 'electric'){
		db.query('SELECT * FROM tbl_electric_main_bill WHERE intDueMonth = ? AND intDueYear = ?', [req.body.month, req.body.year], (err, results) => {
			if(err) console.log(err)

			if(results.length>0) return res.send({valid: false});
			else return res.send({valid: true});
		})
	}
	else if(req.body.type == 'water'){
		db.query('SELECT * FROM tbl_water_main_bill WHERE intDueMonth = ? AND intDueYear = ?', [req.body.month, req.body.year], (err, results) => {
			if(err) console.log(err)

			if(results.length>0) return res.send({valid: false});
			else return res.send({valid: true});
		})
	}
})
router.post('/add-electric', (req, res) => {
	const queryString = `INSERT INTO tbl_electric_main_bill (dblTotalAmountDue, intTotalKwhUsage, intDueMonth, intDueDay, intDueYear)
	VALUES (?, ?, ?, ?, ?)`;
	const dueDate = {
		month: moment(req.body.dueDate).format('MM'),
		day: parseInt(moment(req.body.dueDate).format('DD')),
		year: moment(req.body.dueDate).format('YYYY'),
	}
	db.query(queryString, [req.body.totalAmountDue, req.body.totalKwHUsage, dueDate.month, dueDate.day, dueDate.year], (err, results) =>{
		if(err) console.log(err)

		return res.send(true);
	})
})
router.post('/add-water', (req, res) => {
	const queryString = `INSERT INTO tbl_water_main_bill (dblTotalAmountDue, intTotalCubicMeterUsage, intDueMonth, intDueDay, intDueYear)
	VALUES (?, ?, ?, ?, ?)`;
	const dueDate = {
		month: moment(req.body.dueDate).format('MM'),
		day: parseInt(moment(req.body.dueDate).format('DD')),
		year: moment(req.body.dueDate).format('YYYY'),
	}
	db.query(queryString, [req.body.totalAmountDue, req.body.totalCubicMeterUsage, dueDate.month, dueDate.day, dueDate.year], (err, results) =>{
		if(err) console.log(err)

		return res.send(true);
	})
})
router.post('/get-readings', (req, res) => {
	let finalResults = [];
	if(req.body.type == 'electric'){
		var queryString = `SELECT * FROM tbl_electric_lessee_bill WHERE intContractId = ? ORDER BY intMeterReading DESC LIMIT 1`
	}
	else if(req.body.type == 'water'){
		var queryString = `SELECT * FROM tbl_water_lessee_bill WHERE intContractId = ? ORDER BY intMeterReading DESC LIMIT 1`
	}
	db.query('SELECT * FROM tbl_contract WHERE booContractStatus = 0', (err, results) => {
		if(err) console.log(err)

		for(let i = 0; i < results.length; i++){
			const stallObject = results[i];
			db.query(queryString, stallObject.intId, (err, results2) => {
				if(err) console.log(err)

				if(results2.length > 0){
					stallObject.intMeterReading = results2[0].intMeterReading
				}
				else{
					stallObject.intMeterReading = 0
				}
				console.log(stallObject)
				finalResults.push(stallObject)
				if(i == results.length - 1){
					console.log(i)
					return res.send(finalResults)
				}
			})
		}
	})
})
router.post('/encode-electric-bill', (req, res) => {
	const queryString = `INSERT INTO tbl_electric_lessee_bill 
	(intElectricMainBillId, intContractId, intMeterReading, intTotalKwhUsage, dblAmountDue, dblAdminFee, datDueDate)
	VALUES (?, ?, ?, ?, ?, ?, ?)`
	
	for(let e=0; e<req.body.lesseeBills.length; e++){
		const billNow = req.body.lesseeBills[e];
		const cutOffDate = `${moment(billNow.dueDate).format('YYYY-MM')}-${req.session.utilities.intUtilitiesCutOffDay}`
		db.query(queryString, [billNow.mainBillId, billNow.contractId, billNow.currentMeterReading, billNow.totalUsage, billNow.amountDue, billNow.adminFee, cutOffDate], (err, results) => {
			if(err) console.log(err)
		})
		if(e == req.body.lesseeBills.length - 1){
			db.query('UPDATE tbl_electric_main_bill SET booStatus = 1 WHERE intId = ?', req.body.lesseeBills[0].mainBillId, (err, results) => {
				if(err) console.log(err)

				return res.send(true)
			})
		}
	}
})
router.post('/encode-water-bill', (req, res) => {
	const queryString = `INSERT INTO tbl_water_lessee_bill 
	(intWaterMainBillId, intContractId, intMeterReading, intTotalCubicMeterUsage, dblAmountDue, dblAdminFee, datDueDate)
	VALUES (?, ?, ?, ?, ?, ?, ?)`

	for(let e=0; e<req.body.lesseeBills.length; e++){
		const billNow = req.body.lesseeBills[e];
		const cutOffDate = `${moment(billNow.dueDate).format('YYYY-MM')}-${req.session.utilities.intUtilitiesCutOffDay}`
		db.query(queryString, [billNow.mainBillId, billNow.contractId, billNow.currentMeterReading, billNow.totalUsage, billNow.amountDue, billNow.adminFee, cutOffDate], (err, results) => {
			if(err) console.log(err)
		})
		if(e == req.body.lesseeBills.length - 1){
			db.query('UPDATE tbl_water_main_bill SET booStatus = 1 WHERE intId = ?', req.body.lesseeBills[0].mainBillId, (err, results) => {
				if(err) console.log(err)

				return res.send(true)
			})
		}
	}
})
router.post('/get-encoded', (req, res) => {
	if(req.body.type == 'electric'){
		var query = `SELECT *,tbl_electric_lessee_bill.intId AS lesseeBillId FROM tbl_electric_lessee_bill 
		JOIN tbl_contract ON intContractId = tbl_contract.intId
		JOIN tbl_lessee ON strLesseeId = strId
		WHERE intElectricMainBillId = ?`
	}
	else if(req.body.type == 'water'){
		var query = `SELECT *,tbl_water_lessee_bill.intId AS lesseeBillId FROM tbl_water_lessee_bill 
		JOIN tbl_contract ON intContractId = tbl_contract.intId
		JOIN tbl_lessee ON strLesseeId = strId
		WHERE intWaterMainBillId = ?`
	}
	db.query(query, req.body.id, (err, results) => {
		if(err) console.log(err)
		return res.send(results)
	})
})
router.post('/validate-bill', (req, res) => {
	if(req.body.type == 'electric'){
		var query = `UPDATE tbl_electric_main_bill SET booStatus = 2 WHERE intId = ?`
	}
	else if(req.body.type == 'water'){
		var query = `UPDATE tbl_water_main_bill SET booStatus = 2 WHERE intId = ?`
	}
	db.query(query, req.body.id, (err, results) => {
		if(err) console.log(err)
		return res.send(true)
	})
})
router.post('/get-bill-amount', (req, res) => {

	if(req.body.bill == 'E'){
		var query = `SELECT * FROM tbl_electric_lessee_bill WHERE intId = ?`
		var notFoundMessage = `Electric Bill with Ref. Code(${req.body.billCode}) doesn't exist on our database`
	}
	else if(req.body.bill == 'W'){
		var query = `SELECT * FROM tbl_water_lessee_bill WHERE intId = ?`
		var notFoundMessage = `Water Bill with Ref. Code(${req.body.billCode}) doesn't exist on our database`
	}
	else if(req.body.bill == 'R'){
		var query = `SELECT * FROM tbl_rental_bill WHERE intId = ?`
		var notFoundMessage = `Rental Bill with Ref. Code(${req.body.billCode}) doesn't exist on our database`
	}
	db.query(query, req.body.billCode, (err, results) => {
		if(err) console.log(err)
		
		if(results.length > 0){
			if(results[0].strPaymentReferenceNo != null){
				return res.send({valid: false, message: `This bill is already paid`})
			}
			return res.send({valid:true, amountDue: results[0].dblAmountDue})
		}
		else{
			return res.send({valid: false, message: notFoundMessage})
		}
	})
})
router.post('/add-payment', (req, res) => {
	function generateReferenceNumber(){
		const choice = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz1234567890';
		let refCode = '';
		for(let i=0; i<=15; i++){
			refCode += `${choice[Math.floor(Math.random() * Math.floor(choice.length))]}`
		}
		return refCode;
	}
	const refCode = generateReferenceNumber();
	db.query('INSERT INTO tbl_payment VALUES(?, ?, ?)', [refCode, moment().format('YYYY-MM-DD'), req.body.amountPaid], (err, results) => {
		if(err) console.log(err)

		for(let e = 0; e < req.body.data.length; e++){
			db.query('INSERT INTO tbl_payment_child (strPaymentReferenceNo, intBillId, strBillType) VALUES(?, ?, ?)', [refCode, req.body.data[e].billCode, req.body.data[e].billType], (err, results) => {
				if(err) console.log(err)

				let query = ``;
				if(req.body.data[e].billType == 'E'){
					query = `UPDATE tbl_electric_lessee_bill SET strPaymentReferenceNo = ? WHERE intId = ?`
				}
				else if(req.body.data[e].billType == 'W'){
					query = `UPDATE tbl_water_lessee_bill SET strPaymentReferenceNo = ? WHERE intId = ?`
				}
				else if(req.body.data[e].billType == 'R'){
					query = `UPDATE tbl_rental_bill SET strPaymentReferenceNo = ? WHERE intId = ?`
				}
				db.query(query, [refCode, req.body.data[e].billCode], (err, results) => {
					if(err) console.log(err)
				})
			})
			if(e == req.body.data.length - 1){
				return res.send(true)
			}
		}
	})
})
router.post('/generate-rental-bills', (req, res) => {
	const yearNow = moment().format('YYYY')
	const monthNow = moment().format('MM')
	db.query('SELECT * FROM tbl_contract  JOIN tbl_stall ON strId = strStallId WHERE booContractStatus = 0', (err, results) => {
		if(err) console.log(err)

		if(results.length == 0){
			return res.send(false)
		}
		for(let h = 0; h < results.length; h++){
			const price = results[h].dblRentPrice
			const newDueDate = moment(`${yearNow}-${monthNow}-${results[h].intContractDay}`).format('YYYY-MM-DD')
			const doneDate = moment(`${results[h].intContractYear}-${results[h].intContractMonth}-${results[h].intContractDay}`).add(results[h].intContractDuration, 'months').add(7, 'days').format('YYYY-MM-DD')
			if(moment(moment().format('YYYY-MM-DD')).isSameOrAfter(doneDate)){
				changeContractStatus(results[h].intId, 1).then(() => {
					console.log('Contract Done')
					return res.send(true)
				})
			}
			else if(moment(moment().format('YYYY-MM-DD')).isSameOrAfter(moment(newDueDate).subtract(10, 'days').format('YYYY-MM-DD'))){
				console.log(moment().format('YYYY-MM-DD')+' is same of after '+moment(newDueDate).subtract(10, 'days').format('YYYY-MM-DD'))
				db.query('SELECT * FROM tbl_rental_bill WHERE intContractId = ? AND datDueDate = ?', [results[h].intId, newDueDate], (err, resultsBill) => {
					if(err) console.log(err)

					if(resultsBill.length == 0){
						db.query('INSERT INTO tbl_rental_bill (intContractId, datDueDate, dblAmountDue) VALUES (?, ?, ?)',[results[h].intId, newDueDate, price], (err, resultsInsert) => {
							if(err) console.log(err)

							console.log(`\n\nCREATED A BILL for Contract No. ${results[h].intId} with Due date ${newDueDate}\n\n`)
						})
					}
				})
			}
			if(h == results.length - 1){
				return res.send(true);
			}
		}
	})
})
router.post('/editaccount', upload.any(), (req, res) =>{
	let query1 = `UPDATE tbl_lessee SET strAddress = ?, strPhoneNumber = ?, strEmail = ? WHERE strId = ?`
	let query2 = `UPDATE tbl_lessee SET strBaranggayPermit = ? WHERE strId = ?`

	db.query(query1,[req.body.editAddress, req.body.editPhoneNumber, req.body.editEmail, req.body.editLesseeId], (err, results) =>{
		if(err) console.log(err)

		if(req.files.length > 0){
			db.query(query2, [req.files[0].filename, req.body.editLesseeId], (err, results) => {
				if(err) console.log(err)

				fs.unlink(`public/uploads/${req.body.editBaranggayPermitOld}`, err => {
					if(err) console.log(err)
					console.log('file deleted')
				})
				return res.redirect('/admin/lessee')
			})
		}
		else{
			return res.redirect('/admin/lessee')
		}
	})
})
router.post('/get-payment-child', (req, res) => {
	db.query('SELECT * FROM tbl_payment_child WHERE strPaymentReferenceNo = ?', req.body.paymentRef, (err, results) => {
		if(err) console.log(err)

		return res.send({payments: results})
	})
})
router.post('/get-leasing', (req, res) => {
	let query = `SELECT * FROM tbl_contract
	JOIN tbl_lessee ON strLesseeId = tbl_lessee.strId
	JOIN tbl_stall ON strStallId = tbl_stall.strId
	WHERE intId = ?`
	db.query(query, req.body.id, (err, results) => {
		if(err) console.log(err)

		return res.send({contract: results[0]})
	})
})
router.post('/create-ticket', (req, res) => {
	const query = `INSERT INTO tbl_ticket (intIssueId, strAssigneeUsername, datTicketDate) VALUES (?, ?, ?);
	UPDATE tbl_issue_report SET booStatus = 1 WHERE intId = ?`

	db.query(query, [req.body.issue, req.body.assignee, moment().format('YYYY-MM-DD'), req.body.issue], (err, results) => {
		if(err) console.log(err)

		return res.send(true)
	})
})
router.post('/utilities', (req, res) => {
	function convertToUpperCase(word){
		const splittedWords = word.split(' ');
		let finalWord = '';
		for(let r = 0; r < splittedWords.length; r++){
			splittedWords[r] = `${splittedWords[r].charAt(0).toUpperCase()}${splittedWords[r].slice(1)}`
			finalWord+= ` ${splittedWords[r]}`
			if(r == splittedWords.length - 1){
				return finalWord.slice(1)
			}
		}
	}
	const query = `UPDATE tbl_utilities SET 
	dblFoodStallPrice = ?, dblDryGoodsStallPrice = ?, strAdminUsername = ?, strAdminPassword = ?, strFoodStallPrice = ?, strDryGoodsStallPrice = ?, intUtilitiesCutOffDay = ?, intAdminFeePercentage = ?
	WHERE intUtilitiesId = 1`
	const wordValues = {
		foodStall: {
			regular: convertToUpperCase(numberToWords.toWords(req.body.foodStall)),
			double: convertToUpperCase(numberToWords.toWords(eval(`${req.body.foodStall}*2`)))
		},
		dryGoodsStall: {
			regular: convertToUpperCase(numberToWords.toWords(req.body.dryGoodsStall)),
			double: convertToUpperCase(numberToWords.toWords(eval(`${req.body.dryGoodsStall}*2`)))
		}
	}
	const values = [req.body.foodStall, req.body.dryGoodsStall, req.body.adminUser, req.body.adminPass, JSON.stringify(wordValues.foodStall), JSON.stringify(wordValues.dryGoodsStall), req.body.cutOff, eval(`${req.body.adminFee}/100`)]
	db.query(query, values, (err, results) => {
		if(err) console.log(err)

		req.session.utilities.dblFoodStallPrice = values[0]
		req.session.utilities.dblDryGoodsStallPrice = values[1]
		req.session.utilities.strAdminUsername = values[2]
		req.session.utilities.strAdminPassword = values[3]
		req.session.utilities.strFoodStallPrice = values[4]
		req.session.utilities.strDryGoodsStallPrice = values[5]
		req.session.utilities.intUtilitiesCutOffDay = values[6]
		req.session.utilities.intAdminFeePercentage = values[7]
		return res.redirect('/admin/utilities')
	})
})
router.post('/terminate-contract', (req, res) => {
	changeContractStatus(req.body.contractId, 2).then(() => {
		return res.send(true)
	})
})
router.post('/get-staffs', (req, res) => {
	db.query('SELECT * FROM tbl_staff WHERE booStatus = 1', (err, results) => {
		if(err) console.log(err)

		return res.send(results)
	})
})
router.post('/check-bills-to-encode', (req, res) => {
	let unencodedBills = []
	function getUnencodedBills(type){
		return new Promise(function(resolve, reject){
			if(type == 'E'){
				db.query('SELECT * FROM tbl_electric_main_bill', (err, results) => {
					if(err) console.log(err)

					if(results.length > 0){
						for(let r = 0; r < results.length; r++){
							db.query('SELECT * FROM tbl_electric_lessee_bill WHERE intElectricMainBillId = ?', results[r].intId, (err, eBills) => {
								if(err) console.log(err)

								if(eBills.length == 0){
									unencodedBills.push({
										type: 'Electric',
										billDate: moment(`${results[r].intDueYear}-${results[r].intDueMonth}-${results[r].intDueDay}`).format('MMMM YYYY')
									})
								}
								if(r == results.length - 1){
									return resolve()
								}
							})
						}
					}
					else{
						return resolve()
					}
				})
			}
			else if(type == 'W'){
				db.query('SELECT * FROM tbl_water_main_bill', (err, results) => {
					if(err) console.log(err)

					if(results.length > 0){
						for(let r = 0; r < results.length; r++){
							db.query('SELECT * FROM tbl_water_lessee_bill WHERE intWaterMainBillId = ?', results[r].intId, (err, wBills) => {
								if(err) console.log(err)

								if(wBills.length == 0){
									unencodedBills.push({
										type: 'Water',
										billDate: moment(`${results[r].intDueYear}-${results[r].intDueMonth}-${results[r].intDueDay}`).format('MMMM YYYY')
									})
								}
								if(r == results.length - 1){
									return resolve()
								}
							})
						}
					}
					else{
						return resolve()
					}
				})
			}
		})
	}
	getUnencodedBills('E').then(() => {
		getUnencodedBills('W').then(() => {
			return res.send(unencodedBills)
		})
	})
})
router.post('/update-ticket-status', (req, res) => {
	db.query('UPDATE tbl_ticket SET booStatus = ? WHERE intId = ?', [req.body.status, req.body.ticketId], (err, results) => {
		if(err) console.log(err)

		return res.send(true)
	})
})
router.post('/get-staff-details', (req, res) => {
	db.query('SELECT * FROM tbl_staff WHERE intId = ?', req.body.staffId, (err, results) => {
		if(err) console.log(err)

		return res.send(results[0])
	})
})
router.post('/edit-staff', (req, res) => {
	const query = `UPDATE tbl_staff 
	SET strFirstName = ?, strMiddleName = ?, strLastName = ?, strEmail = ?, strPhone = ?, strUsername = ?, strPassword = ?
	WHERE intId = ?`
	const values = [req.body.firstName, req.body.middleName, req.body.lastName, req.body.email, req.body.phoneNumber, req.body.username, req.body.password, req.body.staffId]
	db.query(query, values, (err, results) => {
		if(err) console.log(err)

		return res.redirect('/admin/staff')
	})
})
router.post('/delete-staff', (req, res) => {
	db.query('UPDATE tbl_staff SET booStatus = 0 WHERE intId = ?', req.body.staffId, (err, results) => {
		if(err) console.log(err)

		return res.send(true)
	})
})
router.post('/get-due-payments', (req, res) => {
	let array = []
	const electricQuery = `SELECT * FROM tbl_electric_lessee_bill
	JOIN tbl_contract ON tbl_contract.intId = intContractId WHERE MONTH(datDueDate) = ${moment().format('MM')}`
	const waterQuery = `SELECT * FROM tbl_water_lessee_bill
	JOIN tbl_contract ON tbl_contract.intId = intContractId WHERE MONTH(datDueDate) = ${moment().format('MM')}`
	const rentalQuery = `SELECT * FROM tbl_rental_bill
	JOIN tbl_contract ON tbl_contract.intId = intContractId WHERE MONTH(datDueDate) = ${moment().format('MM')}`
	db.query(electricQuery, (err, results) => {
		if(err) console.log(err)

		if(results.length == 0){
			db.query(waterQuery, (err, results) => {
				if(err) console.log(err)

				if(results.length == 0){
					db.query(rentalQuery, (err, results) => {
						if(err) console.log(err)

						if(results.length == 0) return res.send(array)
						for(let t = 0; t < results.length; t++){
							array.push(results[t])
							if(t == results.length - 1){
								return res.send(array)
							}
						}
					})
				}
				for(let t = 0; t < results.length; t++){
					array.push(results[t])
					if(t == results.length - 1){
						db.query(rentalQuery, (err, results) => {
							if(err) console.log(err)

							if(results.length == 0) return res.send(array)
							for(let t = 0; t < results.length; t++){
								array.push(results[t])
								if(t == results.length - 1){
									return res.send(array)
								}
							}
						})
					}
				}
			})
		}
		for(let t = 0; t < results.length; t++){
			array.push(results[t])

			if(t == results.length - 1){
				db.query(waterQuery, (err, results) => {
					if(err) console.log(err)

					if(results.length == 0){
						db.query(rentalQuery, (err, results) => {
							if(err) console.log(err)

							if(results.length == 0) return res.send(array)
							for(let t = 0; t < results.length; t++){
								array.push(results[t])
								if(t == results.length - 1){
									return res.send(array)
								}
							}
						})
					}
					for(let t = 0; t < results.length; t++){
						array.push(results[t])
						if(t == results.length - 1){
							db.query(rentalQuery, (err, results) => {
								if(err) console.log(err)

								if(results.length == 0) return res.send(array)
								for(let t = 0; t < results.length; t++){
									array.push(results[t])
									if(t == results.length - 1){
										return res.send(array)
									}
								}
							})
						}
					}
				})
			}
		}
	})
})
router.post('/get-expiring-contracts', (req, res) => {
	const query = `SELECT * FROM tbl_contract
	JOIN tbl_lessee ON strId = strLesseeId
	WHERE booContractStatus = 0`
	db.query(query, (err, results) => {
		if(err) console.log(err)

		let array = []
		for(let v = 0; v < results.length; v++){
			const endDate = moment(`${results[v].intContractYear}-${results[v].intContractMonth}-${results[v].intContractDay}`).add(results[v].intContractDuration, 'months').format('YYYY-MM')
			if(moment(endDate).isSame(moment().add(1, 'months').format('YYYY-MM'))){
				array.push(results[v])
			}
			if(v == results.length - 1){
				return res.send(array)
			}
		}
	})
})
router.post('/reports/revenue', (req, res) => {
	function filterHeadExist(array, filterHead){
		return new Promise(function(resolve, reject){
			let valid = false;
			array.forEach(element => {
				if(element.filterHead == filterHead){
					valid = true
				}
			})
			resolve(valid)
		})
	}
	function getRevenue(){
		return new Promise(function(resolve, reject){
			let finalRevenue = []
			let electricQuery = ''
			let waterQuery = ''
			let rentalQuery = ''
			let format = ''
			if(req.body.filter == 'monthly'){
				format = 'MMMM'
				electricQuery = `SELECT SUM(dblAdminFee) AS adminFeeRev, datDueDate FROM tbl_electric_lessee_bill 
				WHERE strPaymentReferenceNo IS NOT NULL 
				GROUP BY MONTH(datDueDate)
				ORDER BY datDueDate DESC
				LIMIT ${req.body.rows}`

				waterQuery = `SELECT SUM(dblAdminFee) AS adminFeeRev, datDueDate FROM tbl_water_lessee_bill 
				WHERE strPaymentReferenceNo IS NOT NULL 
				GROUP BY MONTH(datDueDate)
				ORDER BY datDueDate DESC
				LIMIT ${req.body.rows}`

				rentalQuery = `SELECT SUM(dblAmountDue) AS rentalFee, datDueDate FROM tbl_rental_bill 
				WHERE strPaymentReferenceNo IS NOT NULL 
				GROUP BY MONTH(datDueDate)
				ORDER BY datDueDate DESC
				LIMIT ${req.body.rows}`
			}
			else{
				format = 'YYYY'
				electricQuery = `SELECT SUM(dblAdminFee) AS adminFeeRev, datDueDate FROM tbl_electric_lessee_bill 
				WHERE strPaymentReferenceNo IS NOT NULL 
				GROUP BY YEAR(datDueDate)
				ORDER BY datDueDate DESC
				LIMIT ${req.body.rows}`

				waterQuery = `SELECT SUM(dblAdminFee) AS adminFeeRev, datDueDate FROM tbl_water_lessee_bill 
				WHERE strPaymentReferenceNo IS NOT NULL 
				GROUP BY YEAR(datDueDate)
				ORDER BY datDueDate DESC
				LIMIT ${req.body.rows}`

				rentalQuery = `SELECT SUM(dblAmountDue) AS rentalFee, datDueDate FROM tbl_rental_bill 
				WHERE strPaymentReferenceNo IS NOT NULL 
				GROUP BY YEAR(datDueDate)
				ORDER BY datDueDate DESC
				LIMIT ${req.body.rows}`
			}
			db.query(electricQuery, (err, results) => {
				if(err) console.log(err)

				console.log(results)
				for(let w = 0; w < results.length; w++){
					if(finalRevenue.length == 0){
						console.log('electricPush')
						finalRevenue.push({
							filterHead: moment(results[w].datDueDate).format(format),
							revenue: results[w].adminFeeRev
						})
					}
					else{
						for(let z = 0; z < finalRevenue.length; z++){
							if(finalRevenue[z].filterHead == moment(results[w].datDueDate).format(format)){
								finalRevenue[z].revenue = eval(`${finalRevenue[z].revenue}+${results[w].adminFeeRev}`)
							}
							else{
								filterHeadExist(finalRevenue, moment(results[w].datDueDate).format(format)).then(exists => {
									if(!exists){
										finalRevenue.push({
											filterHead: moment(results[w].datDueDate).format(format),
											revenue: results[w].adminFeeRev
										})
									}
								})
							}
						}
					}
					if(w == results.length - 1){
						db.query(waterQuery, (err, results) => {
							if(err) console.log(err)

							console.log(finalRevenue, 'finalRev')
							for(let x = 0; x < results.length; x++){
								if(finalRevenue.length == 0){
									finalRevenue.push({
										filterHead: moment(results[x].datDueDate).format(format),
										revenue: results[x].adminFeeRev
									})
								}
								else{
									for(let z = 0; z < finalRevenue.length; z++){
										if(finalRevenue[z].filterHead == moment(results[x].datDueDate).format(format)){
											finalRevenue[z].revenue = eval(`${finalRevenue[z].revenue}+${results[x].adminFeeRev}`)
										}
										else{
											filterHeadExist(finalRevenue, moment(results[x].datDueDate).format(format)).then(exists => {
												if(!exists){
													finalRevenue.push({
														filterHead: moment(results[x].datDueDate).format(format),
														revenue: results[x].adminFeeRev
													})
												}
											})
										}
									}
								}
								if(x == results.length - 1){
									db.query(rentalQuery, (err, results) => {
										if(err) console.log(err)
				
										console.log(results)
										for(let y = 0; y < results.length; y++){
											if(finalRevenue.length == 0){
												console.log('rentalPush')
												finalRevenue.push({
													filterHead: moment(results[y].datDueDate).format(format),
													revenue: results[y].rentalFee
												})
											}
											else{
												for(let z = 0; z < finalRevenue.length; z++){
													if(finalRevenue[z].filterHead == moment(results[y].datDueDate).format(format)){
														finalRevenue[z].revenue = eval(`${finalRevenue[z].revenue}+${results[y].rentalFee}`)
													}
													else{
														filterHeadExist(finalRevenue, moment(results[y].datDueDate).format(format)).then(exists => {
															if(!exists){
																finalRevenue.push({
																	filterHead: moment(results[y].datDueDate).format(format),
																	revenue: results[y].adminFeeRev
																})
															}
														})
													}
												}
											}
										}
										resolve(finalRevenue)
									})
								}
							}
						})
					}
				}
			})
		})
	}
	getRevenue().then(revenue => {
		return res.send(revenue)
	})
})
router.post('/queries/lessee', (req, res) => {
	db.query('SELECT * FROM tbl_lessee', (err, results) => {
		if(err) console.log(err)

		return res.send(results)
	})
})
router.post('/queries/contract', (req, res) => {
	db.query('SELECT * FROM tbl_contract', (err, results) => {
		if(err) console.log(err)

		return res.send(results)
	})
})
router.post('/queries/stall', (req, res) => {
	db.query('SELECT * FROM tbl_stall', (err, results) => {
		if(err) console.log(err)

		return res.send(results)
	})
})
router.post('/queries/staff', (req, res) => {
	db.query('SELECT * FROM tbl_staff', (err, results) => {
		if(err) console.log(err)

		return res.send(results)
	})
})
//END POST

exports.admin = router;