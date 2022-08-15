const express = require('express')
const router = express.Router()
const stockController = require('../../controllers/stock-controller')

// add new record
router.get('/new', stockController.newStockPage)
router.post('/new', stockController.postStock)

// realized profit page
router.get('/realizedprofit', stockController.realizedProfitPage)
router.delete('/realizedprofit/:id', stockController.deleteRealizedProfit)

// add record or dividend of current stock
router.get('/:symbol/new', stockController.newRecordPage)
router.post('/:symbol/new', stockController.postRecord)
router.get('/:symbol/dividend', stockController.newDividendPage)
router.post('/:symbol/dividend/new', stockController.postDividend)

// delete record
router.delete('/:symbol/:id', stockController.deleteRecord)

// records of specific stock
router.get('/:symbol', stockController.getRecords)

module.exports = router
