const express = require('express')
const { getDashboardStats } = require('../controllers/dashboardController')
const { isAuthenticated } = require('../middleware/auth')

const router = express.Router()

router.get('/stats', isAuthenticated, getDashboardStats)

module.exports = router
