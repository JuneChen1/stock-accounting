const express = require('express')
const router = express.Router()
const Record = require('../../models/record')
const Stock = require('../../models/stock')
const Realized = require('../../models/realized-profit')
const moment = require('moment')
const updateStock = require('../../helper/update-stock')

// add new record
router.get('/new', (req, res) => {
  res.render('new', { newSymbol: true })
})

router.post('/new', async (req, res) => {
  const userId = req.user._id
  let { symbol, name, method, value, shares, date } = req.body
  if (!symbol || !name || !method || !value || !shares || !date) {
    req.flash('error_msg', '所有欄位皆為必填')
    return res.redirect('back')
  }
  if (method === '賣出') {
    value = value * -1
    shares = shares * -1
  }
  await Record.create({ symbol, name, method, value, shares, date, userId })
  const currentStock = await Stock.findOne({ symbol, userId })
  // no current stock => add stock
  if (!currentStock) {
    await Stock.create([{
      symbol,
      name,
      shares,
      value,
      userId
    }])
  } else {
    // already have stock => update stock
    await updateStock(req, res, symbol)
  }
  req.flash('success_msg', '新增成功')
  res.redirect('/')
})

// realized profit page
router.get('/realizedprofit', (req, res) => {
  const userId = req.user._id
  Realized.find({ userId })
    .lean()
    .sort({ date: 'desc' })
    .then(records => {
      const total = {
        cost: 0,
        profit: 0
      }
      records.forEach(record => {
        total.cost += record.cost
        total.profit += record.profit
        record.date = moment(record.date).format('YYYY/MM/DD')
      })
      total.roi = (Math.round((total.profit / total.cost) * 100)).toString() + '%'
      res.render('realizedprofit', { records, total, realized: true })
    })
    .catch(err => console.warn(err))
})

// add record of current stock
router.get('/:symbol/new', (req, res) => {
  const userId = req.user._id
  const symbol = req.params.symbol
  Stock.findOne({ symbol, userId })
    .then(stock => res.render('new', { symbol, name: stock.name, theSymbol: true }))
    .catch(err => console.warn(err))
})

router.post('/:symbol/new', async (req, res) => {
  const userId = req.user._id
  const symbol = req.params.symbol
  let { name, method, value, shares, date } = req.body
  if (!symbol || !name || !method || !value || !shares || !date) {
    req.flash('error_msg', '所有欄位皆為必填')
    return res.redirect('back')
  }
  if (method === '賣出') {
    value = value * -1
    shares = shares * -1
  }
  await Record.create({ symbol, name, method, value, shares, date, userId })
  await updateStock(req, res, symbol)
  req.flash('success_msg', '新增成功')
  res.redirect(`/stocks/${symbol}`)
})

// add dividend
router.get('/:symbol/dividend', (req, res) => {
  const userId = req.user._id
  const symbol = req.params.symbol
  Stock.findOne({ symbol, userId })
    .then(stock => res.render('dividend', { symbol, name: stock.name }))
    .catch(err => console.warn(err))
})

router.post('/:symbol/dividend/new', async (req, res) => {
  const userId = req.user._id
  const { symbol, name, value, shares, date } = req.body
  if (!symbol || !name || !date) {
    req.flash('error_msg', '代號、名稱、時間為必填!')
    return res.redirect('back')
  }
  const method = '股利'
  await Record.create({ symbol, name, method, value, shares, date, userId })
  await updateStock(req, res, symbol)
  req.flash('success_msg', '新增成功')
  res.redirect(`/stocks/${symbol}`)
})

// delete record
router.delete('/:symbol/:id', async (req, res) => {
  const userId = req.user._id
  const _id = req.params.id
  const symbol = req.params.symbol
  const record = await Record.findOne({ _id, userId })
  await record.remove()
  await updateStock(req, res, symbol)
  res.redirect(`/stocks/${symbol}`)
})

// records of specific stock
router.get('/:symbol', (req, res) => {
  const userId = req.user._id
  const symbol = req.params.symbol
  Record.find({ symbol, userId })
    .lean()
    .sort({ date: 'desc' })
    .then(records => {
      if (records.length === 0) {
        return res.redirect('/')
      }
      records.forEach(record => {
        record.date = moment(record.date).format('YYYY/MM/DD')
      })
      res.render('detail', { records, symbol, name: records[0].name })
    })
    .catch(err => console.warn(err))
})

module.exports = router
