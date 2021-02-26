const express = require('express')
const app = express()
const port = 3000
const readonlyconfig = require('./dbconfig.json');
let sql = require("mssql");

// mssql 連線
const pool = new sql.ConnectionPool(readonlyconfig);
const readonlyPoolPromise = pool.connect();
pool.on('error', err => {
    console.log('Database Connection Failed :', err); // ... error handler
})

var getRouter = require('./src/routers/get');
var postRouter = require('./src/routers/post');
var accountRouter = require('./src/routers/account');


app.get('/', (req, res) => {
    res.send('Hello World!')
})

app.use('/api', getRouter)
app.use('/api', postRouter)
app.use('/api', accountRouter)

var swaggerRouter = require('./src/swagger/swagger.js');
app.use('/swagger', swaggerRouter);


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