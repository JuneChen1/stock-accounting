const Stock = require('../models/stock')
const Record = require('../models/record')
const Realized = require('../models/realized-profit')

function updateStock (symbol) {
  return Promise.all([
    Stock.findOne({ symbol }),
    Record.find({ symbol })
  ])
    .then(([stock, records]) => {
      if (!stock) return
      let value = 0
      let shares = 0
      records.forEach(record => {
        if (record.method === '現金股利') {
          value -= record.value
          return
        }
        value += record.value
        shares += record.shares
      })
      stock.value = value
      stock.shares = shares
      // realized profit
      if (stock.shares === 0) {
        let cost = 0
        stock.remove()
        records.forEach(record => {
          if (record.value > 0) {
            cost += record.value
          }
          record.remove()
        })
        const profit = value * -1
        const roi = (Math.round((profit / cost) * 100)).toString() + '%'
        return Realized.create({ symbol, name: stock.name, cost, profit, roi })
      }
      stock.save()
    })
    .catch(err => console.warn(err))
}

module.exports = updateStock
