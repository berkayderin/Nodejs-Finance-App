const swaggerJsdoc = require('swagger-jsdoc')

const options = {
	definition: {
		openapi: '3.0.0',
		info: {
			title: 'Gelir Gider Takip API',
			version: '1.0.0',
			description: 'Gelir gider takibi için REST API dokümantasyonu'
		},
		servers: [
			{
				url: 'http://localhost:3000',
				description: 'Geliştirme sunucusu'
			}
		],
		components: {
			securitySchemes: {
				bearerAuth: {
					type: 'http',
					scheme: 'bearer',
					bearerFormat: 'JWT'
				}
			}
		},
		security: [
			{
				bearerAuth: []
			}
		]
	},
	apis: ['./src/routes/*.js'] // Route dosyalarının yolu
}

const specs = swaggerJsdoc(options)

module.exports = specs
