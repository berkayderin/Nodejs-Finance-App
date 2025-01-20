const express = require('express')
const router = express.Router()
const spendingGoalController = require('../controllers/spendingGoalController')
const { isAuthenticated } = require('../middleware/auth')

router.post('/create', isAuthenticated, spendingGoalController.createSpendingGoal)

module.exports = router
