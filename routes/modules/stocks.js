const express = require('express')
const router = express.Router()
const Record = require('../../models/record')
const Stock = require('../../models/stock')
const Realized = require('../../models/realized-profit')
const moment = require('moment')
const updateStock = require('../../helpers/update-stock')
const { getOffset, getPagination } = require('../../helpers/pagination-helper')

// add new record
router.get('/new', (req, res) => {
  res.render('new', { newSymbol: true })
})

router.post('/new', async (req, res) => {
  try {
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
    let update = ''
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
      update = await updateStock(req, symbol)
    }
    if (update === 'realized') {
      req.flash('success_msg', '已新增至已實現損益')
      res.redirect('/')
      return
    }
    req.flash('success_msg', '新增成功')
    res.redirect('/')
  } catch (err) {
    console.warn(err)
  }
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
        profit: 0,
        roi: '0%'
      }
      records.forEach(record => {
        total.cost += record.cost
        total.profit += record.profit
        record.date = moment(record.date).format('YYYY/MM/DD')
      })
      if (total.cost !== 0) {
        total.roi = (Math.round((total.profit / total.cost) * 100)).toString() + '%'
      }
      res.locals.realized = true

      const limit = 11
      const page = Number(req.query.page) || 1
      const offset = getOffset(limit, page)
      const currentRecords = records.slice(offset, offset + limit)
      const pagination = getPagination(limit, page, records.length)

      res.render('realizedprofit', { records: currentRecords, total, pagination })
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
  try {
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
    const update = await updateStock(req, symbol)
    if (update === 'realized') {
      req.flash('success_msg', '已新增至已實現損益')
      res.redirect('/')
      return
    }
    req.flash('success_msg', '新增成功')
    res.redirect(`/stocks/${symbol}`)
  } catch (err) {
    console.warn(err)
  }
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
  try {
    const userId = req.user._id
    const { symbol, name, value, shares, date } = req.body
    if (!symbol || !name || !date) {
      req.flash('error_msg', '代號、名稱、時間為必填!')
      return res.redirect('back')
    }
    if (value < 0 || shares < 0) {
      req.flash('error_msg', '配發現金、配發股數不可為負數!')
      return res.redirect('back')
    }
    const method = '股利'
    await Record.create({ symbol, name, method, value, shares, date, userId })
    await updateStock(req, symbol)
    req.flash('success_msg', '新增成功')
    res.redirect(`/stocks/${symbol}`)
  } catch (err) {
    console.warn(err)
  }
})

// delete record
router.delete('/realizedprofit/:id', async (req, res) => {
  try {
    const userId = req.user._id
    const _id = req.params.id
    const record = await Realized.findOne({ _id, userId })
    await record.remove()
  } catch (err) {
    console.warn(err)
  }
  req.flash('success_msg', '刪除成功')
  res.redirect('/stocks/realizedprofit')
})

router.delete('/:symbol/:id', async (req, res) => {
  try {
    const userId = req.user._id
    const _id = req.params.id
    const symbol = req.params.symbol
    const record = await Record.findOne({ _id, userId })
    await record.remove()
    const update = await updateStock(req, symbol)
    if (update === 'realized') {
      req.flash('success_msg', '刪除成功')
      res.redirect('/')
      return
    }
    req.flash('success_msg', '刪除成功')
    res.redirect(`/stocks/${symbol}`)
  } catch (err) {
    console.warn(err)
  }
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

      const limit = 11
      const page = Number(req.query.page) || 1
      const offset = getOffset(limit, page)
      const currentRecords = records.slice(offset, offset + limit)
      const pagination = getPagination(limit, page, records.length)
      res.locals.name = records[0].name
      res.locals.symbol = symbol

      res.render('detail', { records: currentRecords, pagination })
    })
    .catch(err => console.warn(err))
})

module.exports = router
