const express = require('express')
const router = express.Router()
const { isAuthenticated, isAdmin } = require('../middleware/auth')
const { exportIncomes, exportExpenses, exportCategories, exportUsers } = require('../controllers/exportController')

router.get('/incomes', isAuthenticated, exportIncomes)
router.get('/expenses', isAuthenticated, exportExpenses)
router.get('/categories', isAuthenticated, exportCategories)
router.get('/users', isAuthenticated, isAdmin, exportUsers)

module.exports = router
