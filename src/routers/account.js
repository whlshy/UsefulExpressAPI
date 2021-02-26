var express = require('express');
var router = express.Router();

/**
 * @swagger
 * /api/me:
 *   get:
 *     summary: 取得目前登入帳號詳細資訊
 *     description: Create Grid
 *     tags:
 *       - Acount
 *     produces:
 *       - application/json
 *     responses:
 *       200:
 *         description: Success
 */

router.get('/me', function (req, res, next) {
    res.json({
        "CName": "admin",
        "Role": "R"
    });
});

router.get('/hi', function (req, res, next) {
    res.json({ status: 1, message: "hi" });
});

module.exports = router;