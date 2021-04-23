var express = require('express');
var router = express.Router();

var Account = require('./Account');
var File = require('./File');
var Travel = require('./Travel');  // 引入 travel.js

router.use('/api', Account)
router.use('/api', File)
router.use('/api', Travel)                        // 新增 router 路徑

module.exports = router;