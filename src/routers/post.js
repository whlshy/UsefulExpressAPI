var express = require('express');
var router = express.Router();

router.post('/', function(req, res, next) {
  res.send('respond post');
});

module.exports = router;