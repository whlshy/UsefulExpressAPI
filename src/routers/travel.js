var express = require('express');
var router = express.Router();
var runSQL = require('../lib/runSQL')
const schema = require('../schema/travel.json')

router.get('/travel/example', async (req, res, next) => {  // method GET
    // #swagger.tags = ['travel']
    res.send('這是 Travel 測試 API！')
});

router.get('/travel/getcity', async (req, res, next) => {  // method GET
    // #swagger.tags = ['travel']
    let sqlcode = "select CID, CName, NamePath from Class where nLevel = 3" // 要執行的 SQL 語法
    let response = await runSQL(sqlcode)
    res.json(response)
});

router.get('/travel/getCCData', async (req, res, next) => {  // method GET
    // #swagger.tags = ['travel']
    let { cid } = req.query  // 為 swagger ui 宣告有一個 query 叫 cid
    let sqlcode = "select PCID 'pcid', P.CName 'cname', CCID 'ccid', C.CName 'pname', P.NamePath 'namepath' from Class P, Inheritance I, Class C where P.CID = I.PCID and I.CCID = C.CID and P.CID = @cid" // 要執行的 SQL 語法
    let response = await runSQL(sqlcode, req, schema)
    res.json(response)
});

router.post('/travel/getCOData', async (req, res, next) => {  // method POST
    // #swagger.tags = ['travel']
    let { cid } = req.body  // 為 swagger ui 宣告有一個 body 叫 cid
    let sqlcode = "select C.NamePath 'namepath', O.OID 'oid', O.Title 'title', O.Class 'district' from Class C, CO, Object O where C.CID = CO.CID and CO.OID = O.OID and C.CID = @cid" // 要執行的 SQL 語法
    let response = await runSQL(sqlcode, req, schema)
    res.json(response)
});

router.route('/book')  // restful api example
    .get(function (req, res) {
        // #swagger.tags = ['travel']
        res.send('Get a random book');
    })
    .post(function (req, res) {
        // #swagger.tags = ['travel']
        res.send('Add a book');
    })
    .put(function (req, res) {
        // #swagger.tags = ['travel']
        res.send('Update the book');
    });

module.exports = router;