let sql = require("mssql");
const readonlyconfig = require('../../dbconfig.json');

// mssql 連線
const pool = new sql.ConnectionPool(readonlyconfig);
const readonlyPoolPromise = pool.connect();
pool.on('error', err => {
    console.log('Database Connection Failed :', err); // ... error handler
})

const runSQL = async (sqlcode, allreq, schema) => {
    if (!allreq) {
        allreq = []
    }
    let output = []
    sqlcode.match(/@(\S*) output/gi).map(m => output.push(m.split(' ')[0].replace('@', '')))
    let input = []
    sqlcode.match(/@(\S*)\S/gi).map(m => input.push(m.replace(',', '').replace('@', '')))
    output.map(m => input = input.filter(f => f != m))
    console.log(output, input)
    if (input.filter(f => f == 'mid').length) { // 判斷是否需要取得 MID
        allreq.mid = 1
    }
    console.log(allreq)

    const pool = await readonlyPoolPromise;
    const request = pool.request();
    input.map(i => request.input(i, sql[schema.filter(f => f.attr == i)[0].type], allreq[i]))
    output.map(o => request.output(o, sql[schema.filter(f => f.attr == o)[0].type]))

    const result = await request.query(sqlcode);
    console.log(result)
}

module.exports = async (sqlcode, req, schema) => {
    console.log(req.params, req.query, req.body)
    let allreq = Object.assign(req.params, req.query, req.body)

    let output = []
    sqlcode.match(/@(\S*) output/gi)?sqlcode.match(/@(\S*) output/gi).map(m => output.push(m.split(' ')[0].replace('@', ''))):""
    let input = []
    sqlcode.match(/@(\S*)\S/gi)?sqlcode.match(/@(\S*)\S/gi).map(m => input.push(m.replace(',', '').replace('@', ''))):""
    output.map(m => input = input.filter(f => f != m))

    if (input.filter(f => f == 'mid').length) { // 判斷是否需要取得 MID
        allreq.mid = 1
    }

    const pool = await readonlyPoolPromise;
    const request = pool.request();
    input.map(i => request.input(i, sql[schema.filter(f => f.attr == i)[0].type], allreq[i]))
    output.map(o => request.output(o, sql[schema.filter(f => f.attr == o)[0].type]))

    const result = await request.query(sqlcode);
    return !result.recordset ? result.output : result.recordset;
};