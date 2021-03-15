var express = require('express');
var router = express.Router();
var multer = require('multer')

var runSQL = require('../lib/runSQL')
var schema = require('../schema/File.json')

const mkdirfilepath = (path) => {
    patharray = path.split('/')
    nowpath = ''
    patharray.map(m => fs.existsSync(nowpath + m + '/') ? nowpath += m + '/' : (fs.mkdirSync(nowpath + m + '/'), nowpath += m + '/'))
}

var datenow = Date.now()
var oid = ""
const storage = multer.diskStorage({
    destination: async (req, file, cb) => {
        var filename = file.fieldname + '-' + datenow + '.' + String(file.mimetype).split('/')[1]
        let sqlcode = "exec xp_insertArchive @FileName, @FileExtension, @ContentLen, @ContentType, @mid, @NewOID output, @NewUUID output"
        let allreq = {}
        allreq.query = { FileName: filename, FileExtension: `.{file.mimetype.split('/')[1]}`, ContentLen: file.size, ContentType: file.mimetype }
        let response = await runSQL(sqlcode, allreq, schema);
        console.log(response)
        let path = __dirname + '/fileStorage'
        response.NewOID.toString(16).padStart(8, '0').match(/\S\S/gi).map((m, index) => index != 3 ? path += `/${m}` : oid = m)
        mkdirfilepath(path)
        cb(null, path)
    },
    filename: function (req, file, cb) {
        console.log(String(file.mimetype).split('/')[1])
        cb(null, oid + '.' + String(file.mimetype).split('/')[1])
    }
})

router.post('/file/uploadIMG', multer({ storage: storage }).single('files'), async (req, res, next) => {
    // #swagger.tags = ['file']
    // #swagger.consumes = "multipart/form-data"
    res.json(response);
});

module.exports = router;