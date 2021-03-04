const express = require('express')
const app = express()
const port = 3000
const bodyParser = require('body-parser');
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

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
        sameSite: "none"
    },
}));

app.get('/', (req, res) => {
    res.send('Hello World!')
})

var accountRouter = require('./src/routers/account');
var fileRouter = require('./src/routers/file');
var travelRouter = require('./src/routers/travel');  // 引入 travel.js

app.use('/api', accountRouter)
app.use('/api', fileRouter)
app.use('/api', travelRouter)                        // 新增 router 路徑

const swaggerUi = require('swagger-ui-express');
const swaggerFile = require('./src/swagger/swagger-output.json') // swagger autogen 輸出的 JSON
app.use('/api-doc', swaggerUi.serve, swaggerUi.setup(swaggerFile))

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

app.listen(port, () => {
    console.log(`Example app listening at http://localhost:${port}`)
})