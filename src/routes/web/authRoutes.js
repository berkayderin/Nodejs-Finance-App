const express = require('express')
const router = express.Router()
const { logout, webLogin, webRegister } = require('../../controllers/authController')

router.get('/login', (req, res) => {
	res.render('auth/login', { error: null })
})

router.get('/register', (req, res) => {
	res.render('auth/register', { error: null })
})

router.post('/login', webLogin)
router.post('/register', webRegister)

router.get('/logout', logout)

module.exports = router
