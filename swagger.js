// swaggerAutogen
const swaggerAutogen = require('./src/lib/swagger-autogen/swagger-autogen')()
const fs = require('fs');
var path = require('path');

const routersFolder = './src/routers';
let alltags = []
fs.readdir(routersFolder, (err, files) => {
    files.forEach(file => {
        // console.log(file);
        alltags.push({ "name": file.split('.')[0] })
    });
});

const doc = {
    info: {
        title: "Express API Document",
        description: "Description"
    },
    host: "localhost:3000",
    schemes: ['http'],
    tags: alltags
}

const outputFile = './src/swagger/swagger-output.json'
const endpointsFiles = ['./index.js']

const swaggerschema = require('./src/lib/swaggerschema')

const asyncfun = async (outputFile, endpointsFiles, doc, schemaFolder) => {
    await swaggerAutogen(outputFile, endpointsFiles, doc)
    await swaggerschema(path.resolve(outputFile), path.resolve(schemaFolder))
}

const schemaFolder = './src/schema/'
asyncfun(outputFile, endpointsFiles, doc, schemaFolder)