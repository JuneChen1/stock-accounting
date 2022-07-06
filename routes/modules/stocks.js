const express = require('express')
const router = express.Router()
const Record = require('../../models/record')
const Stock = require('../../models/stock')
const axios = require('axios').default
const moment = require('moment')

// add new record
router.get('/new', (req, res) => {
  res.render('new', { newSymbol: true })
})

router.post('/new', async (req, res) => {
  let { symbol, name, method, value, shares, date } = req.body
  await Record.create({ symbol, name, method, value, shares, date })
  shares = Number(shares)
  value = Number(value)
  if (method === '賣出') {
    value = value * -1
    shares = shares * -1
  }
  const currentStock = await Stock.findOne({ symbol })
  // no current stock => add stock
  if (!currentStock) {
    await Stock.create([{
      symbol,
      name,
      shares,
      value
    }])
  } else {
    // already have stock => add shares and value
    currentStock.shares += shares
    currentStock.value += value
    await currentStock.save()
  }
  res.redirect('/')
})

// search name by symbol
router.get('/search/:symbol', (req, res) => {
  const symbol = req.params.symbol
  const BASE_URL = 'https://mis.twse.com.tw/stock/api/getStockInfo.jsp?json=1&delay=0&ex_ch='
  axios.get(BASE_URL + `tse_${symbol}.tw|`)
    .then(function (response) {
      const data = response.data.msgArray
      if (data.length === 0) {
        return res.render('new', { symbol, newSymbol: true, errorSymbol: symbol })
      }
      const name = data[0].n
      res.render('new', { symbol, name, newSymbol: true })
    }).catch(function (error) {
      console.log(error)
    })
})

// records of specific stock
router.get('/:symbol', (req, res) => {
  const symbol = req.params.symbol
  Record.find({ symbol: req.params.symbol })
    .lean()
    .sort({ date: 'desc' })
    .then(stocks => {
      if (stocks.length === 0) {
        return res.redirect('/')
      }
      stocks.forEach(stock => {
        stock.date = moment(stock.date).format('YYYY/MM/DD')
      })
      res.render('detail', { stocks, symbol, name: stocks[0].name })
    })
    .catch(err => console.log(err))
})

// add record of current stock
router.get('/new/:symbol', (req, res) => {
  const symbol = req.params.symbol
  Stock.findOne({ symbol })
    .then(stock => res.render('new', { symbol, name: stock.name, theSymbol: true }))
    .catch(err => console.log(err))
})

router.post('/new/:symbol', async (req, res) => {
  const symbol = req.params.symbol
  let { name, method, value, shares, date } = req.body
  await Record.create({ symbol, name, method, value, shares, date })
  const currentStock = await Stock.findOne({ symbol })
  shares = Number(shares)
  value = Number(value)
  if (method === '賣出') {
    value = value * -1
    shares = shares * -1
  }
  currentStock.shares += shares
  currentStock.value += value
  await currentStock.save()
  res.redirect(`/stocks/${symbol}`)
})

// delete record
router.delete('/:symbol/:id', async (req, res) => {
  const _id = req.params.id
  const symbol = req.params.symbol
  const record = await Record.findOne({ _id })
  let shares = Number(record.shares)
  let value = Number(record.value)
  if (record.method === '買入') {
    value = value * -1
    shares = shares * -1
  }
  const data = await Stock.findOne({ symbol })
  data.shares += shares
  data.value += value
  await data.save()
  await record.remove()
  res.redirect(`/stocks/${symbol}`)
})

module.exports = router
