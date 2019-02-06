const express = require('express');
const router = express.Router();
const db = require('../../lib/database')();
const moment = require('moment');
const multer = require('multer');
const middleware = require('../auth/middlewares/auth');

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

//GET
router.get('/',middleware.hasAdminOrStaff, (req, res) => {
	res.render('admin/views/index', {url: req.url, query: req.query});
});
router.get('/login',middleware.hasNoAdminOrStaff, (req, res) => {
	res.render('admin/views/login', {query: req.query});
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

		return res.render('admin/views/stall', {url: req.url, stalls:results})
	})
})
router.get('/lessee',middleware.hasAdmin, (req, res) => {
	db.query('SELECT * FROM tbl_lessee WHERE booIsDeleted = 0', (err, results) => {
		if(err) console.log(err)

		if(results.length==0) return res.render('admin/views/lessee', {lessees: results, url: req.url})

		for(let a = 0; a<results.length; a++){
			db.query('SELECT * FROM tbl_company_lessee WHERE strLesseeId = ?', [results[a].strId], (err, results2) =>{
				if(err) console.log(err)

				if(results2.length>0){
					results[a].companyInfo = results2;
				}
			})
			if(a == results.length - 1){
				console.log(results);
				return res.render('admin/views/lessee', {lessees: results, url: req.url})
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

			if(results.length>0) return res.render('admin/views/leasing', {contracts: contract, url: req.url, stalls: results})
			else return res.render('admin/views/leasing', {contracts: contract, url: req.url, stalls: []})
		})

	})
})
router.get('/staff', middleware.hasAdmin, (req, res) => {
	db.query('SELECT * FROM tbl_staff WHERE booStatus = 1', (err, results) => {
		if(err) console.log(err)

		if(results.length>0) return res.render('admin/views/staff', {staffs: results, url: req.url})
		else return res.render('admin/views/staff', {staffs: [], url: req.url})
	})
})
router.get('/electric-bill', middleware.hasAdmin, (req, res) => {
	db.query('SELECT * FROM tbl_electric_main_bill', (err, results) => {
		if(err) console.log(err)

		for(let i = 0; i< results.length; i++){
			results[i].billDate = moment(`${results[i].intDueMonth}-${results[i].intDueYear}`, 'MM-YYYY').format('MMMM YYYY')
		}

		return res.render('admin/views/electric-bill', {electric: results, url: req.url})
	})
})
router.get('/water-bill', middleware.hasAdmin, (req, res) => {
	db.query('SELECT * FROM tbl_water_main_bill', (err, results) => {
		if(err) console.log(err)

		for(let i = 0; i< results.length; i++){
			results[i].billDate = moment(`${results[i].intDueMonth}-${results[i].intDueYear}`, 'MM-YYYY').format('MMMM YYYY')
		}

		return res.render('admin/views/water-bill', {water: results, url: req.url})
	})
})
router.get('/electric-consumption', middleware.hasAdminOrStaff, (req, res) => {
	db.query('SELECT * FROM tbl_electric_main_bill', (err, results) => {
		if(err) console.log(err)

		for(let i = 0; i< results.length; i++){
			results[i].billDate = moment(`${results[i].intDueMonth}-${results[i].intDueYear}`, 'MM-YYYY').format('MMMM YYYY')
		}

		return res.render('admin/views/electric-consumption', {electric: results, url: req.url})
	})
})
router.get('/water-consumption', middleware.hasAdminOrStaff, (req, res) => {
	db.query('SELECT * FROM tbl_water_main_bill', (err, results) => {
		if(err) console.log(err)

		for(let i = 0; i< results.length; i++){
			results[i].billDate = moment(`${results[i].intDueMonth}-${results[i].intDueYear}`, 'MM-YYYY').format('MMMM YYYY')
		}

		return res.render('admin/views/water-consumption', {water: results, url: req.url})
	})
})
router.get('/payment', (req, res) => {
	db.query('SELECT * FROM tbl_payment', (err, results) => {
		if(err) console.log(err)

		res.render('admin/views/payment', {url: req.url})
	})
})
//END GET

//POST
router.post('/login', (req, res) => {
	if(req.body.user == 'admin' && req.body.pass == 'admin'){
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
	console.log("ADD CONTRACT ROUTE",req.body)
	const queryString = `INSERT INTO tbl_contract 
	(strLesseeId, strStallId, intContractMonth, intContractDay, intContractYear, intContractDuration)
	VALUES (?, ?, ?, ?, ?, ?)`;
	db.query(queryString, [req.body.lesseeData.strId, req.body.stallData.strId, req.body.dateNow.month, req.body.dateNow.day, req.body.dateNow.year, 6], (err, results) => {
		if(err) console.log(err)

		db.query('UPDATE tbl_stall SET booIsAvailable = 1 WHERE strId =?', req.body.stallData.strId, (err, results) => {
			if(err) console.log(err)

			return res.send(true);
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
	(intElectricMainBillId, intContractId, intMeterReading, intTotalKwhUsage, dblAmountDue, datDueDate)
	VALUES (?, ?, ?, ?, ?, ?)`

	for(let e=0; e<req.body.lesseeBills.length; e++){
		const billNow = req.body.lesseeBills[e];
		db.query(queryString, [billNow.mainBillId, billNow.contractId, billNow.currentMeterReading, billNow.totalUsage, billNow.amountDue, billNow.dueDate], (err, results) => {
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
	(intWaterMainBillId, intContractId, intMeterReading, intTotalCubicMeterUsage, dblAmountDue, datDueDate)
	VALUES (?, ?, ?, ?, ?, ?)`

	for(let e=0; e<req.body.lesseeBills.length; e++){
		const billNow = req.body.lesseeBills[e];
		db.query(queryString, [billNow.mainBillId, billNow.contractId, billNow.currentMeterReading, billNow.totalUsage, billNow.amountDue, billNow.dueDate], (err, results) => {
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
//END POST

exports.admin = router;