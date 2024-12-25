const express = require('express')
const router = express.Router()
const authMiddleware = require('../../middleware/auth')

router.use(authMiddleware)

// Her istekte path ve user bilgisini view'a gönder
router.use((req, res, next) => {
	res.locals.path = req.path
	res.locals.user = req.user
	next()
})

router.get('/', (req, res) => {
	res.render('panel/index', { layout: 'layouts/panel' })
})

module.exports = router
