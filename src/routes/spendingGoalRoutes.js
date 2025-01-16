const express = require('express')
const router = express.Router()
const spendingGoalController = require('../controllers/spendingGoalController')
const auth = require('../middleware/auth')

router.post('/create', auth, spendingGoalController.createSpendingGoal)

module.exports = router
