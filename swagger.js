// swaggerAutogen
const swaggerAutogen = require('swagger-autogen')()
const fs = require('fs');
var path = require('path');
const { mode } = require('./config');

const routersFolder = './src/controllers';
let alltags = []
fs.readdir(routersFolder, (err, files) => {
    files.forEach(file => {
        alltags.push({ "name": file.split('.')[0] })
    });
});

const doc = {
    info: {
        title: "Express API Document",
        description: "Description"
    },
    host: null,
    schemes: [mode],
    tags: alltags
}

const outputFile = './src/swagger/swagger-output.json'
const endpointsFiles = ['./index.js']

const swaggerschema = require('swagger-schemagen')

const asyncfun = async (outputFile, endpointsFiles, doc, schemaFolder) => {
    await swaggerAutogen(outputFile, endpointsFiles, doc)
    await swaggerschema(outputFile, schemaFolder)
}

const schemaFolder = './src/schema/'
asyncfun(outputFile, endpointsFiles, doc, schemaFolder)