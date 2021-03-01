var express = require('express');
var router = express.Router();
var runSQL = require('../lib/runSQL')
var schema = require('../schema/file.json')

router.post('/file/uploadIMG', async (req, res, next) => {
    // #swagger.tags = ['file']
    sqlcode = "select * from vd_Member where OID = @mid"
    let response = await runSQL(sqlcode, req, schema)
    res.json(response);
});

module.exports = router;