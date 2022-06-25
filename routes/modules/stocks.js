const express = require('express')
const router = express.Router()
const Record = require('../../models/record')
const Stock = require('../../models/stock')
const axios = require('axios').default
const moment = require('moment')

// 新增紀錄
router.get('/new', (req, res) => {
  res.render('new', { newSymbol: true })
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

// 搜尋名稱
router.get('/search/:symbol', (req, res) => {
  const symbol = req.params.symbol
  const BASE_URL = 'https://mis.twse.com.tw/stock/api/getStockInfo.jsp?json=1&delay=0&ex_ch='
  axios.get(BASE_URL + `tse_${symbol}.tw|`)
    .then(function (response) {
      const data = response.data.msgArray
      if (data.length === 0) {
        console.log('Cannot find the symbol.')
        return res.render('new', { symbol, newSymbol: true })
      }
      const name = data[0].n
      res.render('new', { symbol, name, newSymbol: true })
    }).catch(function (error) {
      console.log(error)
    })
})

// 查看特定股票紀錄
router.get('/:symbol', (req, res) => {
  const symbol = req.params.symbol
  Record.find({ symbol: req.params.symbol })
    .lean()
    .sort({ date: 'desc' })
    .then(stocks => {
      stocks.forEach(stock => {
        stock.date = moment(stock.date).format('YYYY/MM/DD')
      })
      res.render('detail', { stocks, symbol, name: stocks[0].name })
    })
    .catch(err => console.log(err))
})

// 新增指定股票紀錄
router.get('/new/:symbol', (req, res) => {
  const symbol = req.params.symbol
  Stock.findOne({ symbol })
    .then(stock => res.render('new', { symbol, name: stock.name, theSymbol: true }))
    .catch(err => console.log(err))
})

router.post('/new/:symbol', (req, res) => {
  const symbol = req.params.symbol
  Record.create(req.body)
    .then(() => {
      Stock.findOne({ symbol })
        .then(data => {
          let shares = Number(req.body.shares)
          let value = Number(req.body.value)
          if (req.body.method === '賣出') {
            value = value * -1
            shares = shares * -1
          }
          data.shares += shares
          data.value += value
          data.save()
        })
        .then(() => res.redirect(`/stocks/${symbol}`))
        .catch(err => console.log(err))
    })
    .catch(err => console.log(err))
})

module.exports = router
