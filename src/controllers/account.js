var express = require('express');
var router = express.Router();
var runSQL = require('../lib/runSQL')
var schema = require('../schema/account.json')

router.get('/me', async (req, res, next) => {
    // #swagger.tags = ['account']
    sqlcode = "select * from vd_Member where OID = @mid";
    let response = await runSQL(sqlcode, req, schema);
    res.json(response);
});

router.get('/logout', async (req, res, next) => {
    // #swagger.tags = ['account']
    req.session.destroy(function(err) {
        // cannot access session here
        console.log(err)
     });
    req.session = null
    res.json({ status: 1, message: "logount susccess" });
});

module.exports = router;