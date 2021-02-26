var express = require('express');
var router = express.Router();

/**
 * @swagger
 * /api:
 *   get:
 *     summary: 測試API.
 *     description: Create Grid
 *     tags:
 *       - get
 *     produces:
 *       - application/json
 *     responses:
 *       200:
 *         description: Success
 */

router.get('/', function(req, res, next) {
  res.json({status: 1, message:"test"});
});

router.get('/hi', function(req, res, next) {
  res.json({status: 1, message:"hi"});
});

module.exports = router;