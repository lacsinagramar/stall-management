const express = require('express');
const router = express.Router();
const db = require('../../lib/database')();
const middleware = require('../auth/middlewares/auth');
const moment = require('moment');

//GET
router.get('/', middleware.hasLessee, (req, res) => {
    function getBills(type, contractId){
        let query = ``
        if(type == 'E'){
            query = `SELECT * FROM tbl_electric_lessee_bill WHERE intContractId = ?`
        }
        else if(type == 'W'){
            query = `SELECT * FROM tbl_water_lessee_bill WHERE intContractId = ?`
        }
        else if(type == 'R'){
            query = `SELECT * FROM tbl_rental_bill WHERE intContractId = ?`
        }
        return new Promise(function (resolve, reject) {
            db.query(query, contractId, (err, results) => {
                if(err) console.log(err)

                resolve(results)
            })
        })
    }
    db.query('SELECT * FROM tbl_contract WHERE strLesseeId = ? AND booContractStatus = 0', [req.session.lessee.strId], (err, results) => {
        if(err) console.log(err)
        let finalBills = []
        if(results.length > 0){
            for(let h = 0; h < results.length; h++){
                getBills('E', results[h].intId).then(electricBills =>{
                    for(let j = 0; j<electricBills.length; j++){
                        electricBills[j].type = 'E'
                        electricBills[j].datDueDate = moment(electricBills[j].datDueDate).format('YYYY-MM-DD')
                        finalBills.push(electricBills[j])
                    }
                    getBills('W', results[h].intId).then(waterBills =>{  
                        for(let k = 0; k<waterBills.length; k++){
                            waterBills[k].type = 'W'
                            waterBills[k].datDueDate = moment(waterBills[k].datDueDate).format('YYYY-MM-DD')
                            finalBills.push(waterBills[k])
                        }
                        getBills('R', results[h].intId).then(rentalBills =>{
                            for(let l = 0; l<rentalBills.length; l++){
                                rentalBills[l].type = 'R'
                                rentalBills[l].datDueDate = moment(rentalBills[l].datDueDate).format('YYYY-MM-DD')
                                finalBills.push(rentalBills[l])
                                if(l == rentalBills.length - 1){
                                    finalBills.sort(function (current, next){
                                        if(moment(current.datDueDate).isAfter(next.datDueDate)){
                                            return -1;
                                        }
                                        if(moment(current.datDueDate).isBefore(next.datDueDate)){
                                            return 1;
                                        }
                                        if(moment(current.datDueDate).isSame(next.datDueDate)){
                                            return 0;
                                        }
                                    })
                                    return res.render('home/views/index', {bills: finalBills, session: req.session.lessee})
                                }
                            }
                        })
                    })
                })
            }
        }
    })
})
router.get('/login', (req, res) => {
    return res.render('home/views/login');
});
router.get('/logout', (req, res) => {
    delete req.session.lessee
    res.redirect('/login')
    console.log(req.session)
})
router.get('/my-issues', middleware.hasLessee, (req, res) => {
    const query = `SELECT * FROM tbl_issue_report WHERE intContractId = ?`
    const myIssues = []
    db.query('SELECT * FROM tbl_contract WHERE strLesseeId = ? AND booContractStatus = 0',[req.session.lessee.strId], (err, results) => {
        if(err) console.log(err)

        if(results.length > 0){
            for(let o = 0; o < results.length; o++){
                db.query(query, results[o].intId, (err, issues) => {
                    if(err) console.log(err)

                    console.log(issues)
            
                    if(issues.length > 0){
                        for(let p = 0; p < issues.length; p++){
                            myIssues.push(issues[p]);

                            if(p == issues.length - 1){
                                if(o == results.length - 1){
                                    return res.render('home/views/my-issues', {issues: myIssues, session: req.session.lessee})
                                }
                            }
                        }   
                    }
                    else if (o == results.length - 1){
                        return res.render('home/views/my-issues', {issues: []})
                    }
                })
            }
        }
        else return res.render('home/views/my-issues', {issues: []})

    })
})
// END GET

//POST
router.post('/login', (req, res) => {
    db.query('SELECT * FROM tbl_lessee WHERE strUsername = ? AND strPassword = ? AND booIsDeleted = 0',[req.body.user, req.body.pass], (err, results) => {
        if(err) console.log(err)

        if(results.length > 0){
            req.session.lessee = results[0]
            return res.send({valid: true})
        }
        else{
            return res.send({valid: false})
        }
    })
})
router.post('/get-user-stalls', (req, res) => {
    db.query('SELECT intId, strStallId FROM tbl_contract WHERE booContractStatus = 0 AND strLesseeId = ?', req.body.id, (err, results) => {
        if(err) console.log(err)

        return res.send(results)
    })
})
router.post('/create-issue', (req, res) => {
    const query = `INSERT INTO tbl_issue_report (intContractId, strSubject, strMessage)
    VALUES (?, ?, ?)`
    db.query(query, [req.body.contractId, req.body.subject, req.body.message], (err, results) => {
        if(err) console.log(err)

        return res.send(true)
    })
})
router.post('/view-ticket', (req, res) => {
    const query = `SELECT * FROM tbl_ticket WHERE intId = ?`
    db.query(query,req.body.issueId, (err, results) => {
        if(err) console.log(err)

        if(results.length > 0){
            return res.send(results)
        }
        else {
            return res.send([])
        }
    })
})
//END POST

exports.index = router;