const express = require('express')
const swaggerUi = require('swagger-ui-express')
const swaggerSpecs = require('./config/swagger')
const authRoutes = require('./routes/auth')

const app = express()

app.use(express.json())

// Swagger UI
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpecs))

app.use('/api/auth', authRoutes)

const PORT = process.env.PORT || 3000
app.listen(PORT, () => {
	console.log(`Server ${PORT} portunda çalışıyor`)
})
