# UsefulExpressAPI

利用 Express 與 Swagger 結合起來的 API Model，採用 REST API 原則，並可以自動產生出 Swagger 文件與配合 schema 所定義的型別。

## Contents
- [Installation](#installation)
- [Usage](#usage)
  - [DataBase Config](#dbconfig)
  - [Swagger Setting](#Swagger)
  - [執行](#執行)
  - [Add New Controller](#Controller)
  - [Run SQL and Schema](#SQL_and_Schema)
    - [runSQL](#runSQL)
    - [Schema](#Schema)
    - [Use Schema](#UseSchema)
- [Example](#Example)


## Installation
全域安裝套件。
```bash
npm i -g
```
將套件安裝在專案裡。
```bash
npm i
```
## Usage
### dbconfig
資料庫：MSSQL

**設定連線資訊 File：dbconfig.json**
```json
{
    "user": "travel",
    "password": ".travel.",
    "server": "10.21.20.101",
    "database": "TravelTest_6",
    "options": {
        "encrypt": true,
        "enableArithAbort": true
    }
}
```

### Swagger
透過 Swagger 來製作線上版 API 規格文件

**檔案簡單設定：swagger.js**
```js
const doc = {
    info: {
        title: "Travel API Document",
        description: "Description"
    },
    host: "localhost:3000",
    schemes: ['http'],
}
```
詳情可以參考此套件：[swagger-autogen](https://github.com/davibaltar/swagger-autogen)

### 執行
第一次執行請先生成 Swagger 設定檔後再啟動 API Server

#### **生成 Swagger 設定檔執行**
```bash
node .\swagger.js
```

#### **啟動 API SERVER**
```bash
npm run start
```
or
```bash
node .\index.js
```
or use nodemon (修改文件不用重新啟動)
```bash
nodemon .\index.js
```

### Controller
新增 Controller

在 ./src/controllers 資料夾中建立新的 js

**Exameple：create new file travel.js in './src/controllers'**
```js
var express = require('express');
var router = express.Router();

router.get('/travel/example', async (req, res, next) => {  // method GET
    // #swagger.tags = ['travel']
    res.send('這是 Travel 測試 API！')
});

module.exports = router;
```

Add router for Travel.js

**File：./src/controllers/index.js**
```js
var Travel = require('./Travel');  // 引入 Travel.js
app.use('/api', Travel)                        // 新增 router 路徑
```
重新生成 Swagger UI 後打開連結文件測試API

[localhost:3000/api-doc](http://localhost:3000/api-doc)

或者直接貼上網址

[localhost:3000/api/travel/example](http://localhost:3000/api/travel/example)

![image](https://user-images.githubusercontent.com/49122960/109974869-f826dd00-7d34-11eb-8292-8213d10eff9c.png)

### SQL_and_Schema

#### runSQL
如果想要執行 SQL 語法

引入 Lib 中的 runSQL.js：
```js
const runSQL = require('../lib/runSQL')
```
參數：
```js
runSQL(sqlcode, req, schema)  // SQL語法, 所有request, SQL參數型別定義
```
第一個範例先暫時不用到SQL參數，只先傳一個SQL語法到runSQL之中

**File: travel.js**
```js
var express = require('express');
var router = express.Router();
var runSQL = require('../lib/runSQL')

router.get('/travel/getcity', async (req, res, next) => {  // method GET
    // #swagger.tags = ['travel']
    let sqlcode = "select CID, CName, NamePath from Class where nLevel = 3" // 要執行的 SQL 語法
    let response = await runSQL(sqlcode)
    res.json(response)
});

module.exports = router;
```
![image](https://user-images.githubusercontent.com/49122960/109981207-a9307600-7d3b-11eb-92f4-d450a5f609a0.png)

#### Schema
定義在 SQL 中變數的型別

在 './src/schema' 當中新增檔案 travel.json

**Example File: travel.json**
```json
[
    { "attr": "cid", "type": "Int" },
    { "attr": "oid", "type": "Int" }
]
```
| attr | type |
|-----|-----|
| 變數名稱 | SQL型別 |

在 **Swagger UI** 中，如果 tags 與 schema 名子一致則會自動帶入 schema 的型別

在 **runSQL** 中傳入 schema 則會比對 sqlcode 中的 input 與 schema 中的 attr，並帶入 SQL 型別

#### UseSchema
有傳入變數的版本

在 js 中引入 schema
```js
const schema = require('../schema/travel.json')  // travel.js 用到的 sql 變數都會在這個 travel.json 當中定義
```

## Example
**getCCData GET**
```js
const schema = require('../schema/travel.json')  // 作為 runSQL 中第三個參數

router.get('/travel/getCCData', async (req, res, next) => {  // method GET
    // #swagger.tags = ['travel']
    let { cid } = req.query  // 為 swagger ui 宣告有一個 query 叫 cid
    let sqlcode = "select PCID 'pcid', P.CName 'cname', CCID 'ccid', C.CName 'pname', P.NamePath 'namepath' from Class P, Inheritance I, Class C where P.CID = I.PCID and I.CCID = C.CID and P.CID = @cid" // 要執行的 SQL 語法
    let response = await runSQL(sqlcode, req, schema)
    res.json(response)
});
```
![image](https://user-images.githubusercontent.com/49122960/109989492-82763d80-7d43-11eb-84ad-6b7ec3ace3ff.png)

**getCOData POST**
```js
router.post('/travel/getCOData', async (req, res, next) => {  // method POST
    // #swagger.tags = ['travel']
    let { cid } = req.body  // 為 swagger ui 宣告有一個 body 叫 cid
    let sqlcode = "select C.NamePath 'namepath', O.OID 'oid', O.Title 'title', O.Class 'district' from Class C, CO, Object O where C.CID = CO.CID and CO.OID = O.OID and C.CID = @cid" // 要執行的 SQL 語法
    let response = await runSQL(sqlcode, req, schema)
    res.json(response)
});
```
![image](https://user-images.githubusercontent.com/49122960/109995249-172f6a00-7d49-11eb-8a25-11a1fbb365a9.png)

![image](https://user-images.githubusercontent.com/49122960/109995433-3e863700-7d49-11eb-800a-b2632a46b6da.png)