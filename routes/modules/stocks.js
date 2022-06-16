const express = require('express')
const { Aggregate } = require('mongoose')
const router = express.Router()
const Record = require('../../models/record')
const Stock = require('../../models/stock')

// 新增紀錄
router.get('/new', (req, res) => {
  res.render('new')
})

router.post('/new', (req, res) => {
  Record.create(req.body)
    .then(() => {
      Stock.findOne({ symbol: req.body.symbol })
        .then(data => {
          let shares = Number(req.body.shares)
          let value = Number(req.body.value)
          if (req.body.method === '賣出') {
            value = value * -1
            shares = shares * -1
          }
          // 沒有紀錄 => 新增
          if (!data) {
            Stock.create([{
            symbol: req.body.symbol,
            name: req.body.name,
            shares,
            value
             }])
          } else {
            // 有紀錄 => 加上 shares value
            data.shares += shares
            data.value += value
            data.save()
          }
          setTimeout(() => res.redirect('/'), 1000)
        })
        .catch(err => console.log(err))
    })
    .catch(err => console.log(err))
})

// 查看特定股票紀錄
router.get('/:symbol', (req, res) => {
  const symbol = req.params.symbol
  Record.find({ symbol: req.params.symbol })
    .lean()
    .sort({ date: 'desc' })
    .then(stocks => {
      stocks.forEach(stock => {
        const month = stock.date.getMonth() + 1
        const detailDate = stock.date.toString().split(' ')
        stock.date = `${detailDate[3]}-${month}-${detailDate[2]} ${detailDate[4]}`
      })
      res.render('detail', { stocks, symbol, name: stocks[0].name })
    })
    .catch(err => console.log(err))
})

module.exports = router
