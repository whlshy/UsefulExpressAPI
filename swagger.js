// swaggerAutogen
const swaggerAutogen = require('swagger-autogen')()
const fs = require('fs');
const routersFolder = './src/routers';
let alltags = []
fs.readdir(routersFolder, (err, files) => {
    files.forEach(file => {
        console.log(file);
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

swaggerAutogen(outputFile, endpointsFiles, doc)