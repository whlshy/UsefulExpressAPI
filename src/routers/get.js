var express = require('express');
var router = express.Router();

router.get('/', function (req, res, next) {
  res.json({ status: 1, message: "test" });
});

router.get('/hi/:id', function (req, res, next) {
  console.log(req.params, req.query.filtro)
  res.json({ status: 1, message: "hi" });
});

module.exports = router;