# UsefulExpressAPI

利用 Express 與 Swagger 結合起來的 API Model，並可以自動產生出 Swagger 文件與配合 schema 所定義的型別。

## Contents
- [Installation](#installation)
- [Usage](#usage)
  - [DataBase Config](#dbconfig)
  - [Swagger Setting](#Swagger)
  - [Add New Router](#Router)
  - [執行](#執行)

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

**File：dbconfig.json**
```json
{
    "user": "travel",                // MSSQL 帳號
    "password": ".travel.",          // MSSQL 密碼
    "server": "10.21.20.101",        // MSSQL 位置
    "database": "TravelTest_6",      // MSSQL 資料庫名稱
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

### Router
新增 Router

在 ./src/routers 資料夾中建立新的 js

**Exameple：create new file travel.js in './src/routers'**
```js
var express = require('express');
var router = express.Router();

router.get('/travel/example', async (req, res, next) => {  // method GET
    // #swagger.tags = ['travel']
    res.send('這是 Travel 測試 API！')
});

module.exports = router;
```

Add router for travel.js

**File：index.js**
```js
var travelRouter = require('./src/routers/travel');  // 引入 travel.js
app.use('/api', travelRouter)                        // 新增 router 路徑
```
