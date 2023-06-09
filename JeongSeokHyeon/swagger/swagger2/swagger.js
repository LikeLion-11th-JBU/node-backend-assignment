const swaggerUi = require('swagger-ui-express')
const swaggerJsdoc = require('swagger-jsdoc')

const options = {
  swaggerDefinition: {
    info: {
      title: 'Test API',
      version: '1.0.0',
      description: 'Test swagger with express',
    },
    host: 'localhost:3000',
    basePath: '/',
  },
  apis: ['./routes/*.js'],
}

const specs = swaggerJsdoc(options)

module.exports = {
  swaggerUi,
  specs,
}
