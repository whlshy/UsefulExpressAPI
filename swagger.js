// swaggerAutogen
const swaggerAutogen = require('swagger-autogen')()
const fs = require('fs');
var path = require('path');
const port = require('./config').port

const doc = {
    info: {
        title: "Express API Document",
        description: "Description"
    },
    host: `localhost:${port}`,
    schemes: ['http']
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