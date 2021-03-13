let sql = require("mssql");
const readonlyconfig = require('../../config.json').dbconfig;

// mssql 連線
const pool = new sql.ConnectionPool(readonlyconfig);
const readonlyPoolPromise = pool.connect();
pool.on('error', err => {
    console.log('Database Connection Failed :', err); // ... error handler
})

const getMID = async (req) => {
    const { passportCode } = req.session;
    let mid = -1;
    if (passportCode) {
        sqlcode = "select Account, MID from Member where MID = (select top 1 MID from MSession where PassportCode = @passportCode and ExpiredDT > (select convert(varchar, getdate(), 126)))"
        const pool = await readonlyPoolPromise;
        const request = pool.request();
        request.input(passportCode, sql.NVarChar, passportCode)
        const result = await request.query(sqlcode);
        mid = result.recordset[0].MID
    }
    return mid // 回傳使用者MID
}

module.exports = async (sqlcode, req = {}, schema = []) => {
    let allreq = {}
    if (req.params || req.query || req.body)
        allreq = Object.assign(req.params, req.query, req.body)
    allreq = JSON.stringify(allreq).toLowerCase();
    allreq = JSON.parse(allreq);

    let output = []
    sqlcode.match(/@(\S*) output/gi) ? sqlcode.match(/@(\S*) output/gi).map(m => output.push(m.split(' ')[0].replace('@', ''))) : ""
    let input = []
    sqlcode.match(/@(\S*)\S/gi) && sqlcode.match(/@(\S*)\S/gi).map(m =>
        input.push(m.replace('@', '').split(/\(|\)|\{|\}|\[|\]|\/|\\|\;|\:|\!|\@|\$|\#|\=|\?|\+|\,|\||\&|\t|\n| /)[0].replace(/(\s*)/g, '')))
    output.map(m => input = input.filter(f => f != m)) // 把input過濾掉output的變數

    if (input.filter(f => f == 'mid').length) { // 判斷是否需要取得 MID
        allreq.mid = await getMID(req)
    }

    try {
        const pool = await readonlyPoolPromise;
        const request = pool.request();
        input.map(i => i != 'mid' ? request.input(i, sql[schema.filter(f => f.attr.toLowerCase() == i.toLowerCase())[0].type], allreq[i.toLowerCase()]) : request.input(i, sql.Int, allreq[i]))
        output.map(o => request.output(o, sql[schema.filter(f => f.attr.toLowerCase() == o)[0].type]))

        const result = await request.query(sqlcode);
        return !result.recordset ? result.output : result.recordset;
    }
    catch (err) {
        console.log(err)
        return { state: 0, message: "API輸入格式錯誤，請詳細檢查相關變數或參數型別。" }
    }
};