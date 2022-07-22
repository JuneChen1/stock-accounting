const express = require('express')
const router = express.Router()
const home = require('./modules/home')
const stocks = require('./modules/stocks')

router.use('/stocks', stocks)
router.use('/', home)

module.exports = router
