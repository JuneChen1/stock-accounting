const express = require('express')
const router = express.Router()
const apiController = require('../../controllers/api-controller')

// search name with symbol
router.get('/search/:symbol', apiController.searchSymbol)

module.exports = router
