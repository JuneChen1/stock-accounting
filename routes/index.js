const express = require('express')
const router = express.Router()
const home = require('./modules/home')
const stocks = require('./modules/stocks')
const api = require('./modules/api')
const users = require('./modules/users')
const { authenticated } = require('../middleware/auth')

router.use('/users', users)
router.use('/stocks', authenticated, stocks)
router.use('/api', authenticated, api)
router.use('/', authenticated, home)

module.exports = router
