const express = require('express')
const router = express.Router()
const stocks = require('./modules/stocks')
const api = require('./modules/api')
const users = require('./modules/users')
const { authenticated, apiAuthenticated } = require('../middleware/auth')
const stockController = require('../controllers/stock-controller')

router.use('/users', users)
router.use('/stocks', authenticated, stocks)
router.use('/api', apiAuthenticated, api)
router.use('/', authenticated, stockController.getStocks)

module.exports = router
