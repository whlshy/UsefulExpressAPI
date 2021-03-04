var express = require('express');
var router = express.Router();
var runSQL = require('../lib/runSQL')

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

module.exports = router;