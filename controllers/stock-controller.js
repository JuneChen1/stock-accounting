const axios = require('axios').default
const moment = require('moment')
const Stock = require('../models/stock')
const Record = require('../models/record')
const Realized = require('../models/realized-profit')
const updateStock = require('../helpers/update-stock')
const { getOffset, getPagination } = require('../helpers/pagination-helper')
const paginationLimit = require('../config/pagination-limit')

const stockController = {
  getStocks: async (req, res) => {
    try {
      const userId = req.user._id
      const data = await Stock.find({ userId }).lean().sort({ symbol: 'asc' })
      const stocks = data.filter(stock => stock.shares !== 0)
      const total = {
        marketCap: 0,
        amount: 0,
        profit: 0,
        roi: '0%'
      }

      // pagination
      const limit = paginationLimit.homePage
      const page = Number(req.query.page) || 1
      const offset = getOffset(limit, page)
      const currentStocks = stocks.slice(offset, offset + limit)
      const pagination = getPagination(limit, page, stocks.length)

      if (stocks.length === 0) {
        return res.render('index', { total, pagination })
      }

      // get market price
      let symbolString = ''
      stocks.forEach(stock => {
        const list = stock.list ? stock.list : 'tse'
        symbolString += `${list}_${stock.symbol}.tw|`
      })
      const BASE_URL = 'https://mis.twse.com.tw/stock/api/getStockInfo.jsp?json=1&delay=0&ex_ch='
      const response = await axios.get(BASE_URL + symbolString)
      const dataArray = response.data.msgArray
      for (let i = 0; i < dataArray.length; i++) {
        let price = dataArray[i].z
        if (price === '-') {
          price = dataArray[i].y
        }
        stocks[i].price = Math.floor(price * 100) / 100
      }

      stocks.forEach(stock => {
        // calculate average cost
        const cost = Math.round((stock.value / stock.shares) * 10) / 10
        stock.cost = cost
        // calculate profit and loss
        const profit = (Math.round((stock.price * stock.shares - stock.value) * 10) / 10).toString()
        stock.profit = profit !== 'NaN' ? profit : ''
        if (profit > 0 && profit !== 'NaN') {
          stock.win = true
        } else if (profit < 0 && profit !== 'NaN') {
          stock.loss = true
        }
        // calculate ROI
        let roi = '-'
        if (cost > 0 && stock.shares > 0) {
          roi = (Math.round(((stock.price - cost) / cost) * 100)).toString() + '%'
        }
        stock.roi = roi !== 'NaN%' ? roi : ''
        // calculate total marketCap & amount
        if (stock.price && stock.shares > 0) {
          total.marketCap += stock.shares * stock.price
          total.amount += stock.value
        }
      })
      total.marketCap = Math.round(total.marketCap)
      total.profit = total.marketCap - total.amount
      let roi = '-'
      if (total.amount > 0) {
        roi = (Math.round(((total.marketCap - total.amount) / total.amount) * 100)).toString() + '%'
      }
      total.roi = roi
      if (total.profit > 0) {
        total.win = true
      } else if (total.profit < 0) {
        total.loss = true
      }

      res.render('index', { stocks: currentStocks, total, pagination })
    } catch (err) {
      console.warn(err)
    }
  },
  newStockPage: (req, res) => {
    const defaultDate = moment(Date.now()).format('YYYY-MM-DDThh:mm')
    res.render('new', { newSymbol: true, defaultDate })
  },
  postStock: async (req, res) => {
    try {
      const userId = req.user._id
      let { symbol, name, method, price, value, shares, date, list } = req.body
      if (!symbol || !name || !method || !value || !shares || !date) {
        req.flash('error_msg', '所有欄位皆為必填')
        return res.redirect('back')
      }
      value = Number(value)
      shares = Number(shares)
      if (method === '賣出') {
        value = value * -1
        shares = shares * -1
      }
      symbol = symbol.trim()
      await Record.create({ symbol, name, method, price, value, shares, date, userId })
      const stock = await Stock.findOne({ symbol, userId })
      if (!stock) {
        await Stock.create({
          symbol,
          name,
          shares,
          value,
          list,
          userId
        })
        req.flash('success_msg', '新增成功')
        return res.redirect('/')
      }
      stock.value += value
      stock.shares += shares
      if (stock.shares === 0) {
        await updateStock(userId, symbol)
        req.flash('success_msg', '已新增至已實現損益')
        return res.redirect('/')
      }
      await stock.save()
      req.flash('success_msg', '新增成功')
      res.redirect('/')
    } catch (err) {
      console.warn(err)
    }
  },
  getRecords: async (req, res) => {
    try {
      const userId = req.user._id
      const symbol = req.params.symbol
      const records = await Record.find({ symbol, userId }).lean().sort({ date: 'desc' })

      if (records.length === 0) {
        return res.redirect('/')
      }
      records.forEach(record => {
        record.date = moment(record.date).format('YYYY/MM/DD')
      })

      const limit = paginationLimit.detailPage
      const page = Number(req.query.page) || 1
      const offset = getOffset(limit, page)
      const currentRecords = records.slice(offset, offset + limit)
      const pagination = getPagination(limit, page, records.length)
      res.locals.name = records[0].name
      res.locals.symbol = symbol

      res.render('detail', { records: currentRecords, pagination })
    } catch (err) {
      console.warn(err)
    }
  },
  newRecordPage: async (req, res) => {
    try {
      const userId = req.user._id
      const symbol = req.params.symbol
      const stock = await Stock.findOne({ symbol, userId })
      const defaultDate = moment(Date.now()).format('YYYY-MM-DDThh:mm')
      res.render('new', { symbol, name: stock.name, theSymbol: true, defaultDate })
    } catch (err) {
      console.warn(err)
    }
  },
  postRecord: async (req, res) => {
    try {
      const userId = req.user._id
      const symbol = req.params.symbol
      let { name, method, price, value, shares, date } = req.body
      if (!symbol || !name || !method || !value || !shares || !date) {
        req.flash('error_msg', '所有欄位皆為必填')
        return res.redirect('back')
      }
      value = Number(value)
      shares = Number(shares)
      if (method === '賣出') {
        value = value * -1
        shares = shares * -1
      }
      await Record.create({ symbol, name, method, price, value, shares, date, userId })
      const stock = await Stock.findOne({ symbol, userId })
      if (!stock) {
        req.flash('error_msg', '股票不存在')
        return res.redirect('back')
      }
      stock.value += value
      stock.shares += shares
      if (stock.shares === 0) {
        await updateStock(userId, symbol)
        req.flash('success_msg', '已新增至已實現損益')
        return res.redirect('/')
      }
      await stock.save()
      req.flash('success_msg', '新增成功')
      res.redirect(`/stocks/${symbol}`)
    } catch (err) {
      console.warn(err)
    }
  },
  newDividendPage: async (req, res) => {
    try {
      const userId = req.user._id
      const symbol = req.params.symbol
      const stock = await Stock.findOne({ symbol, userId })
      res.render('dividend', { symbol, name: stock.name })
    } catch (err) {
      console.warn(err)
    }
  },
  postDividend: async (req, res) => {
    try {
      const userId = req.user._id
      const { symbol, name, value, shares, date } = req.body
      if (!symbol || !name || !date) {
        req.flash('error_msg', '代號、名稱、時間為必填!')
        return res.redirect('back')
      }
      if (!value && !shares) {
        req.flash('error_msg', '請輸入配發現金或配發股數')
        return res.redirect('back')
      }
      if (Number(value) < 0 || Number(shares) < 0) {
        req.flash('error_msg', '配發現金、配發股數不可為負數!')
        return res.redirect('back')
      }
      const method = '股利'
      await Record.create({ symbol, name, method, value, shares, date, userId })
      const stock = await Stock.findOne({ symbol, userId })
      stock.value -= Number(value)
      stock.shares += Number(shares)
      await stock.save()
      req.flash('success_msg', '新增成功')
      res.redirect(`/stocks/${symbol}`)
    } catch (err) {
      console.warn(err)
    }
  },
  deleteRecord: async (req, res) => {
    try {
      const userId = req.user._id
      const _id = req.params.id
      const symbol = req.params.symbol
      const record = await Record.findOne({ _id, userId })
      await record.remove()
      const update = await updateStock(userId, symbol)
      if (update === 'no record') {
        req.flash('success_msg', '刪除成功')
        return res.redirect('/')
      }
      if (update === 'realized') {
        req.flash('success_msg', '已新增至已實現損益')
        return res.redirect('/')
      }
      req.flash('success_msg', '刪除成功')
      res.redirect(`/stocks/${symbol}`)
    } catch (err) {
      console.warn(err)
    }
  },
  editRecordPage: async (req, res) => {
    try {
      const id = req.params.id
      const record = await Record.findById(id).lean()
      if (!record) {
        req.flash('error_msg', '紀錄不存在')
        return res.redirect('back')
      }
      if (record.method === '賣出') {
        record.value = record.value * -1
        record.shares = record.shares * -1
      }
      record.date = moment(record.date).format('YYYY-MM-DDThh:mm')
      res.render('edit-record', { record })
    } catch (err) {
      console.warn(err)
    }
  },
  editRecord: async (req, res) => {
    try {
      const id = req.params.id
      let { method, price, value, shares, date } = req.body
      const record = await Record.findById(id)
      if (!record) {
        req.flash('error_msg', '紀錄不存在')
        return res.redirect('back')
      }
      if (method === '賣出') {
        value = value * -1
        shares = shares * -1
      }
      record.method = method
      record.price = price
      record.value = value
      record.shares = shares
      record.date = date
      await record.save()

      const update = await updateStock(record.userId, record.symbol)
      if (update === 'realized') {
        req.flash('success_msg', '已新增至已實現損益')
        return res.redirect('/')
      }
      req.flash('success_msg', '編輯成功')
      res.redirect(`/stocks/${record.symbol}`)
    } catch (err) {
      console.warn(err)
    }
  },
  realizedProfitPage: async (req, res) => {
    try {
      const userId = req.user._id
      const records = await Realized.find({ userId }).lean().sort({ date: 'desc' })
      const total = {
        cost: 0,
        profit: 0,
        roi: '0%'
      }
      records.forEach(record => {
        total.cost += record.cost
        total.profit += record.profit
        record.date = moment(record.date).format('YYYY/MM/DD')
        if (record.profit > 0) {
          record.win = true
        } else if (record.profit < 0) {
          record.loss = true
        }
      })
      if (total.cost !== 0) {
        total.roi = (Math.round((total.profit / total.cost) * 100)).toString() + '%'
      }
      if (total.profit > 0) {
        total.win = true
      } else if (total.profit < 0) {
        total.loss = true
      }
      res.locals.realized = true

      const limit = paginationLimit.realizedProfitPage
      const page = Number(req.query.page) || 1
      const offset = getOffset(limit, page)
      const currentRecords = records.slice(offset, offset + limit)
      const pagination = getPagination(limit, page, records.length)

      res.render('realizedprofit', { records: currentRecords, total, pagination })
    } catch (err) {
      console.warn(err)
    }
  },
  deleteRealizedProfit: async (req, res) => {
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
  }
}

module.exports = stockController
