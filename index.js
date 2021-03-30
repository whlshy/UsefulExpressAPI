const express = require('express')
const app = express()
const bodyParser = require('body-parser');
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

const { mode, host, port } = require('./config');

let cors = require('cors')

if (mode == "http") {
    app.use(cors())
}
else if (mode == "https") {

    var whitelist = [
        `https://${host}`,
    ];
    var corsOptions = {
        origin: function (origin, callback) {
            var originIsWhitelisted = whitelist.indexOf(origin) !== -1;
            callback(null, originIsWhitelisted);
        },
        methods: 'GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS',
        credentials: true
    };
    app.use(cors(corsOptions));
}

// session setting
var session = require('express-session');
app.use(session({
    secret: 'secret', // 對session id 相關的cookie 進行簽名
    resave: true,
    saveUninitialized: false, // 是否儲存未初始化的會話
    cookie: {
        httpOnly: false,
        secure: false,
        maxAge: 1000 * 60 * 60 * 24, // 設定 session 的有效時間，單位毫秒 (1000 * 60 = 1分鐘)
        sameSite: "lax"
    },
}));

var Account = require('./src/controllers/account');
var File = require('./src/controllers/file');
var Travel = require('./src/controllers/travel');  // 引入 travel.js

app.use('/api', Account)
app.use('/api', File)
app.use('/api', Travel)                        // 新增 router 路徑

const swaggerUi = require('swagger-ui-express');
const swaggerFile = require('./src/swagger/swagger-output.json') // swagger autogen 輸出的 JSON
app.use('/api-doc', swaggerUi.serve, swaggerUi.setup(swaggerFile))

// 取得app頁面
app.get("/", (req, res) => {
    res.sendFile(__dirname + '/public/app/index.html');
});

// 設定public的檔案路徑
app.use(express.static(__dirname + '/public/app'));
app.use('/filestorage', express.static(__dirname + '/public/filestorage'));

// 取得app頁面(對於任何的url)
app.get("*", (req, res) => {
    res.sendFile(__dirname + '/public/app/index.html');
});

// catch 404 and forward to error handler
app.use(function (req, res, next) {
    var err = new Error('Not Found');
    err.status = 404;
    next(err);
});

// error handler
app.use(function (err, req, res, next) {
    // set locals, only providing error in development
    res.locals.message = err.message;
    res.locals.error = req.app.get('env') === 'development' ? err : {};

    // render the error page
    res.status(err.status || 500);
    res.render('error');
});

if (mode == "http") {
    app.listen(port, () => {
        console.log(`Example app listening at http://${host}:${port}`)
    })
}
else if (mode == "https") {
    var options = {
        pfx: fs.readFileSync('example.pfx'),
        passphrase: 'example'
    };
    https.createServer(options, app).listen(port, () => {
        console.log(`Example app listening at https://${host}:${port}`)
    });
}