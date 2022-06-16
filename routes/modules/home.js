const express= require('express')
const router = express.Router()
const Stock = require('../../models/stock')

router.get('/', (req, res) => {
  let stocks = []
  Stock.find()
    .lean()
    .sort({ symbol: 'asc' })
    .then(data => {
      stocks = data.filter(stock => stock.shares !== 0)
      if (stocks.length === 0) return
      stocks.forEach(stock => {
        const cost = Math.round((stock.value / stock.shares) * 10) / 10
        stock.cost = cost
      })
    })
    .then(() => res.render('index', { stocks }))
})

module.exports = router
