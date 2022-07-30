const express = require('express')
const router = express.Router()
const home = require('./modules/home')
const stocks = require('./modules/stocks')
const api = require('./modules/api')

router.use('/stocks', stocks)
router.use('/api', api)
router.use('/', home)

module.exports = router
