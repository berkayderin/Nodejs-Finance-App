const express = require('express')
const router = express.Router()
const { logout } = require('../../controllers/authController')

router.get('/login', (req, res) => {
	res.render('auth/login')
})

router.get('/register', (req, res) => {
	res.render('auth/register')
})

router.get('/logout', logout)

module.exports = router
