const express = require('express')
const router = express.Router()

const swaggerJSDoc = require('swagger-jsdoc');

const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Express API Document',
      version: '1.0.0',
    },
  },
  apis: ['./src/routers/*.js'], // files containing annotations as above
};

const swaggerSpec = swaggerJSDoc(options);
const swaggerUi = require('swagger-ui-express');
router.use('/', swaggerUi.serve, swaggerUi.setup(swaggerSpec));

module.exports = router;