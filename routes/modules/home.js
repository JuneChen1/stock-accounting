const express = require('express')
const router = express.Router()
const Stock = require('../../models/stock')
const axios = require('axios').default
const bcrypt = require('bcryptjs')
const User = require('../../models/user')

router.get('/', async (req, res) => {
  const data = await Stock.find().lean().sort({ symbol: 'asc' })
  const stocks = data.filter(stock => stock.shares !== 0)
  const total = {
    marketCap: 0,
    amount: 0
  }
  if (stocks.length === 0) {
    return res.render('index')
  }
  // get market price
  let symbolString = ''
  stocks.forEach(stock => {
    symbolString += `tse_${stock.symbol}.tw|`
  })
  const BASE_URL = 'https://mis.twse.com.tw/stock/api/getStockInfo.jsp?json=1&delay=0&ex_ch='
  await axios.get(BASE_URL + symbolString)
    .then(function (response) {
      const dataArray = response.data.msgArray
      for (let i = 0; i < dataArray.length; i++) {
        let price = dataArray[i].z
        if (price === '-') {
          price = dataArray[i].y
        }
        stocks[i].price = Math.floor(price * 100) / 100
      }
    }).catch(function (error) {
      console.warn(error)
    })
  stocks.forEach(stock => {
    // calculate average cost
    const cost = Math.round((stock.value / stock.shares) * 10) / 10
    stock.cost = cost
    // calculate profit and loss
    const profit = (Math.round((stock.price * stock.shares - stock.value) * 10) / 10).toString()
    stock.profit = profit !== 'NaN' ? profit : ''
    // calculate ROI
    const roi = (Math.round(((stock.price - cost) / cost) * 100)).toString() + '%'
    stock.roi = roi !== 'NaN%' ? roi : ''
    // calculate total marketCap & amount
    if (stock.price.toString() !== 'NaN') {
      total.marketCap += stock.shares * stock.price
      total.amount += stock.value
    }
  })
  total.marketCap = Math.round(total.marketCap)
  total.profit = total.marketCap - total.amount
  total.roi = (Math.round(((total.marketCap - total.amount) / total.amount) * 100)).toString() + '%'
  res.render('index', { stocks, total })
})

router.get('/signup', (req, res) => {
  res.render('signup')
})

router.post('/signup', (req, res) => {
  const { email, name, password, confirmPassword } = req.body
  const errors = []
  if (!email || !name || !password || !confirmPassword) {
    errors.push({ message: '所有欄位都是必填' })
  }
  if (password !== confirmPassword) {
    errors.push({ message: '密碼與確認密碼不相符' })
  }
  if (errors.length) {
    return res.render('signup', {
      errors,
      email,
      name,
      password,
      confirmPassword
    })
  }
  User.findOne({ email })
    .then(user => {
      if(user) {
        req.flash('error_msg', 'Email 已經註冊')
        return res.redirect('/signup')
      }
      return bcrypt.hash(password, 10)
    })
    .then(hash => User.create({
      email,
      name,
      password: hash
    }))
    .then(() => {
      req.flash('success_msg', '註冊成功')
      res.redirect('/login')
    })
    .catch(err => console.warn(err))
})

router.get('/login', (req, res) => {
  res.render('login')
})

module.exports = router
