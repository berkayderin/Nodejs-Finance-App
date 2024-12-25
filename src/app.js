const express = require('express')
const expressLayouts = require('express-ejs-layouts')
const swaggerUi = require('swagger-ui-express')
const swaggerSpecs = require('./config/swagger')
const authRoutes = require('./routes/auth')
const categoryRoutes = require('./routes/categoryRoutes')
const incomeRoutes = require('./routes/incomeRoutes')
const expenseRoutes = require('./routes/expenseRoutes')
const userRoutes = require('./routes/userRoutes')
const cookieParser = require('cookie-parser')
const session = require('express-session')

const app = express()

// View engine ayarları
app.set('view engine', 'ejs')
app.set('views', './src/views')
app.use(expressLayouts)
app.set('layout', './layouts/main')

app.use(express.json())
app.use(express.urlencoded({ extended: true })) // Form verilerini işlemek için
app.use(cookieParser())

// Session ayarları
app.use(
	session({
		secret: process.env.SESSION_SECRET || 'gizli-anahtar',
		resave: false,
		saveUninitialized: false
	})
)

// Swagger UI
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpecs))

app.use('/api/auth', authRoutes)
app.use('/api/categories', categoryRoutes)
app.use('/api/incomes', incomeRoutes)
app.use('/api/expenses', expenseRoutes)
app.use('/api/users', userRoutes)

// Web routes
app.use('/auth', require('./routes/web/authRoutes'))
app.use('/panel', require('./routes/web/panelRoutes'))

const PORT = process.env.PORT || 3000
app.listen(PORT, () => {
	console.log(`Server ${PORT} portunda çalışıyor`)
})
