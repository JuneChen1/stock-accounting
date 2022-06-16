const express = require('express')
const router = express.Router()
const Stock = require('../../models/stock')
const axios = require('axios').default

router.get('/', (req, res) => {
  let stocks = []
  Stock.find()
    .lean()
    .sort({ symbol: 'asc' })
    .then(data => {
      stocks = data.filter(stock => stock.shares !== 0)
      if (stocks.length === 0) {
        return res.render('index')
      }
      // API 所需字串
      let symbolString = ''
      stocks.forEach(stock => {
        symbolString += `tse_${stock.symbol}.tw|`
      })
      // 取得市價
      const renderStoks = new Promise((resolve, reject) => {
        const BASE_URL = 'https://mis.twse.com.tw/stock/api/getStockInfo.jsp?json=1&delay=0&ex_ch='
        axios.get(BASE_URL + symbolString)
          .then(function (response) {
            const dataArray = response.data.msgArray
            for (let i = 0; i < dataArray.length; i++) {
              stocks[i].price = Math.floor(dataArray[i].z * 100) / 100
            }
            resolve('success')
            reject(Error)
          }).catch(function (error) {
            console.log(error)
          })
      })
      renderStoks.then(() => {
        stocks.forEach(stock => {
          // 平均成本
          const cost = Math.round((stock.value / stock.shares) * 10) / 10
          stock.cost = cost
          // 損益
          const profit = Math.round(((stock.price - cost) / cost) * 100) + '%'
          stock.profit = profit
        })
        res.render('index', { stocks })
      })
    })
})

module.exports = router
