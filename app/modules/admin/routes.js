const express = require('express');
const router = express.Router();
const db = require('../../lib/database')();
const moment = require('moment');
const multer = require('multer');

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
router.get('/', (req, res) => {
    res.render('admin/views/index', {url: req.url});
});
router.get('/login', (req, res) => {
    res.render('admin/views/login');
});
router.get('/stall', (req, res) => {
    db.query('SELECT * FROM tbl_stall', (err, results) =>{
        if(err) console.log(err)

        return res.render('admin/views/stall', {url: req.url, stalls:results})
    })
})
router.get('/lessee', (req, res) => {
    db.query('SELECT * FROM tbl_lessee', (err, results) => {
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
router.get('/rental', (req, res) => {
    res.render('admin/views/leasing', {stalls: [], url: req.url})
})

//POST
router.post('/login', (req, res) => {
    if(req.body.user == 'admin' && req.body.pass == 'admin'){
        req.session.admin = true;
        console.log(req.session);
        return res.send({valid: true})
    }
    else{
        return res.send({valid: false})
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
    db.query('SELECT strId FROM tbl_stall WHERE strId = ? AND strId!= ?', [req.body.stallId, originalStall], (err, results) => {
        if(err) console.log(err)

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

        if(req.body.leasing){
            if(results.length>0) return res.send('true');
            else return res.send('false')
        }
    })
})
exports.admin = router;