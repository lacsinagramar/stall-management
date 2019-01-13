const express = require('express');
const router = express.Router();
const db = require('../../lib/database')();

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

        if(results.length>0) return res.send('false')
        else return res.send('true')
    })
})
router.post('/edit-stall', (req, res) => {
    console.log(req.query)
    db.query('UPDATE tbl_stall SET strId = ? , booStallType = ? WHERE strId = ? ', [req.body.stallId, req.body.stallType, req.query.stallId], (err, results) => {
        if(err) console.log(err)

        return res.redirect('/admin/stall');
    })
});

exports.admin = router;