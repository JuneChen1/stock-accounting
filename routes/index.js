const express = require('express')
const router = express.Router()
const home = require('./modules/home')
const stocks = require('./modules/stocks')

router.use('/', home)
router.use('/stocks', stocks)

module.exports = router
