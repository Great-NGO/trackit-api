const swaggerJsdoc = require("swagger-jsdoc");
const swaggerUi = require("swagger-ui-express");

const swaggerDefinition = {
    info: {
        openapi: '3.0.0',
        title: 'Trackit Backend V1 Swagger Docs',
        version: '1.0.0',
        description: "API Docs for Trackit backend app"
    },
    // basePath: '/api/v1',    
    servers: [
        {
            url: "http://localhost:4000/",
            description: "Local Server"
        },
        {
            url: "<your live url here>",
            description: "Live server"
        }
    ],
};

const swaggerOptions = {
    swaggerDefinition,
    // looks for configuration in specified directories
    apis: ['./src/**/*.js']
}

const swaggerSpec = swaggerJsdoc(swaggerOptions);

const swaggerDocs = (app) => {
    // console.log("HHH")
    // Swagger Page
    app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));
    app.get('/api-docs.json', (req, res) => {
        res.setHeader('Content-Type', 'application/json')
        res.send(swaggerSpec)
    })

}

module.exports = {
    swaggerSpec,
    swaggerDocs 
};