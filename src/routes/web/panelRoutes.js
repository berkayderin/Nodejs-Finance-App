const express = require('express')
const router = express.Router()
const authMiddleware = require('../../middleware/auth')
const adminAuth = require('../../middleware/adminAuth')

router.use(authMiddleware)

// Her istekte path ve user bilgisini view'a gönder
router.use((req, res, next) => {
	res.locals.path = req.baseUrl + req.path
	res.locals.user = req.user
	next()
})

router.get('/', (req, res) => {
	res.render('panel/index', { layout: 'layouts/panel' })
})

router.get('/categories', (req, res) => {
	res.render('panel/categories', { layout: 'layouts/panel' })
})

router.get('/incomes', (req, res) => {
	res.render('panel/incomes', { layout: 'layouts/panel' })
})

router.get('/expenses', (req, res) => {
	res.render('panel/expenses', { layout: 'layouts/panel' })
})

router.get('/settings', (req, res) => {
	res.render('panel/settings', { layout: 'layouts/panel' })
})

router.get('/users', adminAuth, (req, res) => {
	res.render('panel/users', { layout: 'layouts/panel' })
})

module.exports = router
