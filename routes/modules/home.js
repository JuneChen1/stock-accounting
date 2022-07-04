const express = require('express')
const router = express.Router()
const Stock = require('../../models/stock')
const axios = require('axios').default

router.get('/', async (req, res) => {
  const data = await Stock.find().lean().sort({ symbol: 'asc' })
  const stocks = data.filter(stock => stock.shares !== 0)
  const total = {
    marketCap: 0,
    amount: 0,
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
        stocks[i].price = Math.floor(dataArray[i].z * 100) / 100
      }
    }).catch(function (error) {
      console.log(error)
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
    // caculate total marketCap & amount
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

module.exports = router
